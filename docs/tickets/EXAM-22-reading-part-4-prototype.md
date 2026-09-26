# EXAM-22 - Reading Part 4 Prototype

## Goal

Build Mock Test 1 Reading Part 4 prototype.

This continues the Reading exam engine after:

- EXAM-16 - Reading Part 1 Prototype
- EXAM-17 - Reading Part 1 Review and Score
- EXAM-18 - Reading Part 2 Prototype
- EXAM-19 - Reading Part 2 Review and Score
- EXAM-20 - Reading Part 3 Prototype
- EXAM-21 - Reading Part 3 Review and Score

This ticket should build only the Reading Part 4 question experience.

Do not build Reading Part 4 review or score in this ticket.
Do not build full Reading section.
Do not build Reading band estimate.
Do not build Writing.
Do not build Speaking.
Do not build admin panel.
Do not create database migrations.
Do not save answers to Supabase.
Do not add localStorage.
Do not change Listening unless fixing an accidental shared regression.
Do not change Reading Parts 1-3 unless safely improving shared Reading components.
Do not change existing Speaking AI logic.
Do not change existing Writing AI logic.
Do not build payment.
Do not build live classes.
Do not copy official CELPIP branding into production UI.

## Source content

Use this source file as the authority:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

Also inspect:

mock-tests/mock-test-1/extracted-content-outline.md
mock-tests/mock-test-1/extracted-links.md
docs/product/mock-test-1-content-map.md
docs/product/celpip-exam-rules-research.md
docs/product/admin-mock-test-builder-blueprint.md
docs/product/reading-part-1-prototype.md
docs/product/reading-part-2-prototype.md
docs/product/reading-part-3-prototype.md
docs/product/reading-part-3-review-score.md

Use the source document for:

- Reading Part 4 title
- instructions
- passage text
- viewpoint text
- opinion text
- question text
- answer options
- answer key if available
- image links if available

Do not invent passage text.
Do not invent viewpoint text.
Do not invent questions.
Do not invent answer choices.
Do not invent answer keys.
Do not replace source wording with general CELPIP knowledge.

If the source document is unclear, document the gap instead of guessing.

## Required route

Create protected route:

src/app/dashboard/mock-tests/mock-test-1/reading/part-4/page.tsx

URL:

/dashboard/mock-tests/mock-test-1/reading/part-4

This is an internal prototype route for Reading Part 4.

Do not add a full Reading test card yet.
Do not disturb the existing Listening card or Reading Part 1, Part 2, and Part 3 routes.

## Expected Reading Part 4 structure

Reading Part 4 is usually a viewpoints-style reading task, but the source document is the authority.

The prototype should support only what the source contains:

- intro screen
- reading passage, viewpoints, or article screen
- question panel
- multiple-choice, dropdown, or completion-style questions if the source supports them
- local answer state
- blank answers allowed
- completion screen

Do not build scoring in this ticket.

## Required files to create or update

Create content file:

src/features/exam-engine/mock-tests/mock-test-1/reading-part-4.ts

Update shared Reading files only if needed:

src/features/exam-engine/reading-types.ts
src/features/exam-engine/reading-flow.ts
src/features/exam-engine/reading-copy.ts

Create components:

src/components/exam/reading/ReadingPartFourPrototype.tsx
src/components/exam/reading/ReadingPartFourIntroScreen.tsx
src/components/exam/reading/ReadingPartFourInformationScreen.tsx
src/components/exam/reading/ReadingPartFourQuestionPanel.tsx

Reuse existing components where appropriate:

src/components/exam/reading/ReadingQuestionList.tsx
src/components/exam/reading/ReadingQuestionPanel.tsx
src/components/exam/reading/ReadingTwoColumnLayout.tsx
src/components/exam/reading/ReadingPartCompleteScreen.tsx
src/components/exam/reading/ReadingScoreSummaryCard.tsx
src/components/exam/reading/ReadingReviewQuestionCard.tsx

Create documentation:

docs/product/reading-part-4-prototype.md

## Dashboard internal access

Update the dashboard Mock tests section to include an internal preview card or button for:

Title:
Mock Test 1 - Reading Part 4

Badge:
Internal preview or Prototype

Route:
/dashboard/mock-tests/mock-test-1/reading/part-4

Button:
Open Reading Part 4

Keep the existing Listening card untouched.

Keep Reading Part 1, Part 2, and Part 3 internal preview links.

Do not claim full Reading test is available yet.

## Screen flow

Implement a local client-side prototype flow.

Suggested screen order:

1. Reading Part 4 intro screen

Shows:

- Reading Part 4
- source-supported task title
- instructions from the source document if available
- neutral exam theme
- Next button

2. Reading Part 4 task screen

Shows:

- passage, viewpoints, article, or response content from the source
- questions from the source
- answer options
- local selected answer state
- internal scroll where needed
- no whole-page scroll

3. Completion screen

Shows:

- Reading Part 4 complete
- You answered X of Y questions.
- Review and score will be added in the next ticket.
- Restart Reading Part 4
- Back to dashboard or mock test area

Do not build answer review or score in this ticket.

## Timer behavior

Use the existing Reading timer pattern from Parts 1-3 if appropriate.

For this prototype:

- use source-supported timing if available
- if timing conflicts exist, follow the most reliable source and document the conflict
- if exact timing is unclear, use a clearly documented placeholder
- timer should count down live
- warning and urgent states should work
- time-up should show "Time is up"
- do not auto-submit yet
- do not erase answers when time expires
- user can complete with blank answers

Strict full Reading timing will be handled later.

## Question behavior

For each objective question:

- show question number
- show question text or statement stem
- show answer options
- allow one selected answer
- save selected answer in local React state
- preserve selected answers during screen navigation
- allow blank answers
- do not block completion because of blanks
- do not show correct answers
- do not calculate score yet

Use the same answer map shape already used by Reading Parts 1-3:

{
  questionId: selectedOptionId
}

## Answer key handling

If the source document includes a Reading Part 4 answer key, store it in the content object, but do not expose it to the client question screen.

If there is no answer key in the source document, document that clearly.

Do not build score or review yet.

The next ticket should handle Reading Part 4 review and score securely.

## Visual requirements

Reading Part 4 should feel consistent with the completed exam mode:

- neutral exam background
- no orange or marketing background
- no dashboard sidebar inside exam route
- no internal preview label in the exam surface
- fixed top exam bar
- fixed bottom navigation where appropriate
- middle content area stable
- internal scroll only inside passage, viewpoint, article, or question areas
- full browser-width exam experience is acceptable
- no official CELPIP branding

The Reading screen should be readable:

- viewpoint or article area should have comfortable line length
- paragraph or section labels should be clear if present
- question panel should be compact
- answer options should be clear
- long content should scroll internally

## Documentation

Create:

docs/product/reading-part-4-prototype.md

Include:

1. Route created
2. Source content used
3. Task structure
4. Question count
5. Question types used
6. Timer behavior
7. Answer state strategy
8. Blank answer behavior
9. Answer key status
10. Visual layout
11. Dashboard internal preview link
12. Any source gaps or timing conflicts
13. What is intentionally not built
14. How EXAM-23 should continue

## Known intentional gaps

Document these:

- no Reading Part 4 review screen
- no Reading Part 4 score screen
- no Reading band estimate
- no full Reading section
- no database save
- no persisted attempt history
- no admin panel
- no full Mock Test 1 all-skills flow yet

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not touch Supabase helpers
- Do not call service role
- Do not change auth
- Do not create migrations
- Do not expose answer keys to client question screens
- Do not save answers to database

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

- Reading Part 4 route exists
- Reading Part 4 content is centralized
- Reading Part 4 source content is used
- Passage, viewpoint, article, or information area displays
- Questions display
- Answer options display
- Selected answers are stored locally
- Blank answers are allowed
- Completion is not blocked by blanks
- Timer foundation is used or documented
- Completion screen exists
- Dashboard has internal Reading Part 4 preview access
- No Reading Part 4 review is built
- No Reading Part 4 score is built
- No Reading band is built
- No full Reading section is built
- No database save is created
- No Supabase migration is created
- Existing Listening route still works
- Existing Reading Part 1, Part 2, and Part 3 routes still work
- Existing Speaking and Writing AI flows are untouched
- docs/product/reading-part-4-prototype.md exists
- npm run lint passes
- npm run build passes
