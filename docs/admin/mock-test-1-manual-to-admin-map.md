# Mock Test 1, manual content to admin model map (ADMIN-00)

What the hardcoded Mock Test 1 becomes if it is loaded into the admin
data model described in
`docs/admin/mock-test-builder-database-blueprint.md`.

Nothing moves in ADMIN-00. This is the migration plan, written while the
hardcoded content is still the only content, so that whoever does the
move later has a row count to check their work against.

Read alongside:

- `docs/admin/mock-test-builder-workflow.md` - the workflow that would
  produce these rows.
- `docs/product/mock-test-1-content-map.md` - the source document map.
- `mock-tests/mock-test-1/extracted-links.md` - the asset list.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

---

## 1. Totals

What Mock Test 1 becomes, in rows.

| Entity | Rows | Where they come from |
| --- | --- | --- |
| `mock_tests` | 1 | The four section files agree on `testId: "mock-test-1"`. |
| `mock_test_sections` | 4 | Listening, Reading, Writing, Speaking. |
| `mock_test_parts` | 20 | 6 Listening, 4 Reading, 2 Writing, 8 Speaking. |
| `mock_test_screens` | materialised | Produced by the part type templates, not counted here. See section 7. |
| `mock_test_questions` | 86 | 38 Listening, 38 Reading, 2 Writing, 8 Speaking. |
| `mock_test_options` | 309 | See section 8. |
| `mock_test_option_sets` | 1 | Reading Part 3's A to E list. |
| `mock_test_answer_keys` | 76 | 38 Listening, 38 Reading. None for Writing or Speaking. |
| `mock_test_media_assets` | 46 | 34 Listening, 1 Reading, 2 Writing, 9 Speaking. |
| `mock_test_timer_rules` | 45 | See section 11. |
| `mock_test_scoring_rules` | 4 | One per section. |
| `mock_test_ai_rubrics` | 2 | Writing and Speaking. |
| `mock_test_validation_issues` | 0 expected | The known gaps in section 13 would appear as warnings. |
| `student_mock_test_*` | 0 | Nothing is saved today. |

The `mock_tests` row itself:

| Column | Value |
| --- | --- |
| `slug` | `mock-test-1` |
| `title` | "Mock Test 1" |
| `status` | `published` |
| `version` | 1 |
| `source_note` | `mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx` |

---

## 2. Listening section

Source: `src/features/exam-engine/mock-tests/mock-test-1/full-listening-section.ts`
and the six part files beside it.

### The section row

| Column | Value | Current source |
| --- | --- | --- |
| `skill` | `listening` | |
| `position` | 1 | |
| `title` | "Mock Test 1 - Listening Test" | `SECTION_TITLE` in the section file |
| `instruction_text`, `instruction_lines` | The section instruction copy | `listening-section-copy.ts` |
| `instruction_video_asset_id` | The shared Listening clip | `getInstructionalVideoAsset("listening")` |
| `scoring_rule_id` | The Listening band map | `LISTENING_BAND_CHART` |

The instruction video is the clearest case for a nullable
`mock_test_id` on `mock_test_media_assets`. It is registered once per
skill in `instructional-video-assets.ts` and reached for by the section,
not written into it, so it becomes a shared asset row with a null
`mock_test_id` that Mock Test 2 points at without duplication.

### The six part rows

| Part | `part_type` | Questions | `question_type` | Media |
| --- | --- | --- | --- | --- |
| 1 Problem Solving | `listening_problem_solving` | 8 | `single_choice` | 3 conversation clips, 8 question clips, 1 context image |
| 2 Daily Life Conversation | `listening_daily_conversation` | 5 | `single_choice` | 1 conversation clip, 5 question clips |
| 3 Information | `listening_information` | 6 | `single_choice` | 1 conversation clip, 6 question clips |
| 4 News Item | `listening_news_item` | 5 | `dropdown_sentence_completion` | 1 audio clip |
| 5 Discussion | `listening_discussion` | 8 | `video_listening_choice` | 1 video |
| 6 Viewpoints | `listening_viewpoints` | 6 | `dropdown_sentence_completion` | 1 audio clip |

38 questions, which is what `LISTENING_BAND_CHART_TOTAL` expects and what
validation rule 5 would check.

Part 1 is the part that justifies `mock_test_screens` existing at all.
Its content file groups eight questions under three conversation
sections, so the screen run is clip, Q1, Q2, clip, Q3, Q4, Q5, clip, Q6,
Q7, Q8. A flat question list could not express it.

Parts 4 and 6 use `text_before` and `text_after`, because their items are
incomplete statements with a dropdown at the blank. Part 4's blanks all
end their statement, so every Part 4 question sets `text_before` and
leaves `text_after` null; Parts 6 has blanks mid sentence and sets both.
That is exactly the nullable-column pattern the blueprint describes, and
it is why one questions table can hold what four TypeScript content types
hold today.

Part 5 is currently written as eight full multiple-choice questions
rather than as sentence completion. It maps cleanly onto
`video_listening_choice`. Whether the format is right is a content
question, not a schema question, and it is written up in
`docs/product/listening-format-audit-and-correction-plan.md`.

---

## 3. Reading section

Source: `src/features/exam-engine/mock-tests/mock-test-1/reading-section.ts`
and the four part files.

### The section row

| Column | Value |
| --- | --- |
| `skill` | `reading` |
| `position` | 2 |
| `title` | "Mock Test 1 - Reading Test" |
| `instruction_video_asset_id` | null |
| `scoring_rule_id` | The Reading band map |

`instruction_video_asset_id` is null on purpose. No Reading clip is
registered in `instructional-video-assets.ts`, and the section file says
so rather than inventing one. A nullable column is the right way to carry
that.

### The four part rows

| Part | `part_type` | Questions | `question_type` | Notes |
| --- | --- | --- | --- | --- |
| 1 Correspondence | `reading_correspondence` | 11 | `reading_correspondence_choice` | Letter passage, 6 questions about it and 5 blanks inside a response |
| 2 Diagram | `reading_diagram` | 8 | `reading_diagram_choice` | 1 brochure image, 5 blanks inside an email and 3 questions |
| 3 Information | `reading_information` | 9 | `reading_information_choice` | Five lettered paragraphs, shared A to E option set |
| 4 Viewpoints | `reading_viewpoints` | 10 | `reading_viewpoints_choice` | Article passage, blanks inside two comments |

38 questions, matching `READING_BAND_CHART_TOTAL`.

Three mapping notes.

**Passages are `mock_test_parts` columns, not media.** A Reading passage
has a label, a heading, paragraphs and sometimes a sign-off, and Part 1's
content file carries all four. They become `passage_label`,
`passage_heading`, `passage_paragraphs` and `passage_sign_off`. Holding a
passage as an image would make it unselectable and unreadable by
assistive technology, so no Reading passage becomes a media asset.

**Part 3 is the reason `mock_test_option_sets` exists.** Its nine
statements all draw from the same five options, A to D naming the
lettered paragraphs plus E for "Not given in any of the above
paragraphs". The content file already builds them from one shared
constant. In the database that becomes one option set with five rows,
referenced by the part and by each of the nine questions, rather than 45
duplicated option rows that have to be kept in sync.

**Part 2's brochure is the only Reading media asset in the test.** One
`diagram_image`, referenced not re-hosted, exactly as it is today.

---

## 4. Writing section

Source: `src/features/exam-engine/mock-tests/mock-test-1/writing-section.ts`.

### The section row

| Column | Value |
| --- | --- |
| `skill` | `writing` |
| `position` | 3 |
| `title` | "Mock Test 1 - Writing Test" |
| `estimated_duration_seconds` | 3180, the published 53 minutes |
| `scoring_rule_id` | An `ai_rubric_estimate` rule pointing at the Writing rubric |

### The two task rows

| Task | `part_type` | `question_type` | Word target | Timer | Options |
| --- | --- | --- | --- | --- | --- |
| 1 Writing an Email | `writing_email` | `writing_email_response` | 150 to 200 | 1620 seconds, published | none |
| 2 Responding to Survey Questions | `writing_survey` | `writing_survey_response` | 150 to 200 | 1560 seconds, derived | 2 |

Field by field for Task 1, since it is the pattern:

| Current field | Becomes |
| --- | --- |
| `taskTitle` | `mock_test_parts.title` |
| `situationInstruction` | `mock_test_parts.scenario_instruction` |
| `situationParagraphs` | `mock_test_parts.scenario_text` |
| `situationHeading` (Task 2) | `mock_test_parts.scenario_heading` |
| `promptInstruction` | `mock_test_questions.prompt` |
| `promptRequirements` | `mock_test_parts.prompt_requirements` |
| `wordTarget` | `mock_test_parts.word_min`, `word_max` |
| `editorPlaceholder` | `mock_test_parts.editor_placeholder` |
| `options` (Task 2) | 2 `mock_test_options` rows, Option A and Option B |
| `promptImage` | 1 `mock_test_media_assets` row, `image_prompt`, with its alt text, width, height and caption |
| `timer` | 1 `mock_test_timer_rules` row, scope `per_part` |

Two things this mapping makes visible.

**Task 2's options are content, not an answer key.** The learner picks
Option A or Option B and then writes about the choice. There is no
correct option and no `mock_test_answer_keys` row, which is what
validation rule 11 checks: a rubric scored task with a key is a modelling
error.

**The prompt text is the migration, not the image.** Both Writing prompts
arrived in the source document as pictures and EXAM-25 transcribed them,
because an image-only prompt cannot be read by assistive technology and
cannot be sent to an AI reviewer. The transcription is what becomes the
prompt columns; the image goes to `mock_test_media_assets` so the
transcription can still be checked against the original.

---

## 5. Speaking section

Source: `src/features/exam-engine/mock-tests/mock-test-1/speaking-section.ts`.

### The section row

| Column | Value |
| --- | --- |
| `skill` | `speaking` |
| `position` | 4 |
| `title` | "Mock Test 1 - Speaking Test" |
| `estimated_duration_seconds` | 840, the sum of the sixteen windows |
| `scoring_rule_id` | An `ai_rubric_estimate` rule pointing at the Speaking rubric |

### The eight task rows

| Task | Title | `part_type` | Visuals | Prep | Response |
| --- | --- | --- | --- | --- | --- |
| 1 | Giving Advice | `speaking_task` | none | 30 | 90 |
| 2 | Talking about a Personal Experience | `speaking_task` | none | 30 | 60 |
| 3 | Describing a Scene | `speaking_image_task` | 1 scene | 30 | 60 |
| 4 | Making Predictions | `speaking_image_task` | 1 scene | 30 | 60 |
| 5 | Comparing and Persuading | `speaking_comparison_task` | option cards | 60 | 60 |
| 6 | Dealing with a Difficult Situation | `speaking_task` | none | 60 | 60 |
| 7 | Expressing Opinions | `speaking_task` | none | 30 | 90 |
| 8 | Describing an Unusual Situation | `speaking_image_task` | 1 scene | 30 | 60 |

Eight questions, one `speaking_recorded_response`, `speaking_image_response`
or `speaking_option_response` each. No options in the marking sense, no
answer keys.

Task 5 is the one that shapes the schema. Its option cards each carry a
picture and a caption, and the learner picks one before recording. Those
become `mock_test_options` rows with an `image_asset_id`, which is why
`mock_test_options` has that column at all.

The images are Cloudinary crops of source screenshots: the file carries
seven `url` references drawn from five distinct source files, because
Tasks 3, 4 and 8 crop one scene each and Task 5 crops several option
cards out of two screenshots. In the admin model each crop is its own
`mock_test_media_assets` row with the delivery URL as stored, since the
crop is part of the URL. The nine source screenshots listed in
`extracted-links.md` are the asset count for the section as a whole.

---

## 6. Media links

Where every Mock Test 1 asset lands. All 46 are Cloudinary URLs on
`dkvsshy7n`, referenced and never re-hosted, which is the policy the
admin media workflow keeps.

| Section | Assets | `media_type` breakdown |
| --- | --- | --- |
| Listening | 34 | 5 `audio_passage` conversation clips, 19 `audio_question` clips, 3 part clips of which 1 is a `video_passage`, 1 `scene_image` context picture, 6 `reference_image` answer sheets |
| Reading | 1 | 1 `diagram_image`, the Part 2 brochure |
| Writing | 2 | 2 `image_prompt` source prompts |
| Speaking | 9 | 9 `image_prompt` source screenshots, delivered as crops |
| Shared | 1 or more | The Listening instruction video, `mock_test_id` null |

Two details that matter to the migration:

- **Audio is served under the video resource type.** Every Mock Test 1
  mp3 URL contains `/video/upload/`, because that is how Cloudinary
  delivers audio. The URL format validation in the media workflow must
  not flag it. This is worth stating because it looks exactly like a
  mistake.
- **The answer explanation images are `reference_image`, not question
  media.** Six of them, one per Listening part, currently held as
  `answerExplanationImageUrl` on the part. They become
  `mock_test_parts.answer_explanation_asset_id`. They show the published
  answers, so they are only rendered after a section is submitted, and
  never on a question screen.

---

## 7. Screens

Not counted, on purpose. The screen run is produced by the flow builders
today and is not written down anywhere as a list, and it differs per
part. Listening Part 1 alone materialises an intro, a scenario, three
conversation screens, eight question screens and the transitions between
them.

The mapping is by part type, not by row:

| Part type | Materialises |
| --- | --- |
| `listening_problem_solving` | intro, context, then clips and question screens interleaved |
| `listening_daily_conversation` and `listening_information` | intro, context, clip, then one question screen per question |
| `listening_news_item`, `listening_discussion`, `listening_viewpoints` | intro, context, media, one question screen holding the whole set |
| `reading_*` | intro, one `reading_split` screen holding the passage and every question |
| `writing_email` and `writing_survey` | intro, one `writing_task` screen |
| `speaking_task` and `speaking_image_task` | intro, `speaking_prep`, `speaking_recording` |
| `speaking_comparison_task` | intro, `speaking_option_choice`, `speaking_prep`, `speaking_recording` |

Each section additionally owns its instruction screen, its transitions,
its answer review, its score summary and its end screen. Those are
section-level screens, which is how the four section files already treat
them.

---

## 8. Objective answer keys

76 `mock_test_answer_keys` rows, and not one more. Writing and Speaking
have none.

| Section | Keys | `source` | Where the value comes from today |
| --- | --- | --- | --- |
| Listening Part 1 | 8 | `answer-image` | `listeningPart1AnswerKey` |
| Listening Part 2 | 5 | `answer-image` | `listeningPart2AnswerKey` |
| Listening Part 3 | 6 | `answer-image` | `listeningPart3AnswerKey` |
| Listening Part 4 | 5 | `answer-image` | `listeningPart4AnswerKey` |
| Listening Part 5 | 8 | `answer-image` | `listeningPart5AnswerKey` |
| Listening Part 6 | 6 | `answer-image` | `listeningPart6AnswerKey` |
| Reading Part 1 | 11 | `document` | `readingPart1AnswerKey` |
| Reading Part 2 | 8 | `document` | `readingPart2AnswerKey` |
| Reading Part 3 | 9 | `document` | `readingPart3AnswerKey` |
| Reading Part 4 | 10 | `document` | `readingPart4AnswerKey` |

Every one of the 38 Listening keys is recorded today as read off an
answer screenshot, and every one of the 38 Reading keys as read from the
source document text. That distinction already exists in the code as a
`source` field on each entry, and `mock_test_answer_keys.source` is where
it goes. It is not decoration: an `answer-image` key is a key somebody
read off a picture, and a future reviewer needs to know which ones those
are.

### Options

309 `mock_test_options` rows.

| Where | Rows | Working |
| --- | --- | --- |
| Listening | 152 | 38 questions at 4 options each |
| Reading Parts 1, 2 and 4 | 116 | 29 questions at 4 options each |
| Reading Part 3 | 5 | One shared option set, A to E, used by 9 questions |
| Writing Task 2 | 2 | Option A and Option B, content rather than answers |
| Speaking Task 5 | 34 | The option cards across the task's choice screens |

The Reading Part 3 line is the saving: 5 rows where a per-question model
would need 45. The Speaking Task 5 count is the least certain figure in
this document, because the task's option cards are laid out across
several screens in the current content file rather than as one flat list,
and the exact row count depends on how the comparison template
materialises them. It is flagged rather than asserted.

### The key stripping rule survives the move

The current build strips keys with `withoutListeningSectionAnswerKeys`
and `withoutReadingSectionAnswerKeys` before content reaches the browser,
and marks inside server actions where the keys still are. In the database
model the same guarantee comes from the schema: options carry no
`is_correct` column, so a learner query cannot pick up a key even by
accident, and `mock_test_answer_keys` has no learner RLS policy at all.

---

## 9. AI rubrics

Two `mock_test_ai_rubrics` rows.

### Writing rubric

| Column | Value | Current source |
| --- | --- | --- |
| `skill` | `writing` | |
| `criteria` | Content/Coherence, Vocabulary, Readability, Task Fulfillment | `WRITING_MOCK_CRITERIA` |
| `task_checklists` | Keyed `email` and `survey-response` | The two checklists in `writing-mock-evaluation-prompt.ts` |
| `prompt_version` | `writing-v1` | New. Nothing versions the prompt today. |
| `model_settings` | Model name only | `OPENAI_WRITING_MODEL`, defaulting to a small scoring model |

### Speaking rubric

| Column | Value | Current source |
| --- | --- | --- |
| `skill` | `speaking` | |
| `criteria` | Content/Coherence, Vocabulary, Listenability, Task Fulfillment | `speaking-mock-evaluation-schema.ts` |
| `audio_notes` | The audio-first judging rules | `speaking-mock-evaluation-prompt.ts` |
| `timing_checks` | What a short response against its window means | Same file |
| `prompt_version` | `speaking-v1` | New. |
| `model_settings` | Scoring model and transcription model | `OPENAI_SCORING_MODEL`, `OPENAI_TRANSCRIPTION_MODEL` |

Three notes on the migration.

**The task type is derived, not stored, today.** The Writing prompt
builder decides whether a task is an email or a survey response by
looking at whether it offers options. In the admin model `part_type`
already says which it is, so the checklist can be selected from the part
type instead of inferred. That is a simplification the move enables, and
the derived helper can go once nothing calls it.

**Model names move into the rubric row. The API key does not.**
`OPENAI_API_KEY` stays in the server environment. A rubric row names a
model; it never carries a credential.

**Nothing is versioned today, and that is the gap the move closes.** Both
prompt builders are code, so a prompt change silently changes every
result produced afterwards with no way to tell them apart.
`prompt_version` stamped onto each stored result fixes that, and it is
the one field in the rubric mapping with no existing source.

---

## 10. Section scoring

Four `mock_test_scoring_rules` rows.

| Section | `scoring_type` | `total_questions` | `band_map` | `ai_rubric_id` |
| --- | --- | --- | --- | --- |
| Listening | `raw_to_band_map` | 38 | The nine-row Listening chart | null |
| Reading | `raw_to_band_map` | 38 | The nine-row Reading chart | null |
| Writing | `ai_rubric_estimate` | null | null | Writing rubric |
| Speaking | `ai_rubric_estimate` | null | null | Speaking rubric |

The Listening band map, as rows of `{ level, min_correct, max_correct }`:

| Level | Min | Max |
| --- | --- | --- |
| 10-12 | 35 | 38 |
| 9 | 33 | 35 |
| 8 | 30 | 33 |
| 7 | 27 | 31 |
| 6 | 22 | 28 |
| 5 | 17 | 23 |
| 4 | 11 | 18 |
| 3 | 7 | 12 |
| M-2 | 0 | 7 |

The Reading band map:

| Level | Min | Max |
| --- | --- | --- |
| 10-12 | 33 | 38 |
| 9 | 31 | 33 |
| 8 | 28 | 31 |
| 7 | 24 | 28 |
| 6 | 19 | 25 |
| 5 | 15 | 20 |
| 4 | 10 | 16 |
| 3 | 8 | 11 |
| M-2 | 0 | 7 |

**The overlaps are the point and must be copied exactly.** A raw
Listening score of 33 falls on both the level 9 row and the level 8 row,
and the honest rendering is "Level 8 or 9". The current formatters
already produce that and `student_mock_test_section_scores.estimated_levels`
is an array so the result can hold it. Tidying the rows into
non-overlapping ranges during the migration would be a silent change to
what every practice score means.

Every one of the four rules needs `disclaimer_text`, and the schema makes
it `not null` so the migration cannot skip it.

---

## 11. Timers

45 `mock_test_timer_rules` rows.

| Scope | Rows | Target | Value | `source` |
| --- | --- | --- | --- | --- |
| `per_question` | 19 | Listening Parts 1 to 3 questions | 30 seconds | `published` |
| `per_screen` | 3 | Listening Parts 4, 5, 6 question screens | 210, 240, 300 seconds | `derived` |
| `per_part` | 4 | Reading Parts 1 to 4 | 660, 540, 600, 780 seconds | `published` |
| `per_part` | 2 | Writing Tasks 1 and 2 | 1620, 1560 seconds | `published`, `derived` |
| `prep_timer` | 8 | Speaking Tasks 1 to 8 | 30 or 60 seconds | `published` |
| `recording_timer` | 8 | Speaking Tasks 1 to 8 | 60 or 90 seconds | `published` |
| `per_section` | 1 | Listening section | not set today | |

The `per_section` row is the one that does not exist yet. Nothing in the
current build enforces a section total, so there is nothing to migrate.
It is listed because validation rule 22 would want one, and because a
section without one cannot check that its parts fit inside it.

Three properties of the current timers that the schema is built to keep:

**`source` and a note travel with every value.** Every timer in the tree
today carries both. The Listening Parts 4 to 6 windows are derived as a
part total minus a clip length, and each one records the arithmetic. The
Writing Task 2 window is the published 53 minute section allowance minus
the published 27 minutes for Task 1, and it says so. Reading Part 1's
note even records a one minute disagreement between two sources and which
one was preferred. `mock_test_timer_rules.source_note` is where all of
that goes, and the check constraint makes a derived value without a note
impossible.

**Two thresholds, not one.** A 30 second question window turns amber at
10 seconds and red at 5. A Reading part uses 60 and 20. A Writing task
uses 300 and 60. Those are three genuinely different needs, which is why
`warning_at_seconds` and `urgent_at_seconds` are per-rule columns rather
than engine defaults.

**`on_expire` has no current source, because nothing expires.** Every
clock in the build today reaches zero and stops there: the countdown hook
accepts an expiry handler and no screen passes one. So every migrated row
gets `on_expire` chosen deliberately rather than copied, and `advance` is
the sensible default for a question or screen window, `stop_recording`
for a Speaking recording timer.

---

## 12. Student attempts

Nothing to map. Mock Test 1 saves no attempt, no answer and no score
today. Marking happens in server actions, the result is rendered, and it
is gone when the page is closed.

The four attempt tables are therefore new construction rather than a
migration, and they are out of scope for ADMIN-01. What the mapping does
say is what the first attempt write will need:

- an attempt row against `mock_test_id`, not the slug, so a later version
  does not rewrite history;
- an answer row per question including the blanks, so "not reached" and
  "reached and left blank" stay distinguishable;
- a section score row carrying its own `disclaimer_text` and an array of
  estimated levels;
- for Speaking, a storage path rather than a Cloudinary URL, because
  learner audio is private data.

---

## 13. Known gaps that would surface as validation issues

Loading Mock Test 1 into the model would produce these, and none of them
is a schema problem.

| Gap | Rule | Severity |
| --- | --- | --- |
| No `per_section` timer on any section | 19 | error, once section timers are required |
| No `on_expire` behaviour is defined anywhere today | 20 | error |
| Listening Part 5 is written as full questions where the current official format describes sentence completion | none, it is a content decision | not a validation issue |
| Reading Part 1's window disagrees between two sources by one minute | 21, satisfied by the note already written | warning at most |
| No prompt version exists for either rubric | none yet | new field, no existing value |

The first two are the honest finding of this mapping exercise: the
content migrates cleanly, and the parts that do not migrate cleanly are
the parts the engine has not implemented yet.
