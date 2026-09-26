# Reading Part 2 review and score (EXAM-19)

Mock Test 1, Reading Part 2, Reading to Apply a Diagram. Server side
answer marking, a practice score screen, and a question by question
answer review.

This continues EXAM-18, which built the part itself and is written up in
`docs/product/reading-part-2-prototype.md`. Nothing in that document is
contradicted here: the brochure image, the email, the 8 questions, the
options and the 9 minute timer are exactly as EXAM-18 left them. The
answer key is unchanged too, and no mismatch against the source document
was found while wiring the marking up.

The shape of this ticket is the shape of EXAM-17, which did the same job
for Reading Part 1. Where the two parts agree, this document says so and
points at `docs/product/reading-part-1-review-score.md` rather than
repeating the reasoning at length. Where they differ, it says why.

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route updated

```
/dashboard/mock-tests/mock-test-1/reading/part-2
```

Source file: `src/app/dashboard/mock-tests/mock-test-1/reading/part-2/page.tsx`

The URL is unchanged. The page is still a server component, still sits
under `/dashboard` where the layout auth guard covers it, still verifies
the session again close to the content, and still carries
`robots: { index: false, follow: false }`. It is still not in navigation,
and its only link is the Internal preview card EXAM-18 added to the Mock
tests section of the dashboard.

Two things changed on the page:

- it imports `markReadingPartTwo` from the new `actions.ts` beside it
- it passes that action to the prototype as `markAnswers`

The content is still stripped with `withoutReadingAnswerKey` before it
crosses to the client component, exactly as before.

The prototype flow went from three screens to four:

| Screen | Kind | What it is |
| --- | --- | --- |
| 1 | `part-intro` | Instructions for the part |
| 2 | `diagram` | Split screen, brochure left, email and 8 questions right |
| 3 | `score` | Practice score for the part |
| 4 | `answer-review` | All 8 questions, chosen answer and correct answer |

EXAM-18 asked `buildReadingFlow` for the EXAM-16 ending by name, with
`{ ending: "complete" }`, because Part 2 had no score and no review to
end on. That option is dropped now, so Part 2 takes the default `"score"`
ending and the call is `buildReadingFlow(content, { taskScreen: "diagram" })`.
Part 2 now differs from Part 1 in one respect only: its working screen is
a diagram split rather than a correspondence split.

`{ ending: "complete" }` still exists on `buildReadingFlow` and still
returns the three screen flow. Nothing calls it now that both built parts
have keys, but a Reading part built before its answer key is confirmed
would need it, so it stays. The `part-complete` branch is kept in the
prototype for the same reason.

The score comes before the review, as in Part 1. A Reading part is
answered on one screen, so a learner pressing Next has just worked
through all 8 questions and wants the result; the review is what they
open from it, and the score screen makes Review answers the primary
action.

---

## 2. Server action created

New file: `src/app/dashboard/mock-tests/mock-test-1/reading/part-2/actions.ts`

```ts
export async function markReadingPartTwo(
  answers: ReadingAnswerMap,
): Promise<ReadingMarkedPart | null>
```

Input is the answer map the prototype holds in local React state:

```
{ [questionId: string]: selectedOptionId }
```

Output is `ReadingMarkedPart`, which is the review rows and the score
summary together:

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

It is the Reading Part 1 action pointed at Part 2 content, with three
things worth stating rather than assuming:

**It verifies the session.** The route is behind the dashboard auth
guard, but a page level check does not extend to a server action defined
for it, and a server action is reachable by direct POST. Reading Part 2
content is licensed Toronto Academy material and the correct answers are
part of the reply, so `supabase.auth.getUser()` is what stands between a
signed out request and the answer key. No session returns `null`, and the
prototype shows its marking failed state.

**It sanitizes its input.** `sanitizeAnswers` walks the questions of
`readingPart2` and keeps a submitted value only when it is a string that
names a real option on that question. Anything else is discarded, and a
discarded answer is then marked as a blank, which is the honest reading
of "we cannot tell what was chosen". Unrecognized keys cost one row
rather than the whole submission, so a stale answer left over from a
content edit does not throw away a finished attempt.

**It imports its content directly.** `readingPart2` is imported in this
module rather than passed in, so nothing the browser sends can influence
which key an answer is marked against.

The one difference from `markReadingPartOne` is the marking option it
passes, covered in section 6.

No database write, no Supabase migration, no attempt row, and no
persistence of any kind. The Supabase client is used for exactly one
thing: reading the caller's session. The action is deterministic and
local to the mock content, so the same answers always produce the same
result.

---

## 3. Answer key handling

The key is in the content module and it never crosses to the client
question screen. Three separate things keep it there:

**Stored on the server.** `ANSWER_KEY` in
`src/features/exam-engine/mock-tests/mock-test-1/reading-part-2.ts` holds
all 8 answers, each with `source: "document"`, transcribed from the
source document by EXAM-18. Part 2 carries no per question
`correctOptionId`; the whole key is the array.

**Stripped before rendering.** The route calls `withoutReadingAnswerKey`
before handing the content to the client component. That helper deletes
`answerKey` from the content object and deletes `correctOptionId` from
every question in every group. The prototype is a `"use client"`
component, so its props are serialized into the page payload, and content
handed over whole would put 8 answers into the flight data before the
learner had chosen anything.

**Compared where it lives.** The client cannot mark an attempt, because
the content it holds has no correct answers in it. `markReadingPartTwo`
runs on the server, reads the unstripped module, and returns finished
review rows.

So the key crosses the boundary in neither direction: not down with the
content, and not back up inside a result. The correct option for a
question appears exactly once, in a review row, after the learner has
finished the part.

The client question screen receives content, questions, options, the
timer and copy, and nothing else.

`withoutReadingAnswerKey` needed no change for Part 2. It was written
against `ReadingPartContent` rather than against Part 1, and both parts
are that shape, so one function already covers both.

---

## 4. Score calculation

The counting is the shared Reading marker, unchanged:
`markReadingPart` in `src/features/exam-engine/reading-score.ts`, over
rows built by `buildReadingReviewRows` in
`src/features/exam-engine/reading-review.ts`. There is no Part 2 copy of
any of it.

For each of the 8 questions, in the order `listReadingQuestions` returns
them:

- the correct option id is read from the key entry for that question, and
  is used only if the question actually has an option with that id
- the submitted answer is used only if it names an option the question
  actually has, otherwise the row is a blank
- `isCorrect` is `correctOptionId !== null && selectedOptionId === correctOptionId`

Then the summary is counted off the rows:

| Field | How it is counted |
| --- | --- |
| `totalQuestions` | number of rows, so 8 |
| `blankCount` | rows with `isBlank` |
| `answeredCount` | `totalQuestions - blankCount` |
| `correctCount` | rows with `isCorrect` |
| `incorrectCount` | `totalQuestions - correctCount` |
| `percentage` | `Math.round((correctCount / totalQuestions) * 100)` |

`incorrectCount` is counted from `correctCount` rather than from the
rows, which is what makes a blank count as incorrect without a special
case anywhere: a blank is not correct, so it lands in the remainder.

The score is out of 8, the Reading Part 2 question count. It is not out
of the Reading section, and it is not scaled, weighted or converted.

Wording, everywhere it appears: "Toronto Academy practice score". No
official CELPIP score wording, and no estimated CELPIP Reading level. The
score card carries the line already used by Part 1: "This is a Toronto
Academy practice score, not an official CELPIP score. No CELPIP Reading
level is estimated from one part."

---

## 5. Blank answer handling

Blanks are allowed and never block the finish. Nothing gates Next on the
question screen, so a learner can reach the score with any number of the
8 questions unanswered, including all of them.

A blank travels as a missing key in the answer map rather than as a
sentinel value, so an unanswered question is simply one the map does not
mention.

For a blank row:

| Field | Value |
| --- | --- |
| `selectedOptionId` | `null` |
| `selectedOptionText` | `null` |
| `isBlank` | `true` |
| `isCorrect` | `false` |
| `correctOptionId` | the correct option, still filled in |
| `correctOptionText` | the correct option text, still shown |

In the review, a blank row prints "No answer selected" where the chosen
answer would be, in the muted style, and still shows the correct answer
beneath it. Its status pill reads "Blank" rather than "Incorrect", so the
review distinguishes a wrong answer from no answer even though the score
does not.

In the score, a blank counts as incorrect. It is in `blankCount`, it is
outside `answeredCount`, it is inside `incorrectCount`, and it drags
`percentage` down exactly as a wrong answer does.

The score card explains this, but only when there is a blank to explain:
"Questions left blank are counted as incorrect in this score. The correct
answer for each of them is shown in the review." A learner who answered
everything is not told about a rule that did not affect them.

Worked example, the one from the ticket. 8 questions, 5 answered:

```
totalQuestions  8
answeredCount   5
blankCount      3
correctCount    however many of the 5 were right
incorrectCount  8 - correctCount, so the 3 blanks are in it
percentage      round(correctCount / 8 * 100)
```

---

## 6. Review row structure

One row per question, in question order, shaped by `ReadingReviewRow` in
`src/features/exam-engine/reading-types.ts`:

| Field | Type | What it is |
| --- | --- | --- |
| `questionId` | `string` | id from the content module |
| `questionNumber` | `number` | 1 to 8, the number shown to the learner |
| `questionText` | `string` | the stem, or the line described below |
| `selectedOptionId` | `string \| null` | null when blank |
| `selectedOptionText` | `string \| null` | null when blank |
| `correctOptionId` | `string \| null` | null only if the part had no usable key |
| `correctOptionText` | `string \| null` | as above |
| `isCorrect` | `boolean` | false for every blank |
| `isBlank` | `boolean` | true when no usable answer was submitted |
| `explanation` | `string \| null` | from the source, otherwise null |

**Explanations are always null for this part.** The Mock Test 1 source
document prints no explanations for Reading Part 2, so no key entry
carries one and no row does either. The review card renders the
explanation line only when a row has one, so nothing empty is drawn.
There are no AI written explanations in this flow and none is invented.

**Question text for the email blanks.** Questions 1 to 5 sit inside the
email on the right and print no stem of their own, so there is nothing to
put in `questionText` and nothing in the source to borrow. Part 1 has the
same problem for its reply blanks and answers it with the fixed line
"Blank in the written response." That line would point a Part 2 learner
at the wrong text, because Part 2's blanks are in an email message.

So `markReadingPart` gained one option, `blankQuestionText`, threaded
down to `formatReadingQuestionText`. It defaults to the Part 1 wording,
so Part 1 is unchanged and passes nothing. `markReadingPartTwo` passes
`readingReviewCopy.emailBlankQuestionText`, which reads "Blank in the
email message." Questions 6 to 8 are whole questions and print their own
stems, so they are unaffected.

That is the only extension made to the shared helpers. `reading-score.ts`
and `reading-review.ts` were reused rather than duplicated, and there is
no Part 2 copy of the marking, the counting or the row building.

---

## 7. Visual layout

The neutral exam style from the completed Reading and Listening work, on
the same exam mode route EXAM-18 set up. No orange or marketing
background, no dashboard sidebar, no header, no breadcrumb, no footer,
and no official CELPIP branding. `ExamModeViewport` keeps the frame one
window tall with document scrolling switched off, so all scrolling is
internal.

**Score screen**, `src/components/exam/reading/ReadingPartTwoScoreScreen.tsx`:

- fixed top exam bar with the part title and the screen position
- an instruction row heading "Reading Part 2 practice score"
- the score card, in the capped centre column the Listening closing
  screens use, so it does not stretch across a full width canvas
- the percentage as the headline, with "You answered N of 8 questions
  correctly." beneath it
- a four cell grid: total questions, answered, left blank, correct
- the blank note when there is a blank, and the practice score note
  always
- three buttons: Review answers as the primary, then Restart Reading
  Part 2, then Back to dashboard
- a closing notice that nothing was saved and that leaving or restarting
  clears the answers and the score
- no Next in the bottom bar, because the buttons are the way on

**Review screen**, `src/components/exam/reading/ReadingPartTwoReviewScreen.tsx`:

- the same fixed top bar
- an instruction row heading "Reading Part 2 answer review"
- the score card repeated, so the list has its total beside it
- all 8 questions as an ordered list of cards, each with its number, its
  question text, a Correct, Incorrect or Blank pill, the chosen answer
  and the correct answer
- a closing notice that the review is held on the screen only, that
  nothing is saved, that no explanations are written for these answers,
  and that this is not an official CELPIP result
- the bottom bar's Back is relabelled "Back to score"

The score card is `ReadingScoreSummaryCard` and each review row is
`ReadingReviewQuestionCard`, both reused from Reading Part 1 exactly as
they are. Both were already part neutral, so neither needed a change.
The two Part 2 screen files are the frames around them, and they differ
from the Part 1 frames by their titles alone. They are separate files
rather than one shared screen with the part name passed in because
sharing would have meant editing the working Part 1 route's components,
which this ticket asks us not to do without reason.

While marking is in flight, a plain screen stands in for the score and
says the answers are being checked. If the request fails, the same screen
says so and offers Try again. Back is available in both states, so a
learner is never stuck, and the answers are held throughout either way.

No score, no correct answer and no status appears anywhere before the
learner has finished the part.

---

## 8. Dashboard link status

Unchanged from EXAM-18, apart from one line of card text.

The Mock tests section of the dashboard still carries the two Internal
preview cards, one for Reading Part 1 and one for Reading Part 2, both
dressed as internal build links: dashed tinted panel, Internal preview
badge, secondary button. Both are kept.

The Reading Part 2 card's description said "Reading to Apply a Diagram
prototype with local answers. Review and score are added next." That is
no longer true, so it now reads "Reading to Apply a Diagram prototype
with local answers and practice review.", which is what the Part 1 card
says.

The Listening card is untouched. The student facing Mock Test 1 card is
untouched and still offers Listening only. No full Reading test card
exists, because there is no full Reading section to open.

---

## 9. What is intentionally not built

- **No Reading Part 3.** Not started.
- **No Reading Part 4.** Not started.
- **No full Reading section.** There is no section flow, no section
  timer and no screen that runs the four parts in order.
- **No Reading band estimate.** A CELPIP Reading level is a reading of
  the whole section, and this is one part of four, so there is nothing
  honest to estimate. It waits for the full Reading section.
- **No persisted attempt history.** The score exists in React state for
  the length of the visit. A reload starts the part again.
- **No database save.** No table, no insert, no attempt row.
- **No Supabase migration.** None created and none needed.
- **No localStorage and no cookie.** Answers are held in component state
  only.
- **No admin panel.** Nothing reads or reports these results.
- **No student analytics.** No aggregation across attempts or parts.
- **No strict full Reading timer.** The 9 minute part timer runs and
  reaches "Time is up", and nothing auto-submits. Answers are preserved
  and the learner finishes the part by hand, which is what this ticket
  asks for. Strict timing comes with the full section.
- **No AI explanations.** The review shows a chosen answer, a correct
  answer and a status. No explanation is written, and none is invented
  for a part whose source document has none.
- **No official CELPIP wording or branding.** The result is a Toronto
  Academy practice score everywhere it appears.
- **No change to Listening, Writing or Speaking.** None of those files
  was touched.

---

## 10. How EXAM-20 should continue

Reading Part 2 is now at the same point Reading Part 1 reached in
EXAM-17: content, a working screen, server side marking, a practice score
and an answer review, with nothing saved. Two parts of four are done and
they are done the same way, which is the useful part of this ticket for
whatever comes next.

**The pattern is settled, so Part 3 should be a repeat.** A new part
needs a content module with its answer key, a route that strips the key
with `withoutReadingAnswerKey`, an `actions.ts` calling `markReadingPart`
on the unstripped module, and a prototype driving `buildReadingFlow`. The
marking, the counting, the row building, the score card and the review
card are shared and should be reused as they are. Only a working screen
and a pair of screen titles were genuinely new here.

**Three files are worth watching for duplication.** The Part 1 and Part 2
score screens, and their review screens, now differ by their title alone.
Two of each is acceptable. A third would not be, and at that point they
should be collapsed into one screen taking its titles as props, with the
existing per part files kept as thin wrappers so no working route has to
change in the same ticket.

**The band estimate is the first thing that needs the section, not a
part.** Do not add one to a part screen. The Listening band work is the
model: it reads the whole section.

**Saving is still out.** When attempt history does arrive it should
arrive for Reading as a whole rather than per part, and it should be its
own ticket, because it is the first thing in this flow that needs a
migration.

**Auto-submit on timer expiry is still out.** Both Reading parts now
preserve answers and let the learner finish by hand. Whichever ticket
changes that should change both parts together, so the two do not drift.

---

## Files added

| File | What it is |
| --- | --- |
| `src/app/dashboard/mock-tests/mock-test-1/reading/part-2/actions.ts` | `markReadingPartTwo`, the server action |
| `src/components/exam/reading/ReadingPartTwoScoreScreen.tsx` | Practice score screen |
| `src/components/exam/reading/ReadingPartTwoReviewScreen.tsx` | Answer review screen |
| `docs/product/reading-part-2-review-score.md` | This document |

## Files changed

| File | What changed |
| --- | --- |
| `src/app/dashboard/mock-tests/mock-test-1/reading/part-2/page.tsx` | Imports the action and passes it as `markAnswers` |
| `src/components/exam/reading/ReadingPartTwoPrototype.tsx` | Marking state machine, score and review screens, default flow ending |
| `src/features/exam-engine/reading-types.ts` | Added `ReadingReviewOptions` |
| `src/features/exam-engine/reading-review.ts` | `blankQuestionText` option, defaulting to the Part 1 wording |
| `src/features/exam-engine/reading-score.ts` | Threads that option through `markReadingPart` |
| `src/features/exam-engine/reading-copy.ts` | Part 2 score and review titles, email blank line, dashboard card description |
| `src/features/exam-engine/reading-flow.ts` | Comments only, for the dropped `ending` option |
| `src/features/exam-engine/mock-tests/mock-test-1/reading-part-2.ts` | Comment only, naming the action that reads the key |

No file outside Reading was touched. No dependency was installed. No
migration was created.
