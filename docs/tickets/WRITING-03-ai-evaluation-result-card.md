# WRITING-03 - AI Writing Evaluation and Result Card

## Goal

Add AI-supported evaluation for CELPIP Writing Practice.

A logged-in student should submit a written response, the system should evaluate it with AI, save the feedback, and show a writing result card.

Do not build payment.
Do not build usage limits.
Do not deduct credits.
Do not build full writing attempt history yet.
Do not change speaking practice logic.
Do not redesign the landing page.

## Product name

Toronto Academy of Education CELPIP Preparation Program

## Module name

CELPIP Writing Practice

## Current foundation

WRITING-01 created:

- Writing task library
- Writing task detail pages
- writing_task_details table
- 10 writing prompts

WRITING-02 created:

- Timed writing editor
- Writing response submit
- response_text saved to attempts
- word_count saved to attempts
- time_spent_seconds saved to attempts
- writing_submitted_at saved to attempts
- attempts.status = writing_submitted

This ticket adds AI evaluation and result card.

## User flow

1. User opens a writing task
2. User starts timed writing
3. User writes a response
4. User clicks Submit for evaluation
5. App saves the writing response if needed
6. App sends the attempt to AI evaluation
7. UI shows preparing feedback
8. Server verifies the attempt belongs to the logged-in user
9. Server verifies the task belongs to celpip-writing
10. Server evaluates the response using OpenAI
11. Server validates AI JSON
12. Server saves feedback to attempt_scores
13. Server updates attempts.status to writing_feedback_ready
14. User is redirected to /dashboard/writing/attempts/[attemptId]
15. User sees writing result card

## Main UX correction

The final user-facing action should be:

Submit for evaluation

Not:

Submit response only

The student should feel they are submitting their writing to receive feedback.

## Route map

Protected routes:

- /dashboard/writing
  Writing task library

- /dashboard/writing/tasks/[taskId]
  Writing task detail

- /dashboard/writing/practice/[taskId]
  Timed writing editor

- /dashboard/writing/attempts/[attemptId]
  Writing result page

API routes:

- /api/writing/attempts
  Already saves writing response from WRITING-02

- /api/writing/evaluate
  New API route for AI writing evaluation

## Required API route

Create:

src/app/api/writing/evaluate/route.ts

Request body:

{
  "attemptId": "uuid"
}

API behavior:

1. Require authenticated session
2. Validate attemptId
3. Fetch attempt
4. Confirm attempt.user_id matches current user
5. Confirm attempt.response_text exists
6. Confirm attempt.status is writing_submitted or writing_evaluation_failed
7. Fetch task and module
8. Confirm task belongs to module slug celpip-writing
9. Fetch writing_task_details
10. Set attempts.status to writing_evaluating
11. Send writing prompt, task details, word target, and response text to OpenAI
12. Validate returned JSON with zod
13. Insert or update public.attempt_scores
14. Update attempts.status to writing_feedback_ready
15. Return attemptId and result path

Failure behavior:

- If AI evaluation fails, set attempts.status to writing_evaluation_failed
- Return a clear JSON error
- Do not create usage_events
- Do not deduct credits

## Required result page

Create:

src/app/dashboard/writing/attempts/[attemptId]/page.tsx

The page must:

- be protected
- verify the logged-in user owns the attempt
- verify the attempt belongs to celpip-writing
- load attempt, task, writing_task_details, and attempt_scores
- show result card
- show original writing response
- show navigation back to writing tasks

## Required components

Create:

src/components/writing/SubmitWritingEvaluationButton.tsx
src/components/writing/WritingEvaluationProcessingCard.tsx
src/components/writing/WritingResultSummaryCard.tsx
src/components/writing/WritingSkillScoreGrid.tsx
src/components/writing/WritingFeedbackSection.tsx
src/components/writing/WritingResponseReferenceCard.tsx
src/components/writing/WritingNextPracticeActions.tsx
src/components/writing/WritingEvaluationErrorCard.tsx

Update if needed:

src/components/writing/WritingSavedCard.tsx
src/components/writing/TimedWritingShell.tsx
src/components/writing/WritingSubmitButton.tsx

## Required feature files

Create:

src/features/writing/generate-writing-feedback.ts
src/features/writing/writing-scoring-schema.ts
src/features/writing/writing-scoring-prompt.ts
src/features/writing/writing-level-badges.ts
src/features/writing/evaluate-writing-attempt.ts

Optional:

src/features/writing/writing-result.ts

## Environment variables

Add to .env.example:

OPENAI_WRITING_MODEL=

Recommended local value:

OPENAI_WRITING_MODEL=gpt-5.4-mini

Keep existing:

OPENAI_API_KEY=
OPENAI_TRANSCRIPTION_MODEL=
OPENAI_SCORING_MODEL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=

OPENAI_API_KEY and OPENAI_WRITING_MODEL must be server-side only.

## OpenAI behavior

Use OpenAI only from server-side code.

Use:

process.env.OPENAI_WRITING_MODEL

Fallback:

gpt-5.4-mini

The model should return JSON only.

Do not expose the model name or API key to client components.

## AI evaluation categories

Use these writing categories:

- Task fulfillment
- Organization and coherence
- Vocabulary
- Grammar and sentence control
- Tone and clarity

Each category should include:

- score from 1 to 12
- feedback
- improvement

## Estimated practice level

Return:

- estimated_level number from 1 to 12
- level_label text
- badge_slug text

Badge mapping:

1 to 4:
foundation-speaker

5 to 6:
developing-communicator

7:
test-ready-builder

8:
confident-speaker

9 to 12:
advanced-communicator

Important:
This is a practice estimate only. It is not an official CELPIP score.

## Required AI response JSON

The AI response must match this shape:

{
  "estimated_level": 7,
  "level_label": "Developing toward test readiness",
  "badge_slug": "test-ready-builder",
  "overall_summary": "string",
  "task_fulfillment": {
    "score": 7,
    "feedback": "string",
    "improvement": "string"
  },
  "organization_coherence": {
    "score": 7,
    "feedback": "string",
    "improvement": "string"
  },
  "vocabulary": {
    "score": 7,
    "feedback": "string",
    "improvement": "string"
  },
  "grammar_sentence_control": {
    "score": 7,
    "feedback": "string",
    "improvement": "string"
  },
  "tone_clarity": {
    "score": 7,
    "feedback": "string",
    "improvement": "string"
  },
  "strengths": [
    "string"
  ],
  "improvements": [
    "string"
  ],
  "next_steps": [
    "string"
  ],
  "suggested_structure": "string"
}

Validate with zod before saving.

## Scoring prompt requirements

The prompt to the AI must include:

- Toronto Academy of Education CELPIP Writing Practice context
- task title
- task type
- task prompt
- task number
- time limit
- word target
- student response
- word count
- instruction that this is practice feedback only

The model must be instructed:

- Do not claim official CELPIP scoring
- Do not guarantee results
- Do not rewrite the full response
- Be practical and specific
- Explain what lowered the score
- Give feedback suitable for adult learners, newcomers, and students
- Focus on the next attempt
- Return JSON only

## Database migration

Create:

supabase/migrations/010_writing_evaluation_fields.sql

Add columns to public.attempt_scores if missing:

- writing_feedback jsonb default '{}'::jsonb
- writing_overall_summary text
- writing_suggested_structure text

Do not create a separate writing_scores table.

Do not remove existing speaking score columns.

Do not change speaking logic.

## attempt_scores storage

Save or upsert one attempt_scores row for the attempt.

Use existing columns if available:

- attempt_id
- estimated_level
- level_label
- badge_slug
- strengths
- improvements
- next_steps
- raw_ai_response

Use new writing columns:

- writing_feedback
- writing_overall_summary
- writing_suggested_structure

The writing_feedback JSON should include:

- task_fulfillment
- organization_coherence
- vocabulary
- grammar_sentence_control
- tone_clarity

If existing score columns are available and safe to use:

- task_fulfillment_score can store task_fulfillment.score
- vocabulary_score can store vocabulary.score

Do not force speaking-only columns if they do not fit.

## Attempt statuses

Use:

- writing_submitted
- writing_evaluating
- writing_feedback_ready
- writing_evaluation_failed

## Result page UX

/dashboard/writing/attempts/[attemptId] should show:

1. Header

Your writing feedback

2. Summary card

- Estimated practice level
- Badge label
- Task title
- Word count
- Time used

3. Skill breakdown

- Task fulfillment
- Organization and coherence
- Vocabulary
- Grammar and sentence control
- Tone and clarity

4. Feedback sections

- What you did well
- What to improve next
- Suggested structure
- Next steps

5. Original response reference

Heading:

Your written response

Text:

This is the response you submitted for evaluation.

Show response text with preserved line breaks.

6. Disclaimer

Use:

This is AI-supported practice feedback from Toronto Academy of Education. It is not an official CELPIP score.

7. Actions

- Practice another writing task
- Back to writing tasks
- Try this task again

## User-facing copy

Use:

- Submit for evaluation
- Preparing your writing feedback
- Your writing feedback is ready
- Estimated practice level
- What you did well
- What to improve next
- Suggested structure
- Your written response

Avoid:

- Official CELPIP score
- Guaranteed result
- Pass guaranteed
- Essay correction service
- Cheap AI checker

## UI behavior after WRITING-02 submit

Update the saved state so that after a response is saved, the student can continue to evaluation.

Preferred flow:

- User clicks Submit for evaluation
- Attempt is saved
- Evaluation starts
- User sees Preparing your writing feedback
- Result page opens after success

Acceptable flow if easier:

- User clicks Submit response
- Response saved card appears
- Student clicks Submit for evaluation
- Evaluation starts
- Result page opens after success

The preferred flow is better.

## Badge awarding

If feedback returns a badge_slug:

1. Look up badge by slug in public.badges
2. Insert into public.user_badges:
   - user_id
   - badge_id
   - attempt_id
3. If already earned, do not fail

Only award a badge after writing_feedback_ready.

## Security requirements

- API must require authenticated user
- API must verify attempt ownership
- API must verify attempt belongs to celpip-writing
- Result page must verify attempt ownership
- User must not access another user's result
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

Payment and scored attempt limits will be added after writing evaluation is stable.

## Hosted Supabase workflow

We are using hosted Supabase only.

Do not set up local Supabase.
Do not require Supabase CLI.

Create the SQL migration locally. The user will copy and run it manually in hosted Supabase SQL Editor.

## Mobile UX requirements

- Result page must stack cleanly
- Skill cards should be readable on phones
- Written response should wrap properly
- Buttons should be easy to tap
- Loading state must be clear

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- User can submit writing for evaluation
- API verifies attempt ownership
- API verifies attempt belongs to celpip-writing
- AI returns validated JSON
- attempt_scores row is saved or updated
- writing_feedback JSON is saved
- attempts.status becomes writing_feedback_ready
- result page shows estimated practice level
- result page shows writing category feedback
- result page shows strengths, improvements, suggested structure, and next steps
- result page shows original written response
- badge is awarded when badge_slug is returned
- No payment is enforced
- No credits are deducted
- No usage_events row is created
- npm run lint passes
- npm run build passes
- No secrets are committed
- No secret keys are used in client components
