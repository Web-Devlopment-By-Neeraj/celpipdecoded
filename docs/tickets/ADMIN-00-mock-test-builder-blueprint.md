# ADMIN-00 - Mock Test Builder Workflow Blueprint

## Goal

Design the admin workflow and database blueprint for creating and managing CELPIP mock tests.

This is the first admin workflow ticket after building the learner-side mock test flows for:

- Listening
- Reading
- Writing
- Speaking

This ticket should define the admin system before building the UI.

Do not build the admin UI in this ticket.
Do not create production database migrations yet unless explicitly marked as draft.
Do not modify learner mock test routes.
Do not change Listening, Reading, Writing, or Speaking flows.
Do not save student attempts yet.
Do not build analytics.
Do not build payments.
Do not build live classes.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

Admin should help staff create practice mock tests.

Use wording like:

- mock test
- practice test
- estimated level
- practice score
- AI-supported feedback
- not an official CELPIP score

Do not say:

- official CELPIP score
- guaranteed score
- official result
- pass guarantee

## Why this ticket exists

The learner-side Mock Test 1 was manually coded first to prove the exam engine.

Now admin needs to make that structure editable.

Admin should eventually allow Toronto Academy staff to build Mock Test 2, Mock Test 3, etc. without changing code.

## Admin roles

Define the intended admin roles:

1. Super admin
- manage all mock tests
- publish/unpublish
- edit scoring rules
- edit AI rubric prompts
- manage media links
- preview all tests

2. Staff admin
- create/edit draft mock tests
- add questions
- add media links
- preview drafts
- cannot change critical scoring/rubric settings unless allowed

3. Student
- cannot access admin
- can only take published tests

Do not implement roles yet unless a current auth/role pattern already exists and can be documented safely.

## Admin workflow to define

Document the full workflow:

1. Create mock test

Admin enters:

- test title
- description
- skill sections included
- status: draft or published
- version
- internal notes

2. Add sections

Supported sections:

- Listening
- Reading
- Writing
- Speaking

Each section can have:

- title
- instructions
- estimated duration
- section order
- scoring type
- publish status

3. Add parts

Examples:

Listening:
- Part 1 Problem Solving
- Part 2 Daily Life Conversation
- Part 3 Information
- Part 4 News Item
- Part 5 Discussion
- Part 6 Viewpoints

Reading:
- Part 1 Correspondence
- Part 2 Diagram or Information
- Part 3 Information
- Part 4 Viewpoints

Writing:
- Task 1 Email
- Task 2 Survey Response

Speaking:
- Task 1-8

Each part can have:

- title
- instructions
- order
- timer type
- prep time
- response time
- media links
- question count

4. Add screens

Screens may include:

- intro screen
- instruction screen
- audio screen
- video screen
- passage screen
- question screen
- writing editor screen
- speaking recording screen
- transition screen
- score screen
- review screen

5. Add media

Admin can add:

- audio URL
- video URL
- image URL
- thumbnail URL
- alt text
- transcript if available
- internal media notes

Media should support Cloudinary links first.

Do not upload files in this ticket.

6. Add questions

Question types should include:

- single choice
- dropdown sentence completion
- reading correspondence choice
- reading information choice
- reading viewpoints choice
- writing email response
- writing survey response
- speaking recorded response
- visual speaking prompt
- video listening prompt

7. Add options

For objective questions:

- option label
- option text
- display order

8. Add answer keys

For Listening and Reading:

- correct option
- explanation if available
- score value
- answer key visibility must be admin-only

Answer keys must never be sent to learner question screens.

9. Add AI rubric settings

For Writing:

- criteria: Content/Coherence, Vocabulary, Readability, Task Fulfillment
- task-specific checklist
- scoring prompt version
- model settings

For Speaking:

- criteria: Content/Coherence, Vocabulary, Listenability, Task Fulfillment
- audio-first notes
- timing checks
- scoring prompt version
- model settings

10. Preview test

Admin should be able to preview:

- full mock test
- section only
- part only
- question screen
- score/review behavior

11. Publish test

Admin can publish only if required validation passes.

Validation examples:

- test has at least one section
- objective questions have answer keys
- writing tasks have prompts
- speaking tasks have prompts
- media links are present where required
- timers are set
- published test has no missing required content

## Database blueprint

Design database tables for admin builder.

Required entities to define:

1. mock_tests
2. mock_test_sections
3. mock_test_parts
4. mock_test_screens
5. mock_test_questions
6. mock_test_options
7. mock_test_answer_keys
8. mock_test_media_assets
9. mock_test_timer_rules
10. mock_test_scoring_rules
11. mock_test_ai_rubrics
12. mock_test_validation_issues
13. student_mock_test_attempts
14. student_mock_test_answers
15. student_mock_test_section_scores
16. student_mock_test_final_scores

Important:
This ticket should produce a database blueprint and draft SQL only.
Do not apply the SQL to hosted Supabase yet unless the user explicitly approves in a later ticket.

## Draft SQL

Create a draft SQL file:

docs/admin/mock-test-builder-draft-schema.sql

This file should include:

- table definitions
- primary keys
- foreign keys
- useful indexes
- draft RLS notes as comments
- draft enums or check constraints
- created_at and updated_at fields
- status fields where needed

Mark it clearly as DRAFT.

Do not place it inside the migrations folder yet.

## Admin UI workflow document

Create:

docs/admin/mock-test-builder-workflow.md

Include:

1. Admin dashboard overview
2. Create mock test workflow
3. Section builder workflow
4. Part builder workflow
5. Media workflow
6. Objective question workflow
7. Writing task workflow
8. Speaking task workflow
9. Answer key workflow
10. AI rubric workflow
11. Preview workflow
12. Publish validation workflow
13. Student attempt save workflow
14. What ADMIN-01 should build first

## Admin MVP scope

Define the smallest practical ADMIN-01 MVP.

ADMIN-01 should probably build:

- admin route protection
- admin mock test list
- create mock test draft
- edit mock test basic details
- create sections
- create parts
- add simple objective questions
- add options
- add answer key
- preview draft content

Do not include in ADMIN-01 MVP:

- drag and drop
- advanced analytics
- full student attempt history
- payments
- file uploads
- bulk import
- AI rubric editor
- complex permissions

## Existing manually coded mock test mapping

Create:

docs/admin/mock-test-1-manual-to-admin-map.md

Map current hardcoded Mock Test 1 structure into the proposed admin model.

Include:

- Listening section
- Reading section
- Writing section
- Speaking section
- where media links fit
- where objective answer keys fit
- where AI rubrics fit
- where timers fit

This helps migrate hardcoded Mock Test 1 into admin data later.

## Security requirements

Document:

- admin routes must be protected
- answer keys must be admin-only
- AI prompts/rubrics should not be public learner data
- service role key must not be exposed to client
- media URLs can be public if already public Cloudinary links
- student attempt data must be private
- draft tests should not appear to students
- published tests only should appear in learner dashboard

## Documentation to create

Create:

docs/admin/mock-test-builder-workflow.md
docs/admin/mock-test-builder-database-blueprint.md
docs/admin/mock-test-builder-draft-schema.sql
docs/admin/mock-test-1-manual-to-admin-map.md
docs/product/admin-workflow-next-steps.md

## Validation

Run:

npm run lint
npm run build

Even if this is mostly docs, the repo must still build.

Search changed files for:

- long hyphens
- em dashes
- curly quotes

Replace with normal hyphens and straight quotes.

## Done criteria

- Admin workflow document exists
- Admin database blueprint exists
- Draft SQL file exists
- Manual Mock Test 1 to admin model map exists
- Admin next steps document exists
- ADMIN-01 MVP scope is clearly defined
- No production migration is created
- No Supabase SQL is applied
- No learner route is changed
- No database save is added
- No admin UI is built yet
- Existing Listening route still builds
- Existing Reading route still builds
- Existing Writing route still builds
- Existing Speaking route still builds
- npm run lint passes
- npm run build passes
