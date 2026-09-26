# SPEAKING-03 - Browser Recording and Audio Upload

## Goal

Add browser recording to the CELPIP timed speaking practice screen.

A logged-in student should be able to complete the timed practice flow, record their speaking answer in the browser, replay it, re-record if needed, and submit the recording. The audio should upload to the private Supabase Storage bucket and create an attempt row.

Do not build transcription yet.
Do not build AI scoring yet.
Do not build payment yet.
Do not count paid attempts yet.
Do not build attempt history yet.

## Product name

Toronto Academy CELPIP Practice

## Module name

CELPIP Speaking Practice

## Important attempt rule

This ticket may create an attempt row after the student submits audio, but it must not count as a scored attempt.

A scored attempt later means:

- recording is submitted
- transcription succeeds
- AI feedback is generated
- result card is saved

This ticket only uploads the recording and stores the attempt status.

Do not create usage_events for scored attempts in this ticket.

## Route map

Protected routes:

- /dashboard/speaking
  Speaking task library

- /dashboard/speaking/tasks/[taskId]
  Task detail page

- /dashboard/speaking/practice/[taskId]
  Timed practice screen with browser recording and upload

Logged out users must redirect to /login through existing dashboard protection.

## User flow

1. User logs in
2. User opens /dashboard/speaking
3. User opens a task detail page
4. User clicks Start timed practice
5. User completes preparation timer
6. User starts speaking time
7. Recording starts when speaking time starts or when the user clicks Start recording
8. User can stop recording
9. User can replay the recording
10. User can re-record before submitting
11. User clicks Submit recording
12. Audio uploads to Supabase Storage
13. Attempt row is created or updated
14. User sees a success state
15. User can return to task or task library

## Recording UX decision

Use this simple MVP behavior:

- Recording should be available during the speaking phase
- User can click Start recording during the speaking phase
- User can stop recording manually
- If speaking time reaches zero while recording, stop recording automatically
- After recording, show audio playback
- Allow Re-record before submit
- Submit recording uploads the final audio only

Do not auto-submit at timer end.

## Required updates

Update:

src/app/dashboard/speaking/practice/[taskId]/page.tsx

Update or create components:

src/components/speaking/TimedPracticeShell.tsx
src/components/speaking/PracticeControls.tsx

Create:

src/components/speaking/AudioRecorder.tsx
src/components/speaking/RecordingStatusCard.tsx
src/components/speaking/AudioPlaybackCard.tsx
src/components/speaking/SubmitRecordingButton.tsx
src/components/speaking/RecordingSuccessCard.tsx

Create feature files:

src/features/speaking/audio-utils.ts
src/features/speaking/recording-upload.ts

Optional if useful:

src/features/speaking/attempt-status.ts

## Supabase Storage

Use the existing private bucket:

attempt-audio

Upload path format:

{user_id}/{attempt_id}/answer.webm

If the browser produces a different supported audio type, preserve a safe extension such as:

answer.webm
answer.mp4
answer.m4a

Keep the path organized by user id and attempt id.

## Attempt row logic

When the user submits a recording:

1. Create an attempt row in public.attempts with:
   - user_id
   - module_id
   - task_id
   - status = uploaded
   - audio_duration_seconds
   - submitted_at

2. Upload audio to Supabase Storage path:
   attempt-audio/{user_id}/{attempt_id}/answer.webm

3. Update the attempt row with:
   - audio_path
   - status = uploaded

If upload fails, show a friendly error and do not show success.

If attempt insert succeeds but upload fails, mark attempt status as failed_upload if practical.

## No API route required

For this ticket, use the logged-in user's Supabase browser client to:

- insert own attempt row
- upload to own storage folder
- update own attempt row

This requires RLS and storage policies.

Do not use the service role key for browser upload.

## Database migration

Create:

supabase/migrations/004_attempt_audio_storage_policies.sql

The migration should:

1. Ensure the attempt-audio bucket exists and is private if possible.
2. Add storage.objects policies so authenticated users can:
   - insert objects in attempt-audio only inside their own user id folder
   - select objects in attempt-audio only inside their own user id folder
   - update objects in attempt-audio only inside their own user id folder
   - delete objects in attempt-audio only inside their own user id folder

Folder rule:

The first folder segment in storage.objects.name must equal auth.uid()::text.

Example allowed path:

{auth.uid()}/attempt-id/answer.webm

Example blocked path:

someone-else-user-id/attempt-id/answer.webm

3. Confirm attempts RLS already allows users to insert and update their own attempts. Add missing policies only if needed.

This migration must be safe to run in hosted Supabase SQL Editor.

## Recording states

Use these UI states:

- idle
- requesting_permission
- recording
- recorded
- uploading
- uploaded
- error

## User-facing copy

Use premium, clear wording.

Good copy:

- Record your speaking answer
- Your recording stays private in your practice account
- Submit recording
- Recording saved
- Transcription and AI-supported feedback will be added in the next step

Avoid cheap wording:

- Free unlimited recording
- AI score instantly
- Official CELPIP score
- Guaranteed result

## Completion state copy

Heading:

Recording saved

Text:

Your speaking response has been saved. In the next step, this recording will be transcribed and used to generate AI-supported practice feedback.

Actions:

- Back to task
- Practice another task

## Error states

Handle:

- Microphone permission denied
- Browser recording not available
- Recording failed
- Upload failed
- Attempt save failed

Each error should show:

- clear message
- retry option when possible
- back path to task

## Mobile UX requirements

- Recording button must be easy to tap
- Timer remains readable
- Prompt remains readable
- Playback controls should not overflow
- Uploading state should be clear
- Re-record and Submit recording actions should be easy to understand
- Page should work well on mobile because users may come from WhatsApp

## Security requirements

- Do not expose service role key in client components
- Do not import src/lib/supabase/admin.ts into client components
- Use authenticated Supabase browser client for upload
- Audio bucket must remain private
- Users must not be able to access another user's audio path
- .env.local must stay ignored

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

- User can record during speaking practice
- User can stop recording
- User can replay recording
- User can re-record before submitting
- User can submit recording
- Audio uploads to private Supabase Storage
- Attempt row is created or updated with audio_path
- No transcription is built
- No AI scoring is built
- No paid/scored usage is counted
- Friendly error states exist
- Mobile layout remains usable
- npm run lint passes
- npm run build passes
- No secrets are committed
- No service role key is used in client components
