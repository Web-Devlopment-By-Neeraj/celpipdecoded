# SPEAKING-05 - AI Feedback and Result Card

## Goal

Add AI-supported speaking feedback and a student-facing result card.

A logged-in student should submit a saved recording for feedback. The system should transcribe the recording in the background if needed, analyze the spoken answer, save the feedback, and show a result card.

The student should not see a separate Generate transcript step in the main product flow.

Do not build payment yet.
Do not build full attempt history yet.
Do not build live class CTA yet.

## Product name

Toronto Academy CELPIP Practice

## Module name

CELPIP Speaking Practice

## Important UX correction

Transcription is a backend process.

The student-facing action should be:

Submit for feedback

Not:

Generate transcript

The user should experience one clean flow:

1. Record answer
2. Submit for feedback
3. See feedback result

The transcript should still be shown after feedback as a reference section inside the result card.

## Route map

Protected routes:

- /dashboard/speaking
  Speaking task library

- /dashboard/speaking/tasks/[taskId]
  Task detail page

- /dashboard/speaking/practice/[taskId]
  Timed practice and recording flow

- /dashboard/speaking/attempts/[attemptId]
  Result page for one attempt

API route:

- /api/speaking/feedback
  Server route that handles transcript generation if needed and AI scoring

## User flow

1. User completes timed speaking practice
2. User records answer
3. User submits recording
4. Recording is saved to private Supabase Storage
5. User clicks Submit for feedback
6. UI shows feedback is being prepared
7. Server verifies the attempt belongs to the logged-in user
8. Server checks if transcript exists
9. If transcript does not exist, server transcribes the audio
10. Server sends task prompt, task type, timing, and transcript to AI scoring
11. Server saves transcript if newly created
12. Server saves score and feedback in attempt_scores
13. Server updates attempt status to feedback_ready
14. User is redirected to /dashboard/speaking/attempts/[attemptId]
15. User sees result card and transcript reference

## Required API route

Create:

src/app/api/speaking/feedback/route.ts

Request body:

{
  "attemptId": "uuid"
}

Route behavior:

1. Require authenticated session
2. Validate attemptId
3. Fetch attempt with task and speaking details
4. Confirm attempt.user_id matches current user
5. Confirm attempt.audio_path exists
6. If attempt.transcript is empty:
   - set status to transcribing
   - download private audio
   - transcribe with OpenAI
   - save attempts.transcript
7. Set status to scoring
8. Send transcript to OpenAI scoring model
9. Validate returned scoring JSON
10. Insert or update public.attempt_scores for the attempt
11. Update attempt status to feedback_ready
12. Return attemptId and redirect target

Failure behavior:

- If transcription fails, status should become transcription_failed
- If scoring fails, status should become scoring_failed
- Do not create scored usage_events in this ticket
- Do not count payment credits in this ticket

## Required result route

Create:

src/app/dashboard/speaking/attempts/[attemptId]/page.tsx

The page must be protected.

It should:

- verify the logged-in user owns the attempt
- load attempt, task, transcript, and attempt_scores
- show result card
- show transcript reference
- show navigation back to speaking tasks

## Required components

Create:

src/components/speaking/SubmitForFeedbackButton.tsx
src/components/speaking/FeedbackProcessingCard.tsx
src/components/speaking/ResultSummaryCard.tsx
src/components/speaking/SkillScoreGrid.tsx
src/components/speaking/FeedbackSection.tsx
src/components/speaking/TranscriptReferenceCard.tsx
src/components/speaking/NextPracticeActions.tsx

Update:

src/components/speaking/RecordingSuccessCard.tsx

Remove or hide from main user flow:

- Generate transcript button as a separate primary step

It is acceptable to keep internal code for transcription if used by feedback route, but user-facing flow should say Submit for feedback.

## Required server feature files

Create or update:

src/features/speaking/generate-speaking-feedback.ts
src/features/speaking/scoring-schema.ts
src/features/speaking/scoring-prompt.ts
src/features/speaking/level-badges.ts

Reuse:

src/features/speaking/transcribe-attempt.ts

If transcribe-attempt.ts currently returns transcript, reuse it from the feedback route instead of duplicating transcription logic.

## Attempt statuses

Use these statuses:

- uploaded
- transcribing
- transcribed
- scoring
- feedback_ready
- transcription_failed
- scoring_failed

## Scoring categories

Use these 4 categories:

- Content and coherence
- Vocabulary
- Listenability
- Task fulfillment

Each category should produce:

- score from 1 to 12
- short feedback
- one improvement suggestion

## Estimated practice level

Return:

- estimated_level number from 1 to 12
- level_label text
- badge_slug text

Use this badge mapping:

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

The AI response must be JSON only and must match this shape:

{
  "estimated_level": 7,
  "level_label": "Developing toward test readiness",
  "badge_slug": "test-ready-builder",
  "overall_summary": "string",
  "content_coherence": {
    "score": 7,
    "feedback": "string",
    "improvement": "string"
  },
  "vocabulary": {
    "score": 7,
    "feedback": "string",
    "improvement": "string"
  },
  "listenability": {
    "score": 7,
    "feedback": "string",
    "improvement": "string"
  },
  "task_fulfillment": {
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
  ]
}

Validate this with zod before saving.

## Scoring prompt instructions

The model should receive:

- task title
- task type
- task prompt
- preparation time
- speaking time
- transcript
- scoring categories
- instruction that this is practice feedback only

The model must be instructed:

- Do not claim official CELPIP scoring
- Do not guarantee results
- Be specific and practical
- Mention what lost points
- Give feedback suitable for newcomers and adult learners
- Do not rewrite the whole answer
- Do not be overly harsh
- Do not be fake positive
- Focus on what can improve in the next attempt

## Environment variables

Add to .env.example:

OPENAI_SCORING_MODEL=

Recommended local value:

OPENAI_SCORING_MODEL=gpt-5.4-mini

Keep existing:

OPENAI_API_KEY=
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=

OPENAI_API_KEY and OPENAI_SCORING_MODEL must be server-side only.

## Database migration

Create only if needed:

supabase/migrations/006_feedback_status_fields.sql

Only add fields if the current schema is missing what is needed.

Do not duplicate existing columns.

## attempt_scores storage

Save:

- estimated_level
- level_label
- badge_slug
- content_coherence_score
- vocabulary_score
- listenability_score
- task_fulfillment_score
- strengths
- improvements
- next_steps
- raw_ai_response

If the current attempt_scores table does not have overall_summary, include it in raw_ai_response for now instead of changing schema unless necessary.

## User-facing copy

Use premium, clear wording.

Good copy:

- Submit for feedback
- Preparing your speaking feedback
- Your practice feedback is ready
- Estimated practice level
- What you did well
- What to improve next
- Transcript of your answer

Avoid:

- Official score
- Guaranteed CELPIP result
- Unlimited free AI scoring
- Cheap AI score

## Result card UX

Result page should show:

1. Header

Your speaking feedback

2. Score summary

- Estimated practice level
- Badge label
- Task title

3. Skill breakdown

- Content and coherence
- Vocabulary
- Listenability
- Task fulfillment

4. Feedback

- Strengths
- Improvements
- Next steps

5. Transcript reference

Heading:

Transcript of your answer

Text:

This transcript is generated from your recording and may not be perfect. It is used to support your practice feedback.

6. Actions

- Practice another task
- Back to speaking tasks
- Try this task again

## Payment rule

Do not enforce payment in this ticket.

Do not deduct credits in this ticket.

Do not create paid usage_events in this ticket.

Payment and usage limits will be added after the feedback flow is stable.

## Security requirements

- OPENAI_API_KEY must never be used in client components
- OPENAI_SCORING_MODEL must never be used in client components
- SUPABASE_SERVICE_ROLE_KEY must never be used in client components
- Server must verify attempt ownership before transcription and scoring
- User must not access another user's result page
- .env.local must stay ignored
- Do not print real environment values

## Hosted Supabase workflow

We are using hosted Supabase only.

Do not set up local Supabase.
Do not require Supabase CLI.

If a migration is created, the user will copy and run it in hosted Supabase SQL Editor.

## Mobile UX requirements

- Result card should be readable on mobile
- Skill score cards should stack cleanly
- Transcript should not overflow
- Primary actions should be easy to tap
- Processing state should clearly tell the user to wait

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- User-facing flow says Submit for feedback, not Generate transcript
- Feedback API verifies attempt ownership
- Feedback API transcribes in backend if needed
- Feedback API scores transcript
- Feedback is saved to attempt_scores
- Attempt status becomes feedback_ready
- Result page loads for attempt owner
- Result page shows estimated practice level
- Result page shows category feedback
- Result page shows strengths, improvements, and next steps
- Result page shows transcript reference
- No payment is enforced
- No paid usage is deducted
- npm run lint passes
- npm run build passes
- No secrets are committed
- No OpenAI or Supabase secret keys are used in client components
