# ADMIN-02 - Question, options, answer key and media link editor

What shipped, how it is protected, and what it deliberately does not do.

ADMIN-01 built the structure of a practice test: tests, sections, parts,
basic timing values, a structure preview and structure validation. It
stopped before anything that carries a right answer.

ADMIN-02 builds that. A staff member can now open a part, paste the media
links it needs, add objective Listening and Reading questions with their
options, set the correct answer on each, and read the whole part back
with the keys visible on a staff only preview.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

---

## 1. Routes created

All five sit under the ADMIN-01 builder and all five call
`getAdminSession` before they read anything.

| Route | What it does |
| --- | --- |
| `/dashboard/admin/mock-tests/[mockTestId]/sections/[sectionId]/parts/[partId]` | The working screen for one part: its details, its media links, its questions, and the content check. |
| `.../parts/[partId]/media/new` | Add one media link by URL. |
| `.../parts/[partId]/questions/new` | Add one question. Lands on the question screen. |
| `.../parts/[partId]/questions/[questionId]` | Edit one question, its options and its answer key, on one screen. |
| `.../parts/[partId]/preview` | Staff preview of the whole part, keys and explanations shown. |

Every route parameter is checked with `isUuid` before it reaches the
database, so a malformed URL is a 404 rather than a Postgres type error
on screen. Beyond that, `getMockTestPartContext` refuses a part id that
does not sit under the section and test named above it in the URL, and
`getQuestionWithContent` refuses a question id that does not sit under
the part. Three ids in a URL means three chances to open the wrong
content, and none of them is left to the browser.

The way in from ADMIN-01 is the "Open questions and media" link inside
each part on the practice test screen.

---

## 2. Tables created

`supabase/migrations/014_mock_test_question_answer_media_editor.sql`
creates or repairs four tables.

### mock_test_media_assets

One media link on a part. `mock_test_id`, `section_id` and `part_id` are
all carried, so a media read can be scoped to a test without a two level
join. Columns: `media_type`, `url`, `title`, `alt_text`, `transcript`,
`internal_notes`, `display_order`, plus the four audit columns.

`media_type` is one of `audio`, `video`, `image`, `thumbnail`,
`document`, `other`. That list is plainer than the ADMIN-00 draft, which
named a purpose rather than a format: a staff member pasting a link knows
they have an audio file, not that it is an `audio_passage`.

### mock_test_questions

One numbered question inside a part. Columns: `question_type`,
`question_number`, `prompt`, `instruction`, `passage_text`, `stem`,
`helper_text`, `media_asset_id`, `points`, `display_order`,
`is_required`, `status`, plus audit columns.

`question_type` is one of five objective shapes: `single_choice`,
`dropdown_sentence_completion`, `reading_correspondence_choice`,
`reading_information_choice`, `reading_viewpoints_choice`. Writing and
Speaking prompt types are absent on purpose, and the constraint is what
stops one being authored here before ADMIN-03 builds the rubric editor
that owns it.

`passage_text` sits on the question for now. Reading Part 1 repeats the
same passage across eleven questions, which is duplication; the fix is a
shared passage row in a later ticket, and storing it per question first
keeps the editor to one form.

### mock_test_options

One answer option on one question: `option_label`, `option_text`,
`display_order`.

There is no `is_correct` column, on purpose. Correctness lives in
`mock_test_answer_keys` alone, so the rows a future learner route would
select can be read without the query ever being able to reach a key.

### mock_test_answer_keys

Admin only. One row per question: `correct_option_id`, `correct_text`,
`explanation`, `points`.

`points` duplicates `mock_test_questions.points` deliberately. The
question value is the authoring default, the key value is what a marker
uses, so a later scoring ticket can change one without silently changing
the other. When they differ, the content check says so as a warning.

### Two things the migration does not do

**No unique constraint on `(part_id, question_number)`**, and none on
`(question_id, option_label)`. A duplicate is an authoring mistake, but
refusing the write would make renumbering impossible: swapping question 3
and question 4 has to pass through a state where two rows share a number.
Both are reported as validation problems instead, which is the same
choice ADMIN-01 made for section and part order.

**No `on delete restrict` on `correct_option_id`.** It is
`on delete set null`, because a question delete cascades to its options
and to its key at the same time and `restrict` would make the order of
those two cascades matter. Deleting an option that is currently the
correct answer is refused in `deleteMockTestOption` instead, where the
message can say why.

### Create or repair

The file is written the way 013 had to be rewritten. All four names may
already exist in the hosted database, carried over from the earlier
hardcoded Mock Test 1 work and the ADMIN-00 draft schema, with different
column names: `mock_test_part_id` rather than `part_id`, `position`
rather than `display_order`, `text` rather than `option_text`. So:

1. Every `create table if not exists` is followed by an
   `add column if not exists` block covering every ADMIN-02 column.
2. A helper function lifts `NOT NULL` from every legacy required column
   ADMIN-02 does not write and that has no default. Without it, a table
   under the older shape would refuse every insert with a not-null
   violation on a column the forms have no field for. The helper never
   touches a primary key or any column ADMIN-02 owns, and is dropped at
   the end of the file.
3. Every check constraint is added only when no existing row would
   violate it, and every `set not null` only when no existing row is
   null. A legacy row with an unexpected value must not fail the whole
   migration, because that would leave the other three tables unapplied.
   What it does instead is show up as a validation warning in the admin
   preview, which is where an authoring problem belongs.

Nothing is dropped. No column is removed or retyped, no row is deleted,
and the existing Mock Test 1 data is untouched. Lifting a `NOT NULL`
removes a rule, never a value.

---

## 3. Admin access approach

Identical to ADMIN-01, on purpose.

1. `requireAdmin` in `src/lib/admin/require-admin.ts` compares the signed
   in Supabase user against the server only `ADMIN_EMAILS` allow list.
   `getAdminSession` is the page variant, which returns a reason so the
   screen can explain the refusal; `requireAdmin` is the action variant,
   which returns null and says nothing more.
2. Every one of the thirteen ADMIN-02 server actions calls it first. A
   server action is reachable by direct POST, so a check on the page that
   renders the form protects nothing in the action.
3. Only after that does anything reach `getSupabaseAdmin` in
   `src/lib/supabase/admin.ts`, the service role client. That module is
   server only and throws if it is ever called in a browser.
4. Every read in `mock-test-question-queries.ts` and
   `mock-test-media-queries.ts` takes an `AdminSession` argument. There
   is no way to produce one except by passing the allow list check, so
   the authorization step is an argument a future caller cannot drop and
   still compile.

Row level security is enabled on all four new tables and no policy is
created for `anon` or `authenticated`. Postgres denies when no policy
matches, so the absence is the enforcement. There is deliberately no
broad authenticated write policy: admin membership is an environment
variable a Postgres policy cannot read, so the nearest a policy could get
is "any signed in user", and on these four tables that would hand every
student the answer keys.

---

## 4. Media link workflow

1. Open a part, press "Add media link".
2. Choose the media type, paste the URL, set the display order.
3. Optionally add a title, alt text, a transcript and internal notes.
4. Save. The link appears in the media list on the part screen, editable
   in place behind a disclosure.

The URL is checked for shape, not fetched. A HEAD request would say
whether the link resolves right now, but it turns every save into an
outbound request to a third party and fails on a Cloudinary asset that is
still processing. The shape check catches the mistake that actually
happens, which is pasting a Cloudinary console path instead of a delivery
URL. Verifying a link is a later ticket.

There is no file upload anywhere in this ticket. No form has a file
input and no server action accepts a `File`. Media is a link, which is
how all 46 Mock Test 1 assets already work.

`internal_notes` is staff only. It is selected by the media queries,
which are server only and reached only after `requireAdmin`, and it is
rendered on the media edit form and nowhere else.

Removing a media link does not remove the questions attached to it:
`media_asset_id` is `on delete set null`, so a question keeps its wording
and loses the attachment, and the content check reports the gap.

---

## 5. Question workflow

1. Open a part, press "Add question".
2. Choose the question type. The types that fit the section's skill are
   listed first, but all five stay selectable, because a Listening part
   can legitimately carry a sentence completion item. The order is a
   suggestion, which is why there is no server side refusal to match it.
3. Set the question number, display order and points value. All three are
   prefilled from the questions already in the part.
4. Fill in the instruction, passage text, prompt, stem and helper text as
   the type needs them.
5. Optionally attach one of the media links already on this part. The
   select only offers this part's media, and the server action refuses
   an asset from another part even on a direct POST.
6. Set the status: draft or ready.
7. Save. The screen goes straight to the question, where the options and
   the answer key are added.

A question saves with a missing prompt or stem on purpose. Authoring is
not linear, and a staff member entering eleven Reading items puts the
numbers and the passage in first. What is missing is reported by the
content check rather than refused at the form.

`status: ready` describes the authoring state of the question and grants
no learner visibility. No learner route reads this table.

---

## 6. Option workflow

On the question screen:

1. The add form is prefilled with the next free letter, so entering A to
   D is four submits and no typing in the label box.
2. Each saved option is its own small form, editable in place.
3. Each has its own remove control, which asks once before it fires.

Every option is a separate form rather than one form holding all four. A
single form would mean a typo in option D blocks the save of option A,
and it would need array field names the server action has to unpick.

There is no correct answer control among the options. That is the whole
point of the separation: an option row a learner route could one day read
must not be able to carry the answer.

Removing an option that is currently the correct answer is refused, with
a message saying to change the answer key first. The database would allow
it and quietly leave a key pointing at nothing; the staff member deleting
option C is the only one who knows which option should be correct
instead.

---

## 7. Answer key workflow

On the same question screen, in its own panel:

1. Choose the correct option. Only the options on this question are
   offered, and `checkOptionBelongsToQuestion` refuses one from another
   question even on a direct POST. That check is what the whole model
   rests on: a key pointing at another question's option would mark every
   attempt wrong and still look right on screen, because an option id is
   not something a proofread catches.
2. Set the points value. It defaults to the question's own points, so the
   two agree unless somebody changes one deliberately.
3. Optionally record correct text, for an item marked against typed text
   rather than a chosen option.
4. Optionally record an explanation. Staff use it when a student asks why
   an answer is wrong. It is never shown to a student in this ticket.

Two actions back the panel. `setMockTestAnswerKey` creates the key or
replaces it. `updateMockTestAnswerKey` refuses to create one, so a form
that believes it is editing a key whose row was deleted in another tab
hears about it instead of quietly making a new one.

The upsert is written as a read then a write rather than a Postgres
upsert, so the editor behaves the same on a database where the unique
index was skipped, which the migration does when a legacy table already
holds two keys for one question.

---

## 8. Preview behaviour

`.../parts/[partId]/preview` shows, in order:

- the part title, its type, its question count and its total points
- the part instructions
- every media link: type, title, the URL as a link, the alt text, and the
  transcript behind a disclosure
- every question: instruction, passage text, attached media, prompt,
  stem, helper text
- every option, with the correct one marked
- the answer key line and the explanation
- the content check panel

**The correct answer is on screen because this is an admin preview.** It
is a proofreading tool: a staff member who has typed eleven Reading items
needs to read the passage, the questions, the options and the key
together, which is the only way to catch a key that points at the wrong
option.

This is deliberately not the learner preview and not a step towards one:

- No student route reaches it. Every route above it calls
  `getAdminSession` first.
- The dynamic learner runner is a later ticket, and when it is built it
  gets its own read that never fetches an answer key, rather than a flag
  on the admin read. A flag is a thing somebody can pass wrong; a
  separate query is not.
- The learner side still runs the hardcoded Mock Test 1 content files.
  ADMIN-02 changes none of them.

Media is described rather than played. A preview that autoloaded six
Cloudinary clips would be slow and would start downloads a proofreader
did not ask for, so the URL is a link and the transcript is the thing on
screen.

---

## 9. Validation behaviour

The rules live in `src/features/admin/mock-test-content-validation.ts`,
are pure, and touch no database. The part screen and the preview screen
both call them on every render, and the `validatePartContent` action
calls the same function, so a warning on screen and a warning in an
action result can never disagree.

Problems, which mean the part cannot be marked as it stands:

- the part has no questions
- two questions share a number
- a question has neither a prompt nor a stem
- an objective question has fewer than two options
- a question has two options with the same label
- an objective question has no answer key
- an answer key has no correct option selected
- an answer key points at an option that is not on that question
- an answer key is worth fewer than one point
- a media link has no media type
- a media link has no URL

Warnings, which mean the part can be marked but something is missing:

- an image or thumbnail has no alt text
- an audio link has no transcript
- two options share identical wording
- a question is attached to a media link that is not on this part
- the question points and the answer key points disagree
- an answer key has no explanation

`validatePartContent` writes nothing. The cached rows in
`mock_test_validation_issues` belong to the whole test structure check,
and `validateMockTestStructure` rewrites them wholesale for a test, so
part level rows added here would be deleted by the next structure run.
Recomputing one part is cheap and always current.

---

## 10. Security notes

| Requirement | How it holds |
| --- | --- |
| Admin routes protected | All five routes call `getAdminSession` before any read. All thirteen actions call `requireAdmin` first. |
| Answer keys admin only | `mock_test_answer_keys` has no RLS policy for `anon` or `authenticated` at all. Reads go through a server only query module. No learner route reads it. |
| Service role server only | Reached only through `getSupabaseAdmin`, which throws in a browser. Imported only by `"use server"` modules and server components. |
| No service role in a client | The four client components take server actions as props and import no query module. Verified by the build: a service role import in a client component would fail it. |
| No broad authenticated write policy | None created. The reasoning is written into the migration next to the `enable row level security` lines. |
| No learner route replaced | No file under `src/app/dashboard/mock-tests/` was changed. The build output still lists every Mock Test 1 route. |
| Draft tests hidden from students | Nothing authored here is reachable by a student at all. Publishing is still blocked by `PUBLISHABLE_IN_ADMIN_01`. |
| No secrets printed | `logAdminSupabaseError` accepts a slug or an id and nothing else. It never logs the row, the environment, `ADMIN_EMAILS` or the service role key. |
| No `.env.local` committed | Unchanged and still ignored. ADMIN-02 adds no environment variable. |

One detail worth naming. A raw PostgREST error is never rendered in
production, because it can name columns, constraints and sometimes the
failing row. It goes to the server log in full, and the screen gets a
plain sentence, with a short reason appended only in development. That is
the ADMIN-01 `describeWriteError` mechanism, reused unchanged.

---

## 11. What is intentionally not built

- **File upload.** Media is a pasted URL. No form has a file input.
- **URL verification.** No HEAD request, no `is_verified` column.
- **Drag and drop ordering.** Position number fields.
- **A dynamic student test runner.** Nothing authored here renders to a
  student.
- **Student attempt saving.** No attempt table is touched or created.
- **Writing and Speaking prompt editors, and AI rubric settings.** The
  question type constraint refuses those types outright, so one cannot be
  authored here by accident. ADMIN-03.
- **Timer rules and scoring rules.** ADMIN-03 and ADMIN-04.
- **Publishing.** Still blocked.
- **Shared option sets and shared passages.** Reading Part 3 needs the
  first, Reading Part 1 would benefit from the second. Both are
  optimisations of a model that has to work per question first.
- **Analytics, payments, live classes.** Unrelated.
- **Any change to a learner route.** None.

---

## 12. Manual Supabase step

Claude creates the migration. It is not applied.

Run
`supabase/migrations/014_mock_test_question_answer_media_editor.sql`
in the hosted Supabase SQL editor, then run:

```sql
notify pgrst, 'reload schema';
```

Without the reload, the new columns stay invisible to PostgREST and every
write is refused with PGRST204, "Could not find the column in the schema
cache". That is exactly the failure ADMIN-01 hit.

The file is safe to run more than once. Watch the notices: any line
starting `ADMIN-02:` reports a constraint or a `set not null` that was
skipped because existing rows would have violated it. Each of those
becomes a validation warning in the builder rather than a silent gap.

---

## 13. ADMIN-03 continuation

Next ticket, per `docs/product/admin-workflow-next-steps.md` section 8:

- **Writing and Speaking prompt editor.** The same shape as the objective
  editor built here, with the prompt types added to the question type
  constraint.
- **AI rubric settings.** `mock_test_ai_rubrics`, attached per section,
  with the disclaimer text that keeps an estimated level from reading as
  an official CELPIP score.
- **Dynamic learner preview preparation.** The read that a learner route
  will use: scoped to a published test, omitting `internal_notes`, and
  never touching `mock_test_answer_keys`. A separate query, not a flag on
  `getPartContent`.
