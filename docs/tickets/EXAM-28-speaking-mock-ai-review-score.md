claude# EXAM-28 - Speaking Mock Test Transcription and AI Review

## Goal

Add transcription, AI review, and estimated practice score to Mock Test 1 Speaking section.

This continues EXAM-27.

EXAM-27 created the Speaking mock test prototype at:

/dashboard/mock-tests/mock-test-1/speaking

This ticket should add:

- Submit for AI Review
- server-side audio handling
- transcription for recorded tasks
- structured Speaking result screen
- task-level Speaking feedback
- overall estimated Speaking level
- criterion scores
- transcript display
- top mistakes
- next-level spoken rewrite
- Level 11-12 spoken model response
- practice-only disclaimer

Do not build full all-skills mock test flow.
Do not build admin panel.
Do not create database migrations.
Do not save audio to Supabase in this ticket.
Do not save results to Supabase in this ticket.
Do not add localStorage.
Do not change Listening unless fixing an accidental shared regression.
Do not change Reading unless fixing an accidental shared regression.
Do not change Writing unless fixing an accidental shared regression.
Do not break standalone Speaking Practice AI flow.
Do not break standalone Writing Practice AI flow.
Do not build payment.
Do not build live classes.
Do not copy official CELPIP branding into production UI.

## Product wording

Use:

- Toronto Academy practice estimate
- estimated Speaking level
- AI-supported feedback
- not an official CELPIP score
- audio-based practice review

Do not say:

- official CELPIP score
- official result
- guaranteed score
- pass guarantee

## Evaluation source

Use the user-provided CELPIP Speaking self-evaluation rules.

Speaking must be evaluated using these four criteria:

1. Content/Coherence
2. Vocabulary
3. Listenability
4. Task Fulfillment

Important:

- For Speaking, use Listenability, not Readability.
- Be conservative.
- If between two levels, assign the lower level.
- Do not inflate.
- Do not simply average the criteria.
- Weigh Task Fulfillment heavily.
- A serious weakness can pull down the overall estimate.
- Clearly say this is a practice estimate, not an official CELPIP score.

## Audio-first scoring rule

The user wants Speaking to be audio-first.

The system should:

- use the recorded audio when available
- transcribe what the student said
- preserve fillers, repetitions, false starts, and self-corrections as much as the transcription model supports
- use transcript, task prompt, recording duration, and visible fluency markers for scoring
- never pretend to be a human rater
- never claim official CELPIP scoring

Important limitation:

If the implementation only sends transcript text to the scoring model after transcription, the result screen must not overclaim direct pronunciation, rhythm, or intonation judgment. It may say:

"Pronunciation, rhythm, and intonation are estimated from the submitted audio/transcription pipeline and may require human review for full accuracy."

If a safe direct audio evaluation path already exists in the project, Claude may reuse it. Otherwise, build transcript-based AI scoring from the recorded audio and document the limitation.

## Task-specific timing

Use existing Speaking mock task timing from:

src/features/exam-engine/mock-tests/mock-test-1/speaking-section.ts
src/features/exam-engine/speaking-mock-timing.ts

If timing is available, include the response limit and actual recorded duration in AI input.

Expected limits if source supports them:

- Task 1 = 90s
- Task 2 = 60s
- Task 3 = 60s
- Task 4 = 60s
- Task 5 = 60s
- Task 6 = 60s
- Task 7 = 90s
- Task 8 = 60s

Use source or existing project timing as authority.

## Existing route

Update existing route:

src/app/dashboard/mock-tests/mock-test-1/speaking/page.tsx

URL remains:

/dashboard/mock-tests/mock-test-1/speaking

## Required files to create or update

Create server-side action or route handler.

Preferred if feasible:

src/app/dashboard/mock-tests/mock-test-1/speaking/actions.ts

Suggested action:

evaluateSpeakingMockTest

If server actions cannot safely handle multiple audio blobs, create an API route instead:

src/app/api/mock-tests/mock-test-1/speaking/evaluate/route.ts

In either case, the client should submit audio as FormData.

Create AI and transcription helpers:

src/features/exam-engine/speaking-mock-evaluation-types.ts
src/features/exam-engine/speaking-mock-evaluation-schema.ts
src/features/exam-engine/speaking-mock-evaluation-prompt.ts
src/features/exam-engine/evaluate-speaking-mock-test.ts
src/features/exam-engine/transcribe-speaking-mock-audio.ts

Update existing Speaking mock files if needed:

src/features/exam-engine/mock-tests/mock-test-1/speaking-section.ts
src/features/exam-engine/speaking-mock-types.ts
src/features/exam-engine/speaking-mock-flow.ts
src/features/exam-engine/speaking-mock-copy.ts
src/components/exam/speaking/SpeakingSectionPrototype.tsx

Create components:

src/components/exam/speaking/SpeakingAiReviewButton.tsx
src/components/exam/speaking/SpeakingEvaluationProcessingScreen.tsx
src/components/exam/speaking/SpeakingEvaluationErrorScreen.tsx
src/components/exam/speaking/SpeakingSectionResultScreen.tsx
src/components/exam/speaking/SpeakingTaskResultCard.tsx
src/components/exam/speaking/SpeakingCriterionScoreTable.tsx
src/components/exam/speaking/SpeakingTranscriptCard.tsx
src/components/exam/speaking/SpeakingTopMistakesCard.tsx
src/components/exam/speaking/SpeakingRewriteCard.tsx
src/components/exam/speaking/SpeakingPracticeDisclaimer.tsx

Reuse shared Writing result components only if genuinely generic and safe.

Do not break:

/dashboard/speaking
existing standalone speaking task routes
existing standalone speaking recording/transcription/AI result flow

Create documentation:

docs/product/speaking-mock-ai-review-score.md

## FormData input

Client should submit:

- task metadata JSON
- one audio file per recorded task
- task id
- recording duration seconds if available
- mime type
- task prompt and task title should come from server content, not client trust

Suggested FormData:

metadata:
{
  "tasks": [
    {
      "taskId": "speaking-task-1",
      "durationSeconds": 72,
      "hasRecording": true
    }
  ]
}

audio files:

audio-speaking-task-1
audio-speaking-task-2
...
audio-speaking-task-8

Server must not trust client prompt text. Server imports source task content.

## Transcription behavior

Use OpenAI server side only.

Use existing env if available:

OPENAI_API_KEY
OPENAI_TRANSCRIPTION_MODEL

If OPENAI_TRANSCRIPTION_MODEL is missing, reuse the same fallback pattern as existing standalone Speaking Practice if one exists.

Transcription should:

- run only for tasks with audio
- return transcript text
- try to preserve fillers, restarts, and pauses where possible
- return a structured insufficient-response result for missing audio
- not crash the entire section if one task fails, unless all tasks fail
- include safe error classification

Do not log full audio.
Do not log secrets.
Do not log full transcripts unless already allowed by existing development patterns. Prefer transcript length and task id.

## AI scoring behavior

Use OpenAI server side only.

Use existing env if available:

OPENAI_API_KEY
OPENAI_SCORING_MODEL

If the project has a specific speaking model env, use that.

The scoring prompt must receive:

- task id
- task title
- original prompt
- visual prompt description if available from source
- response time limit
- actual duration
- transcript
- notes if audio was missing or transcription failed
- four Speaking criteria
- conservative scoring rules
- required JSON output schema

Do not send answer keys. Speaking does not use objective answer keys.

## AI output structure

The AI must return JSON only.

Use Zod validation.

Suggested structure:

{
  "overallEstimatedLevel": "string",
  "overallJustification": "string",
  "practiceDisclaimer": "string",
  "audioAssessmentNote": "string",
  "taskResults": [
    {
      "taskId": "speaking-task-1",
      "taskTitle": "Task 1 - Giving Advice",
      "responseTimeLimitSeconds": 90,
      "recordedDurationSeconds": 72,
      "transcript": "string",
      "transcriptConfidenceNote": "string",
      "estimatedLevel": "string",
      "oneSentenceJustification": "string",
      "timeLengthCheck": "string",
      "criteria": [
        {
          "criterion": "Content/Coherence",
          "level": "string",
          "evidence": "string",
          "missingForNextLevel": "string"
        },
        {
          "criterion": "Vocabulary",
          "level": "string",
          "evidence": "string",
          "missingForNextLevel": "string"
        },
        {
          "criterion": "Listenability",
          "level": "string",
          "evidence": "string",
          "missingForNextLevel": "string"
        },
        {
          "criterion": "Task Fulfillment",
          "level": "string",
          "evidence": "string",
          "missingForNextLevel": "string"
        }
      ],
      "criticalFeedback": {
        "succeeded": "string",
        "fellShort": "string"
      },
      "topMistakes": [
        {
          "original": "string",
          "correction": "string",
          "criterion": "string"
        }
      ],
      "nextLevelRewrite": {
        "targetLevel": "string",
        "response": "string",
        "changeSummary": [
          {
            "original": "string",
            "correction": "string",
            "criterion": "string"
          }
        ]
      },
      "levelElevenTwelveModel": {
        "response": "string"
      },
      "missingPromptPoints": ["string"],
      "templateLanguageWarnings": ["string"],
      "recordingStatus": "recorded"
    }
  ]
}

Allow recordingStatus values:

- recorded
- missing
- transcription_failed
- insufficient_response

The result does not need to show every detail if it becomes too long, but the structured data should support it.

## Missing recording behavior

Do not crash on missing recordings.

If one task is missing:

- mark that task as missing
- show "No recording submitted"
- score that task low or insufficient
- still evaluate other recorded tasks

If all tasks are missing:

- do not waste an AI call if avoidable
- return a structured no-response result
- show a clear message that no recordings were submitted
- do not crash

## Error handling

Add safe error classification.

Handle:

- missing OPENAI_API_KEY
- missing OPENAI_TRANSCRIPTION_MODEL
- missing OPENAI_SCORING_MODEL
- audio upload or FormData parse failure
- audio file too large
- unsupported audio type
- transcription request failure
- scoring request failure
- JSON parse failure
- Zod validation failure
- OpenAI 429 credit_balance_exhausted
- unknown error

For credit exhausted, show a helpful development-safe message:

"AI review could not run because API credits are exhausted. Add API credits and try again. Your recordings are still held on this page."

Do not expose stack traces in UI.
Do not expose secrets.
Do not log full audio.

## UI flow

Current EXAM-27 flow:

1. Speaking intro
2. Task 1
3. transition
4. Task 2
5. transition
6. through Task 8
7. completion

Update completion screen:

- show recorded task count
- show missing task count
- show Submit for AI Review button
- show loading/progress state
- show error state if transcription or AI fails
- show result screen after AI returns

Result screen should show:

- overall estimated Speaking level
- practice-only disclaimer
- audio assessment note
- task result cards
- transcript for each recorded task
- criterion score table for each task
- top mistakes
- next-level spoken rewrite
- Level 11-12 spoken model response
- restart Speaking button
- return to dashboard button

## Visual requirements

Keep exam style consistent:

- neutral exam background
- no orange or marketing background
- no dashboard sidebar inside exam route
- no official CELPIP branding
- clean result cards
- structured feedback, not one giant AI paragraph
- readable on desktop
- acceptable on mobile

## Dashboard behavior

Dashboard should still show:

- Mock Test 1 - Listening Test
- Mock Test 1 - Reading Test
- Mock Test 1 - Writing Test
- Mock Test 1 - Speaking Test

Keep Speaking marked as internal preview or prototype if needed.

Do not claim all-skills Mock Test 1 is complete yet.

## Documentation

Create:

docs/product/speaking-mock-ai-review-score.md

Include:

1. Route updated
2. Audio submission approach
3. Transcription behavior
4. AI server action or API route created
5. Evaluation criteria used
6. Audio-first scoring behavior and limitation
7. JSON schema behavior
8. Missing recording behavior
9. Error handling behavior
10. Result screen behavior
11. Practice-only disclaimer
12. Security notes
13. What is intentionally not built
14. EXAM-29 continuation note

## Known intentional gaps

Document these:

- no database save
- no persisted attempt history
- no Supabase audio storage
- no full all-skills mock test summary
- no admin panel
- no student analytics
- no usage limit changes
- no payment changes
- no direct human-equivalent pronunciation scoring claim

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not touch Supabase service role
- Do not change auth
- Do not create migrations
- Do not save audio to database
- Do not upload audio to storage
- OpenAI API key server side only
- Transcription model server side only
- Scoring model server side only
- Do not expose secrets in client code
- Do not log full audio
- Avoid logging full transcripts unless needed for local debugging

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

- Speaking mock route still loads
- User can complete Tasks 1-8
- User can submit recorded tasks for AI review
- Audio is handled server side only
- Transcription runs for recorded tasks
- Missing recordings do not crash
- AI scoring runs server side
- AI result validates with schema
- Result screen appears
- Task-level transcripts appear
- Four Speaking criteria appear
- Overall estimated Speaking level appears
- Practice-only disclaimer appears
- Empty or missing recordings do not crash
- Credit exhausted error is handled clearly
- No database save is created
- No Supabase migration is created
- No Supabase audio upload is created
- Existing standalone Speaking Practice AI flow still works
- Existing Writing mock route still works
- Existing Listening route still works
- Existing Reading route still works
- Dashboard still has Listening, Reading, Writing, and Speaking cards
- No admin panel is built
- docs/product/speaking-mock-ai-review-score.md exists
- npm run lint passes
- npm run build passes
