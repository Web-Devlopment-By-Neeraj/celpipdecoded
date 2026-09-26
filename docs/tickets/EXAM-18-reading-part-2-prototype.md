# EXAM-18 - Reading Part 2 Prototype

## Goal

Build Mock Test 1 Reading Part 2 prototype.

This continues the Reading exam engine after:

- EXAM-16 - Reading Part 1 Prototype
- EXAM-17 - Reading Part 1 Review and Score

This ticket should build only the Reading Part 2 question experience.

Do not build Reading Part 2 review or score in this ticket.
Do not build Reading Part 3.
Do not build Reading Part 4.
Do not build full Reading section.
Do not build Reading band estimate.
Do not build Writing.
Do not build Speaking.
Do not build admin panel.
Do not create database migrations.
Do not save answers to Supabase.
Do not add localStorage.
Do not change Listening unless fixing an accidental shared regression.
Do not change Reading Part 1 unless fixing a shared reusable Reading component safely.
Do not change existing Speaking AI logic.
Do not change existing Writing AI logic.
Do not build payment.
Do not build live classes.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Source content

Use this source file as the authority:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

Also inspect these existing extracted or planning files:

mock-tests/mock-test-1/extracted-content-outline.md
mock-tests/mock-test-1/extracted-links.md
docs/product/mock-test-1-content-map.md
docs/product/celpip-exam-rules-research.md
docs/product/admin-mock-test-builder-blueprint.md
docs/product/reading-part-1-prototype.md
docs/product/reading-part-1-review-score.md

Use the source document for:

- Reading Part 2 title
- instructions
- passage text
- diagram or visual content if present
- question text
- answer options
- answer key if available
- image links if available

Do not invent passage text.
Do not invent diagram content.
Do not invent questions.
Do not invent answer choices.
Do not invent answer keys.
Do not replace source wording with general CELPIP knowledge.

If the source document is unclear, document the gap instead of guessing.

## Required route

Create protected route:

src/app/dashboard/mock-tests/mock-test-1/reading/part-2/page.tsx

URL:

/dashboard/mock-tests/mock-test-1/reading/part-2

This is an internal prototype route for Reading Part 2.

Do not add it to the main learner-facing dashboard yet.

Do not disturb the existing Mock Test 1 Listening card or Reading Part 1 route.

## Expected Reading Part 2 structure

Reading Part 2 is expected to be a diagram or information-based reading task, but the source document is the authority.

Build only what the source supports.

The prototype should support:

- intro screen
- passage, diagram, or information panel
- question panel
- multiple-choice questions
- local answer state
- part completion screen

Do not build scoring in this ticket.

## Required files to create or update

Create content file:

src/features/exam-engine/mock-tests/mock-test-1/reading-part-2.ts

Update shared Reading files only if needed:

src/features/exam-engine/reading-types.ts
src/features/exam-engine/reading-flow.ts
src/features/exam-engine/reading-copy.ts

Create components:

src/components/exam/reading/ReadingPartTwoPrototype.tsx
src/components/exam/reading/ReadingPartTwoIntroScreen.tsx
src/components/exam/reading/ReadingPartTwoInformationScreen.tsx
src/components/exam/reading/ReadingPartTwoQuestionPanel.tsx

Reuse existing components when appropriate:

src/components/exam/reading/ReadingQuestionList.tsx
src/components/exam/reading/ReadingQuestionPanel.tsx
src/components/exam/reading/ReadingTwoColumnLayout.tsx
src/components/exam/reading/ReadingPartCompleteScreen.tsx

Do not duplicate components unnecessarily.

Create documentation:

docs/product/reading-part-2-prototype.md

## Screen flow

Implement a local client-side prototype flow.

Suggested screen order:

1. Reading Part 2 intro screen

Shows:

- Reading Part 2
- source-supported task title
- instructions from the source document if available
- neutral exam theme
- Next button

2. Reading Part 2 task screen

Shows:

- passage, diagram, email, information panel, or visual content from the source
- questions from the source
- answer options
- local selected answer state
- internal scroll where needed
- no whole-page scroll

3. Completion screen

Shows:

- Reading Part 2 complete
- You answered X of Y questions.
- Review and score will be added in the next ticket.
- Restart Reading Part 2
- Back to dashboard or mock test area

Do not build answer review or score in this ticket.

## Timer behavior

Use the existing Reading timer pattern from Reading Part 1 if appropriate.

For this prototype:

- use a part-level or screen-level timer if the source or research docs specify one
- if timing conflicts exist, follow the most reliable source and document the conflict
- if exact timing is unclear, use a clearly documented placeholder
- timer should count down live
- warning and urgent states should work
- time-up should show "Time is up"
- do not auto-submit yet
- do not erase answers when time expires
- user can complete with blank answers

Important:

Strict full Reading timing will be handled later.

## Question behavior

For each objective question:

- show question number
- show question text
- show answer options
- allow one selected answer
- save selected answer in local React state
- preserve selected answers during screen navigation
- allow blank answers
- do not block completion because of blanks
- do not show correct answers
- do not calculate score yet

Use the answer map shape already used by Reading Part 1 if compatible:

{
  questionId: selectedOptionId
}

## Answer key handling

If the source document includes a Reading Part 2 answer key, store it in the content object, but do not expose it to the client question screen.

If there is no answer key in the source document, document that clearly.

Do not build score or review yet.

The next ticket should handle Reading Part 2 review and score securely.

## Visual requirements

Reading Part 2 should feel consistent with the completed exam mode:

- neutral exam background
- no orange or marketing background
- no dashboard sidebar inside exam route
- no internal preview label in the exam surface
- fixed top exam bar
- fixed bottom navigation where appropriate
- middle content area stable
- internal scroll only inside passage, diagram, or question areas
- full browser-width exam experience is acceptable
- no official CELPIP branding

The Reading screen should be readable:

- information area should have comfortable line length
- diagram or visual area should fit without distortion
- question panel should be compact
- answer options should be clear
- long content should scroll internally

## Image or diagram handling

If Reading Part 2 has an image, chart, diagram, or visual source:

- use the source link from the mock test file or extracted links
- do not download new external assets unless already part of the project pattern
- do not use official CELPIP screenshots in production UI
- use accessible alt text based on source content
- keep the visual inside the exam canvas
- avoid layout shift

If the source diagram is represented as text in the document, render it as a clean exam-style information panel.

## Dashboard behavior

Do not make Reading Part 2 public on dashboard yet.

Do not disturb:

- /dashboard/mock-tests/mock-test-1/listening
- /dashboard/mock-tests/mock-test-1/reading/part-1
- existing dashboard cards

## Documentation

Create:

docs/product/reading-part-2-prototype.md

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
11. Any source gaps or timing conflicts
12. What is intentionally not built
13. How EXAM-19 should continue

## Known intentional gaps

Document these:

- no Reading Part 2 review screen
- no Reading Part 2 score screen
- no Reading band estimate
- no Reading Part 3
- no Reading Part 4
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

- Reading Part 2 route exists
- Reading Part 2 content is centralized
- Reading Part 2 source content is used
- Passage, diagram, or information area displays
- Questions display
- Answer options display
- Selected answers are stored locally
- Blank answers are allowed
- Completion is not blocked by blanks
- Timer foundation is used or documented
- Completion screen exists
- No Reading Part 2 review is built
- No Reading Part 2 score is built
- No Reading band is built
- No full Reading section is built
- No database save is created
- No Supabase migration is created
- Existing Listening route still works
- Existing Reading Part 1 route still works
- Existing Speaking and Writing AI flows are untouched
- docs/product/reading-part-2-prototype.md exists
- npm run lint passes
- npm run build passes
