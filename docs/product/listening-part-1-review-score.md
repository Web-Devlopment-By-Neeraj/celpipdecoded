# Listening Part 1 answer review and practice score (EXAM-04)

Closes the local prototype cycle for Mock Test 1 Listening Part 1. It adds
the three screens that follow Question 8: the answer review, the practice
score, and the end of part screen.

Ticket: `docs/tickets/EXAM-04-listening-part-1-review-score.md`
Prototype: `docs/product/listening-part-1-prototype.md` (EXAM-03)
Shell: `docs/product/exam-engine-screen-shell.md` (EXAM-01)
Content map: `docs/product/mock-test-1-content-map.md`
Asset list: `mock-tests/mock-test-1/extracted-links.md`

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route updated

| Property | Value |
| --- | --- |
| Route | `/dashboard/mock-tests/mock-test-1/listening/part-1` |
| File | `src/app/dashboard/mock-tests/mock-test-1/listening/part-1/page.tsx` |
| Rendering | Server component, dynamic, unchanged |
| Auth | Behind the dashboard layout guard, and the page calls `getUser` again close to the content, unchanged |
| Indexing | `robots: { index: false, follow: false }`, unchanged |
| Status | Internal preview, not a student facing mock test entry |

No new route was created. The three screens are part of the same single
page client flow, so the whole part is still one route and one visit.

The only change to the page file is wording plus its own comments: the
standing notice now says that the answer review and the practice score run
on this page only, that the practice score is not an official CELPIP score,
and that it stays pending until the answer key is transcribed.

The dashboard internal preview link is unchanged and still marked
`Internal preview`.

## 2. Screens added

The flow grew from 16 screens to 18. Screens 1 to 15 are untouched.

| # | Screen | Component | Change |
| --- | --- | --- | --- |
| 15 | Question 8 | `ListeningQuestionScreen` | unchanged |
| 16 | Answer review | `ListeningAnswerReviewScreen` | new, replaces the old completion placeholder |
| 17 | Practice score | `ListeningScoreScreen` | new |
| 18 | End of Listening Part 1 | `ListeningPartEndScreen` | new |

The EXAM-03 completion screen is gone. It existed to say that the answer
review was coming and had a disabled `Continue to answer review` control on
it. The review now exists, so the placeholder had nothing left to do and
the review screen took its slot directly after Question 8.

### Answer review screen

- Heading `Listening Part 1 Answer Review`, subtitle
  `Review your answers before viewing the score.`
- A compact result table with one row per question, all 8 shown: question
  label, the option the learner selected, the correct option when it is
  known, and a status word.
- Status is one of `Correct`, `Incorrect`, `Unanswered`,
  `Answer key pending`.
- Collapsed reference panel holding the answer and explanation sheet, see
  section 5.
- Top bar action is labelled `View score`.
- Bottom bar `Back` returns to Question 8, which is the prototype testing
  affordance the ticket asks for.

### Practice score screen

- Heading `Listening Part 1 Score`, subtitle `Your practice result for
  this part.`
- Four readings: total questions, answered, correct, practice score.
- `Correct` and `Practice score` read `Pending` while the answer key is
  incomplete, plus a short block saying why and how many keys are missing.
- Note under the readings, in full: `This is a Toronto Academy practice
  result, not an official CELPIP score.`
- In canvas actions: `End Listening Part 1` and `Review answers`. There is
  no top bar Next, because this screen is a stopping point.
- Bottom bar `Back` is labelled `Review answers` and returns to the review.

### End of part screen

- Heading `End of Listening Part 1`, message `You have completed Listening
  Part 1 of Mock Test 1.`
- `Back to dashboard`, a real link to `/dashboard` so middle click and open
  in a new tab still work.
- `Restart Listening Part 1`, which clears the answers held on the page and
  returns to screen 1.
- Placeholder line: `Listening Part 2 will be added in the next ticket.` It
  is a sentence, not a disabled button, because there is nothing to press.

### Visual notes

- All three screens sit in the EXAM-01 shell: grey top bar, white canvas,
  grey bottom bar.
- The review table is result table chrome: hairline rules, a grey header
  row, tight rows, tabular question numbers, and a plain coloured status
  word. No badge, no pill, no dot.
- The score summary is a bordered strip on the canvas, not a dashboard
  card. No shadow and no artwork.
- The table scrolls inside its own wrapper on a narrow screen, so the exam
  frame never scrolls sideways.
- No dashboard card, badge or marketing component appears inside the exam
  canvas.

## 3. Answer key handling

The answer key lives in the centralized content object, in the shape the
ticket suggested:

```ts
answerKey: [
  { questionId: "listening-part-1-q1", correctOptionId: null, source: "answer-image" },
  // ...one entry per question
]
```

`correctOptionId` is `null`, not missing, on purpose. Null says the key was
looked for and is not transcribed yet, which is a different statement from
a question nobody has got to.

The scoring helpers resolve the correct option for a question in this
order:

1. the `answerKey` entry for that question, when its `correctOptionId` is
   set
2. `question.correctOptionId`, for a part whose key is written question by
   question
3. nothing, which becomes `Answer key pending`

A key that names an option the question does not have is discarded and
counts as missing. A stale id is a content bug, and marking every learner
wrong because of it would be the worst available outcome.

## 4. Whether exact answer key values were available

**No. No correct answer is stored for any of the 8 questions.**

The Mock Test 1 source document does not mark a correct Listening option
anywhere in its question text. All six Listening answer keys exist only as
PNG images on Cloudinary. This is recorded in
`docs/product/mock-test-1-content-map.md` under
`Listening answer keys`, in `mock-tests/mock-test-1/extracted-content-outline.md`,
and in `mock-tests/mock-test-1/extracted-links.md`.

Nothing was guessed. Transcribing the six images is EXAM-C1 and is still
open.

Practical consequence: every one of the 8 questions is `Answer key
pending`, and the practice score screen shows `Pending` rather than a
number.

Loading the real key later is a content edit and nothing else. Replace
`correctOptionId: null` with the option id, for example
`"listening-part-1-q1-d"`, and leave `source` as `"answer-image"` when the
value was read off the sheet. Partial loading is safe, see section 7.

## 5. Answer explanation image usage

The Part 1 answer and explanation sheet is stored on the content object as
`answerExplanationImageUrl`, with alt text beside it in
`answerExplanationImageAlt`:

`/image/upload/v1785339013/Listening_Test_1_zAnswers_-_Part_1_hdrodb_pary29.png`

on `res.cloudinary.com/dkvsshy7n`, taken from
`mock-tests/mock-test-1/extracted-links.md`.

- The file was not downloaded and is not re-hosted. The Cloudinary URL is
  referenced directly.
- It renders on the answer review screen as a reference panel, inside a
  collapsed disclosure. Opening the review does not put the answers on
  screen unasked, and a learner who wants to mark by hand can open it.
- It is a plain `img` element, not `next/image`, for the same two reasons
  as the scenario picture: no `images.remotePatterns` entry has to be added
  to `next.config.ts`, and licensed practice artwork is not routed through
  the Next image optimizer.
- The panel is skipped entirely when a part has no sheet, so Parts 2 to 6
  need no component change.
- This is Toronto Academy licensed source material behind the dashboard
  auth guard. It is not an official CELPIP screenshot, and no official
  branding is copied into the UI.

## 6. Score calculation rule

Practice score only. Correct out of total, and the same number as a
percentage. Nothing else is calculated.

| Reading | Rule |
| --- | --- |
| Total questions | Every question in the part, 8 here |
| Answered | Questions with an option selected |
| Correct | Selected option matches a usable correct option |
| Practice score | `round(correct / total * 100)`, as a whole percent |

Gate: **the practice score is calculated only when every question in the
part has a usable answer key.** `buildListeningScoreSummary` returns
`correctCount: null` and `scorePercent: null` otherwise, so a screen cannot
print a partial result by accident. An empty part is treated as
incomplete, since there is nothing to score.

No official CELPIP score is produced. No CELPIP level is shown. No band, no
scaled score, and no conversion of any kind. The result is called a
practice score everywhere it appears, and the note under it says in full
that it is not an official CELPIP score.

The helpers live in `src/features/exam-engine/listening-score.ts` and are
pure functions over the content and the answer map, with no React and no
storage:

| Function | Returns |
| --- | --- |
| `getTotalQuestions` | Question count for the part |
| `getAnsweredCount` | Questions with a selection |
| `getCorrectCount` | Selections matching a usable key |
| `getScorePercent` | Whole percent, or `null` when it cannot be calculated honestly |
| `hasCompleteAnswerKey` | Whether every question has a usable key |
| `countMissingAnswerKeys` | How many questions have no usable key |
| `buildListeningReviewRows` | One review row per question, in part order |
| `buildListeningScoreSummary` | Everything the score screen needs, in one pass |

`getCorrectCount` skips a question with no key rather than counting it
wrong, so it undercounts while the key is incomplete. Any learner facing
use of it is gated on `hasCompleteAnswerKey`, which is what
`buildListeningScoreSummary` does.

## 7. What happens if answer keys are missing

The rule the whole feature is built around: **a missing answer key never
makes a learner look wrong.**

| Situation | Review row | Score screen |
| --- | --- | --- |
| Key present, selection matches | `Correct` | counted |
| Key present, selection differs | `Incorrect` | counted |
| Key missing, learner answered | `Answer key pending`, correct answer column reads `Answer key pending` | score withheld |
| Key missing, learner did not answer | `Unanswered` | score withheld |
| Key present, learner did not answer | `Unanswered` | counted as not correct |
| Key names an option the question does not have | treated as missing | score withheld |

Status precedence is: unanswered first, then pending, then correct or
incorrect. An unanswered question reads as unanswered whether or not a key
exists, because that is true either way and is the more useful thing to
tell the learner.

Partial keys are safe. If four of eight are transcribed, those four are
checked and shown, the other four read pending, and the practice score
still says `Pending` for the part. There is no state in which a score is
calculated against part of a key.

Pending is styled in the same quiet navy as unanswered, never in the red
used for incorrect. It is a statement about the answer key, not about the
learner.

## 8. What is intentionally not built

Nothing below was started, stubbed against a database, or half wired.

- Listening Part 2. Only the placeholder sentence on the end screen
  mentions it.
- Listening Parts 3 to 6, and the full Listening section.
- A full Listening section score. This scores one part.
- Reading, Writing and Speaking.
- Any database read or write. No attempt row, no answer row, no Supabase
  migration, and no Supabase helper change.
- Any API route, auth change, or service role call.
- Any `localStorage`, `sessionStorage` or cookie. Answers are React state
  and are lost on reload, exactly as in EXAM-03.
- Persisted attempt history.
- An official CELPIP score, an official CELPIP level, or any conversion
  towards one.
- One time locked audio playback, and the countdown timer. Both are still
  the EXAM-03 behaviour.
- Payment and live classes.
- Any change to the Speaking or Writing AI flows, or to any scoring prompt.
- Any new dependency.

No official screenshot is embedded anywhere, and no official CELPIP
branding is copied into the UI.

## 9. How EXAM-05 should continue

1. **EXAM-C1 is still the blocker for a real score.** Transcribe the six
   Listening answer key images. For Part 1 that is eight option ids typed
   into the `answerKey` list in
   `src/features/exam-engine/mock-tests/mock-test-1/listening-part-1.ts`.
   The review and score screens need no change when it lands, and the
   score turns itself on when the eighth entry is filled in.
2. **Split the key off the client before it exists.** Today the whole
   content object crosses the server to client boundary, which is safe
   only because every key is null. As soon as real ids are in the file
   they would be in the browser payload, and a learner could read them out
   of the page before answering. Send questions and options to the
   browser, and keep the key on the server for review and scoring.
3. **Then Part 2.** It is the same screen types with a single conversation
   clip, so it should need content only. The three closing screens are
   generic apart from their titles, which are fixed strings in
   `listening-review-copy.ts` and would need a part label passed in.
4. **Decide where an in progress attempt lives before adding more parts.**
   Losing answers on reload is fine for one part and not fine for a full
   test. That needs a schema decision and a migration, neither of which
   belongs in a UI ticket.
5. **Media fidelity, in the EXAM-03 order:** gate Next on the clip ending,
   then one time playback, then autoplay on screen entry, then the real
   countdown.
6. **Confirm the Listening question denominator before any section level
   score screen.** The content holds 38 Listening questions and the
   official score screen shows 37, which is open item 6 in
   `docs/product/mock-test-1-content-map.md`. It does not affect this
   ticket, which scores one part out of 8.

---

## Files

Created:

- `src/features/exam-engine/listening-review-types.ts`
- `src/features/exam-engine/listening-review-copy.ts`
- `src/features/exam-engine/listening-score.ts`
- `src/components/exam/listening/ListeningAnswerReviewScreen.tsx`
- `src/components/exam/listening/ListeningAnswerReviewTable.tsx`
- `src/components/exam/listening/ListeningScoreScreen.tsx`
- `src/components/exam/listening/ListeningScoreSummaryCard.tsx`
- `src/components/exam/listening/ListeningPartEndScreen.tsx`
- `docs/product/listening-part-1-review-score.md`

Changed:

- `src/features/exam-engine/mock-tests/mock-test-1/listening-part-1.ts`,
  pending `answerKey` for all 8 questions, plus
  `answerExplanationImageUrl` and its alt text. No question, option or
  media URL was touched.
- `src/features/exam-engine/listening-types.ts`, `answerKey` and the
  answer explanation image fields on `ListeningPartContent`, and the
  screen union: `complete` out, `answer-review`, `score` and `part-end`
  in.
- `src/features/exam-engine/listening-flow.ts`, emits the three closing
  screens instead of the completion placeholder.
- `src/features/exam-engine/listening-copy.ts`, completion placeholder
  wording and `formatListeningAnsweredCount` removed, preview wording
  corrected. Nothing else changed.
- `src/features/exam-engine/exam-theme.ts`, three new class recipe blocks,
  `examReview`, `examReviewStatusTones` and `examScore`. Existing recipes
  untouched.
- `src/components/exam/listening/ListeningPartOnePrototype.tsx`, renders
  the three closing screens and adds restart.
- `src/app/dashboard/mock-tests/mock-test-1/listening/part-1/page.tsx`,
  standing notice wording and comments only.

No EXAM-01 shell component was edited, and no existing component behaviour
changed.

## Manual test steps

1. Sign in and open `/dashboard/mock-tests/mock-test-1/listening/part-1`.
2. Walk to Question 1 and answer some but not all of the eight questions.
   Leave at least one blank.
3. Press Next on Question 8. The answer review appears with all 8 rows.
4. Check the rows: an answered question reads `Correct` or `Incorrect` and
   shows both the option you chose and the correct answer, a blank
   question reads `Unanswered` with `No answer selected`. The Mock Test 1
   Part 1 key is fully loaded, so no row reads `Answer key pending`.
5. Open `Show the answer and explanation sheet`. The Cloudinary image
   loads inside the panel. Close it again.
6. Press `Back`. You land on Question 8 with your answer still selected.
   Press Next to return to the review.
7. Press `View score`. Total questions reads 8, `Answered` reads your
   count out of 8, `Correct` reads how many you got right out of 8, and
   `Practice score` reads that as a percentage. The pending block is gone,
   and the practice result note is still shown.
8. Press `Review answers`, confirm you land back on the review, then
   return and press `End Listening Part 1`.
9. On the end screen, press `Restart Listening Part 1`. You land on screen
   1 and every answer is cleared.
10. Press `Back to dashboard` to confirm the link works.
11. Reload mid part to confirm answers are not persisted anywhere.

To check the scored path before EXAM-C1, temporarily set one
`correctOptionId` in the content file and confirm that row alone reads
`Correct` or `Incorrect` while the score stays `Pending`. Revert it
afterwards. Do not commit a guessed key.
