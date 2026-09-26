# Mock test builder admin workflow (ADMIN-00)

How Toronto Academy staff will create, edit, validate and publish a CELPIP
mock test through a browser instead of through a code ticket.

This is a design document. ADMIN-00 implements none of it. No admin route
was added, no table was created, no migration was written, no SQL was run
against hosted Supabase, and no learner route was touched.

Companion documents:

- `docs/admin/mock-test-builder-database-blueprint.md` - the sixteen
  entities this workflow writes to.
- `docs/admin/mock-test-builder-draft-schema.sql` - draft SQL for those
  entities. Draft only, not a migration.
- `docs/admin/mock-test-1-manual-to-admin-map.md` - what the existing
  hardcoded Mock Test 1 becomes in this model.
- `docs/product/admin-workflow-next-steps.md` - the ADMIN-01 MVP.
- `docs/product/admin-mock-test-builder-blueprint.md` - the earlier
  EXAM-15E exploration this document ratifies and extends.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

Wording rules for anything a learner can see: mock test, practice test,
estimated level, practice score, AI-supported feedback, not an official
CELPIP score. Never: official CELPIP score, guaranteed score, official
result, pass guarantee.

---

## 1. Admin dashboard overview

The admin area lives under a single protected segment, proposed as
`/admin`. Nothing under it is reachable without a staff role.

The dashboard is one screen with one job: show every mock test and its
state, and get a staff member into the right one.

```
+------------------------------------------------------------------+
|  Mock test builder                          [ New mock test ]     |
+------------------------------------------------------------------+
|  Title            Status      Sections  Issues   Updated          |
|  ---------------------------------------------------------------  |
|  Mock Test 1      published   L R W S   0        2026-08-30       |
|  Mock Test 2      draft       L         14       2026-09-01       |
|  Mock Test 3      draft       -         1        2026-09-01       |
+------------------------------------------------------------------+
```

Columns and what they are for:

| Column | Source | Why it is on the list |
| --- | --- | --- |
| Title | `mock_tests.title` | Identifies the test. |
| Status | `mock_tests.status` | draft, ready_for_review, published, archived. |
| Sections | `mock_test_sections` | Which of Listening, Reading, Writing, Speaking exist. |
| Issues | `mock_test_validation_issues` | Open blocking errors. Zero is the gate to publishing. |
| Updated | `mock_tests.updated_at` | Which draft somebody is working on now. |

The dashboard is a list, not an editor. Every change happens inside a
test.

### Admin roles

The roles this workflow assumes. None of them exists in code yet. The
only role field in the tree today is `profiles.role`, a plain `text`
column defaulting to `'student'` in
`supabase/migrations/001_academy_foundation.sql`, and nothing reads it.
That column is the natural place to put these values, and ADMIN-01
should constrain it rather than invent a second mechanism.

| Role | Create and edit drafts | Publish and unpublish | Edit scoring rules | Edit AI rubric prompts | Manage media | Preview | See answer keys |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `super_admin` | yes | yes | yes | yes | yes | yes | yes |
| `staff_admin` | yes | no | no | no | yes | yes | yes |
| `student` | no | no | no | no | no | no | never |

`staff_admin` is the everyday authoring role: it can build a whole test
and hand it over, and it cannot change the numbers that decide what a
practice score means or the prompts that decide what AI feedback says.
Those two are `super_admin` only because they affect every test at once,
not just the one being edited.

A student never reaches `/admin` and never receives an answer key or a
rubric prompt in any response, published test or not. See section 15.

---

## 2. Create mock test workflow

Step one of every test. One form, seven fields, one row in `mock_tests`.

| Field | Column | Rules |
| --- | --- | --- |
| Test title | `title` | Required. Learner facing, for example "Mock Test 2". |
| Slug | `slug` | Required, unique, lower case. Used in the learner route. |
| Description | `description` | Optional. Dashboard card copy. |
| Skill sections included | creates `mock_test_sections` rows | Any of Listening, Reading, Writing, Speaking. A test may ship one section. |
| Status | `status` | Always `draft` on create. Not editable on this form. |
| Version | `version` | Defaults to 1. See below. |
| Internal notes | `internal_notes` | Never sent to a learner. Source document, who typed it, what is unfinished. |

Rules that matter:

- A new test is always `draft`. There is no way to create a published
  test in one step, because a test with no sections cannot pass
  validation and publishing must always run validation.
- Selecting the skill sections on the create form is a convenience. It
  writes empty `mock_test_sections` rows so the section builder has
  something to open. Sections can be added or removed later.
- `version` is an integer on the test, not a separate table. Editing a
  published test is not allowed in place: the edit creates a new draft
  row in the same slug family with `version + 1`, so a learner part way
  through an attempt never has content change underneath them. An attempt
  keeps the `mock_test_id` it started against.
- `internal_notes` exists because every current content file carries a
  source header explaining where its text came from. That habit is worth
  keeping when content moves into a database, where a code comment cannot
  follow it.

---

## 3. Section builder workflow

A section is one skill inside one test. Normally four, minimum one.

| Field | Column | Notes |
| --- | --- | --- |
| Skill | `skill` | `listening`, `reading`, `writing`, `speaking`. Unique per test. |
| Title | `title` | For example "Mock Test 2 - Listening Test". |
| Instructions | `instruction_text`, `instruction_lines` | The section instruction screen. |
| Instruction video | `instruction_video_asset_id` | Optional. Points at a shared asset, not a per test upload. |
| Estimated duration | `estimated_duration_seconds` | Display only on the intro card. |
| Section order | `position` | 1 to 4. Listening, Reading, Writing, Speaking is the exam order. |
| Scoring type | `scoring_rule_id` | Which `mock_test_scoring_rules` row applies. |
| Publish status | `status` | `draft` or `ready`. A section can be finished before its test is. |

Two decisions worth stating plainly.

**The instruction video is shared, not per test.** Today
`src/features/exam-engine/instructional-video-assets.ts` holds one asset
per skill and the Listening section reaches for it with
`getInstructionalVideoAsset("listening")`. That is the right shape and
the schema keeps it: `mock_test_media_assets.mock_test_id` is nullable,
and a null means an academy wide asset that any test may point at.

**Estimated duration is display text, not a timer.** The clock a learner
actually runs against comes from `mock_test_timer_rules`. Storing a
duration on the section as well would give two answers to one question.
The value here is what the intro card prints, and validation checks that
it does not contradict the sum of the timer rules underneath it.

---

## 4. Part builder workflow

A part is a numbered part or task inside a section. The admin does not
assemble a part from scratch. The admin picks a part type, and the part
type carries the default screen flow, the default question shape and the
default timers.

Part types, one per shape the four sections use:

| Part type | Section | Mock Test 1 example |
| --- | --- | --- |
| `listening_problem_solving` | Listening | Part 1, 3 clips interleaved with 8 questions |
| `listening_daily_conversation` | Listening | Part 2, 1 clip then 5 questions |
| `listening_information` | Listening | Part 3, 1 clip then 6 questions |
| `listening_news_item` | Listening | Part 4, 1 clip then 5 dropdown items on one screen |
| `listening_discussion` | Listening | Part 5, 1 video then 8 items on one screen |
| `listening_viewpoints` | Listening | Part 6, 1 clip then 6 items on one screen |
| `reading_correspondence` | Reading | Part 1, split screen, 11 items |
| `reading_diagram` | Reading | Part 2, split screen with a diagram image, 8 items |
| `reading_information` | Reading | Part 3, split screen with a shared A to E option set, 9 items |
| `reading_viewpoints` | Reading | Part 4, split screen, 10 items |
| `writing_email` | Writing | Task 1, Writing an Email |
| `writing_survey` | Writing | Task 2, Responding to Survey Questions |
| `speaking_task` | Speaking | Tasks 1, 2, 6, 7 |
| `speaking_image_task` | Speaking | Tasks 3, 4, 8, one scene image |
| `speaking_comparison_task` | Speaking | Task 5, two option cards then one recording |

Per part fields:

| Field | Column | Notes |
| --- | --- | --- |
| Title | `title` | For example "Listening to Viewpoints". |
| Subtitle | `subtitle` | Optional. |
| Instructions | `instruction_lines` | The bullet list on the part intro screen. |
| Scenario text | `scenario_text` | The context screen body. |
| Order | `position` | Contiguous from 1 within the section. |
| Timer type | `mock_test_timer_rules.scope` | Which window this part runs under. |
| Prep time | `prep_timer` rule | Speaking only. |
| Response time | `recording_timer` rule | Speaking only. |
| Media links | `mock_test_media_assets` through screens | See section 5. |
| Question count | derived | Counted off `mock_test_questions`, never typed. |

Question count is deliberately not a stored field. The full Reading
section already works this way: `reading-section.ts` writes no total and
says so, because a count that is typed can go stale against the content
it is supposed to describe. The builder shows a count and computes it.

### Screens

Choosing a part type materialises rows in `mock_test_screens`. The admin
sees them, can reorder them and can edit their text, and in the normal
path never adds one by hand.

The screen types, which are the sixteen already documented in
`docs/product/exam-engine-screen-types.md` plus the transition screen the
section flows use:

| Screen type | Used by |
| --- | --- |
| `instruction_text` | Every section and part intro |
| `instruction_video` | Section intro, where a clip is registered |
| `listening_context` | Listening scenario screen |
| `listening_audio` | A Listening clip |
| `listening_video` | Listening Part 5 |
| `listening_question_radio` | Listening Parts 1 to 3, one question per screen |
| `listening_question_dropdown` | Listening Parts 4 to 6, whole set on one screen |
| `reading_split` | All four Reading parts, passage and questions together |
| `writing_task` | A Writing task editor |
| `speaking_prep` | A Speaking preparation window |
| `speaking_recording` | A Speaking recording window |
| `speaking_option_choice` | Speaking Task 5 |
| `answer_review` | End of a scored section |
| `score_summary` | End of a scored section |
| `section_end` | End of any section |
| `reference_standards` | Performance standards reference |
| `transition` | Between parts |

Why a template and not a screen editor: Listening Part 1 alone
materialises an intro, a scenario, three conversation screens, eight
question screens and the transitions between them. Laying that out by
hand for six parts would make the builder slower than writing the code
it replaces.

---

## 5. Media workflow

Media is referenced, never uploaded. Mock Test 1 holds 46 Cloudinary URLs
and downloads none of them, and this workflow continues that policy.
File upload is explicitly out of scope for ADMIN-00 and ADMIN-01.

The add media form:

| Field | Column | Rules |
| --- | --- | --- |
| Media type | `media_type` | See the table below. |
| URL | `url` | Required. Cloudinary delivery URL. |
| Thumbnail or poster URL | `poster_url` | Video only. |
| Title | `title` | Learner facing where shown. |
| Alt text | `alt_text` | Required for every image type. |
| Transcript | `transcript` | Optional, where one exists. |
| Duration label | `duration_label` | Display only, for example "About 1.5 minutes". |
| Internal notes | `internal_notes` | Never sent to a learner. |

Media types:

| Media type | Format | Where it appears |
| --- | --- | --- |
| `instruction_video` | mp4 | Section instruction screen. Shared, null `mock_test_id`. |
| `audio_passage` | mp3 | The clip a Listening part is built around |
| `audio_question` | mp3 | The spoken question in Listening Parts 1 to 3 |
| `video_passage` | mp4 | Listening Part 5 |
| `image_prompt` | png or jpg | Speaking and Writing prompt images |
| `diagram_image` | png or jpg | Reading Part 2 |
| `scene_image` | png or jpg | Listening Part 1 context, Speaking scenes |
| `reference_image` | png or jpg | Answer and explanation sheets |

Three rules the form enforces on save:

1. The URL must match the Cloudinary delivery shape
   `https://res.cloudinary.com/<cloud_name>/<image|video>/upload/...`.
   Note that Cloudinary serves mp3 under the `video` resource type, so an
   audio asset whose URL contains `/video/upload/` is correct and must
   not be flagged. Every Mock Test 1 mp3 takes that form.
2. A HEAD request runs at save time and sets `is_verified`. This exists
   because Mock Test 1 Part 3 once carried the same clip on two different
   Cloudinary accounts and nobody could say which one was live.
3. An image asset with empty `alt_text` cannot be saved. Mock Test 1's
   images all carry written alt text today and that standard does not
   drop when authoring moves into a form.

A reading passage is not media. Passages are text, held on the screen, so
they stay selectable, scrollable and readable by assistive technology. An
image of a passage would be unusable. This is recorded here rather than
left implicit.

---

## 6. Objective question workflow

Objective means Listening and Reading: a question with options and one
correct answer, marked by the server.

The question form adapts to the question type.

| Question type | Control | Prompt fields | Section |
| --- | --- | --- | --- |
| `single_choice` | radio group | `prompt` | Listening 1 to 3 |
| `dropdown_sentence_completion` | select at the blank | `text_before`, `text_after` | Listening 4, 6 |
| `video_listening_choice` | radio group under a video part | `prompt` | Listening 5 |
| `reading_correspondence_choice` | select inside the passage | `text_before`, `text_after` | Reading 1 |
| `reading_diagram_choice` | select inside the email | `text_before`, `text_after` | Reading 2 |
| `reading_information_choice` | select from a shared option set | `prompt` | Reading 3 |
| `reading_viewpoints_choice` | select inside the comment | `text_before`, `text_after` | Reading 4 |

Fields common to all of them:

| Field | Column |
| --- | --- |
| Position | `position`, contiguous from 1 within the part |
| Question audio | `question_audio_asset_id`, Listening Parts 1 to 3 only |
| Image | `image_asset_id` |
| Explanation | `explanation`, shown on the answer review screen |
| Scored | `is_scored`, default true |

One note carried forward from the EXAM-15E exploration and settled here:
`video_listening_choice` is kept as a distinct type even though its data
is identical to `single_choice`. Whether a question sits under a video is
a property of the part's media, not the question. It stays because it is
what an author picks from a menu when building a discussion part, and
because collapsing it later is a rename, while splitting it later is a
migration.

---

## 7. Writing task workflow

A Writing task has no options in the marking sense and no answer key. It
has a prompt, a word target and a window.

| Field | Column | Mock Test 1 Task 1 |
| --- | --- | --- |
| Task title | `title` | "Writing an Email" |
| Situation instruction | `scenario_instruction` | "Read the following information." |
| Situation text | `scenario_text` | The picnic paragraph |
| Prompt instruction | `prompt` on the question | "Write an email to the community picnic organizer in about 150-200 words..." |
| Requirements | `prompt_requirements` jsonb | The three bullets |
| Word target | `word_min`, `word_max` | 150 and 200 |
| Editor placeholder | `editor_placeholder` | "Type your email here." |
| Options | `mock_test_options` | Task 2 only, Option A and Option B |
| Prompt image | `image_asset_id` | The source PNG, kept for checking |
| Timer | `mock_test_timer_rules`, scope `per_part` | 1620 seconds |
| Rubric | `mock_test_ai_rubrics` through the section's scoring rule | Writing rubric |

Two rules the form enforces:

- **The prompt must exist as text.** An image-only prompt cannot be read
  by assistive technology and cannot be sent to an AI reviewer. Mock Test
  1's Writing prompts arrived as images and EXAM-25 transcribed them for
  exactly this reason. The builder will not accept a Writing task whose
  only prompt is a picture.
- **A survey task needs at least two options.** A `writing_survey` part
  with fewer is a validation error, because the checklist the reviewer
  runs asks whether the response states a clear choice.

---

## 8. Speaking task workflow

A Speaking task has a prompt, an optional set of visuals, and two windows
rather than one.

| Field | Column | Mock Test 1 Task 3 |
| --- | --- | --- |
| Task title | `title` | "Describing a Scene" |
| Prompt instruction | `prompt` on the question | The task sentence |
| Visuals | `image_asset_id`, or option rows for a comparison task | The Al's Cafe scene |
| Visual kind | `visual_kind` | `scene` or `option-cards` |
| Prep time | timer rule, scope `prep_timer` | 30 seconds |
| Response time | timer rule, scope `recording_timer` | 60 seconds |
| Rubric | `mock_test_ai_rubrics` | Speaking rubric |

The comparison task, Mock Test 1 Task 5, is the one that needs option
rows: the learner picks one of two option cards, each with its own image
and text, and then records about the choice. Those cards are
`mock_test_options` rows with an `image_asset_id`, which is why the
options table carries one.

Both timers are required on every Speaking task. A task with a recording
window and no prep window is a validation error, not a default.

---

## 9. Answer key workflow

Answer keys live in their own table, `mock_test_answer_keys`, and never
as an `is_correct` column on an option.

That is the most important structural decision in this blueprint, and the
reason is simple: the options a learner's browser receives can be
selected without the query ever touching the key. The current build
already enforces this in application code with its
`withoutListeningSectionAnswerKeys` and `withoutReadingSectionAnswerKeys`
helpers, which strip keys before content reaches the browser, and it
marks inside server actions where the keys still are. Moving correctness
into a separate table makes the same guarantee structural rather than
remembered.

The answer key form, one row per objective question:

| Field | Column | Notes |
| --- | --- | --- |
| Correct option | `correct_option_id` | Must belong to that question or to its shared option set. |
| Explanation | `explanation` | Optional. Shown on the answer review screen after submission. |
| Score value | `score_value` | Defaults to 1. Present so an unusual item can be weighted. |
| Source | `source` | `document`, `answer-image`, or `staff-entered`. |
| Note | `note` | Why, when the source is not obvious. |

`source` is not decoration. Mock Test 1's Listening keys are recorded
today as read off an answer screenshot rather than from document text,
and the difference matters to whoever checks them next. Every Reading key
in the tree carries `source: "document"` for the same reason.

**Visibility.** Answer keys are `super_admin` and `staff_admin` only. Row
level security denies the table to `authenticated` entirely, so a learner
session cannot read it even through a mistaken query. Marking runs
server-side after submission, using the service role client that already
exists at `src/lib/supabase/admin.ts`, which never reaches the browser.

---

## 10. AI rubric workflow

Rubrics are `super_admin` only, because a rubric change changes what
every AI review says about every learner.

One row per skill in `mock_test_ai_rubrics`.

**Writing rubric.** Criteria: Content/Coherence, Vocabulary, Readability,
Task Fulfillment. Per task type checklists, one for an email and one for
a survey response. A scoring prompt version string. Model settings.

**Speaking rubric.** Criteria: Content/Coherence, Vocabulary,
Listenability, Task Fulfillment. Audio-first notes, because the reviewer
judges a recording and its transcript together and the transcript alone
loses the pauses, fillers and restarts that Listenability is judged on.
Timing checks, because a response far under its window is a Task
Fulfillment observation. A scoring prompt version string. Model settings.

The third criterion is the only difference between the two, Readability
for Writing and Listenability for Speaking, and the builder must make
that hard to get wrong: the criteria list is fixed per skill and is not a
free text field.

| Field | Column | Notes |
| --- | --- | --- |
| Skill | `skill` | `writing` or `speaking`. |
| Criteria | `criteria` jsonb | The four names and what each covers. |
| Task checklists | `task_checklists` jsonb | Keyed by task type. |
| Level descriptors | `level_descriptors` jsonb | Level by level wording. |
| Prompt version | `prompt_version` | For example "writing-v1". Stamped onto every result. |
| Model settings | `model_settings` jsonb | Model name, temperature, max output. |
| Disclaimer | `disclaimer_text` | The estimated-practice wording every result carries. |

Model settings are stored as a rubric field, not hardcoded, but the API
key never is. The key stays in the server environment, exactly as
`OPENAI_API_KEY` does today. A rubric row names a model; it does not
carry a credential.

`prompt_version` is copied onto every stored result rather than joined,
so a review a learner read six months ago can still be traced to the
wording that produced it.

**Visibility.** Rubric prompt text is never sent to a learner. What a
learner receives is the result: estimated levels, evidence and next
steps. The criteria names are safe to show, because CELPIP publishes
them. The checklists and the prompt body are not.

---

## 11. Preview workflow

Preview renders draft content through the real learner screens, with keys
hidden, and writes nothing.

Four scopes:

| Scope | What it opens |
| --- | --- |
| Full mock test | Every section end to end, in exam order. |
| Section | One section from its instruction screen. |
| Part | One part from its intro screen. |
| Screen | A single question or task screen. |

Rules:

- Preview uses the same components a learner uses. A separate preview
  renderer would drift, and the point of previewing is to see what a
  learner sees.
- Preview strips answer keys the same way a learner request does. A staff
  member who wants to see the keys opens the answer key list, not the
  preview.
- Preview may run against a `draft` test. That is its whole purpose.
- Preview writes no attempt row and consumes no learner credit.
- Score and review behaviour is previewable with a staff-entered
  hypothetical raw score, so an author can see what "Level 7 or 8" looks
  like on the score screen without sitting the test.

---

## 12. Publish validation workflow

Validation runs on save as warnings, and on the move to
`ready_for_review` and `published` as blocking errors. Every result is a
row in `mock_test_validation_issues`, so the dashboard can show an issue
count without recomputing, and so an author sees the whole list rather
than one error at a time.

| Field | Column |
| --- | --- |
| Test | `mock_test_id` |
| Entity | `entity_type`, `entity_id` |
| Rule | `rule_code` |
| Severity | `severity`, `error` or `warning` |
| Message | `message` |
| State | `status`, `open` or `resolved` |

The rules, grouped.

**Structure**

1. The test has at least one section.
2. Every section has at least one part.
3. Part positions are contiguous from 1 within a section.
4. Question positions are contiguous from 1 within a part.
5. A section's scored question count matches its scoring rule's
   `total_questions`, where the rule sets one. For Listening and Reading
   that is 38, which catches a missing or duplicated question at once.

**Options**

6. Every objective question has at least two options, and normally four.
   The exception is `reading_information_choice`, which draws five, A to
   E, from a shared option set.
7. No two options on a question have identical text.
8. Every option has non-empty text.

**Answer keys**

9. Every scored objective question has an answer key row with a non-null
   `correct_option_id`. This is the rule that stops a learner reaching a
   score screen that cannot produce a number.
10. Every `correct_option_id` references an option belonging to that
    question or to its shared option set.
11. No answer key exists for a Writing or Speaking question. A rubric
    scored task with a key is a modelling error.

**Prompts**

12. Every Writing task has non-empty prompt text. An image is not a
    prompt.
13. Every Speaking task has non-empty prompt text.
14. A survey style Writing task has at least two options.

**Media**

15. Every media screen references an asset, and that asset has a
    non-empty URL.
16. Cloudinary URLs match the expected delivery shape.
17. Every image asset has non-empty `alt_text`.
18. Unverified assets are a warning, not an error. A transient network
    failure on a HEAD check should not block a publish.

**Timers**

19. Required timers exist. Listening Parts 1 to 3 need a `per_question`
    rule; Listening Parts 4 to 6 need a `per_screen` rule; a Reading part
    needs a `per_part` rule; a Writing task needs a `per_part` rule; a
    Speaking task needs both a `prep_timer` and a `recording_timer`.
20. Every timer rule has an `on_expire` behaviour.
21. A timer whose `source` is `derived` has a non-empty `source_note`, so
    a number nobody can trace cannot reach production.
22. Nested timers are consistent. The sum of a part's inner windows does
    not exceed its part window, and the sum of a section's parts does not
    exceed its section window.

**Scoring and rubrics**

23. Every Listening and Reading section has a scoring rule with a
    non-empty band map.
24. Every Writing and Speaking section has a rubric attached.
25. Every scoring rule and every rubric has non-empty `disclaimer_text`.

**Wording**

26. No learner-facing text claims official CELPIP scoring. A text scan
    rejects "official CELPIP score", "guaranteed score", "official
    result", "pass guarantee", and "your CELPIP level" where not preceded
    by "estimated". It runs over section and part instructions, prompts,
    explanations and disclaimer text.
27. No learner-facing text or asset reproduces official CELPIP branding.
    Checked by a person at `ready_for_review`, not automatically.

### Status flow

```
draft  ->  ready_for_review  ->  published  ->  archived
  ^               |                  |
  +---------------+------------------+
```

| Status | Visible to learners | Who can move it |
| --- | --- | --- |
| `draft` | no | staff_admin, super_admin |
| `ready_for_review` | no | staff_admin, super_admin |
| `published` | yes | super_admin only |
| `archived` | no, but existing attempts still render | super_admin only |

Publishing with any open issue of `error` severity is refused. Archiving
never deletes: an attempt against an archived test keeps rendering its
review and its practice score.

---

## 13. Student attempt save workflow

Not built in ADMIN-00 and not built in ADMIN-01. Documented here so the
authoring schema is designed against it rather than retrofitted to it.

The four tables and what writes them:

| Table | Written when |
| --- | --- |
| `student_mock_test_attempts` | The learner opens a published test. One row per sitting. |
| `student_mock_test_answers` | Each answer, as it is given. One row per question per attempt. |
| `student_mock_test_section_scores` | On section submission, by the server. |
| `student_mock_test_final_scores` | When every section of an attempt is submitted. |

Rules that shape the schema:

- **A blank is stored, not absent.** A null `selected_option_id` on a
  present row means reached and left blank; a missing row means not
  reached. The current engine already draws that distinction and the
  official rule is that a blank earns no point, so both must survive.
- **Marking is server-side only.** The browser sends selections. The
  server reads `mock_test_answer_keys` and produces the score. No answer
  key ever travels to a browser, before or after submission, except
  inside an answer review the server has already marked.
- **Estimated levels are an array.** The band charts overlap: a raw
  Listening score of 35 matches both the level 9 row and the level 10-12
  row, and the honest rendering is "Level 9 or 10-12". Storing a single
  level would throw that away.
- **The disclaimer is copied, not joined.** A result a learner saw a year
  ago renders with the wording it was produced under.
- **There is no overall level.** CELPIP reports a level per component and
  publishes no composite, so inventing one would be a claim no source
  supports.
- **Attempt rows are private.** A learner reads their own rows and nobody
  else's. Staff read them through server-side code, not through a client
  query.

---

## 14. What ADMIN-01 should build first

Summarised here; the full scope with its exclusions is in
`docs/product/admin-workflow-next-steps.md`.

ADMIN-01 builds the smallest builder that can produce real content:

1. Admin route protection.
2. Admin mock test list.
3. Create a mock test draft.
4. Edit its basic details.
5. Create sections.
6. Create parts.
7. Add objective questions.
8. Add answer options.
9. Add an answer key.
10. Preview draft content.

Out of ADMIN-01: drag and drop, analytics, file uploads, complex
permissions, bulk import, the AI rubric editor, student attempt history,
and payments.

---

## 15. Security requirements

| Requirement | How it is met |
| --- | --- |
| Admin routes must be protected | Every route under `/admin` checks the session role server-side before rendering. A client-side check is not a check. |
| Answer keys are admin-only | `mock_test_answer_keys` has no select policy for `authenticated`. Only the service role and staff-scoped server code read it. |
| AI rubric prompts are admin-only | `mock_test_ai_rubrics` prompt bodies and checklists are never included in a learner response. Only the resulting estimate and feedback are. |
| Service role key never reaches the client | `SUPABASE_SERVICE_ROLE_KEY` stays server-side and out of any `NEXT_PUBLIC_` variable, which is the rule `src/lib/supabase/admin.ts` already states and enforces by being server only. |
| Student attempt data is private | Attempt, answer and score rows are readable only by their owner. Staff access goes through server-side code with an explicit role check. |
| Draft tests are hidden from students | Learner facing queries filter on `status = 'published'`, and the RLS policy enforces the same condition, so an unfiltered query returns nothing. |
| Published tests are visible to learners | A published test appears in the learner dashboard, subject to whatever access rule the pricing model applies. |
| Media URLs may be public | Cloudinary delivery URLs are already public links. They are referenced, not proxied, and storing them creates no new exposure. |
| No official branding in production UI | Source screenshots stay in `_reference` and `mock-tests`. Learner screens render transcribed text, not official assets. |

One more, which is a content rule rather than an access rule: every
screen that shows a number must also show that the number is an estimate.
The disclaimer is a column on the scoring rule and on the rubric, and
validation rule 25 makes it impossible to publish without one.
