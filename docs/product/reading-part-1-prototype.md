# Reading Part 1 prototype (EXAM-16)

Mock Test 1, Reading Part 1, Reading Correspondence. The first Reading
part built, and the first split screen in the practice test engine.

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route created

```
/dashboard/mock-tests/mock-test-1/reading/part-1
```

Source file: `src/app/dashboard/mock-tests/mock-test-1/reading/part-1/page.tsx`

The route sits under `/dashboard`, so the layout auth guard covers it, and
the page verifies the session again close to the content. It carries
`robots: { index: false, follow: false }`. It is not in navigation and it
is not linked from the dashboard, so it is reachable from a typed URL and
nothing else.

The page is a server component. It strips the answer key with
`withoutReadingAnswerKey` before the content crosses to the client
prototype, which is the same precaution every Listening route takes. No
API route, no server action, no service role, no Supabase write, no
migration.

The route runs in exam mode. It is listed in
`src/features/navigation/exam-mode-routes.ts`, so `AppShellFrame` renders
no sidebar, header, breadcrumb trail or footer on it, and
`ExamModeViewport` gives the frame a fixed, one window tall viewport with
document scrolling switched off.

That is a deliberate departure from the six Listening part routes, which
stay outside exam mode and keep their dashboard chrome and their preview
notices. A Reading part is a split screen with a scrolling passage on one
side and a scrolling question column on the other, and it cannot be judged
or used inside a dashboard content column. The ticket's visual
requirements ask for a locked exam surface with no sidebar and no internal
preview label, so this route has one.

Because the exam surface carries no preview label, the caveats are said
where a learner meets them. The part intro screen's notice states that
answers are held on the screen only, nothing is saved, and no score is
produced. The completion screen repeats it.

---

## 2. Source content used

Primary source: `mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`, the
block headed `Part 1: Reading Correspondence`.

Cross checked against:

- `mock-tests/mock-test-1/extracted-content-outline.md` for the part shape
- `mock-tests/mock-test-1/extracted-links.md`, which lists no asset for
  this part
- `docs/product/mock-test-1-content-map.md` for the part summary and the
  answer key table
- `docs/product/celpip-exam-rules-research.md` sections 3, 10 and 11 for
  the structure and the timing
- `docs/product/admin-mock-test-builder-blueprint.md` sections 5 and 6 for
  the part type and question type names

The part has no assets of any kind. It is all text, so nothing was
downloaded, nothing is re-hosted, and no image is referenced. No official
screenshot is embedded anywhere in the UI and no official CELPIP branding
is copied.

Content lives in one place:

```
src/features/exam-engine/mock-tests/mock-test-1/reading-part-1.ts
```

The passage, the reply, the eleven questions and their forty-four options
are the source document's own wording. Nothing was invented and nothing
was paraphrased.

### Deliberate text changes, and why

Five, all of them character level or layout level. None changes what a
sentence says.

| Source | What the file holds | Why |
| --- | --- | --- |
| Curly apostrophes and curly quotation marks | Straight ones | House style, and what the Listening content files already do |
| `I'm not a nature guy` followed by an em dash, then `a fact which` | `I'm not a nature guy - a fact which` | House style forbids em dashes. This is the only character in the passage that is not the document's own |
| `you are right, 10. _______ .` | The blank, then `. However,` with no space before the stop | The space is an artefact of the underscores being typed inline. The sentence closes normally once the blank is filled |
| Underscore runs after each stem, and inside the reply | Not stored | The blank is drawn by the screen. Their length varies between items in the document anyway |
| Two author notes, `(the passage will come here on the left side of the screen)` and `And question will appear on the right side of the screen` | Not in the file | Instructions to us, not learner facing copy. What they describe is the layout the split screen implements |

Two source inconsistencies are kept rather than corrected. Question 1
option c reads `no longer live in Vancouver` and question 5 option b reads
`ran out of all their food and water`, both without the full stop the
other options in their group carry. Option text is source text, and
silently correcting punctuation is how a transcription starts to drift.

### Instruction bullets

The source document gives Reading Part 1 no instruction bullets of its
own. It has Reading Test instructions, which belong to the Reading
instructions screen and are not built in this ticket, and then two
instruction lines that sit directly above the content they govern.

Those two lines are carried on the question groups, as the source wrote
them, minus the empty `( )` drop-down glyph that follows the phrase
"drop-down menu" in the document:

- "Using the drop-down menu, choose the best option according to the
  information given in the message."
- "Here is a response to the message. Complete the response by filling in
  the blanks. Select the best choice for each blank from the drop-down
  menu."

The three bullets on the intro screen are written for this prototype
rather than copied from anywhere. They say what the screen does: what the
learner is given, how many questions there are, and how they are answered.
Nothing there promises official test behaviour the screen does not have.

---

## 3. Passage structure

Screen type 8 in `docs/product/exam-engine-screen-types.md`: two
independently scrolling columns, passage left and questions right. That is
also what the source document's author notes ask for and what
`docs/product/celpip-exam-rules-research.md` section 10 records as the
shared Reading layout rule.

Left column, the message:

- instruction line, "Read the following message."
- salutation, "Dear Scott,"
- four paragraphs, a personal letter from Jim to Scott about a hiking trip
  in Algonquin Park
- sign off, "Cheers," and "Jim" on their own lines

Right column, two panels:

1. Questions 1 to 6, with the source instruction line above them. Each is
   an incomplete sentence with a drop-down under it.
2. Questions 7 to 11, with the source instruction line above them, then
   the reply from Scott, then the five drop-downs. The reply is a letter
   with five numbered blanks in it, headed "Dear Jim," and closed with
   "Take care," and "Scott".

The reply echoes an answered blank back into its own text. Once a learner
chooses an option for question 7, the reply reads "I've been wondering
what my 7. best employee has been up to" rather than keeping the
underscores. That is what makes a completion group readable as a letter
and lets a learner check a choice against the sentence it lands in.

The controls stay in the list below the reply rather than sitting inside
the sentence. Option text here runs to several words, so a select inside
the sentence would push the rest of the paragraph around every time the
value changed. That is the same decision `ListeningDropdownQuestionList`
made, for the same reason.

Passage and reply are held as structured data rather than as HTML or as
one string with markers in it. A paragraph of the reply is a run of text
and blank segments, so nothing has to parse a sentence at render time and
a blank can point at its question by id.

---

## 4. Question count

11 questions.

- Questions 1 to 6: about the message
- Questions 7 to 11: blanks inside the response

This matches all three sources: the source document, the content map, and
the official structure table in
`docs/product/celpip-exam-rules-research.md` section 3, which gives
Reading Part 1 as 11 questions.

Each question has exactly four options. 44 options in total.

---

## 5. Question types used

One control on the screen: a drop-down with four options and a
"Select answer" placeholder.

Mapped onto the names the engine documents already use:

| Questions | Screen types doc | Builder blueprint |
| --- | --- | --- |
| 1 to 6 | `dropdown_blank`, a stem with a blank at the end | `reading_correspondence_choice` |
| 7 to 11 | `dropdown_blank`, a blank inside the response text | `reading_correspondence_choice` |

Both are one type in the code. `ReadingQuestion` covers them with one
optional field: a stem question sets `textBefore`, and a blank inside the
reply does not, because its sentence is in the reply rather than in the
question. They are marked identically, they sit in one answer map, and a
discriminator between them would change one line of layout and nothing
else.

No radio groups, no free text, no shared option set. Reading Part 3 is the
part that needs a shared A to E option set, and it is not built.

---

## 6. Timer behaviour

The part runs one window, 11 minutes, 660 seconds.

The number lives on the content object as `ReadingPartTimer`, not in a
timing module:

```
timer: {
  seconds: 660,
  warningAtSeconds: 60,
  urgentAtSeconds: 20,
  source: "published",
  note: "11 minutes, published per part in the official Reading Overview
         PDF. The Mock Test 1 content map reads 10 minutes off a
         screenshot; the published table is preferred.",
}
```

Reading is timed per part in every source we hold.
`docs/product/celpip-exam-rules-research.md` section 11 records that no
source gives Reading a per-question timer, and that the published figures
are per-part allowances. That is why the window sits on the part rather
than on a screen, and why the shape is one field per part rather than the
per-screen table `listening-timing.ts` needs.

**One conflict, recorded rather than resolved silently.**
`docs/product/celpip-exam-rules-research.md` sections 3 and 10 give
Reading Part 1 as 11 minutes, from the official Reading Overview PDF.
`docs/product/mock-test-1-content-map.md` gives 10 minutes, read off an
official screenshot. The published table wins here, because it is the only
source that gives a figure for every Reading part in one consistent unit,
which is the rule section 17.2 of the research document sets for exactly
this kind of disagreement. The difference is one minute. It should be
confirmed before Reading timing is enforced anywhere.

`source: "published"` is therefore honest about the 11 minutes and the
note carries the disagreement. This is not a placeholder duration: the
ticket allowed one, and the research document turned out to have a
published figure, so the placeholder was not needed.

What the timer does:

- counts down live, using the shared `ExamCountdownTimer` from EXAM-15D
- turns amber with 60 seconds left and red with 20 seconds left, the long
  window thresholds `listening-timing.ts` uses, rather than the 10 and 5
  seconds that suit a 30 second question
- is keyed to the flow screen id, so none of the 11 selections made on the
  screen restarts it
- reads "Time is up" at zero, and stops

What it does not do, which is what the ticket asks for:

- **no auto-submit.** The screen passes no `onTimeExpire` handler at all.
- **no advance.** The screen stays put at zero.
- **no answer is cleared.** Every selection survives the window closing,
  and the learner can keep answering and press Next.

A Reading section flow that has to move a learner on will pass an
`onTimeExpire` handler. The screen already accepts one.

---

## 7. Answer state strategy

Answers are `{ questionId: selectedOptionId }`, held in local React state
on `ReadingPartOnePrototype` and nowhere else.

- one answer per question, because the control is a single select
- the map is keyed by question id, not by screen position or by group, so
  an answer survives moving between screens
- the prototype stays mounted across the whole part, so going back to the
  split screen from the completion screen shows every option still
  selected
- Restart clears the map and returns to the first screen
- a page reload starts the part again

Nothing is written to a database, to `localStorage`, or to a cookie.
Nothing is sent to a server: there is no server action beside the route,
because nothing is marked yet.

Next on the split screen is disabled until all 11 questions have an
answer, and the count under the question column says how many are
outstanding. The screen already accepts `requireAllAnswered={false}` for a
section flow that has to let a learner leave a question blank and take the
zero, which is what the full Listening route does.

> Superseded by EXAM-17. That gate was wrong and was removed: a learner
> who cannot answer a question was trapped on the last working screen of
> the part with no way to finish it. Next is no longer gated on the
> answers at all, and `allAnswered`, `requireAllAnswered` and
> `areAllReadingQuestionsAnswered` no longer exist. See section 5 of
> docs/product/reading-part-1-review-score.md.

---

## 8. Answer key status

**Present, complete, and confirmed. Not exposed to the client.**

The source document prints Reading answer keys as text, in four tables
under "Answers & Explanations". Reading needed no transcription from
screenshots, which is the difference between this key and the six
Listening keys.

All 11 answers are stored in `reading-part-1.ts` as `ANSWER_KEY`, one
`ReadingAnswerKeyEntry` per question, each with `source: "document"`:

| Q | Correct option |
| --- | --- |
| 1 | recently moved to Vancouver. |
| 2 | it is something Kelly enjoys. |
| 3 | answer a question about his anniversary. |
| 4 | did not turn out as they had planned. |
| 5 | went running into the woods after Sparky. |
| 6 | found shelter before it got dark out. |
| 7 | best employee |
| 8 | have a great time |
| 9 | scary |
| 10 | it was challenging at first |
| 11 | lost in the woods |

Every value was matched to an existing option by wording. No option text
was changed to make a key fit, and nothing was guessed. Each entry carries
the option text in a trailing comment, so a later edit to an option cannot
quietly move an answer.

The source gives no explanations for Reading, only the answers, so
`explanation` is unset throughout.

**How it is kept off the client.** `withoutReadingAnswerKey` in
`reading-flow.ts` removes both the part level `answerKey` and any per
question `correctOptionId`, and the route calls it on the server before
the content reaches the client component. A client component receives its
props as serialized data, so a key handed down whole would be readable by
anyone who opens the network panel.

That is not a substitute for marking on the server. EXAM-17 must read the
key beside the content, in a server action, and send back finished review
rows rather than the key itself. Nothing marks anything in EXAM-16.

---

## 9. Visual layout

The completed Listening exam shell, reused rather than reinvented:

- `ExamModeViewport`, fixed and one window tall, document scrolling off
- `ExamShell`, so the top bar, the canvas and the bottom bar are the same
  chrome every other exam screen uses
- fixed top bar carrying the title, the live countdown and Next
- fixed bottom bar carrying Back
- neutral exam background and the flat exam neutral gutter, no orange and
  no marketing surface
- no dashboard sidebar, header, breadcrumb trail or footer
- no internal preview label anywhere on the exam surface
- no official CELPIP branding

The split screen itself:

- the canvas is unpadded and the split draws no outer rule of its own, so
  the canvas border is the only rule around the work area and the divider
  runs the full height between the two columns
- passage left on plain white, questions right on the light blue answer
  wash, which is the reference layout's read side and answer side
- each column scrolls on its own, capped at the shared `tall` step, so a
  long passage never pushes the questions off the screen and neither
  column can make the page scroll sideways
- the middle area is stable: nothing outside the two columns scrolls
- below the `lg` breakpoint the columns stack, the divider turns
  horizontal, and both scroll limits still apply

Passage prose runs at `leading-6` rather than the `leading-5` the rest of
the exam canvas uses. A Listening screen prints a sentence at a time and a
Reading screen prints four paragraphs of a letter, and a passage set at
question density is a passage nobody wants to read.

The question boxes are the same boxed completion blocks the second EXAM-15F
QA pass settled on for Listening Parts 4 to 6: a bordered item, a tinted
header strip carrying the number and the statement, and the select in the
body under it. Reading and Listening answer the same kind of question here,
so they look like one screen type.

**One layout decision worth knowing about.** Both columns scroll at a fixed
height rather than filling whatever the window has left. A height that
tracks the viewport reads better on a large monitor, but it depends on
every ancestor between the column and the exam frame having a definite
height, and the frame is rendered both inside the locked exam viewport and,
on the Listening part routes, inside an ordinary page. The fixed limit
behaves identically in both. If EXAM-17 or `READING-FULL` wants full height
columns, the change belongs in `ExamCanvas`, which is the element that
would have to become a flex column, and it should be made once for every
exam screen rather than only for Reading.

---

## 10. What is intentionally not built

- no Reading answer review screen
- no Reading score screen
- no Reading band estimate
- no correct answers shown anywhere in the UI
- no marking, and no server action beside the route
- Reading Part 2, Part 3 and Part 4
- the full Reading section flow
- the Reading Test instructions screen and the Reading instructional video
  screen
- no auto-submit and no auto-advance when the window closes
- no database save, no attempt history, no `localStorage`, no cookie
- no Supabase migration and no change to any Supabase helper
- no admin panel and no authoring UI
- no dashboard card, no navigation entry, and no change to the existing
  Mock Test 1 Listening card
- no full Mock Test 1 all-skills flow
- no change to Listening, Writing or Speaking behaviour
- no new dependency

---

## 11. How EXAM-17 should continue

1. **Add the closing screens behind an ending option.** `buildReadingFlow`
   takes no options today because there is one legal ending. Add
   `{ ending: "review" | "complete" }` and default it to `"review"`, the
   way `buildListeningViewpointsFlow` grew from EXAM-13 to EXAM-14, so a
   Reading part built before its review exists can still ship. The
   `answer-review`, `score` and `part-end` kinds go into `ReadingScreen`
   at the same time.
2. **Mark on the server.** Add `actions.ts` beside the route, next to the
   key, following `markListeningPartSix`. The browser sends its answer
   map, the action reads `ANSWER_KEY` from `reading-part-1.ts`, and only
   finished review rows and a summary come back. The key must never cross
   to the browser in either direction, and
   `withoutReadingAnswerKey` must stay in the route.
3. **Reuse the review components if they fit.**
   `ListeningAnswerReviewTable` and `ListeningScoreSummaryCard` are close
   to what Reading needs, but their types are named for Listening. Decide
   deliberately: either generalise the review types out of
   `listening-review-types.ts` into a shared module, or write Reading
   equivalents. Do not import a Listening type into a Reading screen and
   leave it.
4. **Print the question in the review row.** Reading prints all of its
   questions, so every row can carry its stem. For questions 7 to 11 the
   stem is a blank inside the reply, so the row needs the surrounding
   sentence or the row will read as a number beside a fragment. This is
   the same problem EXAM-10 solved for the Listening dropdown parts.
5. **Confirm the 11 minute figure**, and settle the disagreement with the
   content map's 10 minutes, before any Reading timing is enforced.
   `docs/product/celpip-exam-rules-research.md` section 17.4 also asks
   whether Reading follows the Listening navigation model at all, which
   has to be answered before a Reading window is allowed to advance a
   learner.
6. **Do not build Parts 2 to 4 in EXAM-17.** `ReadingTwoColumnLayout`,
   `ReadingQuestionPanel` and `ReadingQuestionList` were written to carry
   them, and Part 2's diagram is a matter of passing an image as the left
   column, but the review is the next question to answer.

---

## Files added

Content, types, flow and copy:

```
src/features/exam-engine/reading-types.ts
src/features/exam-engine/reading-flow.ts
src/features/exam-engine/reading-copy.ts
src/features/exam-engine/mock-tests/mock-test-1/reading-part-1.ts
```

Components:

```
src/components/exam/reading/ReadingPartOnePrototype.tsx
src/components/exam/reading/ReadingPartIntroScreen.tsx
src/components/exam/reading/ReadingCorrespondenceScreen.tsx
src/components/exam/reading/ReadingQuestionPanel.tsx
src/components/exam/reading/ReadingQuestionList.tsx
src/components/exam/reading/ReadingTwoColumnLayout.tsx
src/components/exam/reading/ReadingPartCompleteScreen.tsx
```

Route:

```
src/app/dashboard/mock-tests/mock-test-1/reading/part-1/page.tsx
```

## Files changed

```
src/features/exam-engine/exam-theme.ts
src/features/navigation/exam-mode-routes.ts
```

`exam-theme.ts` gains two token blocks, `examReading` and
`examReadingQuestion`. Both are new exports; nothing existing was edited,
so no Listening screen changes.

`exam-mode-routes.ts` gains the Reading Part 1 route in
`EXAM_MODE_ROUTES`, and the comment above the list explains why a Reading
part route is in exam mode where the Listening part routes are not. The
Listening entry is untouched.
