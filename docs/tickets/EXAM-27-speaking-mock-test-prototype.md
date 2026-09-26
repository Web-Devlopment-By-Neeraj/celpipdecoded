# EXAM-27 - Speaking Mock Test Section Prototype

## Goal

Build Mock Test 1 Speaking section prototype.

This starts the Speaking mock test flow after completing:

- Listening full section
- Reading full section
- Writing mock test prototype
- Writing AI review and score

This ticket should build only the Speaking mock test screen experience:

- Speaking section route
- Speaking instructions screen
- Speaking Task 1-8 screens
- source-based prompts
- image or visual prompt support if the source provides it
- preparation timer
- recording timer
- browser recording
- local audio preview
- local response state
- completion screen
- dashboard internal access

Do not build transcription in this ticket.
Do not build AI review in this ticket.
Do not build Speaking score in this ticket.
Do not build estimated Speaking band in this ticket.
Do not upload audio to Supabase in this ticket.
Do not save answers to Supabase.
Do not create database migrations.
Do not build full all-skills mock test flow.
Do not build admin panel.
Do not change Listening unless fixing an accidental shared regression.
Do not change Reading unless fixing an accidental shared regression.
Do not change Writing unless fixing an accidental shared regression.
Do not change existing standalone Speaking Practice AI flow.
Do not change existing standalone Writing Practice AI flow.
Do not build payment.
Do not build live classes.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

Use practice wording:

- Toronto Academy speaking practice
- Mock Test 1 - Speaking
- practice recording
- AI review will be added later
- not an official CELPIP score

Do not say:

- official CELPIP score
- official result
- guaranteed score
- pass guarantee

## Source content

Use this source file as the authority:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

Also inspect:

mock-tests/mock-test-1/extracted-content-outline.md
mock-tests/mock-test-1/extracted-links.md
docs/product/mock-test-1-content-map.md
docs/product/celpip-exam-rules-research.md
docs/product/admin-mock-test-builder-blueprint.md

Use the source document for:

- Speaking section title
- Speaking instructions
- Speaking Task 1 prompt
- Speaking Task 2 prompt
- Speaking Task 3 prompt
- Speaking Task 4 prompt
- Speaking Task 5 prompt
- Speaking Task 6 prompt
- Speaking Task 7 prompt
- Speaking Task 8 prompt
- image links if provided
- video links if provided
- preparation timing if available
- response timing if available

Do not invent Speaking prompts.
Do not invent images.
Do not invent visual descriptions unless the source provides them.
Do not replace source wording with generic CELPIP knowledge.

If the source document is unclear, document the gap instead of guessing.

## Required route

Create protected route:

src/app/dashboard/mock-tests/mock-test-1/speaking/page.tsx

URL:

/dashboard/mock-tests/mock-test-1/speaking

This is the Speaking mock test section prototype route.

## Required files to create or update

Create content file:

src/features/exam-engine/mock-tests/mock-test-1/speaking-section.ts

Create speaking mock test types:

src/features/exam-engine/speaking-mock-types.ts

Create speaking mock flow helpers:

src/features/exam-engine/speaking-mock-flow.ts
src/features/exam-engine/speaking-mock-copy.ts
src/features/exam-engine/speaking-mock-timing.ts

Create components:

src/components/exam/speaking/SpeakingSectionPrototype.tsx
src/components/exam/speaking/SpeakingSectionIntroScreen.tsx
src/components/exam/speaking/SpeakingTaskScreen.tsx
src/components/exam/speaking/SpeakingPromptPanel.tsx
src/components/exam/speaking/SpeakingVisualPrompt.tsx
src/components/exam/speaking/SpeakingPrepTimer.tsx
src/components/exam/speaking/SpeakingRecordingTimer.tsx
src/components/exam/speaking/SpeakingRecorder.tsx
src/components/exam/speaking/SpeakingAudioPreview.tsx
src/components/exam/speaking/SpeakingTaskTransitionScreen.tsx
src/components/exam/speaking/SpeakingSectionCompleteScreen.tsx

Reuse existing exam shell and timer components where possible:

src/components/exam/ExamModeViewport.tsx
src/components/exam/ExamShell.tsx
src/components/exam/timer/ExamCountdownTimer.tsx
src/features/exam-engine/exam-theme.ts

Reuse existing standalone speaking recording logic only if safe.

Do not break:

/dashboard/speaking
existing speaking task routes
existing speaking recording/transcription/AI result flow

Create documentation:

docs/product/speaking-mock-test-prototype.md

Update dashboard:

Add internal preview card or button for:

Title:
Mock Test 1 - Speaking Test

Badge:
Internal preview or Prototype

Route:
/dashboard/mock-tests/mock-test-1/speaking

Description:
Speaking section prototype with Tasks 1-8, preparation timer, and local recordings. AI review will be added next.

Button:
Open Speaking Test

Keep existing Listening, Reading, and Writing cards untouched.

Do not claim full all-skills Mock Test 1 is complete yet.

## Expected Speaking structure

Build only what the Mock Test 1 source supports.

Expected speaking section:

- Task 1 - Giving Advice
- Task 2 - Talking about a Personal Experience
- Task 3 - Describing a Scene
- Task 4 - Making Predictions
- Task 5 - Comparing and Persuading
- Task 6 - Dealing with a Difficult Situation
- Task 7 - Expressing Opinions
- Task 8 - Describing an Unusual Situation

Use the exact task prompts and visual links from the source.

## Screen flow

Create a local client-side flow.

Suggested flow:

1. Speaking section intro

Shows:

- Mock Test 1 - Speaking
- practice-only note
- includes Tasks 1-8
- no AI review yet
- Next button

2. Speaking Task screen for each task

Each task should show:

- task title
- source prompt
- visual prompt if source provides image/video
- preparation timer
- recording timer
- Start recording
- Stop recording
- audio preview after recording
- Re-record button
- Next task button

3. Transition screens between tasks

Shows:

- previous task complete
- continue to next task

4. Completion screen

Shows:

- Speaking section complete
- number of recorded tasks
- task list with recorded or missing status
- AI review and estimated score will be added in the next ticket
- Restart Speaking
- Return to dashboard

Do not call transcription.
Do not call AI.
Do not upload audio in this ticket.

## Recording behavior

Use browser MediaRecorder.

Requirements:

- request microphone permission only when user starts recording
- allow recording
- allow stop
- create local audio blob URL
- show audio preview
- allow re-recording
- preserve recordings while navigating inside the Speaking mock route
- do not upload audio
- do not save audio to database
- do not save audio to localStorage
- do not call Supabase Storage

Handle unsupported browser:

- show clear message if MediaRecorder is unavailable
- do not crash

Handle permission denied:

- show clear message
- let user try again
- do not crash

## Timer behavior

Use source-supported timing if available.

If exact timing is available from source or project research, use:

- task preparation time
- task response time

If timing is unclear, use a clearly documented placeholder.

For this prototype:

- preparation timer should count down live
- recording timer should count down live
- time-up should show "Time is up"
- do not auto-submit to AI
- do not erase recordings when time expires
- do not force upload
- user can continue manually

Strict Speaking timing can be handled later.

## Answer state

Use local React state.

Suggested shape:

{
  [taskId: string]: {
    audioUrl: string | null,
    audioBlob: Blob | null,
    durationSeconds: number,
    recordedAt: string | null
  }
}

Do not save to database.
Do not use localStorage.
Do not use cookies.
Do not call Supabase.
Do not submit to existing Speaking Practice evaluator yet.

## AI review

Do not implement AI review in this ticket.

But design the flow so EXAM-28 can add:

- audio upload or server-side audio handling
- transcription
- speaking AI evaluation
- estimated Speaking level
- task-level feedback
- full Speaking result screen

Speaking AI criteria for EXAM-28 will be:

- Content/Coherence
- Vocabulary
- Listenability
- Task Fulfillment

Document how EXAM-28 should continue.

## Visual requirements

Speaking section should feel consistent with Listening, Reading, and Writing exam mode:

- neutral exam background
- no orange or marketing background
- no dashboard sidebar inside exam route
- no internal preview label inside exam surface
- fixed top exam bar
- fixed bottom navigation where appropriate
- stable middle content area
- internal scroll only where needed
- full browser-width exam experience is acceptable
- no official CELPIP branding

The speaking screen should be comfortable:

- prompt panel readable
- visual prompt clear if present
- timer visible
- recording controls clear
- audio preview visible after recording
- buttons clear

## Dashboard behavior

Dashboard Mock tests section should show:

- Mock Test 1 - Listening Test
- Mock Test 1 - Reading Test
- Mock Test 1 - Writing Test
- Mock Test 1 - Speaking Test

Speaking should be marked internal preview or prototype.

Do not show individual speaking task cards on dashboard.

## Documentation

Create:

docs/product/speaking-mock-test-prototype.md

Include:

1. Route created
2. Source content used
3. Tasks included
4. Prompt structure
5. Visual prompt handling
6. Timer behavior
7. Recording behavior
8. Audio state strategy
9. Unsupported browser and permission behavior
10. Dashboard link status
11. What is intentionally not built
12. EXAM-28 continuation note

## Known intentional gaps

Document these:

- no transcription yet
- no AI review yet
- no Speaking score yet
- no estimated Speaking band yet
- no audio upload
- no persisted attempt history
- no database save
- no admin panel
- no full all-skills mock test flow yet

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not touch Supabase service role
- Do not change auth
- Do not create migrations
- Do not save audio to database
- Do not upload audio to storage
- Do not call OpenAI in this ticket
- Do not expose secrets in client code

## Manual Supabase steps

None.

Do not create migrations.

## Style rule

Use normal hyphens only.
Do not use em dashes.
Do not use long hyphens.
Use straight quotes only.

## Validation

Run:

npm run lint
npm run build

Search changed files for:

- long hyphens
- em dashes
- curly quotes

Replace with normal hyphens and straight quotes.

## Done criteria

- Speaking route exists
- Speaking section intro appears
- Speaking Tasks 1-8 appear from source content
- Visual prompt appears where source provides it
- Preparation timer appears
- Recording timer appears
- User can record audio
- User can stop recording
- User can preview local recording
- User can re-record
- User can move through all 8 tasks
- Completion screen appears
- Missing recordings do not crash the flow
- Unsupported browser state is handled
- Permission denied state is handled
- No transcription is built
- No AI review is built
- No Speaking score is built
- No estimated Speaking band is built
- No audio upload is created
- No database save is created
- No Supabase migration is created
- Dashboard has internal Speaking access
- Existing Listening route still works
- Existing Reading full route still works
- Existing Writing mock route still works
- Existing standalone Speaking Practice AI flow is untouched
- Existing standalone Writing Practice AI flow is untouched
- docs/product/speaking-mock-test-prototype.md exists
- npm run lint passes
- npm run build passes
