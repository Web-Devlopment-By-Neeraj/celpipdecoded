# Objective question UI and screen fidelity pass (EXAM-UI-05)

The last polish pass over the objective question screens before work moves
back to the admin builder. Three things were wrong and all three were the
same kind of wrong: a control that behaved like a web form rather than
like a test window.

1. Every drop-down question was a native `select`. On the Reading screens
   its open menu stretched the answer column and moved the passage beside
   it, and there was no way to keep an open menu inside a scrolling pane.
2. Hover and selected were painted two different ways. Listening and
   Reading used a neutral grey hover and a green chosen row. Writing Task
   2 used a green hover and a warm chosen row. The same gesture meant two
   different colours depending on which section a learner was in.
3. The Reading drop-down list was a second copy of the Listening one,
   written out separately in `exam-theme.ts`, kept in step by hand.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

## 1. Reference screenshot usage

The screenshots in `_reference/private/celpip-real-ui` were opened as
visual references only, for structure and layout: where a drop-down sits
relative to the sentence it completes, that its menu is a floating list of
radio rows rather than a native menu, and how compact an exam question
screen is.

Nothing was imported and nothing was committed. `_reference/` is listed in
`.gitignore` (`/_reference/`, line 51) and `git check-ignore` confirms the
files in that folder are ignored. No official logo, footer line, copyright
text, colour pairing or wording implying affiliation was copied. Where the
reference and this simulator differ on purpose:

| Thing | Reference | CELPIP Decoded |
| --- | --- | --- |
| Chosen answer colour | pale cyan | warm `player-orange-soft` |
| Pointer colour | pale green | pale green, ours is `player-green-soft` |
| Menu geometry | their own | ours, drawn from `playerSelect` |
| Answer Key control | bottom left of the window | not built, see section 7 |
| Footer | theirs | ours, no affiliation claimed |

This stays an original practice simulator with a similar exam room
structure, which is the rule
`docs/product/exam-engine-reference-audit.md` section 9 already sets.

## 2. Hover and selected state decision

One pair, used by every objective control in the player:

- **Hover is a pale green wash**, `player-green-soft` (`#eef6e9`). It is
  the lightest tint in the ramp, it appears nowhere else on a question
  screen, and it says the pointer is here and nothing more.
- **Selected is a warm wash**, `player-orange-soft` (`#fdf1e4`) with a
  `player-orange-line` hairline ring or border, and the radio dot in the
  same warm colour so the mark belongs to the wash under it.

Why this pair and not the other way round:

- **Two hues, not two strengths of one.** A row under the pointer and a
  row already chosen are on the screen at the same time and have to be
  told apart at a glance. Two strengths of green cannot do that.
- **Neither is loud.** Both are pale on purpose. A saturated wash on a
  test screen reads as feedback about the answer, and a practice test must
  never say "this one is right" before marking. Nothing in these
  components knows the answer key: the key is stripped on the server
  before the content reaches the browser.
- **Warm survives the tinted column.** The Listening and Reading answer
  columns are pale blue. A pale blue chosen row disappears into them, and
  a green chosen row now collides with the hover. Warm reads on the blue
  column and on the white one screen parts alike, which is why the ring
  and border carry weight beside the fill.
- **It was already half decided.** EXAM-UI-04 painted the Writing Task 2
  positions this way and recorded why. This ticket adopted that pair
  everywhere rather than inventing a third.

Where it lives:

| Control | Recipe |
| --- | --- |
| Listening and Reading option rows | `playerOption` in `mock-test-player-theme.ts` |
| Drop-down trigger and menu rows | `playerSelect` in the same file |
| Writing Task 2 position rows | `examWriting.choiceRow*` in `exam-theme.ts` |

The Writing classes stay written out separately because those rows are
bordered cards on the Writing answer column and the Listening rows are
ruled lines in a list. That is geometry, not state, and the state values
are now identical.

## 3. Drop-down behaviour decision

`MockTestDropdownSelect` replaces the native `select` everywhere.

- **Compact and inline.** The trigger sits in the sentence, where the
  blank is, capped at `16rem` and truncating with an ellipsis and a
  `title` for the full text. It never changes the height of its line.
- **The menu floats.** It is `position: fixed` and placed against the
  trigger's viewport rectangle after it opens, so it is laid out in the
  viewport rather than in the flow. Opening one adds no height to the
  page, moves nothing on it, and cannot be clipped by the scrolling pane
  it was opened inside.
- **It stays on screen.** The menu flips above the trigger when the space
  below is smaller and too short, is clamped to the viewport on both axes
  with an 8px margin, caps its height to the space it has and scrolls
  inside itself. It repositions on scroll and on resize, in the capture
  phase, because the thing that moves the trigger is usually a scrolling
  pane rather than the window.
- **It sizes itself to its options.** With the width cleared and a max
  width applied, a fixed box is shrink to fit, so the menu is as wide as
  its longest option needs and no wider. Reading Part 3 answers with the
  letters A to E and Reading Part 1 answers with clauses; neither is
  measured against the other.
- **The rows are the option rows.** A drawn radio circle, the pale green
  pointer wash and the warm chosen wash, so a drop-down question and a
  radio question answer the same way.
- **It is a real combobox.** The ARIA combobox pattern with focus left on
  the trigger: arrow keys move the active row, Home and End jump, Enter
  and Space choose, Escape closes and leaves the value alone, Tab closes
  on the way out, and a pointer press inside the menu is prevented from
  taking focus so a click and a keystroke end in the same state. A press
  anywhere else closes it.
- **The menu is built from spans.** The trigger sits inside a sentence,
  which is a paragraph, and a `div` inside a `p` is invalid markup a
  browser silently repairs. Display comes from a class and meaning from a
  role.

The placeholder is still a real value rather than a disabled first
option, so an unanswered question reads "Select answer" instead of
silently reading as the first answer.

## 4. Listening screens checked

| Screen | Control | Result |
| --- | --- | --- |
| Parts 1 to 3 question screen | radio rows | left audio column and right answer column balanced, rows ruled and aligned, Next in the top bar |
| Part 4 drop-down screen | shared drop-down | five statements, five inline triggers, no boxes, no radio list |
| Part 5 question screen | shared drop-down | same control as Part 4 through `ListeningVideoQuestionScreen` |
| Part 6 viewpoints screen | shared drop-down | same control through `ListeningViewpointsQuestionScreen` |

Verified in the browser against a production build: on Part 1 the chosen
row draws the warm wash, the ring and the warm dot while the row under the
pointer draws the pale green; on Part 4 the menu opens as a floating list
and the page under it does not move.

The single column layout on the drop-down screens is unchanged. There is
no question audio on those screens, so there is nothing to put in a second
column.

## 5. Reading screens checked

| Part | Shape | Result |
| --- | --- | --- |
| Part 1 | letter, then a reply with blanks | stems answered inline, reply blanks answered in the reply |
| Part 2 | diagram, then an email with blanks and three whole questions | same two shapes, no layout change |
| Part 3 | four labelled paragraphs, nine statements | narrow A to E menu, sized to its own options |
| Part 4 | article, then viewpoints | unchanged in shape, same control |

The split pane is untouched: the passage scrolls on the left, the
questions scroll on the right, and each column keeps its own scrollbar.
Opening a menu in the right pane no longer stretches the column, and a
menu opened near the foot of the pane stays on screen.

**The control moved into the reply** (Parts 1, 2 and 4). A blank inside a
written response is now answered where the blank is, rather than in a list
under the letter with the sentence somewhere above it. That is what a fill
in the blank question is, and it became possible only because the trigger
is capped and the menu floats. The echo the reply used to draw, where a
chosen answer replaced the underscores in the sentence, is gone with the
separate list: the trigger is the answer, in the place the echo used to
appear. `ReadingQuestionPanel` renders the list below the reply for
whatever the reply did not place, so nothing is dropped and nothing is
drawn twice.

## 6. Writing Task 2 checked

The separate choice screen from EXAM-UI-04 is kept exactly as it was. The
flow, the gate, the message, the timer and the AI review path are all
untouched.

What changed is one class: the radio dot is now the warm chosen colour
instead of the action blue, so the mark belongs to the wash under it. The
row states were already the pair this ticket standardised on.

The chosen position still carries into the editor screen, because it was
never owned by either screen: `WritingSectionPrototype` holds it and both
screens read it. Verified in the browser.

## 7. Answer key status

There is no Answer Key control in the learner flow, and none was added or
removed by this ticket. The reference screenshots show one at the foot of
the practice test window; this simulator has never drawn it.

More than that, the key is not in the browser to reveal. Every Listening
and Reading route strips it on the server before the content is sent
(`withoutListeningAnswerKey`, `withoutListeningSectionAnswerKeys`, and the
Reading equivalents), so no question component in the player, including
the new drop-down, can know which option is correct.

## 8. What was intentionally not changed

- Supabase, migrations and any query.
- The admin builder and every admin screen.
- Auth, route structure and the flow builders.
- Scoring, marking, answer keys and the review and score screens.
- Question content, wording, audio files and transcripts.
- AI prompts, the Writing and Speaking evaluation paths, transcription.
- The Speaking screens.
- The split pane, the shell, the top and bottom bars, the timer and the
  button component, apart from what section 2 and section 3 describe.
- `findReadingAnswerText` in `reading-flow.ts`, which the reply echo used
  and nothing calls now. It is flow code rather than UI code and this
  ticket does not edit flow files.

Two recipes were retired rather than left as dead code: `examReadingQuestion`
(the second copy of the drop-down list) and `examWriting`'s
`responseBlankFilled` (the reply echo). Both leave a note in place saying
what replaced them.

## 9. Test checklist

Drop-down behaviour, on Listening Part 4 and Reading Parts 1 to 4:

- [ ] Clicking a trigger opens a floating menu, and nothing on the page
      moves.
- [ ] Choosing an option closes the menu and the trigger shows the choice.
- [ ] The trigger truncates a long option instead of stretching its line.
- [ ] A menu opened near the foot of a pane flips up or scrolls, and is
      never cut off by the pane.
- [ ] A menu opened near the right edge is clamped inside the window.
- [ ] Scrolling the pane with a menu open keeps the menu on its trigger.
- [ ] Clicking outside closes the menu and leaves the value alone.
- [ ] Escape closes the menu and leaves the value alone.
- [ ] Arrow keys, Home, End, Enter and Space operate the menu with the
      keyboard alone, and Tab closes it on the way out.
- [ ] A screen reader announces the question number and sentence when the
      trigger takes focus.

States, on every objective screen:

- [ ] The row or trigger under the pointer is pale green.
- [ ] The chosen row or trigger is warm, with its ring or border and a
      warm radio dot.
- [ ] The two are never the same colour and never swap between sections.
- [ ] The chosen state is legible on the pale blue answer column and on
      the white one screen parts.

Layout:

- [ ] Listening Parts 1 to 3: the audio column and the answer column stay
      balanced and the rule between them runs the full height.
- [ ] Listening Parts 4 to 6: one column, compact, no radio lists.
- [ ] Reading: the passage scrolls on the left and the questions on the
      right, independently, and the window never scrolls sideways.
- [ ] Reading Parts 1, 2 and 4: each reply blank is answered in the reply
      and appears exactly once on the screen.

Flow and marking:

- [ ] Answers survive moving back and forward between screens.
- [ ] Next stays available where it was before and gated where it was
      before.
- [ ] The answered count under a list counts the same questions it did
      before.
- [ ] A part scores the same as it did before this ticket.
- [ ] Writing Task 2: the position chosen on the choice screen is the one
      shown on the editor screen.
- [ ] No Answer Key control appears anywhere in the learner flow.

Build:

- [ ] `npm run lint` clean.
- [ ] `npm run build` clean.
