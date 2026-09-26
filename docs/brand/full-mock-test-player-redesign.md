# Full mock test player redesign (EXAM-UI-02)

How the Mock Test 1 player was turned from a full browser web page into a
compact exam simulator window, and what was deliberately left alone.

Routes covered:

- /dashboard/mock-tests/mock-test-1/listening
- /dashboard/mock-tests/mock-test-1/reading
- /dashboard/mock-tests/mock-test-1/writing
- /dashboard/mock-tests/mock-test-1/speaking

House style: normal hyphens only, straight quotes only.

## 1. Why the mock test player was redesigned

The engine worked. The screens did not read as a test.

Five specific problems, all reported from the client demo:

**It filled the browser.** Inside the locked exam viewport the frame
dropped its width cap, its border and its rounded corners, so the test was
painted edge to edge on whatever monitor it was opened on. On a wide
screen a Listening question list was drawn two and a half thousand pixels
across, with the question on one side of the desk and the answer on the
other. Nothing about that reads as an exam application.

**The type was set for a toolbar.** Body copy ran at 13 pixels, secondary
copy at 12 and labels at 11, which was legible on the internal preview
pages the engine was built against and too small to sit a two hour test
in. There was also no heading: a part intro title and a question option
were the same size and the same weight, so a learner arriving on a screen
had nothing to land on.

**Content could get trapped.** The content area grew with whatever was
inside it rather than scrolling, so a tall screen pushed the bottom
navigation bar off the window instead of scrolling under it. A long
instruction list, a 16 by 9 instructional video, or a scenario drawing at
its intrinsic size could each do it on a laptop.

**Images had no ceiling.** A Listening scenario drawing and a Reading
brochure were sized by their own pixels. On a 768 pixel tall browser that
could be taller than the whole content area, which pushed the audio
controls and the questions after them out of sight.

**The brand leaked in.** The exam recipes are written against the
academy-* palette tokens, and the rebrand pointed those at the CELPIP
Decoded ink navy and emerald teal. That is right on the dashboard and
wrong inside a test: a learner sitting a practice exam should see plain
testing software, not a branded product page.

## 2. Separation of brand UI and exam UI

The product brand and the test environment are now two different surfaces.

**CELPIP Decoded branding stays on:** the landing page, login, the
dashboard, the admin mock test builder, the Speaking and Writing practice
areas, and the app shell around everything. None of these were touched.

**The active mock test player is neutral:** a grey desk, a white window
with a light grey border, two compact grey bars, plain interface blue for
the primary action, and no logo, wordmark or product name anywhere inside
the exam frame.

The separation is enforced in one place rather than forty. The player
window carries `data-mock-test-player`, and a rule in
`src/app/globals.css` re-points the palette variables inside it:

```
[data-mock-test-player] {
  --academy-navy:      var(--player-ink);
  --academy-navy-soft: var(--player-chrome);
  --academy-blue:      var(--player-blue);
  --academy-blue-soft: var(--player-blue-soft);
  --academy-line:      var(--player-line);
  --academy-paper:     var(--player-paper);
  ...
}
```

This works because the palette is declared with Tailwind's `@theme
inline`, so a utility such as `bg-academy-navy-soft` compiles to
`background-color: var(--academy-navy-soft)` and picks up whatever the
nearest ancestor has that variable set to. One rule swaps the whole exam
surface without editing a single screen recipe, and nothing outside the
player is affected. The internal Listening part routes show both at once:
brand chrome around the page, player skin inside the frame.

The new player tokens are:

| token | value | job |
| --- | --- | --- |
| `--player-desk` | `#f2f2f2` | the grey the exam window sits on |
| `--player-chrome` | `#e5e7eb` | the top and bottom bars |
| `--player-chrome-soft` | `#eceef1` | media surfaces, panel headers |
| `--player-line` | `#cfd4dc` | the window border and internal rules |
| `--player-paper` | `#ffffff` | the content area |
| `--player-ink` | `#1f2937` | body text |
| `--player-blue` | `#1d4ed8` | the primary exam action |

## 3. New shared player components

All eleven live in `src/components/exam/player/`, with their class
recipes in `src/features/exam-engine/mock-test-player-theme.ts`.

| component | what it owns |
| --- | --- |
| `MockTestPlayerShell` | the desk, the centred 1100px window, and the composition of the three regions |
| `MockTestTopBar` | compact title bar, around 48px, holding the title, the timers and Next |
| `MockTestContentPane` | the white content area and the player's whole scroll rule |
| `MockTestBottomBar` | compact navigation bar, around 56px, holding Back |
| `MockTestButton` | the one button style in the player: square, compact, uppercase for navigation |
| `MockTestInstructionList` | the rules on an instructions screen, at 16px with a dotted rule between them |
| `MockTestMediaFrame` | the box an image, audio clip or video sits in, with the viewport height cap |
| `MockTestSplitPane` | source material left, answers right, each side scrolling on its own |
| `MockTestTimerBadge` | one timer reading as a small bordered badge |
| `MockTestQuestionPanel` | the bordered box a question set or answer area sits in |
| `MockTestReviewPanel` | the block a review or result screen is built from, plus its capped column |

### How the redesign reached sixty screens without sixty edits

Roughly sixty screen components across the four sections render an
`ExamShell`. Rewriting each of them would have been a large diff with a
real chance of missing some.

Instead the old chrome components became thin adapters that render the
new player components and keep their existing prop lists:

```
ExamShell            -> MockTestPlayerShell
ExamTopBar           -> MockTestTopBar
ExamCanvas           -> MockTestContentPane
ExamBottomBar        -> MockTestBottomBar
ExamButton           -> MockTestButton
ExamTimerDisplay     -> MockTestTimerBadge
ExamInstructionList  -> MockTestInstructionList
ExamPanel            -> MockTestQuestionPanel
ExamTwoColumnLayout  -> MockTestSplitPane
```

So the redesign lands on Listening, Reading, Writing and Speaking at once,
no screen has to know it happened, and no test logic moved.

One prop is new on the shell. `scrollContent` tells it whether the content
pane takes the scrollbar; a split screen sets it false so its two columns
can each take one instead.

`ExamModeViewport` was rebuilt on the same theme: it is the fixed, one
window tall grey desk the shell fills, and it is the only element with a
document level scrollbar.

## 4. Listening screens updated

Every screen in the full Listening run, and the six internal part routes
that share the same components.

- **Instructions.** The intro strip and the rule list at 16px with a small
  blue marker and a dotted hairline between rules, so a full set fits on
  one screen without pushing Next below the fold.
- **Instructional video.** The player column came down from `max-w-3xl` to
  `max-w-2xl`. The stage is 16 by 9, so every pixel of width costs 56
  percent of one in height, and at the wider cap the video screen was
  taller than a laptop content pane on its own.
- **Part intro.** Same instruction treatment, with the part facts in the
  quiet bordered strip above it.
- **Audio and image prompt.** The audio player is compact and capped. The
  scenario picture now goes through `MockTestMediaFrame`: capped at 46vh,
  centred, `object-contain` so it letterboxes rather than crops, and never
  upscaled past its own pixels.
- **Question screens.** The split screen, the boxed question blocks and the
  radio option rows all step up to 15px body copy. The live countdown
  moved into the timer badge in the top bar.
- **Review.** Each of the six parts is now a `MockTestReviewPanel`: a
  bordered box with a tinted header strip carrying the part label and the
  answered count, with that part's answer table unpadded inside it. The
  38 rows used to run together as one unbroken column.
- **Result.** The score card, the estimated band strip and the part
  breakdown table are unchanged in structure and sit in the capped review
  column. The headline percentage is 22px, the top of the heading band.

Answer logic, audio logic, media source logic and scoring are untouched.

## 5. Reading screens updated

- **Instructions and part intros.** Same treatment as Listening.
- **Passage and question screens.** The split pane runs in fill mode: the
  grid takes the height of the content pane, and each column hands its
  scrollbar to its own body. A four paragraph letter and an eleven
  question list now scroll past each other independently, both column
  labels stay pinned, and neither side can move the bars. This replaces a
  fixed 28rem cap per column, which was right on exactly one screen size.
- **Diagram screens.** The Part 2 brochure goes through
  `MockTestMediaFrame` on its tall setting, capped at 62vh, because here
  the picture is the passage rather than a prompt beside one. If the
  brochure is taller than the cap it is still readable at full size by
  scrolling the passage column.
- **Dropdown and option screens.** The boxed completion blocks and the
  selects step up to 15px. The select keeps its width cap so its value
  stays near the statement it completes.
- **Review.** Each of the four parts is a `MockTestReviewPanel` with the
  part label, the CELPIP part name and the question count in the header
  strip.
- **Result.** The score card, the estimated Reading band and the part
  breakdown, unchanged in structure.

Answer logic, answer keys and scoring are untouched.

## 6. Writing screens updated

- **Instructions.** The four rules with their inline blue headings, at
  16px.
- **Task 1 and Task 2.** The split pane in fill mode. The situation stays
  readable in its own scrolling column while the editor is typed in, and
  the editor column scrolls separately, so the word count under the
  textarea is always reachable without scrolling the whole screen. The
  textarea keeps its 16rem to 20rem height, which fits the compact frame
  rather than running the height of the browser.
- **Word count and timer.** The count row sits directly under the editor
  in the answer column. The countdown is a badge in the top bar and never
  moves as it ticks.
- **Completion.** The capped centred stack, listing both responses.
- **AI processing.** The processing screen, unchanged apart from type and
  chrome.
- **AI result.** The report keeps its structure: the overall estimate
  strip, the practice disclaimer, a bordered card per task with its
  criterion table, corrections and rewrites. It sits in the capped
  centred column so a review is never set on the full window width. The
  practice-only disclaimer is unchanged and still clear.

AI logic, the scoring prompt and the writing result schema are untouched.

## 7. Speaking screens updated

- **Instructions.** The five rules with inline blue headings, at 16px.
- **Tasks 1 to 8.** The split pane in fill mode: the prompt and its
  picture on the left in their own scrolling column, the answer side on
  the right. Stop recording is never below the fold while a clock is
  running.
- **Preparation and recording timers.** The two on-screen clocks keep
  their bordered cards, with the value raised to 20px so a speaker can
  read them at a glance without the cards growing.
- **Visual prompts.** Both the scene pictures and the option card pictures
  go through `MockTestMediaFrame`, capped at 46vh and still capped at
  34rem wide, which is the width of the largest picture in the section as
  the source delivers it.
- **Recording controls.** One bordered panel holding the status line, the
  control and the hint, unchanged in behaviour.
- **Audio preview.** The local playback player is capped to its column and
  does not stretch.
- **Completion, AI processing and AI result.** The same treatment as
  Writing, including the transcript block and the audio assessment note.

Microphone logic, transcription logic and Speaking AI evaluation are
untouched.

## 8. Scroll behaviour decisions

The rule for the whole player is one sentence:

> The content pane scrolls. The window does not. The bars never move.

How it is built:

1. `ExamModeViewport` is fixed and one window tall, so the shell inside it
   has a real height to fill.
2. Its inner box takes `h-full`, a definite height, not `min-h-full`. This
   is the load bearing change. A minimum height still lets a box grow with
   its content, which meant the window grew with the screen inside it and
   the pane never had a reason to scroll: a long screen simply pushed the
   bottom bar below the fold. A definite height makes the pane the thing
   that gives.
3. The desk, the container and the window each grow into that height.
4. Both bars are `shrink-0`, so they keep their height whatever is inside
   the pane.
5. The pane is `min-h-0 grow overflow-y-auto`. `min-h-0` is what lets a
   flex child shrink below its own content; without it the whole chain
   fails.
6. `overscroll-contain` on the pane and `overscroll-none` on the desk stop
   a flick past the end of a screen from chaining out and rubber banding
   the page behind the exam.

Nested scrolling is used in exactly one place and only where it earns its
keep: the split pane's fill mode, where the passage and the question list
each take a scrollbar and the pane takes none. Anything else would put a
scrollbar inside a scrollbar.

Long review lists scroll in the pane rather than inside their panels, so
the panel headers scroll away with their rows and the reader keeps a
single scroll gesture for the whole screen.

The desk itself scrolls only when the window's minimum height, 34rem plus
its margins, will not fit the browser. On any normal laptop there is
nothing to scroll.

## 9. Responsive behaviour decisions

Desktop and laptop are the priority, and the layout targets are met:

- The window is capped at 1100px, the middle of the 1040 to 1120 band, and
  centred on the desk. On a 1707px wide browser the test stops growing at
  1100 and the desk takes the rest.
- 40px of desk above the window and 32px below, dropping to 32px on both
  at small widths.
- Top bar minimum 48px, bottom bar minimum 56px.
- Body copy 15px, task instructions 16px, screen headings 18px, the
  largest result figure 22px.
- Nothing sets a fixed pixel width, so there is no horizontal page scroll:
  the container is `w-full` under its cap, and `min-w-0` runs down the
  whole tree.

Below the `lg` breakpoint the split pane stacks into one column and drops
fill mode, so the two columns scroll with the pane rather than each taking
a scrollbar. Two short scroll boxes stacked on a phone is a worse screen
than one page that scrolls. Media caps are expressed in `vh`, so they
shrink with the device rather than holding a desktop pixel value.

The bars wrap rather than clip at narrow widths: the title takes a full
row of its own and the controls sit under it.

## 10. What was intentionally not changed

Nothing in this ticket touched:

- test flow, screen sequencing, or the forward-only rule in the full
  Listening run
- question content, answer keys, or any content file
- Listening or Reading marking and scoring, including the estimated band
  charts
- the Writing and Speaking AI prompts, evaluation logic, result schemas,
  or the transcription pipeline
- microphone capture, audio playback, or media source resolution
- Supabase: no schema change, no migration, no SQL, no query change
- the admin mock test builder, its data model, or any admin feature
- authentication, route guards, or the answer-key stripping that keeps
  keys on the server
- environment variables and API keys
- the dashboard, the landing page, login, admin, or the Speaking and
  Writing practice areas

Where the Back control appears is also unchanged. The full Listening run
is forward only by design, so most of its screens show an empty bottom
bar; Reading, Writing and Speaking show Back where they always did.

On the legal side: no official test provider's logo, colour pairing,
footer text or copyright line appears anywhere in the player, and no
affiliation is claimed. The practice-only wording on the instruction,
review and result screens is unchanged. This is an original practice
simulator skin.

## 11. Client demo checklist

Run each route and check the following.

**Every screen, all four sections**

- [ ] The exam window is centred with grey desk on both sides, and does
      not stretch to the browser edges
- [ ] No logo, wordmark or product name inside the exam frame
- [ ] Top bar and bottom bar stay in place while the content scrolls
- [ ] Next is top right; Back is bottom left where the flow offers it
- [ ] No horizontal page scrollbar at any width

**Listening** (/dashboard/mock-tests/mock-test-1/listening)

- [ ] Instructions fit on one screen with Next visible
- [ ] The instructional video fits without the pane scrolling
- [ ] The scenario picture fits above the fold and does not push the audio
      controls out of reach
- [ ] A question screen shows the countdown badge and the answer options
      side by side
- [ ] The section review shows six bordered part panels, and scrolls with
      the bottom bar staying put
- [ ] The practice score, the estimated band and the part breakdown render

**Reading** (/dashboard/mock-tests/mock-test-1/reading)

- [ ] Part 1: the letter scrolls on the left while the questions scroll on
      the right, independently
- [ ] Part 2: the brochure fits the left column and the email scrolls on
      the right
- [ ] Dropdowns open and select normally inside the scrolling column
- [ ] The section review shows four bordered part panels
- [ ] The practice score and the estimated Reading band render

**Writing** (/dashboard/mock-tests/mock-test-1/writing)

- [ ] Task 1: the situation and the editor sit side by side and scroll
      separately
- [ ] The word count is visible without scrolling the screen
- [ ] The countdown badge does not move as it ticks
- [ ] The AI review runs and the result report renders in the capped column
- [ ] The practice-only disclaimer is clear on the result

**Speaking** (/dashboard/mock-tests/mock-test-1/speaking)

- [ ] Task 1: both clocks and the record control are visible without
      scrolling
- [ ] Task 3: the picture fits the left column and the recorder stays put
- [ ] Recording starts, stops, and plays back
- [ ] The AI review runs and the result report renders

**Brand separation**

- [ ] /dashboard still shows the CELPIP Decoded sidebar, teal and navy
- [ ] / and /login are unchanged
- [ ] /dashboard/admin/mock-tests is unchanged
- [ ] An internal part route such as
      /dashboard/mock-tests/mock-test-1/listening/part-1 shows brand chrome
      around the page and the neutral player skin inside the frame

## 12. Known remaining polish items

Not blockers for the demo, and none of them were in this ticket's scope.

1. **The bottom bar is empty on most Listening screens.** The full
   Listening run is forward only by design, so `showBack` is false
   everywhere except the score and end screens. The bar is still drawn,
   because a navigation bar that comes and goes is worse than an empty
   one, but it could carry the progress reading instead of nothing. That
   is a flow decision, not a layout one.
2. **Narrow widths are reasoned, not measured.** The four routes were
   checked in a real browser at 1707x769 and the fallbacks below the `lg`
   breakpoint are the pre-existing stacked layout, but a phone width pass
   has not been walked screen by screen.
3. **The split divider and the column scrollbars sit close together.**
   On a passage long enough to scroll, the left column's scrollbar draws
   right against the divider rule. A gutter would read better.
4. **The `shell-preview` internal page now stacks four full exam windows.**
   It was four stacked frames before and it still works, but a page whose
   job is to show the chrome would be better served by one window and a
   screen switcher.
5. **Media caps are `vh` based.** That is right for a browser window and
   slightly generous inside the dashboard content column on the internal
   part routes, where the frame is not full height. A container query
   would be exact.
6. **The review panels do not remember scroll position.** Moving from the
   review to the score and back returns to the top of the list.
