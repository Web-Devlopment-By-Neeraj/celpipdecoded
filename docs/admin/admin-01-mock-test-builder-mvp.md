# ADMIN-01 - Mock test builder MVP

Toronto Academy of Education CELPIP Preparation Program.

The first working admin panel. A staff member can create a practice test
draft, add Listening, Reading, Writing and Speaking sections, add parts
inside them with basic timing values, preview the structure and run the
structure checks.

Nothing built here reaches a student. The student dashboard still runs
the existing Mock Test 1 from its content files, and no learner route
changed.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

---

## 1. Routes created

All six sit under the existing `/dashboard` layout, so the session check
in `src/app/dashboard/layout.tsx` applies before the admin check does.

| Route | What it does |
| --- | --- |
| `/dashboard/admin/mock-tests` | List every practice test with its section, part and issue counts. |
| `/dashboard/admin/mock-tests/new` | Create a practice test draft. |
| `/dashboard/admin/mock-tests/[mockTestId]` | Edit basic details, and edit every section and part in place. |
| `/dashboard/admin/mock-tests/[mockTestId]/sections/new` | Add one skill section. |
| `/dashboard/admin/mock-tests/[mockTestId]/sections/[sectionId]/parts/new` | Add one part inside a section. |
| `/dashboard/admin/mock-tests/[mockTestId]/preview` | Read only structure preview with the structure checks. |

There is no navigation link to the builder. The learner navigation is
shared, and a link that only some accounts can follow is worse than a
URL a staff member bookmarks. Adding a conditional link belongs with a
database backed staff role.

Editing a section or a part happens in place on the detail screen behind
a disclosure, not on a route of its own. Adding is a route because an add
form starts empty and deserves a screen. Editing is not, because the
thing being edited is already on screen.

Every route parameter is checked against a uuid shape before it reaches
the database, so a bad URL is a 404 rather than a Postgres type error on
screen.

---

## 2. Tables created

Migration file:

```
supabase/migrations/013_mock_test_builder_admin_foundation.sql
```

**A note on the file number.** The ticket names this file
`011_mock_test_builder_admin_foundation.sql`. Numbers 011 and 012 were
already taken by `011_ai_usage_instrumentation.sql` and
`012_usage_access_limits.sql`, so the file takes the next free number
rather than creating a second 011. Nothing else about the ticket changed.

Four tables:

| Table | Holds |
| --- | --- |
| `mock_tests` | One authored practice test: slug, title, description, status, version, internal notes. |
| `mock_test_sections` | One skill inside a test: skill, title, instructions, order, estimated duration, scoring type, status. |
| `mock_test_parts` | A numbered part or task inside a section: title, part type, instructions, order, timer type, preparation and recording seconds, expected question count, status. |
| `mock_test_validation_issues` | Cached findings from the structure checks. |

`mock_test_media_assets` was listed as optional and is not created. No
code in ADMIN-01 reads or writes a media asset, and a table nothing uses
is a table nobody keeps correct. It arrives with the media link editor in
ADMIN-02.

Everything else from the ADMIN-00 draft schema stays a draft: questions,
options, answer keys, screens, option sets, timer rules, scoring rules,
AI rubrics, and the four student attempt tables.

### Decisions that differ from the ADMIN-00 draft

**`internal_preview` replaces `ready_for_review`.** Same position in the
status flow, clearer wording, and it is the vocabulary the ADMIN-01
ticket uses.

**Section and part order are not unique constraints.** Swapping two
sections means passing through a state where two rows share an order,
and a unique constraint would refuse the first of the two writes.
Duplicate orders are reported by the validator as problems instead, and
non contiguous orders as warnings.

**Parts carry `mock_test_id` as well as `section_id`.** The builder reads
a whole test structure without a join. A composite foreign key on
`(section_id, mock_test_id)` against a unique constraint on
`mock_test_sections (id, mock_test_id)` makes the copy safe: a part
cannot claim one test while its section belongs to another.

### Indexes

- `mock_tests (status)`
- `mock_tests (updated_at desc)`, for the list order
- `mock_test_sections (mock_test_id)` and `(mock_test_id, section_order)`
- `mock_test_parts (section_id)`, `(mock_test_id)` and `(section_id, part_order)`
- `mock_test_validation_issues (mock_test_id, resolved, severity)`

The ticket also asks for an index on `mock_tests (slug)`. The unique
constraint on that column already creates one, so a second index would be
dead weight. Recorded in the migration as a comment rather than added.

### updated_at triggers

The project already has a pattern:
`public.set_updated_at()`, defined in
`supabase/migrations/002_auth_profile_trigger.sql`. The migration
re-declares it with `create or replace`, identically, so it can be pasted
into the SQL editor on its own, then attaches a before update trigger to
all four tables.

---

## 3. RLS approach

Row level security is enabled on all four tables and **no policy is
created for `anon` or `authenticated`**.

Postgres denies when no policy matches, so a learner session querying
these tables directly with the anon key gets zero rows and cannot write.
That covers every ADMIN-01 security requirement in one stroke:

- draft practice tests are hidden from students
- internal notes are unreachable
- there can be no public dynamic mock test route, because there is no
  readable data behind one

The absence of policies is the enforcement, not a `using` clause that has
to be written correctly. This is the same reasoning the ADMIN-00 draft
gives for the answer key table.

The only path to these tables is server side: a server action or page
that has already passed the admin check, then uses the service role
client in `src/lib/supabase/admin.ts`. That client is server only and is
never imported by a client component. The project already uses this shape
for speaking transcription, writing evaluation and usage accounting.

Why not a policy based on a staff role? Because admin membership in
ADMIN-01 is an environment variable, and a Postgres policy cannot read
one. When a database backed staff role lands, the learner read policies
drafted at the foot of
`docs/admin/mock-test-builder-draft-schema.sql` become real statements
and the service role stops being the only route.

---

## 4. Admin access approach

File: `src/lib/admin/require-admin.ts`

`ADMIN_EMAILS` is a comma separated list of staff email addresses, read
on the server and compared against the signed in Supabase user. It has no
`NEXT_PUBLIC_` prefix, so it never reaches a browser bundle.

Two entry points:

- `getAdminSession()` returns a result with a reason code, for pages that
  render an access denied screen.
- `requireAdmin()` returns the session or `null`, for server actions,
  which have no screen to render.

Rules the helper keeps:

- A missing or empty `ADMIN_EMAILS` denies everybody and does not throw.
  The route shows an access denied screen that names the variable, and
  says nothing about who is on the list.
- No real email address is hardcoded anywhere in the repo.
- `getUser()` is used rather than `getSession()`, so the token is
  validated against Supabase rather than trusted from a cookie.
- Every page and every server action calls it. A page level check does
  not protect a server action, because a server action is reachable by
  direct POST.

The access denied screen distinguishes "you are not on the list" from
"no list is configured on this deployment", because the second is a setup
mistake that otherwise looks identical to a refusal, and whoever hits it
is the person who has to fix it.

---

## 5. Server actions

File: `src/app/dashboard/admin/mock-tests/actions.ts`

| Action | Does |
| --- | --- |
| `createMockTest` | Creates a draft. Status is not a field on the create form. Redirects to the new test. |
| `updateMockTest` | Edits title, slug, description, version, status and internal notes. Status changes go through the guard below. |
| `createMockTestSection` | Adds one skill section. Refuses a skill the test already has. |
| `updateMockTestSection` | Edits a section, scoped to the test in the URL. |
| `createMockTestPart` | Adds a part. Refuses a part type that does not belong in the section's skill. |
| `updateMockTestPart` | Edits a part, scoped to its section and test. |
| `validateMockTestStructure` | Runs every structure rule and rewrites the cached issue rows. |

Every action starts with `requireAdmin`. Every input is parsed with zod
before it reaches the database, and a failure comes back as a field map
the form renders next to the input that failed.

Supporting modules:

- `src/features/admin/mock-test-types.ts` - the vocabulary shared by the
  forms and the actions. Every list matches a check constraint in the
  migration.
- `src/features/admin/mock-test-validation.ts` - the structure rules,
  pure functions with no database access.
- `src/features/admin/mock-test-queries.ts` - the server side reads.
  Every function takes an `AdminSession`, which can only be produced by
  passing the allow list check.
- `src/features/admin/admin-action-state.ts` - the result shape. Kept out
  of `actions.ts` because a `"use server"` file may only export async
  functions.

---

## 6. MVP features

**List.** Title, slug, version, status, section count, part count, stored
issue counts, and the updated date.

**Create.** Title, slug, description, version, internal notes. The slug
is suggested from the title until a staff member types their own. Always
created as a draft.

**Edit details.** The same fields plus status.

**Sections.** One per skill. Skill, title, instructions, order, estimated
duration in minutes, scoring type, and a draft or ready status. The skill
suggests the title and the scoring type: Listening and Reading are marked
objectively, Writing and Speaking get an AI review that reports an
estimated level and is not an official CELPIP score.

**Parts.** Title, part type, instructions, order, timer type, expected
question count, and a draft or ready status. The part type list is
filtered to the section's skill, and the server action checks the same
thing, because the select is a convenience and a direct POST does not go
through it. Preparation and recording seconds appear only when the timer
type is a preparation and recording pair, which is the Speaking shape.

**Structure preview.** Every section and part as it stands, with counts
and the structure checks. It is a structure preview, not a student
preview: there are no questions, options, media or timer rules to render
yet, so calling it a student preview would promise something ADMIN-01
does not build.

**Validation.** The rules run on the preview screen without writing
anything, and the button on that screen stores the findings, which is
where the list gets its counts.

Structure rules in this ticket:

| Severity | Rule |
| --- | --- |
| Problem | Test has no title |
| Problem | Test has no slug |
| Problem | Test has no sections |
| Problem | Two sections share an order number |
| Problem | A section has no title |
| Problem | A section has no parts |
| Problem | Two parts in a section share an order number |
| Problem | A part has no title |
| Problem | A part has no part type |
| Problem | A part type does not belong in its section |
| Problem | A preparation and recording part is missing either time |
| Warning | Fewer than four skill sections |
| Warning | Test has no description |
| Warning | Section or part order is not contiguous from 1 |
| Warning | A section has no instructions, scoring type or estimated duration |
| Warning | A part has no instructions or timer type |
| Warning | An objective part has no expected question count |

The rules that are deliberately not checked yet are listed at the foot of
`src/features/admin/mock-test-validation.ts`, one per ticket that builds
the thing it checks.

**Status behaviour.** Allowed statuses are `draft`, `internal_preview`,
`published` and `archived`. A new test is a draft. Moving to
`internal_preview` recomputes the structure checks first and is refused
while any problem is open. `draft` and `archived` are never gated: both
only narrow who can see a test, and refusing to archive an incomplete
test would leave the incomplete ones as the only ones that cannot be put
away. `published` is refused outright in ADMIN-01, with wording that says
why: a published practice test needs questions, answer keys, timers and
scoring rules that no ticket has built, and there is no learner route
that could render one. The flag lives at `PUBLISHABLE_IN_ADMIN_01` in
`mock-test-types.ts`, so the ticket that enables publishing has one place
to change.

---

## 7. What is intentionally not built

| Not built | Why |
| --- | --- |
| Question editor | ADMIN-02. The whole point of the next ticket. |
| Options editor | ADMIN-02. |
| Answer key editor | ADMIN-02. The answer key table is not created here either, so there is nothing to leak. |
| Media upload or media link editor | ADMIN-02. Media stays a pasted URL when it arrives, as all 46 Mock Test 1 assets already are. |
| Drag and drop ordering | A position number field works. |
| Analytics | No attempts are saved, so there is nothing to analyse. |
| Student attempt save | ADMIN-08. Separate from authoring throughout. |
| Dynamic learner mock test runner | Nothing authored here is renderable as a test yet. |
| Replacing the hardcoded Mock Test 1 learner routes | Untouched. Every existing learner route still renders from its content files. |
| Publishing | Blocked, see section 6. |
| Payments, live classes | Unrelated. |
| A navigation link to the builder | See section 1. |

---

## 8. Manual Supabase SQL step

Claude created the migration file only. No SQL has been run against
hosted Supabase.

To apply it:

1. Open `supabase/migrations/013_mock_test_builder_admin_foundation.sql`
   and copy the whole file.
2. Go to Hosted Supabase, then SQL Editor, then New query.
3. Paste and Run.
4. Check the four tables exist under Table Editor, and that each shows
   RLS enabled with no policies.

The file is safe to run more than once. Tables use
`create table if not exists`, constraints are added only when absent, and
triggers are dropped before being created.

---

## 9. Environment variable

Add to `.env.local` for local development:

```
ADMIN_EMAILS=your-admin-email@example.com
```

Several addresses are comma separated:

```
ADMIN_EMAILS=first@example.com,second@example.com
```

Notes:

- Server only. Do not add a `NEXT_PUBLIC_` prefix.
- Restart `npm run dev` after changing it.
- `.env.local` is not committed, and this ticket did not change it.
- The address has to match the email on the signed in Supabase account.
  Matching is case insensitive and ignores surrounding spaces.

For Vercel: Project, then Settings, then Environment Variables. Add
`ADMIN_EMAILS` for the environments that need it and redeploy.

`SUPABASE_SERVICE_ROLE_KEY` is also required, and already is by the
existing speaking, writing and usage features. The builder uses the same
server only client.

---

## 10. ADMIN-02 continuation

The next ticket builds the vertical slice ADMIN-01 stops short of:

- question editor
- options editor
- answer key editor
- media link editor
- first dynamic preview of objective questions

The acceptance test is already in the repo: Mock Test 1 Reading Part 1 is
11 questions with 44 options and 11 keys, every one recorded in a content
file. Re-entering that part through the new forms and comparing it to the
content file is a complete check that needs no new source document.

Two things ADMIN-02 has to keep:

- The answer key table gets no policy for authenticated users at all, the
  same way these four tables get none.
- The preview response contains no answer key. Verified by inspecting the
  payload, not by trusting the code.

See `docs/product/admin-workflow-next-steps.md` section 3 for the ticket
sequence after that.
