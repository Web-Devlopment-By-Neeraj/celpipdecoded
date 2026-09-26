# EXAM-15A - Mock Test 1 Listening Dashboard Cleanup and Part 1 Key Security

## Goal

Clean up the Mock Test dashboard experience after EXAM-15.

The learner-facing dashboard should show only the full Mock Test 1 Listening test.

Also fix the known Part 1 answer key security gap so the Part 1 individual route no longer sends answerKey or correctOptionId to the browser question screen.

Do not build Reading.
Do not build Writing.
Do not build Speaking.
Do not build the full Mock Test 1 multi-section flow.
Do not save answers to Supabase.
Do not create Supabase migrations.
Do not change existing Speaking AI logic.
Do not change existing Writing AI logic.
Do not change AI scoring prompts.
Do not build payment.
Do not build live classes.
Do not use official screenshots as public UI images.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Main dashboard expectation

The dashboard should show one clear card for Mock Test 1 Listening:

Title:
Mock Test 1 - Listening Test

Route:
/dashboard/mock-tests/mock-test-1/listening

Description:
Complete the full Listening section with instructions, media, all 6 parts, answer review, and practice score.

This should be the main visible learner-facing Listening test card.

## Hide internal preview links

Remove or hide these individual part preview cards from the dashboard:

- Mock Test 1 Listening Part 1 Prototype
- Mock Test 1 Listening Part 2 Prototype
- Mock Test 1 Listening Part 3 Prototype
- Mock Test 1 Listening Part 4 Prototype
- Mock Test 1 Listening Part 5 Prototype
- Mock Test 1 Listening Part 6 Prototype

Also remove or hide earlier shell or instruction preview cards if they still appear on the learner dashboard:

- shell preview
- instruction preview
- any old internal preview card that is not the full Listening test

Important:

Do not delete the routes.

These routes should continue to work if a developer types the URL directly:

- /dashboard/mock-tests/mock-test-1/listening/part-1
- /dashboard/mock-tests/mock-test-1/listening/part-2
- /dashboard/mock-tests/mock-test-1/listening/part-3
- /dashboard/mock-tests/mock-test-1/listening/part-4
- /dashboard/mock-tests/mock-test-1/listening/part-5
- /dashboard/mock-tests/mock-test-1/listening/part-6
- /dashboard/mock-tests/shell-preview
- /dashboard/mock-tests/instruction-preview

Only remove the visible dashboard links/cards.

## Internal preview wording

The full Listening card should not feel like a temporary developer-only card.

Use learner-facing wording:

Mock Test 1 - Listening Test

Avoid showing "Internal preview" on this main card.

The app can still be private during development, but the visible card should look like the final student-facing entry point.

## Part 1 answer key security fix

Known issue from EXAM-15:

The individual Part 1 route may still pass listeningPart1 directly to the client prototype after Part 1 gained an answer key.

Fix this route:

/dashboard/mock-tests/mock-test-1/listening/part-1

Required behavior:

- answerKey must not reach the browser question screen
- correctOptionId must not reach the browser question screen
- Part 1 review and score must still work
- selected answers stay in local React state
- final marking uses the same server-action pattern already used by Parts 2 to 6
- no API route
- no database write
- no cookies
- no localStorage

Prefer reusing existing utilities if possible.

If Part 1 needs its own server action, create it near the Part 1 route, matching the pattern used for the other part routes.

## Required files to inspect

Inspect dashboard preview/card source files. Likely files include one or more of:

src/components/exam/ExamShellPreviewLinks.tsx
src/components/exam/ExamShellPreviewList.tsx
src/components/exam/ExamShellPreviewLauncher.tsx
src/components/exam/ExamShellPreviewDashboard.tsx
src/app/dashboard/page.tsx
src/app/dashboard/mock-tests/page.tsx
src/features/exam-engine/listening-copy.ts

Use the actual files in the project.

Inspect Part 1 files. Likely files include:

src/app/dashboard/mock-tests/mock-test-1/listening/part-1/page.tsx
src/app/dashboard/mock-tests/mock-test-1/listening/part-1/actions.ts
src/features/exam-engine/mock-tests/mock-test-1/listening-part-1.ts
src/components/exam/listening/ListeningPartOnePrototype.tsx
src/features/exam-engine/listening-score.ts

Use the actual files in the project.

## Required files to create or update

Update dashboard card/list source so only the full Listening test is visible.

Update Part 1 route and scoring pattern so answer keys are stripped before crossing to the client.

Create documentation:

docs/product/mock-test-1-listening-dashboard-cleanup.md

## Dashboard card requirements

The visible card should show:

Title:
Mock Test 1 - Listening Test

Subtitle or description:
Complete the full Listening section with instructions, all 6 parts, answer review, and practice score.

Route:
/dashboard/mock-tests/mock-test-1/listening

Metadata:

- Section: Listening
- Parts: 6
- Questions: 38
- Status: Available

Do not show:

- Part 1 internal link
- Part 2 internal link
- Part 3 internal link
- Part 4 internal link
- Part 5 internal link
- Part 6 internal link
- shell preview link
- instruction preview link
- Internal preview badge on the main card

## Part 1 security test requirement

After the fix, test the individual Part 1 route.

Open:

/dashboard/mock-tests/mock-test-1/listening/part-1

Before review is requested, DevTools Network or page payload should not contain:

- answerKey
- correctOptionId
- known correct option ids
- known correct answer text from the key, except where the text is already visible as a normal answer option

Known Part 1 correct option ids:

- listening-part-1-q1-d
- listening-part-1-q2-a
- listening-part-1-q3-a
- listening-part-1-q4-b
- listening-part-1-q5-d
- listening-part-1-q6-a
- listening-part-1-q7-b
- listening-part-1-q8-c

The correct answers may still appear as normal visible option text if they are part of the choices. That is fine.

But the answer key structure and correctOptionId fields should not be sent to the question screen.

## Full Listening route regression

Confirm this route still works:

/dashboard/mock-tests/mock-test-1/listening

Required:

- instruction screen works
- instructional video screen works
- Parts 1 to 6 flow works
- final review works
- final score works
- total remains 38
- part breakdown still works
- no official CELPIP score or level appears

## Individual part route regression

Confirm these routes still load if typed manually:

- /dashboard/mock-tests/mock-test-1/listening/part-1
- /dashboard/mock-tests/mock-test-1/listening/part-2
- /dashboard/mock-tests/mock-test-1/listening/part-3
- /dashboard/mock-tests/mock-test-1/listening/part-4
- /dashboard/mock-tests/mock-test-1/listening/part-5
- /dashboard/mock-tests/mock-test-1/listening/part-6

They should not be visible on the dashboard, but should still work for developer testing.

## Documentation

Create:

docs/product/mock-test-1-listening-dashboard-cleanup.md

Include:

1. Dashboard card changes
2. Which links were hidden
3. Routes preserved for developer testing
4. Part 1 security issue fixed
5. Part 1 scoring pattern after fix
6. Full Listening route regression result
7. Individual route regression result
8. What is intentionally not built
9. How EXAM-16 Reading should start next

## Known intentional gaps

Document these as still intentional:

- full app is still not a public paid product flow
- no database save for Listening attempts
- no persisted Listening score history
- media can still be replayed
- timers are still static
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

- Dashboard shows only one Mock Test 1 Listening card
- Main card title is Mock Test 1 - Listening Test
- Main card links to /dashboard/mock-tests/mock-test-1/listening
- Main card does not show Internal preview
- Individual Part 1 to Part 6 preview cards are hidden from dashboard
- Shell and instruction preview cards are hidden from dashboard
- Individual part routes still work by direct URL
- Part 1 answer key is stripped before reaching the client question screen
- Part 1 review and score still work
- Full Listening route still works
- Total Listening score remains out of 38
- No Reading is built
- No database save is created
- No Supabase migration is created
- Existing Speaking and Writing AI flows are untouched
- docs/product/mock-test-1-listening-dashboard-cleanup.md exists
- npm run lint passes
- npm run build passes
