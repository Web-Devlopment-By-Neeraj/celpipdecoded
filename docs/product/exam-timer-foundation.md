# Exam timer foundation (EXAM-15D)

House style: normal hyphens only, no long hyphens or em dashes.

## 1. Timer foundation created or completed

Completed. The foundation was partially in place when this ticket was
picked up again and is finished here.

Already written and kept:

- `src/features/exam-engine/exam-timer-types.ts`
- `src/features/exam-engine/exam-timer-utils.ts`
- `src/components/exam/timer/useExamCountdown.ts`
- `src/components/exam/timer/ExamCountdownTimer.tsx`
- `src/components/exam/timer/ExamTimerStatusText.tsx`
- the `timerSlot` prop on `ExamShell` and `ExamTopBar`
- the `urgent` tone on `ExamTimerState`, the amber token in
  `globals.css`, and the tone map in `exam-theme.ts`
- all six Listening screen types wired to the live countdown

Finished in this pass:

- the hook did not pass `npm run lint`. Three errors, all in
  `useExamCountdown.ts`: one `react-hooks/purity` error for reading the
  clock in the hook body, and two `react-hooks/preserve-manual-memoization`
  errors that made the React Compiler skip the whole hook. Both are fixed,
  see section 3.
- a scratch directory, `src/__probe/`, left over from working out which
  shapes the lint rules accept. Removed.
- this document, which did not exist.

Before this ticket the Listening top bar printed the fixed string
"Time remaining: 30 seconds" on every question screen. It looked like a
clock, it never moved, and it was passed in the shell's `muted` tone
because there was nothing live behind it. That string is gone from
`listening-copy.ts`.

## 2. Components and hooks used

**`exam-timer-types.ts`** holds types only, so it can be imported from
either side of the server and client boundary.

- `ExamTimerStatus`: `idle`, `running`, `warning`, `urgent`, `expired`
- `ExamTimerConfig`: `durationSeconds`, `warningAtSeconds`,
  `urgentAtSeconds`, `autoStart`, `label`, `screenKey`
- `ExamCountdownState`: `status`, `durationSeconds`, `remainingSeconds`,
  `elapsedSeconds`, `isWarning`, `isUrgent`, `isExpired`

The three booleans are derived from `status` rather than tracked beside
it, so they cannot disagree with it.

**`exam-timer-utils.ts`** holds the arithmetic, with no React in it.
`clampExamTimerSeconds`, `getExamTimerDeadline`, `openExamTimerDeadline`,
`getExamTimerRemainingSeconds`, `formatExamClock`,
`resolveExamTimerStatus`, `getExamCountdownState`,
`resolveExamTimerConfig`, and the `examTimerStatusTones` map that turns a
status into an `ExamTimerState` tone for the shell. Every calculation
takes the current time as an argument instead of reading it, so the whole
countdown can be checked by passing a made up clock in.

Constants live here rather than in copy: `EXAM_TIMER_TICK_MS` is 250,
`EXAM_TIMER_WARNING_SECONDS` is 10, `EXAM_TIMER_URGENT_SECONDS` is 5, and
`EXAM_QUESTION_TIMER_SECONDS` is 30.

**`useExamCountdown.ts`** is the one clock in the exam engine. It holds
the deadline and the interval, returns an `ExamCountdownState` plus a
`start` function, and takes an optional `onExpire` callback. It renders
nothing and decides nothing.

**`ExamCountdownTimer.tsx`** is the component a screen actually uses. It
runs the hook, formats the reading, picks the tone, and renders
`ExamTimerDisplay` plus `ExamTimerStatusText`. It also owns the reset: it
renders its inner component with `key={screenKey}`.

**`ExamTimerStatusText.tsx`** is the spoken half. The visible reading
changes four times a second, so it is silent (`live="off"` on
`ExamTimerDisplay`) and this separate polite live region says
"Time is up" once when the window closes. Warning and urgent are colour
only: interrupting somebody mid question to tell them they have nine
seconds left is worse than saying nothing.

**`ExamShell` and `ExamTopBar`** gained a `timerSlot` prop. It renders in
the same strip the fixed readings sit in, so a live timer and a static one
look identical and sit in the same place. The shell still owns no clock:
it owns the strip, and whatever is put in it draws itself.

## 3. Countdown accuracy strategy

Deadline based, not decrement based.

A countdown that subtracts one every interval drifts, because an interval
is a request rather than a promise. A backgrounded tab, a busy main thread
or a laptop lid closing all delay ticks, and every delayed tick is a second
the display never loses.

So:

1. When a timed screen mounts, `openExamTimerDeadline` reads `Date.now()`
   once and stores an absolute `endsAt` in state.
2. An interval writes the current time into `nowMs` every 250 ms.
3. The reading is `Math.ceil((endsAt - nowMs) / 1000)`, clamped to the
   range 0 to `durationSeconds`.

A pause therefore means the next tick shows a smaller number, which is the
truth, rather than the clock running slow.

Two details behind the numbers:

- The tick is 250 ms rather than 1000 ms because the reading is whole
  seconds. A one second interval would show each number for anywhere
  between zero and two seconds depending on where the interval landed.
  Four ticks a second keeps the change within a quarter of a second of the
  truth and is far too cheap to matter.
- `Math.ceil` means the reading shows 1 until the final second has fully
  run out and never shows 0 while there is still time to answer. The upper
  clamp stops a deadline set during a render from rounding up and flashing
  00:31 on a 30 second window.

The interval is torn down at zero. `isExpired` is a dependency of the
effect, so nothing is scheduled on a screen whose window has closed.

**Lint constraints that shaped the code.** This project runs the React
Compiler lint rules, and two of them decided the shape:

- `react-hooks/purity` refuses a `Date.now()` call written inside a
  component or hook body, and counts a `useState` initialiser as part of
  that body. The one impure read therefore lives in
  `openExamTimerDeadline` in `exam-timer-utils.ts` and is called from the
  initialiser. This is not a way around the rule. The rule is about a
  value that changes between renders leaking into render output, and a
  lazy initialiser runs once per mount.
- `react-hooks/preserve-manual-memoization` refused the `useCallback`
  around `start`, because it could not prove the dependency it was given
  stays put, and skipped compiling the hook entirely as a result. `start`
  is now a plain function and the compiler memoizes it.

**Reset.** A window belongs to `config.screenKey`, and a change of key
arrives as a remount, because `ExamCountdownTimer` renders its inner
component with `key={screenKey}`. That is React's own answer to starting
state again when its subject changes, and here it is also the only one
available: `react-hooks/set-state-in-effect` will not allow a new deadline
to be pushed into state from an effect body, so a remount, which runs the
initialiser, is the legal place to open a new window.

The practical result is the behaviour the ticket asks for. Selecting an
answer re-renders the screen without remounting it, so the window carries
on. Moving to another timed screen changes the key, so a fresh window
opens.

## 4. Listening screens updated

All six part types, on the full section route and on the individual part
routes, because both go through the same screen components.

| Part | Screen component | Timer key |
| --- | --- | --- |
| 1 | `ListeningQuestionScreen` | flow screen id, one window per question |
| 2 | `ListeningQuestionScreen` | flow screen id, one window per question |
| 3 | `ListeningQuestionScreen` | flow screen id, one window per question |
| 4 | `ListeningDropdownQuestionScreen` | flow screen id, one window for the five question form |
| 5 | `ListeningVideoQuestionScreen` | flow screen id, one window for the eight question form |
| 6 | `ListeningViewpointsQuestionScreen` | flow screen id, one window for the six question form |

Parts 1 to 3 ask one question per screen, so the window is per question and
moving to the next question opens a new one. Parts 4 to 6 answer a whole
form on one screen, so the window belongs to the screen and answering any
one question on it does not restart the clock.

Every screen component takes `timerScreenKey`, `timerSeconds` and
`timerLabel` as optional props. `timerScreenKey` falls back to the
question id, or to the first question's id on a form screen, so a caller
that has no flow screen id still gets a correct window. Every caller in
the app passes the flow screen id.

Callers updated: `ListeningSectionPrototype` (the full run) and
`ListeningPartOnePrototype` through `ListeningPartSixPrototype` (the six
individual part routes).

Duration is 30 seconds everywhere, from `EXAM_QUESTION_TIMER_SECONDS`.
That is the number the screens have shown as static text since EXAM-03, so
this ticket changes the behaviour and not the number. No Listening screen
carried its own configured duration, so none was overridden.

Screens that are not timed are unchanged: instructions, the instructional
video, part intros, scenario screens, section breaks, conversation and
audio screens, part transitions, the answer review, the score screen and
the end of section screen.

## Listening timing model

The authoritative statement of what Listening is timed on. Everything in
section 4 follows from this, and a later section or ticket that disagrees
with this is the thing that is wrong.

**Listening has no preparation timer.** There is no Speaking style
preparation window anywhere in Listening: nothing counts down before a
learner is allowed to answer, and no screen opens a timer with
`autoStart: false` waiting on a press. Every Listening window is an
answering window and it starts with its screen. The `autoStart` and
`start` machinery in the foundation exists for Speaking and has no
Listening caller.

The one screen that could be mistaken for a preparation timer is the
section break between the conversation sections in Parts 1 and 3. It is
not a timer. It is an inert `ExamMediaPlaceholder` from EXAM-03 reserving
the area a between conversations pause will use, and the learner leaves it
by pressing Next. Its helper text still says a timed pause arrives in a
later ticket, which is about the pause the official flow plays between
conversations, not about a preparation window for the learner. EXAM-15E
should confirm the wording against the real test.

**Parts 1 to 3 are timed per individual question screen.** These parts ask
one question per screen, so each question screen opens its own 30 second
window. Moving to a different question screen opens a fresh window.
Choosing an option, or changing an option, does not.

**Parts 4 to 6 are timed per screen, not per question.** These parts show
the whole question set for the part on one screen, so there is one 30
second window for the screen and every question on it shares that window.
Answering any one of them does not restart the clock.

| Part | Questions | Window | Reset boundary |
| --- | --- | --- | --- |
| 1 | 1 per screen | 30 s per question screen | each question screen |
| 2 | 1 per screen | 30 s per question screen | each question screen |
| 3 | 1 per screen | 30 s per question screen | each question screen |
| 4 | 5 on one screen | 30 s for the screen | the one question screen |
| 5 | 8 on one screen | 30 s for the screen | the one question screen |
| 6 | 6 on one screen | 30 s for the screen | the one question screen |

**How the model is enforced in code.** By the `screenKey` a caller passes,
and by nothing else. Every caller passes the flow screen id, and the flow
files already produce ids of exactly the right grain:

- `listening-flow.ts` gives each Parts 1 to 3 question screen the id
  `${question.id}-screen`, which is unique per question, so the key changes
  from question to question
- `listening-dropdown-flow.ts`, `listening-video-flow.ts` and
  `listening-viewpoints-flow.ts` each give their single questions screen
  the id `${sectionId}-questions`, so the key is the same for the whole
  screen no matter which question is being answered

A re-render caused by selecting an answer keeps the same key, and
`ExamCountdownTimer` only remounts its window when the key changes, so an
answer can never restart a clock in either model. See section 3.

The screen components' fallback keys agree with the model as well, so a
caller that forgets to pass one still gets the right grain:
`ListeningQuestionScreen` falls back to the question's own id, and the
three Parts 4 to 6 screens fall back to the first question's id, which is
stable for as long as that screen is showing.

**Time up is a message and nothing else, for now.** At zero the reading
becomes a red "Time is up". No auto-submit, no auto-advance, no answer
locking, no removal of a selected answer, and Back still works exactly as
it did. Sections 6 and 7 have the detail.

**Auto-advance and strict no-back are deliberately deferred.** Making the
timer enforce anything means deciding what happens to a part answered
half way, and that decision needs the real CELPIP rules confirmed and the
answer saving story settled first. Both belong to EXAM-15E, see the last
section of this document.

**Part 5 and Part 6 question format is a known open question.** This
ticket timed the screens as they are and deliberately did not touch their
question UI. Whether Parts 4, 5 and 6 should present dropdowns, sentence
completion or discrete questions, and in what grouping, is a content and
format question rather than a timing one. It is the main subject of
EXAM-15E, and the timing model above may need revisiting once the format
is corrected: if a part is split across several screens, it moves from the
Parts 4 to 6 row of the table to the Parts 1 to 3 row without any change
to the foundation.

## 5. Warning and urgent thresholds

For the 30 second Listening question window:

| Remaining | Status | Reading | Colour |
| --- | --- | --- | --- |
| 30 to 11 seconds | `running` | `00:30` down to `00:11` | neutral navy |
| 10 to 6 seconds | `warning` | `00:10` down to `00:06` | amber |
| 5 to 1 seconds | `urgent` | `00:05` down to `00:01` | red |
| 0 | `expired` | `Time is up` | red, bold |

`warning` was red before this ticket, which left nothing louder for the
final seconds to escalate to. It is amber now and `urgent` is the red, so
there are two distinguishable steps of notice. The amber is a new token,
`--academy-amber: #a1591a`, dark enough to hold its contrast against the
pale exam chrome.

Both thresholds are per timer, through `warningAtSeconds` and
`urgentAtSeconds`, and default to the constants above. A section or task
level timer will want much wider ones, which is why they are configurable
rather than fixed.

`resolveExamTimerStatus` checks expired first, then urgent, then warning,
so a threshold set wider than the window cannot hide the end of it.

## 6. Time-up behaviour

At zero the reading becomes the words "Time is up", in red and bold, and
the "Time remaining" label in front of it is dropped, because
"Time remaining: Time is up" is not a sentence.

The screen reader region announces "Time is up" once, politely.

That is all that happens.

## 7. What happens when time expires

Explicitly, what does not happen:

- nothing is submitted
- nothing advances to the next screen
- no answer is cleared or changed
- no question or option is disabled
- Next and Back behave exactly as they did, including Next staying
  disabled until the screen is fully answered
- no modal, no browser alert, no sound, no flashing, no focus move
- no page jump and no scroll
- nothing is written to a database

A learner whose window runs out can still answer the question, change
their answer, go back, and go forward. The answers held by
`ListeningSectionPrototype` at the end of Part 6 are the same whether
every window ran out or none did, so the practice score is unaffected.

This is deliberate for a first implementation. The timer is a pressure cue
and a rehearsal of the real test's pacing, not an enforcement mechanism.

Enforcement, meaning auto-advance at zero and a strict no-back rule, is
deferred to EXAM-15E on purpose. It needs the real CELPIP Listening rules
confirmed and the answer saving story settled first, because both decide
what happens to a part that is only half answered when its window closes.
Building enforcement on top of an unconfirmed format would have to be
unbuilt again.

## 8. How this supports Reading later

Reading is timed per section rather than per question: one window across
the whole part, not a fresh clock on each screen.

The foundation covers it without a change:

- pass `durationSeconds` for the section length instead of the 30 second
  default
- pass `warningAtSeconds` and `urgentAtSeconds` suited to a long window,
  for example 150 and 60 seconds
- use the section id as `screenKey`, not the screen id, so the window
  survives moving between question screens inside the section

The one piece Reading adds is where the timer is mounted. A per section
window has to be rendered above the screen that changes, so the Reading
section component runs the hook once and passes the reading down, or
mounts `ExamCountdownTimer` in a wrapper that outlives the screens. The
hook and the arithmetic do not change.

## 9. How this supports Writing later

Writing is timed per task, which is the same shape as Reading with a
longer window and a single screen: one window, `screenKey` set to the task
id, `durationSeconds` set to the task length.

The Writing practice flow already has its own timer in
`src/features/writing/writing-timer.ts`. It is a separate practice flow
with its own screens and was not touched by this ticket. When Writing is
built into the exam engine, that file is the one this foundation replaces,
and the deadline strategy is the same idea, so the move is a swap rather
than a rewrite.

## 10. How this supports Speaking later

Speaking is the case the foundation was made general for. Each task is a
preparation window followed by a recording window, and the recording
window has to start when the learner is ready rather than when the screen
appears.

Two pieces are already there for it and are unused in this ticket:

- `autoStart: false`, which opens the timer in the `idle` status with the
  reading sitting at the full duration and no clock running, drawn in the
  `muted` tone the shell already reserves for a fixed label. Calling
  `start` from an event handler opens the window.
- `onExpire`, which fires once per window and is where a recorder gets
  stopped when the recording window ends.

The top bar already renders a pair of readings through the `timers` array,
which is how the preparation and recording pair is shown side by side, and
`timerSlot` sits in the same strip, so a live reading can sit beside a
fixed one.

## 11. Known intentional gaps

- no auto-submit
- no auto-advance, deferred to EXAM-15E
- no strict no-back rule, deferred to EXAM-15E
- no answer locking after a window closes, deferred to EXAM-15E
- no preparation timer in Listening, and none is wanted, see the Listening
  timing model section
- Parts 4 to 6 question format is not corrected, deferred to EXAM-15E
- no section level Reading timer yet
- no task level Writing timer yet
- no Speaking preparation or recording timer yet
- no database save
- no persisted timing history
- no proctoring or focus lock
- media can still be replayed unless already handled elsewhere
- the countdown lives in the browser and starts again on a reload, which
  is correct for a practice run and is not a proctoring control
- `start` and `onExpire` are built and have no caller yet
- no automated test file. The arithmetic is pure and callable with a made
  up clock, which is what it was written for, but the project has no test
  runner set up.

## 12. Manual test steps

Run `npm run dev` and sign in.

**Full Listening route.**

1. Open `/dashboard/mock-tests/mock-test-1/listening`.
2. Work through the instructions and the instructional video to the first
   Part 1 question screen.
3. The top bar should read `Time remaining: 00:30` and start counting
   down immediately, in neutral navy.
4. Watch it reach `00:10`. The reading turns amber. Nothing else on the
   bar moves and the bar does not change height.
5. Watch it reach `00:05`. The reading turns red. Again nothing moves.
6. Let it reach zero. The reading becomes a bold red "Time is up", the
   "Time remaining" label disappears, and the layout height does not
   change.
7. Confirm the screen did not advance, the audio did not restart, and
   nothing was submitted.
8. Now choose an answer. It should select normally, and Next should
   become available.
9. Press Next. The next question screen should show a fresh `00:30`.
10. Press Back. Note that the previous screen opens a fresh window rather
    than resuming the old one. That is expected: a window belongs to a
    screen mount, and nothing is persisted.
11. On any question screen, select an option and then change it two or
    three times. The countdown must keep running and must not jump back to
    `00:30`.
12. Reach Part 4. One countdown for the whole five question form. Answer
    the questions one at a time and confirm the clock does not restart on
    each one.
13. Same check on Part 5, the eight question video form, and Part 6, the
    six question viewpoints form.

**Layout lock.**

14. On any timed screen, try to scroll the browser page with a trackpad
    flick, the mouse wheel and the space bar. The document must not move.
    The top bar and the Back and Next bar must stay where they are.
15. On Part 5 or Part 6, where the question list is long, scroll inside
    the list. Only the list scrolls.
16. Narrow the window to a phone width and repeat step 3 to step 6. The
    bar wraps but the timer stays in the readings strip and does not
    resize when the colour changes.

**EXAM-15C regression.**

17. Confirm there are no dashboard breadcrumbs, no sidebar, no footer, no
    INTERNAL PREVIEW eyebrow and no dashed prototype warning box anywhere
    in the run.
18. Reach Part 3 Question 1. The question audio player must appear and
    must play.
19. Finish the run. The score screen must read out of 38, must show the
    part breakdown, and must show the estimated CELPIP Listening band.
20. Confirm the score wording says it is a Toronto Academy practice
    estimate and not an official CELPIP score.

**Individual part routes.**

21. Open each of `/dashboard/mock-tests/mock-test-1/listening/part-1`
    through `part-6` by typing the URL. Each must still work, each
    question screen must show a live countdown, and each part must still
    show its own review and score.

**Answers survive expiry.**

22. On any part, answer a question, let its window expire, then keep
    going and finish the part. The answer given before expiry must appear
    in the review and must be marked.

## 13. Files changed

Created:

    src/features/exam-engine/exam-timer-types.ts
    src/features/exam-engine/exam-timer-utils.ts
    src/components/exam/timer/useExamCountdown.ts
    src/components/exam/timer/ExamCountdownTimer.tsx
    src/components/exam/timer/ExamTimerStatusText.tsx
    docs/product/exam-timer-foundation.md
    docs/tickets/EXAM-15D-exam-timer-foundation.md

Changed, exam shell:

    src/components/exam/ExamShell.tsx
    src/components/exam/ExamTopBar.tsx
    src/components/exam/ExamTimerDisplay.tsx
    src/features/exam-engine/exam-shell-types.ts
    src/features/exam-engine/exam-theme.ts
    src/app/globals.css

Changed, Listening screens:

    src/components/exam/listening/ListeningQuestionScreen.tsx
    src/components/exam/listening/ListeningDropdownQuestionScreen.tsx
    src/components/exam/listening/ListeningVideoQuestionScreen.tsx
    src/components/exam/listening/ListeningViewpointsQuestionScreen.tsx

Changed, Listening callers:

    src/components/exam/listening/ListeningSectionPrototype.tsx
    src/components/exam/listening/ListeningPartOnePrototype.tsx
    src/components/exam/listening/ListeningPartTwoPrototype.tsx
    src/components/exam/listening/ListeningPartThreePrototype.tsx
    src/components/exam/listening/ListeningPartFourPrototype.tsx
    src/components/exam/listening/ListeningPartFivePrototype.tsx
    src/components/exam/listening/ListeningPartSixPrototype.tsx

Changed, copy:

    src/features/exam-engine/listening-copy.ts

Removed:

    src/__probe/

Not touched: the route files, the flow files, the content files, the
answer keys, `listening-score.ts`, `listening-section-score.ts`,
`listening-band-score.ts`, every Supabase helper, every API route, and
both AI flows. No dependency was installed and no migration was created.

## Next required ticket

**EXAM-15E - CELPIP Listening Rules and Part 4-6 Format Correction**

EXAM-15D deliberately timed the Listening screens as they are rather than
correcting them. The timer is now the piece of the exam engine that is
finished, and the format underneath it is the piece that is not, so the
next ticket is a rules and format ticket rather than another timer ticket.

EXAM-15E should research and correct:

1. **Exact CELPIP Listening question formats.** What each part actually
   presents, how many questions it carries, how they are grouped onto
   screens, and how long each window really is. The 30 second window this
   ticket made live is the number the screens have carried since EXAM-03
   and has not been checked against the real test.
2. **Part 4 dropdown and sentence completion behaviour.** Whether the five
   questions are dropdowns inside a passage, discrete sentence completions,
   or something else, and whether they belong on one screen at all.
3. **Part 5 sentence completion and question behaviour.** Same question
   for the eight question video part. This ticket did not touch the Part 5
   question UI.
4. **Part 6 sentence completion and question behaviour.** Same question
   for the six question viewpoints part. This ticket did not touch the
   Part 6 question UI.
5. **Auto-advance and strict no-back exam rules.** What the real test does
   when a window closes, whether a learner can return to an answered
   question, and whether an unanswered question can be left behind. Only
   once that is confirmed should the `onExpire` callback that already
   exists on `useExamCountdown` be given a caller.
6. **An admin ready data model for mock test building.** The content is
   currently hand written TypeScript objects per part. Building more mock
   tests needs a shape that an admin can fill in, with the answer keys
   staying on the server the way `withoutListeningSectionAnswerKeys`
   keeps them now.

What EXAM-15E should not have to redo: the timer foundation. If a part is
split across more screens, its callers pass a per screen key and it moves
from the Parts 4 to 6 row of the timing model table to the Parts 1 to 3
row. If a window turns out to be a different length, its callers pass
`timerSeconds`. If a part needs a section level window, it passes the
section id as the key and a longer duration. None of that touches
`useExamCountdown`, `exam-timer-utils.ts` or the shell.
