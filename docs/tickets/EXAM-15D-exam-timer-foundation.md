# EXAM-15D - Exam Timer Foundation and Listening Timer Polish

## Goal

Create a reusable exam timer foundation and apply it to the full Mock Test 1 Listening route.

The app should stop using static timer text like "Time remaining: 30 seconds" and instead show a real countdown timer.

The first implementation should be safe and controlled:

- show live countdown
- change color during warning time
- show "Time is up" when expired
- do not auto-submit yet
- do not auto-skip screens yet
- do not erase learner answers
- do not save to database
- do not build Reading yet

This ticket prepares the timer system so Reading, Writing, and Speaking can reuse it later.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Main route

Apply the timer foundation to:

/dashboard/mock-tests/mock-test-1/listening

File:

src/app/dashboard/mock-tests/mock-test-1/listening/page.tsx

The full Listening route should remain the main learner-facing route.

## Do not build

Do not build Reading.
Do not build Writing.
Do not build Speaking.
Do not build the full Mock Test 1 multi-section flow.
Do not change answer content.
Do not change answer keys.
Do not change scoring logic.
Do not save answers to Supabase.
Do not create Supabase migrations.
Do not change Speaking AI logic.
Do not change Writing AI logic.
Do not build payment.
Do not build live classes.
Do not use official screenshots as public UI images.
Do not copy official CELPIP branding into production UI.

## Current problem

Many exam screens currently show static timer text.

Example:

Time remaining: 30 seconds

This looks like a real timer but does not count down.

That is not acceptable for the real mock test experience.

## Required behavior

Create a real countdown timer that supports:

- total duration in seconds
- live countdown
- normal state
- warning state
- urgent state
- expired state
- "Time is up" display
- optional callback when expired
- reset when a new timed screen starts
- no full-page layout jump
- no answer state loss

## Timer display rules

For Listening question screens:

- normal state: regular timer style
- warning state: last 10 seconds
- urgent state: last 5 seconds
- expired state: red "Time is up"

Do not auto-submit or auto-advance in this ticket.

When time is up:

- show "Time is up"
- keep the selected answers
- keep the screen stable
- allow the existing Next or flow behavior to remain unchanged for now

## Future timer rules to prepare for

Do not build these yet, but design the timer foundation so they can be added later:

Reading:
- section-level timer
- warning in last 2 minutes
- urgent in final 30 seconds

Writing:
- task-level timer
- warning in last 2 minutes
- urgent in final 30 seconds

Speaking:
- preparation timer
- recording timer
- automatic recording start and stop later
- task-by-task timing

## Required files to create

Create:

src/features/exam-engine/exam-timer-types.ts
src/features/exam-engine/exam-timer-utils.ts
src/components/exam/timer/ExamCountdownTimer.tsx
src/components/exam/timer/useExamCountdown.ts

Optional if useful:

src/components/exam/timer/ExamTimerBadge.tsx
src/components/exam/timer/ExamTimerStatusText.tsx

Create documentation:

docs/product/exam-timer-foundation.md

## Required files to update

Inspect and update the actual timer display locations.

Likely files:

src/components/exam/ExamShell.tsx
src/components/exam/ExamModeViewport.tsx
src/components/exam/listening/ListeningQuestionScreen.tsx
src/components/exam/listening/ListeningVideoQuestionScreen.tsx
src/components/exam/listening/ListeningViewpointsQuestionScreen.tsx
src/components/exam/listening/ListeningSectionPrototype.tsx
src/components/exam/listening/ListeningSectionProgressBar.tsx
src/features/exam-engine/listening-copy.ts
src/features/exam-engine/listening-section-flow.ts
src/features/exam-engine/exam-theme.ts

Use the actual files in the project.

## Timer foundation requirements

The timer should be reusable.

Suggested type shape:

ExamTimerConfig:
- durationSeconds
- warningAtSeconds
- urgentAtSeconds
- autoStart
- label
- screenKey

ExamTimerState:
- remainingSeconds
- elapsedSeconds
- isWarning
- isUrgent
- isExpired
- status

Timer status:
- idle
- running
- warning
- urgent
- expired

The exact names can differ, but the behavior must be clear and reusable.

## Accuracy requirement

The countdown should not rely only on subtracting 1 every interval forever.

Use a deadline-based approach where possible:

- store startedAt or endsAt
- calculate remaining time from Date.now()
- update display at a reasonable interval

This prevents visible drift if the browser pauses briefly.

## Reset behavior

Timer should reset when the timed screen changes.

Use a stable key like:

- screen id
- part id + question id
- flow screen id

Do not reset the timer on every render.

Do not reset the timer when a learner selects an answer.

Do not reset the timer when the component re-renders because of answer state.

## Listening application

Replace static timer copy on full Listening route question screens.

Apply timer to:

- Part 1 question screens
- Part 2 question screens
- Part 3 question screens
- Part 4 dropdown question screen
- Part 5 video question screen
- Part 6 viewpoints question screen

Use 30 seconds for the current Listening timed question screens unless existing screen content already has a duration.

If a screen already has a configured timer duration, use that.

## Individual part routes

It is acceptable to apply the timer component to individual part routes too if they reuse the same screens.

Do not break individual part routes.

They should still work by direct URL.

## Exam lock compatibility

The timer should fit inside the locked exam shell created in EXAM-15B and polished in EXAM-15C.

Required:

- timer should not cause full-page scrolling
- timer should not shift the bottom navigation
- timer color change should not resize the top bar
- "Time is up" should not change layout height
- long question areas should still scroll internally

## Visual requirements

Timer should look test-like, not playful.

Suggested normal copy:

Time remaining: 00:30

Warning copy:

Time remaining: 00:09

Expired copy:

Time is up

Use color changes through theme classes.

No animations are required.

No sound alerts.

No modal popup.

No browser alert.

## Color behavior

Use existing theme style if available.

Suggested:

- normal: neutral or dark text
- warning: amber or orange
- urgent: red
- expired: red with "Time is up"

Do not use large flashing effects.

## Scoring behavior

Do not change scoring.

Do not auto-submit when time is up.

Do not mark unanswered questions automatically beyond existing review behavior.

Existing final score should still work out of 38.

Estimated Listening band should still work.

## Documentation

Create:

docs/product/exam-timer-foundation.md

Include:

1. Timer foundation created
2. Components and hooks created
3. Countdown accuracy strategy
4. Listening screens updated
5. Warning and urgent thresholds
6. Time-up behavior
7. What happens when time expires
8. How this supports Reading later
9. How this supports Writing later
10. How this supports Speaking later
11. Known intentional gaps
12. Manual test steps

## Known intentional gaps

Document these as intentional for now:

- no auto-submit
- no auto-advance
- no strict no-back rule
- no section-level Reading timer yet
- no task-level Writing timer yet
- no Speaking preparation or recording timer yet
- no database save
- no persisted timing history
- no proctoring or focus lock
- media can still be replayed unless already handled elsewhere

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not touch Supabase helpers
- Do not call service role
- Do not change auth
- Do not create migrations
- Do not expose answer keys to client question screens
- Do not save answers to database

## Manual Supabase steps

None.

Do not create migrations.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, docs, comments, or prompts. Use normal hyphens only.

## Done criteria

- Reusable timer foundation exists
- Timer counts down in real time
- Timer is deadline-based or otherwise avoids obvious drift
- Listening question timer text is no longer static
- Timer changes warning color in final 10 seconds
- Timer changes urgent color in final 5 seconds
- Timer shows Time is up when expired
- Timer does not auto-submit
- Timer does not auto-advance
- Timer does not clear answers
- Timer does not break locked exam shell
- Full Listening route still works from instruction to end
- Part 3 Question 1 audio still works
- Final Listening score still works out of 38
- Estimated Listening band still appears
- Individual part routes still work by direct URL
- No Reading is built
- No database save is created
- No Supabase migration is created
- Existing Speaking and Writing AI flows are untouched
- docs/product/exam-timer-foundation.md exists
- npm run lint passes
- npm run build passes
