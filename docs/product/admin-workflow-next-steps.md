# Admin workflow next steps (ADMIN-00)

What ADMIN-01 should build, what it should not, and how to tell when it
is done.

ADMIN-00 produced four design documents and no code. This document turns
them into the next ticket.

**Status: ADMIN-01 and ADMIN-02 have both shipped.** What each actually
built is recorded in `docs/admin/admin-01-mock-test-builder-mvp.md` and
`docs/admin/admin-02-question-answer-media-editor.md`.

**Admin work is paused for the client demo rebrand (BRAND-01).** ADMIN-03
is not started and should not be started until the demo is done.
BRAND-01 changed admin wording and colour only: the header eyebrow now
reads "CELPIP Decoded admin", metadata titles end in "- CELPIP Decoded",
and the palette moved to the brand tokens. No builder behaviour, query,
validation rule or route changed, so section 8 below is still an
accurate description of what ADMIN-03 has to build. See
`docs/brand/celpip-decoded-rebrand-demo.md`.

The short version. ADMIN-01 built items 1 to 6 and item 10 of the table
in section 1, as a structure builder, and left items 7 to 9 to ADMIN-02.
ADMIN-02 built items 7 to 9 plus the media link editor, and turned item
10 into a staff preview of one part rather than a render through the
learner components. Section 7 below is the ADMIN-02 scope as it was
planned; section 8 is the ADMIN-03 scope, which is next.

Design documents:

- `docs/admin/mock-test-builder-workflow.md`
- `docs/admin/mock-test-builder-database-blueprint.md`
- `docs/admin/mock-test-builder-draft-schema.sql` (draft, not a
  migration, not applied)
- `docs/admin/mock-test-1-manual-to-admin-map.md`

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

---

## 1. The recommended ADMIN-01 MVP

Build the smallest admin panel that can produce real, previewable
objective content and nothing else.

| # | Scope item | What it means concretely |
| --- | --- | --- |
| 1 | Admin route protection | Every route under `/admin` checks the session role server-side. A non-staff session gets a redirect, not a hidden link. |
| 2 | Admin mock test list | One table of tests with title, status, sections and updated date. |
| 3 | Create mock test draft | Title, slug, description, internal notes. Always created as `draft`. |
| 4 | Edit basic details | The same fields, editable. Status stays `draft`. |
| 5 | Create sections | Pick a skill, set a title, set instruction text, set the order. |
| 6 | Create parts | Pick a part type, set a title, instructions and scenario text, set the order. |
| 7 | Add objective questions | Prompt, or the text either side of a blank, per question type. |
| 8 | Add answer options | Text and display order, normally four per question. |
| 9 | Add answer key | Select the correct option, record its source, add an optional explanation. |
| 10 | Preview draft content | Render a part through the real learner screens with keys stripped. |

That is ten items and it is deliberately one vertical slice: an authored
question you can see, answer and preview, with a key that never reaches
the browser.

### Why this is the right cut

**It proves the two hard things and skips the easy ones.** The two things
that could be wrong in the blueprint are the answer key separation and
the part type template. Everything on the list above exercises both.
Media, rubrics, timers and attempts are additive once those two hold.

**It produces something usable, not a demo.** After ADMIN-01 a staff
member can type a Listening or Reading part into a form and look at it.
That is not a whole mock test, but it is the first content in the system
that no developer touched.

**It is testable against known data.** Mock Test 1 Reading Part 1 is 11
questions with 44 options and 11 keys, all recorded and all checkable.
Re-entering one existing part through the new forms and comparing it to
the content file is a complete acceptance test that needs no new source
document.

---

## 2. Explicitly out of scope for ADMIN-01

| Excluded | Why |
| --- | --- |
| Drag and drop ordering | A position number field works. Reordering is a UI nicety with real complexity behind it. |
| Analytics | No attempts are saved, so there is nothing to analyse. |
| File uploads | Media stays a pasted Cloudinary URL, which is how all 46 Mock Test 1 assets already work. |
| Complex permissions | Two staff roles, checked in one place. No per-test grants, no delegation, no audit UI. |
| Bulk import | The highest value and highest risk feature. It belongs after the model is proven, not during. |
| AI rubric editor | Rubric changes affect every learner result. They stay in code until the builder is trusted. |
| Student attempt history | A separate concern from authoring, and the four attempt tables are new construction. |
| Payments | Unrelated. |
| Live classes | Unrelated. |
| Writing and Speaking authoring | Same shape as objective authoring but with rubrics attached. Follows once the objective path works. |
| Versioning a published test | ADMIN-01 never publishes anything, so nothing needs a version yet. |
| Media library browsing | Assets are attached by URL. Search and reuse come with the second test. |

Two of these deserve a sentence each, because they will be argued for.

**Media in ADMIN-01.** The MVP above can author a Reading part end to end
without touching a media asset, because Reading passages are text and
only Part 2 has an image. Listening cannot: every Listening part needs at
least one clip. If ADMIN-01 wants Listening authoring, add the media URL
field, the format check and the HEAD verification to the scope. If it
targets Reading first, media can wait. The recommendation is to target
Reading first for exactly that reason.

**Publishing in ADMIN-01.** Not on the list. Publishing requires the full
validation set, and the full validation set requires timers, scoring
rules and rubrics that ADMIN-01 does not build. A test authored in
ADMIN-01 stays `draft` and is previewed, which is enough to prove the
model.

---

## 3. Suggested ticket sequence after ADMIN-01

Each of these is a ticket sized like ADMIN-01, adding one capability to a
builder that already works.

This table has been renumbered once, in ADMIN-02. The original sequence
put Writing and Speaking authoring near the end, at ADMIN-07. It moves to
ADMIN-03 because the objective editor built in ADMIN-02 is the same shape
that authoring needs, and building the rubric half while that shape is
fresh costs less than returning to it after four unrelated tickets.

| Ticket | Adds | Status |
| --- | --- | --- |
| ADMIN-01 | Practice tests, sections, parts, structure preview, structure validation. | Shipped, see `docs/admin/admin-01-mock-test-builder-mvp.md` |
| ADMIN-02 | Questions, options, answer keys, media links, and a staff preview of an authored part. | Shipped, see `docs/admin/admin-02-question-answer-media-editor.md` |
| ADMIN-03 | Writing and Speaking prompt editor, AI rubric settings, and dynamic learner preview preparation. Scope in section 8. | Next |
| ADMIN-04 | Timer rules with `source`, `source_note` and `on_expire`. Unblocks a part that runs at exam pace. | Not started |
| ADMIN-05 | Scoring rules and band maps, including the overlapping rows. Unblocks a preview that shows an estimated level. | Not started |
| ADMIN-06 | Whole test validation engine and the issues list. Unblocks `internal_preview` for a complete test. | Not started |
| ADMIN-07 | Publishing, unpublishing and archiving, gated on validation. First learner-visible authored test. | Not started |
| ADMIN-08 | The dynamic learner runner, reading published content instead of the Mock Test 1 content files. | Not started |
| ADMIN-09 | Student attempt persistence, the four attempt tables. Separate from authoring throughout. | Not started |

The order is not arbitrary. Each ticket removes one reason a test cannot
be published, and ADMIN-07 is the first one where a learner could see
something a developer did not write. ADMIN-08 is what actually shows it
to them, and it is the first ticket that touches a learner route at all.

---

## 4. What ADMIN-01 must decide before it starts

Three questions that ADMIN-00 deliberately left open, because they need
an implementation in front of them.

**How is a staff role asserted?** `profiles.role` exists as a plain
`text` column defaulting to `'student'`, and nothing reads it today. The
recommendation is to keep that column, add a check constraint for
`student`, `staff_admin` and `super_admin`, and read it through one
server-side helper. Every RLS policy in the draft schema assumes such a
helper exists, and none of them can be written until it does.

**Does ADMIN-01 create real tables?** It has to create some. The
recommendation is a real migration for the seven tables the MVP touches
(`mock_tests`, `mock_test_sections`, `mock_test_parts`,
`mock_test_screens`, `mock_test_questions`, `mock_test_options`,
`mock_test_answer_keys`, plus `mock_test_option_sets`), taken from the
draft schema, reviewed as a migration in its own right, and applied with
explicit approval. The remaining tables wait for the tickets that use
them. Creating all sixteen up front would mean shipping nine tables that
nothing reads.

**Reading first or Listening first?** Reading, for the media reason in
section 2. Reading Part 1 is the single best acceptance test in the repo:
11 questions, 44 options, 11 keys, every one recorded in a content file
that can be compared against.

---

## 5. Done criteria for ADMIN-01

Concrete enough to check.

- A non-staff session that visits any `/admin` route is redirected, and
  the check is server-side.
- A staff session sees a list of mock tests.
- A staff member can create a draft, add a Reading section, add a
  correspondence part, add eleven questions with four options each, and
  set a key on every one.
- The preview renders that part through the same components a learner
  uses.
- The preview response contains no answer key. Verified by inspecting the
  payload, not by trusting the code.
- A learner session querying the new tables directly sees nothing for a
  draft test, and nothing at all from `mock_test_answer_keys`.
- `npm run lint` and `npm run build` pass.
- Every existing learner route still builds and still renders from its
  content files. ADMIN-01 changes no learner route.

---

## 6. Status after ADMIN-00

| Item | Status |
| --- | --- |
| Admin workflow document | Written |
| Database blueprint, sixteen entities | Written |
| Draft SQL | Written, marked DRAFT, outside `supabase/migrations/` |
| Mock Test 1 to admin model map | Written |
| ADMIN-01 MVP scope | Defined above |
| Production migration created | Yes, in ADMIN-01: `supabase/migrations/013_mock_test_builder_admin_foundation.sql` |
| SQL applied to hosted Supabase | No, run manually by the user |
| Learner routes changed | No, and still no after ADMIN-02 |
| Listening, Reading, Writing, Speaking flows changed | No |
| Admin UI built | Yes: ADMIN-01 structure builder, ADMIN-02 content editor |
| Question, option and answer key editors built | Yes, in ADMIN-02 |
| Media link editor built | Yes, in ADMIN-02, URL only and no upload |
| Second production migration created | Yes, in ADMIN-02: `supabase/migrations/014_mock_test_question_answer_media_editor.sql` |
| ADMIN-02 SQL applied to hosted Supabase | No, run manually by the user |
| Student attempts saved | No |

---

## 7. ADMIN-02 scope

ADMIN-01 built the structure: practice tests, sections, parts, basic
timing values, a structure preview and structure validation. It
deliberately stopped before anything that carries a right answer.

ADMIN-02 builds that, and it is one vertical slice again.

| # | Scope item | What it means concretely |
| --- | --- | --- |
| 1 | Question editor | Create `mock_test_questions` under a part. Prompt for a whole question, or the text either side of a blank for a completion item. Position contiguous from 1. |
| 2 | Options editor | Create `mock_test_options` under a question, normally four, with text and display order. Plus the shared A to E option set Reading Part 3 needs. |
| 3 | Answer key editor | Create `mock_test_answer_keys`, selecting the correct option, recording its source, and taking an optional explanation. |
| 4 | Media link editor | Paste a Cloudinary URL onto a screen or a question, validate its shape, record alt text, and verify it resolves with a HEAD request. Unblocks Listening authoring. |
| 5 | First dynamic preview of objective questions | Render an authored part through the real learner question components, with the keys stripped before the content leaves the server. |

Tables ADMIN-02 has to create, taken from the ADMIN-00 draft schema:
`mock_test_questions`, `mock_test_options`, `mock_test_option_sets`,
`mock_test_answer_keys`, `mock_test_media_assets`, and
`mock_test_screens` if the dynamic preview needs a materialised screen
run rather than a part level render.

Two rules ADMIN-01 set that ADMIN-02 has to keep:

**The answer key table gets no policy for authenticated users at all.**
Not a filtered policy: none. Row level security denies by default when no
policy matches, so the absence is the enforcement. That is how the four
ADMIN-01 tables are protected, and the answer key table is the one where
a mistake hands a learner the answers.

**The preview response contains no answer key.** Verified by inspecting
the payload, not by trusting the code. The existing Listening section
already works this way: `withoutListeningSectionAnswerKeys` strips the
keys before the content reaches the browser, because a client component
receives its props as serialized data and a key sent that way is readable
in the page payload before a learner has answered anything.

Validation rules ADMIN-02 turns on, listed at the foot of
`src/features/admin/mock-test-validation.ts`:

- every objective question has at least two options, normally four
- no two options on a question share identical text
- every option has non-empty text
- every scored objective question has an answer key row
- every correct option belongs to that question or its shared option set
- no answer key exists for a Writing or Speaking question
- every media screen references an asset with a real URL
- every image asset has non-empty alt text

Still out of scope in ADMIN-02: timer rules, scoring rules and band maps,
publishing, Writing and Speaking rubric authoring, and student attempt
persistence. See the renumbered sequence in section 3.

### What ADMIN-02 actually shipped, against the five items above

Items 1, 3 and 4 shipped as written. Three things came out differently,
and each is a decision rather than a shortfall.

**Item 2, the shared A to E option set, did not ship.** Reading Part 3
needs one, and `mock_test_option_sets` is still uncreated. The reason is
that a shared option set is an optimisation of a model that has to work
per question first, and building both at once would have meant an option
row with two possible parents before a single question had been authored
through the UI. It moves to the ticket that authors Reading Part 3.

**Item 4 shipped without the HEAD verification.** The URL shape is
checked; the URL is not fetched. A HEAD request turns every save into an
outbound request to a third party and fails on a Cloudinary asset that is
still processing, and the shape check catches the mistake that actually
happens, which is pasting a console path instead of a delivery URL.
Verifying a link, with `is_verified` and `verified_at`, is still worth
doing and is still unbuilt.

**Item 5 shipped as a staff preview, not a render through the learner
components.** The two rules above are why. Rendering an authored part
through the real learner components means building the read that strips
the keys, and that read is the front half of the dynamic learner runner,
which is a ticket of its own. Shipping a half version of it as a preview
would have put an untested key-stripping path in the codebase months
before anything called it. So ADMIN-02 previews the part on an admin
screen, with the keys deliberately shown, and the key-free read is
prepared in ADMIN-03 as its own piece of work.

The second ADMIN-01 rule above still holds, and holds more strongly than
planned: the ADMIN-02 preview response contains an answer key, and that
is safe because the response never leaves an admin route. There is no
learner-facing read of the new tables to inspect, because there is no
learner-facing read at all.

The validation rules listed above all shipped, in
`src/features/admin/mock-test-content-validation.ts` rather than in
`mock-test-validation.ts`. Structure rules and content rules answer
different questions and run at different scopes, so they are separate
modules. Two of the listed rules were not built: the shared option set
half of "every correct option belongs to that question or its shared
option set", which has no option sets to check, and "no answer key exists
for a Writing or Speaking question", which cannot be violated while the
question type constraint refuses those types outright.

---

## 8. ADMIN-03 scope

ADMIN-02 built the objective half of authoring: questions, options,
answer keys and media, for Listening and Reading. ADMIN-03 is the other
half, plus the read that a learner route will eventually need.

| # | Scope item | What it means concretely |
| --- | --- | --- |
| 1 | Writing and Speaking prompt editor | Add the Writing and Speaking prompt types to the question type constraint, and give them a form: task instruction, scenario text, word count or recording expectations, and the prep and recording windows the part already carries. |
| 2 | AI rubric settings | Create `mock_test_ai_rubrics` and attach one per section or per part. Criteria, weightings, the model instruction, and the disclaimer text that keeps an estimated level from reading as an official CELPIP score. |
| 3 | Dynamic learner preview preparation | The read a learner route will use: scoped to a published test, omitting `internal_notes`, and never touching `mock_test_answer_keys`. A separate query, not a flag on `getPartContent`. |

**Why these three together.** They are the three things standing between
the builder and a test a learner could sit. One and two finish authoring:
after them, all four skills can be entered through a form. Three is the
piece that has to exist before any learner route can read authored
content at all, and it is deliberately built and reviewed on its own,
with nothing calling it, rather than arriving inside the ticket that also
builds the runner.

**Item 3 is the one to be careful with.** It is the read whose failure
mode is handing a student the answers. Three rules for it:

- It is a new function in a new module, not an argument on
  `getPartContent`. A flag is a thing a caller can pass wrong; a query
  that cannot select the key column is not.
- It selects columns by name and never `*`, so a column added later
  cannot join a learner payload by default.
- Its test is an inspection of the serialized payload, not a reading of
  the code. The existing Listening section already works this way, with
  `withoutListeningSectionAnswerKeys`, because a client component
  receives its props as serialized data and a key sent that way is
  readable in the page payload before a learner has answered anything.

**Still out of scope in ADMIN-03:** timer rules, scoring rules and band
maps, publishing, the dynamic learner runner itself, student attempt
persistence, file upload, drag and drop ordering, analytics, payments and
live classes. No learner route changes in ADMIN-03 either. The last
learner-route-free ticket is ADMIN-07; ADMIN-08 is the first one that
touches one.
