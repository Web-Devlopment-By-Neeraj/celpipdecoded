# Writing Task 2 choice screen (EXAM-UI-04)

Writing Task 2 asks a learner to take a position and then argue it. Until
this ticket both halves of that happened on one screen: the two positions
sat as a small radio group above a response box that was already open and
already focusable, on a screen whose obvious next move was to start
typing. The decision the whole task turns on was the easiest thing on the
screen to walk past, and a response written with no position taken is a
response the AI reviewer has nothing to judge against.

This ticket makes the decision its own step. Choosing is now a screen, and
writing is the screen after it.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

## 1. Flow before

Five screens, built by `buildWritingSectionFlow` from the section content.

| # | Screen | What it asked for |
| --- | --- | --- |
| 1 | Writing section intro | nothing, read and continue |
| 2 | Writing Task 1 | the email, in an editor |
| 3 | Task 1 to Task 2 transition | nothing, Task 1 word count and continue |
| 4 | Writing Task 2 | the position and the response, on one screen |
| 5 | Writing section complete | nothing, then the optional AI review |

Nothing gated. Next always moved forward, on an empty response and on an
unmade choice alike.

## 2. Flow after

Six screens, built by the same function from the same content.

| # | Screen | What it asks for |
| --- | --- | --- |
| 1 | Writing section intro | nothing, read and continue |
| 2 | Writing Task 1 | the email, in an editor |
| 3 | Task 1 to Task 2 transition | nothing, Task 1 word count and continue |
| 4 | **Writing Task 2 choice** | **the position, and nothing else** |
| 5 | Writing Task 2 | the response, with the position restated above it |
| 6 | Writing section complete | nothing, then the optional AI review |

The screen counter in the top bar follows automatically, so the intro now
reads "Screen 1 of 6" and the Task 2 editor reads
"Writing Task 2 of 2 - Screen 5 of 6". No screen has a number written into
it.

The choice screen is inserted by the flow builder for any task that
carries positions, not for Task 2 by name. Mock Test 1 Task 1 has no
options, so it is untouched and still goes straight from the transition to
its editor. A future section whose Task 1 offers positions would get a
choice screen there too, without an edit to the builder.

## 3. Reference screenshot usage note

The brief supplied private screenshots of the real CELPIP practice test,
in `_reference/private/celpip-real-ui`. They were used as visual reference
for structure and step order, and for nothing else.

- **No screenshot is committed.** `_reference/` is in `.gitignore`.
  Nothing in that folder is imported, copied into `public/`, or referenced
  by any component in this ticket.
- **Nothing is copied pixel for pixel.** Every screen here is drawn from
  this project's own recipes in `exam-theme.ts` and
  `mock-test-player-theme.ts`.
- **No official logo, footer, copyright line or asset is reproduced**, and
  the CELPIP Decoded logo is not drawn inside the active test frame
  either. The player skin already strips the brand from everything inside
  `data-mock-test-player`, and this ticket adds nothing to it.
- **What was taken from the reference is the step order**: that choosing
  a position is a screen of its own, that the survey stays on the left
  across both screens, and that the positions remain visible and
  changeable once the response box appears.
- **What was not taken**: the official header wording, the sample response
  panel, and the official note under the editor. This screen's header,
  its labels and its hints are all this project's own wording, from
  `writing-mock-copy.ts`.

## 4. Task 2 choice behaviour

The screen is the compact exam player shell, the same window every other
screen in the run sits inside. It is not full width: the shell caps the
window at 1100 pixels and centres it on the grey desk, exactly as before.

- **Header**: "Mock Test 1 - Writing Task 2: Responding to Survey
  Questions". Built by `formatWritingTaskScreenTitle` from the task's own
  `title` and `taskTitle`, so the name of the task is not spelled a second
  time in a second file. The same title carries onto the editor screen,
  because the two screens are one task.
- **Time remaining**: yes. The Task 2 window, 26 minutes, in the top bar
  in the same slot the editor uses, with the same amber and red
  thresholds.
- **Left half**: the survey. The same "Read the following information."
  line, the same "Online vs. Print News Survey" heading and the same
  paragraph the editor screen shows, drawn by one shared
  `WritingSituationPanel` so the two screens cannot drift apart.
- **Right half**: the prompt instruction with the shared information
  glyph, then Option A and Option B as selectable radio rows, then a quiet
  hint.
- **No response box.** That is the point of the screen.
- **Validation**: pressing the forward control with no position chosen
  does not advance. A bordered message appears under the rows,
  "Choose Option A or Option B before you start writing.", in a live
  region so it is announced. It clears the moment a position is chosen.
- **The forward control reads "Start writing"** rather than Next, because
  that is what it does.
- **Back** is live and returns to the Task 1 to Task 2 transition with
  everything still held.

The gate is deliberately the only one in the Writing section. An empty
response is still allowed, a short one is still allowed, and the
completion screen still reports 0 words without complaint. A position is
different: it is not work, it takes one click, and the screen after it is
built around the answer.

The gate is a message rather than a disabled button on purpose. A greyed
out control on a screen with two radio buttons makes a learner guess what
is missing; a control that answers tells them.

### Styling

The option rows use the shared Writing choice recipes in `examWriting`,
which this ticket repainted and which are used by the Task 2 rows and
nothing else:

- **hover is a pale green wash** with a green hairline border
- **the chosen row is a warm wash** with an orange hairline ring, on two
  new player tokens, `--player-orange-soft` and `--player-orange-line`

Two hues rather than two strengths of one, so a row under the pointer and
a row already chosen can be told apart while both are on screen.

This is a narrow exception to the EXAM-UI-03 rule that an option row never
colours its hover. That rule exists because a coloured hover on a graded
question reads as the screen saying "this one is right" before anything
has been marked. A Task 2 position is a preference, there is no answer key
anywhere in Writing, so the reading the rule guards against cannot happen
here. **Every graded option row in Listening and Reading is untouched**:
`playerOption` still draws the neutral hover and the green chosen wash,
and this ticket does not edit it.

## 5. Selected option behaviour

The chosen position lives where it always did, in the section prototype's
`choices` map, keyed by task id. The choice screen and the editor screen
both read and write that one value, so nothing has to be kept in step.

- Choosing on the choice screen and pressing Start writing carries
  straight into the editor.
- On the editor screen the position is visible twice: the radio rows are
  still there with the chosen row held, and a labelled line directly above
  the response box reads "You are writing about / Option A: Stop producing
  the print version of the newspaper."
- The rows on the editor screen stay live, which matches the reference. A
  writer who changes their mind three sentences in does not have to walk
  back a screen.
- **Changing a position never touches a response.** That was already true
  and is unchanged: the two maps are separate for exactly this reason.
- Going Back from the editor to the choice screen shows the position still
  chosen. Going back further and forward again shows it still chosen.
- Restart clears it along with everything else, and the editor screen
  handles the no position case by simply not drawing the line.

## 6. Task 2 editor status

The editor itself is unchanged. `WritingResponseEditor` and
`MockTestWritingEditorFrame` were not edited by this ticket. The Task 2
editor screen renders the same field, in the same frame, with the same
label strip, the same live word count and the same target reading as
before, and Task 1 renders the identical component.

What changed on that screen is only what sits above the box: the position
rows and the restated choice.

## 7. What was intentionally not changed

- **Supabase.** No client, no query, no migration, no schema change. The
  Writing run still writes nothing at all.
- **Auth.** Untouched. The route keeps its existing session check.
- **Admin.** Untouched.
- **The Writing AI prompt and the scoring logic.**
  `writing-scoring-prompt.ts` and `evaluate-writing-mock-test.ts` were not
  edited.
- **The Writing result schema.** Unchanged.
- **What the reviewer receives.** The review input is still the two
  response texts, positionally, exactly as before. The chosen position is
  not added to it, because adding it would be a change to the review
  contract and this ticket is a screen change.
- **Task 1 content and Task 2 content.**
  `mock-tests/mock-test-1/writing-section.ts` was not edited. Every word
  on the new screen comes from the content object that was already there
  or from `writing-mock-copy.ts`.
- **Task 1's screen.** It still uses `WritingTaskScreen`, with the same
  split, prompt panel, editor and timer. Its left column was moved into
  the shared `WritingSituationPanel`, which is the same markup in a
  different file.
- **Graded option rows.** `playerOption`, used by every Listening and
  Reading question, keeps the EXAM-UI-03 neutral hover and green chosen
  wash.
- **The player frame.** No width change, no full width screen, no logo
  inside the test frame.

### One known limitation, stated rather than hidden

Task 2's countdown is keyed to the task, so the choice screen and the
editor read the same window length and the same thresholds. They do not
share one running deadline: every screen change in this section remounts
the exam frame, so arriving at the editor opens a fresh 26 minutes.

That is the behaviour the whole prototype already has. Nothing in this
run enforces a window: no expiry handler is passed anywhere in Writing, a
countdown that reaches zero shows "Time is up" and the screen stays put
with every word still on it, and moving back and forward has always
restarted a Writing window. Making a window survive navigation means
lifting the deadline out of the timer component, which is a change to the
shared exam clock used by Listening, Reading and Speaking, and it is not
this ticket.

## 8. Files changed

**New**

| File | What it is |
| --- | --- |
| `src/components/exam/writing/WritingTaskTwoChoiceScreen.tsx` | the choice screen, and the one gate in the section |
| `src/components/exam/writing/WritingTaskTwoEditorScreen.tsx` | the Task 2 editor screen, with the position restated above the box |
| `src/components/exam/writing/WritingTaskOptionChoice.tsx` | the shared radio group both screens draw |
| `src/components/exam/writing/WritingSituationPanel.tsx` | the shared left column all three task screens draw |
| `docs/brand/writing-task-2-choice-screen-polish.md` | this document |

**Updated**

| File | What changed |
| --- | --- |
| `src/features/exam-engine/writing-mock-types.ts` | added the `task-choice` screen kind |
| `src/features/exam-engine/writing-mock-flow.ts` | inserts the choice screen, plus `writingTaskHasOptions` and `getWritingChosenOption` |
| `src/features/exam-engine/writing-mock-copy.ts` | choice screen wording, and `formatWritingTaskScreenTitle` |
| `src/features/exam-engine/exam-theme.ts` | repainted the Writing choice rows, added the validation and chosen position recipes |
| `src/app/globals.css` | added the two player orange tokens |
| `src/components/exam/writing/WritingSectionPrototype.tsx` | routes the two new screens |
| `src/components/exam/writing/WritingPromptPanel.tsx` | delegates its option rows to the shared component |
| `src/components/exam/writing/WritingTaskScreen.tsx` | uses the shared situation panel |

The route file,
`src/app/dashboard/mock-tests/mock-test-1/writing/page.tsx`, was not
edited. It hands the same content to the same prototype.

## 9. Test checklist

Open `/dashboard/mock-tests/mock-test-1/writing` signed in.

**Flow**

- [ ] The intro reads "Screen 1 of 6".
- [ ] Next reaches Writing Task 1, unchanged: split screen, email prompt,
      editor, live word count, 27 minute countdown.
- [ ] Next reaches the Task 1 to Task 2 transition, which reports the Task
      1 word count.
- [ ] Next reaches the new choice screen, "Screen 4 of 6".
- [ ] Start writing reaches the Task 2 editor, "Screen 5 of 6".
- [ ] Finish Writing reaches the completion screen, "Screen 6 of 6".

**Choice screen**

- [ ] Header reads
      "Mock Test 1 - Writing Task 2: Responding to Survey Questions".
- [ ] Time remaining is in the top bar and is counting down.
- [ ] The survey is on the left, the prompt instruction and the two
      options on the right.
- [ ] There is no response box on this screen.
- [ ] Pressing Start writing with nothing chosen stays on the screen and
      shows "Choose Option A or Option B before you start writing."
- [ ] Choosing an option clears that message.
- [ ] Hovering a row tints it green; the chosen row is warm with an orange
      ring.
- [ ] Tab reaches the group, arrow keys move between the two options, and
      a screen reader reads the group name and both rows.
- [ ] The window is centred and capped, not full width, and carries no
      CELPIP Decoded logo.

**Editor screen**

- [ ] The chosen option is held in the rows and restated in the line above
      the response box.
- [ ] Typing works, the word count updates, and the target reads
      "150-200 words".
- [ ] Clicking the other option changes the choice and keeps every word
      typed.
- [ ] Back returns to the choice screen with the position still chosen,
      and forward returns to the editor with the response still there.

**Task 1 regression**

- [ ] Task 1 shows no options and no choice screen anywhere before it.
- [ ] The Task 1 response survives moving to Task 2 and back.

**AI review**

- [ ] Submit for AI Review on the completion screen returns a result with
      feedback for both tasks.
- [ ] The completion screen still reports the chosen option for Task 2.
- [ ] Editing a response after a review returns the completion screen to
      its unreviewed state.

**Build**

- [ ] `npm run lint` clean.
- [ ] `npm run build` clean.
