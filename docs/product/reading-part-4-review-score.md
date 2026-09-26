# Reading Part 4 review and score (EXAM-23)

Mock Test 1, Reading Part 4, Reading for Viewpoints. Server side answer
marking, a practice score screen, and a question by question answer
review.

This continues EXAM-22, which built the part itself and is written up in
`docs/product/reading-part-4-prototype.md`. Nothing in that document is
contradicted here: the five paragraph article, the five sentence stems,
the reader comment with its five numbered blanks, the 10 questions and
the 13 minute timer are exactly as EXAM-22 left them. The answer key is
unchanged too, and no mismatch against the source document was found
while wiring the marking up. See section 3 for how it was re-checked.

The shape of this ticket is the shape of EXAM-17, EXAM-19 and EXAM-21,
which did the same job for Reading Parts 1, 2 and 3. Where the four parts
agree, this document says so and points at
`docs/product/reading-part-1-review-score.md`,
`docs/product/reading-part-2-review-score.md` and
`docs/product/reading-part-3-review-score.md` rather than repeating the
reasoning at length. Where Part 4 differs, it says why.

The short version of the difference: Part 4 is the first Reading part
whose two answer panels are shaped differently from each other.
Questions 1 to 5 are sentence stems that carry their own text, the way
Part 1's first group does. Questions 6 to 10 are numbered blanks inside
the reader comment and carry no stem at all, the way Part 2's first group
does. Both shapes were already handled by the shared marking helpers, so
the only new thing this part needed was one line of copy naming the body
of text its blanks sit in. Every marking helper was reused untouched.

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route updated

```
/dashboard/mock-tests/mock-test-1/reading/part-4
```

Source file: `src/app/dashboard/mock-tests/mock-test-1/reading/part-4/page.tsx`

The URL is unchanged. The page is still a server component, still sits
under `/dashboard` where the layout auth guard covers it, still verifies
the session again close to the content, and still carries
`robots: { index: false, follow: false }`. It is still not in navigation,
and its only link is the Internal preview card EXAM-22 added to the Mock
tests section of the dashboard.

Two things changed on the page:

- it imports `markReadingPartFour` from the new `actions.ts` beside it
  and passes it to the prototype as `markAnswers`
- its file comment now describes a four screen route rather than a three
  screen one

Everything else on it is as EXAM-22 left it. In particular
`withoutReadingAnswerKey(readingPart4)` is still the last thing that
happens to the content before it crosses to the client component, and the
route still runs in exam mode through `ExamModeViewport`, so the
dashboard sidebar, header, breadcrumb trail and footer are absent and
document scrolling is switched off.

The flow the route now renders is four screens rather than three:

1. part intro
2. the viewpoints split screen, the website article on the left and both
   question panels on the right
3. the practice score
4. the answer review, opened from the score

The completion screen EXAM-22 closed on is no longer in this route's
flow. It is not deleted: `buildReadingFlow` can still be asked for it
with `{ ending: "complete" }`, and `ReadingPartFourPrototype` still has a
branch that renders it, because a component that renders a flow should
render every screen that flow can contain.

With this ticket all four Reading parts take the default ending, so no
caller asks for `{ ending: "complete" }` today. It stays anyway: the next
Reading part built ahead of a confirmed answer key needs it, and it costs
four lines in `buildReadingFlow`.

---

## 2. Server action created

New file: `src/app/dashboard/mock-tests/mock-test-1/reading/part-4/actions.ts`

```ts
export async function markReadingPartFour(
  answers: ReadingAnswerMap,
): Promise<ReadingMarkedPart | null>
```

Input is the answer map the prototype holds:

```ts
{ [questionId: string]: selectedOptionId }
```

Output is `ReadingMarkedPart`, which is the review rows and the score
summary counted from them:

```ts
{
  rows: ReadingReviewRow[];
  summary: {
    totalQuestions: number;
    answeredCount: number;
    correctCount: number;
    incorrectCount: number;
    blankCount: number;
    percentage: number;
  };
}
```

It returns `null` when there is no session. The route is behind the
dashboard auth guard, but a page level check does not extend to a server
action defined for it, so the caller is verified again inside the action
with `supabase.auth.getUser()`. That check is the only thing the Supabase
client is used for here. There is no read of any table, no write, no
attempt row, no service role call and no migration.

The action is three moving parts and nothing else:

1. `sanitizeAnswers` keeps only answers that name a real question in
   Part 4 and a real option on that question
2. `markReadingPart(readingPart4, ...)` from
   `src/features/exam-engine/reading-score.ts` does the marking
3. the result is returned as it stands

`readingPart4` is imported directly by the module rather than passed in,
so nothing the browser sends can influence which content, or which key,
an answer is marked against. The action is deterministic: the same
answers always produce the same result.

### The one option this action passes

`markReadingPartFour` passes a `ReadingReviewOptions` object, the way
`markReadingPartTwo` does and the Part 1 and Part 3 actions do not:

```ts
markReadingPart(readingPart4, sanitizeAnswers(answers), {
  blankQuestionText: readingReviewCopy.commentBlankQuestionText,
});
```

Part 4 is two panels answered differently from each other:

- Questions 1 to 5 are sentence stems about the article and carry their
  own `textBefore`, so `formatReadingQuestionText` prints the stem with
  three dots where the blank falls.
- Questions 6 to 10 are numbered blanks inside the reader comment and
  carry neither `text` nor `textBefore`, because the sentence each one
  completes is in the comment itself. There is no stem to print.

Without a line naming that comment, those five rows would fall through to
the Part 1 default and tell a learner their answer was a "Blank in the
written response.", which points at a body of text this part does not
have. `commentBlankQuestionText` is "Blank in the reader comment.", which
is the third such line beside `responseBlankQuestionText` for Part 1 and
`emailBlankQuestionText` for Part 2. It is copy, not logic: nothing about
the marking itself changed for this part.

Nothing invents a stem for those five questions. The source document does
not print one, and this codebase does not write question text.

### Sanitizing

A server action is reachable by direct POST, so the argument is untrusted
input even though the only caller is our own prototype. All four Reading
actions sanitize for the same reason.

`sanitizeAnswers` checks each submitted option id against the options of
the question it was sent for, not against every option in the part, so
one question's answer can never be credited to another. Anything
unrecognized is discarded rather than the whole submission being
rejected, so a stale answer left over from a content edit costs the
learner one row instead of the entire result. A discarded answer is
marked as a blank, which is the honest reading of "we cannot tell what
was chosen".

This is checked twice, independently. `buildReadingReviewRows` applies
the same test again when it builds the rows, so an unrecognized option id
would be treated as a blank even if it reached the marker.

---

## 3. Answer key handling

The key is confirmed and complete: ten entries covering questions 1 to
10, printed in the source document's "Answers & Explanations" block under
`PART04` and stored in `ANSWER_KEY` in
`src/features/exam-engine/mock-tests/mock-test-1/reading-part-4.ts`. Every
entry carries `source: "document"`.

Unlike the `PART03` table, which gives letters, the `PART04` table gives
the option text itself, so each entry was matched by finding the option
whose text is the one the table prints.

**No mismatch against the source document was found in this ticket.** The
key was re-checked entry by entry while the marking was wired up: the
`PART04` table was read out of
`mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx` and each of the ten
answer texts was compared against the text of the option the stored
`correctOptionId` names. All ten match exactly:

| Question | Stored option id | Source answer text |
| --- | --- | --- |
| 1 | `reading-part-4-q1-a` | strengthen economic ties. |
| 2 | `reading-part-4-q2-b` | increased opportunities for both parties. |
| 3 | `reading-part-4-q3-b` | a pointless proposition. |
| 4 | `reading-part-4-q4-a` | lead a different lifestyle than Canadians. |
| 5 | `reading-part-4-q5-a` | in favour of the proposal. |
| 6 | `reading-part-4-q6-c` | incorporate a group of sunny southern islands |
| 7 | `reading-part-4-q7-a` | Ewing remained largely silent on the matter |
| 8 | `reading-part-4-q8-c` | need an incentive from |
| 9 | `reading-part-4-q9-d` | tersely dismissive Conservative position |
| 10 | `reading-part-4-q10-c` | an unfeasible scheme |

The key is byte for byte what EXAM-22 shipped. Nothing was guessed and no
question or option was reworded to make a key fit.

The key never reaches the client question screen, and there are two
independent reasons it cannot:

**Stripped on the server before the content crosses the boundary.** The
route calls `withoutReadingAnswerKey(readingPart4)` from
`src/features/exam-engine/reading-flow.ts` and passes the result to
`ReadingPartFourPrototype`, which is a client component. That helper
removes both places a key can hide in a Reading part:

- `content.answerKey`, the part level list
- `question.correctOptionId`, the per question field

It rebuilds the question groups rather than mutating them, so the module
level content object is left exactly as it was and a second call cannot
find a part that has already been emptied. This helper needed no change
for Part 4: it was already written against `ReadingPartContent` rather
than against any one part, and it has covered Parts 1, 2, 3 and 4
identically since EXAM-22.

**Marked where the key lives.** `markReadingPartFour` runs on the server,
imports the unstripped content module itself, and returns finished review
rows. So the key is never serialized in either direction: not down with
the content, and not back up inside a result.

What the client question screen receives is the content object with the
key removed: the part title, the five article paragraphs, the three
instruction lines, the five sentence stems, the reader comment with its
blank segments, the ten questions, their four options each, the timer
window, and the chrome copy from `reading-copy.ts`. Nothing in that
payload says which option is correct for any question.

Correct answers first appear in the payload of the marking response, for
a part the learner has already finished, which is the point at which
showing them is fair.

---

## 4. Score calculation

`markReadingPart` in `src/features/exam-engine/reading-score.ts` does the
whole job, reused untouched from EXAM-17. It builds the review rows once
with `buildReadingReviewRows` and counts that same list with
`summarizeReadingReviewRows`, so the score and the review can never
disagree about a single question.

Reading Part 4 has 10 questions, so `totalQuestions` is 10.

The rules, all of them:

- **correct**: the selected option matches the key
- **incorrect**: it does not, and this includes every blank
- `incorrectCount` is `totalQuestions - correctCount`, so correct plus
  incorrect is always the whole part and the two numbers leave no gap a
  learner has to work out
- `answeredCount` is `totalQuestions - blankCount`
- `percentage` is `correctCount / totalQuestions`, rounded to a whole
  percent

Worked example, taken from an actual run of the marker. A learner answers
6 of the 10 questions and gets 4 of those 6 right:

```
totalQuestions  10
answeredCount    6
blankCount       4
correctCount     4
incorrectCount   6   (2 answered wrongly, plus 4 blanks)
percentage      40   (4 / 10)
```

The two ends of the range, also from real runs:

```
all ten correct   ->  answered 10, blank 0, correct 10, incorrect 0, 100%
nothing answered  ->  answered  0, blank 10, correct  0, incorrect 10,  0%
```

The percentage is of the whole part, not of what was attempted, which is
why a blank drags it down exactly as a wrong answer does.

A question with no usable answer key is never counted correct. Part 4
never reaches that branch: its key is complete and every entry names a
real option on a real question.

**There is no band estimate and no CELPIP level anywhere in this
ticket.** A CELPIP Reading band is a reading of the whole Reading
section, and this is one part of four. Nothing in the flow calculates
one, and no wording in `readingReviewCopy` could print one.

---

## 5. Blank answer handling

Blanks are allowed everywhere and block nothing.

- Nothing gates Next on the split screen. There is no
  `areAllReadingQuestionsAnswered` in `reading-flow.ts`, and the note
  where it used to be records why EXAM-17 removed it: a learner who
  cannot answer one question was otherwise trapped on the last screen of
  the part.
- A blank travels as a missing key in the answer map. The prototype only
  writes a key when a selection is made.
- `buildReadingReviewRows` gives a blank row `isBlank: true`,
  `isCorrect: false`, `selectedOptionId: null` and
  `selectedOptionText: null`.
- `summarizeReadingReviewRows` counts it in `blankCount` and in
  `incorrectCount`, and leaves it out of `answeredCount` and
  `correctCount`.
- The review card prints `readingReviewCopy.noAnswerText`, which is
  "No answer selected", in the quiet tone where the chosen option would
  be, and still prints the correct option beside it. That is the point of
  reviewing a blank.
- The status word on the card is "Blank", not "Incorrect", even though
  the score counted it as incorrect. The two facts are different: the
  count has to treat a blank as wrong for the percentage to mean
  anything, and the learner has to be told they left it empty rather than
  chose wrongly.
- `ReadingScoreSummaryCard` prints "Left blank" as one of its four
  counts, and carries a note saying in a sentence that blanks were
  counted as incorrect and that the correct answer for each is in the
  review.

An answer naming an option the question does not have is treated as a
blank, at both layers. `sanitizeAnswers` drops it before marking, and
`buildReadingReviewRows` checks again independently. This was exercised
with an option id belonging to a different question in the same part: the
row came back `isBlank: true` rather than being credited.

---

## 6. Review row structure

One `ReadingReviewRow` per question, in part order, built on the server
by `buildReadingReviewRows` in
`src/features/exam-engine/reading-review.ts`. The type is unchanged from
EXAM-17.

```ts
{
  questionId: string;
  questionNumber: number;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  correctOptionId: string | null;
  correctOptionText: string | null;
  isCorrect: boolean;
  isBlank: boolean;
  explanation: string | null;
}
```

Part 4 is the first Reading part that produces both row shapes in one
list, so both are shown.

A stem row, question 1, for a learner who chose the wrong option:

```ts
{
  questionId: "reading-part-4-q1",
  questionNumber: 1,
  questionText: "Ewing visited Ottawa to ...",
  selectedOptionId: "reading-part-4-q1-c",
  selectedOptionText: "study financial policies.",
  correctOptionId: "reading-part-4-q1-a",
  correctOptionText: "strengthen economic ties.",
  isCorrect: false,
  isBlank: false,
  explanation: null,
}
```

A comment blank row, question 6, left empty:

```ts
{
  questionId: "reading-part-4-q6",
  questionNumber: 6,
  questionText: "Blank in the reader comment.",
  selectedOptionId: null,
  selectedOptionText: null,
  correctOptionId: "reading-part-4-q6-c",
  correctOptionText: "incorporate a group of sunny southern islands",
  isCorrect: false,
  isBlank: true,
  explanation: null,
}
```

The ten `questionText` values the part actually produces:

```
 1  Ewing visited Ottawa to ...
 2  Arguments presented in favour of annexation suggest ...
 3  Janice Bloom believes that annexing Turks and Caicos is ...
 4  Inhabitants of Turks and Caicos ...
 5  The author of the article is ...
 6  Blank in the reader comment.
 7  Blank in the reader comment.
 8  Blank in the reader comment.
 9  Blank in the reader comment.
10  Blank in the reader comment.
```

Notes on the fields as this part fills them:

- `questionText` for questions 1 to 5 is the stem with three dots where
  the blank falls. Dots rather than the underscores the question screen
  draws: on the question screen the underscores mark where the control
  goes, and in the review the answer is printed beside the stem, so the
  same underscores would be noise.
- `questionText` for questions 6 to 10 is the line the marking action
  passes in. The five blanks are distinguished by their question number,
  which is the number printed in the comment on the question screen, so a
  learner can find the blank each row is about.
- `explanation` is `null` on every row. The source document publishes no
  Reading explanations. **Nothing invents one and no AI writes one.**
- Every row carries text as well as ids, so the review screen renders
  strings and looks nothing up. That is what lets the whole row be built
  on the server beside the answer key and sent down finished.
- Nulls rather than `undefined` throughout, so a row keeps every field it
  was born with once it has been serialized across the server boundary.

`resolveReadingReviewStatus` turns `isBlank` and `isCorrect` into the one
word the card prints: "Blank", "Correct" or "Incorrect". Blank is checked
first, because that fact is true whether or not a key exists and is the
more useful thing to tell the learner.

---

## 7. Visual layout

The neutral exam style from the completed Reading and Listening work,
unchanged. No orange, no marketing background, no dashboard sidebar
inside the exam route, and no official CELPIP branding anywhere.

Both new screens are the shared `ExamShell`: fixed top exam bar carrying
the part title and the screen position, fixed bottom navigation, and
internal scrolling only. `ExamModeViewport` keeps the frame one window
tall with document scrolling switched off, so a long review list scrolls
inside the canvas rather than moving the page.

**Score screen** (`ReadingPartFourScoreScreen.tsx`)

- Heading row: "Reading Part 4 practice score", with the subtitle "Your
  result for this part. Nothing has been saved."
- `ReadingScoreSummaryCard`, in the capped centre column the Listening
  closing screens use, so the card does not stretch across a full width
  canvas. The card prints the percentage and a sentence saying what it
  means, then the four counts, Total questions, Answered, Left blank and
  Correct, then the blank note and the practice result note.
- Three buttons: Review answers (primary), Restart Reading Part 4
  (secondary), Back to dashboard (secondary).
- A closing notice saying nothing from this run has been saved and that
  leaving or restarting clears the answers and the score.
- Next is hidden. Review answers is what moves the flow forward.

**Review screen** (`ReadingPartFourReviewScreen.tsx`)

- Heading row: "Reading Part 4 answer review", with the subtitle "Every
  question in this part, with the answer you chose and the correct
  answer."
- The same `ReadingScoreSummaryCard` repeated at the top, so the list has
  its total beside it.
- An ordered list of ten `ReadingReviewQuestionCard` items. Each is a
  bordered box with a tinted header carrying the question number, the
  question text, and the status word, and a body with "Your answer" and
  "Correct answer" side by side. The status word is coloured but is not a
  badge, so a column of ten stays readable.
- Back is relabelled "Back to score", because that is where it goes.
- A closing notice saying the review is held on this screen only, that no
  explanations are written for these answers, and that this is not an
  official CELPIP result.

**Marking screen.** Between the split screen and the score there is a
short in flight state, drawn by the prototype rather than by a screen
file: "Marking your answers", with a retry button and a plainer message
if the request failed. Back stays available in both states, so a learner
is never stuck, and the answers are still held either way.

**Wording.** Every result on both screens is named a Toronto Academy
practice score. The note under the percentage says in a full sentence
that it is not an official CELPIP score and that no CELPIP Reading level
is estimated from one part. There is no official score wording anywhere,
and no screen in this flow could print a band.

**Flow behaviour.** Marking is requested on the move onto the score
screen, tied to the click that caused it rather than to an effect. The
result is held in component state, so opening the review does not re-mark
and does not re-request. Going back to the questions, changing an answer
and finishing again re-marks. A request id guards against an older reply
landing after a newer one. Restart clears the answers and the result and
returns to the intro. Nothing reloads the page.

---

## 8. Dashboard link status

Unchanged in structure. The four Internal preview cards in the Mock tests
section of the dashboard are all still there, in
`src/components/dashboard/DashboardMockTestCard.tsx`:

| Card | Href | Status |
| --- | --- | --- |
| Mock Test 1 - Reading Part 1 | `/dashboard/mock-tests/mock-test-1/reading/part-1` | unchanged |
| Mock Test 1 - Reading Part 2 | `/dashboard/mock-tests/mock-test-1/reading/part-2` | unchanged |
| Mock Test 1 - Reading Part 3 | `/dashboard/mock-tests/mock-test-1/reading/part-3` | unchanged |
| Mock Test 1 - Reading Part 4 | `/dashboard/mock-tests/mock-test-1/reading/part-4` | description updated |

Each still carries the Internal preview badge, the dashed tinted panel
and the secondary button, so it reads as an internal build link rather
than as a released test.

One string changed. The Part 4 card's description said:

```
Reading for Viewpoints prototype with local answers. No review and no score yet.
```

It now says:

```
Reading for Viewpoints prototype with local answers and practice review.
```

The old line described what this ticket built, so leaving it would have
been the card telling a learner something untrue. The new line is the
same claim the Part 1, Part 2 and Part 3 cards make, and it still
mentions no score, no CELPIP level and no Reading band.

The student facing Mock Test 1 card is untouched and still offers
Listening only. The Listening card is untouched. **There is no full
Reading test card, and nothing anywhere offers a Reading section.**

---

## 9. What is intentionally not built

- **No full Reading section.** All four parts now exist as separate
  routes, each with its own marking. Nothing assembles them, there is no
  section flow, no section timer and no section score, and no route
  offers a Reading test.
- **No Reading band estimate.** No CELPIP Reading level is calculated or
  shown. A band needs the whole section marked in one pass, and this is
  one part of four.
- **No persisted attempt history.** Answers and the marked result live in
  React state in `ReadingPartFourPrototype` for the length of the visit.
  A reload starts the part again.
- **No database save.** Nothing is written to Supabase. No attempt row,
  no answer row, no score row.
- **No migration.** None was created and none is needed.
- **No localStorage and no cookie.** Nothing is saved anywhere in the
  browser either.
- **No AI explanations and no invented explanations.** `explanation` is
  `null` on all ten rows, because the source document publishes none.
- **No admin panel and no student analytics.**
- **No strict full Reading timer.** The part timer runs, reaches "Time is
  up", and stops. **Nothing auto-submits on expiry**: answers are
  preserved and the learner finishes the part by hand, which is what this
  prototype stage asks for.
- **No change to Listening**, to Reading Parts 1, 2 and 3 beyond a shared
  copy file, or to the Speaking and Writing AI flows.
- **No shared closing screen refactor.** See section 10.
- **No new dependency was installed.**

---

## 10. How EXAM-24 should continue

All four Reading parts are now built and marked. The part by part work is
finished, and what is left is the section.

### The refactor this ticket deliberately did not do

`docs/product/reading-part-3-review-score.md` named the moment: if Part 4
made it four near identical closing screen pairs, that is the point to
build `buildReadingReviewCopy` and one shared pair of screens, the way
EXAM-06 did for Listening once it had enough parts to justify it.

Part 4 has made it four. The refactor was still not done here, for one
reason: it means editing three live routes' components, and this ticket
was asked not to change Reading Parts 1 to 3 except to safely improve
shared components. Folding four working screens into one is not a safe
in passing improvement, it is its own change with its own regression
surface.

So it is the first thing EXAM-24 should weigh. The four pairs differ by
exactly two strings each, a score title and a review title:

```
ReadingPartOneScoreScreen    / ReadingPartOneReviewScreen
ReadingPartTwoScoreScreen    / ReadingPartTwoReviewScreen
ReadingPartThreeScoreScreen  / ReadingPartThreeReviewScreen
ReadingPartFourScoreScreen   / ReadingPartFourReviewScreen
```

Everything inside them is already shared: `ExamShell`,
`ExamInstructionRow`, `ExamButton`, `ReadingScoreSummaryCard` and
`ReadingReviewQuestionCard`. A shared pair would take the two titles and
the restart label as props, and `buildReadingReviewCopy(partLabel)` would
produce them. It should be done as its own change, with all four routes
walked through afterwards, and it is worth doing before the section flow
rather than after, so the section is built on one pair of screens instead
of four.

### The section, in the order it probably matters

1. **The assembled Reading section.** Four parts in one flow, with one
   entry point and one timer across them. `buildReadingFlow` builds one
   part; something above it has to build the four and carry the answers
   across. The Listening section flow in `listening-section-flow.ts` and
   `listening-section-score.ts` is the shape to follow rather than a
   second design. That is also what makes a Reading band possible, and
   until it exists no band should be shown anywhere.
2. **The Reading band estimate.** Only once the whole section is marked
   in one pass. It should follow the shape the Listening band already
   uses in `listening-band-score.ts`.
3. **Persistence.** No attempt is saved anywhere yet, for Reading or for
   Listening. When that lands it should land for both sections at once,
   with its own migration, rather than one part at a time.
4. **The strict Reading timer.** Nothing auto-submits on expiry in any
   Reading part. That is a section level decision, not a part level one,
   and it should be made once the section flow exists.
5. **The dashboard.** The four Internal preview cards go when the real
   Reading entry point ships, along with the strings behind them in
   `reading-copy.ts`. The student facing Mock Test 1 card still offers
   Listening only and should keep doing so until there is a Reading
   section to offer.

What is already waiting, and what a section should reuse rather than
re-grow:

- `withoutReadingAnswerKey`, `markReadingPart`, `buildReadingReviewRows`,
  `summarizeReadingReviewRows`, `ReadingReviewQuestionCard` and
  `ReadingScoreSummaryCard` are all part neutral and were reused
  untouched by this ticket. A section should mark part by part through
  `markReadingPart` and sum the summaries rather than writing a second
  marker.
- `ReadingReviewOptions.blankQuestionText` is how a part names its
  unstemmed blanks. Three parts now pass one or need one, and a section
  will have to carry the right line per part rather than one for the
  whole section.
- `buildReadingFlow`'s `{ ending: "complete" }` is still there for a part
  built ahead of its confirmed answer key. No caller asks for it today.

---

## Files added

```
src/app/dashboard/mock-tests/mock-test-1/reading/part-4/actions.ts
src/components/exam/reading/ReadingPartFourScoreScreen.tsx
src/components/exam/reading/ReadingPartFourReviewScreen.tsx
docs/product/reading-part-4-review-score.md
```

## Files changed

```
src/app/dashboard/mock-tests/mock-test-1/reading/part-4/page.tsx
src/components/exam/reading/ReadingPartFourPrototype.tsx
src/features/exam-engine/reading-copy.ts
src/features/exam-engine/reading-flow.ts
src/features/exam-engine/mock-tests/mock-test-1/reading-part-4.ts
```

`reading-flow.ts` and `reading-part-4.ts` changed in comments only. No
behaviour in either file is different, and the answer key is byte for
byte what EXAM-22 shipped.

`reading-copy.ts` gained three strings, `commentBlankQuestionText`,
`partFourScoreTitle` and `partFourReviewTitle`, and one existing string
changed, the Part 4 dashboard card description. No other section's copy
was touched.

`reading-types.ts`, `reading-score.ts` and `reading-review.ts` are
untouched. They were already part neutral, and Part 4 needed nothing
added to any of them, which is the clearest evidence that EXAM-17 and
EXAM-19 put the shared logic in the right place: the last of the four
Reading parts was marked without a line of new marking code.
