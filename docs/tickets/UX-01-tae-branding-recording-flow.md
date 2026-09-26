# UX-01 - Toronto Academy Branding and Recording Flow Cleanup

## Goal

Clean up the product branding and improve the speaking practice recording flow before adding usage limits or payment.

The product is now under Toronto Academy of Education.

Georgo should not be the main brand. Georgo can appear only as a subtle powered-by line.

## Product name

Toronto Academy CELPIP Practice

## Brand assets

Use these files from public:

- public/taelogo.jpg
- public/favicon.png
- public/georgo.png if available

If filenames differ, inspect the public folder and use the correct assets.

## Branding requirements

Use Toronto Academy branding everywhere:

- Landing page
- Browser tab title
- Favicon
- Header logo
- Auth pages
- Dashboard
- Speaking module
- Practice screen
- Result pages
- Footer

Remove or replace:

- Georgo Academy as main brand
- Georgo logo as main logo
- Next.js default icon
- Any default Next.js symbols
- Any old app icon that still shows the wrong brand

Keep Georgo only as:

Powered by Georgo Analytics and Automation

This can appear subtly in the footer or lower landing section.

## Favicon requirements

The browser tab should show the Toronto Academy favicon.

Use:

public/favicon.png

Update app metadata or icon files as needed.

Remove or replace any default Next.js favicon or app icon.

The favicon should display correctly in:

- desktop browser tab
- mobile browser
- phone home screen preview where possible

## Landing page requirements

Update the landing page to feel clearly Toronto Academy branded.

Landing page header:

- Toronto Academy logo on the left
- Navigation on the right for desktop
- Mobile responsive menu or stacked mobile header
- Sign in
- Get started

Hero and page copy should use Toronto Academy CELPIP Practice.

Do not fully redesign the page unless needed. This is branding cleanup and navigation polish.

Add subtle footer text:

Powered by Georgo Analytics and Automation

Do not make Georgo visually compete with Toronto Academy.

## Recording flow improvement

Current problem:

The user has to click Start speaking and then click Start recording separately. This hurts the user experience.

New behavior:

- Preparation phase can be skipped
- Start speaking time should automatically start recording
- There should be no separate primary Start recording button during the speaking phase
- The recording should begin when the speaking timer begins
- If microphone permission is needed, request permission before the speaking timer starts
- If permission is denied, do not start the timer
- Show a clear microphone error and retry option

## Preparation skip behavior

On the intro or preparation phase, add:

Skip preparation

When clicked:

- preparation phase ends
- user moves to ready_to_speak or directly to the start speaking action
- user can start speaking without waiting for the prep timer

Do not remove the normal preparation timer. Some users may still want to use it.

## Speaking and recording behavior

When the user clicks:

Start speaking time

The app should:

1. Request microphone permission if needed
2. Start the speaking timer
3. Start recording automatically
4. Show recording status clearly
5. Stop recording automatically when the speaking timer reaches zero
6. Allow the user to stop early if needed
7. Allow replay after recording
8. Allow re-record before submitting
9. Allow submit recording after a valid recording exists

Do not auto-submit recording at timer end.

## Button and copy changes

Use:

- Start preparation
- Skip preparation
- Start speaking time
- Stop recording
- Re-record
- Submit recording
- Submit for feedback

Do not show:

- Start recording as a separate primary action after speaking starts

It is acceptable to show recording status such as:

Recording in progress

## User experience rule

The student should feel like the app is guiding the test flow.

The user should not need to think about technical steps such as recording setup.

The user flow should feel like:

1. Prepare
2. Speak
3. Submit
4. Get feedback

Not:

1. Prepare
2. Speak
3. Start recorder
4. Stop recorder
5. Transcribe
6. Score

## Required updates

Update as needed:

src/app/layout.tsx
src/app/page.tsx
src/app/icon.png or app icon files
src/app/(auth)/login/page.tsx
src/app/(auth)/signup/page.tsx
src/app/dashboard/layout.tsx
src/app/dashboard/page.tsx
src/app/dashboard/speaking/page.tsx
src/app/dashboard/speaking/practice/[taskId]/page.tsx
src/app/dashboard/speaking/attempts/[attemptId]/page.tsx

Update components as needed:

src/components/landing/*
src/components/auth/*
src/components/app/*
src/components/speaking/TimedPracticeShell.tsx
src/components/speaking/PracticeControls.tsx
src/components/speaking/AudioRecorder.tsx
src/components/speaking/RecordingStatusCard.tsx
src/components/speaking/RecordingSuccessCard.tsx

Update feature files as needed:

src/features/speaking/practice-flow.ts
src/features/speaking/timer-utils.ts
src/features/speaking/audio-utils.ts

## Important implementation notes

The speaking timer should not start until microphone permission is granted and recording can start.

If recording fails to start:

- keep the user in ready_to_speak or error state
- show a retry option
- do not consume any attempt
- do not create an attempt row

Attempt rows should still only be created when the user submits a recording.

## Manual Supabase steps

No Supabase migration should be needed for this ticket.

Do not create new tables.

Do not change payment or usage logic.

## Security requirements

- Do not expose service role key in client components
- Do not import admin Supabase helper into client components
- Do not expose OpenAI keys in client components
- Keep .env.local ignored
- Do not print real environment values

## Mobile UX requirements

- Landing header must be responsive
- Logo must not overflow
- Auth pages must remain mobile friendly
- Practice screen buttons must be easy to tap
- Timer must remain readable
- Recording status must be clear
- Header must not break on phone screens

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- Toronto Academy logo appears as main brand
- Toronto Academy favicon appears in browser tab
- Next.js default icon is removed
- Georgo appears only as subtle powered-by branding
- Landing page header is mobile responsive
- Dashboard and app screens say Toronto Academy CELPIP Practice
- Preparation can be skipped
- Start speaking time starts recording automatically
- No separate Start recording primary step remains
- Microphone permission error is handled
- Recording still uploads correctly
- Submit for feedback flow still works
- npm run lint passes
- npm run build passes
- No secrets are committed
