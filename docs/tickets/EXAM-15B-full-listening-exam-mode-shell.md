# EXAM-15B - Full Listening Exam Mode Shell

## Goal

Convert the full Mock Test 1 Listening route into a locked exam-mode screen.

The full Listening test should no longer look like a dashboard details page or internal preview.

It should feel like a real computer-based test screen:

- no dashboard breadcrumbs
- no Details heading trail
- no INTERNAL PREVIEW label
- no internal preview warning box
- no full-page scrolling
- fixed top exam bar
- fixed bottom navigation area
- stable middle exam canvas
- internal scrolling only inside the question or review content area when needed

Do not build Reading.
Do not build Writing.
Do not build Speaking.
Do not build the full Mock Test 1 multi-section flow.
Do not change answer content.
Do not change answer keys.
Do not change scoring logic unless required for layout integration.
Do not save answers to Supabase.
Do not create Supabase migrations.
Do not change Speaking AI logic.
Do not change Writing AI logic.
Do not build payment.
Do not build live classes.
Do not use official screenshots as public UI images.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Route to update

Update only the full Listening route:

/dashboard/mock-tests/mock-test-1/listening

File:

src/app/dashboard/mock-tests/mock-test-1/listening/page.tsx

This route should render in exam mode.

## Routes to preserve

Do not delete or break these developer routes:

/dashboard/mock-tests/mock-test-1/listening/part-1
/dashboard/mock-tests/mock-test-1/listening/part-2
/dashboard/mock-tests/mock-test-1/listening/part-3
/dashboard/mock-tests/mock-test-1/listening/part-4
/dashboard/mock-tests/mock-test-1/listening/part-5
/dashboard/mock-tests/mock-test-1/listening/part-6
/dashboard/mock-tests/shell-preview
/dashboard/mock-tests/instruction-preview

They can still look like internal routes.

This ticket is only for the full Listening route.

## Current problem

The full Listening route currently shows dashboard page chrome, such as:

- Dashboard / Details / Details / Details
- INTERNAL PREVIEW
- Mock Test 1 Full Listening Section
- internal preview warning box
- normal web page scrolling

This makes it feel like a prototype page, not a locked test screen.

## Required result

The full Listening route should show only the exam experience.

Visible top-level screen should be:

Mock Test 1 - Listening Test

The route should not display:

- breadcrumbs
- Details labels
- INTERNAL PREVIEW
- internal preview warning box
- page-level description paragraphs
- dashboard wrapper spacing above the exam
- normal page scroll

## Important implementation note

Because this route is inside /dashboard, it may be wrapped by a dashboard layout.

Inspect how dashboard breadcrumbs and page chrome are rendered.

Use the safest project-compatible approach:

Option A:
If the dashboard layout supports hiding chrome for specific routes, add a route-aware hide rule for:

/dashboard/mock-tests/mock-test-1/listening

Option B:
If the dashboard layout cannot be bypassed cleanly, render the full Listening test in a fixed exam-mode overlay:

- fixed inset-0
- high z-index
- background matching exam UI
- h-[100dvh]
- overflow-hidden
- body scroll locked while mounted

This overlay should cover the dashboard breadcrumbs and remove the web-page feeling.

Prefer the smallest safe change.

Do not restructure the whole dashboard app.

## Required files to inspect

Likely files:

src/app/dashboard/layout.tsx
src/app/dashboard/page.tsx
src/app/dashboard/mock-tests/mock-test-1/listening/page.tsx
src/components/exam/listening/ListeningSectionPrototype.tsx
src/components/exam/ExamShell.tsx
src/components/exam/ExamShellFrame.tsx
src/components/exam/ExamShellPreviewLayout.tsx
src/features/exam-engine/exam-theme.ts

Use the actual files in the project.

## Required files to create or update

Create if needed:

src/components/exam/ExamModeViewport.tsx

Update:

src/app/dashboard/mock-tests/mock-test-1/listening/page.tsx
src/components/exam/listening/ListeningSectionPrototype.tsx
src/components/exam/ExamShell.tsx or related shell component only if needed
src/features/exam-engine/exam-theme.ts only if needed

Create documentation:

docs/product/full-listening-exam-mode-shell.md

## Exam mode viewport requirements

Create a reusable exam-mode viewport component if helpful.

Suggested behavior:

- client component
- locks document body scrolling while mounted
- restores body overflow on unmount
- uses fixed inset-0
- uses height: 100dvh
- uses overflow-hidden
- uses a neutral exam background
- contains the exam shell only

Suggested structure:

outer:
fixed inset-0 z-50 bg-slate-100 overflow-hidden

inner:
h-[100dvh] w-full max-w-[1366px] mx-auto flex flex-col

top:
fixed-height exam bar

middle:
flex-1 min-h-0 overflow-hidden

content:
h-full min-h-0 overflow-hidden

bottom:
fixed-height navigation bar

The exact class names can differ, but the behavior must match.

## Scrolling rules

Whole page scrolling should be prevented.

Allowed:

- internal scrolling inside a long question list
- internal scrolling inside the full answer review table
- internal scrolling inside score breakdown if needed on smaller screens

Not allowed:

- browser page scroll moving the whole exam up and down
- breadcrumbs appearing above the exam
- dashboard page text above the exam
- bottom button drifting below the viewport

## Full Listening route UI copy

Replace route-level copy with learner-facing exam copy.

Use:

Mock Test 1 - Listening Test

Do not show:

Internal preview
Prototype
Details
This is an internal preview
This is a practice prototype

The score screen may still show:

This is a Toronto Academy practice result, not an official CELPIP score.

That note is allowed because it protects the product legally.

## Existing flow to preserve

Do not change the full Listening flow sequence:

1. Listening instruction screen
2. Listening instructional video screen
3. Part 1
4. Part 2
5. Part 3
6. Part 4
7. Part 5
8. Part 6
9. Full answer review
10. Full practice score
11. End of Listening section

Do not show part-level scores during the full flow.

Total score must remain out of 38.

## Layout details

The exam screen should feel steady.

The top exam bar should stay in the same place.

The bottom Back and Next area should stay in the same place.

The middle panel should not cause the whole browser page to scroll.

For screens with many items, scroll only inside the middle panel.

For example:

- Part 4 dropdown list can scroll internally if needed
- Part 5 8-question screen can scroll internally if needed
- full answer review can scroll internally if needed

## Dashboard card

Do not change the EXAM-15A dashboard card unless necessary.

The dashboard should still show one visible card:

Mock Test 1 - Listening Test

Route:

/dashboard/mock-tests/mock-test-1/listening

No Internal preview badge on the dashboard card.

## Documentation

Create:

docs/product/full-listening-exam-mode-shell.md

Include:

1. What problem was fixed
2. Route updated
3. How dashboard chrome was removed or covered
4. Exam viewport strategy
5. Scroll-lock strategy
6. Which areas can scroll internally
7. Flow preserved
8. Routes preserved
9. What is intentionally not built
10. How EXAM-16 Reading should start next

## Known intentional gaps

Document these as still intentional:

- media can still be replayed
- media does not autoplay
- Next does not wait for media completion
- timers are still static
- no database save for Listening attempts
- no persisted Listening score history
- no full Mock Test 1 assembly across Listening, Reading, Writing, and Speaking
- Reading has not started yet

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

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, docs, comments, or prompts. Use normal hyphens only.

## Done criteria

- Full Listening route no longer shows dashboard breadcrumbs
- Full Listening route no longer shows INTERNAL PREVIEW
- Full Listening route no longer shows internal preview warning box
- Full Listening route title is Mock Test 1 - Listening Test
- Full Listening route uses a fixed exam-mode viewport
- Browser page does not scroll during the exam
- Top exam bar stays fixed
- Bottom navigation area stays fixed
- Middle content area is stable
- Long question or review content can scroll internally
- Full Listening flow still works from instruction to end screen
- Final score still works out of 38
- No official CELPIP score or level is shown
- Dashboard still shows only one Mock Test 1 Listening card
- Individual part routes still work by direct URL
- No Reading is built
- No database save is created
- No Supabase migration is created
- Existing Speaking and Writing AI flows are untouched
- docs/product/full-listening-exam-mode-shell.md exists
- npm run lint passes
- npm run build passes
