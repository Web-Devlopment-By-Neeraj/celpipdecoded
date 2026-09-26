# EXAM-15F - Listening Format, Strict Timing, and Exam Theme Polish

## Goal

Finalize Mock Test 1 Listening before starting Reading.

This ticket applies the findings from EXAM-15E.

Main goals:

1. Make the full Listening route stricter and closer to real exam behavior.
2. Correct Part 6 from radio questions to sentence-completion/dropdown style.
3. Keep Part 4 as dropdown because it is already correct.
4. Keep Part 5 as the source-supported question format for now.
5. Fix the orange-ish exam start background so the full test uses the same neutral exam theme.
6. Keep individual part routes flexible for developer testing.
7. Do not build Reading yet.

## Main route

Update:

/dashboard/mock-tests/mock-test-1/listening

This is the learner-facing full Listening route.

## Do not build

Do not build Reading.
Do not build Writing.
Do not build Speaking.
Do not build the full Mock Test 1 multi-section flow.
Do not build the admin panel.
Do not create database migrations.
Do not save answers to Supabase.
Do not change answer keys unless fixing a confirmed Part 6 UI mapping issue.
Do not change Speaking or Writing AI logic.
Do not build payment.
Do not build live classes.
Do not copy official CELPIP branding into production UI.

## Required research docs to read first

Read these documents before changing code:

docs/product/celpip-exam-rules-research.md
docs/product/listening-format-audit-and-correction-plan.md
docs/product/admin-mock-test-builder-blueprint.md
docs/product/exam-timer-foundation.md
docs/product/full-listening-qa-band-score.md
docs/product/full-listening-exam-mode-shell.md

Use these as the basis for this ticket.

## Task 1 - Exam theme background polish

Current issue:

When the full Listening exam starts, the background still feels orange-ish or not consistent with the locked exam screen.

Required:

- full Listening exam route should use the same neutral exam-mode color theme from start to finish
- no orange-ish background on instruction screen or start screen
- no marketing background inside the exam route
- exam viewport should feel like a controlled test software screen
- keep Toronto Academy branding subtle and professional
- do not add official CELPIP branding

Inspect likely files:

src/components/exam/ExamModeViewport.tsx
src/components/exam/ExamShell.tsx
src/components/exam/ExamTopBar.tsx
src/components/exam/listening/ListeningSectionInstructionScreen.tsx
src/components/exam/listening/ListeningSectionPrototype.tsx
src/features/exam-engine/exam-theme.ts
src/app/globals.css

Use actual files if names differ.

Expected result:

- neutral exam background
- stable top bar
- stable bottom nav
- white or neutral exam canvas
- no page-level orange or marketing gradient

## Task 2 - Correct Listening Part 6 format

EXAM-15E found that Part 6 needs correction.

Current issue:

Part 6 data is sentence-completion style, but the screen renders as radio question groups.

Required:

- convert Part 6 question UI to sentence-completion/dropdown style
- use existing Part 6 stems and options
- preserve all six answers
- preserve answer key
- preserve final scoring
- preserve estimated Listening band
- full Listening route should show corrected Part 6 UI
- individual Part 6 route should also show corrected Part 6 UI if it shares the same component
- do not change Part 6 source wording unless needed to fix display
- do not invent new content

Inspect likely files:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-6.ts
src/features/exam-engine/listening-viewpoints-types.ts
src/features/exam-engine/listening-viewpoints-flow.ts
src/components/exam/listening/ListeningViewpointsQuestionScreen.tsx
src/components/exam/listening/ListeningViewpointsQuestionList.tsx
src/components/exam/listening/ListeningPartSixPrototype.tsx
src/components/exam/listening/ListeningSectionPrototype.tsx
src/components/exam/listening/ListeningDropdownQuestionScreen.tsx
src/components/exam/listening/ListeningDropdownQuestionList.tsx

Use actual files if names differ.

Part 6 answer key must remain:

- q1: approve a plan to redevelop the vacant land.
- q2: could put her community at risk.
- q3: may be developed into a nature walkway.
- q4: compact community with a vibrant local economy.
- q5: both economic and community interests can be satisfied.
- q6: Mother of two, Eleanor Wentworth, will be disappointed.

## Task 3 - Keep Part 4 and Part 5 decisions from EXAM-15E

Part 4:

- keep as dropdown/sentence-completion
- do not redesign unless something is broken

Part 5:

EXAM-15E found that the local source supports the current question format.

Required:

- do not force Part 5 into dropdown in this ticket
- keep current Part 5 question behavior
- document that this is source-based even if it differs from the official-style pattern
- do not invent sentence-completion stems for Part 5

## Task 4 - Strict full Listening timing behavior

Apply strict behavior only to the full Listening route:

/dashboard/mock-tests/mock-test-1/listening

Individual part routes can stay flexible for testing.

Full route requirements:

- no Back button during active timed Listening question screens
- learner should not go back to previous questions or previous parts during the full test
- when timer expires, move forward automatically
- unanswered questions remain blank and are scored as incorrect
- selected answers are preserved
- no answer state should be erased
- no modal
- no alert
- no sound
- no flashing
- no page jump

For Listening Parts 1-3:

- each question screen has a 30-second timer
- when time expires, advance to the next question or next part transition

For Listening Parts 4-6:

- one timer for the whole question screen
- do not use 30 seconds for the full multi-question screen if the source/research docs provide a better duration
- use timing values from EXAM-15E docs or Mock Test 1 source files where available
- if timing is conflicting or not confirmed, use the documented best available value and clearly document it
- when time expires, advance to the next part or review screen

Do not implement Reading timer here.

## Task 5 - Media behavior in full route

Full Listening route should move closer to exam style.

Required:

- instruction video can autoplay when entering the video screen if browser allows
- instruction video should still have controls because it is instructional
- Listening audio/video should attempt autoplay after the learner enters the media screen
- if browser autoplay blocks playback, show a clear play prompt
- do not break media playback
- do not download media
- do not change Cloudinary URLs unless fixing a broken mapping

Important:

Browser autoplay policies may block unmuted audio/video unless there was a user gesture. Since the learner clicks Next to enter the screen, attempt autoplay after that user action. If autoplay fails, show fallback text or play button.

## Task 6 - Review and score regression

Final Listening review and score must still work.

Required:

- final review shows all 38 questions
- final score is out of 38
- part breakdown works
- estimated CELPIP Listening band still appears
- wording says practice estimate, not official score
- no official CELPIP score or level claim

## Task 7 - Documentation

Create:

docs/product/listening-format-strict-timing-polish.md

Include:

1. What was fixed
2. Background/theme correction
3. Part 6 format correction
4. Part 4 and Part 5 decisions
5. Full route strict timing behavior
6. Timer durations used for Parts 1-6
7. Media autoplay behavior
8. What happens when time expires
9. What remains flexible in individual part routes
10. Review and score regression result
11. Known intentional gaps
12. How EXAM-16 Reading should start next

Known intentional gaps:

- no database save
- no persisted timing history
- no admin panel yet
- no full Mock Test 1 all-skill flow yet
- no proctoring or focus lock
- browser autoplay can still be blocked
- Part 5 remains source-based pending future mock authoring standards

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not touch Supabase helpers
- Do not call service role
- Do not change auth
- Do not create migrations
- Do not expose answer keys to client question screens
- Do not save answers to database

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

- full Listening route uses neutral exam background from start
- no orange-ish exam start background remains
- Part 6 renders as sentence-completion/dropdown style
- Part 6 answer key still works
- Part 4 remains correct
- Part 5 remains source-based
- full route hides Back during active timed question screens
- full route auto-advances when timer expires
- Parts 1-3 use per-question timing
- Parts 4-6 use screen-level timing
- final review still works
- final score remains out of 38
- estimated Listening band still appears
- individual part routes still work by direct URL
- no Reading is built
- no database save is created
- no Supabase migration is created
- no dependencies are installed
- docs/product/listening-format-strict-timing-polish.md exists
- npm run lint passes
- npm run build passes
