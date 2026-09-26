# EXAM-UI-02 - Full Mock Test Player Redesign

## Goal

Redesign the entire Mock Test 1 player UI so it feels like a compact exam simulator window, not a dashboard page or marketing page.

This is a full mock test screen redesign.

This ticket may refactor the UI components for Listening, Reading, Writing, and Speaking mock test screens.

Do not rebuild the test logic.
Do not change question content.
Do not change answer keys.
Do not change scoring logic.
Do not change AI prompts.
Do not change transcription logic.
Do not change Supabase.
Do not create migrations.
Do not change admin builder data model.
Do not build new admin features.
Do not replace authentication.
Do not change environment variables.
Do not copy official CELPIP branding, logos, footer text, or copyrighted UI.

## Source direction

Use the CELPIP Decoded brand brief as business direction.

The platform needs a real-format interactive mock-test engine with audio, timers, writing box, mic recording, Listening/Reading auto-scoring, and one working mock test proven before loading the rest.

Important:
Use the structure and exam-room feeling as inspiration.
Do not copy official CELPIP branding.
Do not copy official copyright/footer text.
Do not imply affiliation.
Do not use the official CELPIP logo.

## Main problem

Current mock test screens feel wrong:

- too full-screen
- stretched
- oversized typography
- content feels too narrow or awkward
- scrolling is not smooth inside the test
- images can feel too large
- brand styling leaks into the exam player
- the screen does not feel like a contained exam application

## Design principle

Separate the product brand from the active test environment.

CELPIP Decoded branding belongs on:

- home
- login
- dashboard
- admin
- course pages
- community pages
- result/report pages where appropriate

The active mock test player should be neutral, compact, and exam-like.

## Target layout

Build a centered exam window.

Desktop:

- page background: light grey
- exam frame centered
- frame max width: 1040px to 1120px
- frame min width should not force horizontal page scroll
- top margin: 32px to 48px
- bottom margin: 32px
- frame border: light grey
- frame background: white
- top bar: compact grey title bar
- content area: white
- bottom bar: compact grey navigation bar
- internal scroll area for content
- page itself should not stretch the exam to the full browser width

Typography:

- body text: 15px to 17px
- task instructions: 16px to 18px
- section title: 18px to 22px
- avoid huge marketing headlines
- compact spacing
- readable line height

Buttons:

- compact blue exam buttons
- uppercase labels for Next and Back are acceptable
- no large rounded marketing buttons inside test player
- Next should stay top right or bottom right depending on screen
- Back should stay bottom right or bottom left based on existing logic

## New component architecture

Create a proper exam player shell.

Required new or updated components:

src/components/exam/player/MockTestPlayerShell.tsx
src/components/exam/player/MockTestTopBar.tsx
src/components/exam/player/MockTestContentPane.tsx
src/components/exam/player/MockTestBottomBar.tsx
src/components/exam/player/MockTestButton.tsx
src/components/exam/player/MockTestInstructionList.tsx
src/components/exam/player/MockTestMediaFrame.tsx
src/components/exam/player/MockTestSplitPane.tsx
src/components/exam/player/MockTestTimerBadge.tsx
src/components/exam/player/MockTestQuestionPanel.tsx
src/components/exam/player/MockTestReviewPanel.tsx

Use these to rebuild the UI layer of the mock test routes.

Do not remove existing logic unless it is clearly only old UI layout.

## Routes affected

Redesign these routes:

- /dashboard/mock-tests/mock-test-1/listening
- /dashboard/mock-tests/mock-test-1/reading
- /dashboard/mock-tests/mock-test-1/writing
- /dashboard/mock-tests/mock-test-1/speaking

Do not redesign these in this ticket:

- /
- /login
- /dashboard
- /dashboard/speaking
- /dashboard/writing
- /dashboard/admin/mock-tests

## Listening redesign

Redesign all Listening screens.

Screens to cover:

1. Listening instructions
2. Listening instruction video screen if present
3. Part intro screens
4. Audio/image prompt screens
5. Question screens
6. Review screen
7. Result screen

Listening layout rules:

- use centered exam frame
- no full-screen stretch
- instruction list should fit naturally
- text should not be huge
- media should fit inside frame
- image max height should respect content area
- vertical scrolling must work inside content pane
- audio controls should be compact
- questions should appear in a clear panel
- radio options should be compact and readable
- Next/Back should remain accessible
- result screen can be slightly more modern, but still compact

Do not change Listening answer logic.
Do not change Listening score logic.
Do not change Listening media source logic.

## Reading redesign

Redesign all Reading screens.

Screens to cover:

1. Reading instructions
2. Reading instruction video screen if present
3. Part intro screens
4. Passage and question screens
5. Dropdown or option question screens
6. Review screen
7. Result screen

Reading layout rules:

- centered exam frame
- split pane for passage left and questions right where needed
- left pane scrolls if passage is long
- right pane scrolls if questions are long
- no huge text
- no awkward full browser stretch
- dropdowns and options should feel exam-like
- content should remain usable at laptop screen size

Do not change Reading answer logic.
Do not change Reading score logic.
Do not change Reading answer keys.

## Writing redesign

Redesign Writing mock test screens.

Screens to cover:

1. Writing instructions
2. Task 1 prompt and editor
3. Task 2 prompt and editor
4. completion screen
5. AI review processing
6. AI result screen

Writing layout rules:

- centered exam frame
- prompt panel and editor should fit inside the frame
- textarea should be large enough but not full browser height
- word count should be visible
- timer should be compact
- AI result screen can use CELPIP Decoded report styling but should not feel oversized
- disclaimer must remain clear

Do not change Writing AI logic.
Do not change scoring prompt.
Do not change writing result schema.

## Speaking redesign

Redesign Speaking mock test screens.

Screens to cover:

1. Speaking instructions
2. Task 1-8 screens
3. preparation timer
4. recording timer
5. audio preview
6. completion screen
7. AI review processing
8. AI result screen

Speaking layout rules:

- centered exam frame
- prompt should be clear and compact
- visual prompt should fit the frame
- timers should be prominent but not huge
- recording controls should be clean and compact
- audio preview should not stretch
- AI result screen should be structured and readable

Do not change microphone logic.
Do not change transcription logic.
Do not change Speaking AI evaluation logic.

## Scroll requirements

This is critical.

The test player must avoid trapped content.

Rules:

- outer page can scroll only if viewport is very small
- exam content pane should scroll internally
- images must not push navigation out of reach
- long reading passages should scroll in their pane
- long question lists should scroll in their pane
- bottom navigation should remain visible
- avoid nested scroll areas unless needed for split reading layout
- no horizontal overflow on laptop screens

## Responsive behavior

Desktop and laptop are priority for client demo.

Minimum requirement:

- works well at 1366x768
- works well at 1440x900
- works well at 1536x864
- acceptable at mobile width
- no horizontal page scroll
- navigation reachable

## Visual style

Use neutral exam UI.

Suggested values:

- outer background: #f2f2f2 or neutral-100
- frame background: #ffffff
- top bar: #e5e7eb or #d9dde3
- bottom bar: #e5e7eb or #d9dde3
- border: #cfd4dc
- primary button: blue exam style
- text: #1f2937
- instruction heading blue is acceptable
- avoid heavy CELPIP Decoded teal in active exam screens

Brand colors can remain outside the exam player.

## Legal safety

Do not use official CELPIP logo.
Do not copy official footer copyright text.
Do not claim official affiliation.
Do not use official CELPIP blue-red branding.
Do not copy a competitor product name.
Keep practice-only wording.

## Implementation method

First inspect current mock test components.

Then create the shared player shell.

Then update each section screen gradually:

1. Listening
2. Reading
3. Writing
4. Speaking

After each section update, manually test that the route still works.

Do not rewrite all business logic at once.

Prefer wrapping existing logic in new layout components.

## Documentation

Create:

docs/brand/full-mock-test-player-redesign.md

Include:

1. Why the mock test player was redesigned
2. Separation of brand UI and exam UI
3. New shared player components
4. Listening screens updated
5. Reading screens updated
6. Writing screens updated
7. Speaking screens updated
8. Scroll behavior decisions
9. Responsive behavior decisions
10. What was intentionally not changed
11. Client demo checklist
12. Known remaining polish items

## Manual Supabase steps

None.

Do not run SQL.
Do not create migrations.

## Security

- do not read .env.local
- do not print secrets
- do not change Supabase keys
- do not change API keys
- do not expose service role
- do not change auth

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

- em dashes
- long hyphens
- curly quotes

Replace with normal hyphens and straight quotes.

## Done criteria

- Listening instructions look like compact exam screen
- Listening media/image screens fit and scroll properly
- Listening questions remain functional
- Listening review and result still work
- Reading instructions look like compact exam screen
- Reading passage/question screens use usable split layout
- Reading review and result still work
- Writing prompt/editor screens fit inside compact exam frame
- Writing AI review still works
- Speaking task screens fit inside compact exam frame
- Speaking recording still works
- Speaking AI review still works
- No active mock test screen uses large marketing layout
- No active mock test screen shows CELPIP Decoded logo inside the exam frame
- Dashboard and landing still keep CELPIP Decoded branding
- No Supabase changes
- No migrations
- No scoring changes
- No admin feature changes
- npm run lint passes
- npm run build passes
