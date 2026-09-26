# SPEAKING-06 - Attempt History, Levels, and Badges

## Goal

Add attempt history, level progress, and badge display for the CELPIP Speaking module.

This ticket helps students see their previous speaking practice attempts, review feedback results, track estimated practice levels, and see badges earned through completed feedback results.

Do not build payment yet.
Do not build Stripe yet.
Do not build live class CTA yet.
Do not change the core scoring prompt unless needed.
Do not redesign the landing page.

## Product name

Toronto Academy CELPIP Practice

## Module name

CELPIP Speaking Practice

## Product UX goal

The speaking module should feel like a guided practice dashboard, not just a list of isolated tasks.

Students should be able to answer:

1. What have I practiced?
2. What was my best estimated level?
3. What feedback did I receive?
4. What badge or progress level did I earn?
5. What should I do next?

## Route map

Protected routes:

- /dashboard/speaking
  Speaking overview, task library, and progress summary

- /dashboard/speaking/attempts
  Full attempt history for the logged-in user

- /dashboard/speaking/attempts/[attemptId]
  Existing result page for one attempt

- /dashboard/speaking/tasks/[taskId]
  Task detail page

- /dashboard/speaking/practice/[taskId]
  Timed practice, recording, and submit for feedback flow

## User flow

1. User logs in
2. User opens /dashboard/speaking
3. User sees speaking progress summary
4. User sees recent attempts
5. User can open full attempt history
6. User can open any completed result
7. User can see earned badge on result page
8. User can try the same task again or practice another task
9. User always has a clear path back to speaking tasks and dashboard

## Required pages

Create:

src/app/dashboard/speaking/attempts/page.tsx

Update:

src/app/dashboard/speaking/page.tsx
src/app/dashboard/speaking/attempts/[attemptId]/page.tsx

Optional if needed:

src/app/dashboard/speaking/attempts/loading.tsx
src/app/dashboard/speaking/attempts/error.tsx

## Required components

Create:

src/components/speaking/SpeakingProgressSummary.tsx
src/components/speaking/RecentAttemptsCard.tsx
src/components/speaking/AttemptHistoryTable.tsx
src/components/speaking/AttemptStatusBadge.tsx
src/components/speaking/BadgeDisplayCard.tsx
src/components/speaking/LevelProgressCard.tsx
src/components/speaking/EmptyAttemptsState.tsx

Update if needed:

src/components/speaking/ResultSummaryCard.tsx
src/components/speaking/NextPracticeActions.tsx
src/components/speaking/SpeakingHero.tsx

## Required feature files

Create or update:

src/features/speaking/attempt-history.ts
src/features/speaking/level-badges.ts
src/features/speaking/progress-summary.ts

## Badge awarding

When a feedback result is created, the app should award the matching badge if it has not already been earned.

Use the badge_slug saved in attempt_scores.

Badge mapping:

- foundation-speaker
- developing-communicator
- test-ready-builder
- confident-speaker
- advanced-communicator

If the feedback API already saves badge_slug, update the feedback route so it also inserts into public.user_badges after successful scoring.

Only award badges after feedback is ready.

Do not award badges for:

- uploaded attempts
- transcribed attempts
- failed attempts
- attempts without feedback

## Required API update

Update if needed:

src/app/api/speaking/feedback/route.ts

After attempt_scores is saved and attempt status becomes feedback_ready:

1. Look up the badge by badge_slug
2. Insert into public.user_badges:
   - user_id
   - badge_id
   - attempt_id
3. If the user already has that badge, do not error
4. Return badge information if useful

Use server-side logic only.

Do not expose service role key to client components.

## Attempt history page UX

/dashboard/speaking/attempts should show:

1. Page heading

Speaking attempt history

2. Short description

Review your completed speaking practice attempts and return to feedback reports.

3. Summary strip

- Total feedback reports
- Best estimated practice level
- Most recent practice date
- Badges earned

4. Attempt list

Each row or card should show:

- task title
- task type
- attempt date
- status
- estimated practice level if available
- badge if earned
- action: View feedback

5. Empty state

If no attempts exist:

Heading:
No speaking attempts yet

Text:
Start with a speaking task to create your first practice record.

Button:
Start speaking practice

## Speaking module overview update

/dashboard/speaking should show:

1. Speaking hero
2. Progress summary card
3. Recent attempts card
4. Task library

The task library should still remain easy to find.

Do not make the page too crowded.

## Result page update

/dashboard/speaking/attempts/[attemptId] should show:

- estimated practice level
- badge earned
- category feedback
- strengths
- improvements
- next steps
- transcript reference
- actions

Add a badge section:

Heading:
Practice badge

If badge exists:
Show badge title and description.

If no badge exists:
Show a subtle message:
Complete feedback to earn a practice badge.

## Status display

Use readable labels:

uploaded:
Recording saved

transcribing:
Preparing transcript

transcribed:
Transcript ready

scoring:
Preparing feedback

feedback_ready:
Feedback ready

transcription_failed:
Transcript failed

scoring_failed:
Feedback failed

## Premium product language

Use:

- Estimated practice level
- Practice badge
- Feedback report
- Speaking progress
- Review feedback

Avoid:

- Official score
- Guaranteed result
- Cheap AI score
- Unlimited free feedback

## Security requirements

- All attempt history routes must be protected
- User can only see their own attempts
- User can only see their own badges
- Server must verify ownership before showing result pages
- Do not expose OPENAI_API_KEY in client components
- Do not expose SUPABASE_SERVICE_ROLE_KEY in client components
- Do not import admin Supabase helper into client components
- .env.local must stay ignored
- Do not print real environment values

## Database migration

Create only if needed:

supabase/migrations/007_badge_history_support.sql

Only add missing indexes or missing policies if required.

Suggested indexes if missing:

- attempts(user_id, created_at desc)
- attempt_scores(attempt_id)
- user_badges(user_id, earned_at desc)

Do not duplicate existing tables.

## Hosted Supabase workflow

We are using hosted Supabase only.

Do not set up local Supabase.
Do not require Supabase CLI.

If a migration is created, the user will copy and run it manually in hosted Supabase SQL Editor.

## Mobile UX requirements

- Attempt history should work as stacked cards on mobile
- Tables should not overflow on mobile
- Badge card should be readable
- Feedback actions should be easy to tap
- User should always have a clear path back to speaking tasks

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- /dashboard/speaking shows progress summary
- /dashboard/speaking shows recent attempts
- /dashboard/speaking/attempts shows full attempt history
- Result page shows badge information
- Feedback route awards badge after successful scoring
- User can only see their own attempts
- User can only see their own badges
- Empty state works for new users
- Mobile layout is clean
- No payment is built
- No credits are deducted
- npm run lint passes
- npm run build passes
- No secrets are committed
- No secret keys are used in client components
