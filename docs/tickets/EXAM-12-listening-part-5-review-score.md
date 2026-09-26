# EXAM-12 - Listening Part 5 Answer Review and Score Screen

## Goal

Add the answer review and score screen for Mock Test 1 Listening Part 5.

This ticket completes the local prototype cycle for Listening Part 5 only.

Do not build Listening Part 6.
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

Use the existing Listening Part 5 content object:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-5.ts

The confirmed Listening Part 5 answer key is already stored there.

Confirmed answers:

Question 1:
the format of the event

Question 2:
Their company regularly organizes fundraisers.

Question 3:
generating ideas

Question 4:
the chosen recipient of the funds

Question 5:
Bidders can make high bids for items they want.

Question 6:
It will encourage bidders to bid low.

Question 7:
It takes too long to process the results.

Question 8:
They will request outside input.

Confirmed option IDs from EXAM-11:

- q1: listening-part-5-q1-b
- q2: listening-part-5-q2-c
- q3: listening-part-5-q3-a
- q4: listening-part-5-q4-b
- q5: listening-part-5-q5-d
- q6: listening-part-5-q6-c
- q7: listening-part-5-q7-d
- q8: listening-part-5-q8-c

If this answer key is already stored from EXAM-11, reuse it.

If any correctOptionId is missing, map it now by matching answer text to the existing option text.

Do not guess if an answer text is not present in the options.

## Required route behavior

Update the existing route:

src/app/dashboard/mock-tests/mock-test-1/listening/part-5/page.tsx

At the end of the question screen, after all 8 answers are selected, the user should go to:

1. Answer review screen
2. Score screen
3. End of Listening Part 5 screen

This is still one local prototype route.

Do not create database-backed test sessions yet.

## Required files to create or update

Update:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-5.ts
src/components/exam/listening/ListeningPartFivePrototype.tsx

Reuse existing review and score utilities/components from earlier Listening parts where possible:

src/features/exam-engine/listening-score.ts
src/features/exam-engine/listening-review-types.ts
src/features/exam-engine/listening-review-copy.ts
src/components/exam/listening/ListeningAnswerReviewScreen.tsx
src/components/exam/listening/ListeningScoreScreen.tsx
src/components/exam/listening/ListeningPartEndScreen.tsx
src/components/exam/listening/ListeningAnswerReviewTable.tsx
src/components/exam/listening/ListeningScoreSummaryCard.tsx

If existing review components assume older question structures only, carefully extend them to support Listening Part 5 video question rows without breaking Listening Parts 1, 2, 3, and 4.

Create documentation:

docs/product/listening-part-5-review-score.md

## Answer key requirements

Confirm the answerKey array in Listening Part 5 has all 8 correctOptionId values.

Correct answers:

- q1: the format of the event
- q2: Their company regularly organizes fundraisers.
- q3: generating ideas
- q4: the chosen recipient of the funds
- q5: Bidders can make high bids for items they want.
- q6: It will encourage bidders to bid low.
- q7: It takes too long to process the results.
- q8: They will request outside input.

Important:

- match by exact option text first
- if punctuation differs, map to the closest existing option text
- do not display the answer key on the question screen
- display correct answers only on the answer review screen
- score should calculate only when all 8 answer keys are complete

## Review screen requirements

Create or reuse an answer review screen that shows:

- title: Listening Part 5 Answer Review
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

- title: Listening Part 5 Score
- total questions: 8
- answered count
- correct count
- score percentage
- note: This is a Toronto Academy practice result, not an official CELPIP score.
- button: End Listening Part 5
- button or link: Review answers

Do not calculate official CELPIP score.

Do not show a CELPIP level.

Use simple practice score only:

- correct / total
- percentage

## End screen requirements

Create or reuse a simple end screen:

- title: End of Listening Part 5
- message: You have completed Listening Part 5 of Mock Test 1.
- button: Back to dashboard
- optional button: Restart Listening Part 5
- optional placeholder: Listening Part 6 will be added in the next ticket.

Do not build Part 6 in this ticket.

## Local state requirements

Use local client-side state from EXAM-11.

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

docs/product/listening-part-5-review-score.md

Include:

1. Route updated
2. Screens added
3. Answer key handling
4. Video question answer review behavior
5. Score calculation rule
6. What happens if answer keys are missing
7. What is intentionally not built
8. How EXAM-13 should continue

## Known intentional gaps

Document these:

- no database save
- no full Listening section score
- no Listening Part 6
- no official CELPIP score
- no official CELPIP level
- no locked one-time video playback yet
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

- Answer review screen works for Listening Part 5
- Score screen works for Listening Part 5
- End of Listening Part 5 screen works
- Review table shows all 8 questions
- Student selected answers are shown
- Correct answers are shown
- Correct and incorrect answers are marked
- Practice score calculates correctly
- No official CELPIP score is shown
- No database save is created
- No Supabase migration is created
- No Listening Part 6 is built
- No full Listening section is built
- Existing Speaking and Writing AI flows are untouched
- docs/product/listening-part-5-review-score.md exists
- npm run lint passes
- npm run build passes
