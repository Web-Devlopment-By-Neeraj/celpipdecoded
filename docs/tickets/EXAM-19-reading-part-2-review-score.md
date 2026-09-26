# EXAM-19 - Reading Part 2 Review and Score

## Goal

Add secure answer marking, review, and score for Mock Test 1 Reading Part 2.

This continues EXAM-18.

EXAM-18 created the Reading Part 2 prototype at:

/dashboard/mock-tests/mock-test-1/reading/part-2

This ticket should add:

- server-side answer marking
- answer review screen
- score screen
- score out of the Reading Part 2 question count
- answered count
- blank count
- correct and incorrect status
- secure answer key handling

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
Do not change Reading Part 1 unless safely improving shared Reading components.
Do not change existing Speaking AI logic.
Do not change existing Writing AI logic.
Do not build payment.
Do not build live classes.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Source content

Use existing Reading Part 2 content from:

src/features/exam-engine/mock-tests/mock-test-1/reading-part-2.ts

The source for that file came from:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

Do not invent or change passage text.
Do not invent or change diagram content.
Do not invent or change questions.
Do not invent or change answer options.
Do not change the answer key unless a clear mismatch is found against the source document.

If a mismatch is found, document it in:

docs/product/reading-part-2-review-score.md

## Existing route

Update existing route:

src/app/dashboard/mock-tests/mock-test-1/reading/part-2/page.tsx

URL remains:

/dashboard/mock-tests/mock-test-1/reading/part-2

## Required files to create or update

Create server action:

src/app/dashboard/mock-tests/mock-test-1/reading/part-2/actions.ts

Create or reuse review and score helpers:

src/features/exam-engine/reading-score.ts
src/features/exam-engine/reading-review.ts

Important:
If these helpers already exist from EXAM-17, reuse and extend them. Do not duplicate Part 1-only logic.

Create components only if existing Part 1 components cannot be reused cleanly:

src/components/exam/reading/ReadingPartTwoReviewScreen.tsx
src/components/exam/reading/ReadingPartTwoScoreScreen.tsx

Reuse where possible:

src/components/exam/reading/ReadingReviewQuestionCard.tsx
src/components/exam/reading/ReadingScoreSummaryCard.tsx

Update if needed:

src/components/exam/reading/ReadingPartTwoPrototype.tsx
src/features/exam-engine/reading-types.ts
src/features/exam-engine/reading-flow.ts
src/features/exam-engine/reading-copy.ts
src/features/exam-engine/mock-tests/mock-test-1/reading-part-2.ts

Create documentation:

docs/product/reading-part-2-review-score.md

## Server-side marking

The answer key must not be exposed to the client question screen.

Implement a server action similar to Reading Part 1.

Suggested name:

markReadingPartTwo

Input:

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

Confirm existing behavior:

- answer key exists in the server-side content object
- answer key is stripped before client rendering
- correctOptionId or equivalent fields do not cross to the client question screen

If needed, improve the shared stripping function so it supports both Reading Part 1 and Reading Part 2.

The client question screen should only receive:

- passage, information, diagram, or task content
- questions
- options
- timing information
- labels and copy

The client should not receive answer keys.

## Review screen

After the user completes Reading Part 2, allow them to view review.

The review screen should show:

- score summary
- all Reading Part 2 questions
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

- Reading Part 2 score
- correct out of total Reading Part 2 questions
- percentage
- answered count
- blank count
- clear note that this is practice only
- button to review answers
- button to restart Reading Part 2
- button to return to dashboard or mock test area

Do not show estimated CELPIP Reading band in this ticket.

Band estimate should wait for the full Reading section.

## Flow behavior

Current EXAM-18 flow:

1. intro
2. passage, diagram, or information with questions
3. completion

Update flow to support:

1. intro
2. passage, diagram, or information with questions
3. score screen
4. review screen

or keep a completion step before the score screen if it already exists cleanly.

When user clicks finish:

- call server action
- show score screen
- keep selected answers in client state
- do not save to database
- do not reload the whole page unless necessary

## Blank answer behavior

Blank answers must be allowed.

Blank answers should:

- not block finish
- count as incorrect
- have isBlank true
- have isCorrect false
- display "No answer selected" or similar in review
- still show the correct answer in review

Example:
If Part 2 has 8 questions and the user answers 5:

- answeredCount = 5
- blankCount = 3
- totalQuestions = 8
- blanks count as incorrect

## Visual requirements

Use the same neutral exam style from the completed Reading and Listening work:

- no orange or marketing background
- no dashboard sidebar inside exam route
- no official CELPIP branding
- fixed top exam bar
- fixed bottom navigation where appropriate
- internal scrolling only
- review screen readable
- score card clean within the exam canvas

## Dashboard behavior

Keep the internal Reading prototype dashboard buttons from EXAM-18.

Do not change the Listening card.

Do not make a full Reading test card yet.

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

docs/product/reading-part-2-review-score.md

Include:

1. Route updated
2. Server action created
3. Answer key handling
4. Score calculation
5. Blank answer handling
6. Review row structure
7. Visual layout
8. Dashboard link status
9. What is intentionally not built
10. EXAM-20 continuation note

## Known intentional gaps

Document these:

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

- Reading Part 2 route still loads
- User can select answers
- User can finish Reading Part 2 with blanks
- Server action marks answers
- Score screen appears
- Score shows correct out of total Reading Part 2 questions
- Percentage appears
- Blank answers count as incorrect
- Review screen shows all Reading Part 2 questions
- Review shows selected answer and correct answer
- Blank review rows show "No answer selected"
- Answer key does not cross to client question screen
- Reading Part 1 route still works
- Listening route still works
- No Reading Part 3 is built
- No full Reading section is built
- No Reading band is built
- No database save is created
- No Supabase migration is created
- Existing Speaking and Writing AI flows are untouched
- docs/product/reading-part-2-review-score.md exists
- npm run lint passes
- npm run build passes
