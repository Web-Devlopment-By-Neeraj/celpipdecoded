# SPEAKING-01 - Speaking Module Route and Task Library

## Goal

Build the CELPIP Speaking module task library.

This ticket turns /dashboard/speaking from a placeholder into a real module page where students can see the 8 CELPIP speaking task types and open a task detail page.

Do not build recording yet.
Do not build transcription yet.
Do not build AI scoring yet.
Do not build payment yet.
Do not build attempt history yet.

## Product name

Toronto Academy CELPIP Practice

## Module name

CELPIP Speaking Practice

## Core UX rule

Every route must make the next action clear.

Each screen should answer:

1. Where am I?
2. What can I do here?
3. What should I click next?
4. How do I go back?
5. What happens if something fails?

## Route map

Protected routes:

- /dashboard
  Student dashboard with module cards

- /dashboard/speaking
  CELPIP Speaking module overview and task library

- /dashboard/speaking/tasks/[taskId]
  Task detail page with prompt, prep time, speaking time, and next-step placeholder

No public speaking routes should be created.

## User flow

1. User logs in
2. User opens /dashboard
3. User clicks CELPIP Speaking Practice
4. User lands on /dashboard/speaking
5. User sees all speaking task types
6. User clicks a task card
7. User lands on /dashboard/speaking/tasks/[taskId]
8. User sees task instructions, prompt, prep time, speaking time, and a disabled or placeholder Start timed practice button
9. User can return to /dashboard/speaking
10. User can return to /dashboard

## Logged out flow

If a logged out user visits:

- /dashboard/speaking
- /dashboard/speaking/tasks/[taskId]

They must be redirected to /login.

## CELPIP speaking task types

Seed and display these 8 task types:

1. Giving Advice
2. Talking about a Personal Experience
3. Describing a Scene
4. Making Predictions
5. Comparing and Persuading
6. Dealing with a Difficult Situation
7. Expressing Opinions
8. Describing an Unusual Situation

Use original Toronto Academy practice prompts. Do not copy paid or protected CELPIP content.

## Required pages

Create or update:

src/app/dashboard/speaking/page.tsx
src/app/dashboard/speaking/tasks/[taskId]/page.tsx
src/app/dashboard/speaking/loading.tsx
src/app/dashboard/speaking/error.tsx

## Required components

Create:

src/components/speaking/SpeakingHero.tsx
src/components/speaking/SpeakingTaskGrid.tsx
src/components/speaking/SpeakingTaskCard.tsx
src/components/speaking/TaskDetailPanel.tsx
src/components/speaking/TaskTimingCard.tsx
src/components/speaking/SpeakingEmptyState.tsx

Optional if useful:

src/components/speaking/SpeakingBreadcrumb.tsx
src/components/speaking/SpeakingDisclaimer.tsx

## Required feature files

Create:

src/features/speaking/task-types.ts
src/features/speaking/task-copy.ts
src/features/speaking/task-utils.ts

## Database migration

Create:

supabase/migrations/003_seed_speaking_tasks.sql

The migration should:

1. Find module id for modules.slug = 'celpip-speaking'
2. Insert or upsert 8 speaking tasks into public.tasks
3. Insert or upsert speaking timing rows into public.speaking_task_details
4. Use stable task_type values
5. Avoid duplicate rows if the migration is run more than once

Recommended stable task_type values:

- giving_advice
- personal_experience
- describing_scene
- making_predictions
- comparing_persuading
- difficult_situation
- expressing_opinions
- unusual_situation

## Sample prompts

Create original practice prompts for MVP.

Use one prompt per task type for now.

Examples can be simple, practical, and Canadian newcomer friendly.

Do not say the prompts are official CELPIP prompts.

Add clear wording:

These are Toronto Academy practice prompts designed to help you prepare for the CELPIP speaking format.

## Timing data

Add prep_seconds and speaking_seconds per task.

Use placeholder timing values for now if exact timing is not confirmed.

Recommended MVP timing:

- Giving Advice: prep 30, speaking 90
- Talking about a Personal Experience: prep 30, speaking 60
- Describing a Scene: prep 30, speaking 60
- Making Predictions: prep 30, speaking 60
- Comparing and Persuading: prep 60, speaking 60
- Dealing with a Difficult Situation: prep 60, speaking 60
- Expressing Opinions: prep 30, speaking 90
- Describing an Unusual Situation: prep 30, speaking 60

Keep these values centralized so they can be changed later.

## Speaking module page UX

/dashboard/speaking should include:

1. Header area

Heading:
CELPIP Speaking Practice

Subtext:
Choose a speaking task type and get familiar with the format before timed recording is added.

2. Progress note

Show a small note:
Recording and AI feedback will be added in the next build stages.

3. Task grid

Show 8 task cards.

Each card should include:
- task number
- task title
- short description
- prep time
- speaking time
- status badge: Practice prompt
- button: View task

4. Navigation

Include:
- Back to dashboard
- Sign out remains available from dashboard layout/header

## Task detail page UX

/dashboard/speaking/tasks/[taskId] should include:

1. Breadcrumb or back link:
Back to speaking tasks

2. Task heading:
Task number and task title

3. Practice prompt

4. Timing card:
- Preparation time
- Speaking time

5. Skill focus:
Show scoring focus areas:
- Content and coherence
- Vocabulary
- Listenability
- Task fulfillment

6. Start timed practice placeholder

Button text:
Timed practice coming next

The button should be disabled or clearly marked as coming soon.

7. Helpful note:
In the next step, this page will include the timer, recording, and AI feedback flow.

## Empty and error states

If no tasks are found:

Show:
No speaking tasks are available yet.

Include:
Back to dashboard

If a task id is invalid:

Use notFound() or a friendly not found page.

## Mobile UX requirements

- Task cards stack cleanly on mobile
- Buttons are easy to tap
- Back links are visible
- Prompt text is readable
- No horizontal overflow
- Layout should feel simple and guided

## Security requirements

- /dashboard/speaking must be protected
- /dashboard/speaking/tasks/[taskId] must be protected
- Use server-side Supabase session checks
- Do not expose service role key in client components
- Do not import admin Supabase helper in client components

## Environment variables

Use:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL

Do not use old SUPABASE_URL.

## Hosted Supabase workflow

We are using hosted Supabase only.

Do not set up local Supabase.
Do not require Supabase CLI.
Create the SQL migration locally, but the user will copy and run it in hosted Supabase SQL Editor.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- /dashboard/speaking shows task library
- /dashboard/speaking/tasks/[taskId] shows task detail
- All speaking routes are protected
- Task cards come from Supabase data
- 8 CELPIP speaking task types are seeded
- No official CELPIP prompt content is copied
- No recording is built
- No transcription is built
- No AI scoring is built
- npm run lint passes
- npm run build passes
- No secrets are committed
- No service role key is used in client components
