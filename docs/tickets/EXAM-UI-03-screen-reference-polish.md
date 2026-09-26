# EXAM-UI-03 - Mock Test Screen-by-Screen Reference Polish

## Goal

Polish the mock test screens screen by screen using private visual references and current app screenshots.

This ticket focuses on Listening, Writing, and Speaking screen polish.

Do not rebuild test logic.
Do not change questions.
Do not change answer keys.
Do not change scoring.
Do not change AI prompts.
Do not change transcription.
Do not change Supabase.
Do not create migrations.
Do not change admin builder.
Do not change auth.
Do not copy official CELPIP branding, logos, footer text, or copyrighted UI.

## Important clarification

Some reference screenshots are from the real CELPIP practice/mock test.

Use them only as private visual reference for structure, spacing, layout, and interaction feel.

Do not import those images into the app.
Do not place those images in public.
Do not commit those images.
Do not copy the official UI pixel for pixel.
Do not copy official footer/copyright text.
Do not imply affiliation with CELPIP, Paragon, or Prometric.

Build an original CELPIP Decoded practice simulator with a similar exam-room structure.

## Reference screenshots

Private reference examples:

- 01-listening-instructions
- 02-listening-audio-screen
- 03-listening-question-options

Current app screenshots:

- 05-our-speaking-mic
- our-speaking-preparation
- our-speaking-mic side by side
- our-writing-editor part 1
- our-writing-editor part 2

Use the screenshots for comparison only.

## Scope

Polish these areas:

1. Listening instructions screen
2. Listening audio playback screen
3. Listening question/options screen
4. Listening Part 5 and Part 6 dropdown behavior
5. Writing Task 1 and Task 2 editor screens
6. Speaking preparation and microphone screens

## Listening instructions screen

Improve:

- compact grey top bar
- centered exam window
- white content area
- info icon beside heading
- bullet list spacing
- subtle divider lines
- smaller readable text
- clean bottom navigation
- no marketing style
- no CELPIP Decoded logo inside active test frame

Keep wording practice-safe.

Do not copy official footer/copyright text.

## Listening audio screen

Improve:

- simple audio visual block
- speaker icon area
- "Playing..." label
- progress bar visual
- native audio control if already used
- playbar note
- compact centered layout
- no oversized marketing card

Do not change actual audio logic.

## Listening question/options screen

Improve:

- left audio panel
- right question/options panel
- compact radio rows
- proper divider lines
- controlled hover state
- selected option highlight

Important:
The green hover/selected effect should be deliberate and clean.

Use pale green only for selected or active state.
Hover can be very subtle pale green or neutral.
Do not use harsh bright green.
Do not let hover make the screen look messy.

## Listening Part 5 and Part 6

Fix regression:

- Part 5 should render as dropdown-style questions if the source requires dropdown style.
- Part 6 should render as dropdown-style questions if the source requires dropdown style.
- Do not render Part 5 and Part 6 as long vertical radio lists when dropdown is expected.
- Preserve existing content and answer keys.
- Preserve scoring.

## Writing editor

Polish Writing Task 1 and Task 2 screens:

- compact exam window
- prompt on top or side in a clear panel
- writing editor should be large but not oversized
- word count visible
- timer visible
- clean border
- no dashboard/marketing look
- text size comfortable for typing
- buttons compact

Do not change writing AI review.

## Speaking preparation and mic screens

Polish Speaking screens:

- preparation screen should feel like exam preparation, not a marketing card
- microphone/recording screen should be clean and centered
- timer should be visible but not huge
- recording button should look intentional
- audio preview should not stretch
- visual prompts should fit the frame
- side-by-side layout should be cleaned up where useful

Do not change microphone, transcription, or AI review logic.

## Shared components

Create or update only if needed:

- src/components/exam/player/MockTestInfoIcon.tsx
- src/components/exam/player/MockTestAudioVisual.tsx
- src/components/exam/player/MockTestOptionRow.tsx
- src/components/exam/player/MockTestDropdownCompletion.tsx
- src/components/exam/player/MockTestWritingEditorFrame.tsx
- src/components/exam/player/MockTestSpeakingRecorderFrame.tsx

Reuse existing player shell from EXAM-UI-02.

## Routes to test

- /dashboard/mock-tests/mock-test-1/listening
- /dashboard/mock-tests/mock-test-1/writing
- /dashboard/mock-tests/mock-test-1/speaking

Also lightly check:

- /dashboard/mock-tests/mock-test-1/reading
- /dashboard
- /dashboard/admin/mock-tests

## Legal safety

Do not copy official CELPIP logo.
Do not copy official footer/copyright text.
Do not use official CELPIP assets.
Do not imply affiliation.
Keep practice-only language.

## Documentation

Create:

docs/brand/exam-ui-screen-reference-polish.md

Include:

1. Screens polished
2. Reference usage note
3. Listening instruction changes
4. Audio screen changes
5. Option hover/selected behavior
6. Part 5 and Part 6 dropdown fix
7. Writing editor polish
8. Speaking mic/prep polish
9. What was intentionally not changed
10. Test checklist

## Validation

Run:

npm run lint
npm run build

Search changed files for:

- em dashes
- long hyphens
- curly quotes

Replace with normal hyphens and straight quotes.

## Done criteria

- Listening instructions screen is cleaner and closer to exam-window structure
- Listening audio screen looks cleaner
- Listening question/options screen looks cleaner
- Option hover/selected state is controlled
- Part 5 uses dropdown-style UI where required
- Part 6 uses dropdown-style UI where required
- Writing Task 1 editor looks cleaner
- Writing Task 2 editor looks cleaner
- Speaking preparation screen looks cleaner
- Speaking mic/recording screen looks cleaner
- No real CELPIP screenshots are committed
- No Supabase changes
- No migrations
- No scoring changes
- No admin feature changes
- npm run lint passes
- npm run build passes
