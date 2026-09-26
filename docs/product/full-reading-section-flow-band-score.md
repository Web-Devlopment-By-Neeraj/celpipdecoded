# Full Reading Section Flow and Estimated Band Score (EXAM-24)

The four completed Reading parts assembled into one continuous Reading
section, with one practice score, one part breakdown, one estimated
Reading band and one answer review at the end.

This document records what was built, where every number comes from, and
what was deliberately left out.

House style: normal hyphens only, no long hyphens or em dashes.

## 1. Route created

    /dashboard/mock-tests/mock-test-1/reading

Built by:

    src/app/dashboard/mock-tests/mock-test-1/reading/page.tsx
    src/app/dashboard/mock-tests/mock-test-1/reading/actions.ts

The route runs in exam mode. It is listed in
`src/features/navigation/exam-mode-routes.ts`, so the dashboard shell
renders no sidebar, header, breadcrumb trail or footer on it, and
`ExamModeViewport` gives the frame a fixed, one window tall viewport with
document scrolling switched off. Scrolling happens inside the passage
column, the question column and the review list, and nowhere else.

The page sits under `/dashboard`, where the layout auth guard covers it,
and verifies the session again close to the content. It carries robots
noindex.

The four individual part routes are untouched and still work:

    /dashboard/mock-tests/mock-test-1/reading/part-1
    /dashboard/mock-tests/mock-test-1/reading/part-2
    /dashboard/mock-tests/mock-test-1/reading/part-3
    /dashboard/mock-tests/mock-test-1/reading/part-4

## 2. Parts included

Parts 1 to 4, in test order, in one continuous flow:

| Part | CELPIP part name          | Working screen   |
| ---- | ------------------------- | ---------------- |
| 1    | Reading Correspondence    | `correspondence` |
| 2    | Reading to Apply a Diagram| `diagram`        |
| 3    | Reading for Information   | `information`    |
| 4    | Reading for Viewpoints    | `viewpoints`     |

The flow is 14 screens:

     1  Reading section intro
     2  Reading Part 1 intro
     3  Reading Part 1, the correspondence split, all 11 questions
     4  transition to Reading Part 2
     5  Reading Part 2 intro
     6  Reading Part 2, the diagram split, all 8 questions
     7  transition to Reading Part 3
     8  Reading Part 3 intro
     9  Reading Part 3, the information split, all 9 questions
    10  transition to Reading Part 4
    11  Reading Part 4 intro
    12  Reading Part 4, the viewpoints split, all 10 questions
    13  full Reading practice score, with part breakdown and band
    14  full Reading answer review, grouped by part

The score comes before the review, which is the order the four Reading
part flows already use and the reverse of the full Listening flow. A
Reading section is answered on four screens, so a learner arriving at the
end wants the result before a second pass over 38 questions.

No part level score and no part level review appears anywhere inside the
run. That rule is enforced in `buildReadingSectionFlow`: each part flow is
asked for its `"complete"` ending and even that ending's single completion
screen is filtered out, so a part can only contribute an intro and a
working screen.

## 3. Source content used

The four existing content files, imported unchanged:

    src/features/exam-engine/mock-tests/mock-test-1/reading-part-1.ts
    src/features/exam-engine/mock-tests/mock-test-1/reading-part-2.ts
    src/features/exam-engine/mock-tests/mock-test-1/reading-part-3.ts
    src/features/exam-engine/mock-tests/mock-test-1/reading-part-4.ts

Original source document:

    mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

The assembler writes no passage, no question, no option and no answer key
of its own. Every part below the section is the same exported object its
part level route already renders, so the full run and the part runs cannot
drift apart:

    src/features/exam-engine/mock-tests/mock-test-1/reading-section.ts

What the assembler adds is the five facts the section needs and a part
does not carry: the part number, the learner facing part label, the Format
row for the intro card, which of the four split screens answers the part,
and what a question with no stem of its own is called in the review. All
five were previously typed into the four prototype components and the four
server actions.

There is no instructional video screen. The Listening section has one
because a Listening clip is registered in
`instructional-video-assets.ts`; no Reading clip is, and nothing was
invented to fill the gap.

## 4. Question count by part

Counted from the content files, not written down:

| Part           | Questions |
| -------------- | --------- |
| Reading Part 1 | 11        |
| Reading Part 2 | 8         |
| Reading Part 3 | 9         |
| Reading Part 4 | 10        |

## 5. Total question count

**38.**

38 is not hardcoded anywhere in the engine. It is what
`countReadingSectionQuestions` returns today from the four content files,
and it is what the intro card, the score denominator, the part breakdown
denominators and the band lookup all read. A part gaining or losing a
question moves all of them together.

It happens to match the total the published Reading score chart is drawn
for, which is why an estimated band is possible at all. See section 12.

## 6. Answer state strategy

One flat answer map for the whole section:

    { [questionId: string]: selectedOptionId }

This is the smallest safe shape, and it is the same shape every Reading
part prototype already held, which is what lets every existing Reading
helper read a section map unchanged. It works flat because the question
ids are unique across the four content files, `reading-part-1-q1` through
`reading-part-4-q10`, so no part prefix and no nesting is needed.

The map lives in local React state in `ReadingSectionPrototype` for the
length of the visit. Nothing is written to a database, to `localStorage`
or to a cookie, and a page reload starts the section again.

Answers survive moving back and forward, and across a part boundary in
either direction, because they are keyed by question id rather than by
screen position and because the prototype stays mounted for the whole
section. Restart clears the whole map and returns to the section intro.

## 7. Server action created

    src/app/dashboard/mock-tests/mock-test-1/reading/actions.ts
    markReadingSection(answers)

Input: the full selected answer map.

Output, `ReadingSectionMarkedResult`, or `null` when there is no session:

- `summary.totalQuestions`
- `summary.correctCount`
- `summary.incorrectCount`
- `summary.blankCount`
- `summary.answeredCount`
- `summary.percentage`
- `estimatedBand`, a `ReadingBandEstimate` or `null`
- `parts[]`, which is both the part breakdown and the review grouped by
  part

Each `parts[]` entry carries:

- `partId` (for example `reading-part-3`), `partNumber`, `partLabel`,
  `partTitle`
- `summary`, with `totalQuestions`, `answeredCount`, `correctCount`,
  `incorrectCount`, `blankCount` and `percentage`
- `rows`, the review rows for that part

Each review row carries the question id, the question number, the question
text or stem, the selected option id and text, the correct option id and
text, `isCorrect`, `isBlank`, and `explanation`. The part id and part
title come from the group the row sits in.

`explanation` is `null` on every row. The source document publishes no
Reading explanations, so nothing is printed. **No AI explanations are
generated and no explanation is invented.**

The action is deterministic and local to the mock content: the same
answers always produce the same result, nothing is read from a database,
and nothing is written anywhere. The Supabase client in it is used for one
thing, reading the caller's session.

Supporting helpers:

    src/features/exam-engine/reading-section-types.ts   types only
    src/features/exam-engine/reading-section-flow.ts    screens, counts, key strip, sanitize
    src/features/exam-engine/reading-section-review.ts  rows grouped by part
    src/features/exam-engine/reading-section-score.ts   totals and band lookup
    src/features/exam-engine/reading-band-score.ts      the chart and the estimate

`reading-section-flow.ts` is a new file rather than an addition to
`reading-flow.ts` on purpose. The four part routes all import
`reading-flow.ts`, and the surest way to guarantee this ticket does not
regress them is to leave that module untouched and import from it.

## 8. Answer key handling

Answer keys never reach a client question screen.

- The route calls `withoutReadingSectionAnswerKeys` on the server before
  the content crosses the boundary. It delegates to the existing
  `withoutReadingAnswerKey` per part, so both places a key can hide,
  `content.answerKey` and `question.correctOptionId`, are removed, and the
  module level content objects the four part routes share are rebuilt
  rather than mutated.
- The client receives stripped content only: passages, images, labelled
  sections, questions, options, timing figures, labels and copy.
- The server action imports `mockTest1ReadingSection` directly rather than
  taking content from the caller, so nothing the browser sends can
  influence which key an answer is marked against.
- What crosses back is the finished result: review rows carrying the
  correct option for questions the learner has now finished, the counts,
  and the band. The key object itself is never serialized in either
  direction.

Verified by inspection of the stripped object: no `correctOptionId` and no
`answerKey` survives the strip, and the original module content still has
its keys afterwards.

`sanitizeReadingSectionAnswers` treats the submitted map as untrusted
input, because a server action is reachable by direct POST. It keeps only
answers that name a real question in the section and a real option **on
that question**, so one question's answer cannot be credited to another,
and it discards anything unrecognized rather than rejecting the whole
submission. A discarded answer is marked as a blank.

No existing key stripping function needed changing.

## 9. Score calculation

Marking rules, inherited unchanged from `reading-score.ts` and applied by
the same `buildReadingReviewRows` the four part actions call:

- correct is a selected option that matches the key
- a blank counts as incorrect, and is also counted separately
- `incorrectCount` includes the blanks, so correct plus incorrect is
  always the whole section
- `percentage` is correct over total, rounded to a whole percent

The per part summaries are counted from the finished review rows, so a
question can never be correct in the review and wrong in the score. The
section totals are summed from the part summaries, which is what
guarantees the breakdown rows and the headline always add up. The section
percentage is recalculated from the section totals rather than averaged
across the four parts, because the parts hold different numbers of
questions.

A question marked here and the same question marked by its part level
action get the same answer from the same code, including the wording a
part chooses for a question with no stem.

## 10. Blank answer handling

- Blanks are allowed everywhere. Nothing in the flow gates Next on an
  unanswered question, on a part or on the whole section.
- Completion is never blocked by blanks. A learner can reach the score
  with every question blank.
- A blank counts as incorrect in the score, so the percentage means "of
  the whole section" rather than "of what was attempted".
- `blankCount` is reported separately, in the summary card and as its own
  column in the part breakdown, so a learner is not left to subtract.
- The score card prints the blank note only when there is a blank to
  explain.
- Every blank review row shows "No answer selected" and still shows the
  correct answer, which is the point of reviewing a blank.
- A question with no stem of its own is named after the body of text its
  blank sits in: "Blank in the written response." for Part 1, "Blank in
  the email message." for Part 2, "Blank in the reader comment." for Part
  4. Part 3's nine statements each carry their own text. Nothing invents a
  stem the source document does not have.

## 11. Part breakdown behaviour

`ReadingPartBreakdownCard` prints one row per part, with six columns: the
part, its question count, answered, blank, correct and practice score.

Every denominator is that part's own question count, taken from the
summary the server counted off that part's content: 11, 8, 9 and 10. None
of them is written down.

The breakdown carries no CELPIP level and no band, per part or in total.
The band is a reading of the whole section and has its own card above the
breakdown.

## 12. Estimated band source and behaviour

**Source, and the only source:**

    public/Overview and Scoring Descriptors/2. Reading/Reading - Scoring.pdf

That file was already in the repository. It is a one page chart with three
columns, CELPIP Level, Reading score /38, and Scoring Information. The
nine rows in `reading-band-score.ts` are that chart's nine rows, in its
order, with its numbers:

| CELPIP Level | Reading score /38 |
| ------------ | ----------------- |
| 10-12        | 33-38             |
| 9            | 31-33             |
| 8            | 28-31             |
| 7            | 24-28             |
| 6            | 19-25             |
| 5            | 15-20             |
| 4            | 10-16             |
| 3            | 8-11              |
| M-2          | 0-7               |

Nothing was downloaded and no band was invented. The Reading chart is not
the Listening chart: Reading level 8 is 28 to 31 where Listening level 8
is 30 to 33, so neither table may be copied from the other.

**Overlap is preserved, not resolved.** The chart's rows overlap at their
edges, so a raw 28 sits on both level 7 and level 8. That is in the source
chart. The estimate carries every level a score falls on and prints them
as a range, for example "Level 7 or 8". No tie-break rule was invented,
because the chart does not have one: the Scoring Information column says a
real level is calculated from the number of points **and** the difficulty
of the questions, with score equating, so a raw count maps to a
neighbourhood rather than to one level.

**Behaviour:**

- The band is looked up once, in `buildReadingSectionResult`, from the
  section totals.
- It appears on the full Reading section score screen and nowhere else.
- No individual Reading part route shows a band. That is enforced rather
  than remembered: `estimateReadingBand` returns `null` for any total that
  is not the chart's 38, and no part level code path calls it at all. A
  part score out of 11 cannot be handed a band.
- `estimatedBand` is `null` whenever the chart does not cover the attempt,
  and the score screen leaves the card out entirely rather than showing it
  empty. Nothing is extrapolated and nothing is rounded to the nearest
  row.
- Every raw score from 0 to 38 is covered by the chart, so an attempt on
  this section always receives an estimate today.

**The card shows:** the raw score and the total ("Estimated from 25
correct answers out of 38."), the estimated level or range, a source note
naming the published chart and saying that a real level also takes
question difficulty into account, a range note when the reading covers two
levels, and the disclaimer:

> This is a Toronto Academy practice estimate, not an official CELPIP
> score.

**Descriptor gap.** `ReadingBandEstimate.descriptor` exists and is unset.
The Reading folder holds an Overview and a Scoring chart, and neither
carries per level Reading descriptor text. Writing and Speaking were each
given a `ScoreDescriptors.pdf` and Reading was not, so nothing is printed
rather than a level description written here. The field is in the type so
the ticket that adds real descriptors has somewhere to put them.

## 13. Timer behaviour

Deliberately simple and safe, as the ticket asks.

- Each part keeps its own existing window, taken from its content file:
  Part 1 is 11 minutes, Part 2 is 9, Part 3 is 10, Part 4 is 13. That is
  43 minutes across the section.
- The countdown is keyed to the part's working screen, so a selection made
  on that screen does not restart it.
- **There is no section wide clock and no strict full Reading timing.**
- **Nothing auto-submits.** No `onTimeExpire` handler is passed to any of
  the four working screens. When a window reaches zero the reading becomes
  "Time is up", the screen stays put, every answer stays selected, and the
  learner continues by hand.
- The section intro card shows the 43 minutes as a plan for the section,
  summed from the four part windows. Nothing counts down against it.

Strict full Reading timing, and the forward only navigation that has to go
with it, are left for the next Reading polish ticket. See section 16.

## 14. Dashboard link status

`DashboardMockTestCard` now shows exactly two mock test cards, one per
built section: the Listening test card, and the full Reading section card
beside it.

The Reading card:

- Title: **Mock Test 1 - Reading Test**
- Badge: **Internal preview**
- Route: `/dashboard/mock-tests/mock-test-1/reading`
- Description: "Full Reading section flow with Parts 1-4, practice score,
  review, and estimated band."
- Meta: Reading / Parts 1-4 / 38 questions, where the count is read off
  the four content files at module load rather than typed in
- Button: **Open Reading Test**

The card stays an internal preview card rather than becoming a student
facing one like the Listening card, because the Reading run still has
prototype behaviour: no strict section timing, and a Back button that
works throughout.

### The individual Reading part cards were removed from the dashboard

The dashboard previously carried five Reading cards: the full section card
plus one card each for Reading Part 1, Part 2, Part 3 and Part 4. That was
too crowded, and four of the five were internal build steps rather than the
route a learner opens. **Only the full Reading section card is shown now.**

**The four part routes were not deleted and still work.** They keep their
pages, their exam mode surface and their behaviour, and they open normally
when the URL is typed:

- `/dashboard/mock-tests/mock-test-1/reading/part-1`
- `/dashboard/mock-tests/mock-test-1/reading/part-2`
- `/dashboard/mock-tests/mock-test-1/reading/part-3`
- `/dashboard/mock-tests/mock-test-1/reading/part-4`

They stay listed in `exam-mode-routes.ts`, so a typed URL still gets the
locked exam surface it always did. They are simply not linked from the
dashboard any more, which is the same treatment the six Listening part
routes were given. They remain the way to check one Reading part on its
own during development.

The wording for those four cards was removed from `readingCopy` in
`src/features/exam-engine/reading-copy.ts` along with the cards, since
nothing else read it. `dashboardPreviewBadgeLabel` stays, because the full
Reading section card still carries the Internal preview badge.

**The Listening card is untouched.** Its route, wording, styling and status
pill are exactly as they were.

**Nothing anywhere claims that a full all-skills Mock Test 1 is complete.**
Two sections of four are built.

## 15. What is intentionally not built

- no Writing mock test section
- no Speaking mock test section
- no full Mock Test all-skills flow
- no admin panel
- no payment, no live classes
- no database save, no attempt row, no persisted attempt history
- no Supabase migration
- no `localStorage` and no cookie
- no student analytics
- no strict full Reading timer, and no auto-submit on expiry
- no forward only navigation inside the Reading run
- no AI explanations and no invented explanations
- no per level Reading descriptor text, because the project holds none
- no official CELPIP branding, logo or colour anywhere

Untouched by this ticket:

- every Listening route and every Listening file
- the four individual Reading part routes and their actions
- `reading-flow.ts`, `reading-review.ts`, `reading-score.ts` and
  `reading-types.ts`
- existing Speaking AI logic
- existing Writing AI logic
- auth, the Supabase service role, and `.env.local`

Two shared Reading components gained one optional prop each, both
defaulted so the four part routes render exactly as before:

- `ReadingScoreSummaryCard` takes `practiceResultNote` and `blankNote`.
  The part note ends "No CELPIP Reading level is estimated from one
  part.", which is true on a part screen and would be a lie under a
  section score that shows a band.
- `ReadingPartIntroScreen` takes `noticeText`. The part notice opens
  "Internal prototype.", a label the section exam surface must not carry,
  and promises a score at the end of the part, which the section run
  removes.

## 16. EXAM-25 continuation note

The next Reading ticket should be the QA and polish pass this one
deliberately deferred:

1. **Strict full Reading timing.** A section wide window, or per part
   windows that advance the run when they close, with the arithmetic
   written down the way `listening-timing.ts` writes down Listening's. No
   published figure for a section built from these four parts is held
   today, so that ticket has to decide whether the 43 minute sum is the
   window or whether a published Reading Test allowance replaces it.
2. **Forward only navigation.** Back is enabled throughout this
   prototype. The official rule is that a learner cannot return to a
   previous part, and the full Listening run already enforces it in
   `ListeningSectionPrototype`. The two belong together: a window that
   advances the run makes a Back button incoherent.
3. **Fold the four part closing screens into one pair.** There are now
   four near identical `ReadingPartNScoreScreen` and
   `ReadingPartNReviewScreen` files differing by a title and a restart
   label, plus the section pair. `docs/product/reading-part-3-review-score.md`
   named this as the moment to build `buildReadingReviewCopy` and one
   shared pair. It was not done here because it means editing four live
   part routes' components, which this ticket was asked not to touch.
4. **Reading instructional video screen**, if a Reading clip is ever added
   to `instructional-video-assets.ts`.
5. **Per level Reading descriptor text**, if a Reading `ScoreDescriptors`
   source is ever obtained. `ReadingBandEstimate.descriptor` is already
   there for it.

Persisted attempts, an all-skills mock test flow, and the Writing and
Speaking mock test sections remain further out and are not part of the
Reading polish work above.
