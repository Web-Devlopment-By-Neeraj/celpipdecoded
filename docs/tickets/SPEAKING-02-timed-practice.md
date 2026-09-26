# SPEAKING-02 - Timed Practice Screen

## Goal

Build the timed CELPIP speaking practice screen.

This ticket lets a logged-in student open a speaking task, start preparation time, move into speaking time, and complete a practice session placeholder.

Do not build recording yet.
Do not build transcription yet.
Do not build AI scoring yet.
Do not build payment yet.
Do not count attempts yet.

## Product name

Toronto Academy CELPIP Practice

## Module name

CELPIP Speaking Practice

## Premium product direction

The product should feel professional and credible, not cheap.

A scored attempt means:

- user records an answer
- user submits it for AI feedback
- transcription runs
- AI feedback is generated
- result card is saved

This ticket does not create scored attempts yet because recording and AI are not built.

Do not use language like:

- unlimited free questions
- free AI scoring
- official CELPIP score
- guaranteed score

Use language like:

- timed practice session
- practice prompt
- preparation time
- speaking time
- AI-supported feedback coming next
- practice estimate only

## Future pricing model

Create or update:

docs/product/pricing-and-attempt-model.md

Use this planned pricing direction:

Free preview:
1 free scored speaking attempt

Starter Pack:
$5 for 5 scored attempts

Practice Pack:
$10 for 12 scored attempts

Monthly Practice Plan:
$20/month for up to 40 scored attempts per month

Important:
The app should count only completed AI feedback results as scored attempts later.

Do not count:

- opening a task
- reading a prompt
- starting a timer
- cancelling
- failed upload
- failed AI response

## Route map

Protected routes:

- /dashboard/speaking
  Speaking task library

- /dashboard/speaking/tasks/[taskId]
  Task detail page

- /dashboard/speaking/practice/[taskId]
  Timed practice screen

Logged out users must redirect to /login through the dashboard protection.

## User flow

1. User logs in
2. User opens /dashboard
3. User clicks CELPIP Speaking Practice
4. User opens /dashboard/speaking
5. User clicks a task
6. User opens /dashboard/speaking/tasks/[taskId]
7. User clicks Start timed practice
8. User lands on /dashboard/speaking/practice/[taskId]
9. User sees the task prompt
10. User clicks Start preparation
11. Preparation timer runs
12. When preparation ends, user can start speaking time
13. Speaking timer runs
14. When speaking time ends, user sees a completion state
15. User can return to task library or task detail

## UX rule

Every screen must make the next action clear.

The timed practice screen should show:

- where the user is
- which task they are practicing
- the prompt
- current phase
- preparation time
- speaking time
- clear primary action
- back path to task detail
- back path to task library

## Required pages

Create:

src/app/dashboard/speaking/practice/[taskId]/page.tsx

Update if needed:

src/app/dashboard/speaking/tasks/[taskId]/page.tsx

The task detail page should now have an active button:

Start timed practice

It should link to:

/dashboard/speaking/practice/[taskId]

## Required components

Create:

src/components/speaking/TimedPracticeShell.tsx
src/components/speaking/PracticeTimer.tsx
src/components/speaking/PracticePhaseCard.tsx
src/components/speaking/PracticePromptCard.tsx
src/components/speaking/PracticeCompletionCard.tsx
src/components/speaking/PracticeControls.tsx

Optional if useful:

src/components/speaking/PracticeProgressSteps.tsx

## Required feature files

Create or update:

src/features/speaking/practice-flow.ts
src/features/speaking/timer-utils.ts

## Timer phases

Use these phases:

- intro
- preparation
- ready_to_speak
- speaking
- complete

Flow:

intro:
User sees prompt and clicks Start preparation.

preparation:
Preparation timer counts down.

ready_to_speak:
User sees preparation is complete and clicks Start speaking.

speaking:
Speaking timer counts down.

complete:
User sees practice complete message.

## Button labels

Use these exact button labels:

- Start preparation
- Start speaking time
- Finish practice
- Back to task
- Practice another task

## Completion state copy

Heading:

Timed practice complete

Text:

Recording and AI-supported feedback will be added in the next step. For now, use this timed flow to get familiar with the pace of the speaking task.

Actions:

- Back to task
- Practice another task

## Timer behavior

- Timer should count down in seconds
- Timer should show minutes and seconds
- Timer should auto-complete each phase when it reaches zero
- User should be able to manually finish the speaking phase
- No audio recording should happen in this ticket
- No attempt row should be created in this ticket

## Data source

Fetch task data from Supabase.

The timed practice screen needs:

- task title
- task prompt
- task type
- task number
- prep_seconds
- speaking_seconds
- scoring_focus

Use the existing tables:

- tasks
- speaking_task_details

## Mobile UX requirements

- Timer must be large and easy to read
- Primary button must be easy to tap
- Prompt text must be readable
- No horizontal overflow
- Back links must be visible
- The screen should work well on mobile because many users will come from WhatsApp links

## Security requirements

- /dashboard/speaking/practice/[taskId] must be protected
- Do not expose service role key in client components
- Do not import admin Supabase helper in client components
- Use server-side task fetch where possible
- Client timer component should receive safe task data as props

## Environment variables

Use:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL

Do not use old SUPABASE_URL.

## Hosted Supabase workflow

No new Supabase migration is required for this ticket unless the current task data is missing required timing fields.

We are using hosted Supabase only.

Do not set up local Supabase.
Do not require Supabase CLI.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- /dashboard/speaking/tasks/[taskId] has Start timed practice button
- /dashboard/speaking/practice/[taskId] loads task data
- Timed practice flow works from intro to complete
- Preparation timer works
- Speaking timer works
- User can return to task detail
- User can return to task library
- No recording is built
- No transcription is built
- No AI scoring is built
- No attempts are counted
- Pricing and attempt model doc exists
- npm run lint passes
- npm run build passes
- No secrets are committed
- No service role key is used in client components
