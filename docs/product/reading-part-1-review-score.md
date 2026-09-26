# Reading Part 1 review and score (EXAM-17)

Mock Test 1, Reading Part 1, Reading Correspondence. Server side answer
marking, a practice score screen, and a question by question answer
review.

This continues EXAM-16, which built the part itself and is written up in
`docs/product/reading-part-1-prototype.md`. Nothing in that document is
contradicted here: the passage, the questions, the options and the timer
are exactly as EXAM-16 left them.

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route updated

```
/dashboard/mock-tests/mock-test-1/reading/part-1
```

Source file: `src/app/dashboard/mock-tests/mock-test-1/reading/part-1/page.tsx`

The URL is unchanged. The page is still a server component, still sits
under `/dashboard` where the layout auth guard covers it, still verifies
the session again close to the content, and still carries
`robots: { index: false, follow: false }`. It is still not in navigation
and not linked from the dashboard card, so it is reachable from a typed
URL and nothing else.

Two things changed on the page:

- it imports `markReadingPartOne` from the new `actions.ts` beside it
- it passes that action to the prototype as `markAnswers`

The content is still stripped with `withoutReadingAnswerKey` before it
crosses to the client component, exactly as before.

The prototype flow went from three screens to four:

| Screen | Kind | What it is |
| --- | --- | --- |
| 1 | `part-intro` | Instructions for the part |
| 2 | `correspondence` | Split screen, message left, 11 questions right |
| 3 | `score` | Practice score for the part |
| 4 | `answer-review` | All 11 questions, chosen answer and correct answer |

The score comes before the review, which is the reverse of the Listening
order. A Reading part is answered on one screen, so a learner pressing
Next has just worked through all 11 questions and wants the result; the
review is what they open from it, and the score screen makes Review
answers the primary action.

`buildReadingFlow` gained an ending option rather than having its old
ending replaced. `{ ending: "complete" }` still returns the EXAM-16 three
screen flow ending on `ReadingPartCompleteScreen`, so a Reading part built
before its answer key is confirmed can still ship without pretending to a
score. `{ ending: "score" }` is the default and is what this route gets.

---

## 2. Server action created

```
src/app/dashboard/mock-tests/mock-test-1/reading/part-1/actions.ts
```

```ts
export async function markReadingPartOne(
  answers: ReadingAnswerMap,
): Promise<ReadingMarkedPart | null>
```

Input is the answer map the prototype holds:

```ts
{ [questionId: string]: selectedOptionId }
```

Output is `ReadingMarkedPart`:

```ts
{
  rows: ReadingReviewRow[];
  summary: ReadingScoreSummary;
}
```

It returns `null` when there is no session. The route is behind the
dashboard auth guard, but a page level check does not extend to a server
action defined for it, so the caller is verified again inside the action.
Reading Part 1 is licensed Toronto Academy content and the correct answers
are part of the reply, so that check is what stands between a signed out
request and the answer key.

The action is deterministic and local to the mock content. It imports
`readingPart1` directly, so nothing the browser sends can influence which
key an answer is marked against. It reads no database, writes no database,
creates no attempt row, and there is no migration. The Supabase client is
used for one thing: reading the caller's session.

Input is sanitized before marking. A server action is reachable by direct
POST, so the argument is untrusted even though the only caller is our own
prototype. `sanitizeAnswers` keeps only entries that name a real question
in the part and a real option on that question, and discards anything
else rather than rejecting the whole submission. A discarded answer is
marked as a blank, which is the honest reading of "we cannot tell what was
chosen".

---

## 3. Answer key handling

The rule is that the answer key never reaches the question screen, in
either direction.

Where the key lives:

- `src/features/exam-engine/mock-tests/mock-test-1/reading-part-1.ts`,
  as the module level `ANSWER_KEY` constant on `readingPart1.answerKey`

What strips it:

- `withoutReadingAnswerKey` in `src/features/exam-engine/reading-flow.ts`

It removes both places a key can hide in a Reading part:

- `content.answerKey`, the part level list
- `question.correctOptionId`, the per question field

The question groups are rebuilt rather than mutated, so the module level
content object is left intact and a second call cannot find a part that
has already been emptied. That behaviour is unchanged from EXAM-16; only
its comment was extended.

What the client receives from the route:

- test id, section id, titles, subtitle and summary
- instruction bullets and the passage instruction
- the passage: label, heading, paragraphs, sign off
- the question groups: labels, instructions, the response letter with its
  blanks, the questions and their options
- the part timer: seconds, warning and urgent thresholds, source, note
- copy, from `reading-copy.ts`, which contains no answers

What the client never receives:

- `answerKey`
- `correctOptionId` on any question

The client does see a correct option in one place and one place only:
inside the review rows the server sends back, after the learner has
finished the part. That is the point at which showing it is fair, and it
is a finished string rather than a key that could be read against the
question screen.

Verification during this ticket: the 11 entry key was checked again
against the "Answers & Explanations" PART01 table in
`mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`. All 11 match, in
order, by exact option wording. No mismatch was found and no key was
changed.

---

## 4. Score calculation

Helpers:

```
src/features/exam-engine/reading-review.ts   marking, one row per question
src/features/exam-engine/reading-score.ts    counts and the summary
```

`reading-review.ts` is the one place a Reading answer meets a Reading key.
`reading-score.ts` counts the rows that file produces rather than marking a
second time, so the score and the review cannot disagree about a single
question, and a rule change lands in one function instead of two.

Key resolution order per question, the same order Listening uses:

1. the `content.answerKey` entry for the question, when its
   `correctOptionId` is set
2. `question.correctOptionId`, for a part whose key is written question by
   question
3. nothing, which leaves `correctOptionId` null on the row

A key naming an option the question does not have is discarded and counts
as missing, because a stale id is a content bug and marking every learner
wrong over it would be the worst answer available. A question with no
usable key is never counted correct. Mock Test 1 Reading Part 1 never hits
that path: its key is complete and confirmed.

The summary:

```ts
type ReadingScoreSummary = {
  totalQuestions: number;   // 11
  answeredCount: number;    // questions with an option selected
  correctCount: number;     // selected option matched the key
  incorrectCount: number;   // everything not correct, blanks included
  blankCount: number;       // questions with nothing selected
  percentage: number;       // correct / total, whole percent
};
```

`correctCount + incorrectCount` is always the whole part, so the two
numbers leave no gap a learner has to work out. `blankCount` sits beside
them because "you got 8 of 11" and "you left 2 of them empty" are
different facts.

`percentage` is `Math.round((correctCount / totalQuestions) * 100)`. A part
with no questions scores zero rather than dividing by zero.

No band, no level, no official wording. The result is named a Toronto
Academy practice score everywhere it appears, and the note under it says
in a full sentence that it is not an official CELPIP score and that no
CELPIP Reading level is estimated from one part.

---

## 5. Blank answer handling

A blank is a question with no option selected, or one whose selected
option id does not name an option the question has.

Blank answers are allowed. A learner can leave any number of the 11
questions unanswered and still finish the part.

EXAM-16 did not allow that. `ReadingCorrespondenceScreen` took
`allAnswered` and `requireAllAnswered`, and held Next disabled until every
question had an answer, with "Answer every question to continue." printed
under the question column. A learner who could not answer one question was
stuck on the last working screen of the part with no way to reach a score,
and the whole point of a practice part is finding out what you got wrong.
EXAM-17 removed both props and the helper behind them,
`areAllReadingQuestionsAnswered` in `reading-flow.ts`, rather than
defaulting the gate off, so it cannot come back by a caller forgetting to
opt out.

What that means end to end:

- blank answers do not block Next or Finish. Nothing on the split screen
  disables Next, and the timer does not gate it either
- the count under the question column still reads "7 of 11 questions
  answered.", and while any question is outstanding it adds "You can
  continue with questions unanswered. Any question left blank is counted
  as incorrect." So leaving a blank is an informed choice, not an accident
- a blank travels as a missing key in the answer map. The map is
  `{ questionId: optionId }` and an unanswered question has no entry in
  it, so an attempt with 7 of 11 answered sends 7 keys and not 11
- `sanitizeAnswers` in the server action keeps only entries naming a real
  question and a real option on it, so a missing entry, an `undefined`
  value and an unrecognized id all arrive at the marking as the same
  thing: no answer
- `buildReadingReviewRows` builds one row per question in the content, not
  one per submitted answer, so the review shows all 11 rows whatever was
  sent
- blanks are counted as blank and as incorrect by the score

For an attempt answering 7 of 11 with 5 of those correct, the summary is
`totalQuestions: 11`, `answeredCount: 7`, `blankCount: 4`,
`correctCount: 5`, `incorrectCount: 6`, `percentage: 45`. The score is out
of 11 rather than out of 7, and the review has 11 rows.

For every blank:

- `isBlank` is `true`
- `isCorrect` is `false`
- `selectedOptionId` and `selectedOptionText` are `null`
- the review card prints "No answer selected" in the quiet tone
- the correct answer is still printed on the card, because that is the
  point of reviewing a blank
- the status word on the card is "Blank", in the quiet navy rather than
  the red an incorrect answer carries

In the score:

- blanks are counted in `incorrectCount`, so they drag the percentage down
  exactly as a wrong answer does
- they are also counted in `blankCount` and shown as their own reading on
  the score card
- when `blankCount` is above zero, the score card prints a sentence saying
  that questions left blank are counted as incorrect and that the correct
  answers are in the review. A learner who answered everything is not told
  about a rule that did not affect them.

---

## 6. Review row structure

```ts
type ReadingReviewRow = {
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
};
```

Notes on the fields:

- The row carries text as well as ids, so the review screen renders
  strings and never looks anything up in the content object. That is what
  lets the whole row be built on the server, beside the key, and sent down
  finished.
- Nulls rather than `undefined` throughout, so a row keeps every field it
  was born with once it has been serialized across the server boundary.
- `questionText` has two shapes, matching the two shapes of question in
  the part. Questions 1 to 6 print their stem with three dots where the
  blank falls, for example "Scott and his family ...". Questions 7 to 11
  print no stem of their own, because their sentence lives in the reply
  letter, so the row says "Blank in the written response." rather than
  inventing a stem the source does not have.
- `correctOptionId` is null only where a part has no usable key for the
  question. Reading Part 1 never reaches it, and the card would print
  "Answer key not available" if it did.
- `explanation` is null throughout Mock Test 1. The source document
  publishes no Reading explanations, and nothing invents one. There is no
  AI anywhere in this path.

Status is derived rather than stored, by `resolveReadingReviewStatus`:

| isBlank | isCorrect | Status |
| --- | --- | --- |
| true | false | `blank` |
| false | true | `correct` |
| false | false | `incorrect` |

---

## 7. Visual layout

The same neutral exam style as EXAM-16 and the completed Listening work.
No orange, no marketing background, no dashboard sidebar inside the exam
route, no official CELPIP branding, and no logo of any kind.

Both new screens sit in the standard `ExamShell`: fixed grey top bar,
white canvas in a grey gutter, fixed grey bottom bar, and internal
scrolling confined to the canvas. The exam route is in
`src/features/navigation/exam-mode-routes.ts`, so the dashboard chrome is
not rendered around it, and `ExamModeViewport` keeps the frame one window
tall with document scrolling off.

Score screen, `ReadingPartOneScoreScreen`:

- info row with "Reading Part 1 practice score"
- the summary card in the capped centre column the Listening closing
  screens use, so it does not stretch across a full width canvas
- the card: the percentage as the headline on the left, the sentence
  "You answered 9 of 11 questions correctly." on the right, a rule, then
  four readings across the card, Total questions, Answered, Left blank,
  Correct
- the blank note, when there is a blank to explain
- the practice result note
- three actions: Review answers, primary; Restart Reading Part 1; Back to
  dashboard
- a closing notice saying nothing has been saved
- no Next in the top bar, because this is a stopping point. Back in the
  bottom bar lands on the split screen with every answer still selected.

Review screen, `ReadingPartOneReviewScreen`:

- info row with "Reading Part 1 answer review"
- the same summary card repeated at the head, so the result the review
  explains is visible at the top of a long scroll. It is the same
  component, so the two screens cannot disagree about a number.
- 11 cards, one per question, in part order
- a closing notice saying nothing is saved, no explanations are written,
  and this is not an official CELPIP result
- Back in the bottom bar is labelled "Back to score". No Next, because
  this is the last screen in the part.

Review card, `ReadingReviewQuestionCard`:

- a bordered box with a tinted header strip, the same box the question
  screen draws, so a learner reviewing question 7 recognises the box they
  answered it in
- header: "Question 7", the question text, and the status word at the
  right, coloured but not a badge
- body: "Your answer" and "Correct answer" side by side from the small
  breakpoint up, stacked below it
- an explanation strip under the answers when the source gives one, which
  Mock Test 1 does not, so it draws nothing here

The review is a card list rather than a table, which is where it parts
company with the Listening review. A Listening row is a number and two
short options, so four columns fit. A Reading Part 1 row is a full
sentence stem plus two option texts that are themselves sentences, and 11
of those in a four column table would be a wall of wrapped prose with a
horizontal scrollbar under it. The card gives the question its own full
width line and puts the two answers underneath, so a long stem costs
height instead of legibility.

Class recipes for both live in `exam-theme.ts` as `examReadingScore`,
`examReadingReview` and `examReadingReviewStatusTones`, beside the
existing exam recipes. No component carries raw layout classes.

While the server is marking, a small standby screen holds the place of the
score, with a retry action if the check fails. Back still works from it,
so a failed check is never a dead end.

---

## 8. Timer behaviour

Unchanged from EXAM-16, deliberately.

- 11 minutes for the whole part, keyed to the flow screen id, so
  answering a question does not restart the window
- no `onTimeExpire` is passed, so nothing auto-submits and nothing
  advances
- at zero the reading becomes "Time is up" and the screen stays put with
  every answer still selected, and the learner finishes the part by hand
- the score and review screens carry no timer, because nothing is being
  timed on a screen with no task on it

Strict full Reading timing is a later ticket.

---

## 9. What is intentionally not built

- no Reading Part 2
- no Reading Part 3
- no Reading Part 4
- no full Reading section flow
- no Reading band estimate and no CELPIP Reading level
- no AI explanations and no invented explanations
- no persisted attempt history
- no database save, no attempt row, no Supabase migration
- no localStorage, no sessionStorage, no cookie
- no admin panel
- no student analytics
- no strict full Reading timer and no auto submit on expiry
- no change to Listening, Writing or Speaking
- no payment and no live classes
- no new dependencies

Nothing from a run survives leaving the page. A reload starts the part
again with an empty answer map and no score.

---

## 10. How EXAM-18 should continue

The pieces that are ready to be reused:

- `markReadingPart(content, answers)` in `reading-score.ts` takes any
  `ReadingPartContent`, not just Part 1. A second Reading part needs its
  own action file pointing at its own content module, and nothing else
  from this layer.
- `buildReadingReviewRows` handles both Reading question shapes already,
  stem questions and reply blanks, so a part built from either or both is
  covered.
- `buildReadingFlow` takes an ending, so a part can be shipped on the
  EXAM-16 completion screen while its key is being confirmed.

The pieces that will need work:

- `readingReviewCopy` is written out for Reading Part 1 rather than built
  from a part label. The moment a second Reading part reaches its own
  review, this becomes `buildReadingReviewCopy` and the Part 1 export
  becomes one call to it, which is exactly the move EXAM-06 made for
  Listening.
- The two closing screens are named for Part 1. Once a second part uses
  them they should take a copy object rather than reading
  `readingReviewCopy` directly, the same way the Listening closing screens
  take theirs.
- A Reading band estimate belongs to the full Reading section, not to a
  part. It should wait for all four parts and a section score, the way the
  Listening band waited for the section.
- Auto submit on timer expiry, and the strict Reading timing rules,
  belong with the section flow rather than with a single part.

---

## Files added

```
src/app/dashboard/mock-tests/mock-test-1/reading/part-1/actions.ts
src/features/exam-engine/reading-review.ts
src/features/exam-engine/reading-score.ts
src/components/exam/reading/ReadingPartOneReviewScreen.tsx
src/components/exam/reading/ReadingPartOneScoreScreen.tsx
src/components/exam/reading/ReadingReviewQuestionCard.tsx
src/components/exam/reading/ReadingScoreSummaryCard.tsx
docs/product/reading-part-1-review-score.md
```

## Files changed

```
src/app/dashboard/mock-tests/mock-test-1/reading/part-1/page.tsx
src/components/exam/reading/ReadingPartOnePrototype.tsx
src/features/exam-engine/exam-theme.ts
src/features/exam-engine/reading-copy.ts
src/features/exam-engine/reading-flow.ts
src/features/exam-engine/reading-types.ts
src/features/exam-engine/mock-tests/mock-test-1/reading-part-1.ts
src/components/exam/reading/ReadingCorrespondenceScreen.tsx
```

`ReadingCorrespondenceScreen.tsx` changed to remove the EXAM-16
all-questions-answered gate on Next, described in section 5. Its
`allAnswered` and `requireAllAnswered` props are gone, and the
`answerAllHint` string in `reading-copy.ts` was replaced by
`blanksAllowedHint`.

`reading-part-1.ts` changed by one comment only. No passage text, no
question, no option and no answer key entry was touched.
