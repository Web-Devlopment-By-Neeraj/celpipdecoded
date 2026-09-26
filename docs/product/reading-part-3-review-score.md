# Reading Part 3 review and score (EXAM-21)

Mock Test 1, Reading Part 3, Reading for Information. Server side answer
marking, a practice score screen, and a question by question answer
review.

This continues EXAM-20, which built the part itself and is written up in
`docs/product/reading-part-3-prototype.md`. Nothing in that document is
contradicted here: the four lettered paragraphs, the fixed fifth choice
E, the 9 statements, the shared A to E options and the timer are exactly
as EXAM-20 left them. The answer key is unchanged too, and no mismatch
against the source document was found while wiring the marking up.

The shape of this ticket is the shape of EXAM-17 and EXAM-19, which did
the same job for Reading Parts 1 and 2. Where the three parts agree, this
document says so and points at
`docs/product/reading-part-1-review-score.md` and
`docs/product/reading-part-2-review-score.md` rather than repeating the
reasoning at length. Where Part 3 differs, it says why.

The short version of the difference: Part 3 needed less new code than
either part before it. Its questions are whole statements rather than
sentence stems, so nothing had to be taught how to name a blank, and its
options are the same five letters on every question, so nothing had to
be taught about option sets. Every marking helper was reused untouched.

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route updated

```
/dashboard/mock-tests/mock-test-1/reading/part-3
```

Source file: `src/app/dashboard/mock-tests/mock-test-1/reading/part-3/page.tsx`

The URL is unchanged. The page is still a server component, still sits
under `/dashboard` where the layout auth guard covers it, still verifies
the session again close to the content, and still carries
`robots: { index: false, follow: false }`. It is still not in navigation,
and its only link is the Internal preview card EXAM-20 added to the Mock
tests section of the dashboard.

Two things changed on the page:

- it imports `markReadingPartThree` from the new `actions.ts` beside it
  and passes it to the prototype as `markAnswers`
- its file comment now describes a four screen route rather than a three
  screen one

Everything else on it is as EXAM-20 left it. In particular
`withoutReadingAnswerKey(readingPart3)` is still the last thing that
happens to the content before it crosses to the client component, and the
route still runs in exam mode through `ExamModeViewport`, so the
dashboard sidebar, header, breadcrumb trail and footer are absent and
document scrolling is switched off.

The flow the route now renders is four screens rather than three:

1. part intro
2. the information split screen, lettered paragraphs on the left and all
   9 statements on the right
3. the practice score
4. the answer review, opened from the score

The completion screen EXAM-20 closed on is no longer in this route's
flow. It is not deleted: `buildReadingFlow` can still be asked for it
with `{ ending: "complete" }`, and `ReadingPartThreePrototype` still has
a branch that renders it, because a component that renders a flow should
render every screen that flow can contain.

---

## 2. Server action created

New file: `src/app/dashboard/mock-tests/mock-test-1/reading/part-3/actions.ts`

```ts
export async function markReadingPartThree(
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
   Part 3 and a real option on that question
2. `markReadingPart(readingPart3, ...)` from
   `src/features/exam-engine/reading-score.ts` does the marking
3. the result is returned as it stands

`readingPart3` is imported directly by the module rather than passed in,
so nothing the browser sends can influence which content, or which key,
an answer is marked against. The action is deterministic: the same
answers always produce the same result.

### Why sanitizing matters a little more in this part

A server action is reachable by direct POST, so the argument is untrusted
input even though the only caller is our own prototype. Parts 1 and 2
sanitize for the same reason.

Part 3 has one wrinkle the earlier parts do not. Every statement is
answered from the same five letters, so the option ids across the part
are nine near identical sets: `reading-part-3-q1-c`,
`reading-part-3-q2-c`, and so on. An id that names paragraph C on the
wrong question is a shape a careless or hostile caller could easily
produce. `sanitizeAnswers` checks each submitted option id against the
options of the question it was sent for, not against the five labels, so
one question's answer can never be credited to another.

Anything unrecognized is discarded rather than the whole submission being
rejected, so a stale answer left over from a content edit costs the
learner one row instead of the entire result. A discarded answer is
marked as a blank, which is the honest reading of "we cannot tell what
was chosen".

### What this action does not pass

`markReadingPartTwo` passes a `ReadingReviewOptions` object naming the
body of text its unstemmed blanks sit in, because Part 2 questions 1 to 5
print no stem of their own. `markReadingPartThree` passes no options at
all.

All nine Part 3 questions are whole statements carrying their own `text`,
so `formatReadingQuestionText` prints the statement itself and never
falls through to the branch that names a blank. There was nothing for
Part 3 to configure.

---

## 3. Answer key handling

The key is confirmed and complete: nine letters, C D B E A E E A D,
printed in the source document's "Answers & Explanations" block and
stored in `ANSWER_KEY` in
`src/features/exam-engine/mock-tests/mock-test-1/reading-part-3.ts`. Every
entry carries `source: "document"`. Nothing was guessed and no statement
or option was reworded to make a key fit.

No mismatch against the source document was found in this ticket. The key
is unchanged from EXAM-20.

The key never reaches the client question screen, and there are two
independent reasons it cannot:

**Stripped on the server before the content crosses the boundary.** The
route calls `withoutReadingAnswerKey(readingPart3)` from
`src/features/exam-engine/reading-flow.ts` and passes the result to
`ReadingPartThreePrototype`, which is a client component. That helper
removes both places a key can hide in a Reading part:

- `content.answerKey`, the part level list
- `question.correctOptionId`, the per question field

It rebuilds the question groups rather than mutating them, so the module
level content object is left exactly as it was and a second call cannot
find a part that has already been emptied. This helper needed no change
for Part 3: it was already written against `ReadingPartContent` rather
than against any one part, and it has covered Parts 1, 2 and 3
identically since EXAM-20.

**Marked where the key lives.** `markReadingPartThree` runs on the
server, imports the unstripped content module itself, and returns
finished review rows. So the key is never serialized in either direction:
not down with the content, and not back up inside a result.

What the client question screen receives is the content object with the
key removed: the part title, the lettered paragraphs A to E, the
instruction lines, the nine statements, their A to E options, the timer
window, and the chrome copy from `reading-copy.ts`. Nothing in that
payload says which paragraph is correct for any statement.

Correct answers first appear in the payload of the marking response, for
a part the learner has already finished, which is the point at which
showing them is fair.

---

## 4. Score calculation

`markReadingPart` in `src/features/exam-engine/reading-score.ts` does the
whole job, reused untouched from EXAM-17. It builds the review rows once
with `buildReadingReviewRows` and counts that same list with
`summarizeReadingReviewRows`, so the score and the review can never
disagree about a single statement.

Reading Part 3 has 9 questions, so `totalQuestions` is 9.

The rules, all of them:

- **correct**: the selected option matches the key
- **incorrect**: it does not, and this includes every blank
- `incorrectCount` is `totalQuestions - correctCount`, so correct plus
  incorrect is always the whole part and the two numbers leave no gap a
  learner has to work out
- `answeredCount` is `totalQuestions - blankCount`
- `percentage` is `correctCount / totalQuestions`, rounded to a whole
  percent

Worked example. A learner answers 6 of the 9 statements and gets 4 of
those 6 right:

```
totalQuestions  9
answeredCount   6
blankCount      3
correctCount    4
incorrectCount  5   (2 answered wrongly, plus 3 blanks)
percentage      44  (4 / 9 rounded)
```

The percentage is of the whole part, not of what was attempted, which is
why a blank drags it down exactly as a wrong answer does.

A question with no usable answer key is never counted correct. Part 3
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
  cannot answer one statement was otherwise trapped on the last screen of
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
  be, and still prints the correct paragraph beside it. That is the point
  of reviewing a blank.
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
`buildReadingReviewRows` checks again independently.

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

A real Part 3 row, for a learner who answered statement 1 with paragraph
B when the key says C:

```ts
{
  questionId: "reading-part-3-q1",
  questionNumber: 1,
  questionText:
    "Government officials were afraid that someone would make unauthorized coins.",
  selectedOptionId: "reading-part-3-q1-b",
  selectedOptionText: "B",
  correctOptionId: "reading-part-3-q1-c",
  correctOptionText: "C",
  isCorrect: false,
  isBlank: false,
  explanation: null,
}
```

Notes on the fields as this part fills them:

- `questionText` is the statement itself. All nine Part 3 questions carry
  `text`, so `formatReadingQuestionText` returns it unchanged. Neither of
  the other two branches of that helper is reached here: there is no stem
  to print with dots where a blank falls, and no unstemmed blank to name.
- `selectedOptionText` and `correctOptionText` are single letters, A to
  E, because that is what the options are in this part. That is
  deliberate and needs no dressing up: the letters printed on the review
  card are exactly the letters the learner chose between on the question
  screen, and the paragraphs they name are on the left of that screen.
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

**Score screen** (`ReadingPartThreeScoreScreen.tsx`)

- Heading row: "Reading Part 3 practice score", with the subtitle "Your
  result for this part. Nothing has been saved."
- `ReadingScoreSummaryCard`, in the capped centre column the Listening
  closing screens use, so the card does not stretch across a full width
  canvas. The card prints the percentage and a sentence saying what it
  means, then the four counts, Total questions, Answered, Left blank and
  Correct, then the blank note and the practice result note.
- Three buttons: Review answers (primary), Restart Reading Part 3
  (secondary), Back to dashboard (secondary).
- A closing notice saying nothing from this run has been saved and that
  leaving or restarting clears the answers and the score.
- Next is hidden. Review answers is what moves the flow forward.

**Review screen** (`ReadingPartThreeReviewScreen.tsx`)

- Heading row: "Reading Part 3 answer review", with the subtitle "Every
  question in this part, with the answer you chose and the correct
  answer."
- The same `ReadingScoreSummaryCard` repeated at the top, so the list has
  its total beside it.
- An ordered list of nine `ReadingReviewQuestionCard` items. Each is a
  bordered box with a tinted header carrying the question number, the
  statement, and the status word, and a body with "Your answer" and
  "Correct answer" side by side. The status word is coloured but is not a
  badge, so a column of nine stays readable.
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

---

## 8. Dashboard link status

Unchanged in structure. The three Internal preview cards in the Mock
tests section of the dashboard are all still there, in
`src/components/dashboard/DashboardMockTestCard.tsx`:

| Card | Href | Status |
| --- | --- | --- |
| Mock Test 1 - Reading Part 1 | `/dashboard/mock-tests/mock-test-1/reading/part-1` | unchanged |
| Mock Test 1 - Reading Part 2 | `/dashboard/mock-tests/mock-test-1/reading/part-2` | unchanged |
| Mock Test 1 - Reading Part 3 | `/dashboard/mock-tests/mock-test-1/reading/part-3` | description updated |

Each still carries the Internal preview badge, the dashed tinted panel
and the secondary button, so it reads as an internal build link rather
than as a released test.

One string changed. The Part 3 card's description said:

```
Reading for Information prototype with local answers. No review or score yet.
```

It now says:

```
Reading for Information prototype with local answers and practice review.
```

The old line described what this ticket built, so leaving it would have
been the card telling a learner something untrue. The new line is the
same claim the Part 1 and Part 2 cards make, and it still mentions no
score, no CELPIP level and no Reading band.

The student facing Mock Test 1 card is untouched and still offers
Listening only. The Listening card is untouched. **There is no full
Reading test card, and nothing anywhere offers a Reading section.**

---

## 9. What is intentionally not built

- **No Reading Part 4.** Not started.
- **No full Reading section.** Three of the four parts exist as separate
  routes. Nothing assembles them, and no route offers a Reading test.
- **No Reading band estimate.** No CELPIP Reading level is calculated or
  shown. A band needs the whole section, and this is one part of four.
- **No persisted attempt history.** Answers and the marked result live in
  React state in `ReadingPartThreePrototype` for the length of the visit.
  A reload starts the part again.
- **No database save.** Nothing is written to Supabase. No attempt row,
  no answer row, no score row.
- **No migration.** None was created and none is needed.
- **No localStorage and no cookie.** Nothing is saved anywhere in the
  browser either.
- **No AI explanations and no invented explanations.** `explanation` is
  `null` on all nine rows, because the source document publishes none.
- **No admin panel and no student analytics.**
- **No strict full Reading timer.** The part timer runs, reaches "Time is
  up", and stops. **Nothing auto-submits on expiry**: answers are
  preserved and the learner finishes the part by hand, which is what this
  prototype stage asks for.
- **No change to Listening**, to Reading Parts 1 and 2 beyond a shared
  copy file, or to the Speaking and Writing AI flows.
- **No new dependency was installed.**

---

## 10. How EXAM-22 should continue

Reading Part 4 is the part left to build, and it should be built the way
Parts 1, 2 and 3 were: the prototype first, then the marking.

What is already waiting for it:

- `buildReadingFlow` takes a `taskScreen` option. Part 4 is a
  viewpoints style part with two panels on the answer side, so it will
  need a fourth value beside `correspondence`, `diagram` and
  `information`, and the flow shape itself should not need to change.
- The `{ ending: "complete" }` option is still there for a part built
  ahead of its confirmed answer key. Part 3 used it for exactly one
  ticket and no caller asks for it today.
- `withoutReadingAnswerKey`, `markReadingPart`,
  `buildReadingReviewRows`, `summarizeReadingReviewRows`,
  `ReadingReviewQuestionCard` and `ReadingScoreSummaryCard` are all part
  neutral and were reused untouched by this ticket. Part 4 should reuse
  them the same way rather than growing a fourth copy of anything.
- `ReadingReviewOptions.blankQuestionText` is how a part names its
  unstemmed blanks. Part 4 has a body of text with blanks in it, so it
  will want a line of its own beside
  `responseBlankQuestionText` and `emailBlankQuestionText`.

Three things this ticket deliberately left for later, in the order they
probably matter:

1. **The assembled Reading section.** Four parts in one flow, with one
   entry point and one timer across them. That is what makes a Reading
   band possible, and until it exists no band should be shown anywhere.
2. **The Reading band estimate.** Only once the whole section is marked
   in one pass. It should follow the shape the Listening band already
   uses in `listening-band-score.ts` rather than inventing a second one.
3. **Persistence.** No attempt is saved anywhere yet, for Reading or for
   Listening. When that lands it should land for both sections at once,
   with its own migration, rather than one part at a time.

The three closing screen pairs, Parts 1, 2 and 3, now differ from each
other by two strings each: a score title and a review title. That was a
deliberate call in EXAM-19 and it held for EXAM-21, because folding them
into one screen would mean editing live routes to add a new part. If Part
4 makes it four near identical pairs, that is the point to build
`buildReadingReviewCopy` and one shared pair of screens, which is the
move EXAM-06 made for Listening once it had enough parts to justify it.

---

## Files added

```
src/app/dashboard/mock-tests/mock-test-1/reading/part-3/actions.ts
src/components/exam/reading/ReadingPartThreeScoreScreen.tsx
src/components/exam/reading/ReadingPartThreeReviewScreen.tsx
docs/product/reading-part-3-review-score.md
```

## Files changed

```
src/app/dashboard/mock-tests/mock-test-1/reading/part-3/page.tsx
src/components/exam/reading/ReadingPartThreePrototype.tsx
src/features/exam-engine/reading-copy.ts
src/features/exam-engine/reading-flow.ts
src/features/exam-engine/mock-tests/mock-test-1/reading-part-3.ts
```

`reading-flow.ts` and `reading-part-3.ts` changed in comments only. No
behaviour in either file is different, and the answer key is byte for
byte what EXAM-20 shipped.

`reading-types.ts`, `reading-score.ts` and `reading-review.ts` are
untouched. They were already part neutral, and Part 3 needed nothing
added to any of them, which is the clearest evidence that EXAM-17 and
EXAM-19 put the shared logic in the right place.
