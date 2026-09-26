# EXAM-06 - Listening Part 2 Answer Review and Score Screen

## Goal

Add the answer review and score screen for Mock Test 1 Listening Part 2.

This ticket completes the local prototype cycle for Listening Part 2 only.

Do not build Listening Part 3.
Do not build Listening Parts 4 to 6.
Do not build the full Listening section.
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

Use the existing Listening Part 2 content object:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-2.ts

The confirmed Listening Part 2 answer key is:

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

If this answer key is already stored from EXAM-05, reuse it.

If any correctOptionId is missing, map it now by matching answer text to the existing option text.

Do not guess if an answer text is not present in the options.

## Required route behavior

Update the existing route:

src/app/dashboard/mock-tests/mock-test-1/listening/part-2/page.tsx

At the end of Question 5, the user should go to:

1. Answer review screen
2. Score screen
3. End of Listening Part 2 screen

This is still one local prototype route.

Do not create database-backed test sessions yet.

## Required files to create or update

Update:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-2.ts
src/components/exam/listening/ListeningPartTwoPrototype.tsx

Reuse existing review and score utilities/components from EXAM-04 where possible:

src/features/exam-engine/listening-score.ts
src/features/exam-engine/listening-review-types.ts
src/features/exam-engine/listening-review-copy.ts
src/components/exam/listening/ListeningAnswerReviewScreen.tsx
src/components/exam/listening/ListeningScoreScreen.tsx
src/components/exam/listening/ListeningPartEndScreen.tsx
src/components/exam/listening/ListeningAnswerReviewTable.tsx
src/components/exam/listening/ListeningScoreSummaryCard.tsx

If the existing Part 1 review components are too specific, refactor them carefully into reusable listening review components without breaking Listening Part 1.

Create documentation:

docs/product/listening-part-2-review-score.md

## Answer key requirements

Confirm the answerKey array in Listening Part 2 has all 5 correctOptionId values.

Correct answers:

- q1: a newspaper subscription
- q2: Manaz was a customer in the past.
- q3: suspicious
- q4: She would like to call him by his name.
- q5: a selection of articles

Important:

- match by exact option text first
- if punctuation differs, map to the closest existing option text
- do not display the answer key on question screens
- display correct answers only on the answer review screen
- score should calculate only when all 5 answer keys are complete

## Review screen requirements

Create or reuse an answer review screen that shows:

- title: Listening Part 2 Answer Review
- subtitle: Review your answers before viewing the score.
- question number
- student selected answer
- correct answer
- status: correct, incorrect, or unanswered
- button: View score
- Back button to return to Question 5 for prototype testing

Use the EXAM-01 shell.

Do not use marketing dashboard cards inside the exam canvas.

## Score screen requirements

Create or reuse a score screen that shows:

- title: Listening Part 2 Score
- total questions: 5
- answered count
- correct count
- score percentage
- note: This is a Toronto Academy practice result, not an official CELPIP score.
- button: End Listening Part 2
- button or link: Review answers

Do not calculate official CELPIP score.

Do not show a CELPIP level.

Use simple practice score only:

- correct / total
- percentage

## End screen requirements

Create or reuse a simple end screen:

- title: End of Listening Part 2
- message: You have completed Listening Part 2 of Mock Test 1.
- button: Back to dashboard
- optional button: Restart Listening Part 2
- optional placeholder: Listening Part 3 will be added in the next ticket.

Do not build Part 3 in this ticket.

## Local state requirements

Use local client-side state from EXAM-05.

Keep answers as:

{
  questionId: selectedOptionId
}

The review and score screens should read from that local state.

Do not save to Supabase.

Do not create API routes.

Do not create cookies or localStorage unless already present and clearly safe.

## Visual requirements

Use EXAM-01 shell components.

Review table should look like a test-engine result table:

- compact rows
- light borders
- clear status labels
- selected answer and correct answer columns
- no playful badges
- no heavy dashboard styling

Score screen should be simple and test-like:

- white canvas
- clear practice score
- small explanation
- blue action button

## Documentation

Create:

docs/product/listening-part-2-review-score.md

Include:

1. Route updated
2. Screens added
3. Answer key handling
4. Score calculation rule
5. What happens if answer keys are missing
6. What is intentionally not built
7. How EXAM-07 should continue

## Known intentional gaps

Document these:

- no database save
- no full Listening section score
- no Listening Parts 3 to 6
- no official CELPIP score
- no official CELPIP level
- no locked one-time audio playback yet
- no timed countdown yet
- no persisted attempt history yet

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

- Answer review screen works for Listening Part 2
- Score screen works for Listening Part 2
- End of Listening Part 2 screen works
- Review table shows all 5 questions
- Student selected answers are shown
- Correct answers are shown
- Correct and incorrect answers are marked
- Practice score calculates correctly
- No official CELPIP score is shown
- No database save is created
- No Supabase migration is created
- No Listening Part 3 is built
- No full Listening section is built
- Existing Speaking and Writing AI flows are untouched
- docs/product/listening-part-2-review-score.md exists
- npm run lint passes
- npm run build passes
