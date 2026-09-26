# WRITING-02 - Timed Writing Editor

## Goal

Add the timed writing practice experience for CELPIP Writing Practice.

A logged-in student should be able to open a writing prompt, start a timed writing session, type their response, see word count, and submit the written response.

Do not build AI writing evaluation yet.
Do not build writing result card yet.
Do not build payment.
Do not build usage limits.
Do not change speaking practice logic.
Do not redesign the landing page.

## Product name

Toronto Academy of Education CELPIP Preparation Program

## Module name

CELPIP Writing Practice

## Current foundation

WRITING-01 already created:

- /dashboard/writing
- /dashboard/writing/tasks/[taskId]
- writing task library
- writing_task_details table
- 5 Writing an Email prompts
- 5 Responding to Survey Questions prompts

This ticket builds the writing editor experience.

## Route map

Protected routes:

- /dashboard/writing
  Writing module task library

- /dashboard/writing/tasks/[taskId]
  Writing task detail page

- /dashboard/writing/practice/[taskId]
  Timed writing editor page

API route:

- /api/writing/attempts
  Saves a submitted writing response

## User flow

1. User logs in
2. User opens /dashboard/writing
3. User chooses a writing task
4. User opens /dashboard/writing/tasks/[taskId]
5. User clicks Start timed writing
6. User lands on /dashboard/writing/practice/[taskId]
7. User sees prompt, timer, word target, and editor
8. Timer starts when user clicks Start writing
9. User types response
10. Word count updates live
11. User can submit response
12. App saves response to Supabase
13. User sees response saved state
14. User sees message that AI-supported evaluation will be added in the next step

## Do not build

Do not build:

- AI writing evaluation
- writing score
- result card
- attempt history
- payment
- credit deduction
- usage limits
- live class upsell
- grammar correction
- rewrite suggestions

## Required pages

Create:

src/app/dashboard/writing/practice/[taskId]/page.tsx

Update:

src/app/dashboard/writing/tasks/[taskId]/page.tsx

The task detail page should now show an active button:

Start timed writing

This button should link to:

/dashboard/writing/practice/[taskId]

## Required API route

Create:

src/app/api/writing/attempts/route.ts

Request body:

{
  "taskId": "uuid",
  "responseText": "string",
  "wordCount": 180,
  "timeSpentSeconds": 1200
}

API behavior:

1. Require authenticated session
2. Validate taskId
3. Validate responseText
4. Verify task belongs to the celpip-writing module
5. Verify task status is active
6. Fetch writing_task_details for timing and word target
7. Insert a new attempt row into public.attempts
8. Return attemptId

Attempt insert should include:

- user_id
- module_id
- task_id
- status
- response_text
- word_count
- time_spent_seconds
- submitted_at

Use status:

writing_submitted

Do not create attempt_scores.
Do not create usage_events.
Do not deduct credits.

## Database migration

Create:

supabase/migrations/009_writing_attempt_fields.sql

The migration should add these columns to public.attempts if they do not exist:

- response_text text
- word_count integer
- time_spent_seconds integer
- writing_submitted_at timestamptz

Also ensure attempts.status can store:

writing_submitted

If status is text, no schema change is needed for the status value.

Do not create a separate writing_attempts table.

## Required components

Create:

src/components/writing/TimedWritingShell.tsx
src/components/writing/WritingTimer.tsx
src/components/writing/WritingPromptCard.tsx
src/components/writing/WritingEditor.tsx
src/components/writing/WordCountCard.tsx
src/components/writing/WritingSubmitButton.tsx
src/components/writing/WritingSavedCard.tsx
src/components/writing/WritingStartCard.tsx

Update if needed:

src/components/writing/WritingTaskDetailPanel.tsx
src/components/writing/WritingTimingCard.tsx

## Required feature files

Create:

src/features/writing/writing-timer.ts
src/features/writing/word-count.ts
src/features/writing/submit-writing-attempt.ts

## Timer behavior

The writing timer should not begin automatically when the page loads.

Initial state:

- prompt visible
- writing details visible
- Start writing button visible
- editor disabled or hidden until start

When user clicks Start writing:

- timer starts
- editor becomes active
- user can type

When timer reaches zero:

- editor can remain visible
- show time ended warning
- do not auto-submit
- user can still submit manually

Do not auto-submit when timer ends.

## Editor behavior

The editor should:

- be easy to type in
- have a large textarea
- work on mobile
- preserve line breaks
- show live word count
- show word target
- show time remaining
- allow submit after user has typed a response

Minimum response validation:

- responseText must not be empty
- word count should be at least 20 to submit

If under 20 words, show:

Please write a longer response before submitting.

Do not block submission based on 150 to 200 target yet. The target is guidance only.

## Word count behavior

Create a simple word count utility.

Count words by trimming text and splitting on whitespace.

Examples:

- empty string = 0
- spaces only = 0
- "Hello world" = 2

Display:

Words: 148

Display target:

Target: 150 to 200 words

If below target, show:

Below target

If within target, show:

Within target

If above target, show:

Above target

These are guidance labels only.

## Saved state

After successful submission, show:

Heading:
Writing response saved

Text:
Your writing response has been saved. In the next step, AI-supported evaluation will review your task fulfillment, organization, vocabulary, grammar, tone, and clarity.

Actions:

- Back to writing tasks
- Try another writing task

Do not show AI score yet.

## User-facing copy

Use:

- Start timed writing
- Start writing
- Submit response
- Writing response saved
- AI-supported evaluation will be added next
- Estimated practice feedback coming next

Avoid:

- Official CELPIP score
- Guaranteed score
- Pass guaranteed
- Cheap AI checker
- Essay correction service

## Security requirements

- /dashboard/writing/practice/[taskId] must be protected
- API must require authenticated user
- API must verify task belongs to celpip-writing
- API must verify task is active
- User can only insert attempt for themselves
- Do not expose service role key in client components
- Do not import admin Supabase helper in client components
- Do not expose OpenAI keys in client components
- Do not print real environment values
- Keep .env.local ignored

## Environment variables

No new environment variables are needed in this ticket.

## Hosted Supabase workflow

We are using hosted Supabase only.

Do not set up local Supabase.
Do not require Supabase CLI.

Create the SQL migration locally. The user will copy and run it manually in hosted Supabase SQL Editor.

## Mobile UX requirements

- Editor must be comfortable on phone screens
- Timer must remain visible
- Submit button must be easy to tap
- Prompt card must be readable
- No horizontal overflow
- Word count card should stack cleanly

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- Task detail page has Start timed writing button
- /dashboard/writing/practice/[taskId] loads protected timed writing page
- User can start timer manually
- User can type writing response
- Word count updates live
- Word target guidance appears
- User can submit response
- Response saves to public.attempts
- attempts.status = writing_submitted
- response_text, word_count, time_spent_seconds are saved
- No AI evaluation is built
- No attempt_scores row is created
- No usage_events row is created
- No payment logic is built
- npm run lint passes
- npm run build passes
- No secrets are committed
