# SPEAKING-05A - Speaking Task 5 Choice and Preparation Flow

## Goal

Fix Speaking Task 5 so it follows the correct multi-step flow.

This is a focused behavior and UI flow ticket.

Do not redesign all Speaking screens.
Do not change Listening.
Do not change Reading.
Do not change Writing.
Do not change Supabase.
Do not create migrations.
Do not change admin.
Do not change AI prompts.
Do not change transcription.
Do not change Speaking AI review except to preserve the final Task 5 recording.
Do not change other Speaking tasks unless required by shared navigation state.
Do not copy official CELPIP logo, footer, copyright text, or official assets.

## Reference screenshots

Private screenshots are stored locally at:

_reference/private/celpip-real-ui/

Use only these as private visual reference:

- speaking-task-5-01-instructions.png
- speaking-task-5-02-choose-option.png
- speaking-task-5-03-preparation-after-choice.png
- speaking-task-5-04-speaking-recording.png

Important:

- Do not import these images into the app.
- Do not commit these images.
- Do not copy the official UI pixel for pixel.
- Do not copy official branding.
- Use them only to understand flow, spacing, and screen structure.

## Problem

Speaking Task 5 is not a normal single speaking task.

It should have this flow:

1. Instructions
2. Choose between two options
3. Preparation using chosen option and opposing option
4. Speaking and recording

Currently the app treats Task 5 too much like a normal speaking task.

## Required Task 5 flow

### Step 1 - Instructions screen

Show:

Title:
Practice Test 1 - Speaking Task 5: Comparing and Persuading

Content:
This task has three parts:

1. Choose an option
2. Preparation time
3. Speaking

Show a compact Next button.

Do not start recording here.

### Step 2 - Choice screen

Show:

- main Task 5 prompt
- two option cards side by side
- each option should show image, title, and details if available from existing Task 5 source content
- 60 second choice timer

Behavior:

- user can choose one option
- selected option should be visually clear
- timer reaching zero must not auto-advance
- when time is up, show:
  "Time is up. You can continue when you are ready."
- user clicks Next manually
- if user clicks Next without choosing, the app selects one option automatically
- store whether choice was user-selected or system-selected
- do not change the selection repeatedly on re-render

### Step 3 - Preparation screen

Show:

- selected option as "Your Choice"
- other option as comparison or family choice
- prompt explaining that the student must persuade a family member
- 60 second preparation timer

Behavior:

- timer reaching zero must not auto-advance
- show:
  "Time is up. You can continue when you are ready."
- user clicks Next manually to continue to recording

Do not start recording here.

### Step 4 - Speaking recording screen

Show:

- selected option
- comparison option
- final speaking prompt
- recording timer: 60 seconds
- existing recording controls

Behavior:

- use existing Speaking recorder logic
- do not auto-advance to Task 6 when timer reaches zero
- if existing recorder stops recording at zero, that is acceptable
- stay on the same screen
- user manually clicks Next after recording

## Timer rule

Task 5 must respect the no-auto-skip behavior:

- no auto-next
- no auto-submit
- no auto-advance
- no erasing state
- no repeated random selection
- manual Next only

## State requirements

Preserve:

- Task 5 chosen option
- whether choice was user-selected or system-selected
- Task 5 preparation completion
- Task 5 recording
- other Speaking task recordings

Do not use localStorage.
Do not save to database.
Do not upload new files.

## Files to inspect

- src/features/exam-engine/mock-tests/mock-test-1/speaking-section.ts
- src/features/exam-engine/speaking-mock-flow.ts
- src/features/exam-engine/speaking-mock-types.ts
- src/components/exam/speaking/*
- src/components/exam/player/*

## Components

Create only if useful:

- src/components/exam/speaking/SpeakingTaskFiveInstructionsScreen.tsx
- src/components/exam/speaking/SpeakingTaskFiveChoiceScreen.tsx
- src/components/exam/speaking/SpeakingTaskFivePreparationScreen.tsx
- src/components/exam/speaking/SpeakingTaskFiveRecordingScreen.tsx

Reuse existing recorder and exam player components where possible.

## Other speaking tasks

Tasks 1, 2, 3, 4, 6, 7, and 8 should keep their existing flow.

Do not break:

- recording
- audio preview
- completion screen
- Submit for AI Review
- Speaking AI result screen

## Documentation

Create:

docs/brand/speaking-task-5-choice-prep-flow.md

Include:

1. Old behavior
2. New Task 5 flow
3. Choice screen behavior
4. Auto-choice behavior
5. Preparation screen behavior
6. Recording screen behavior
7. Timer behavior
8. Reference screenshot usage note
9. What was intentionally not changed
10. Test checklist

## Validation

Run:

npm run lint
npm run build

Search changed files for:

- em dashes
- long hyphens
- curly quotes

Replace with normal hyphens and straight quotes.

## Done criteria

- Task 5 has instructions screen
- Task 5 has two-option choice screen
- Task 5 choice timer is 60 seconds
- Timer does not auto-skip
- User can choose one option
- App auto-selects once if user continues without choosing
- Preparation screen shows chosen option and opposing option
- Preparation timer is 60 seconds
- Preparation timer does not auto-skip
- Recording screen shows chosen option and opposing option
- Recording timer is 60 seconds
- Recording screen does not auto-skip to Task 6
- Task 5 recording is preserved
- Other Speaking tasks still work
- Speaking AI review still works
- No Supabase changes
- No migrations
- No admin changes
- npm run lint passes
- npm run build passes
