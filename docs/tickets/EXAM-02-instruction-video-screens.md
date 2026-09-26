# EXAM-02 - Instructional Text and Video Screens

## Goal

Build reusable instructional text and instructional video screens for the Toronto Academy CELPIP-style practice test engine.

This ticket uses the EXAM-01 exam shell.

Do not build Listening Part 1 yet.
Do not build Reading Part 1 yet.
Do not build full Mock Test 1.
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

EXAM-01 created the shared exam shell.

EXAM-02 should add the first real screen type for the exam engine:

- instructional text screen
- instructional video screen

These screens will later be used for:

- full test overview instruction video
- Listening test instructions
- Listening instruction video
- Reading test instructions
- Reading instruction video
- Writing test instructions
- Writing instruction video
- Speaking test instructions
- Speaking instruction video

## Existing files to inspect

Inspect:

- docs/product/exam-engine-reference-audit.md
- docs/product/exam-engine-screen-types.md
- docs/product/mock-test-1-content-map.md
- docs/product/exam-engine-screen-shell.md

Inspect existing local media paths if present:

- public/assets/instructional-thumbnails/1. Overview Instructional Video.mp4
- public/assets/instructional-thumbnails/2. Listening Instructional Video.mp4
- public/assets/instructional-thumbnails/3. Reading Instructional Video.mp4
- public/assets/instructional-thumbnails/4. Writing Instructional Video.mp4
- public/assets/instructional-thumbnails/5. Speaking Instructional Video.mp4

Important:
The folder name may say instructional-thumbnails, but the files are videos. Do not move or rename them in this ticket. Just document the naming issue as a follow-up.

## Required files to create

Create:

src/features/exam-engine/instructional-video-assets.ts
src/features/exam-engine/instruction-screen-types.ts

src/components/exam/ExamInstructionScreen.tsx
src/components/exam/ExamVideoScreen.tsx
src/components/exam/ExamVideoPlayer.tsx
src/components/exam/ExamInstructionList.tsx
src/components/exam/ExamSectionIntroCard.tsx

docs/product/exam-engine-instruction-screens.md

## Optional preview route

Create a protected preview route:

src/app/dashboard/mock-tests/instruction-preview/page.tsx

This route should show:

1. Complete test overview video screen
2. Listening instruction text screen
3. Listening instructional video screen
4. Reading instruction text screen
5. Writing instruction text screen
6. Speaking instruction text screen

Use the real local instructional videos if they exist.

Use placeholder instruction text only where real instruction text is not yet structured.

Do not build a full sequence engine yet.
Do not save progress.
Do not create database tables.

## Instructional video asset registry

Create:

src/features/exam-engine/instructional-video-assets.ts

It should export a typed map like:

- overview
- listening
- reading
- writing
- speaking

Each item should include:

- title
- section
- src
- poster optional
- durationLabel optional
- description

Use the existing public video paths if available.

Example:

overview:
src: "/assets/instructional-thumbnails/1. Overview Instructional Video.mp4"

Do not download or copy media.

## Instruction screen requirements

ExamInstructionScreen should support:

- title
- subtitle
- instructions array
- notice text
- nextHref or onNext
- backHref or onBack
- timer optional
- children optional

It must use ExamShell.

It should look like an exam instruction screen:

- compact
- white canvas
- instruction list
- simple info row
- no marketing cards
- no playful UI
- no official branding

## Video screen requirements

ExamVideoScreen should support:

- title
- video title
- video src
- description
- helper text
- nextHref or onNext
- backHref or onBack

It must use ExamShell.

It should include ExamVideoPlayer.

## Video player requirements

ExamVideoPlayer should:

- use native HTML video
- show controls
- support preload metadata
- be responsive
- not autoplay
- show fallback text if video cannot load
- not require new dependencies
- not use external player libraries

## Copy rules

Use wording like:

- Toronto Academy practice test
- Practice test engine
- CELPIP-style practice
- Instructional video
- Continue when you are ready

Avoid:

- Official CELPIP test
- guaranteed score
- official score
- official engine
- official exam screen

## Dashboard link

If EXAM-01 added a temporary dashboard preview link, update it carefully to include:

- Shell preview
- Instruction preview

Mark both as internal preview.

Do not make this a public student-facing full mock test yet.

## Design requirements

Use the EXAM-01 shell style.

Do not use the marketing dashboard card style inside the exam canvas.

Video player should sit inside a clean bordered area.

Mobile should stack safely and avoid overflow.

## Integration rule

Do not connect this to real Mock Test 1 flow yet.

This ticket creates reusable screens and preview route only.

Future tickets will connect these to real flow.

## Documentation

Create:

docs/product/exam-engine-instruction-screens.md

Include:

1. Components created
2. Video asset map
3. Preview route
4. How the instruction screens match the exam flow
5. What was intentionally not built
6. Known follow-up items
7. How EXAM-03 should use these screens

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

- instructional text screen component exists
- instructional video screen component exists
- video player component exists
- video asset registry exists
- preview route exists
- preview route uses existing instructional videos if available
- no Listening Part 1 content is built
- no Reading Part 1 content is built
- no full Mock Test 1 flow is built
- no official screenshots are embedded
- no official CELPIP branding is copied
- existing Speaking and Writing AI flows are untouched
- no Supabase migration is created
- no dependencies are installed
- docs/product/exam-engine-instruction-screens.md exists
- npm run lint passes
- npm run build passes
