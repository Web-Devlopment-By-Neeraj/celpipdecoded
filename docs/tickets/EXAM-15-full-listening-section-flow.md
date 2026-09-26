# EXAM-15 - Full Listening Section Flow and Final Listening Score

## Goal

Assemble Mock Test 1 Listening into one complete CELPIP-style Listening section flow.

The full Listening section should include:

- Listening instruction screen
- Listening instructional video screen
- Listening Part 1
- Listening Part 2
- Listening Part 3
- Listening Part 4
- Listening Part 5
- Listening Part 6
- full Listening answer review
- full Listening score screen
- end of Listening section screen

This ticket should connect the already-built Listening parts into one full Listening test experience.

Do not build Reading.
Do not build Writing.
Do not build Speaking.
Do not build the full Mock Test 1 flow.
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

## Important expectation

This should feel like a complete Listening test section.

The individual Listening Part 1 to Part 6 prototype routes can remain for internal testing.

But the new full Listening route should not show a score after each part.

The full route should collect answers through all 6 parts, then show one final review and one final score at the end.

## Required route

Create protected route:

src/app/dashboard/mock-tests/mock-test-1/listening/page.tsx

This route should render the complete Listening section.

Add an internal preview link on the dashboard:

Mock Test 1 Full Listening Section

Mark it Internal preview.

## Existing routes to preserve

Do not delete or break these routes:

- /dashboard/mock-tests/mock-test-1/listening/part-1
- /dashboard/mock-tests/mock-test-1/listening/part-2
- /dashboard/mock-tests/mock-test-1/listening/part-3
- /dashboard/mock-tests/mock-test-1/listening/part-4
- /dashboard/mock-tests/mock-test-1/listening/part-5
- /dashboard/mock-tests/mock-test-1/listening/part-6

These remain internal part-level prototypes.

## Existing content to reuse

Reuse these centralized content files:

- src/features/exam-engine/mock-tests/mock-test-1/listening-part-1.ts
- src/features/exam-engine/mock-tests/mock-test-1/listening-part-2.ts
- src/features/exam-engine/mock-tests/mock-test-1/listening-part-3.ts
- src/features/exam-engine/mock-tests/mock-test-1/listening-part-4.ts
- src/features/exam-engine/mock-tests/mock-test-1/listening-part-5.ts
- src/features/exam-engine/mock-tests/mock-test-1/listening-part-6.ts

All answer keys are already stored in those content files.

Do not expose answer keys to the client question screens.

## Existing instruction/video components to reuse

Reuse EXAM-02 components:

- ExamInstructionScreen
- ExamVideoScreen
- ExamVideoPlayer
- instructional-video-assets.ts

The full Listening flow should include:

1. Listening instruction text screen
2. Listening instructional video screen

Use the existing Listening instructional video asset if available.

## Required files to create

Create:

src/features/exam-engine/mock-tests/mock-test-1/full-listening-section.ts
src/features/exam-engine/listening-section-types.ts
src/features/exam-engine/listening-section-flow.ts
src/features/exam-engine/listening-section-score.ts
src/features/exam-engine/listening-section-copy.ts

src/components/exam/listening/ListeningSectionPrototype.tsx
src/components/exam/listening/ListeningSectionInstructionScreen.tsx
src/components/exam/listening/ListeningSectionVideoScreen.tsx
src/components/exam/listening/ListeningSectionReviewScreen.tsx
src/components/exam/listening/ListeningSectionScoreScreen.tsx
src/components/exam/listening/ListeningSectionEndScreen.tsx
src/components/exam/listening/ListeningSectionProgressBar.tsx

Optional if useful:

src/components/exam/listening/ListeningSectionPartTransitionScreen.tsx
src/components/exam/listening/ListeningSectionReviewTable.tsx
src/components/exam/listening/ListeningSectionScoreBreakdown.tsx

Create documentation:

docs/product/full-listening-section-flow.md

## Full Listening screen order

Implement the route as one local client-side flow.

Screen order:

1. Listening instruction text screen

Show:

- Listening Test
- This section has 6 parts.
- You will listen to conversations, a news item, a discussion, and viewpoints.
- Answer all questions.
- At the end, you will review your answers and see a practice score.
- This is Toronto Academy practice, not an official CELPIP score.

2. Listening instructional video screen

Use the existing Listening instructional video.

3. Part 1 flow

Reuse the same Part 1 screens and question behavior, but at the end go directly to Part 2 transition, not Part 1 review or score.

4. Part 2 flow

At the end go directly to Part 3 transition.

5. Part 3 flow

At the end go directly to Part 4 transition.

6. Part 4 flow

At the end go directly to Part 5 transition.

7. Part 5 flow

At the end go directly to Part 6 transition.

8. Part 6 flow

At the end go to full Listening answer review.

9. Full Listening answer review

Show all answers grouped by part.

10. Full Listening score screen

Show total score and part breakdown.

11. End of Listening section screen

Show completion and back to dashboard.

## Question count

The full Listening section should include:

- Part 1: 8 questions
- Part 2: 5 questions
- Part 3: 6 questions
- Part 4: 5 questions
- Part 5: 8 questions
- Part 6: 6 questions

Total:

38 questions

The final score should be based on 38 questions.

## Scoring rule

Use simple practice scoring only:

- correct count
- total questions
- percentage
- part breakdown

Do not calculate official CELPIP score.
Do not show CELPIP level.
Do not call it an official result.

Required note:

This is a Toronto Academy practice result, not an official CELPIP score.

## Answer key security

Do not ship answer keys to the question screens.

Use the same secure pattern already used for Part 1 to Part 6 review tickets.

If existing review scoring uses server actions, reuse that pattern.

The full section score can send the learner selected answers to the server action and receive:

- review rows
- correct count
- answered count
- total count
- percentage
- part breakdown

Do not save to database.

Do not create API routes unless the existing pattern already uses route handlers. Prefer the existing server-action pattern if that is what Parts 1 to 6 use.

## Local state

Store selected answers locally in the full Listening flow.

Use a combined answer map:

{
  questionId: selectedOptionId
}

This state should include all 38 answers.

Back and Next should preserve answers within the full flow.

Restart should clear all answers and return to the first instruction screen.

No localStorage.
No cookies.
No database save.

## Review screen requirements

The full Listening answer review should show:

- title: Listening Answer Review
- subtitle: Review your answers before viewing your practice score.
- grouped sections for Part 1 to Part 6
- question number within each part
- student selected answer
- correct answer
- status: correct, incorrect, or unanswered
- button: View Listening score
- Back button to return to the last question screen for prototype testing

The review table should be compact and test-like.

## Score screen requirements

The full Listening score screen should show:

- title: Listening Practice Score
- total questions: 38
- answered count
- correct count
- score percentage
- part breakdown:
  - Part 1 correct / 8
  - Part 2 correct / 5
  - Part 3 correct / 6
  - Part 4 correct / 5
  - Part 5 correct / 8
  - Part 6 correct / 6
- note: This is a Toronto Academy practice result, not an official CELPIP score.
- button: End Listening section
- button or link: Review answers

Do not show an official CELPIP level.

## End screen requirements

Create a simple end screen:

- title: End of Listening Section
- message: You have completed the Listening section of Mock Test 1.
- button: Back to dashboard
- button: Restart Listening section
- optional placeholder: Reading section will be added later.

Do not build Reading in this ticket.

## Part transition screens

Between parts, use a small transition screen:

- Part 1 complete. Continue to Listening Part 2.
- Part 2 complete. Continue to Listening Part 3.
- Part 3 complete. Continue to Listening Part 4.
- Part 4 complete. Continue to Listening Part 5.
- Part 5 complete. Continue to Listening Part 6.

Do not show a score on these transition screens.

## Fidelity gaps to keep documented

These can remain intentional for now:

- audio and video can be replayed
- media does not autoplay
- Next does not wait for media completion
- timers are static
- answers are not saved to database
- no official CELPIP score
- no official CELPIP level
- no persisted history
- no full Mock Test 1 assembly yet

## Visual requirements

Use EXAM-01 shell components.

The full Listening flow should look consistent with the existing part prototypes:

- grey top bar
- white exam canvas
- blue Next button
- Back button in bottom bar
- compact instruction rows
- test-like review table
- no marketing dashboard cards inside the exam canvas

## Dashboard link

Add internal preview link:

Mock Test 1 Full Listening Section

Route:

/dashboard/mock-tests/mock-test-1/listening

Mark it Internal preview.

Do not make it a public paid product link yet.

## Documentation

Create:

docs/product/full-listening-section-flow.md

Include:

1. Route created
2. Full screen sequence
3. Parts included
4. Question count
5. Answer state strategy
6. Secure scoring strategy
7. Final review behavior
8. Final score behavior
9. What is intentionally not built
10. Known fidelity gaps
11. How Reading should start next

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

- Full Listening route exists
- Listening instruction text screen exists
- Listening instructional video screen exists
- Parts 1 to 6 are included in one flow
- Total question count is 38
- Answers are kept in local state
- No part-level score appears during the full flow
- Full answer review appears after Part 6
- Full score screen appears after review
- Part breakdown appears on score screen
- Final score is correct / 38 and percentage
- No official CELPIP score is shown
- Answer keys are not exposed to question screens
- No database save is created
- No Supabase migration is created
- No Reading section is built
- No Writing or Speaking change is made
- Existing individual part prototype routes still work
- docs/product/full-listening-section-flow.md exists
- npm run lint passes
- npm run build passes
