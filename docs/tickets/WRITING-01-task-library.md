clauc# WRITING-01 - Writing Module and Task Library

## Goal

Build the CELPIP Writing module foundation.

This ticket activates CELPIP Writing Practice in the dashboard, creates the writing module route, seeds writing task prompts, and adds task detail pages.

Do not build the timed writing editor yet.
Do not build AI writing evaluation yet.
Do not build payment.
Do not build usage limits.
Do not change speaking practice logic.
Do not redesign the landing page.

## Product name

Toronto Academy of Education CELPIP Preparation Program

## Module name

CELPIP Writing Practice

## Official writing task structure

CELPIP Writing has 2 task types:

1. Task 1 - Writing an Email
2. Task 2 - Responding to Survey Questions

Use original Toronto Academy of Education practice prompts only.

Do not copy paid or protected CELPIP content.

Do not claim the prompts are official CELPIP prompts.

## Route map

Protected routes:

- /dashboard
  Student dashboard with module cards

- /dashboard/writing
  CELPIP Writing module overview and task library

- /dashboard/writing/tasks/[taskId]
  Writing task detail page

No public writing routes should be created.

## User flow

1. User logs in
2. User opens /dashboard
3. User clicks CELPIP Writing Practice
4. User lands on /dashboard/writing
5. User sees Writing an Email and Responding to Survey Questions task cards
6. User clicks a writing task
7. User lands on /dashboard/writing/tasks/[taskId]
8. User sees prompt, task type, word target, time limit, and next step placeholder
9. User can return to writing tasks
10. User can return to dashboard

## Logged out flow

If a logged out user visits:

- /dashboard/writing
- /dashboard/writing/tasks/[taskId]

They must be redirected to /login through existing dashboard protection.

## Required pages

Create:

src/app/dashboard/writing/page.tsx
src/app/dashboard/writing/tasks/[taskId]/page.tsx
src/app/dashboard/writing/loading.tsx
src/app/dashboard/writing/error.tsx

Update:

src/app/dashboard/page.tsx or module card routing logic if needed

The dashboard should now show CELPIP Writing Practice as active and clickable.

## Required components

Create:

src/components/writing/WritingHero.tsx
src/components/writing/WritingTaskGrid.tsx
src/components/writing/WritingTaskCard.tsx
src/components/writing/WritingTaskDetailPanel.tsx
src/components/writing/WritingTimingCard.tsx
src/components/writing/WritingEmptyState.tsx

Optional if useful:

src/components/writing/WritingBreadcrumb.tsx
src/components/writing/WritingDisclaimer.tsx

## Required feature files

Create:

src/features/writing/task-types.ts
src/features/writing/task-copy.ts
src/features/writing/task-utils.ts

## Database migration

Create:

supabase/migrations/008_writing_task_library.sql

The migration should:

1. Create public.writing_task_details if it does not exist
2. Find module id for modules.slug = 'celpip-writing'
3. Update modules.status for celpip-writing to active
4. Insert or upsert writing tasks into public.tasks
5. Insert or upsert writing timing and word target rows into public.writing_task_details
6. Avoid duplicate rows if the migration is run more than once

## writing_task_details table

Create this table if it does not exist:

- task_id uuid primary key references public.tasks(id) on delete cascade
- task_number integer not null
- time_seconds integer not null
- word_min integer
- word_max integer
- evaluation_focus jsonb default '[]'::jsonb
- created_at timestamptz default now()

Enable RLS.

Policy:

Authenticated users can select writing_task_details for active writing tasks.

## Stable task_type values

Use:

- writing_email
- writing_survey_response

## Seed prompts

Create original practice prompts.

MVP seed:

Task 1 - Writing an Email:
- 5 original prompts

Task 2 - Responding to Survey Questions:
- 5 original prompts

Total:
- 10 writing prompts

Prompts should be practical and suitable for adult learners, newcomers, students, and workplace or community situations.

Do not use official CELPIP prompt wording.

## Timing and word targets

Use:

Task 1 - Writing an Email:
- time_seconds: 1620
- word_min: 150
- word_max: 200

Task 2 - Responding to Survey Questions:
- time_seconds: 1560
- word_min: 150
- word_max: 200

Keep values centralized so they can be changed later.

## Evaluation focus labels

Use:

- Task fulfillment
- Organization and coherence
- Vocabulary
- Grammar and sentence control
- Tone and clarity

## Writing module page UX

/dashboard/writing should include:

1. Header area

Heading:
CELPIP Writing Practice

Subtext:
Choose a writing task type and get familiar with the format before the timed writing editor and AI-supported evaluation are added.

2. Progress note

Show:
Timed writing and AI-supported evaluation will be added in the next build stages.

3. Task grid

Show task cards grouped by:

- Writing an Email
- Responding to Survey Questions

Each card should include:

- task number
- task title
- short description
- time limit
- word target
- status badge: Practice prompt
- button: View task

4. Navigation

Include:

- Back to dashboard

## Writing task detail page UX

/dashboard/writing/tasks/[taskId] should include:

1. Back link

Back to writing tasks

2. Task heading

Task number and task title

3. Practice prompt

4. Timing card

- Time limit
- Word target

5. Evaluation focus

Show:

- Task fulfillment
- Organization and coherence
- Vocabulary
- Grammar and sentence control
- Tone and clarity

6. Start writing placeholder

Button text:

Timed writing coming next

The button should be disabled or clearly marked as coming soon.

7. Helpful note

Use:

In the next step, this page will include a timed writing editor and AI-supported practice feedback.

## Empty and error states

If no writing tasks are found, show:

No writing tasks are available yet.

Include:

Back to dashboard

If a task id is invalid, use notFound() or a friendly not found page.

## Mobile UX requirements

- Writing task cards stack cleanly on mobile
- Buttons are easy to tap
- Prompt text is readable
- No horizontal overflow
- Back links are visible
- Layout should feel simple and guided

## Security requirements

- /dashboard/writing must be protected
- /dashboard/writing/tasks/[taskId] must be protected
- Use server-side Supabase session checks through existing dashboard protection
- Do not expose service role key in client components
- Do not import admin Supabase helper in client components
- Do not expose OpenAI keys in client components

## Environment variables

No new environment variables are needed in this ticket.

Keep using:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL

## Hosted Supabase workflow

We are using hosted Supabase only.

Do not set up local Supabase.
Do not require Supabase CLI.

Create the SQL migration locally, but the user will copy and run it in hosted Supabase SQL Editor.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- Dashboard shows CELPIP Writing Practice as active and clickable
- /dashboard/writing shows writing task library
- /dashboard/writing/tasks/[taskId] shows writing task detail
- 10 writing prompts are seeded
- Writing tasks come from Supabase data
- No official CELPIP prompt content is copied
- No timed writing editor is built
- No AI writing evaluation is built
- No payment is built
- npm run lint passes
- npm run build passes
- No secrets are committed
- No secret keys are used in client components
