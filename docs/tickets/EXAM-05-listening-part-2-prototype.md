# EXAM-05 - Listening Part 2 Prototype

## Goal

Build Mock Test 1 Listening Part 2 prototype.

This ticket should implement Listening Part 2: Listening to a Daily Life Conversation.

Do not build Listening Part 3.
Do not build Listening Parts 4 to 6.
Do not build the full Listening section.
Do not build Reading.
Do not build Writing.
Do not build Speaking.
Do not build the Part 2 answer review screen.
Do not build the Part 2 score screen.
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

Use Mock Test 1 Listening Part 2 from:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

or the extracted documentation created in EXAM-00.

Listening Part 2 details:

- Section name: Listening to a Daily Life Conversation
- Scenario: telephone conversation between a woman and a customer
- One conversation audio file
- Five question audio files
- Five questions total
- Students choose one answer per question

Use Cloudinary links from the Mock Test 1 source document.

Do not download media files in this ticket.

## Confirmed Part 2 answer key

The user provided the confirmed answer key from the Part 2 answer screenshot.

Store this answer key in the centralized content object, but do not build review or scoring yet.

Correct answers:

Question 1:
a newspaper subscription

Question 2:
Manaz was a customer in the past.

Question 3:
suspicious

Question 4:
She would like to call him by his name.

Question 5:
a selection of articles

Important:

- Match correct answers by exact option text first.
- If punctuation differs, map to the closest existing option text.
- Do not guess if the option text is not present.
- Keep answer key hidden from the question screens.
- Part 2 review and score will be built in EXAM-06.

## Required route

Create protected route:

src/app/dashboard/mock-tests/mock-test-1/listening/part-2/page.tsx

This route should render Listening Part 2 prototype.

Add an internal preview link on the dashboard if the internal preview area exists:

Mock Test 1 Listening Part 2 Prototype

Mark it Internal preview.

## Required files to create

Create:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-2.ts

src/components/exam/listening/ListeningPartTwoPrototype.tsx

Create or update shared components only if needed:

src/components/exam/listening/ListeningPartIntroScreen.tsx
src/components/exam/listening/ListeningScenarioScreen.tsx
src/components/exam/listening/ListeningAudioScreen.tsx
src/components/exam/listening/ListeningQuestionScreen.tsx

Create documentation:

docs/product/listening-part-2-prototype.md

## Flow requirements

Implement a local client-side prototype flow.

Screen order:

1. Part intro screen

Shows:

- Listening to a Daily Life Conversation
- You will hear a conversation followed by 5 questions.
- Listen to each question. You will hear the question only once.
- Choose the best answer to each question.

2. Scenario screen

Shows:

- Instructions
- You will hear a telephone conversation between a woman and a customer.
- Next button

3. Conversation audio screen

Shows:

- Listen to the conversation.
- audio player for Part 2 conversation
- Next button

4. Question 1

Shows:

- question audio player
- question 1 of 5
- answer options
- user selects one answer
- Next button

5. Question 2

Same behavior.

6. Question 3

Same behavior.

7. Question 4

Same behavior.

8. Question 5

Same behavior.

9. Completion screen

Shows:

- Listening Part 2 complete
- You answered 5 questions
- Continue to answer review, disabled or Coming soon

Do not build Part 2 answer review yet.

## Audio behavior

Use native HTML audio.

Rules:

- no autoplay
- controls visible
- preload metadata
- audio URL from Cloudinary
- show fallback text if audio cannot load
- do not force one-time playback yet
- do not block Next until audio finishes yet
- document this as a later fidelity improvement

## Question behavior

For each question:

- show question number
- show question audio player
- show instruction: Choose the best answer.
- show radio options
- store selected answer in local component state
- Next button disabled until an answer is selected
- preserve selected answer when moving back and forward within this prototype

Because this is a prototype, allow Back for testing.

## Visual requirements

Use EXAM-01 shell components.

The question screen should match the Part 1 prototype style:

- grey top bar
- timer area with Time remaining: 30 seconds
- left audio/question area
- right light blue answer panel
- question number near top of answer panel
- radio options with horizontal separators
- compact text
- blue Next button
- Back button in bottom bar

Do not use marketing dashboard cards inside the exam canvas.

## Result and answer review

Do not build result page in this ticket.

But prepare local answer state so EXAM-06 can use it.

Suggested local state:

{
  questionId: selectedOptionId
}

No database save in this ticket.

## Documentation

Create:

docs/product/listening-part-2-prototype.md

Include:

1. Route created
2. Source content used
3. Screen sequence
4. Audio links used
5. Question count
6. Answer key stored
7. What is interactive
8. What is intentionally not built
9. Known fidelity gaps
10. How EXAM-06 should continue

## Known fidelity gaps to document

Document these as intentional for now:

- audio does not autoplay
- audio can be replayed
- Next does not wait for audio completion
- timer is static
- answers are not saved to database
- result page is not built
- Part 2 answer review is not built
- full Listening section is not built

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

- Listening Part 2 prototype route exists
- Listening Part 2 content is typed and centralized
- telephone conversation scenario appears
- conversation audio is represented
- 5 question screens are represented
- each question has audio and options
- selected answers are stored locally
- Next is disabled until answer selection on question screens
- completion screen exists
- Part 2 answer key is stored but not shown on question screens
- dashboard internal preview link exists if internal preview section exists
- no answer review is built
- no score page is built
- no database save is built
- no full Listening section is built
- no official screenshots are embedded
- no official CELPIP branding is copied
- existing Speaking and Writing AI flows are untouched
- no Supabase migration is created
- no dependencies are installed
- docs/product/listening-part-2-prototype.md exists
- npm run lint passes
- npm run build passes
