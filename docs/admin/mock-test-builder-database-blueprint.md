# Mock test builder database blueprint (ADMIN-00)

The sixteen entities behind the admin workflow in
`docs/admin/mock-test-builder-workflow.md`.

This is a design document. No table in it exists. No migration was
written, and no SQL was applied to hosted Supabase. The draft SQL that
matches this blueprint is `docs/admin/mock-test-builder-draft-schema.sql`,
which is deliberately not in `supabase/migrations/`.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

---

## 1. Conventions

Applied to every table unless a row says otherwise.

| Convention | Value |
| --- | --- |
| Primary key | `uuid`, `default gen_random_uuid()` |
| Timestamps | `created_at timestamptz default now()`, `updated_at timestamptz default now()` |
| Authorship | `created_by uuid references auth.users (id)`, `updated_by uuid references auth.users (id)` |
| Schema | `public`, matching the existing migrations |
| Ordering | An integer `position`, contiguous from 1 within its parent |
| Row level security | Enabled on every table, with an explicit policy per role |
| Deletes | `on delete cascade` down the authored content tree, `on delete restrict` where an attempt would lose meaning |

Enumerated values are `text` columns with a `check` constraint rather
than Postgres `enum` types. The existing schema already does this:
`profiles.role`, `modules.status` and `tasks.status` are all plain `text`
with defaults. A check constraint can be changed with one statement,
where adding a value to an enum type in the middle of an ordering cannot,
and a builder whose vocabulary is still settling should not pay that
cost. The draft SQL notes where an enum type would be preferable if this
ever stabilises.

Two groups:

- **Authored content**, entities 1 to 12. Written by staff, readable by
  learners only when the parent test is published, and in two cases never
  readable by a learner at all.
- **Learner attempts**, entities 13 to 16. Written by the learner and by
  server-side marking, readable only by their owner.

---

## 2. Entity relationship overview

```
mock_tests
  |
  +-- mock_test_sections            (one per skill)
  |     |
  |     +-- mock_test_parts         (part or task)
  |           |
  |           +-- mock_test_screens (materialised from the part type)
  |           |
  |           +-- mock_test_questions
  |                 |
  |                 +-- mock_test_options
  |                 +-- mock_test_answer_keys   (objective only, admin only)
  |
  +-- mock_test_media_assets        (nullable test id: null means shared)
  +-- mock_test_timer_rules         (polymorphic target)
  +-- mock_test_scoring_rules  -->  mock_test_ai_rubrics
  +-- mock_test_validation_issues

student_mock_test_attempts
  +-- student_mock_test_answers
  +-- student_mock_test_section_scores
  +-- student_mock_test_final_scores
```

---

## 3. Authored content entities

### 3.1 mock_tests

One row per mock test.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `slug` | text, unique, not null | For example `mock-test-2`. Used in the learner route. |
| `title` | text, not null | Learner facing. For example "Mock Test 2". |
| `description` | text | Dashboard card copy. |
| `status` | text, not null, default `draft` | `draft`, `ready_for_review`, `published`, `archived`. |
| `version` | integer, not null, default 1 | Editing a published test creates a new draft at `version + 1`. |
| `published_at` | timestamptz | Set on the move to `published`, cleared on unpublish. |
| `internal_notes` | text | Staff only. Source document, open gaps, who typed it. |
| `source_note` | text | Where the content came from. Mirrors the source header every current content file carries. |

Indexes: unique on `slug`, and on `(status)` for the learner dashboard
query.

Learner exposure: rows with `status = 'published'` only. `internal_notes`
and `source_note` are never selected into a learner response.

### 3.2 mock_test_sections

One row per skill inside a test. Normally four.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `mock_test_id` | uuid, not null | Cascade delete. |
| `skill` | text, not null | `listening`, `reading`, `writing`, `speaking`. |
| `position` | integer, not null | 1 to 4. Exam order. |
| `title` | text, not null | For example "Mock Test 2 - Listening Test". |
| `instruction_text` | text | Section instruction screen body. |
| `instruction_lines` | jsonb, default `[]` | The bullet list on that screen. |
| `instruction_video_asset_id` | uuid | Nullable. Points at a shared asset. |
| `estimated_duration_seconds` | integer | Display only. The real clock is a timer rule. |
| `scoring_rule_id` | uuid | Which raw-to-band map or rubric estimate applies. |
| `status` | text, not null, default `draft` | `draft` or `ready`. |

Unique on `(mock_test_id, skill)` and on `(mock_test_id, position)`.

`estimated_duration_seconds` is display text on purpose. Storing a
section duration that a timer rule could contradict would give two
answers to one question, so validation rule 22 checks that it agrees with
the timer rules underneath it.

### 3.3 mock_test_parts

One row per part or task. Listening has six, Reading four, Writing two,
Speaking eight.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `mock_test_section_id` | uuid, not null | Cascade delete. |
| `position` | integer, not null | Part number within the section. |
| `part_type` | text, not null | The fifteen types in the workflow document, section 4. |
| `title` | text, not null | For example "Listening to Viewpoints". |
| `subtitle` | text | |
| `format_label` | text | The Format row on the part intro card. |
| `instruction_lines` | jsonb, default `[]` | The bullet list on the part intro screen. |
| `scenario_instruction` | text | For example "Read the following information.". |
| `scenario_text` | text | The context screen body. |
| `scenario_heading` | text | The bold line above it, where the source prints one. |
| `scenario_image_asset_id` | uuid | Listening Part 1 has one. |
| `question_instruction` | text | The line above the question list. |
| `media_instruction` | text | The line above the player. |
| `passage_label` | text | Reading. For example "Message". |
| `passage_heading` | text | Reading. For example "Dear Scott,". |
| `passage_paragraphs` | jsonb, default `[]` | Reading passage body. Text, never an image. |
| `passage_sign_off` | jsonb, default `[]` | Reading. For example ["Cheers,", "Jim"]. |
| `prompt_requirements` | jsonb, default `[]` | Writing. The bullet requirements. |
| `word_min` | integer | Writing. |
| `word_max` | integer | Writing. |
| `editor_placeholder` | text | Writing. |
| `visual_kind` | text | Speaking. `scene` or `option-cards`. |
| `option_set_id` | uuid | Reading Part 3. The shared A to E list. |
| `answer_explanation_asset_id` | uuid | The published answer sheet image, where one exists. |
| `is_scored` | boolean, not null, default true | An unscored practice task does not pollute the count. |
| `known_gap_note` | text | Replaces the hand-written route notices. |

Unique on `(mock_test_section_id, position)`.

Question count is deliberately absent. It is counted off
`mock_test_questions`, which is what the current Reading section already
does and says so, so an edit moves the count, the intro card and the
score denominator together.

The Reading passage columns look like a lot of fields for one section's
use, and they are, but the alternative is a jsonb blob whose shape
nothing validates. A passage has a label, a heading, paragraphs and a
sign-off, and each of those is rendered differently, so each is a column.

### 3.4 mock_test_screens

The materialised screen run for a part, created from the part type's
template and editable afterwards.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `mock_test_part_id` | uuid, not null | Cascade delete. |
| `position` | integer, not null | |
| `screen_type` | text, not null | The seventeen types in the workflow document, section 4. |
| `title` | text | Top bar title, where the screen owns one. |
| `body_text` | text | |
| `helper_text` | text | |
| `media_asset_id` | uuid | For a media screen. |
| `timer_rule_id` | uuid | The window this screen runs under. |

Unique on `(mock_test_part_id, position)`.

Screens are why Listening Parts 1 to 3 are expressible at all: three
media screens interleaved with eight question screens in one part, each
question screen holding exactly one question, each media screen holding
one conversation clip. Without a screen row the part would have to be a
flat question list, which is what the current Part 1 content file already
avoids by grouping questions under conversation sections.

### 3.5 mock_test_questions

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `mock_test_part_id` | uuid, not null | Cascade delete. |
| `mock_test_screen_id` | uuid | Which screen prints it. Null until the screen run is built. |
| `position` | integer, not null | Question number within the part. |
| `question_type` | text, not null | See section 5. |
| `prompt` | text | The whole question, for a `single_choice` item, or the task instruction for Writing and Speaking. |
| `text_before` | text | Statement text up to the blank, for a completion item. |
| `text_after` | text | Statement text after the blank. |
| `question_audio_asset_id` | uuid | Listening Parts 1 to 3 speak their questions. |
| `image_asset_id` | uuid | Speaking prompts, Reading diagrams. |
| `option_set_id` | uuid | For a part whose options are shared across questions. |
| `cognitive_type` | text | `general_meaning`, `specific_information`, `inference`. An authoring aid, never rendered. |
| `explanation` | text | Shown on the answer review screen after submission. |
| `is_scored` | boolean, not null, default true | |

Unique on `(mock_test_part_id, position)`.

`prompt` against `text_before` and `text_after` is exactly the
distinction the current code draws between a radio question and a
dropdown completion question. Keeping both as nullable columns on one
table, discriminated by `question_type`, is what lets one read shape
serve all four Listening content types the tree carries today.

`option_set_id` exists for Reading Part 3, where nine statements share
one A to E list rather than each carrying five of their own. Without it
that part needs 45 near-duplicate option rows and a rule that they must
stay in sync.

### 3.6 mock_test_options

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `mock_test_question_id` | uuid | Null when the option belongs to a shared set. |
| `option_set_id` | uuid | Null for a normal per-question option. |
| `position` | integer, not null | Display order. |
| `label` | text | For example "A". Used by Reading Part 3 and Speaking Task 5. |
| `text` | text, not null | |
| `image_asset_id` | uuid | Speaking Task 5 option cards carry a picture. |

Exactly one of `mock_test_question_id` and `option_set_id` is set,
enforced by a check constraint.

**There is no `is_correct` column, and that is the point.** Correctness
lives in `mock_test_answer_keys`, so the options a learner's browser
receives can be selected without the query ever touching the key. The
current build achieves the same thing in application code by stripping
keys before render; putting the split in the schema makes it structural
rather than remembered.

Shared option sets need a parent, so a small `mock_test_option_sets`
table exists in the draft SQL holding an id, a `mock_test_id` and a
label. It is not one of the sixteen named entities because it is an
implementation detail of `mock_test_options`, and it is called out here
rather than added silently.

### 3.7 mock_test_answer_keys

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `mock_test_question_id` | uuid, unique, not null | One key per question. |
| `correct_option_id` | uuid | Null means the key is known to be missing, which validation rule 9 rejects at publish. |
| `score_value` | integer, not null, default 1 | Present so an unusual item can be weighted. |
| `explanation` | text | Shown on the answer review screen. |
| `source` | text, not null | `document`, `answer-image`, `staff-entered`. |
| `note` | text | Why, when the source is not obvious. |

**Security requirement, non-negotiable.** This table is never readable by
a learner role. Row level security denies it to `authenticated`
entirely. It is read only by server-side marking after an attempt is
submitted, and by staff in the admin panel. Mock Test 1 already records
key provenance in code, with the Listening keys marked as read off an
answer screenshot and every Reading key marked as read from the source
document, so `source` is carrying data that exists today rather than
inventing a field.

### 3.8 mock_test_media_assets

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `mock_test_id` | uuid | Null for a shared academy asset such as a section instruction video. |
| `media_type` | text, not null | The eight types in the workflow document, section 5. |
| `url` | text, not null | Cloudinary delivery URL. |
| `cloud_name` | text | Parsed from the URL. Mock Test 1 uses `dkvsshy7n`. |
| `title` | text | Learner facing where shown. |
| `alt_text` | text | Required for every image type. |
| `transcript` | text | Where one exists. |
| `duration_label` | text | Display only. For example "About 1.5 minutes". |
| `poster_url` | text | Video only. |
| `width` | integer | Intrinsic width, so a screen can reserve the box. |
| `height` | integer | Intrinsic height. |
| `caption` | text | For example "Source prompt image". |
| `internal_notes` | text | Staff only. |
| `is_verified` | boolean, not null, default false | Set once a HEAD request confirms the URL resolves. |
| `verified_at` | timestamptz | |

Index on `(mock_test_id, media_type)`.

Assets are referenced, not re-hosted, which is the policy Mock Test 1
already follows across all 46 of its URLs. `is_verified` earns its place
because Part 3 once carried the same clip on two Cloudinary accounts and
which one was live was never confirmed; a builder that checks a URL at
save time removes that whole class of problem.

### 3.9 mock_test_timer_rules

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `mock_test_id` | uuid, not null | |
| `scope` | text, not null | `per_question`, `per_screen`, `per_part`, `per_section`, `prep_timer`, `recording_timer`. |
| `target_type` | text, not null | `question`, `screen`, `part`, `section`. |
| `target_id` | uuid, not null | The row it applies to. Polymorphic, so no foreign key; validation checks it resolves. |
| `duration_seconds` | integer, not null | |
| `warning_at_seconds` | integer | Amber threshold. |
| `urgent_at_seconds` | integer | Red threshold. |
| `on_expire` | text, not null | `advance`, `submit_section`, `stop_recording`, `none`. |
| `source` | text, not null | `published`, `derived`, `staff-set`. |
| `source_note` | text | Required when `source` is `derived`. |

Index on `(target_type, target_id)`.

`source` is the column that matters most and is the least obvious. Some
timings are published directly, such as the 30 second per-question window
in Listening Parts 1 to 3 and the 11 minutes for Reading Part 1. Others
have to be derived, such as the Listening Parts 4 to 6 screen windows,
which are a part total minus a clip length. The current
`listening-timing.ts` and the four Reading part files already carry this
distinction with a `source` and a `note` on every timer, and flattening
them into bare integers would lose it.

`on_expire` is what the engine is missing today. `useExamCountdown`
accepts an expiry handler and no current screen passes one, so every
clock reaches zero and nothing happens. Making the behaviour a stored
value forces a flow to honour it.

Two thresholds rather than one set of defaults, because a 30 second
window and a 27 minute window need very different notice. The tree
already uses 10 and 5 seconds for a question window, 60 and 20 for a
Reading part, and 300 and 60 for a Writing task.

### 3.10 mock_test_scoring_rules

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `mock_test_id` | uuid | Null for a shared default map. |
| `skill` | text, not null | |
| `scoring_type` | text, not null | `objective_correct_incorrect`, `raw_to_band_map`, `ai_rubric_estimate`, `manual_review`. |
| `total_questions` | integer | 38 for Listening and Reading. |
| `band_map` | jsonb | Rows of `{ level, min_correct, max_correct }`. |
| `ai_rubric_id` | uuid | For a rubric estimate. |
| `disclaimer_text` | text, not null | The estimated-practice wording shown with any result. |

`band_map` holds the shape the current band chart constants already use,
and the overlapping rows must survive the move. A raw Listening score of
35 matches both the level 9 row and the level 10-12 row, and the correct
rendering is "Level 9 or 10-12" rather than a single level. The existing
label formatters do this and the behaviour is preserved, not simplified
away.

`disclaimer_text` is `not null` rather than optional because the wording
rules are a compliance requirement. Storing it next to the map makes it
impossible to publish a scoring rule with no disclaimer attached.

The first two scoring types compose: a Listening section runs
`objective_correct_incorrect` to get a raw total, then `raw_to_band_map`
to get estimated levels.

### 3.11 mock_test_ai_rubrics

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `skill` | text, not null | `writing` or `speaking`. |
| `name` | text, not null | For example "CELPIP Writing rubric v1". |
| `criteria` | jsonb, not null | Four entries. Writing: Content/Coherence, Vocabulary, Readability, Task Fulfillment. Speaking: Content/Coherence, Vocabulary, Listenability, Task Fulfillment. |
| `task_checklists` | jsonb, default `{}` | Keyed by task type, for example `email` and `survey-response`. |
| `level_descriptors` | jsonb, default `{}` | Level by level wording. |
| `audio_notes` | jsonb, default `[]` | Speaking only. Audio-first judging rules. |
| `timing_checks` | jsonb, default `[]` | Speaking only. What a short response means. |
| `prompt_version` | text, not null | For example "writing-v1". Stamped onto every result. |
| `model_settings` | jsonb, default `{}` | Model name, temperature, max output. Never a credential. |
| `disclaimer_text` | text, not null | |
| `status` | text, not null, default `draft` | `draft` or `active`. |

Two seed rows, one per skill. The criteria are fixed per skill and are
not free text, because the only difference between the two lists is
Readability against Listenability and that is exactly the mistake a free
text field would let through. The current Writing prompt builder already
states the rule outright, telling the model that the third criterion is
Readability and not Listenability.

**Security.** Prompt bodies, checklists and model settings are
`super_admin` only and never appear in a learner response. What a learner
receives is the result. The four criterion names are safe to show,
because CELPIP publishes them.

`prompt_version` is copied onto every stored result rather than joined,
so a review a learner read months ago can still be traced to the wording
that produced it.

### 3.12 mock_test_validation_issues

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `mock_test_id` | uuid, not null | Cascade delete. |
| `entity_type` | text, not null | `test`, `section`, `part`, `screen`, `question`, `option`, `answer_key`, `media_asset`, `timer_rule`, `scoring_rule`, `ai_rubric`. |
| `entity_id` | uuid | The row the issue is about. Null for a whole-test rule. |
| `rule_code` | text, not null | For example `answer_key_missing`. Stable, so a fix can resolve the right row. |
| `severity` | text, not null | `error` or `warning`. |
| `message` | text, not null | What a staff member reads. |
| `status` | text, not null, default `open` | `open` or `resolved`. |
| `detected_at` | timestamptz, not null, default now() | |
| `resolved_at` | timestamptz | |

Index on `(mock_test_id, status, severity)`, which is the dashboard's
issue count query.

This table is a cache of a computation, which is a real tradeoff and is
taken deliberately. Recomputing every rule on every dashboard render
would mean reading a whole test to draw one number, and an author fixing
fourteen problems wants a list they can work through rather than one
error at a time. The cost is that the rows can go stale, so validation
reruns on every save of an affected entity and always immediately before
a status change. A publish never trusts the cached rows.

---

## 4. Learner attempt entities

### 4.1 student_mock_test_attempts

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `user_id` | uuid, not null | References `auth.users`. |
| `mock_test_id` | uuid, not null | Restrict delete. An attempt must keep its test. |
| `status` | text, not null, default `in_progress` | `in_progress`, `submitted`, `abandoned`. |
| `started_at` | timestamptz, not null, default now() | |
| `submitted_at` | timestamptz | |
| `current_section_id` | uuid | Resume point. |
| `current_screen_id` | uuid | Resume point. |

Index on `(user_id, mock_test_id)`.

The attempt holds `mock_test_id`, not `slug`, so an attempt against
version 1 of a test keeps rendering version 1 after version 2 is
published.

### 4.2 student_mock_test_answers

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `attempt_id` | uuid, not null | Cascade delete. |
| `question_id` | uuid, not null | |
| `selected_option_id` | uuid | Null is reached and left blank, which scores zero. |
| `text_response` | text | Writing tasks. |
| `word_count` | integer | Writing tasks. Computed server-side. |
| `recording_path` | text | Speaking tasks. A Supabase storage path, not a Cloudinary URL. |
| `transcript` | text | Speaking tasks. Produced server-side. |
| `time_expired` | boolean, not null, default false | True when the window closed rather than the learner advancing. |
| `answered_at` | timestamptz, not null, default now() | |

Unique on `(attempt_id, question_id)`.

A null `selected_option_id` is stored rather than the row being absent,
so the difference between "not reached" and "reached and left blank"
survives. The current scoring code already draws that distinction and
counts a blank as not correct, matching the official rule.

`recording_path` is a storage path, not a URL. Cloudinary is a content
delivery account for authored material; learner audio is private data and
belongs in Supabase storage with per-user policies, which is the posture
the existing attempt audio bucket already uses.

### 4.3 student_mock_test_section_scores

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `attempt_id` | uuid, not null | Cascade delete. |
| `section_id` | uuid, not null | |
| `raw_correct` | integer | Objective sections. |
| `total_questions` | integer, not null | The denominator that was actually used. |
| `estimated_levels` | text[] | More than one entry when the chart rows overlap. |
| `estimated_label` | text | For example "Level 9 or 10-12". |
| `rubric_result` | jsonb | Writing and Speaking. The per-criterion estimates and evidence. |
| `rubric_prompt_version` | text | Copied from the rubric at scoring time. |
| `scoring_rule_id` | uuid | Which rule produced this. |
| `disclaimer_text` | text, not null | Copied, not joined. |
| `scored_at` | timestamptz, not null, default now() | |

Unique on `(attempt_id, section_id)`.

`estimated_levels` is an array because the band charts overlap. Storing a
single level would make the result claim a precision the chart does not
have.

### 4.4 student_mock_test_final_scores

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `attempt_id` | uuid, unique, not null | Cascade delete. |
| `listening_levels` | text[] | |
| `reading_levels` | text[] | |
| `writing_levels` | text[] | |
| `speaking_levels` | text[] | |
| `listening_label` | text | For example "Level 9 or 10-12". |
| `reading_label` | text | |
| `writing_label` | text | |
| `speaking_label` | text | |
| `disclaimer_text` | text, not null | Copied at computation time. |
| `computed_at` | timestamptz, not null, default now() | |

There is deliberately no overall or average level. CELPIP reports a level
per component and publishes no composite, so producing one would be a
claim no source supports.

---

## 5. Controlled vocabularies

Every list below is a `check` constraint in the draft SQL.

**Test status:** `draft`, `ready_for_review`, `published`, `archived`.

**Section and rubric status:** `draft`, `ready` or `active`.

**Skill:** `listening`, `reading`, `writing`, `speaking`.

**Part type:** `listening_problem_solving`,
`listening_daily_conversation`, `listening_information`,
`listening_news_item`, `listening_discussion`, `listening_viewpoints`,
`reading_correspondence`, `reading_diagram`, `reading_information`,
`reading_viewpoints`, `writing_email`, `writing_survey`, `speaking_task`,
`speaking_image_task`, `speaking_comparison_task`.

**Screen type:** `instruction_text`, `instruction_video`,
`listening_context`, `listening_audio`, `listening_video`,
`listening_question_radio`, `listening_question_dropdown`,
`reading_split`, `writing_task`, `speaking_prep`, `speaking_recording`,
`speaking_option_choice`, `answer_review`, `score_summary`,
`section_end`, `reference_standards`, `transition`.

**Question type:** `single_choice`, `dropdown_sentence_completion`,
`video_listening_choice`, `reading_correspondence_choice`,
`reading_diagram_choice`, `reading_information_choice`,
`reading_viewpoints_choice`, `writing_email_response`,
`writing_survey_response`, `speaking_recorded_response`,
`speaking_image_response`, `speaking_option_response`.

**Media type:** `instruction_video`, `audio_passage`, `audio_question`,
`video_passage`, `image_prompt`, `diagram_image`, `scene_image`,
`reference_image`.

**Timer scope:** `per_question`, `per_screen`, `per_part`, `per_section`,
`prep_timer`, `recording_timer`.

**Timer expiry:** `advance`, `submit_section`, `stop_recording`, `none`.

**Timer source:** `published`, `derived`, `staff-set`.

**Answer key source:** `document`, `answer-image`, `staff-entered`.

**Scoring type:** `objective_correct_incorrect`, `raw_to_band_map`,
`ai_rubric_estimate`, `manual_review`.

**Attempt status:** `in_progress`, `submitted`, `abandoned`.

**Issue severity:** `error`, `warning`. **Issue status:** `open`,
`resolved`.

---

## 6. Row level security posture

Draft policies. Written out as comments in the draft SQL and not applied
anywhere.

| Table | anon | authenticated learner | staff | service role |
| --- | --- | --- | --- | --- |
| `mock_tests` | none | select where `status = 'published'` | full | full |
| `mock_test_sections` | none | select where parent test published | full | full |
| `mock_test_parts` | none | select where parent test published | full | full |
| `mock_test_screens` | none | select where parent test published | full | full |
| `mock_test_questions` | none | select where parent test published | full | full |
| `mock_test_options` | none | select where parent test published | full | full |
| `mock_test_answer_keys` | none | **none** | select | full |
| `mock_test_media_assets` | none | select where parent test published or `mock_test_id` is null | full | full |
| `mock_test_timer_rules` | none | select where parent test published | full | full |
| `mock_test_scoring_rules` | none | select, disclaimer and band map only | full | full |
| `mock_test_ai_rubrics` | none | **none** | select, super_admin writes | full |
| `mock_test_validation_issues` | none | **none** | full | full |
| `student_mock_test_attempts` | none | own rows | none directly | full |
| `student_mock_test_answers` | none | own rows through the attempt | none directly | full |
| `student_mock_test_section_scores` | none | own rows, select only | none directly | full |
| `student_mock_test_final_scores` | none | own rows, select only | none directly | full |

Notes on the three that are not obvious.

**`mock_test_answer_keys` has no learner policy at all.** Not a filtered
policy, none. RLS denies by default when no policy matches, so the
absence is the enforcement. This is the one table where a mistake would
hand a learner the answers, so it does not rely on a `using` clause being
written correctly.

**`mock_test_ai_rubrics` is the same shape** for the same reason: a
learner who could read a rubric row could read the prompt that grades
them.

**Staff access to learner attempts is "none directly".** Staff read
attempt data through server-side code that checks the role and uses the
service role client, not through a client query with a staff policy. That
keeps a single audited path for reading another person's work.

Score rows are select-only for their owner. A learner never writes their
own score. Marking runs server-side with the service role client, which
bypasses RLS by design and stays out of the browser, exactly as
`src/lib/supabase/admin.ts` already documents.

---

## 7. What this blueprint does not decide

Open questions for ADMIN-01 and later, recorded rather than answered.

1. **Versioning depth.** `mock_tests.version` plus copy-on-edit is what
   this blueprint proposes. A full version table would let two published
   versions coexist. Cheap now, expensive to retrofit once attempts
   exist.
2. **A question bank.** Reusing one question across tests would change
   `mock_test_questions` from belonging to a part to being linked to one.
   Not needed for Mock Test 2 and not designed in.
3. **Where learner recordings live.** `recording_path` assumes Supabase
   storage with per-user policies, matching the existing attempt audio
   bucket. Confirm before the first Speaking attempt is saved.
4. **Whether unscored items are used.** `is_scored` makes them possible
   on both parts and questions. Nothing uses it yet.
5. **Enum types against check constraints.** Check constraints are
   proposed. Revisit once the vocabularies stop moving.
6. **Whether `video_listening_choice` survives** as a distinct question
   type or folds into `single_choice`. The workflow document keeps it,
   with the reasoning.
