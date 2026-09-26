# SPEAKING-04 - Transcription API

## Goal

Add server-side transcription for uploaded speaking recordings.

A logged-in student should be able to submit an uploaded recording for transcription. The app should send the private audio file to OpenAI transcription, save the transcript to the attempts table, and show the transcript in the UI.

Do not build AI scoring yet.
Do not build result card scoring yet.
Do not build payment yet.
Do not count paid or scored attempts yet.
Do not build full attempt history yet.

## Product name

Toronto Academy CELPIP Practice

## Module name

CELPIP Speaking Practice

## Transcription provider

Use OpenAI transcription API.

Default model:

gpt-4o-mini-transcribe

Use this environment variable:

OPENAI_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe

Also require:

OPENAI_API_KEY=

The OpenAI API key must only be used server side.

## Important attempt rule

This ticket does not count a scored attempt.

A scored attempt later means:

- recording is submitted
- transcription succeeds
- AI feedback is generated
- result card is saved

This ticket only creates the transcript and updates attempt status.

Do not create scored usage_events in this ticket.

## Route map

Protected routes:

- /dashboard/speaking
  Speaking task library

- /dashboard/speaking/tasks/[taskId]
  Task detail page

- /dashboard/speaking/practice/[taskId]
  Timed practice screen with recording upload and transcription action

API route:

- /api/speaking/transcribe
  Server route that transcribes an uploaded attempt

## User flow

1. User records speaking answer
2. User submits recording
3. Recording is saved to Supabase Storage
4. Attempt row is created with status uploaded
5. User sees recording saved state
6. User clicks Generate transcript
7. UI shows transcription in progress
8. Server verifies the logged-in user owns the attempt
9. Server downloads the audio from private Supabase Storage
10. Server sends audio to OpenAI transcription
11. Server saves transcript to attempts.transcript
12. Server updates attempts.status to transcribed
13. UI shows transcript preview
14. User sees message that AI feedback will be added next

## Required API route

Create:

src/app/api/speaking/transcribe/route.ts

Request body:

{
  "attemptId": "uuid"
}

Route behavior:

1. Require authenticated session
2. Validate attemptId
3. Fetch attempt from public.attempts
4. Confirm attempt.user_id matches current user
5. Confirm attempt.audio_path exists
6. Download audio from Supabase Storage bucket attempt-audio
7. Send audio to OpenAI transcription API
8. Save transcript to public.attempts.transcript
9. Update public.attempts.status to transcribed
10. Return transcript and attempt id

If anything fails, return a clear JSON error with the correct HTTP status.

## Required UI updates

Update the practice screen success state after recording upload.

After recording is saved, show:

- Recording saved
- Generate transcript button
- Transcription status
- Transcript preview after success

Create or update:

src/components/speaking/RecordingSuccessCard.tsx
src/components/speaking/TranscriptCard.tsx
src/components/speaking/GenerateTranscriptButton.tsx

Optional:

src/features/speaking/transcription-client.ts

## Required server files

Create:

src/features/speaking/transcribe-attempt.ts

This server-side helper should:

- accept attempt id and user id
- fetch attempt
- download audio
- call OpenAI
- update attempt
- return transcript

Do not import this helper into client components.

## Attempt statuses

Use these statuses:

- uploaded
- transcribing
- transcribed
- transcription_failed

Update status as follows:

Before OpenAI call:
transcribing

After success:
transcribed

After failure:
transcription_failed

Do not overwrite audio_path.

Do not create attempt_scores yet.

## OpenAI request

Use:

model:
process.env.OPENAI_TRANSCRIPTION_MODEL or gpt-4o-mini-transcribe

language:
en

response_format:
json

Prompt context if supported:

This is a CELPIP speaking practice response from an English-language test preparation student. Preserve the speaker's wording as accurately as possible. Do not correct grammar. Do not rewrite the answer.

Important:
The transcript should reflect what the user said, not what the user should have said.

## File handling

Audio may be stored as webm.

The API should convert the downloaded Blob or ArrayBuffer into a File object suitable for OpenAI SDK upload.

Do not expose the audio file publicly.

Do not create public signed URLs unless needed. Prefer direct server-side download from Supabase Storage using the authenticated server client or admin client after verifying ownership.

## Environment variables

Update .env.example with:

OPENAI_API_KEY=
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe

Keep existing:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=

## Security requirements

- OPENAI_API_KEY must never be used in client components
- Do not expose SUPABASE_SERVICE_ROLE_KEY in client components
- Do not import src/lib/supabase/admin.ts into client components
- Server must verify attempt ownership before downloading audio
- User must not be able to transcribe another user's attempt
- .env.local must stay ignored
- Do not print real environment values

## Hosted Supabase workflow

No new Supabase table migration should be required if attempts already has transcript and status columns.

If missing fields are discovered, create:

supabase/migrations/005_attempt_transcription_fields.sql

Only add missing fields if needed.

We are using hosted Supabase only.

Do not set up local Supabase.
Do not require Supabase CLI.

## User-facing copy

Use premium, clear wording.

Good copy:

- Generate transcript
- Preparing your transcript
- Transcript ready
- Your transcript is ready. AI-supported feedback will be added in the next step.

Avoid:

- Free AI score
- Official CELPIP result
- Guaranteed score
- Unlimited feedback

## Error states

Handle:

- Missing attempt
- Unauthorized attempt
- Missing audio
- Audio download failed
- OpenAI API key missing
- OpenAI transcription failed
- Transcript save failed

Each error should show:

- clear message
- retry option where possible
- back path to task

## Mobile UX requirements

- Generate transcript button must be easy to tap
- Loading state must be obvious
- Transcript preview must be readable
- No horizontal overflow
- User should always know what to do next

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- User can click Generate transcript after recording upload
- API route verifies logged-in user owns attempt
- API downloads private audio from Supabase Storage
- API sends audio to OpenAI transcription
- Transcript is saved to attempts.transcript
- Attempt status updates to transcribed
- UI shows transcript preview
- AI scoring is not built
- Paid/scored usage is not counted
- OpenAI key is server-side only
- npm run lint passes
- npm run build passes
- No secrets are committed
- No service role key is used in client components
