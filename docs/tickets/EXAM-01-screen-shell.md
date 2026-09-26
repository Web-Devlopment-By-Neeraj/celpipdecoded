claude# EXAM-01 - Exam Engine Screen Shell

## Goal

Create the shared exam-engine screen shell for the Toronto Academy of Education CELPIP-style practice test experience.

This ticket builds only the reusable screen frame and preview route.

Do not build Listening Part 1 yet.
Do not build Reading Part 1 yet.
Do not build full Mock Test 1 yet.
Do not change existing Speaking AI logic.
Do not change existing Writing AI logic.
Do not change AI prompts.
Do not change scoring.
Do not create Supabase migrations.
Do not build payment.
Do not build live classes.
Do not use official screenshots as public UI images.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Context

EXAM-00 documented the official-style screen sequence and Mock Test 1 content.

The exam engine should feel close to a real test flow, but the production app must remain Toronto Academy practice software.

Use the official screenshots as internal layout and behavior reference only.

Production copy should use:

- Practice test engine
- CELPIP-style practice
- Toronto Academy practice test
- Practice estimates are not official CELPIP scores

Do not claim this is the official CELPIP test.

## Main purpose of this ticket

Build reusable exam shell components that future tickets will use for:

- instructional text screens
- instructional video screens
- Listening audio screens
- Listening question screens
- Reading split passage screens
- Writing task editor screens
- Speaking preparation and recording screens
- result review screens
- score screens
- end-of-section screens

## Required files to create

Create:

src/features/exam-engine/exam-shell-types.ts
src/features/exam-engine/exam-theme.ts
src/features/exam-engine/exam-copy.ts

src/components/exam/ExamShell.tsx
src/components/exam/ExamTopBar.tsx
src/components/exam/ExamBottomBar.tsx
src/components/exam/ExamButton.tsx
src/components/exam/ExamTimerDisplay.tsx
src/components/exam/ExamInstructionRow.tsx
src/components/exam/ExamCanvas.tsx
src/components/exam/ExamTwoColumnLayout.tsx
src/components/exam/ExamPanel.tsx
src/components/exam/ExamMediaPlaceholder.tsx
src/components/exam/ExamProgressIndicator.tsx

docs/product/exam-engine-screen-shell.md

## Optional preview route

Create a protected preview route only if useful:

src/app/dashboard/mock-tests/shell-preview/page.tsx

This route should show sample shell states using placeholder content only.

It should not contain real Mock Test 1 content yet.

It should not appear as a main navigation item unless already appropriate.

## Screen shell visual requirements

The shell should support a test-engine style layout:

1. Outer page

- neutral light background
- centered test container
- max width suitable for desktop
- mobile fallback without horizontal overflow

2. Top bar

- grey gradient or light grey bar
- test title on left
- optional timer on right
- blue Next button on far right
- optional preparation and recording text for Speaking later

3. Main canvas

- white or near-white exam area
- thin border
- large content region
- support for single-column and two-column screens
- support for internal scrolling where needed

4. Bottom bar

- grey footer bar
- Back button placement
- optional secondary actions
- should work on mobile

5. Instruction row

- small info icon style
- instruction text
- dark blue text tone
- reusable for instructions such as "Read the following message" or "Listen to the question"

6. Timer display

Support:

- time remaining text
- normal state
- warning state
- expired state
- optional label

Examples:

- Time remaining: 10 minutes
- Time remaining: 30 seconds
- Preparation: 30 seconds
- Recording: 60 seconds

Do not implement countdown logic yet unless needed for preview. Future tickets will add flow state.

7. Two-column layout

Support:

- left content panel
- right answer panel
- vertical divider
- scrollable left or right panel
- mobile stacking

This is needed later for Reading and Listening question screens.

8. Media placeholder

Support a placeholder area for:

- audio
- video
- image

Do not build real audio or video logic in this ticket.

Just create the layout area future tickets can use.

## Design direction

This screen shell should not look like the marketing dashboard.

It should feel like a focused practice test environment:

- restrained
- simple
- grey bars
- blue action buttons
- white exam canvas
- minimal distractions
- desktop-first with mobile fallback

Do not use playful cards or badges inside the exam shell.

## Components behavior

### ExamShell

Props should support:

- title
- timerLabel
- timerValue
- timerState
- showNext
- showBack
- onNext or nextHref
- onBack or backHref
- children
- bottomContent
- className

It should compose the top bar, canvas, and bottom bar.

### ExamTopBar

Props should support:

- title
- timer label/value
- timer state
- next action
- optional right meta text

### ExamBottomBar

Props should support:

- back action
- secondary action area
- optional children

### ExamButton

Support variants:

- primary
- secondary
- dark
- disabled

Use a blue Next style for primary.

### ExamTimerDisplay

Support states:

- normal
- warning
- expired
- muted

### ExamInstructionRow

Use an info symbol or simple icon.
No external icon dependency should be installed.

### ExamTwoColumnLayout

Support:

- left
- right
- leftLabel optional
- rightLabel optional
- scrollable panels
- mobile stack

### ExamMediaPlaceholder

Support:

- type: audio, video, image
- label
- helper text

This is only a placeholder.

## Preview route requirements

If preview route is created, it should show:

1. Instruction screen sample
2. Two-column reading style sample
3. Listening question style sample with media placeholder
4. Speaking preparation style sample

Use placeholder text only.

Do not include actual official screenshots.
Do not include CELPIP logo.
Do not include Mock Test 1 content yet.

## Integration rule

Do not replace existing Speaking or Writing screens in this ticket.

This ticket only prepares the shell.

Future tickets will use it.

## Documentation

Create:

docs/product/exam-engine-screen-shell.md

Include:

1. Purpose of the exam shell
2. Components created
3. Supported screen layouts
4. Visual rules
5. What the preview route shows
6. What was intentionally not built
7. How EXAM-02 and EXAM-03 should use it

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

- reusable exam shell components exist
- screen shell supports top bar, timer, Next, Back, canvas, and bottom bar
- two-column layout exists
- instruction row exists
- media placeholder exists
- preview route exists if useful
- no real mock test content is implemented
- no official screenshots are embedded
- no official CELPIP branding is copied into production UI
- existing Speaking and Writing flows are untouched
- no Supabase migration is created
- no dependencies are installed
- docs/product/exam-engine-screen-shell.md exists
- npm run lint passes
- npm run build passes
