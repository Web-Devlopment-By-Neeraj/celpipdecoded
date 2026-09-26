# WRITING-04 - Writing Attempt History and Progress

## Goal

Add writing attempt history, progress summary, and badge display for CELPIP Writing Practice.

A logged-in student should be able to review previous writing attempts, open feedback result pages, see writing progress, and understand what to practise next.

Do not build payment.
Do not build usage limits.
Do not deduct credits.
Do not change speaking practice logic.
Do not redesign the landing page.
Do not change AI scoring prompts unless needed to fix display mapping.

## Product name

Toronto Academy of Education CELPIP Preparation Program

## Module name

CELPIP Writing Practice

## Current foundation

WRITING-01 created:

- writing task library
- writing task details
- 10 writing prompts

WRITING-02 created:

- timed writing editor
- writing response submit
- response_text saved to attempts
- word_count saved to attempts
- time_spent_seconds saved to attempts
- status writing_submitted

WRITING-03 created:

- AI writing evaluation
- attempt_scores writing fields
- writing result card
- status writing_feedback_ready
- writing result page

This ticket adds writing history and progress.

## Route map

Protected routes:

- /dashboard/writing
  Writing overview, progress summary, recent attempts, and task library

- /dashboard/writing/attempts
  Full writing attempt history for the logged-in user

- /dashboard/writing/attempts/[attemptId]
  Existing writing result page

- /dashboard/writing/tasks/[taskId]
  Writing task detail page

- /dashboard/writing/practice/[taskId]
  Timed writing editor

## User flow

1. User logs in
2. User opens /dashboard/writing
3. User sees writing progress summary
4. User sees recent writing attempts
5. User can click View all writing attempts
6. User opens /dashboard/writing/attempts
7. User sees all writing attempts
8. User can open completed feedback reports
9. User can retry the same task
10. User can practise another writing task

## Required pages

Create:

src/app/dashboard/writing/attempts/page.tsx

Optional if useful:

src/app/dashboard/writing/attempts/loading.tsx
src/app/dashboard/writing/attempts/error.tsx

Update:

src/app/dashboard/writing/page.tsx
src/app/dashboard/writing/attempts/[attemptId]/page.tsx

Do not change public landing page files.

## Required components

Create:

src/components/writing/WritingProgressSummary.tsx
src/components/writing/WritingRecentAttemptsCard.tsx
src/components/writing/WritingAttemptHistoryTable.tsx
src/components/writing/WritingAttemptStatusBadge.tsx
src/components/writing/WritingBadgeDisplayCard.tsx
src/components/writing/WritingLevelProgressCard.tsx
src/components/writing/WritingEmptyAttemptsState.tsx
src/components/writing/WritingAttemptActions.tsx

Update if needed:

src/components/writing/WritingHero.tsx
src/components/writing/WritingResultSummaryCard.tsx
src/components/writing/WritingNextPracticeActions.tsx

## Required feature files

Create:

src/features/writing/writing-attempt-history.ts
src/features/writing/writing-progress-summary.ts
src/features/writing/writing-status-labels.ts

Update if needed:

src/features/writing/writing-level-badges.ts

## Writing overview update

Update /dashboard/writing so it shows:

1. Writing hero

Keep existing CELPIP Writing Practice intro.

2. Progress summary

Show:

- Total writing evaluations
- Best estimated practice level
- Average estimated practice level
- Most recent writing practice date
- Badges earned

3. Recent attempts

Show latest 3 to 5 writing attempts.

Each recent attempt should show:

- task title
- task type
- submitted date
- status
- estimated practice level if available
- action button

Actions:

- View feedback for writing_feedback_ready
- Continue to feedback if writing_submitted
- Try again for failed statuses

4. Task library

Keep the writing task library easy to find.

Do not make the page crowded.

## Full history page UX

/dashboard/writing/attempts should show:

Heading:

Writing attempt history

Description:

Review your CELPIP writing practice attempts and return to saved feedback reports.

Summary strip:

- Total submitted responses
- Feedback reports ready
- Best estimated practice level
- Badges earned

Attempt list:

Each row or mobile card should show:

- task title
- task type
- submitted date
- word count
- time used
- status
- estimated practice level if available
- badge if available
- action

Actions:

- View feedback
- Submit for evaluation
- Try again

Empty state:

Heading:

No writing attempts yet

Text:

Start with a writing task to create your first practice response.

Button:

Start writing practice

## Result page update

Update /dashboard/writing/attempts/[attemptId] if needed so it has clear navigation:

- Back to writing history
- Back to writing tasks
- Try this task again
- Practice another writing task

Also show badge information if available:

Heading:

Practice badge

If badge exists:

- badge title
- badge description

If no badge exists:

Complete feedback to earn a practice badge.

## Status labels

Use readable labels:

writing_submitted:
Response saved

writing_evaluating:
Preparing feedback

writing_feedback_ready:
Feedback ready

writing_evaluation_failed:
Feedback failed

For older or unexpected statuses:

uploaded:
Recording saved

feedback_ready:
Feedback ready

Default:
In progress

## Task type labels

Use readable labels:

writing_email:
Writing an Email

writing_survey_response:
Responding to Survey Questions

## Progress summary logic

Use only the logged-in user's writing attempts.

Writing attempts are attempts where the task belongs to the module with slug:

celpip-writing

Total submitted responses:

Count all writing attempts.

Feedback reports ready:

Count writing attempts with status writing_feedback_ready.

Best estimated practice level:

Highest attempt_scores.estimated_level among writing attempts.

Average estimated practice level:

Average estimated_level among writing attempts with feedback.

Badges earned:

Count user_badges connected to writing attempts where possible.

If exact writing badge connection is difficult, show badges connected to the user's writing feedback attempts using attempt_id.

## Attempt query requirements

The history queries should load:

- attempts
- tasks
- modules
- writing_task_details
- attempt_scores
- user_badges if needed
- badges if needed

Filter:

modules.slug = celpip-writing

Security:

Only show attempts where attempts.user_id is the current logged-in user.

## Database migration

No migration should be required.

Create a migration only if indexes are missing and performance needs support:

supabase/migrations/011_writing_history_indexes.sql

Suggested indexes only if missing:

- attempts(user_id, created_at desc)
- attempts(task_id)
- attempt_scores(attempt_id)
- user_badges(user_id, earned_at desc)

Do not create new tables.
Do not change existing RLS policies unless there is a clear bug.
Do not change speaking logic.

## Badge display

Use badge_slug from attempt_scores when available.

Map badge slugs to user-friendly display:

foundation-speaker:
Foundation communicator

developing-communicator:
Developing communicator

test-ready-builder:
Test readiness builder

confident-speaker:
Confident communicator

advanced-communicator:
Advanced communicator

Note:
The badge slugs may still use speaker wording from the shared badge system. The UI label can use communicator wording for writing.

## User-facing copy

Use:

- Writing progress
- Writing feedback report
- Estimated practice level
- Practice badge
- View feedback
- Submit for evaluation
- Try this task again

Avoid:

- Official CELPIP score
- Guaranteed result
- Pass guaranteed
- Essay correction service
- Cheap AI checker

## Disclaimer

Where feedback level is shown, include a small note:

Practice estimates are for preparation only and are not official CELPIP scores.

## Security requirements

- /dashboard/writing/attempts must be protected
- User can only see their own writing attempts
- User can only open their own writing result pages
- User can only see their own writing badges
- Do not expose SUPABASE_SERVICE_ROLE_KEY in client components
- Do not expose OPENAI_API_KEY in client components
- Do not expose OPENAI_WRITING_MODEL in client components
- Do not import admin Supabase helper into client components
- Keep .env.local ignored
- Do not print real environment values

## Payment rule

Do not enforce payment in this ticket.

Do not deduct credits in this ticket.

Do not create usage_events in this ticket.

Payment and scored attempt limits will be added later.

## Hosted Supabase workflow

We are using hosted Supabase only.

Do not set up local Supabase.
Do not require Supabase CLI.

If a migration is created, the user will copy and run it manually in hosted Supabase SQL Editor.

## Mobile UX requirements

- Attempt history should work as stacked cards on mobile
- Tables should not overflow horizontally
- Status badges should be readable
- Result links should be easy to tap
- Writing response text should wrap properly
- Summary cards should stack cleanly

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- /dashboard/writing shows writing progress summary
- /dashboard/writing shows recent writing attempts
- /dashboard/writing/attempts shows full attempt history
- History only shows logged-in user's writing attempts
- Completed attempts link to writing result pages
- Submitted attempts can continue to evaluation
- Failed attempts show clear retry action
- Result page has back links and retry actions
- Badge display works when badge data exists
- Empty state works for users with no writing attempts
- Mobile layout works
- No payment is built
- No credits are deducted
- No usage_events row is created
- npm run lint passes
- npm run build passes
- No secrets are committed
