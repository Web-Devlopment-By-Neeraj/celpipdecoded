# EXAM-04 - Listening Part 1 Answer Review and Score Screen

## Goal

Add the answer review and score screen for Mock Test 1 Listening Part 1.

This ticket completes the local prototype cycle for Listening Part 1 only.

It should use the local answers collected in EXAM-03 and compare them with a centralized answer key when available.

Do not build Listening Part 2.
Do not build Listening Parts 3 to 6.
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

## Source references

Use Mock Test 1 Listening Part 1 from:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

Use existing EXAM-03 content object:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-1.ts

The Mock Test 1 file provides a Part 1 answer/explanation image link:

Listening_Test_1_zAnswers_-_Part_1

If exact answer key values are already available in extracted docs or existing content, use them.

If exact answer key values are not available in text, do not guess. Build the review and score system, mark missing answer keys clearly in the documentation, and include the answer explanation image link as a reference panel.

## Required route behavior

Update the existing route:

src/app/dashboard/mock-tests/mock-test-1/listening/part-1/page.tsx

At the end of Question 8, the user should go to:

1. Answer review screen
2. Score screen
3. End of Listening Part 1 screen

This is still one local prototype route.

Do not create database-backed test sessions yet.

## Required files to create or update

Create or update:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-1.ts
src/features/exam-engine/listening-score.ts
src/features/exam-engine/listening-review-types.ts
src/features/exam-engine/listening-review-copy.ts

src/components/exam/listening/ListeningAnswerReviewScreen.tsx
src/components/exam/listening/ListeningScoreScreen.tsx
src/components/exam/listening/ListeningPartEndScreen.tsx
src/components/exam/listening/ListeningAnswerReviewTable.tsx
src/components/exam/listening/ListeningScoreSummaryCard.tsx

Update:

src/components/exam/listening/ListeningPartOnePrototype.tsx

Create documentation:

docs/product/listening-part-1-review-score.md

## Answer key structure

Add or confirm an answer key structure in the centralized Listening Part 1 content file.

Suggested structure:

answerKey: [
  {
    questionId: "q1",
    correctOptionId: "q1-option-4",
    explanation: "Optional explanation if available",
    source: "manual" or "answer-image"
  }
]

Important:

- Do not guess correct answers.
- If the answer key is not confidently available, set correctOptionId to null or omit scoring for that question.
- If any correctOptionId is missing, score screen should show "Answer key pending" instead of a misleading score.
- Document missing answer keys in the docs.

## Answer explanation image

If the Mock Test 1 content includes an answer/explanation image URL for Listening Part 1, store it in the content object:

answerExplanationImageUrl: "..."

Use it on the answer review screen as a reference section if available.

Do not download the image.

Use the Cloudinary URL directly.

## Review screen requirements

Create an answer review screen that shows:

- title: Listening Part 1 Answer Review
- subtitle: Review your answers before viewing the score.
- question number
- question text or short label
- student selected answer
- correct answer if available
- status: correct, incorrect, unanswered, answer key pending
- optional link or preview panel for answer explanation image
- button: View score
- Back button to return to the last question for prototype testing

Use the EXAM-01 shell.

Do not use marketing dashboard cards inside the exam canvas.

## Score screen requirements

Create a score screen that shows:

- title: Listening Part 1 Score
- total questions: 8
- answered count
- correct count if answer key is available
- score percentage if answer key is available
- pending-answer-key message if answer key is incomplete
- note: This is a Toronto Academy practice result, not an official CELPIP score.
- button: End Listening Part 1
- button or link: Review answers

Do not calculate official CELPIP score.

Do not show a CELPIP level.

Use simple practice score only:

- correct / total
- percentage

## End screen requirements

Create a simple end screen:

- title: End of Listening Part 1
- message: You have completed Listening Part 1 of Mock Test 1.
- button: Back to dashboard
- optional button: Restart Listening Part 1
- optional placeholder: Listening Part 2 will be added in the next ticket.

Do not build Part 2 in this ticket.

## Local state requirements

Use local client-side state from EXAM-03.

Keep answers as:

{
  questionId: selectedOptionId
}

The review and score screens should read from that local state.

Do not save to Supabase.

Do not create API routes.

Do not create cookies or localStorage unless already present and clearly safe.

## Scoring utility requirements

Create:

src/features/exam-engine/listening-score.ts

It should export utilities like:

- getAnsweredCount
- getCorrectCount
- getTotalQuestions
- getScorePercent
- buildListeningReviewRows
- hasCompleteAnswerKey

Handle missing answer keys safely.

No answer should be marked wrong if the correct answer is missing.

## Visual requirements

Use EXAM-01 shell components.

Review table should look like a test-engine result table:

- compact rows
- light borders
- clear status labels
- selected answer and correct answer columns
- no playful badges
- no heavy dashboard styling

Score screen should be simple and official-test-like:

- white canvas
- clear practice score
- small explanation
- blue action button

## Internal preview link

The existing dashboard internal preview link for Listening Part 1 should remain.

Do not add this to the final student mock-test navigation yet.

## Documentation

Create:

docs/product/listening-part-1-review-score.md

Include:

1. Route updated
2. Screens added
3. Answer key handling
4. Whether exact answer key values were available
5. Answer explanation image usage
6. Score calculation rule
7. What happens if answer keys are missing
8. What is intentionally not built
9. How EXAM-05 should continue

## Known intentional gaps

Document these:

- no database save
- no full Listening section score
- no Listening Parts 2 to 6
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

- Answer review screen exists
- Score screen exists
- End of Listening Part 1 screen exists
- Review table shows all 8 questions
- Student selected answers are shown
- Correct answers are shown only if answer key is available
- Missing answer keys are handled safely
- Practice score is calculated only when answer key is complete
- Answer explanation image link is included if available
- No official CELPIP score is shown
- No database save is created
- No Supabase migration is created
- No Listening Part 2 is built
- No full Listening section is built
- Existing Speaking and Writing AI flows are untouched
- docs/product/listening-part-1-review-score.md exists
- npm run lint passes
- npm run build passes
