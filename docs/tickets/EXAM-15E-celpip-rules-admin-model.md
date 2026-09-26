# EXAM-15E - CELPIP Rules Research and Admin-Ready Exam Model

## Goal

Create a researched CELPIP exam rules document, audit the current Listening implementation against those rules, and design the admin-ready mock test builder model.

This is a research, audit, and architecture ticket.

Do not build Reading.
Do not rebuild Listening UI in this ticket.
Do not build the admin panel UI in this ticket.
Do not create database migrations yet.
Do not save answers to Supabase.
Do not change scoring logic.
Do not change answer keys.
Do not change Speaking or Writing AI logic.
Do not build payment.
Do not build live classes.
Do not copy official CELPIP branding into production UI.

## Why this ticket exists

Mock Test 1 Listening was built manually through code tickets.

That was useful for creating the engine:

- exam shell
- locked exam mode
- timer foundation
- media screens
- question screens
- answer review
- score screen
- estimated band card

But production should not require code tickets for every future mock test.

The future direction is an admin panel where Toronto Academy staff can create mock tests through UI:

- add mock test
- add skill sections
- add parts
- add questions
- add answer options
- add correct answers
- add Cloudinary audio links
- add Cloudinary video links
- add image links
- set timers
- publish or unpublish tests

This ticket creates the rulebook and data model before continuing Reading.

## Required official sources to use

Use these official CELPIP sources as the primary references:

1. CELPIP Test Format page
https://www.celpip.ca/take-celpip/test-format/

2. CELPIP Listening Pro Study Pack 2026
https://www.celpip.ca/wp-content/uploads/2026/01/Listening-Pro-Study-Pack-2026.pdf

3. CELPIP Test Results page
https://www.celpip.ca/take-celpip/test-results/

Also inspect project-local sources:

public/Overview and Scoring Descriptors/
mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx
docs/product/
_reference/
mock-tests/

Use the local source documents as the source for our Mock Test 1 content.

Do not invent rules that are not supported by official sources or local source files.

## Required documents to create

Create:

docs/product/celpip-exam-rules-research.md
docs/product/listening-format-audit-and-correction-plan.md
docs/product/admin-mock-test-builder-blueprint.md

## Document 1 - CELPIP exam rules research

Create:

docs/product/celpip-exam-rules-research.md

Include:

1. CELPIP General full test structure
2. Listening structure
3. Reading structure
4. Writing structure
5. Speaking structure
6. Listening part-by-part rules
7. Listening timing rules
8. Listening media rules
9. Listening question type rules
10. Reading part-by-part rules
11. Reading timing rules
12. Writing task rules
13. Speaking task rules
14. Scoring rules for Listening and Reading
15. Scoring descriptor rules for Writing and Speaking
16. Which rules are confirmed
17. Which rules need further confirmation
18. Source links used

Important official facts to capture:

Listening:
- 46-55 minutes
- 38 questions
- Part 1: Listening to Problem Solving, 8 questions
- Part 2: Listening to a Daily Life Conversation, 5 questions
- Part 3: Listening for Information, 6 questions
- Part 4: Listening to a News Item, 5 questions
- Part 5: Listening to a Discussion, 8 questions
- Part 6: Listening to Viewpoints, 6 questions

Reading:
- 43-56 minutes
- 38 questions
- Part 1: Reading Correspondence, 11 questions
- Part 2: Reading to Apply a Diagram, 8 questions
- Part 3: Reading for Information, 9 questions
- Part 4: Reading for Viewpoints, 10 questions

Writing:
- 53 minutes
- Task 1: Writing an Email
- Task 2: Responding to Survey Questions

Speaking:
- 15 minutes
- Task 1: Giving Advice
- Task 2: Talking about a Personal Experience
- Task 3: Describing a Scene
- Task 4: Making Predictions
- Task 5: Comparing and Persuading
- Task 6: Dealing with a Difficult Situation
- Task 7: Expressing Opinions
- Task 8: Describing an Unusual Situation

Listening Parts 1-3:
- multiple-choice questions
- questions appear one by one
- 30 seconds to hear and answer each question
- must answer in order

Listening Parts 4-6:
- sentence completion questions
- all questions appear on the same screen
- set amount of time to answer all questions
- can answer in any order
- still four answer choices per question according to the official study pack

Media:
- audio clips begin automatically
- audio clips are played one time only
- audio cannot be paused

Timing:
- when time is up, the test automatically moves forward
- learners cannot go back to a previous part of the test

Scoring:
- Listening and Reading are computer scored
- each correct answer receives 1 point
- no points deducted for incorrect answers
- blank answers are incorrect
- raw score to CELPIP level mapping is approximate and may vary by test form

Use careful wording:
- estimated practice score
- estimated practice band
- not official CELPIP score

## Document 2 - Listening format audit and correction plan

Create:

docs/product/listening-format-audit-and-correction-plan.md

Compare our current Mock Test 1 Listening implementation against the researched rules.

Audit:

- full Listening route
- Part 1 route
- Part 2 route
- Part 3 route
- Part 4 route
- Part 5 route
- Part 6 route

For each part, document:

1. current route
2. current media behavior
3. current question UI
4. current timing behavior
5. current scoring behavior
6. official-style expected behavior
7. gap level:
   - okay
   - minor polish
   - needs correction
8. recommended correction ticket

Pay special attention to:

Part 4:
- confirm whether our dropdown/sentence-completion UI matches the source and official-style format

Part 5:
- current implementation may show question text and radio options
- official study pack says Parts 4-6 are sentence completion questions
- determine whether Part 5 should be converted to sentence-completion/select style
- do not change UI in this ticket
- document the correction needed

Part 6:
- current implementation may show question text and radio options
- official study pack says Parts 4-6 are sentence completion questions
- determine whether Part 6 should be converted to sentence-completion/select style
- do not change UI in this ticket
- document the correction needed

Important:
Do not assume "dropdown" unless supported by source screenshots or local Mock Test 1 document.
Official source says sentence completion questions with four answer choices. The UI can be dropdown or grouped selectable choices depending on our source screens. Document what our source file supports.

## Document 3 - Admin mock test builder blueprint

Create:

docs/product/admin-mock-test-builder-blueprint.md

Design the future admin panel model.

Goal:
Future mock tests should be created through UI, not by code tickets.

The admin should be able to:

- create a mock test
- name the mock test
- add Listening, Reading, Writing, Speaking sections
- add parts under each section
- choose a part type
- choose a screen flow template
- add instruction text
- use shared instruction videos
- add media links from Cloudinary
- add images
- add questions
- add answer options
- select correct answers
- add answer explanations if needed
- set timer rules
- set scoring maps
- publish or unpublish
- preview before publishing

Define proposed database entities:

- mock_tests
- mock_test_sections
- mock_test_parts
- mock_test_screens
- mock_test_questions
- mock_test_options
- mock_test_answer_keys
- mock_test_media_assets
- mock_test_timer_rules
- mock_test_scoring_rules
- student_mock_test_attempts
- student_mock_test_answers
- student_mock_test_section_scores
- student_mock_test_final_scores

Define question types:

- single_choice
- sentence_completion_choice
- dropdown_sentence_completion
- reading_correspondence_choice
- reading_diagram_choice
- reading_information_choice
- reading_viewpoints_choice
- writing_email
- writing_survey_response
- speaking_recorded_response
- image_based_speaking
- video_based_listening

Define timer types:

- per_question
- per_screen
- per_part
- per_section
- prep_timer
- recording_timer

Define media types:

- instruction_video
- audio_passage
- audio_question
- video_passage
- image_prompt
- diagram_image
- reading_passage
- reference_image

Define scoring types:

- objective_correct_incorrect
- raw_to_band_map
- ai_rubric_estimate
- manual_review

Define admin roles:

- owner
- admin
- editor
- reviewer

Define publishing flow:

- draft
- ready_for_review
- published
- archived

Define validation rules:

- every objective question needs at least one correct answer
- Listening and Reading objective questions should have four answer options unless question type says otherwise
- every media screen needs a valid media URL
- Cloudinary URLs should be validated for format
- required timers must be set
- published test cannot have missing answer keys
- Writing and Speaking tasks need scoring descriptors attached
- estimated score wording must not claim official CELPIP scoring

Also include:
- MVP admin panel scope
- later admin panel scope
- how Mock Test 2 should be created using the model
- which current hardcoded files would eventually become database records

## Required repo inspection

Inspect current files:

src/features/exam-engine/
src/components/exam/
src/app/dashboard/mock-tests/
mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx
public/Overview and Scoring Descriptors/
docs/product/

Document how current code maps to the future admin model.

## Do not implement yet

Do not implement the database schema in this ticket.
Do not implement admin UI in this ticket.
Do not migrate content to database in this ticket.
Do not rewrite the Listening screens in this ticket.
Do not start Reading in this ticket.

## Recommended next tickets to document

At the end of the three documents, recommend the next tickets.

Expected sequence:

EXAM-15F - Listening Part 4-6 Format and Strict Timing Correction
EXAM-16 - Reading Part 1 Prototype
EXAM-17 - Reading Part 1 Review and Score
READING-FULL - Full Reading Section Flow and Estimated Band Score
ADMIN-00 - Admin Mock Test Builder Database Blueprint
ADMIN-01 - Admin Mock Test Builder MVP

Do not create these tickets yet. Just document the sequence.

## Documentation style

Use normal hyphens only.
Do not use em dashes.
Do not use long hyphens.
Use straight quotes only.

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not touch Supabase helpers
- Do not call service role
- Do not change auth
- Do not create migrations
- Do not expose answer keys to client question screens
- Do not save answers to database

## Manual Supabase steps

None.

Do not create migrations.

## Validation

Run:

npm run lint
npm run build

Even though this is mostly documentation, run both to ensure no accidental break.

Search changed docs for:

- long hyphens
- em dashes
- curly quotes

Replace with normal hyphens and straight quotes.

## Done criteria

- docs/product/celpip-exam-rules-research.md exists
- docs/product/listening-format-audit-and-correction-plan.md exists
- docs/product/admin-mock-test-builder-blueprint.md exists
- official CELPIP sources are referenced
- local project files are inspected
- Listening Part 4-6 format gaps are clearly documented
- timer rules are clearly documented
- admin mock test builder model is documented
- future data entities are proposed
- future question types are proposed
- future timer types are proposed
- future scoring types are proposed
- next ticket sequence is documented
- no Reading is built
- no UI changes are made unless needed for broken docs links
- no database migration is created
- no dependencies are installed
- npm run lint passes
- npm run build passes
