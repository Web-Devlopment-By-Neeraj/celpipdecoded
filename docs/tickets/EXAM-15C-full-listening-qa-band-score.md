CC# EXAM-15C - Full Listening QA, Exam Lock Polish, and Estimated Band Score

## Goal

Polish and QA the full Mock Test 1 Listening route after EXAM-15B.

This ticket fixes the Part 3 Question 1 audio issue, improves the locked exam-mode feeling, and uses the CELPIP band score criteria already placed in the project to show an estimated Listening band at the end.

Do not build Reading.
Do not build Writing.
Do not build Speaking.
Do not build the full Mock Test 1 multi-section flow.
Do not change question text unless correcting a broken source mapping.
Do not change answer keys unless a clear mismatch is found.
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

## Main route

Update and QA:

/dashboard/mock-tests/mock-test-1/listening

File:

src/app/dashboard/mock-tests/mock-test-1/listening/page.tsx

## Problem 1 - Part 3 Question 1 audio missing

In the full Listening test, Part 3 Question 1 shows that the audio is not available, even though the link exists in the content/source.

Fix this issue for:

- full Listening route
- individual Part 3 route, if the same issue appears there

Inspect these files:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-3.ts
src/features/exam-engine/listening-information-types.ts
src/features/exam-engine/listening-information-flow.ts
src/components/exam/listening/ListeningPartThreePrototype.tsx
src/components/exam/listening/ListeningSectionPrototype.tsx
src/components/exam/listening/ListeningSectionPartTransitionScreen.tsx
src/features/exam-engine/mock-tests/mock-test-1/full-listening-section.ts

Use the actual files in the project.

Required:

- Find why Part 3 Question 1 audio is not rendered.
- Confirm the media URL is present in the content object.
- Confirm the full Listening flow passes the correct media field to the Part 3 screen.
- Fix the mapper/adapter if the media field name is mismatched.
- Do not hardcode a one-off UI hack if the issue is from a shared adapter.
- Confirm Part 3 Questions 1 to 6 all show the correct audio where required.
- Confirm Part 3 individual route still works.

## Problem 2 - Full exam screen still must feel locked

EXAM-15B added exam mode, but this ticket should tighten the screen so it feels like a real computer-based exam screen.

The full Listening route should have:

- no browser page scrolling
- no dashboard breadcrumbs
- no INTERNAL PREVIEW label
- no prototype warning box
- no page header above the exam
- no dashboard layout feeling
- fixed top exam bar
- fixed bottom navigation bar
- stable middle content area
- internal scroll only where needed

Allowed internal scrolling:

- long question lists
- Part 5 question screen
- Part 6 question screen if needed
- full answer review
- score breakdown on smaller screens

Not allowed:

- whole browser page moving up and down
- bottom navigation disappearing below the viewport
- exam canvas jumping height between screens in a distracting way

## Problem 3 - Use CELPIP band score criteria

The user has already placed CELPIP band score criteria in the project.

Find the source file or document in the repo. Search likely locations:

public/
public/Overview and Scoring Descriptors/
docs/
docs/product/
_reference/
mock-tests/
reference/

Search terms:

- CELPIP
- band
- score
- scoring
- descriptor
- Listening
- CLB
- level

Use only the criteria that is actually present in the project.

Do not invent a band mapping.

If the project contains a raw Listening score to CELPIP band or level mapping, implement it.

If the project contains only general descriptors and no raw score conversion table, document that clearly and do not invent a conversion.

## Estimated band wording

If a valid mapping exists, the final Listening score screen should show:

- Raw practice score
- Percentage
- Estimated CELPIP Listening band
- Brief descriptor from the provided criteria, if available
- Clear note that this is not official

Use wording like:

Estimated practice band

or

Estimated CELPIP Listening band

Do not use wording like:

Official CELPIP score
Official CELPIP band
Guaranteed band
Final CELPIP result

Required note:

This is a Toronto Academy practice estimate, not an official CELPIP score.

## Score screen requirements

The final full Listening score screen should show:

- title: Listening Practice Score
- total questions: 38
- answered count
- correct count
- percentage
- estimated practice band, only if supported by the project criteria
- band descriptor, only if supported by the project criteria
- part breakdown:
  - Part 1 correct / 8
  - Part 2 correct / 5
  - Part 3 correct / 6
  - Part 4 correct / 5
  - Part 5 correct / 8
  - Part 6 correct / 6
- note: This is a Toronto Academy practice estimate, not an official CELPIP score.
- button: End Listening section
- button or link: Review answers

Do not show an official CELPIP level.

## Suggested files to create or update

Create if useful:

src/features/exam-engine/listening-band-score.ts
src/features/exam-engine/listening-band-score-types.ts
src/components/exam/listening/ListeningEstimatedBandCard.tsx

Update likely files:

src/features/exam-engine/listening-section-score.ts
src/components/exam/listening/ListeningSectionScoreScreen.tsx
src/components/exam/listening/ListeningSectionPrototype.tsx
src/features/exam-engine/mock-tests/mock-test-1/listening-part-3.ts
src/features/exam-engine/mock-tests/mock-test-1/full-listening-section.ts
src/features/exam-engine/exam-theme.ts
src/components/exam/ExamModeViewport.tsx
src/components/exam/ExamShell.tsx

Use the actual files in the project.

## Media QA requirement

Add a lightweight development-only media QA helper or documented checklist.

At minimum, document all full Listening media URLs used by:

- instructions video
- Part 1 audio
- Part 2 audio
- Part 3 audio
- Part 4 audio
- Part 5 video
- Part 6 audio

In docs/product/full-listening-qa-band-score.md, include:

- part
- screen or question
- media type
- URL exists in content
- route where checked

Do not download media.

Do not make network calls in build.

## Locked screen QA requirement

In the full Listening route, check these screen types:

- instruction screen
- instructional video screen
- Part 1 two-column audio/question screen
- Part 3 Question 1 audio screen
- Part 4 dropdown question screen
- Part 5 video question list
- Part 6 question list
- final answer review
- final score screen

They should all stay inside the locked exam shell.

## Documentation

Create:

docs/product/full-listening-qa-band-score.md

Include:

1. Part 3 Question 1 audio root cause
2. Part 3 audio fix
3. Full Listening route QA result
4. Exam lock polish completed
5. Media inventory checklist
6. CELPIP band criteria source found
7. Whether a raw score to band mapping exists
8. Estimated band implementation
9. Exact wording used to avoid official score claims
10. What is intentionally not built
11. How EXAM-16 Reading should start next

## Known intentional gaps

Document these if still true:

- media can be replayed
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
- Do not expose official source files publicly unless they are already intentionally public assets

## Manual Supabase steps

None.

Do not create migrations.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, docs, comments, or prompts. Use normal hyphens only.

## Done criteria

- Part 3 Question 1 audio appears in the full Listening test
- Part 3 individual route still works
- Full Listening route still works from instruction to end
- Full Listening final score still works out of 38
- Final score screen shows estimated practice band if supported by the project criteria
- Band wording does not claim official CELPIP scoring
- CELPIP criteria source is documented
- If no raw score mapping exists, no mapping is invented
- Full Listening screen feels locked into exam mode
- Whole browser page does not scroll during the exam
- Internal scrolling works only where needed
- No Reading is built
- No database save is created
- No Supabase migration is created
- No answer keys are exposed to question screens
- Existing Speaking and Writing AI flows are untouched
- docs/product/full-listening-qa-band-score.md exists
- npm run lint passes
- npm run build passes
