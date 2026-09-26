# EXAM-16 - Reading Part 1 Prototype

## Goal

Build Mock Test 1 Reading Part 1 prototype.

This is the first Reading ticket after completing the Listening workflow.

Reading Part 1 should use the real Mock Test 1 source content and should follow the exam engine patterns already proven in Listening:

- locked exam shell
- neutral exam theme
- timed screen support
- local answer state
- content-driven structure
- no database save yet
- no admin panel yet

This ticket should build the Reading Part 1 prototype only.

Do not build Reading Part 2.
Do not build Reading Part 3.
Do not build Reading Part 4.
Do not build full Reading section.
Do not build Reading review or score screen in this ticket.
Do not build Writing.
Do not build Speaking.
Do not build admin panel.
Do not create database migrations.
Do not save answers to Supabase.
Do not change Listening unless fixing an accidental shared regression.
Do not change existing Speaking AI logic.
Do not change existing Writing AI logic.
Do not build payment.
Do not build live classes.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Source content

Use this source file:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

Also use extracted source docs if available:

mock-tests/mock-test-1/extracted-content-outline.md
mock-tests/mock-test-1/extracted-links.md
docs/product/celpip-exam-rules-research.md
docs/product/admin-mock-test-builder-blueprint.md

Use the source document as the authority for:

- passage text
- response passage text
- question text
- answer options
- answer key if available
- image links if any

Do not invent passage text.
Do not invent questions.
Do not invent answer choices.
Do not invent answer key values.

If the source document is unclear, document the gap instead of guessing.

## Required route

Create protected route:

src/app/dashboard/mock-tests/mock-test-1/reading/part-1/page.tsx

URL:

/dashboard/mock-tests/mock-test-1/reading/part-1

This is an internal prototype route for Reading Part 1.

Do not add it as the main learner-facing dashboard card yet unless there is already an internal preview area for development routes.

## Reading Part 1 expected structure

Use the exact source content, but the prototype should support the Reading Part 1 structure:

- Reading Correspondence
- Passage or message area
- Question area
- multiple-choice questions
- possible response-completion section if present in the source
- local selected answers

The source may contain two sub-sections inside Reading Part 1:

1. Questions about the correspondence
2. Questions completing or understanding a response

Build only what the source supports.

## Required files to create

Create content and types:

src/features/exam-engine/mock-tests/mock-test-1/reading-part-1.ts
src/features/exam-engine/reading-types.ts
src/features/exam-engine/reading-flow.ts
src/features/exam-engine/reading-copy.ts

Create components:

src/components/exam/reading/ReadingPartOnePrototype.tsx
src/components/exam/reading/ReadingPartIntroScreen.tsx
src/components/exam/reading/ReadingCorrespondenceScreen.tsx
src/components/exam/reading/ReadingQuestionPanel.tsx
src/components/exam/reading/ReadingQuestionList.tsx

Optional if useful:

src/components/exam/reading/ReadingTwoColumnLayout.tsx
src/components/exam/reading/ReadingPartCompleteScreen.tsx

Create documentation:

docs/product/reading-part-1-prototype.md

## Reuse existing exam foundation

Reuse existing exam components where possible:

- ExamModeViewport
- ExamShell
- ExamTopBar
- Exam bottom navigation pattern
- exam theme
- exam timer foundation
- locked exam layout patterns

Do not duplicate the Listening engine blindly.

If a generic component exists, reuse it.
If a Reading-specific component is needed, create it under:

src/components/exam/reading/

## Screen flow

Implement a local client-side prototype flow.

Suggested screen order:

1. Reading Part 1 intro screen

Shows:

- Reading Part 1
- Reading Correspondence
- instructions from the source document if available
- neutral exam theme
- Next button

2. Reading passage and questions screen

Shows:

- passage or correspondence on the left
- questions on the right
- answer options
- local selection state
- internal scroll where needed
- no whole-page scroll

3. Completion screen

Shows:

- Reading Part 1 complete
- You answered X of Y questions.
- Review and score will be added in the next ticket.
- Restart Reading Part 1
- Back to dashboard or mock test area

Do not build answer review or score in this ticket.

## Timer behavior

Use the timer foundation from EXAM-15D and EXAM-15F.

For this prototype:

- use a screen-level Reading Part 1 timer if the source or research docs specify one
- otherwise use a configurable placeholder duration and document it clearly
- timer should count down live
- warning and urgent states should work
- time-up should show "Time is up"
- do not auto-submit yet for this prototype unless the existing full-exam behavior is safely reusable
- do not erase answers when time expires

Important:

Reading will likely need section-level timing later. This ticket is only a Part 1 prototype.

## Question behavior

For each objective question:

- show question number
- show question text
- show answer options
- allow one selected answer
- save selected answer in local React state
- preserve answers during screen navigation
- do not show correct answers
- do not calculate score yet

Use this answer map shape if compatible:

{
  questionId: selectedOptionId
}

## Answer key handling

If the source document includes a Reading Part 1 answer key, store it in the content object, but do not expose it to the client question screen.

If there is no answer key in the source document, document that clearly.

Do not build score or review yet.

The next ticket should handle Reading Part 1 review and score securely.

## Visual requirements

Reading Part 1 should feel like the completed Listening exam mode:

- neutral exam background
- no orange or marketing background
- no dashboard sidebar inside exam route
- no internal preview label in the exam surface
- fixed top exam bar
- fixed bottom navigation
- middle content area stable
- internal scroll only inside passage or question areas
- full browser-width exam experience is acceptable
- no official CELPIP branding

The Reading screen should be readable:

- passage area should have comfortable line length
- question panel should be compact
- answer options should be clear
- long passage should scroll internally
- question panel should scroll internally if needed

## Dashboard behavior

Do not make Reading public on dashboard yet unless asked.

If adding a link for development, mark it as internal or keep it in a developer-only area.

Do not disturb the existing Mock Test 1 Listening dashboard card.

## Documentation

Create:

docs/product/reading-part-1-prototype.md

Include:

1. Route created
2. Source content used
3. Passage structure
4. Question count
5. Question types used
6. Timer behavior
7. Answer state strategy
8. Answer key status
9. Visual layout
10. What is intentionally not built
11. How EXAM-17 should continue

## Known intentional gaps

Document these:

- no Reading review screen
- no Reading score screen
- no Reading band estimate yet
- no full Reading section yet
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

- Reading Part 1 route exists
- Reading Part 1 content is centralized
- Reading Part 1 source content is used
- Passage or correspondence displays
- Questions display
- Answer options display
- Selected answers are stored locally
- Timer foundation is used or documented
- Completion screen exists
- No Reading review is built
- No Reading score is built
- No Reading band is built
- No full Reading section is built
- No database save is created
- No Supabase migration is created
- Existing Listening route still works
- Existing Speaking and Writing AI flows are untouched
- docs/product/reading-part-1-prototype.md exists
- npm run lint passes
- npm run build passes
