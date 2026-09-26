# EXAM-13 - Listening Part 6 Prototype

## Goal

Build Mock Test 1 Listening Part 6 prototype.

This ticket should implement Listening Part 6: Listening for Viewpoints.

Part 6 is the final Listening part. It should use the exact Mock Test 1 Part 6 content from the source document.

Do not build the Part 6 answer review screen.
Do not build the Part 6 score screen.
Do not build the full Listening section result.
Do not build Reading.
Do not build Writing.
Do not build Speaking.
Do not save answers to Supabase.
Do not create Supabase migrations.
Do not change existing Speaking AI logic.
Do not change existing Writing AI logic.
Do not change AI scoring prompts.
Do not build payment.
Do not build live classes.
Do not use official screenshots as public UI images.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Source content

Use Mock Test 1 Listening Part 6 from:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

or the extracted documentation created in EXAM-00.

Listening Part 6 details:

- Section name: Listening for Viewpoints
- Final part of the Listening section
- Six multiple-choice questions
- Students choose the best answer for each question
- Use the exact scenario, media link, question text, and options from the Mock Test 1 source document

Use Cloudinary links from the Mock Test 1 source document.

Do not download media files in this ticket.

## Confirmed Part 6 answer key

The user provided the confirmed answer key from the Part 6 answer screenshot.

Store this answer key in the centralized content object, but do not build review or scoring yet.

Correct answers:

Question 1:
approve a plan to redevelop the vacant land.

Question 2:
could put her community at risk.

Question 3:
may be developed into a nature walkway.

Question 4:
compact community with a vibrant local economy.

Question 5:
both economic and community interests can be satisfied.

Question 6:
Mother of two, Eleanor Wentworth, will be disappointed.

Important:

- Match correct answers by exact option text first.
- If punctuation differs, map to the closest existing option text.
- Do not guess if the option text is not present.
- Keep answer key hidden from the question screen.
- Part 6 review and score will be built in the next ticket.

## Required route

Create protected route:

src/app/dashboard/mock-tests/mock-test-1/listening/part-6/page.tsx

This route should render Listening Part 6 prototype.

Add an internal preview link on the dashboard if the internal preview area exists:

Mock Test 1 Listening Part 6 Prototype

Mark it Internal preview.

## Required files to create

Create:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-6.ts
src/features/exam-engine/listening-viewpoints-types.ts
src/features/exam-engine/listening-viewpoints-flow.ts

src/components/exam/listening/ListeningPartSixPrototype.tsx
src/components/exam/listening/ListeningViewpointsScreen.tsx
src/components/exam/listening/ListeningViewpointsQuestionScreen.tsx
src/components/exam/listening/ListeningViewpointsQuestionList.tsx

Create or update shared components only if needed:

src/components/exam/listening/ListeningPartIntroScreen.tsx
src/components/exam/listening/ListeningScenarioScreen.tsx
src/components/exam/listening/ListeningAudioScreen.tsx

Create documentation:

docs/product/listening-part-6-prototype.md

## Flow requirements

Implement a local client-side prototype flow.

Screen order:

1. Part intro screen

Shows:

- Listening for Viewpoints
- You will hear a report or discussion about a community issue.
- Then 6 questions will appear.
- Choose the best answer for each question.

2. Scenario screen

Shows:

- Instructions
- Use the exact Part 6 scenario from the Mock Test 1 source document.
- Next button

3. Audio or media screen

Shows:

- Listen to the following audio.
- native audio or video player depending on the source file
- Next button

4. Question screen

Shows all 6 multiple-choice questions on one screen.

Each question should show:

- question number
- question text
- four radio options
- one selected answer per question

Next should be disabled until all 6 questions have a selected answer.

5. Completion screen

Shows:

- Listening Part 6 complete
- You answered 6 questions
- Continue to answer review, disabled or Coming soon

Do not build Part 6 answer review yet.

## Question content

Use the exact question text and options from the Mock Test 1 source document.

Do not manually invent question wording.

If the source document has unclear wording or missing options, document the issue in:

docs/product/listening-part-6-prototype.md

and stop before guessing.

## Media behavior

Use native HTML media.

Rules:

- no autoplay
- controls visible
- preload metadata
- media URL from Cloudinary
- show fallback text if media cannot load
- do not force one-time playback yet
- do not block Next until media finishes yet
- document this as a later fidelity improvement

## Question behavior

For each question:

- store selected answer in local component state
- preserve selected answers when moving back and forward
- show radio options
- do not show correct answers on this screen
- do not calculate score yet

Next button should be disabled until all 6 questions are answered.

Because this is a prototype, allow Back for testing.

## Visual requirements

Use EXAM-01 shell components.

The media and question screens should feel close to the reference:

- grey top bar
- timer area with Time remaining: 30 seconds on the question screen
- white exam canvas
- compact instruction row
- media player in a clean bordered area
- question list with clear separators
- radio options
- blue Next button
- Back button in bottom bar

Do not use marketing dashboard cards inside the exam canvas.

## Result and answer review

Do not build result page in this ticket.

But prepare local answer state so the next ticket can use it.

Suggested local state:

{
  questionId: selectedOptionId
}

No database save in this ticket.

## Documentation

Create:

docs/product/listening-part-6-prototype.md

Include:

1. Route created
2. Source content used
3. Screen sequence
4. Media link used
5. Question count
6. Radio question behavior
7. Answer key stored
8. What is interactive
9. What is intentionally not built
10. Known fidelity gaps
11. How the next ticket should continue

## Known fidelity gaps to document

Document these as intentional for now:

- media does not autoplay
- media can be replayed
- Next does not wait for media completion
- timer is static
- answers are not saved to database
- result page is not built
- Part 6 answer review is not built
- full Listening section result is not built

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not touch API routes
- Do not touch Supabase helpers
- Do not call service role
- Do not change auth
- Do not create migrations

## Manual Supabase steps

None.

Do not create migrations.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, docs, comments, or prompts. Use normal hyphens only.

## Done criteria

- Listening Part 6 prototype route exists
- Listening Part 6 content is typed and centralized
- Listening for Viewpoints scenario appears
- media is represented
- 6 multiple-choice questions are represented
- selected answers are stored locally
- Next is disabled until all 6 questions are answered
- completion screen exists
- Part 6 answer key is stored but not shown on the question screen
- dashboard internal preview link exists if internal preview section exists
- no answer review is built
- no score page is built
- no full Listening result is built
- no database save is built
- no official screenshots are embedded
- no official CELPIP branding is copied
- existing Speaking and Writing AI flows are untouched
- no Supabase migration is created
- no dependencies are installed
- docs/product/listening-part-6-prototype.md exists
- npm run lint passes
- npm run build passes
