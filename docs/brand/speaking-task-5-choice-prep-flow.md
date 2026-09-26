# Speaking Task 5, the choice and preparation flow (SPEAKING-05A)

Mock Test 1 Speaking Task 5, "Comparing and Persuading", now runs as four
screens instead of one: instructions, choice, preparation, recording.

This is a behaviour and flow change on one task. Tasks 1, 2, 3, 4, 6, 7
and 8 are untouched, and so is everything downstream of the recordings.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

## 1. Old behaviour

Task 5 was drawn by `SpeakingTaskScreen`, the same single screen every
other Speaking task uses: prompt on the left, two clocks and the recorder
on the right.

That meant three things about the task were wrong:

- **The learner did not choose.** The official task asks which of two
  summer camps you prefer. The content file made the choice instead, and
  a `promptNote` on the screen said so: "This prototype has one screen
  per task, so the source's own choice is shown below: Music camp is your
  choice ... Nothing here is selectable." Every run of Task 5 argued for
  the music camp.
- **There was no preparation step of its own.** The official task gives
  60 seconds to choose and then 60 seconds to plan. The prototype gave
  one 60 second preparation window, on the same screen as the recorder,
  which `speaking-mock-timing.ts` recorded as a deliberate simplification
  of the source figure.
- **The comparison was fixed.** The second row of cards printed the
  sister's reading and writing camp beside the music camp under "Your
  Choice", because there was no choice to read.

The source's own sentence "If you do not choose an option, the computer
will choose one for you. You do not need to speak for this part." was
left out of the content on purpose, because it described a step the app
did not have.

## 2. New Task 5 flow

The section is now 20 screens rather than 17. Task 5 occupies four of
them:

| Screen | What it is                            | Clock            |
| ------ | ------------------------------------- | ---------------- |
| 9      | Task 4 to Task 5 transition           | none             |
| 10     | Task 5 instructions                   | none             |
| 11     | Task 5 choice                         | 60s choice       |
| 12     | Task 5 preparation                    | 60s preparation  |
| 13     | Task 5 recording                      | 60s recording    |
| 14     | Task 5 to Task 6 transition           | none             |

The split is driven by data, not by a task number. A task carrying a
`choiceStep` gets the three extra screens; a task without one is built
exactly as before. `speakingTaskHasChoiceStep` in
`speaking-mock-flow.ts` is the single test, used by the flow builder and
by the section prototype, so the two cannot disagree about which tasks
are split. In Mock Test 1 only Task 5 carries one.

The top bar on all four screens reads
"Mock Test 1 - Speaking Task 5: Comparing and Persuading". The ticket
wrote that title as "Practice Test 1 - ...". The test label comes from
the section content, which every other screen in the run also uses, and a
screen inside a run cannot be the one place that calls the test something
else, so the product's own name for the test is kept.

### Files

New:

- `src/components/exam/speaking/SpeakingTaskFiveInstructionsScreen.tsx`
- `src/components/exam/speaking/SpeakingTaskFiveChoiceScreen.tsx`
- `src/components/exam/speaking/SpeakingTaskFivePreparationScreen.tsx`
- `src/components/exam/speaking/SpeakingTaskFiveRecordingScreen.tsx`
- `docs/brand/speaking-task-5-choice-prep-flow.md` (this file)

Changed:

- `src/features/exam-engine/speaking-mock-types.ts` - `SpeakingTaskChoiceStep`,
  `SpeakingChoiceSource`, `SpeakingTaskChoice`, `SpeakingChoiceMap`, the
  `choiceStep` field, and three new screen kinds
- `src/features/exam-engine/speaking-mock-flow.ts` - the flow builder
  emits the three extra screens, plus the choice helpers
- `src/features/exam-engine/speaking-mock-timing.ts` -
  `speakingTaskFiveChooseTimer`, and the section sums now count it
- `src/features/exam-engine/mock-tests/mock-test-1/speaking-section.ts` -
  the Task 5 `choiceStep`, and the three camps lifted to module consts
- `src/features/exam-engine/speaking-mock-copy.ts` - Task 5 wording and
  `formatSpeakingTaskScreenTitle`
- `src/features/exam-engine/exam-theme.ts` - `examSpeakingTaskFive`, plus
  `cardHeader`, `cardSelected` and `cardInput` on `examSpeaking`
- `src/components/exam/speaking/SpeakingSectionPrototype.tsx` - the
  choices map and the four Task 5 screens
- `src/components/exam/speaking/SpeakingVisualPrompt.tsx` -
  `SpeakingOptionCardBlock` exported, with optional label, control and
  className
- `src/components/exam/speaking/SpeakingPrepTimer.tsx` - optional `label`
  and `note`, so the choice window can reuse the card

## 3. Instructions screen

The shared `ExamInstructionScreen` with the task's own three parts:

1. Choose an option. 60 seconds. Nothing is recorded.
2. Preparation time. 60 seconds. Nothing is recorded.
3. Speaking. 60 seconds to record your answer.

No clock on it, because reading the rules is not one of the three windows
the source gives the task. No recorder. The Next control is the player's
own square cornered compact button, the same one every screen in the run
moves forward with, so nothing here draws a button of its own.

The three parts live in the content file rather than in the component, so
what Task 5 asks for is described beside the task.

## 4. Choice screen behaviour

Shows the source's situation paragraph, the source's own line about the
automatic choice, a 60 second "Choice time" card, and the two camps side
by side as cards.

- Each card shows its photograph, its name and its list of facts, taken
  from the existing Task 5 source content.
- The cards are a real radio group in a fieldset with a legend, so a
  keyboard user gets arrow key selection and a screen reader hears the
  group. The whole card is the click target.
- A chosen card takes the warm wash and hairline ring the player has used
  for a selected row since EXAM-UI-05, and prints "Your Choice" above the
  picture. Two cues, not one.
- The choice is held by `SpeakingSectionPrototype`, not by this screen,
  so leaving and coming back finds it still selected.
- Choosing again replaces the previous choice, including an automatic
  one, and is always recorded as a user choice.

Task 6 offers an either or pair and is still deliberately not
selectable: the source asks the learner to pick one in their head and
speak. Task 5 is the opposite, because the next two screens are built
around which camp was picked.

## 5. Auto-choice behaviour

Pressing Next with nothing chosen selects an option and moves on. It
never holds the screen.

Three rules:

- **It runs in the Next handler**, not during render, so a re-render
  cannot re-roll it and the selection cannot flicker.
- **It never overwrites an existing choice.** Walking back to the choice
  screen and pressing Next again keeps the option already there rather
  than picking a second time.
- **It is deterministic**: always the first option in the content, which
  in Mock Test 1 is the music camp. Not random.

Random was considered and rejected. It reads as fairer and is worse in
every way that matters here: it cannot be reasoned about from the screen,
it makes "it changed my camp" impossible to reproduce, and it is one
careless call away from re-rolling on every render. Nothing in the
review, the timing or the scoring treats the first camp as the better
answer, and the learner can go back and change it.

The choice is stored as `{ optionId, source }` where `source` is `"user"`
or `"system"`. The preparation screen reads it and says which happened:

- user: "Track and field camp. You chose this option."
- system: "Music camp. You did not choose an option, so this one was
  chosen for you. Go back to the choice screen if you would rather argue
  for the other one."

## 6. Preparation screen behaviour

Shows the source's persuade instruction, a 60 second "Preparation" card,
the reading of what was chosen and by whom, and the two cards:

- the sister's reading and writing camp under "Your Sister's Choice"
- the camp that was actually chosen under "Your Choice"

Card order follows the source's second screen, sister first. The cards
are read only here: the choice is changed on the screen it was made on,
so there is no second selector that could disagree with the first.

No recorder on this screen.

The comparison camp is a third camp held on the step, not the option that
was passed over. That is what the source does: whichever camp you pick,
you are arguing against the reading and writing camp.

## 7. Recording screen behaviour

The same split every other Speaking task screen has, and the same shared
recorder, recording clock and playback. It differs from
`SpeakingTaskScreen` in exactly two ways, both consequences of the three
screens before it:

- there is no preparation clock on it, because that window already ran
- the cards are the chosen camp and the sister's camp rather than
  whatever the content file printed

The left column carries the persuade instruction and the two cards; the
right column carries the 60 second recording clock, the recorder and the
preview player. Next is not gated on a recording, which is the rule every
screen in the engine follows.

## 8. Timer behaviour

All three Task 5 windows follow TIMER-01 exactly. Reaching zero:

- changes the reading to "Time is up" in red
- raises the shared time up toast for about four seconds
- shows a durable line on the choice and preparation screens reading
  "Time is up. You can continue when you are ready."

and does nothing else. Specifically:

- **no auto-next.** No window advances a screen.
- **no auto-submit.** Nothing is sent anywhere.
- **no auto-advance to Task 6.** The recording window closing leaves the
  learner on the recording screen.
- **no erasing state.** No choice is cleared, no take is discarded.
- **no auto-choice at zero.** The choice window closing selects nothing.
  The cards stay live, because a learner who was half a second from
  deciding should not have the decision taken from them.
- **no repeated random selection.** There is no random selection at all.

The recording window does not stop the recorder either. If a future
strict timing ticket makes the recorder stop itself at zero, that is
acceptable: the learner stays on the same screen and presses Next when
they are ready.

The durable line repeats `examCopy.timeUpToastText` word for word on
purpose. The toast says the sentence and takes itself away; the state it
describes does not go away, so the screen keeps saying it.

## 9. Reference screenshot usage

The ticket named four private screenshots under
`_reference/private/celpip-real-ui/`:

- `speaking-task-5-01-instructions.png`
- `speaking-task-5-02-choose-option.png`
- `speaking-task-5-03-preparation-after-choice.png`
- `speaking-task-5-04-speaking-recording.png`

**Those four files were not present in the working tree while this ticket
was built**, so the flow and screen structure were built from the written
description in the ticket and from the Task 5 source content already in
the repo, which carries both source screens as Cloudinary crops and knows
which card the source labels "Your Sister's Choice" and "Your Choice".

The rules that would have applied to them apply anyway and are worth
recording:

- `_reference/` is gitignored. Nothing under it is committed.
- No reference image is imported by the app.
- No official CELPIP logo, footer, copyright text or branding is
  reproduced.
- Nothing is copied pixel for pixel. The screens are built out of this
  project's own player chrome, its own colours and its own components.

## 10. What was intentionally not changed

- **Listening, Reading and Writing.** Untouched.
- **Supabase.** No schema change, no migration, no query, no policy. Task
  5 choices are React state in the browser and nothing else: no
  localStorage, no cookie, no database, no upload. A reload loses them,
  as it always did for the recordings.
- **Admin.** Untouched.
- **AI prompts, the evaluation schema, transcription and the review
  flow.** Untouched.
- **What the reviewer is told about Task 5.** `task.visuals` still holds
  the source's two card rows, and `collectVisualDescriptions` in
  `evaluate-speaking-mock-test.ts` still reads the camps out of them, so
  the review sees exactly what it saw before. The cards are now module
  consts referenced from both `visuals` and `choiceStep`, so the facts a
  learner reads and the facts the reviewer reads cannot drift apart.
  Nothing tells the reviewer which camp was chosen; that is a separate
  decision and a separate ticket.
- **The other seven Speaking tasks.** They still get one
  `SpeakingTaskScreen` each, with the same two clocks, the same recorder,
  the same preview, the same transitions and the same completion screen.
- **`SpeakingPrepTimer` defaults.** The two new props default to the
  preparation wording, so every existing caller behaves exactly as
  before.
- **The section allowance check.** The choice window adds 60 seconds, so
  the section's windows now total 15 minutes exactly, which still fits
  inside the published 15 minute allowance
  (`speakingWindowsFitPublishedAllowance`). The intro card reads
  "Preparation time 6 minutes" rather than 5.
- **Task 5's `promptNote` is gone**, because it described a limitation
  that no longer exists and nothing renders it any more.

## 11. Test checklist

Run the section at `/dashboard/mock-tests/mock-test-1/speaking`.

Flow:

- [ ] Intro reads "Screen 1 of 20" and "Preparation time 6 minutes".
- [ ] Screen 10 is the Task 5 instructions screen: three numbered parts,
      no clock, no recorder, compact Next.
- [ ] Screen 11 is the choice screen: situation, "Choice time 01:00", two
      cards side by side, each with photograph, name and facts.
- [ ] Screen 12 is the preparation screen: persuade instruction,
      "Preparation 01:00", the chosen camp and the sister's camp.
- [ ] Screen 13 is the recording screen: the two cards, one clock reading
      "Speaking time 1:00", Start recording.
- [ ] Screen 14 is the Task 5 to Task 6 transition.

Choice:

- [ ] Clicking a card selects it: warm wash, ring, "Your Choice" label.
- [ ] Clicking the other card moves the selection. No flicker.
- [ ] The selection survives Next then Back.
- [ ] The selection survives walking to Task 8 and back.

Auto-choice:

- [ ] From a fresh run, press Next on screen 11 without choosing. Screen
      12 shows the music camp and "You did not choose an option, so this
      one was chosen for you."
- [ ] Press Back to screen 11: the music camp is selected. Press Next
      again: still the music camp, still marked as chosen for you.
- [ ] Choose the track and field camp on screen 11, press Next: screen 12
      shows the track and field camp and "You chose this option."

Timers:

- [ ] Let the choice window run out. The reading goes red, the toast
      appears and clears, the durable line appears under the cards, the
      screen does not move, and both cards are still selectable.
- [ ] Let the preparation window run out. Same, and the screen does not
      move to the recording screen.
- [ ] Let the recording window run out while recording. The reading goes
      red, the screen does not move to Task 6, and the audio already
      captured is kept.
- [ ] Selecting a card does not restart the choice window.

Recording and the rest of the section:

- [ ] Record on screen 13, play it back, re-record. Only the latest take
      is kept.
- [ ] The Task 5 recording survives walking to Task 8 and back.
- [ ] Tasks 1, 2, 3, 4, 6, 7 and 8 still show two clocks, the recorder
      and the preview on one screen.
- [ ] The completion screen reports Task 5 as recorded with its length.
- [ ] Submit for AI Review still runs and still returns a Task 5 result.
- [ ] Restart clears the recordings and the Task 5 choice: screen 11
      opens with neither card selected.

Validation:

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
