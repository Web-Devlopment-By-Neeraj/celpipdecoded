# EXAM-24 - Full Reading Section Flow and Estimated Band Score

## Goal

Assemble the full Mock Test 1 Reading section using the completed Reading Parts 1-4.

This ticket should create the full Reading route, full Reading flow, full Reading score, full answer review, and estimated Reading band.

Completed individual Reading work:

- EXAM-16 - Reading Part 1 Prototype
- EXAM-17 - Reading Part 1 Review and Score
- EXAM-18 - Reading Part 2 Prototype
- EXAM-19 - Reading Part 2 Review and Score
- EXAM-20 - Reading Part 3 Prototype
- EXAM-21 - Reading Part 3 Review and Score
- EXAM-22 - Reading Part 4 Prototype
- EXAM-23 - Reading Part 4 Review and Score

This ticket should build:

- full Reading route
- full Reading section flow
- Reading instructions screen if source-supported
- Parts 1-4 in one continuous flow
- one full Reading score screen
- one full Reading answer review screen
- part breakdown
- estimated Reading band from the local scoring descriptor source
- dashboard internal access for full Reading

Do not build Writing.
Do not build Speaking.
Do not build full Mock Test all-skills flow.
Do not build admin panel.
Do not create database migrations.
Do not save answers to Supabase.
Do not add localStorage.
Do not change Listening unless fixing an accidental shared regression.
Do not change individual Reading part routes unless safely improving shared Reading components.
Do not change existing Speaking AI logic.
Do not change existing Writing AI logic.
Do not build payment.
Do not build live classes.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

Use wording like:

- Toronto Academy practice score
- estimated Reading band
- practice estimate
- not an official CELPIP score

Do not say:

- official CELPIP score
- guaranteed score
- official test result
- pass guarantee

## Source content

Use existing content files:

src/features/exam-engine/mock-tests/mock-test-1/reading-part-1.ts
src/features/exam-engine/mock-tests/mock-test-1/reading-part-2.ts
src/features/exam-engine/mock-tests/mock-test-1/reading-part-3.ts
src/features/exam-engine/mock-tests/mock-test-1/reading-part-4.ts

Original source:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

Also inspect:

mock-tests/mock-test-1/extracted-content-outline.md
mock-tests/mock-test-1/extracted-links.md
docs/product/mock-test-1-content-map.md
docs/product/celpip-exam-rules-research.md
docs/product/admin-mock-test-builder-blueprint.md
docs/product/reading-part-1-prototype.md
docs/product/reading-part-1-review-score.md
docs/product/reading-part-2-prototype.md
docs/product/reading-part-2-review-score.md
docs/product/reading-part-3-prototype.md
docs/product/reading-part-3-review-score.md
docs/product/reading-part-4-prototype.md
docs/product/reading-part-4-review-score.md

Use local scoring descriptor source if present:

public/Overview and Scoring Descriptors/Reading - Scoring.pdf

If the exact file name differs, inspect the folder and use the Reading scoring PDF that already exists in the repo.

Do not invent scoring bands.

If the scoring descriptor source has overlapping or ambiguous raw score ranges, preserve ambiguity instead of inventing a tie-break rule.

## Required route

Create protected route:

src/app/dashboard/mock-tests/mock-test-1/reading/page.tsx

URL:

/dashboard/mock-tests/mock-test-1/reading

This is the full Reading section route.

Keep these individual part routes working:

/dashboard/mock-tests/mock-test-1/reading/part-1
/dashboard/mock-tests/mock-test-1/reading/part-2
/dashboard/mock-tests/mock-test-1/reading/part-3
/dashboard/mock-tests/mock-test-1/reading/part-4

## Required files to create or update

Create full Reading content assembler:

src/features/exam-engine/mock-tests/mock-test-1/reading-section.ts

Create full Reading server action:

src/app/dashboard/mock-tests/mock-test-1/reading/actions.ts

Create or update Reading scoring helpers:

src/features/exam-engine/reading-section-score.ts
src/features/exam-engine/reading-band-score.ts
src/features/exam-engine/reading-section-review.ts

Reuse existing helpers where possible:

src/features/exam-engine/reading-score.ts
src/features/exam-engine/reading-review.ts

Create full section components:

src/components/exam/reading/ReadingSectionPrototype.tsx
src/components/exam/reading/ReadingSectionIntroScreen.tsx
src/components/exam/reading/ReadingSectionTransitionScreen.tsx
src/components/exam/reading/ReadingSectionScoreScreen.tsx
src/components/exam/reading/ReadingSectionReviewScreen.tsx
src/components/exam/reading/ReadingEstimatedBandCard.tsx
src/components/exam/reading/ReadingPartBreakdownCard.tsx

Reuse existing part components where possible:

src/components/exam/reading/ReadingPartOnePrototype.tsx
src/components/exam/reading/ReadingPartTwoPrototype.tsx
src/components/exam/reading/ReadingPartThreePrototype.tsx
src/components/exam/reading/ReadingPartFourPrototype.tsx
src/components/exam/reading/ReadingReviewQuestionCard.tsx
src/components/exam/reading/ReadingScoreSummaryCard.tsx

Update shared Reading files only if needed:

src/features/exam-engine/reading-types.ts
src/features/exam-engine/reading-flow.ts
src/features/exam-engine/reading-copy.ts

Update dashboard:

- Add internal preview card or button for full Reading section
- Keep individual Reading Part 1-4 internal preview buttons
- Keep Listening card untouched

Create documentation:

docs/product/full-reading-section-flow-band-score.md

## Full Reading flow

Create a client-side full Reading flow.

Suggested flow:

1. Reading section intro

Shows:

- Mock Test 1 - Reading
- practice instructions
- question count based on actual content
- parts included: Part 1, Part 2, Part 3, Part 4
- practice-only wording
- Next button

2. Reading Part 1

Use existing Part 1 content and question UI.

3. Transition to Reading Part 2

Small transition screen:

- Reading Part 1 complete
- Continue to Reading Part 2

4. Reading Part 2

Use existing Part 2 content and question UI.

5. Transition to Reading Part 3

6. Reading Part 3

Use existing Part 3 content and question UI.

7. Transition to Reading Part 4

8. Reading Part 4

Use existing Part 4 content and question UI.

9. Full Reading score screen

Shows:

- total correct out of total Reading questions
- percentage
- answered count
- blank count
- part breakdown
- estimated Reading band
- practice-only note
- Review answers button
- Restart Reading button
- Return to dashboard button

10. Full Reading review screen

Shows:

- all Reading questions from Parts 1-4
- grouped by part
- selected answer
- correct answer
- Correct, Incorrect, or Blank
- no AI explanations unless already in source
- no invented explanations

## Question count

Compute total question count from the content files.

Do not hardcode 38 unless the actual content files total 38.

The score should always use:

totalQuestions = sum of all question counts in Reading Parts 1-4

Expected behavior:

- every question from Parts 1-4 appears in the full review
- score denominator matches the actual total question count
- part breakdown denominators match actual part question counts

## Answer state

Use one full Reading answer map.

Suggested shape:

{
  [questionId: string]: selectedOptionId
}

or, if needed:

{
  part1: { [questionId: string]: selectedOptionId },
  part2: { [questionId: string]: selectedOptionId },
  part3: { [questionId: string]: selectedOptionId },
  part4: { [questionId: string]: selectedOptionId }
}

Choose the smallest safe shape that works with existing helpers.

Blank answers must be allowed.

Completion should not be blocked by blanks.

## Server-side marking

The full Reading route must mark answers server-side.

Create:

src/app/dashboard/mock-tests/mock-test-1/reading/actions.ts

Suggested action:

markReadingSection

Input:

- full selected answer map

Output:

- totalQuestions
- correctCount
- incorrectCount
- blankCount
- answeredCount
- percentage
- estimatedBand result
- partBreakdown
- review rows grouped by part

Each part breakdown row should include:

- part id
- part title
- totalQuestions
- correctCount
- incorrectCount
- blankCount
- answeredCount
- percentage

Each review row should include:

- part id
- part title
- question id
- question number
- question text or stem
- selected option id
- selected option text
- correct option id
- correct option text
- isCorrect
- isBlank
- explanation if source has it, otherwise null

Do not add AI explanations.
Do not invent explanations.

## Answer key security

Answer keys must not cross to the client question screens.

The full Reading client should receive only stripped content:

- reading content
- passage or information content
- questions
- options
- timing information
- labels and copy

The client must not receive:

- answer key object
- correctOptionId
- correct option metadata

The server action can import full content and answer keys.

Reuse existing key stripping functions if possible.

Improve them only if needed to support full Reading.

## Estimated Reading band

Use the local Reading scoring descriptor source.

Expected behavior:

- only show estimated band after full Reading section score
- do not show band on individual part routes
- do not call it official
- if raw score ranges are ambiguous, show the ambiguity
- if scoring source is missing or cannot be parsed reliably, return null and document the gap
- do not invent a band table

Suggested wording:

"This is a Toronto Academy practice estimate, not an official CELPIP score."

The estimated band card should show:

- raw score
- total questions
- estimated band or range
- source note from local descriptor
- practice-only disclaimer

## Timer behavior

For this ticket, keep timing simple and safe.

Use existing part-level timer behavior from individual Reading parts.

Do not implement strict full Reading timing yet.

Do not auto-submit when timer expires.

If a part timer expires:

- show time-up state
- preserve answers
- allow user to continue manually

Strict full Reading timing should be left for a future QA/polish ticket.

Document this clearly.

## Navigation behavior

Full Reading route may allow controlled Next through the flow.

Do not allow random dashboard navigation inside the exam surface.

Back behavior:

- If existing part screens have Back, it can remain for this prototype unless it creates bugs.
- Strict no-back full Reading behavior can wait for the next Reading polish ticket.

Important:
Do not break individual part routes.

## Dashboard internal access

Update the Mock tests dashboard area:

Add a full Reading internal preview card or button:

Title:
Mock Test 1 - Reading Test

Badge:
Internal preview or Prototype

Route:
/dashboard/mock-tests/mock-test-1/reading

Description:
Full Reading section flow with Parts 1-4, practice score, review, and estimated band.

Button:
Open Reading Test

Keep existing internal part links for Part 1-4.

Keep existing Listening card untouched.

Do not claim all-skills Mock Test 1 is complete yet.

## Visual requirements

Full Reading should feel consistent with completed Listening and Reading part routes:

- neutral exam background
- no orange or marketing background
- no dashboard sidebar inside exam route
- no internal preview label inside exam surface
- fixed top exam bar
- fixed bottom navigation where appropriate
- middle content area stable
- internal scroll only inside passage, information, or review areas
- full browser-width exam experience is acceptable
- no official CELPIP branding

Score and review screens should be readable and not cramped.

## Documentation

Create:

docs/product/full-reading-section-flow-band-score.md

Include:

1. Route created
2. Parts included
3. Source content used
4. Question count by part
5. Total question count
6. Answer state strategy
7. Server action created
8. Answer key handling
9. Score calculation
10. Blank answer handling
11. Part breakdown behavior
12. Estimated band source and behavior
13. Timer behavior
14. Dashboard link status
15. What is intentionally not built
16. EXAM-25 continuation note

## Known intentional gaps

Document these:

- no strict full Reading timer yet
- no persisted attempt history
- no database save
- no admin panel
- no student analytics
- no full Mock Test all-skills flow yet
- no Writing mock test section yet
- no Speaking mock test section yet

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not touch Supabase service role
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

- Full Reading route exists
- Full Reading route includes Parts 1-4
- Full Reading route uses source content from existing part files
- User can answer all parts in one flow
- Blank answers are allowed
- Completion is not blocked by blanks
- Server action marks full Reading answers
- Score screen appears
- Score shows correct out of total Reading questions
- Percentage appears
- Blank answers count as incorrect
- Part breakdown appears
- Estimated Reading band appears if local scoring source supports it
- Estimated band wording is practice-only
- Review screen shows all Reading questions from Parts 1-4
- Review groups questions by part
- Review shows selected answer and correct answer
- Blank review rows show "No answer selected"
- Answer keys do not cross to client question screens
- Individual Reading Part 1 route still works
- Individual Reading Part 2 route still works
- Individual Reading Part 3 route still works
- Individual Reading Part 4 route still works
- Listening route still works
- Dashboard has internal full Reading access
- No Writing is built
- No Speaking is built
- No full all-skills mock test is built
- No database save is created
- No Supabase migration is created
- Existing Speaking and Writing AI flows are untouched
- docs/product/full-reading-section-flow-band-score.md exists
- npm run lint passes
- npm run build passes
