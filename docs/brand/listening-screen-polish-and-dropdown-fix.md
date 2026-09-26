# Listening screen polish and dropdown fix (EXAM-UI-03)

Follow-up to EXAM-UI-02, which built the centred exam window. That ticket
fixed the frame. This one fixes what is inside it, screen by screen, for
the Listening test, and corrects the control Listening Part 5 is answered
with.

Scope note. Everything here is an original CELPIP Decoded practice
simulator. The reference screenshots the brief supplied were used for
layout and usability direction only. No official logo, footer, copyright
line, wording or proprietary asset is reproduced anywhere, and nothing on
these screens implies affiliation with Paragon Testing Enterprises,
Prometric or CELPIP.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

## 1. Instructions screen

The first screen of the Listening run, and the one screen that is nothing
but instructions.

What changed:

- **The screen names itself.** The heading read "Instructions:", which is
  what every other screen in the player says, so the instructions screen
  was the one screen that did not say what it was. It now reads
  "Listening Test Instructions", carried on the section content object as
  a new optional `heading` field and supplied from
  `listening-section-copy.ts`. A section that does not name one still
  falls back to the generic lead, so no other screen moved.
- **The information glyph is a shared component.** `MockTestInfoIcon`
  draws the circled i beside the heading, and `ExamInstructionRow` renders
  it instead of a span of its own. The glyph beside a screen heading and
  the glyph beside a task line are now provably the same mark. It is still
  drawn from two elements and a class recipe: no icon package is installed
  for the exam engine.
- **Instruction copy came down a step,** from 16 pixels to the 15 the rest
  of the exam body uses, with row padding cut from 8 pixels to 6. At the
  old size a set of six rules read as an article rather than as the rules
  strip above a test. Readable, not oversized.
- **The divider is solid, not dotted.** At the tighter row height a dotted
  hairline read as texture rather than as a divider.
- The compact grey title bar, the white content area and Next at the top
  right are unchanged from EXAM-UI-02 and already matched the brief.
- **Wording.** The screen already carried practice-safe copy and it stays:
  the notice says answers are held on the screen only and nothing is
  saved, and the last rule says this is CELPIP Decoded practice and not an
  official CELPIP score. **No copyright footer is rendered anywhere in the
  player**, and none was added.

### Back, and where it sits

The brief asked for Back at the bottom right "if current logic allows".
Back is shown wherever the flow allows one, and it stays at the bottom
left of the bottom bar. Two reasons, both deliberate:

- **The full Listening run is forward only** (EXAM-15F). The section
  instructions screen is the first screen of the run, so there is no
  previous screen and no Back is drawn. The part level routes are not
  forward only and do show Back on their intro screens.
- **The right of the bottom bar is already occupied.** Across all four
  sections that slot carries the secondary action: Check answers, Review
  answers, Finish, Restart. Moving Back there would either collide with
  those or push them to the left on Reading, Writing and Speaking, which
  this ticket was asked not to disturb.

Say the word and Back moves right in one edit to `MockTestBottomBar`, and
the secondary actions move with it.

## 2. Part intro and image screen

The scenario screen keeps the centred exam window and was already close.
Confirmed and kept:

- the instruction row is at the top, above the picture
- the picture sits in `MockTestMediaFrame`, which caps it against the
  viewport height and letterboxes rather than cropping, so a scenario
  drawing cannot push the questions after it out of reach
- `max-w-full` plus `object-contain` on the image and `min-w-0` on every
  box between it and the window means the frame never scrolls sideways
- internal scrolling is the content pane's, and the two bars do not move,
  so Next and Back stay reachable on any screen length

## 3. Audio playback screen

New shared component: `MockTestAudioVisual`.

Before, an audio screen was a bare browser control bar in a bordered box.
It worked and it said nothing: on a screen whose only job is "a clip is
playing, listen to it", the one thing the learner needed to know was the
one thing the screen did not show.

The card now carries, in reading order:

- an original speaker mark, an inline SVG drawn in the component from
  four path commands
- a status word: Ready to play, Playing..., Paused or Finished
- a horizontal progress bar, with elapsed and total time under it
- the native browser control, unchanged
- the note "This playbar will not appear in the official test."

It is compact and centred, capped at `max-w-md`.

**Playback logic did not change.** `MockTestAudioVisual` holds no audio
element, calls no play or pause and owns no clock; it is handed a status
and a fraction and draws them. `ListeningAudioPlayer` still calls `play()`
in exactly one place, the EXAM-15F autoplay attempt, and calls `pause()`
and seek nowhere. The bar is driven from the element's own `timeupdate`
event and drives nothing back, so it can lag the clip but cannot disagree
with it. A duration the browser has not worked out reads `--:--` and
leaves the bar empty rather than dividing by `NaN`.

The three pieces of state added for it are written from media events, not
from an effect, which is the rule the existing error flag already followed
and what the project's lint rule against setState in effects wants.

The practice playbar note is suppressed on the Parts 1 to 3 question
screens through `showPlaybarNote={false}`. It earns its place on the clip
screen that opens a part and would be noise repeated under 38 question
clips.

## 4. Question option styling

New shared components: `MockTestOptionList` and `MockTestOptionRow`.

Three question screens each had their own copy of "what does an option
look like and what happens on hover", which is how the three drifted into
three different washes. There is one owner now, `playerOption` in
`mock-test-player-theme.ts`.

- **Hover is a neutral grey**, `player-chrome-soft`, never a saturated
  colour. An option the pointer is passing over must not read like an
  option that has been chosen, and a coloured hover on a test screen reads
  as feedback about the answer, which a practice test must not give before
  marking.
- **Selected is a controlled pale blue plus a hairline ring.** The Parts 1
  to 3 answer column is itself pale blue, so a pale blue fill alone was
  invisible there and the only cue left was the radio dot. The ring reads
  on the tinted column and the fill reads on the white one screen parts,
  so one recipe works on both surfaces.
- **Rows are ruled and compact:** a hairline between options, 6 pixels of
  vertical padding, so a four option question fits on screen with its
  question.
- **Radio circles are aligned** to the centre of the first line of their
  label rather than to the top of it.
- The whole row is the click target, so nobody has to hit the circle.

**Answer state logic did not change.** The row knows nothing about
answers: it is told whether it is selected and reports a click. The answer
map still lives in the prototype that owns the flow, which is what makes a
choice survive moving back and forward.

## 5. Answer Key visibility

The Listening part level answer review carried an "Answer key reference"
panel with a "Show the answer and explanation sheet" disclosure under the
results table. That opens the published answer sheet for the whole part.
It is a staff control, and the part routes it appears on are reachable
from a typed URL by anyone signed in, so "it is an internal route" was
never a control.

It is now off by default:

- `src/features/exam-engine/exam-debug.ts` exports
  `SHOW_EXAM_ANSWER_KEY_REFERENCE`, true only when
  `NEXT_PUBLIC_SHOW_EXAM_ANSWER_KEY` is exactly the string `"true"`
- `ListeningAnswerReviewScreen` takes `showAnswerKeyReference`, defaulting
  to that flag, and renders the panel only when it is on
- a normal local run and every deployment therefore hide it with nothing
  configured; the variable is documented in `.env.example` set to `false`
- a caller can still force it on for a staff screen by passing the prop

**This changes what is offered, not what is protected.** The keys were
never on the page: every route strips its answer key on the server before
the content crosses to the browser, and marking runs in a server action
beside the key. A learner could not read an answer out of the page before
this change and cannot now.

The full Listening section review never offered the sheets and is
unchanged.

## 6. Listening Part 5 dropdown fix

**The regression.** Part 5 rendered as eight radio groups of four options,
which is thirty two controls stacked down a page a learner has to scroll
several times to work through.

**Why it was built that way.** EXAM-11 read the source document's "Choose
the best way to complete each statement from the drop-down menu" as a copy
and paste artefact, because the eight Part 5 items are whole
interrogatives rather than sentence stems, so there was no blank for a
select to sit in. EXAM-15F re-confirmed that reading.

**Why that was wrong.** It answered the wrong question. Part 5 is a one
screen part answered from a drop-down menu: the source instructs it that
way, it sits beside Parts 4 and 6 which are already selects, and a
drop-down does not need a blank in the text. The question is printed whole
in the block header and the menu under it carries the four answers.

**The fix.** A new shared control,
`src/components/exam/player/MockTestDropdownCompletion.tsx`, draws an item
one of two ways, decided by the item itself rather than by a flag:

- **a question**, when `prompt` is set: the question is printed whole in
  the strip, the select under it (Part 5)
- **a statement**, when `textBefore` is set: printed with the blank drawn
  where the source document put underscores, the select finishes it
  (Parts 4 and 6)

`ListeningVideoQuestionScreen` renders it directly.
`ListeningVideoQuestionList`, the radio list, is deleted rather than left
in place unused.

**Preserved exactly:**

- all eight question ids and all thirty two option ids
- every word of question text and option text
- the answer key, untouched
- scoring: the value stored is still the option id, marked by the same
  `markListeningPartFive` server action against the same key

Verified in the browser end to end: eight answers chosen from the menus,
and the review marks them against the same key with the same correct
answers the key file lists.

**One wording change, and it is the source's own wording.** The part's
instruction bullet and its question instruction now end "from the
drop-down menu", the way Part 6's did when it moved to a select in
EXAM-15F. EXAM-11 dropped the clause because naming a control that was not
on the screen would have been a lie; the control is there now. The intro
card Format row reads "Discussion video and dropdown questions".

## 7. Listening Part 6 dropdown

Part 6 was already a drop-down screen: EXAM-15F moved it off radio options
for the same reason, and its statements already stored the blank as
`textBefore` and `textAfter`.

What EXAM-UI-03 did is move it onto the shared control, through
`ListeningDropdownQuestionList`, which is now a thin adapter over
`MockTestDropdownCompletion`. So all three one screen Listening parts draw
one control from one recipe rather than two lists kept in step by hand.

Preserved exactly: the six question ids, the four option ids under each of
them, every word of statement and option text, the answer key and the
`markListeningPartSix` scoring. Verified in the browser: six answers, six
rows marked against the same key. The Format row now reads "Report audio
and dropdown questions".

## 8. Shared components

Created:

| File | Job |
| --- | --- |
| `player/MockTestInfoIcon.tsx` | the circled information glyph, one owner |
| `player/MockTestAudioVisual.tsx` | speaker mark, status, progress bar, native control, practice note |
| `player/MockTestOptionRow.tsx` | one radio option row, plus `MockTestOptionList` |
| `player/MockTestDropdownCompletion.tsx` | the drop-down completion list for Parts 4, 5 and 6 |
| `features/exam-engine/exam-debug.ts` | the answer key reference flag |

Updated:

| File | Change |
| --- | --- |
| `player/MockTestInstructionList.tsx` | body sized rows, tighter padding, solid rule |
| `features/exam-engine/mock-test-player-theme.ts` | new `playerInfoIcon`, `playerAudioVisual`, `playerOption`, `playerDropdown` recipes |

Reviewed and left alone: `MockTestQuestionPanel.tsx` and
`MockTestMediaFrame.tsx`. Both already do what this ticket needs, and the
media frame's height cap and `object-contain` are the existing fix for
image overflow.

Retired: `examListeningChoice` and `examListeningDropdown` in
`exam-theme.ts`, and the option row recipes on `examListening`. Two recipe
blocks describing the same block, strip and select, kept in step by hand,
is exactly the drift this ticket was raised to fix, so the survivors are
the ones with a single owner.

## 9. What was intentionally not changed

- **The backend.** No route handler, no server action signature, no data
  access.
- **Answer keys.** Not one entry in any content file.
- **Scoring.** `listening-score.ts`, `listening-section-score.ts` and the
  six marking actions are untouched, and marking still runs on the server
  where the keys live.
- **Audio files and audio playback logic.** No URL changed and no clip was
  downloaded or re-hosted. The player calls `play()` in the same one place
  and nothing else.
- **Supabase.** No schema, no policy, no migration, no client change. No
  migration was created.
- **Admin.** Nothing under `src/app/dashboard/admin` or
  `src/components/admin`.
- **Writing, Reading and Speaking screens.** Only shared player components
  they render were touched: `ExamInstructionRow` now draws the shared
  glyph, and `ExamInstructionList` sizing came down a step. Both apply
  uniformly and neither changes a layout. Reading keeps its own
  `examReadingQuestion` recipes rather than reading the shared drop-down
  control, because Reading has a question shape Listening does not.
- **Back stays at the bottom left.** See section 1.
- **Timers, the forward only rule and the Next gating rules** from
  EXAM-15F. Untouched.
- **The full Listening section review** still deliberately offers no
  answer sheets.

## 10. Test checklist

Instructions screen

- [ ] `/dashboard/mock-tests/mock-test-1/listening` opens on a compact
      grey title bar with a white content area
- [ ] the heading reads "Listening Test Instructions" with the circled i
      beside it
- [ ] the five rules are separated by hairlines and read at body size
- [ ] Next is at the top right; no Back, because the run is forward only
- [ ] no copyright footer appears anywhere in the window

Part intro and image

- [ ] Listening Part 1 scenario screen: instruction at the top, picture
      under it
- [ ] the picture never runs past the window edge at any browser width
- [ ] the content pane scrolls and the two bars do not move
- [ ] Next and Back stay reachable

Audio screen

- [ ] a clip screen shows the speaker mark, a status word, a progress bar,
      the browser control and the playbar note
- [ ] the status reads Ready to play before playing and Playing... after
- [ ] pausing reads Paused, reaching the end reads Finished
- [ ] a clip whose length is unknown shows `--:--` and an empty bar rather
      than a broken one
- [ ] the note does not appear under the Parts 1 to 3 question clips

Question options

- [ ] Parts 1 to 3 question screen: hovering an option gives a neutral
      grey wash, never green
- [ ] the selected option shows a pale blue fill and a hairline ring, and
      is legible against the pale blue answer column
- [ ] options are ruled apart and the circles line up with the first line
      of their labels
- [ ] choosing an option, moving to the next question and coming back
      still shows the choice

Part 5

- [ ] `/dashboard/mock-tests/mock-test-1/listening/part-5` question screen
      shows eight numbered blocks, each with one drop-down
- [ ] no vertical radio lists anywhere in the part
- [ ] every question and option reads exactly as it did before
- [ ] answering all eight and continuing marks against the published key
- [ ] the same is true inside the full Listening run

Part 6

- [ ] `/dashboard/mock-tests/mock-test-1/listening/part-6` question screen
      shows six numbered statements with the blank drawn and one drop-down
      each
- [ ] answering all six and continuing marks against the published key

Answer key visibility

- [ ] with no `NEXT_PUBLIC_SHOW_EXAM_ANSWER_KEY` set, no answer key panel
      appears on any Listening answer review
- [ ] setting it to `true` and restarting the dev server brings the panel
      back, collapsed
- [ ] the full Listening section review shows no answer sheet either way

Regression

- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds
- [ ] Reading, Writing and Speaking screens still render and navigate
