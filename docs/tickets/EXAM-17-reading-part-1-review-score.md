# EXAM-17 - Reading Part 1 Review and Score

## Goal

Add secure answer marking, review, and score for Mock Test 1 Reading Part 1.

This continues EXAM-16.

EXAM-16 created the Reading Part 1 prototype at:

/dashboard/mock-tests/mock-test-1/reading/part-1

This ticket should add:

- server-side answer marking
- answer review screen
- score screen
- score out of 11
- answered/blank count
- correct/incorrect status
- secure answer key handling

Do not build Reading Part 2.
Do not build Reading Part 3.
Do not build Reading Part 4.
Do not build full Reading section.
Do not build Reading band estimate yet.
Do not build Writing.
Do not build Speaking.
Do not build admin panel.
Do not create database migrations.
Do not save answers to Supabase.
Do not add localStorage.
Do not change Listening unless fixing an accidental shared regression.
Do not change existing Speaking AI logic.
Do not change existing Writing AI logic.
Do not build payment.
Do not build live classes.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Source content

Use existing Reading Part 1 content from:

src/features/exam-engine/mock-tests/mock-test-1/reading-part-1.ts

The source for that file came from:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

Do not invent or change passage text.
Do not invent or change questions.
Do not invent or change answer options.
Do not change the answer key unless a clear mismatch is found against the source document.

If a mismatch is found, document it in:

docs/product/reading-part-1-review-score.md

## Existing route

Update existing route:

src/app/dashboard/mock-tests/mock-test-1/reading/part-1/page.tsx

URL remains:

/dashboard/mock-tests/mock-test-1/reading/part-1

## Required files to create or update

Create server action:

src/app/dashboard/mock-tests/mock-test-1/reading/part-1/actions.ts

Create review and score helpers:

src/features/exam-engine/reading-score.ts
src/features/exam-engine/reading-review.ts

Create components:

src/components/exam/reading/ReadingPartOneReviewScreen.tsx
src/components/exam/reading/ReadingPartOneScoreScreen.tsx
src/components/exam/reading/ReadingReviewQuestionCard.tsx
src/components/exam/reading/ReadingScoreSummaryCard.tsx

Update if needed:

src/components/exam/reading/ReadingPartOnePrototype.tsx
src/features/exam-engine/reading-types.ts
src/features/exam-engine/reading-flow.ts
src/features/exam-engine/reading-copy.ts
src/features/exam-engine/mock-tests/mock-test-1/reading-part-1.ts

Create documentation:

docs/product/reading-part-1-review-score.md

## Server-side marking

The answer key must not be exposed to the client question screen.

Implement a server action similar to the Listening section pattern.

Suggested name:

markReadingPartOne

Input:

- selected answers map

Suggested shape:

{
  [questionId: string]: selectedOptionId
}

Output:

- totalQuestions
- correctCount
- incorrectCount
- blankCount
- answeredCount
- percentage
- review rows

Each review row should include:

- question id
- question number
- question text or stem
- selected option id
- selected option text
- correct option id
- correct option text
- isCorrect
- isBlank
- explanation if already available in source, otherwise null

Do not add AI explanations.
Do not invent explanations.

## Answer key stripping

Confirm existing EXAM-16 behavior:

- answer key exists in the server-side content object
- answer key is stripped before client rendering
- correctOptionId or equivalent fields do not cross to the client question screen

If needed, create or improve:

withoutReadingAnswerKey

The client question screen should only receive:

- passage
- response text
- questions
- options
- timing information
- labels/copy

The client should not receive answer keys.

## Review screen

After the user completes Reading Part 1, allow them to view review.

The review screen should show:

- score summary
- all 11 questions
- selected answer
- correct answer
- Correct, Incorrect, or Blank status
- no official score wording
- no estimated CELPIP band yet

Use practice wording:

"Toronto Academy practice score"

Do not say official CELPIP score.

## Score screen

Show:

- Reading Part 1 score
- correct out of 11
- percentage
- answered count
- blank count
- clear note that this is practice only
- button to review answers
- button to restart Reading Part 1
- button to return to dashboard or mock test area

Do not show estimated CELPIP Reading band in this ticket.

Band estimate should wait for full Reading section or a separate Reading scoring ticket.

## Flow behavior

Current EXAM-16 flow:

1. intro
2. passage/questions
3. completion

Update flow to support:

1. intro
2. passage/questions
3. score screen
4. review screen

or:

1. intro
2. passage/questions
3. completion
4. score screen
5. review screen

Choose the smallest clean change.

When user clicks finish:

- call server action
- show score screen
- keep selected answers in client state
- do not save to database
- do not reload the whole page unless necessary

## Blank answer behavior

Blank answers should be counted as incorrect.

For each blank:

- isBlank true
- isCorrect false
- selected option text should display "No answer selected" or similar
- correct answer should still display in review

## Visual requirements

Use the same neutral exam style from EXAM-16 and completed Listening work:

- no orange or marketing background
- no dashboard sidebar inside exam route
- no official CELPIP branding
- fixed top exam bar
- fixed bottom navigation where appropriate
- internal scrolling only
- review screen readable
- score card clean and centered within exam canvas

## Timer behavior

Do not change Reading timer behavior in this ticket except as needed for finishing the question screen.

Do not auto-submit on timer expiry yet.

If time expires:

- preserve answers
- show time-up state
- user can still finish manually for this prototype

Strict full Reading timing will be handled later.

## Documentation

Create:

docs/product/reading-part-1-review-score.md

Include:

1. Route updated
2. Server action created
3. Answer key handling
4. Score calculation
5. Blank answer handling
6. Review row structure
7. Visual layout
8. What is intentionally not built
9. EXAM-18 continuation note

## Known intentional gaps

Document these:

- no Reading Part 2
- no Reading Part 3
- no Reading Part 4
- no full Reading section
- no Reading band estimate
- no persisted attempt history
- no database save
- no admin panel
- no student analytics
- no strict full Reading timer yet

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not touch Supabase helpers
- Do not call service role
- Do not change auth
- Do not create migrations
- Do not expose answer keys to client question screens
- Do not save answers to database
- Server action should be deterministic and local to mock content

## Manual Supabase steps

None.

Do not create migrations.

## Style rule

Use normal hyphens only.
Do not use em dashes.
Do not use long hyphens.
Use straight quotes only.

## Validation

Run:

npm run lint
npm run build

Search changed files for:

- long hyphens
- em dashes
- curly quotes

Replace with normal hyphens and straight quotes.

## Done criteria

- Reading Part 1 route still loads
- User can select answers
- User can finish Reading Part 1
- Server action marks answers
- Score screen appears
- Score shows correct out of 11
- Percentage appears
- Blank answers count as incorrect
- Review screen shows all 11 questions
- Review shows selected answer and correct answer
- Answer key does not cross to client question screen
- No Reading Part 2 is built
- No full Reading section is built
- No Reading band is built
- No database save is created
- No Supabase migration is created
- Existing Listening route still builds
- Existing Speaking and Writing AI flows are untouched
- docs/product/reading-part-1-review-score.md exists
- npm run lint passes
- npm run build passes
