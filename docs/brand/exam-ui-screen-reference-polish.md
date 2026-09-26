# Mock test screen-by-screen reference polish (EXAM-UI-03)

The screen-by-screen pass over the mock test player. EXAM-UI-02 built the
centred exam window and fixed the frame. The first half of EXAM-UI-03,
written up in `listening-screen-polish-and-dropdown-fix.md`, fixed what is
inside that frame for the Listening test and corrected the control
Listening Part 5 is answered with. This document is the second half: it
covers the Writing and Speaking task screens, the chosen answer colour
across the whole player, and it re-confirms the Listening work against the
reference. Section 11 is a later pass over the Listening screens again,
after the first re-confirmation was judged too generic against the
reference screenshots.

Read the two together. Where they disagree, this one is later and wins,
and there is exactly one such place: the chosen answer wash, which was a
pale blue in the first pass and is a controlled pale green now. Section 5
says why.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

## 1. Screens polished

| Screen | Route | What changed here |
| --- | --- | --- |
| Listening instructions | `/dashboard/mock-tests/mock-test-1/listening` | intro card, progress bar and continue hint removed, instruction copy set in the new instruction blue (section 11) |
| Listening audio playback | same run, clip screens | card turned into a row, native control moved out of it, playbar note set in a ruled box (section 11) |
| Listening question and options | same run, Parts 1 to 3 | full height split, information glyph on the answer column, green chosen state, then column labels dropped and the playbar note restored (section 11) |
| Listening Part 5 | `.../listening/part-5` and in the run | confirmed drop-down, no further change |
| Listening Part 6 | `.../listening/part-6` and in the run | confirmed drop-down, no further change |
| Writing Task 1 | `/dashboard/mock-tests/mock-test-1/writing` | editor frame, information glyphs, column labels dropped |
| Writing Task 2 | same run | the same, plus the chosen position wash |
| Speaking preparation | `/dashboard/mock-tests/mock-test-1/speaking` | compact clock cards with a draining bar |
| Speaking microphone | same run | recorder frame with a microphone mark and a status word |

Also checked and unchanged: the Reading run, the dashboard, and the admin
mock test builder.

## 2. Reference usage note

The brief supplied private screenshots of the real CELPIP practice test.
They were used as visual reference for structure, spacing and interaction
feel, and for nothing else.

- **No screenshot is committed.** They live in `_reference/private/`,
  which this ticket added to `.gitignore` rather than leaving to a
  reviewer to catch in a diff. Nothing from that folder is imported,
  copied into `public/`, or referenced by any component.
- **Nothing is copied pixel for pixel.** Every screen here is drawn from
  this project's own recipes in `mock-test-player-theme.ts`.
- **No official asset, logo, footer, copyright line or wording** is
  reproduced anywhere, and no screen implies affiliation with Paragon
  Testing Enterprises, Prometric or CELPIP.
- Every marking, glyph and icon in the player is drawn in this repository
  from path commands. No icon package is installed for the exam engine.
- The copy stays practice-safe: notices say answers are held on the screen
  and nothing is saved, and results are named as CELPIP Decoded practice
  estimates rather than CELPIP scores.

## 3. Listening instruction screen

**Superseded by section 11.** The first pass confirmed this screen and
changed nothing on it; a second look against the reference found three
blocks on it that do not belong on a test screen, and section 11 says
what came off. What follows is what the first pass found.

Confirmed against the reference and left as the first pass built it. The
screen already has:

- the compact grey title bar with Next at the top right
- a white content area
- the heading "Listening Test Instructions" with the circled information
  glyph beside it, drawn by `MockTestInfoIcon`
- the rules at body size, 15 pixels, separated by solid hairlines
- no copyright footer anywhere in the window
- no CELPIP Decoded logo inside the active test frame. The full section
  routes render inside `ExamModeViewport`, which covers the dashboard
  entirely, and `MockTestTopBar` carries no wordmark by design

No change was needed and none was made.

## 4. Audio screen

**Superseded by section 11.** The first pass confirmed this screen and
changed nothing on it; the second pass turned the card from a column into
a row and moved the native control out of it. What follows is what the
first pass found.

Confirmed and left as the first pass built it. `MockTestAudioVisual`
carries, in reading order: the speaker mark, a status word (Ready to play,
Playing..., Paused, Finished), a compact progress bar with the elapsed and
total time under it, the native browser control, and the note that the
playbar will not appear in the official test. It is centred and capped at
`max-w-md`, so there is no oversized marketing card.

Playback logic is untouched. The card holds no audio element, calls no
play or pause and owns no clock.

## 5. Option hover and selected behaviour

One change, and it is a deliberate reversal of a decision the first pass
made.

- **Hover stays a neutral grey**, `player-chrome-soft`. An option the
  pointer is passing over must not read like an option that has been
  chosen, and a coloured hover on a test screen reads as feedback about
  the answer, which a practice test must never give before marking.
- **Selected is now a controlled pale green**, `player-green-soft` at
  `#eef6e9`, with a hairline ring in `player-green-line` at `#6f9c57`.

Why it moved off pale blue. The first pass chose `player-blue-soft`
because it was already in the ramp. The trouble is that the Parts 1 to 3
answer column is itself pale blue, so the fill had nothing to sit against
and the ring was doing all the work. Green is the reference layout's own
chosen answer wash and it is the one tint in this player not already
carrying a meaning: blue is the primary action and the answer column, red
is the recording state and the urgent clock. Two new tokens were added to
`globals.css` for it rather than an existing colour being borrowed.

It is tuned pale on purpose. A saturated green would read as "this one is
right", which is a thing a practice test must not say before marking, and
the pale fill plus a hairline ring is legible on the white one screen
parts and on the tinted answer column from one recipe.

Where it applies: every option row in the player, through
`playerOption.rowSelected`, and the Writing Task 2 position rows, through
`examWriting.choiceRowSelected`. So a chosen answer looks the same in
every section of the test.

Two smaller things on the same screen:

- **The answer column now opens with the information glyph.** The line
  "Choose the best answer to each question." is drawn by
  `ExamInstructionRow`, so both halves of the split open the same way.
- **The split fills the window.** `ListeningQuestionScreen` passes
  `padded={false}`, `scrollContent={false}` and `fill`, the way the
  Writing and Speaking task screens already did. Before this the two
  columns were a bordered box floating in the top third of a white pane,
  with the audio panel and the answer panel ending in mid air and the rest
  of the window empty under them. The rule between the columns now runs
  the full height.

Answer state logic did not change. A row is told whether it is selected
and reports a click; the answer map still lives in the prototype that owns
the flow.

## 6. Part 5 and Part 6 drop-down fix

Both were fixed in the first pass of this ticket and both were re-checked
in the browser for this one.

- **Part 5** renders eight numbered blocks, each printing the question
  whole in the strip with one drop-down under it. No vertical radio list
  anywhere in the part.
- **Part 6** renders six numbered statements with the blank drawn where
  the source document puts underscores, and one drop-down each.
- **Part 4** is the same control, which is the point: all three one screen
  Listening parts draw from `MockTestDropdownCompletion`, so there is one
  recipe rather than three kept in step by hand.

Confirmed in `ListeningSectionPrototype`: the three part kinds render
`ListeningDropdownQuestionScreen` (Part 4), `ListeningVideoQuestionScreen`
(Part 5) and `ListeningViewpointsQuestionScreen` (Part 6), and all three
reach `MockTestDropdownCompletion`.

Preserved exactly: every question id, every option id, every word of
question, statement and option text, both answer keys, and the marking.
The value stored is still the option id and it is still marked by
`markListeningPartFive` and `markListeningPartSix` on the server, against
the same key files. Nothing in this ticket touched a content file.

## 7. Writing editor polish

New shared component: `player/MockTestWritingEditorFrame.tsx`.

The writing space used to be four things stacked loose in the answer
column: a small caps label, a bordered textarea, a word count row and a
hint paragraph. That reads as a dashboard form, and it put the one reading
a writer actually glances at, the count, furthest from the text it counts.

It is one frame now:

- a small caps label strip along the top, tied to the field with `htmlFor`
- the field, drawing no border of its own because the frame owns the edge,
  so there is one rectangle rather than a box inside a box
- a grey meta strip along the bottom carrying the word count, the target
  and the practice hint

Around it:

- **Both columns open with the information glyph** and a hairline rule
  under it. "Read the following information." on the left and the task
  itself on the right, drawn by `ExamInstructionRow`, so the two halves of
  the screen read as two halves rather than as a heading and its body.
- **The column labels are gone.** The small caps INFORMATION and YOUR
  RESPONSE over the two halves said the same thing as the instruction
  lines directly under them and cost two rows of window height. The rule
  between the columns is what separates them now, and the field keeps its
  own label strip.
- **The situation instruction came up to match the task instruction**, 15
  pixels semibold, so the two columns are weighted the same.
- The editor is 14rem tall on a small window and 17rem from the small
  breakpoint up, still resizable. Large but not oversized: on Task 2,
  which carries the two positions above the field, the word count stays on
  screen without scrolling.

The timer is where it has always been, in the top bar, and reads "Time
remaining 26:54".

Writing AI review is untouched. The frame owns no text, no count and no
state: the textarea is passed in by `WritingResponseEditor`, which still
holds the controlled value and the onChange, and the count is still worked
out by `countWritingWords`, the one word count helper in the app.

## 8. Speaking preparation and microphone polish

New shared component: `player/MockTestSpeakingRecorderFrame.tsx`.

The recorder used to be a bordered box holding a heading, a coloured
status dot, a hint sentence, the buttons and a privacy note: five rows of
small print stacked down the answer column, none of which said at a glance
whether the microphone was live.

It is the Listening audio card's mirror image now. Same three parts, on
purpose, so a learner who has already sat the Listening section reads this
screen without being taught it:

- a microphone mark, drawn in the component from four path commands, which
  turns red while the recorder is live
- a status word: Not recorded yet, Waiting for the microphone, Recording
  in progress, Finishing your recording, Recorded
- one short hint line, then the controls, then the practice note

The two clocks moved to `playerTimerCard` and came down a step. The
reading is 18 pixels rather than 20, the note under it is one short line,
and each card gained a hairline bar along the bottom that drains as its
window runs down. The bar is drawn from the reading the card already has,
through `examCountdownProgressWidth`, so the bar and the number cannot
disagree by a tick and no second clock was opened. It is decorative and
`aria-hidden`; the seconds above it are the accessible reading.

Also:

- **The audio preview no longer stretches.** It is capped at `max-w-md`
  and centred under the recorder. A browser audio control stretched across
  a half screen column is all track and no transport, and the recording it
  plays is ninety seconds long.
- **The prompt column opens with the information glyph** and a rule under
  it, and its "Read the task" column label is gone for the same reason the
  Writing ones are. The task line keeps its place after the situation
  paragraphs, because on Task 5 the situation is what the instruction
  refers to and reading them the other way round would not make sense.
- **The answer column keeps its label.** It opens with two clock cards
  rather than with a sentence, so the label is the only thing naming it.
- **The practice eyebrow came off the section intro.** The first
  Speaking screen opened with an uppercase "CELPIP-STYLE PRACTICE"
  label over the section name. The window it sits in is the practice
  test, so a screen inside it saying so in small caps is a product
  label on an exam. The Listening part intro dropped the same eyebrow
  in section 11, and the two sections now open the same way. The card
  itself stays: it carries the task count and the two time sums, which
  are facts about the section rather than a headline.

- **Visual prompts already fit.** They are drawn by `MockTestMediaFrame`,
  which caps the picture against the viewport height and letterboxes
  rather than cropping. Checked on Task 4, where the picture and the
  recorder sit side by side.

Microphone, transcription and AI review logic are untouched. The frame
holds no MediaRecorder, asks for no microphone, owns no clock and keeps no
state. The permission rule is exactly what it was: `getUserMedia` is
called in one place, inside the hook's `start()`, and the only caller of
`start()` is the Start recording click handler.

## 9. What was intentionally not changed

- **Test logic.** No flow, no screen order, no Next gating rule, no
  forward only rule, no timer duration.
- **Questions, answer keys and scoring.** Not one entry in any content
  file. `listening-score.ts`, `listening-section-score.ts` and the six
  marking actions are untouched, and marking still runs on the server
  where the keys live.
- **AI prompts, AI review and transcription.** Nothing under the review
  routes, the prompt builders or the transcription path.
- **Supabase.** No schema, no policy, no client change, and no migration
  was created.
- **The admin builder.** Nothing under `src/app/dashboard/admin` or
  `src/components/admin`.
- **Auth.** No guard, no session check, no redirect.
- **Audio and recording behaviour.** No URL changed, no clip was
  re-hosted, and neither `play()` nor `getUserMedia` moved.
- **Reading.** Its own question recipes are unchanged. It picks up the
  shared information glyph and the chosen answer wash, both of which apply
  uniformly and neither of which changes a layout.
- **Back stays at the bottom left.** Unchanged from the first pass, and
  the reasoning is in `listening-screen-polish-and-dropdown-fix.md`
  section 1.
- **The part level preview routes still look like internal routes.** They
  render inside `AppPageShell` with a breadcrumb, an INTERNAL PREVIEW
  eyebrow and a dashed notice. That is deliberate: they are the staff way
  to check a single part. The learner facing runs are the section routes,
  which render inside `ExamModeViewport` with no dashboard chrome and no
  logo.

## 10. Test checklist

Listening instructions

- [ ] `/dashboard/mock-tests/mock-test-1/listening` opens on a compact
      grey title bar with a white content area and Next at the top right
- [ ] the heading reads "Listening Test Instructions" with the circled i
      beside it
- [ ] the rules are separated by hairlines and read at body size
- [ ] no logo and no copyright footer anywhere in the window

Listening audio

- [ ] a clip screen shows the speaker mark, a status word, a progress bar,
      the browser control and the playbar note
- [ ] the status reads Ready to play before playing and Playing... after
- [ ] a clip whose length is unknown shows `--:--` and an empty bar

Listening question and options

- [ ] the two columns fill the window and the rule between them runs the
      full height
- [ ] the left column is the audio panel, the right is the question and
      its options
- [ ] both columns open with the circled i
- [ ] hovering an option gives a neutral grey wash, never a colour
- [ ] the chosen option shows a pale green fill and a green hairline ring,
      and is legible against the pale blue answer column
- [ ] the green is quiet, not a bright highlighter green
- [ ] options are ruled apart and the circles line up with the first line
      of their labels
- [ ] choosing an option, moving on and coming back still shows it

Listening Part 5 and Part 6

- [ ] `.../listening/part-5` question screen shows eight numbered blocks,
      each with one drop-down, and no vertical radio list
- [ ] `.../listening/part-6` question screen shows six numbered statements
      with the blank drawn and one drop-down each
- [ ] the same is true inside the full Listening run
- [ ] answering all of them and continuing marks against the published key

Writing

- [ ] Task 1 shows the situation on the left and the task, the three
      requirements and the editor on the right
- [ ] both columns open with the circled i and a rule under it
- [ ] there is no small caps column label over either half
- [ ] the editor is one framed block with the word count and the target in
      the grey strip along its bottom
- [ ] the timer reads in the top bar and the word count stays on screen on
      both tasks without scrolling
- [ ] on Task 2 the chosen position shows the same pale green wash the
      Listening options use

Speaking

- [ ] the preparation and recording clocks sit side by side, compact, each
      with a hairline bar that drains as its window runs down
- [ ] the recorder is one centred card with a microphone mark, a status
      word, one hint line and one button
- [ ] the mark turns red while recording and the status reads Recording in
      progress
- [ ] the audio preview after a take is capped and centred, not stretched
      across the column
- [ ] on Task 4 the picture fits the frame beside the recorder
- [ ] the microphone is asked for only when Start recording is pressed

Regression

- [ ] the Reading run still renders and navigates
- [ ] the dashboard and the admin mock test builder are unchanged
- [ ] no file from `_reference/` appears in `git status`
- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds

## 11. Second reference pass: Listening screens

The first pass confirmed the Listening instruction and audio screens
without changing them. Held beside the reference screenshots again they
were not close enough: the structure was right and the texture was a
product page. This pass fixes the texture. Nothing about content,
marking, timing or playback moved.

### Instruction screens

Three blocks came off the screen, and they are the whole reason it read
as a product page rather than as the first screen of a test.

- **The intro card is gone from the section instruction screen.** It
  carried an uppercase "CELPIP-STYLE PRACTICE" eyebrow, a bold "Listening
  Test" headline, a summary sentence and a row of counts. The window
  title bar says which test this is, so the card said it a second time in
  the largest type on the screen.
- **The section progress bar is gone from it too.** It drew an empty
  track and "0 of 38 questions answered" before the learner had been
  shown a question. It is unchanged everywhere else, including on the
  part transitions, where a learner in the middle of a six part run has
  the question it answers.
- **The "Read the following information" subtitle is gone.** That is what
  an instructions screen is for.

On the part intro screens the intro card stays, because it carries the
part scenario and the counts, but `examIntroCard` is a ruled strip now
rather than a filled bordered card with a 17 pixel bold title on it, and
the practice eyebrow above it is dropped.

Two more changes apply to every instructions screen in the player:

- **"Continue when you are ready" is off by default**, on
  `ExamInstructionScreen` and `ExamVideoScreen`, and is gone from the two
  Listening screens that wrote it themselves. Next is in the top bar of
  every screen in the test; a line saying so is hand holding, and a test
  window does not hand hold.
- **The practice notice is a line, not a bordered panel.** The wording is
  unchanged, so the honesty caveats are still said where a learner meets
  them.

### Instruction type

`examInstruction` moved out of `exam-theme.ts` and into
`playerInstruction` in `mock-test-player-theme.ts`, beside the rules list
it introduces, so the lead line and the bullets under it are one
decision. What changed with the move:

- instruction copy is set in `player-blue-ink` (`#1a5b8f`), a new token
  and a quieter blue than the action blue on the Next control. It is the
  one colour on an instructions screen and it is only ever used for text
- markers are grey rather than blue. A blue bullet in front of blue text
  is a second emphasis on a screen that already has one
- rules are 16 pixels on 28, ruled apart with a hairline, and indented to
  hang off the lead line above them
- the body is capped at `max-w-4xl` rather than run across the full 1100
  pixel window, because a rule drawn the whole way across reads as a
  table border

### Audio screen

`MockTestAudioVisual` is three things stacked instead of one tall card:

- **the card is a row**: a white speaker plate on the left, and beside it
  the status word over a wide progress bar. The plate says the screen is
  audio and the bar beside it says how far through it is, in one glance
- **the native control sits under the card**, not inside it. It is a
  practice aid rather than part of the clip display
- **the practice playbar note is a ruled box under that**. It is the one
  sentence on the screen that is about the simulator rather than about
  the test, so it is set apart

The elapsed and total time readings under the bar are gone with the
`formatMockTestAudioTime` helper that fed them: the native control prints
both a few pixels below, and two clocks on one screen can disagree by a
frame. The clip name caption is off by default for the same reason, the
title bar already naming the part and the section. The hint line under
the player is gone: the clip starts on its own on the full route, so a
line telling a learner to press play described a screen they were not on.

**Playback is untouched.** The card still holds no audio element, calls
no play or pause and owns no clock, and `ListeningAudioPlayer` still
calls `play()` in exactly one place, for the autoplay attempt.

### Question and options screen

- **the two small caps column labels are gone.** "QUESTION AUDIO" over
  the left half and "ANSWER" over the right half: what is in each half is
  obvious from what is drawn in it, and a test window does not caption
  its own panes
- **"Question 3 of 8" is a line of body text**, not a small caps field
  label over a progress track. A learner answering one question at a time
  needs to know which one they are on
- **the practice playbar note is printed here too.** The first pass hid
  it on the question screens as noise repeated under 38 clips. The scrub
  bar it warns about is on every one of those screens, so the warning
  belongs on every one of them
- options are a little roomier and their circles a little larger. Hover
  is still a neutral grey and selected is still the controlled pale green
  from section 5, unchanged

### Part 5 and Part 6

Confirmed again, both on the internal part routes and inside the full
run. Part 5 renders eight numbered question blocks each with one
drop-down, and Part 6 six numbered statements with the blank drawn and
one drop-down each. Neither is a vertical radio list. No question id, no
option id, no answer key and no marking path was touched by this pass.

### Answer Key

Confirmed hidden. `SHOW_EXAM_ANSWER_KEY_REFERENCE` is off unless
`NEXT_PUBLIC_SHOW_EXAM_ANSWER_KEY` is the string `true`, the variable is
not set in `.env.local`, and the full Listening run does not render the
part level review screen that panel lives on at all.
