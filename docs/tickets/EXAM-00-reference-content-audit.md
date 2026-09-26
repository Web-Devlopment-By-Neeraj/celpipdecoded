# EXAM-00 - Reference Files and Mock Test Content Audit

## Goal

Audit the official screen reference document and Mock Test 1 content document before building the CELPIP-style exam engine.

This ticket is documentation and planning only.

Do not build exam UI.
Do not change speaking logic.
Do not change writing logic.
Do not change AI scoring logic.
Do not change dashboard UI.
Do not change auth.
Do not create Supabase migrations.
Do not delete assets.
Do not move files.
Do not install dependencies unless absolutely required for reading docx content.
Do not use official screenshots as public app images.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Reference files

Expected files:

reference/exam-engine/official-screens/Official Test Explanation with Screenshots.docx

reference/mock-tests/mock-test-1/Mock Test 1 - Sajinlinks.docx

If these files are missing, stop and report that they need to be copied into the repo.

## Important product direction

The exam engine should feel close to the real test flow.

But the production app must be Toronto Academy practice software.

Use the official screenshots as layout and behavior reference only.

Do not embed the screenshot document into the app.
Do not show official screenshots to learners as the live test UI.
Do not use official CELPIP logos as app branding.
Do not claim this is the official CELPIP test.

Use wording like:

- Practice test engine
- CELPIP-style practice
- Toronto Academy practice test
- Practice estimates are not official CELPIP scores

## Audit tasks

Inspect both Word files and document:

1. Official screen sequence

Extract the overall order of screens:

- overview instructional video
- Listening instructions
- Listening instructional video
- Listening parts
- Listening answer review
- Listening score screen
- End of Listening screen
- Reading instructions
- Reading instructional video
- Reading parts
- Reading answer review
- Reading score screen
- End of Reading screen
- Writing instructions
- Writing instructional video
- Writing tasks
- End of Writing screen
- Speaking instructions
- Speaking instructional video
- Speaking tasks
- End of Speaking screen
- Performance standards reference screens

2. Screen types

Identify reusable screen types:

- instructional text screen
- instructional video screen
- listening audio intro screen
- listening question screen
- listening dropdown question screen
- listening answer review screen
- score summary screen
- end-of-section screen
- reading split passage and question screen
- reading diagram screen
- writing task editor screen
- speaking preparation screen
- speaking recording screen
- performance standards reference screen

3. Shared UI patterns

Document common exam UI patterns:

- grey title bar
- test title on left
- timer on top right
- blue Next button
- Back button placement
- white exam canvas
- instruction icon
- two-column layouts
- scrollable panels
- audio or video player area
- selected answer state
- result table with answer key and student answer

4. Mock Test 1 content map

Create a structured map of Mock Test 1:

Listening:

- Part 1 Listening to Problem Solving
- Part 2 Listening to a Daily Life Conversation
- Part 3 Listening for Information
- Part 4 Listening to a News Item
- Part 5 Listening to a Discussion
- Part 6 Listening for Viewpoints

Reading:

- Part 1 Reading Correspondence
- Part 2 Reading to Apply a Diagram
- Part 3 Reading for Information
- Part 4 Reading for Viewpoints

Writing:

- Task 1 Writing an Email
- Task 2 Responding to Survey Questions

Speaking:

- Task 1 Giving Advice
- Task 2 Talking about a Personal Experience
- Task 3 Describing a Scene
- Task 4 Making Predictions
- Task 5 Comparing and Persuading
- Task 6 Dealing with a Difficult Situation
- Task 7 Expressing Opinions
- Task 8 Describing an Unusual Situation

5. Cloudinary asset map

Extract and list all Cloudinary links from Mock Test 1.

Group by:

- listening audio
- listening question audio
- listening video
- listening images
- listening answer explanation images
- reading images
- writing images
- speaking images

Do not download these assets in this ticket.

6. Question type map

Document each question type needed:

- single choice radio
- image answer radio
- dropdown blank
- paragraph matching
- writing textarea
- speaking record response
- answer review row
- score summary

7. Build priority

Recommend the first implementation order.

Expected recommendation:

- EXAM-01 - Exam Engine Screen Shell
- EXAM-02 - Instructional Video Screen
- EXAM-03 - Listening Part 1 Prototype
- EXAM-04 - Listening Result and Answer Review
- EXAM-05 - Reading Part 1 Prototype
- EXAM-06 - Reading Result and Answer Review
- EXAM-07 - Writing Exam-Style UI Adapter
- EXAM-08 - Speaking Exam-Style UI Adapter
- EXAM-09 - Mock Test 1 Flow Assembly

8. Current app integration

Document how this should connect later to existing app areas:

- dashboard
- speaking AI practice
- writing AI practice
- reading and listening coming soon cards
- usage limits
- result history
- AI scoring

Do not implement integration in this ticket.

9. Do-not-change list

Clearly list what should not be touched yet:

- existing speaking AI backend
- existing writing AI backend
- usage access logic
- AI prompts
- dashboard redesign
- Supabase schema
- auth
- payment
- live classes

## Required output files

Create:

docs/product/exam-engine-reference-audit.md

docs/product/mock-test-1-content-map.md

docs/product/exam-engine-screen-types.md

docs/product/exam-engine-ticket-sequence.md

Optional if useful:

reference/mock-tests/mock-test-1/extracted-links.md

reference/mock-tests/mock-test-1/extracted-content-outline.md

## Implementation rule

This is an audit ticket.

Only documentation files should be created or updated.

Do not create React components.
Do not create routes.
Do not create migrations.
Do not download media files.
Do not modify app source code.

## Copyright and branding rule

The official screenshots are for internal reference only.

Do not serve those screenshots to students as app UI.
Do not copy official branding into the product.
Build original Toronto Academy practice screens that follow similar layout and flow.

## Manual Supabase steps

None.

Do not create migrations.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in docs, comments, or prompts. Use normal hyphens only.

## Done criteria

- official screen flow is documented
- reusable screen types are documented
- shared UI patterns are documented
- Mock Test 1 content map is documented
- Cloudinary links are extracted and grouped
- question types are identified
- implementation ticket sequence is recommended
- integration with current app is documented
- do-not-change list is documented
- no app source files are changed
- no React components are created
- no Supabase migration is created
- no media files are downloaded
- npm run lint passes
- npm run build passes
