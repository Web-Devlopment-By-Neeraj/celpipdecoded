# Admin mock test builder blueprint (EXAM-15E)

The data model and admin panel design that lets Toronto Academy staff create a
mock test through a UI instead of through a code ticket.

This is a design document. EXAM-15E implements none of it. No migration was
created, no table exists, no admin route was added, and no content was moved
out of TypeScript.

Written 2026-08-28, against the tree at commit `a208d75`.

Companion documents:

- `docs/product/celpip-exam-rules-research.md` - the rules this model has to
  be able to express.
- `docs/product/listening-format-audit-and-correction-plan.md` - what the
  current build does, and what it gets wrong.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

---

## 1. Why this exists

Mock Test 1 Listening took eleven code tickets, EXAM-03 through EXAM-15D. Each
one added a route, a content file, a flow, a screen family and a document.
That was the right way to build an engine, because every ticket discovered
something about the format that the previous one did not know.

The engine now exists. Mock Test 2 should not cost eleven tickets, and it
should not require a developer at all. It should be typed into a form.

The test of this blueprint is a single question:

> Can a staff member with no access to the repository produce a complete,
> correct, publishable Mock Test 2 through a browser?

Everything below is in service of answering yes.

---

## 2. What the admin must be able to do

The capability list from the ticket, grouped by where it lands in the model.

**Test level.** Create a mock test. Name it. Publish or unpublish it. Preview
it before publishing.

**Structure.** Add Listening, Reading, Writing and Speaking sections. Add
parts under each section. Choose a part type. Choose a screen flow template.

**Content.** Add instruction text. Use shared instruction videos. Add media
links from Cloudinary. Add images. Add questions. Add answer options. Select
correct answers. Add answer explanations where needed.

**Rules.** Set timer rules. Set scoring maps.

Two of these deserve early comment, because they shape the schema more than
the rest.

**Screen flow template** is the important one. A part is not a flat list of
questions. It is an ordered run of screens: a part intro, a scenario, a media
screen, a question screen, and so on. Parts 1 to 3 of Listening interleave
three media screens with eight question screens. Part 4 has one media screen
and one question screen. Reading has a single split screen holding a passage
and every question at once. If the admin had to lay out screens by hand for
every part, the builder would be as slow as writing the code.

So a part type carries a default screen flow, and the admin picks the type
rather than assembling screens. `mock_test_screens` still exists as a table,
because a template has to materialise into rows that can be reordered or
adjusted, but the admin's normal path never touches it directly.

**Shared instruction videos** are already modelled correctly in the current
code. `src/features/exam-engine/instructional-video-assets.ts` holds one
asset per section keyed by section, and `full-listening-section.ts` reaches
for it with `getInstructionalVideoAsset("listening")`. That is a media asset
scoped to the academy rather than to a test, which is why
`mock_test_media_assets` below has a nullable `mock_test_id`.

---

## 3. Proposed database entities

Fourteen tables in two groups: eleven for authored content, four for learner
attempts. All names are proposals for ADMIN-00 to ratify.

Conventions assumed throughout: `uuid` primary keys, `created_at` and
`updated_at` timestamps, `created_by` and `updated_by` referencing the
academy user table, and row level security on every table. Authored content is
readable by any authenticated learner only when published; learner attempt
rows are readable only by their owner and by staff.

### 3.1 mock_tests

One row per mock test.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `slug` | text, unique | For example `mock-test-2`. Used in routes. |
| `name` | text | For example "Mock Test 2". Learner facing. |
| `description` | text, nullable | Dashboard card copy. |
| `status` | enum | `draft`, `ready_for_review`, `published`, `archived`. See section 8. |
| `published_at` | timestamptz, nullable | |
| `source_note` | text, nullable | Where the content came from, for the same reason every current content file has a source header. |

### 3.2 mock_test_sections

One row per section of a test. Normally four.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `mock_test_id` | uuid | |
| `skill` | enum | `listening`, `reading`, `writing`, `speaking`. |
| `position` | int | 1 to 4. Listening first. |
| `title` | text | |
| `instruction_text` | text, nullable | The section instruction screen body. |
| `instruction_video_asset_id` | uuid, nullable | Points at a shared instruction video. |
| `time_limit_seconds` | int, nullable | Section total. Nullable because we do not enforce one today. |
| `scoring_rule_id` | uuid, nullable | Which raw-to-band map applies. |

Unique on `(mock_test_id, skill)`.

### 3.3 mock_test_parts

One row per part or task. Listening has six, Reading four, Writing two,
Speaking eight.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `mock_test_section_id` | uuid | |
| `position` | int | Part number within the section. |
| `part_type` | enum | See section 5. Drives the default screen flow. |
| `title` | text | For example "Listening for Viewpoints". |
| `subtitle` | text, nullable | |
| `instruction_lines` | jsonb | The bullet list on the part intro screen. |
| `scenario_text` | text, nullable | The context screen body. |
| `scenario_image_asset_id` | uuid, nullable | Listening Part 1 has one. |
| `question_instruction` | text, nullable | The line above the question list. |
| `media_instruction` | text, nullable | The line above the player. |
| `is_scored` | bool, default true | Lets an unscored practice task exist without polluting the count. See research document 17.7. |
| `known_gap_note` | text, nullable | Replaces the hand-written route notices. See section 11. |
| `answer_explanation_asset_id` | uuid, nullable | The published answer sheet image. |

Unique on `(mock_test_section_id, position)`.

### 3.4 mock_test_screens

The materialised screen run for a part. Created from the part type's template
and editable afterwards.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `mock_test_part_id` | uuid | |
| `position` | int | |
| `screen_type` | enum | Matches the sixteen types in `docs/product/exam-engine-screen-types.md`. |
| `media_asset_id` | uuid, nullable | For a media screen. |
| `body_text` | text, nullable | |
| `timer_rule_id` | uuid, nullable | The window this screen runs under. |

Unique on `(mock_test_part_id, position)`.

Questions attach to screens, which is what makes Listening Parts 1 to 3
expressible: three media screens and eight question screens in one part, each
question screen holding exactly one question, each media screen holding one of
the three conversation clips.

### 3.5 mock_test_questions

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `mock_test_part_id` | uuid | |
| `mock_test_screen_id` | uuid, nullable | Which screen prints it. Null until the screen run is built. |
| `position` | int | Question number within the part. |
| `question_type` | enum | See section 6. |
| `prompt` | text, nullable | The whole question, for a `single_choice` item. |
| `text_before` | text, nullable | Statement text up to the blank, for a completion item. |
| `text_after` | text, nullable | Statement text after the blank. |
| `question_audio_asset_id` | uuid, nullable | Parts 1 to 3 speak their questions. |
| `image_asset_id` | uuid, nullable | Speaking prompts, Reading diagrams. |
| `cognitive_type` | enum, nullable | `general_meaning`, `specific_information`, `inference`. Authoring aid, from research document section 9. |
| `explanation` | text, nullable | Shown on the answer review screen. |
| `option_set_id` | uuid, nullable | For a part whose options are shared across questions. See below. |

`prompt` against `text_before` / `text_after` is exactly the distinction the
current code draws between `ListeningVideoQuestion` and
`ListeningDropdownQuestion`. Keeping both as nullable columns on one table,
with `question_type` saying which is populated, is what lets one screen family
render both and removes the three-way duplication the audit criticises.

`option_set_id` exists for Reading Part 3, where nine statements share one A to
E option list rather than each carrying four of their own. Without it that part
needs 45 near-duplicate option rows and a rule that they must stay in sync.

### 3.6 mock_test_options

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `mock_test_question_id` | uuid, nullable | Null when the option belongs to a shared set. |
| `option_set_id` | uuid, nullable | Null for a normal per-question option. |
| `position` | int | Display order. |
| `label` | text, nullable | For example "A". Used by Reading Part 3. |
| `text` | text | |

Exactly one of `mock_test_question_id` and `option_set_id` must be set.

Note what is **not** here: an `is_correct` column. Correctness lives in
`mock_test_answer_keys` instead, so that the options a learner's browser
receives can be selected without ever touching the key. That is the same
discipline the current `without...AnswerKey` helpers enforce, moved into the
schema so it cannot be forgotten.

### 3.7 mock_test_answer_keys

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `mock_test_question_id` | uuid, unique | |
| `correct_option_id` | uuid, nullable | Null means the key is known to be missing. |
| `source` | enum | `answer-image`, `source-document`, `staff-entered`. Mirrors the `source` field already on `ListeningAnswerKeyEntry`. |
| `note` | text, nullable | |

**Security requirement, non-negotiable.** This table is never readable by a
learner role. Row level security denies it to `authenticated` entirely. It is
read only by the server-side marking action after an attempt is submitted, and
by staff in the admin panel. The current build already gets this right by
stripping keys before render and marking inside `"use server"` actions. The
schema must make the same guarantee structurally.

A separate table rather than a column also gives a natural home for the
`source` provenance that Mock Test 1's keys carry today, where five Part 4
answers are recorded as read off an answer screenshot rather than from
document text.

### 3.8 mock_test_media_assets

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `mock_test_id` | uuid, nullable | Null for a shared academy asset such as a section instruction video. |
| `media_type` | enum | See section 7. |
| `url` | text | Cloudinary delivery URL. |
| `cloud_name` | text | Parsed from the URL. Mock Test 1 uses `dkvsshy7n`. |
| `title` | text | Learner facing, for example "News item audio". |
| `duration_label` | text, nullable | For example "About 1.5 minutes". Display only. |
| `alt_text` | text, nullable | Required for every image type. |
| `poster_url` | text, nullable | Video only. |
| `is_verified` | bool, default false | Set once a HEAD request has confirmed the URL resolves. |

Assets are referenced, not re-hosted. Mock Test 1 holds 46 Cloudinary URLs
across two cloud accounts and downloads none of them, which is the policy this
table continues.

`is_verified` earns its place because of the Part 3 history: that part carried
two URLs for the same clip on two different Cloudinary accounts, and which one
was still live was never confirmed. A builder that can check a URL at save
time removes that whole class of problem.

### 3.9 mock_test_timer_rules

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `mock_test_id` | uuid | |
| `scope` | enum | `per_question`, `per_screen`, `per_part`, `per_section`, `prep_timer`, `recording_timer`. See section 4. |
| `target_id` | uuid | The question, screen, part or section it applies to. |
| `duration_seconds` | int | |
| `warning_at_seconds` | int, nullable | Defaults to the engine's 10. |
| `urgent_at_seconds` | int, nullable | Defaults to the engine's 5. |
| `on_expire` | enum | `advance`, `submit_section`, `stop_recording`. |
| `source` | enum | `official`, `derived`, `staff-set`. |
| `source_note` | text, nullable | |

`source` is the column that matters most and is the least obvious. The
research document establishes that some timings are published directly, such
as the 30 second per-question window in Parts 1 to 3, while others have to be
derived, such as the Parts 4 to 6 screen windows which are a part total minus
a clip length. A model that stores both as bare integers loses the difference,
and the next person to touch them cannot tell which are safe.

`on_expire` is what the current engine is missing. `useExamCountdown` already
accepts an `onExpire` callback and nothing passes one, so every clock reaches
zero and does nothing. Making the behaviour a stored value forces the flow to
honour it.

### 3.10 mock_test_scoring_rules

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `mock_test_id` | uuid, nullable | Null for a shared default map. |
| `skill` | enum | |
| `scoring_type` | enum | See section 9. |
| `total_questions` | int, nullable | 38 for Listening and Reading. |
| `band_map` | jsonb, nullable | The raw-to-level rows. |
| `rubric_id` | uuid, nullable | For an AI rubric estimate. |
| `disclaimer_text` | text | The estimated-practice wording shown with any result. |

`band_map` holds rows of `{ level, min_correct, max_correct }`, which is the
shape `LISTENING_BAND_CHART` already uses. The Listening and Reading maps in
research document section 14 are the two seed rows.

The overlapping rows must survive the move into the database. A raw score of
33 on Listening matches both the level 9 row and the level 10-12 row, and the
correct rendering is "Level 9 or 10-12" rather than a single level.
`formatListeningBandLabel` already does this and the behaviour must be
preserved, not simplified away.

`disclaimer_text` is a column rather than a constant because the wording rules
in research document section 16 are a compliance requirement, and a validation
rule in section 10 checks it. Storing it next to the map makes it impossible
to publish a scoring rule with no disclaimer attached.

### 3.11 mock_test_rubrics

Not in the ticket's list, and needed by `scoring_rules.rubric_id` and by the
validation rule that Writing and Speaking tasks need scoring descriptors
attached.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `skill` | enum | `writing` or `speaking`. |
| `categories` | jsonb | The four categories and their factors, from research document section 15. |
| `level_descriptors` | jsonb | Level by level wording from the ScoreDescriptors PDFs. |
| `version` | text | |

Two seed rows, one for Writing and one for Speaking. Their contents are
already researched in section 15 of the research document. Flagged here as an
addition to the ticket's entity list rather than folded in silently.

### 3.12 student_mock_test_attempts

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `user_id` | uuid | |
| `mock_test_id` | uuid | |
| `status` | enum | `in_progress`, `submitted`, `abandoned`. |
| `started_at` | timestamptz | |
| `submitted_at` | timestamptz, nullable | |
| `current_section_id` | uuid, nullable | Resume point. |
| `current_screen_id` | uuid, nullable | Resume point. |

### 3.13 student_mock_test_answers

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `attempt_id` | uuid | |
| `question_id` | uuid | |
| `selected_option_id` | uuid, nullable | Null is an unanswered question, which scores zero. |
| `text_response` | text, nullable | Writing tasks. |
| `recording_asset_id` | uuid, nullable | Speaking tasks. |
| `answered_at` | timestamptz | |
| `time_expired` | bool, default false | True when the window closed rather than the learner advancing. |

Unique on `(attempt_id, question_id)`.

A null `selected_option_id` must be stored rather than absent, so the
difference between "not reached" and "reached and left blank" survives. The
current engine already distinguishes these: `resolveStatus` in
`listening-score.ts` returns `unanswered` for a missing selection and counts
it as not correct, which matches the official rule that a blank earns no
point.

### 3.14 student_mock_test_section_scores

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `attempt_id` | uuid | |
| `section_id` | uuid | |
| `raw_correct` | int, nullable | |
| `total_questions` | int | |
| `estimated_levels` | text[], nullable | More than one entry when the chart rows overlap. |
| `estimated_label` | text, nullable | For example "Level 9 or 10-12". |
| `rubric_result` | jsonb, nullable | Writing and Speaking. |
| `scoring_rule_id` | uuid | Which map produced this. |

`estimated_levels` is an array, not a single value, for the overlap reason
given in 3.10.

### 3.15 student_mock_test_final_scores

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | |
| `attempt_id` | uuid, unique | |
| `listening_levels` | text[], nullable | |
| `reading_levels` | text[], nullable | |
| `writing_levels` | text[], nullable | |
| `speaking_levels` | text[], nullable | |
| `computed_at` | timestamptz | |
| `disclaimer_text` | text | Copied from the scoring rules at computation time. |

The disclaimer is copied rather than joined, so a result a learner saw a year
ago still renders with the wording it was produced under.

There is deliberately no overall or average level. CELPIP reports a level per
component and does not publish a single composite, so inventing one would be a
claim no source supports.

---

## 4. Timer types

| Type | Applies to | Used by |
| --- | --- | --- |
| `per_question` | one question | Listening Parts 1 to 3, 30 seconds each |
| `per_screen` | one screen holding several questions | Listening Parts 4 to 6 |
| `per_part` | a whole part | Reading Parts 1 to 4; Listening part allowances |
| `per_section` | a whole section | Listening 46-55 min, Reading 43-56 min, Writing 53 min, Speaking 15 min |
| `prep_timer` | a Speaking task before recording | 30 or 60 seconds per task |
| `recording_timer` | a Speaking task recording window | 60 or 90 seconds per task |

Nesting is expected and must be allowed. A Listening Part 1 question runs
under a `per_question` window inside a `per_part` window inside a
`per_section` window. The innermost running timer is the one whose expiry
advances the flow; an outer expiry ends everything inside it.

Only `per_question` exists in the engine today, with `on_expire` unwired.

---

## 5. Part types

A part type is the single choice that determines a part's screen flow,
question shape and default timers.

| Part type | Section | Screen flow |
| --- | --- | --- |
| `listening_problem_solving` | Listening | intro, scenario, then media and question screens interleaved, 3 media, 8 questions |
| `listening_daily_conversation` | Listening | intro, scenario, media, then 5 question screens |
| `listening_information` | Listening | intro, scenario, media, then 6 question screens |
| `listening_news_item` | Listening | intro, scenario, media, one question screen with 5 items |
| `listening_discussion` | Listening | intro, scenario, video, one question screen with 8 items |
| `listening_viewpoints` | Listening | intro, scenario, media, one question screen with 6 items |
| `reading_correspondence` | Reading | intro, one split screen, 11 items |
| `reading_diagram` | Reading | intro, one split screen with a diagram image, 8 items |
| `reading_information` | Reading | intro, one split screen with a shared option set, 9 items |
| `reading_viewpoints` | Reading | intro, one split screen, 10 items |
| `writing_email` | Writing | intro, one task screen |
| `writing_survey` | Writing | intro, option choice, one task screen |
| `speaking_task` | Speaking | intro, prep screen, recording screen |
| `speaking_comparison_task` | Speaking | intro, option choice across two image screens, prep, recording |

Note that the first three Listening types produce the same screen shape with
different counts, and the next three produce the same shape with different
media and counts. They stay distinct because their default timers and question
types differ, and because the part type is what an admin picks from a menu:
"Listening to a News Item" is a meaningful choice, "media then one question
screen" is not.

---

## 6. Question types

The twelve types from the ticket, with what each one means for rendering and
marking.

| Question type | Control | Prompt shape | Marking |
| --- | --- | --- | --- |
| `single_choice` | radio group | `prompt` | objective |
| `sentence_completion_choice` | radio group under a stem | `text_before` / `text_after` | objective |
| `dropdown_sentence_completion` | select at the blank | `text_before` / `text_after` | objective |
| `reading_correspondence_choice` | radio or inline select | either | objective |
| `reading_diagram_choice` | radio or inline select | either | objective |
| `reading_information_choice` | select from a shared option set | `prompt` | objective |
| `reading_viewpoints_choice` | radio or inline select | either | objective |
| `writing_email` | rich text area with word count | `prompt` | rubric |
| `writing_survey_response` | option choice then text area | `prompt` | rubric |
| `speaking_recorded_response` | recorder | `prompt` | rubric |
| `image_based_speaking` | recorder with an image | `prompt` plus image | rubric |
| `video_based_listening` | question under a video part | either | objective |

Two observations worth carrying into ADMIN-00.

**`sentence_completion_choice` and `dropdown_sentence_completion` differ only
in control.** Same data, same marking, same validation. Keeping both is right,
because the source document for a given test tells us which control it
intends, and Mock Test 1 tells us clearly: Part 4 and Part 6 both say
"drop-down menu" in the source. But the builder should treat the choice as a
rendering preference on one underlying type, not as two unrelated things.

**`video_based_listening` is about the part, not the question.** Whether a
question sits under a video or an audio clip is a property of the part's media,
which `mock_test_parts` and `mock_test_media_assets` already carry. Listening
Part 5's questions are `single_choice` items that happen to follow a video. The
type is kept because the ticket lists it, and ADMIN-00 should consider folding
it into `single_choice` rather than carrying a second name for the same thing.

The three cognitive types from the study pack, general meaning, specific
information and inference, are not question types. They are an authoring and
explanation aid, so they live on `mock_test_questions.cognitive_type`.

---

## 7. Media types

| Media type | Format | Where it appears |
| --- | --- | --- |
| `instruction_video` | mp4 | Section instruction screen. Shared across tests. |
| `audio_passage` | mp3 | The clip a Listening part is built around |
| `audio_question` | mp3 | The spoken question in Listening Parts 1 to 3 |
| `video_passage` | mp4 | Listening Part 5 |
| `image_prompt` | png or jpg | Speaking task prompts |
| `diagram_image` | png or jpg | Reading Part 2 |
| `reading_passage` | text, not a file | Held as text on the screen, not as an asset |
| `reference_image` | png or jpg | Answer and explanation sheets, scenario images |

`reading_passage` is listed in the ticket among the media types but is not a
file. Reading passages are text and must stay text: they need to be
selectable, scrollable and searchable by a learner, and an image of a passage
would be unusable and inaccessible. So it is a screen body, not a media asset.
Recorded here rather than dropped silently.

Playback rules are a property of the part, not the asset, and follow the
official Listening rules: begins automatically, played once, no pause, no
seek. A Listening media screen therefore needs no controls at all. Reading and
Writing have no media playback.

---

## 8. Publishing flow

```
draft  ->  ready_for_review  ->  published  ->  archived
  ^               |                  |
  +---------------+------------------+
```

| Status | Meaning | Who can move it |
| --- | --- | --- |
| `draft` | Being authored. Invisible to learners. | editor, admin, owner |
| `ready_for_review` | Complete, awaiting a check. Invisible to learners. | editor, admin, owner |
| `published` | Live. Visible to entitled learners. | admin, owner |
| `archived` | Withdrawn. Existing attempts keep working. | admin, owner |

Rules:

- The full validation set in section 10 runs on the move into
  `ready_for_review` and again on the move into `published`. Publishing with
  any error outstanding is refused.
- A published test cannot be edited in place. Editing creates a new draft
  version, so a learner mid-attempt never has content change underneath them.
- Archiving does not delete. Attempts against an archived test still render
  their review and score.
- Unpublishing is `published` back to `draft` and is available to admin and
  owner, which is the "publish or unpublish" capability from the ticket.

---

## 9. Scoring types

| Scoring type | Applies to | Behaviour |
| --- | --- | --- |
| `objective_correct_incorrect` | Listening, Reading | 1 point per correct answer, no deduction, blank scores zero |
| `raw_to_band_map` | Listening, Reading | Maps the raw total to estimated levels through `band_map`, overlaps preserved |
| `ai_rubric_estimate` | Writing, Speaking | Scores against a stored rubric, returns an estimated band per category |
| `manual_review` | Writing, Speaking | A staff member scores against the same rubric in a 1:1 session |

The first two compose: a Listening section runs `objective_correct_incorrect`
to get a raw total, then `raw_to_band_map` to get estimated levels.

`manual_review` is in the model because `_reference/exam-engine/official-screens/Official Test Explanation with Screenshots (1).docx`
records the intent directly: "I will also evaluate in 1:1 session". A rubric
result should therefore be able to carry a staff score alongside or instead of
an AI one.

All four produce estimates and none produces a CELPIP score. Research document
section 14 quotes the official disclaimer that the raw-to-level charts are
approximate and vary between test forms, which means even a perfectly
implemented `raw_to_band_map` is an approximation by the publisher's own
account.

---

## 10. Admin roles

| Role | Create and edit content | Move to ready_for_review | Publish, unpublish, archive | Manage users | See answer keys |
| --- | --- | --- | --- | --- | --- |
| `owner` | yes | yes | yes | yes | yes |
| `admin` | yes | yes | yes | no | yes |
| `editor` | yes | yes | no | no | yes |
| `reviewer` | no | no | no | no | yes |

`reviewer` is read plus comment: it can open a draft, run the preview and
leave review notes, and cannot change content or status.

All four staff roles can see answer keys. No learner role can, under any
circumstance, which is enforced by row level security on
`mock_test_answer_keys` rather than by application code.

---

## 11. Validation rules

Run on save as warnings, and on the move to `ready_for_review` and
`published` as blocking errors.

**Answer keys**

1. Every objective question has at least one correct answer. A question whose
   `mock_test_answer_keys` row is missing or whose `correct_option_id` is null
   is an error.
2. A published test cannot have any missing answer key. This is rule 1 applied
   across the whole test at publish time, and it is the check that prevents a
   learner reaching a score screen that cannot produce a number.
3. Every `correct_option_id` references an option that belongs to that
   question. Guards against an option being edited or reordered after a key
   was set.

**Options**

4. Listening and Reading objective questions have exactly four answer options,
   unless the question type says otherwise. The exception is
   `reading_information_choice`, which draws from a shared option set of five,
   A to E.
5. No two options on a question have identical text.
6. Every option has non-empty text.

**Media**

7. Every media screen has a media asset, and that asset has a non-empty URL.
8. Cloudinary URLs match the expected delivery format:
   `https://res.cloudinary.com/<cloud_name>/<image|video>/upload/<version>/<public_id>.<ext>`.
   Note that Cloudinary serves mp3 audio under the `video` resource type, so
   an audio asset with `/video/upload/` in its URL is correct and must not be
   flagged. All 26 Mock Test 1 mp3 URLs take this form.
9. The URL resolves. A HEAD request at save time sets `is_verified`. A
   published test with an unverified asset is a warning, not an error, since a
   transient network failure should not block publishing.
10. Every image asset has non-empty `alt_text`.

**Timers**

11. Required timers are set. A Listening Parts 1 to 3 part needs a
    `per_question` rule; a Parts 4 to 6 part needs a `per_screen` rule; a
    Speaking task needs both a `prep_timer` and a `recording_timer`; a Reading
    part needs a `per_part` rule.
12. Every timer rule has an `on_expire` behaviour.
13. A timer with `source` of `derived` has a non-empty `source_note`, so a
    number nobody can trace cannot reach production.
14. Nested timers are consistent: the sum of a part's inner windows does not
    exceed its `per_part` duration, and the sum of a section's parts does not
    exceed its `per_section` duration.

**Rubrics**

15. Every Writing and Speaking task has a rubric attached through its section's
    scoring rule.

**Structure**

16. A section's scored question count matches its scoring rule's
    `total_questions`. For Listening and Reading that is 38, which catches a
    missing or duplicated question immediately.
17. Part positions within a section are contiguous from 1.
18. Question positions within a part are contiguous from 1.

**Wording**

19. No learner-facing text claims official CELPIP scoring. Every scoring rule
    has non-empty `disclaimer_text`, and a text scan rejects phrases such as
    "your CELPIP score", "official score", "your CELPIP level is" and "band
    score" where not preceded by "estimated". Enforced on
    `mock_test_scoring_rules.disclaimer_text`, on section and part instruction
    text, and on any result copy.
20. No learner-facing text or asset reproduces official CELPIP branding.
    Reviewed by a human at the `ready_for_review` step rather than
    automatically.

---

## 12. MVP admin panel scope

The smallest builder that can produce Mock Test 2 Listening without a
developer.

In scope:

- Create, name and delete a mock test in `draft`.
- Add a Listening section.
- Add parts by choosing a part type, which materialises the default screen
  flow.
- Edit part instruction bullets, scenario text and question instruction lines.
- Attach a Cloudinary URL to a media screen, with format validation and a HEAD
  check.
- Add questions and options through a form that adapts to the question type:
  a prompt field for `single_choice`, before-and-after fields for a completion
  item.
- Select the correct answer per question and record its `source`.
- Set per-question and per-screen timers, with `source` and `source_note`.
- Attach the seeded Listening `raw_to_band_map` scoring rule.
- Run validation and see the failures as a list.
- Preview the part exactly as a learner sees it, keys hidden.
- Move `draft` to `ready_for_review` to `published`.

Out of scope for the MVP:

- Reading, Writing and Speaking authoring. Listening proves the model; the
  others follow the same shape.
- Editing the materialised screen run directly.
- Versioning a published test.
- Bulk import.
- Media upload. Assets stay Cloudinary URLs pasted in, as they are today.
- Learner attempt persistence, which is a separate concern from authoring and
  is deliberately not bundled with it.

The MVP's success test: an editor with the Mock Test 2 source document and no
repository access produces a Listening section that passes validation and
previews correctly.

---

## 13. Later admin panel scope

- Reading authoring, including the split screen layout, inline blanks inside a
  passage, and shared option sets for Reading Part 3.
- Writing and Speaking authoring, including prep and recording timers and
  rubric attachment.
- Versioning: editing a published test creates a new version, and in-flight
  attempts keep the version they started.
- Media library: browse, search and reuse assets across tests, with usage
  counts so an asset in use cannot be deleted.
- Direct screen run editing, for a part whose flow differs from its template.
- Duplicate a test as a starting point for the next one.
- Question bank: reuse a question across tests, with an attempt guard so a
  learner never sees the same item twice.
- Import from a source document, which is the biggest single time saver and
  the most error-prone, so it comes last and always lands in `draft`.
- Learner-facing analytics per question, which also tells the academy which
  items are miskeyed.

---

## 14. How Mock Test 2 should be created using this model

The intended path once ADMIN-01 exists. Listening only, to match MVP scope.

1. **Create the test.** New mock test, name "Mock Test 2", slug
   `mock-test-2`, status `draft`. Record the source document in `source_note`.
2. **Add the Listening section.** Skill `listening`, position 1. Attach the
   shared Listening instruction video, which already exists as an asset and is
   not re-uploaded. Attach the seeded Listening scoring rule with its
   `band_map` and disclaimer.
3. **Add six parts** by choosing the six Listening part types in order. Each
   materialises its screen flow, so Part 1 arrives with three media screens
   and eight question screens already laid out.
4. **Fill in part text.** Instruction bullets, scenario text, media and
   question instruction lines, straight from the source document.
5. **Attach media.** Paste each Cloudinary URL onto its screen. Validation
   checks the format and the HEAD request confirms it resolves. Part 1 takes
   three clips, Parts 2 and 3 take one each plus one question clip per
   question, Part 4 and Part 6 take one clip each, Part 5 takes a video.
6. **Add questions.** Parts 1 to 3 as `single_choice` with question audio.
   Part 4 and Part 6 as `dropdown_sentence_completion`. Part 5 as whatever the
   source says, which for a test authored to the current official format
   should be `dropdown_sentence_completion` rather than the full questions
   Mock Test 1 uses. See the note below.
7. **Add options,** four per question.
8. **Set correct answers,** recording `source` for each. If the source
   publishes its answers as images, the source is `answer-image`, exactly as
   Mock Test 1's keys record today.
9. **Set timers.** 30 seconds `per_question` for Parts 1 to 3 with source
   `official`. `per_screen` windows for Parts 4 to 6 with source `derived` and
   a `source_note` explaining the derivation. `on_expire` is `advance`
   throughout.
10. **Validate.** Expect 38 scored questions, four options on every question,
    a key on every question, a timer on every question and screen, a resolving
    URL on every media screen.
11. **Preview** the whole section as a learner.
12. **Move to `ready_for_review`,** have a second person check it, then
    **publish**.

Nothing in that list requires a developer, a deployment or a code review.

**One authoring decision to make deliberately.** Mock Test 1's Part 5 is
written as eight full questions, while the official study pack describes Parts
4 to 6 as sentence completion. The audit document, section 7, works through
the evidence and concludes that Mock Test 1 is faithful to its own source and
that its source diverges from the current official format. Mock Test 2 should
be authored to the official format: Part 5 as sentence stems with four choices
and a drop-down control. Flag this to whoever prepares the Mock Test 2 source
document, because it is a content decision that has to be made before
authoring starts, not during.

---

## 15. Which current hardcoded files become database records

The mapping from today's tree to the model above. Nothing here moves in
EXAM-15E.

### Becomes content rows

| Current file | Becomes |
| --- | --- |
| `mock-tests/mock-test-1/full-listening-section.ts` | one `mock_tests` row plus one `mock_test_sections` row |
| `mock-tests/mock-test-1/listening-part-1.ts` | one `mock_test_parts` row, one `mock_test_screens` row per screen in the flow, 8 `mock_test_questions`, 32 `mock_test_options`, 8 `mock_test_answer_keys`, 3 conversation assets plus 8 question clips |
| `listening-part-2.ts` | same shape, 5 questions, 20 options, 5 keys, 1 conversation asset plus 5 question clips |
| `listening-part-3.ts` | same shape, 6 questions, 24 options, 6 keys, 1 conversation asset plus 6 question clips |
| `listening-part-4.ts` | one part, 5 questions, 20 options, 5 keys, 1 audio asset, no question audio |
| `listening-part-5.ts` | one part, 8 questions, 32 options, 8 keys, 1 video asset, no question audio |
| `listening-part-6.ts` | one part, 6 questions, 24 options, 6 keys, 1 audio asset, no question audio |
| `instructional-video-assets.ts` | 4 shared `mock_test_media_assets` rows with a null `mock_test_id` |
| `listening-band-score.ts`, the `LISTENING_BAND_CHART` constant | one `mock_test_scoring_rules` row with the chart as `band_map` |
| `exam-timer-utils.ts`, the `EXAM_QUESTION_TIMER_SECONDS` constant | `mock_test_timer_rules` rows, one per question or screen |

Totals for Mock Test 1 Listening: 1 test, 1 section, 6 parts, 38 questions,
152 options, 38 answer keys, and 34 media assets. The media count comes
straight from the Listening groups in
`mock-tests/mock-test-1/extracted-links.md`: 8 section audio, 19 question
audio, 1 video, 1 context image and 6 answer explanation images, which is 35
URLs, less the one Part 3 conversation clip that exists twice on two
Cloudinary accounts and is only used once. Timer rules come to 22 once
EXAM-15F sets them: 19
`per_question` rules for Parts 1 to 3 and 3 `per_screen` rules for Parts 4 to
6, before any `per_part` or `per_section` rules are added.

Screen counts are left unstated because they are produced by the flow
builders rather than written down anywhere, and they differ per part. Part 1
alone materialises an intro, a scenario, three conversation screens, two
section breaks, eight question screens and three closing screens.

### Stays code

These are the engine, and an admin panel does not replace them.

| Current file or group | Why it stays |
| --- | --- |
| `src/components/exam/**` | Rendering. The screens are what a part type's template points at. |
| `src/features/exam-engine/*-flow.ts` | Flow construction. Reads rows instead of imports. |
| `listening-score.ts`, `listening-section-score.ts` | Marking. Reads keys from the database instead of a module. |
| `listening-band-score.ts`, the functions | `estimateListeningBand` and `formatListeningBandLabel` keep working; only the chart constant moves. |
| `exam-timer-utils.ts`, `useExamCountdown` | The clock. Reads a duration instead of a constant. |
| `*-types.ts` | Become the shape a row is read into. |
| `exam-copy.ts`, `listening-copy.ts` | Chrome copy that is not per test. |

### The types are where the model gets simpler

Today there are four parallel Listening content types:
`ListeningPartContent`, `ListeningDropdownPartContent`,
`ListeningVideoPartContent` and `ListeningViewpointsPartContent`, each with
its own flow module and screen family. The comments in those files explain the
split well and the reasoning was sound at the time: merging them would have
produced a type where half the fields are unset for any given part.

The database resolves this differently. One `mock_test_questions` table with a
nullable `prompt` and nullable `text_before` / `text_after`, discriminated by
`question_type`, expresses all four shapes without four tables. The unset
fields the type comments worried about are exactly what a nullable column is
for.

That means ADMIN-00 should collapse the four content types into one read
shape, and the audit document's recommendation to unify the Parts 4 to 6
screen family in EXAM-15F is a step toward the same destination. Doing
EXAM-15F first makes ADMIN-00 smaller.

### What is not yet ready to move

- Writing and Speaking prompts exist in the Mock Test 1 source only as images.
  `mock-tests/mock-test-1/extracted-content-outline.md` records that they need
  typing out as text first.
- Reading content is fully present as text in the source document and has
  never been loaded into TypeScript at all, so it goes straight into the
  database rather than through a content file. That is an argument for doing
  ADMIN-00 before READING-FULL, though not before EXAM-16, which needs a
  prototype to learn the Reading screen from.

---

## 16. Open questions for ADMIN-00

1. Should a published test be versioned from the start, or is copy-on-edit
   enough for the MVP? Versioning is cheap to add now and expensive to
   retrofit once attempts exist.
2. Should the question bank exist in the first schema? It changes
   `mock_test_questions` from belonging to a part to being linked to one.
3. Does `video_based_listening` survive as a distinct question type, or fold
   into `single_choice`? See section 6.
4. Where do learner recordings live? Speaking answers reference a
   `recording_asset_id`, and Cloudinary is a content delivery account rather
   than a store for learner data. Likely Supabase storage with per-user
   policies, which is a different security posture from the content assets.
5. Do we model the unscored practice task and unscored items? `is_scored`
   makes it possible. Research document 17.7 leaves the decision open.
6. Confirm research document 17.2, the Part 5 timing conflict, before seeding
   any Part 5 timer rule.

---

## 17. Recommended next tickets

1. `EXAM-15F` - Listening Part 4-6 Format and Strict Timing Correction
2. `EXAM-16` - Reading Part 1 Prototype
3. `EXAM-17` - Reading Part 1 Review and Score
4. `READING-FULL` - Full Reading Section Flow and Estimated Band Score
5. `ADMIN-00` - Admin Mock Test Builder Database Blueprint
6. `ADMIN-01` - Admin Mock Test Builder MVP

Why this order, given that this document is about the admin panel:

EXAM-15F comes first because the engine is currently wrong about media,
timing and navigation, and both Reading and the admin model would otherwise be
built against the wrong behaviour. It also unifies the Parts 4 to 6 screen
family, which makes ADMIN-00 smaller.

EXAM-16 and EXAM-17 come next because Reading introduces a screen shape the
engine has never rendered: a split passage and question layout, inline blanks
inside a passage, and a shared option set. Those are exactly the cases the
schema in section 3 has to support, and a prototype teaches them more reliably
than a design document does.

ADMIN-00 then has both formats in front of it and can define a schema that
covers all four sections rather than one that fits Listening and gets
retrofitted.

None of these tickets are created by EXAM-15E. The sequence is documented
only.
