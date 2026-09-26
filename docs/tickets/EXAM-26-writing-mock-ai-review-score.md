# EXAM-26 - Writing Mock Test AI Review and Score

## Goal

Add AI review and estimated practice score to Mock Test 1 Writing section.

This continues EXAM-25.

EXAM-25 created the Writing mock test prototype at:

/dashboard/mock-tests/mock-test-1/writing

This ticket should add:

- Submit for AI Review
- server-side AI evaluation
- structured Writing result screen
- Task 1 feedback
- Task 2 feedback
- overall estimated Writing level
- criterion scores
- top mistakes
- next-level rewrite
- Level 11-12 model response
- practice-only disclaimer

Do not build Speaking.
Do not build full all-skills mock test flow.
Do not build admin panel.
Do not create database migrations.
Do not save writing responses to Supabase in this ticket.
Do not add localStorage.
Do not change Listening unless fixing an accidental shared regression.
Do not change Reading unless fixing an accidental shared regression.
Do not change standalone Writing Practice AI flow unless safely reusing existing helpers.
Do not change standalone Speaking Practice AI flow.
Do not build payment.
Do not build live classes.
Do not copy official CELPIP branding into production UI.

## Product wording

Use:

- Toronto Academy practice estimate
- estimated Writing level
- AI-supported feedback
- not an official CELPIP score

Do not say:

- official CELPIP score
- official result
- guaranteed score
- pass guarantee

## Evaluation source

Use the evaluator rules supplied by the user in the CELPIP Self-Evaluation Prompts file.

Writing must be evaluated using these four criteria:

1. Content/Coherence
2. Vocabulary
3. Readability
4. Task Fulfillment

Important:
For Writing, the third criterion is Readability, not Listenability.

The evaluator must be conservative:

- if a response is between two levels, assign the lower level
- do not inflate
- do not simply average the four criteria
- weigh Task Fulfillment heavily
- let a serious weakness pull down the overall estimate
- clearly say this is a practice estimate, not an official score

## Task-specific checks

For Task 1 - Email, verify:

- organized in appropriate paragraphs
- effective, detailed arguments
- ideas ordered logically
- includes greeting, opener, closer, and sign-off suitable to the task
- few grammar and spelling errors
- transitions and conjunctions improve flow
- addresses all prompt points
- tone suitable for audience
- vocabulary suitable for the task
- 150-200 words

For Task 2 - Survey Response, verify:

- clear opinion or choice statement
- reasons that expand on the opinion
- concrete examples
- advantages of the chosen option explained
- suitable vocabulary
- few grammar and spelling errors
- suitable tone
- appropriate paragraphs
- transitions and conjunctions improve flow
- 150-200 words

## Required route

Update existing route:

src/app/dashboard/mock-tests/mock-test-1/writing/page.tsx

URL remains:

/dashboard/mock-tests/mock-test-1/writing

## Required files to create or update

Create server action:

src/app/dashboard/mock-tests/mock-test-1/writing/actions.ts

Create AI evaluation helpers:

src/features/exam-engine/writing-mock-evaluation-types.ts
src/features/exam-engine/writing-mock-evaluation-schema.ts
src/features/exam-engine/writing-mock-evaluation-prompt.ts
src/features/exam-engine/evaluate-writing-mock-test.ts

Update existing Writing mock files if needed:

src/features/exam-engine/mock-tests/mock-test-1/writing-section.ts
src/features/exam-engine/writing-mock-types.ts
src/features/exam-engine/writing-mock-flow.ts
src/features/exam-engine/writing-mock-copy.ts
src/components/exam/writing/WritingSectionPrototype.tsx

Create components:

src/components/exam/writing/WritingAiReviewButton.tsx
src/components/exam/writing/WritingEvaluationProcessingScreen.tsx
src/components/exam/writing/WritingEvaluationErrorScreen.tsx
src/components/exam/writing/WritingSectionResultScreen.tsx
src/components/exam/writing/WritingTaskResultCard.tsx
src/components/exam/writing/WritingCriterionScoreTable.tsx
src/components/exam/writing/WritingTopMistakesCard.tsx
src/components/exam/writing/WritingRewriteCard.tsx
src/components/exam/writing/WritingPracticeDisclaimer.tsx

Reuse existing standalone writing AI helpers only if safe.

Do not break:

/dashboard/writing
/dashboard/writing/attempts
existing standalone writing practice result pages

Create documentation:

docs/product/writing-mock-ai-review-score.md

## Server-side AI behavior

Create a server action:

evaluateWritingMockTest

Input:

{
  task1Response: string,
  task2Response: string
}

The server action should use the existing Writing mock test source content from:

src/features/exam-engine/mock-tests/mock-test-1/writing-section.ts

It should send to AI:

- Task 1 type
- Task 1 original prompt
- Task 1 required points
- Task 1 student response
- Task 1 word count
- Task 2 type
- Task 2 original prompt
- Task 2 required points
- Task 2 student response
- Task 2 word count
- evaluation criteria
- conservative scoring rules
- required JSON output schema

Use OpenAI server side only.

Security:

- OPENAI_API_KEY server side only
- OPENAI_WRITING_MODEL server side only
- no API key in client
- no secrets printed
- no .env.local reading or logging
- no database save
- no migration

## AI output structure

The AI must return JSON only.

Use Zod validation.

Suggested structure:

{
  "overallEstimatedLevel": "string",
  "overallJustification": "string",
  "practiceDisclaimer": "string",
  "taskResults": [
    {
      "taskId": "writing-task-1",
      "taskTitle": "Task 1 - Email",
      "wordCount": 0,
      "withinWordRange": false,
      "estimatedLevel": "string",
      "oneSentenceJustification": "string",
      "criteria": [
        {
          "criterion": "Content/Coherence",
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
      "templateLanguageWarnings": ["string"]
    }
  ]
}

Important:
The result does not need to show a full marked-up inline version in this ticket unless it is easy and safe. If skipped, document that a marked-up rewrite can be added later.

## Empty response behavior

Do not crash on empty responses.

If one task is empty:

- return a low or insufficient-response result for that task
- show word count 0
- show not within range
- explain that there was not enough writing to evaluate properly
- still evaluate the other task if it has text

If both tasks are empty:

- do not waste an AI call if avoidable
- return a structured no-response result
- show a clear message that no writing was submitted
- do not crash

## UI flow

Current EXAM-25 flow:

1. Writing intro
2. Task 1
3. transition
4. Task 2
5. completion

Update completion screen:

- show Task 1 word count
- show Task 2 word count
- show Submit for AI Review button
- show loading/progress state
- show error state if AI fails
- show result screen after AI returns

Result screen should show:

- overall estimated Writing level
- practice-only disclaimer
- Task 1 result card
- Task 2 result card
- criterion score table for each task
- top mistakes
- next-level rewrite
- Level 11-12 model response
- restart Writing button
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

Keep Writing marked as internal preview or prototype if needed.

Do not add Speaking card yet.

Do not claim all-skills Mock Test 1 is complete.

## Documentation

Create:

docs/product/writing-mock-ai-review-score.md

Include:

1. Route updated
2. AI server action created
3. Evaluation criteria used
4. Task-specific checklist behavior
5. JSON schema behavior
6. Empty response behavior
7. Result screen behavior
8. Practice-only disclaimer
9. Security notes
10. What is intentionally not built
11. EXAM-27 continuation note

## Known intentional gaps

Document these:

- no database save
- no persisted attempt history
- no marked-up inline rewrite if skipped
- no Speaking mock test section
- no full all-skills mock test summary
- no admin panel
- no student analytics
- no usage limit changes
- no payment changes

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

- Writing mock route still loads
- User can complete Task 1 and Task 2
- User can submit for AI review
- AI call is server side only
- AI result validates with schema
- Result screen appears
- Task 1 feedback appears
- Task 2 feedback appears
- Four Writing criteria appear
- Word counts appear
- Overall estimated Writing level appears
- Practice-only disclaimer appears
- Empty responses do not crash
- No database save is created
- No Supabase migration is created
- Existing standalone Writing Practice AI flow still works
- Existing Listening route still works
- Existing Reading route still works
- Dashboard still has Listening, Reading, and Writing cards
- No Speaking is built
- No admin panel is built
- docs/product/writing-mock-ai-review-score.md exists
- npm run lint passes
- npm run build passes
