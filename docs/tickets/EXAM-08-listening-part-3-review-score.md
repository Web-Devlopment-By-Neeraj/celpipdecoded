# EXAM-08 - Listening Part 3 Answer Review and Score Screen

## Goal

Add the answer review and score screen for Mock Test 1 Listening Part 3.

This ticket completes the local prototype cycle for Listening Part 3 only.

Do not build Listening Part 4.
Do not build Listening Parts 5 to 6.
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

Use the existing Listening Part 3 content object:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-3.ts

The confirmed Listening Part 3 answer key is:

Question 1:
He wants her to add a new task to her duties.

Question 2:
It is currently having financial difficulties.

Question 3:
a request for a room near a washroom

Question 4:
so he can send an invoice

Question 5:
contact her co-worker

Question 6:
confident

If this answer key is already stored from EXAM-07, reuse it.

If any correctOptionId is missing, map it now by matching answer text to the existing option text.

Do not guess if an answer text is not present in the options.

## Required route behavior

Update the existing route:

src/app/dashboard/mock-tests/mock-test-1/listening/part-3/page.tsx

At the end of Question 6, the user should go to:

1. Answer review screen
2. Score screen
3. End of Listening Part 3 screen

This is still one local prototype route.

Do not create database-backed test sessions yet.

## Required files to create or update

Update:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-3.ts
src/components/exam/listening/ListeningPartThreePrototype.tsx

Reuse existing review and score utilities/components from earlier Listening parts where possible:

src/features/exam-engine/listening-score.ts
src/features/exam-engine/listening-review-types.ts
src/features/exam-engine/listening-review-copy.ts
src/components/exam/listening/ListeningAnswerReviewScreen.tsx
src/components/exam/listening/ListeningScoreScreen.tsx
src/components/exam/listening/ListeningPartEndScreen.tsx
src/components/exam/listening/ListeningAnswerReviewTable.tsx
src/components/exam/listening/ListeningScoreSummaryCard.tsx

If the existing review components are too specific, refactor them carefully into reusable listening review components without breaking Listening Part 1 or Part 2.

Create documentation:

docs/product/listening-part-3-review-score.md

## Answer key requirements

Confirm the answerKey array in Listening Part 3 has all 6 correctOptionId values.

Correct answers:

- q1: He wants her to add a new task to her duties.
- q2: It is currently having financial difficulties.
- q3: a request for a room near a washroom
- q4: so he can send an invoice
- q5: contact her co-worker
- q6: confident

Important:

- match by exact option text first
- if punctuation differs, map to the closest existing option text
- do not display the answer key on question screens
- display correct answers only on the answer review screen
- score should calculate only when all 6 answer keys are complete

## Review screen requirements

Create or reuse an answer review screen that shows:

- title: Listening Part 3 Answer Review
- subtitle: Review your answers before viewing the score.
- question number
- student selected answer
- correct answer
- status: correct, incorrect, or unanswered
- button: View score
- Back button to return to Question 6 for prototype testing

Use the EXAM-01 shell.

Do not use marketing dashboard cards inside the exam canvas.

## Score screen requirements

Create or reuse a score screen that shows:

- title: Listening Part 3 Score
- total questions: 6
- answered count
- correct count
- score percentage
- note: This is a Toronto Academy practice result, not an official CELPIP score.
- button: End Listening Part 3
- button or link: Review answers

Do not calculate official CELPIP score.

Do not show a CELPIP level.

Use simple practice score only:

- correct / total
- percentage

## End screen requirements

Create or reuse a simple end screen:

- title: End of Listening Part 3
- message: You have completed Listening Part 3 of Mock Test 1.
- button: Back to dashboard
- optional button: Restart Listening Part 3
- optional placeholder: Listening Part 4 will be added in the next ticket.

Do not build Part 4 in this ticket.

## Local state requirements

Use local client-side state from EXAM-07.

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

docs/product/listening-part-3-review-score.md

Include:

1. Route updated
2. Screens added
3. Answer key handling
4. Score calculation rule
5. What happens if answer keys are missing
6. What is intentionally not built
7. How EXAM-09 should continue

## Known intentional gaps

Document these:

- no database save
- no full Listening section score
- no Listening Parts 4 to 6
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

- Answer review screen works for Listening Part 3
- Score screen works for Listening Part 3
- End of Listening Part 3 screen works
- Review table shows all 6 questions
- Student selected answers are shown
- Correct answers are shown
- Correct and incorrect answers are marked
- Practice score calculates correctly
- No official CELPIP score is shown
- No database save is created
- No Supabase migration is created
- No Listening Part 4 is built
- No full Listening section is built
- Existing Speaking and Writing AI flows are untouched
- docs/product/listening-part-3-review-score.md exists
- npm run lint passes
- npm run build passes
