# EXAM-14 - Listening Part 6 Answer Review and Score Screen

## Goal

Add the answer review and score screen for Mock Test 1 Listening Part 6.

This ticket completes the local prototype cycle for Listening Part 6 only.

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

Use the existing Listening Part 6 content object:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-6.ts

The confirmed Listening Part 6 answer key is already stored there.

Confirmed answers:

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

Confirmed option IDs from EXAM-13:

- q1: listening-part-6-q1-a
- q2: listening-part-6-q2-d
- q3: listening-part-6-q3-d
- q4: listening-part-6-q4-b
- q5: listening-part-6-q5-a
- q6: listening-part-6-q6-a

If this answer key is already stored from EXAM-13, reuse it.

If any correctOptionId is missing, map it now by matching answer text to the existing option text.

Do not guess if an answer text is not present in the options.

## Required route behavior

Update the existing route:

src/app/dashboard/mock-tests/mock-test-1/listening/part-6/page.tsx

At the end of the question screen, after all 6 answers are selected, the user should go to:

1. Answer review screen
2. Score screen
3. End of Listening Part 6 screen

This is still one local prototype route.

Do not create database-backed test sessions yet.

## Required files to create or update

Update:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-6.ts
src/components/exam/listening/ListeningPartSixPrototype.tsx

Reuse existing review and score utilities/components from earlier Listening parts where possible:

src/features/exam-engine/listening-score.ts
src/features/exam-engine/listening-review-types.ts
src/features/exam-engine/listening-review-copy.ts
src/components/exam/listening/ListeningAnswerReviewScreen.tsx
src/components/exam/listening/ListeningScoreScreen.tsx
src/components/exam/listening/ListeningPartEndScreen.tsx
src/components/exam/listening/ListeningAnswerReviewTable.tsx
src/components/exam/listening/ListeningScoreSummaryCard.tsx

If existing review components need small extensions for Listening Part 6 viewpoint questions, refactor carefully without breaking Listening Parts 1, 2, 3, 4, and 5.

Create documentation:

docs/product/listening-part-6-review-score.md

## Answer key requirements

Confirm the answerKey array in Listening Part 6 has all 6 correctOptionId values.

Correct answers:

- q1: approve a plan to redevelop the vacant land.
- q2: could put her community at risk.
- q3: may be developed into a nature walkway.
- q4: compact community with a vibrant local economy.
- q5: both economic and community interests can be satisfied.
- q6: Mother of two, Eleanor Wentworth, will be disappointed.

Important:

- match by exact option text first
- if punctuation differs, map to the closest existing option text
- do not display the answer key on the question screen
- display correct answers only on the answer review screen
- score should calculate only when all 6 answer keys are complete

## Review screen requirements

Create or reuse an answer review screen that shows:

- title: Listening Part 6 Answer Review
- subtitle: Review your answers before viewing the score.
- question number
- question text or short question label
- student selected answer
- correct answer
- status: correct, incorrect, or unanswered
- button: View score
- Back button to return to the question screen for prototype testing

Use the EXAM-01 shell.

Do not use marketing dashboard cards inside the exam canvas.

## Score screen requirements

Create or reuse a score screen that shows:

- title: Listening Part 6 Score
- total questions: 6
- answered count
- correct count
- score percentage
- note: This is a Toronto Academy practice result, not an official CELPIP score.
- button: End Listening Part 6
- button or link: Review answers

Do not calculate official CELPIP score.

Do not show a CELPIP level.

Use simple practice score only:

- correct / total
- percentage

## End screen requirements

Create or reuse a simple end screen:

- title: End of Listening Part 6
- message: You have completed Listening Part 6 of Mock Test 1.
- button: Back to dashboard
- optional button: Restart Listening Part 6
- optional placeholder: Full Listening section result will be added in a later ticket.

Do not build the full Listening result in this ticket.

## Local state requirements

Use local client-side state from EXAM-13.

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

docs/product/listening-part-6-review-score.md

Include:

1. Route updated
2. Screens added
3. Answer key handling
4. Viewpoints question answer review behavior
5. Score calculation rule
6. What happens if answer keys are missing
7. What is intentionally not built
8. How the next Listening ticket should continue

## Known intentional gaps

Document these:

- no database save
- no full Listening section score
- no official CELPIP score
- no official CELPIP level
- no locked one-time audio playback yet
- no timed countdown yet
- no persisted attempt history yet
- no full Mock Test 1 section assembly yet

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

- Answer review screen works for Listening Part 6
- Score screen works for Listening Part 6
- End of Listening Part 6 screen works
- Review table shows all 6 questions
- Student selected answers are shown
- Correct answers are shown
- Correct and incorrect answers are marked
- Practice score calculates correctly
- No official CELPIP score is shown
- No database save is created
- No Supabase migration is created
- No full Listening section result is built
- Existing Speaking and Writing AI flows are untouched
- docs/product/listening-part-6-review-score.md exists
- npm run lint passes
- npm run build passes
