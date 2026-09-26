# Listening Part 2 answer review and practice score (EXAM-06)

Closes the local prototype cycle for Mock Test 1 Listening Part 2. It adds
the three screens that follow Question 5: the answer review, the practice
score, and the end of part screen.

Ticket: `docs/tickets/EXAM-06-listening-part-2-review-score.md`
Prototype: `docs/product/listening-part-2-prototype.md` (EXAM-05)
Part 1 equivalent: `docs/product/listening-part-1-review-score.md` (EXAM-04)
Shell: `docs/product/exam-engine-screen-shell.md` (EXAM-01)
Content map: `docs/product/mock-test-1-content-map.md`

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route updated

| Property | Value |
| --- | --- |
| Route | `/dashboard/mock-tests/mock-test-1/listening/part-2` |
| File | `src/app/dashboard/mock-tests/mock-test-1/listening/part-2/page.tsx` |
| Rendering | Server component, dynamic, unchanged |
| Auth | Behind the dashboard layout guard, and the page calls `getUser` again close to the content, unchanged |
| Indexing | `robots: { index: false, follow: false }`, unchanged |
| Status | Internal preview, not a student facing mock test entry |

No new route was created. The three screens are part of the same single
page client flow, so the whole part is still one route and one visit.

One file was added beside the page:
`src/app/dashboard/mock-tests/mock-test-1/listening/part-2/actions.ts`.
It holds one server function, `markListeningPartTwo`. Section 4 explains
why the marking runs there instead of in the browser.

The standing notice above the frame no longer says the review and the
score are unbuilt. It now says they run for this visit only and are not an
official CELPIP score.

The dashboard internal preview link is unchanged and still marked
`Internal preview`. Its description was corrected for the same reason.

## 2. Screens added

The flow grew from 9 screens to 11. Screens 1 to 8 are untouched.

| # | Screen | Component | Change |
| --- | --- | --- | --- |
| 8 | Question 5 | `ListeningQuestionScreen` | unchanged |
| 9 | Answer review | `ListeningAnswerReviewScreen` | new, replaces the EXAM-05 completion screen |
| 10 | Practice score | `ListeningScoreScreen` | new |
| 11 | End of Listening Part 2 | `ListeningPartEndScreen` | new |

Every one of the three is the EXAM-04 component, reused. No new screen
component was written. What EXAM-06 had to do first is described in
section 8.

The EXAM-05 completion screen is gone from this flow. It existed to say
that the answer review was coming. The review now exists, so
`buildListeningFlow` is called without the `ending: "complete"` option and
produces the same three closing screens Part 1 gets.

### Answer review screen

- Heading `Listening Part 2 Answer Review`, subtitle
  `Review your answers before viewing the score.`
- A compact result table with one row per question, all 5 shown: question
  label, the option the learner selected, the correct option, and a status
  word.
- Status is one of `Correct`, `Incorrect`, `Unanswered`,
  `Answer key pending`. Part 2 has a complete key, so `Answer key pending`
  cannot appear for this part today.
- Collapsed reference panel holding the Part 2 answer sheet, so the
  correct answer column can be checked against the source. It is a
  Cloudinary URL, referenced and never downloaded, rendered as a plain
  `img` for the reasons in `docs/product/listening-part-1-review-score.md`
  section 5.
- Top bar action is labelled `View score`.
- Bottom bar `Back` returns to Question 5, which is the prototype testing
  affordance the ticket asks for.

### Practice score screen

- Heading `Listening Part 2 Score`, subtitle `Your practice result for
  this part.`
- Four readings: total questions (5), answered, correct, practice score.
- Note under the readings, in full: `This is a Toronto Academy practice
  result, not an official CELPIP score.`
- In canvas actions: `End Listening Part 2` and `Review answers`. There is
  no top bar Next, because this screen is a stopping point.
- Bottom bar `Back` is labelled `Review answers` and returns to the review.

### End of part screen

- Heading `End of Listening Part 2`, message `You have completed Listening
  Part 2 of Mock Test 1.`
- `Back to dashboard`, a real link to `/dashboard` so middle click and open
  in a new tab still work.
- `Restart Listening Part 2`, which clears the answers held on the page,
  clears the marking result, and returns to screen 1.
- Placeholder line: `Listening Part 3 will be added in the next ticket.` It
  is a sentence, not a disabled button, because there is nothing to press.

### Marking screen

One screen exists that Part 1 has no equivalent of. Because Part 2 is
marked on the server, there is a moment between Question 5 and the review
where the result has not arrived. That moment renders in the same exam
shell with the heading `Checking your answers`.

It is normally too fast to read. It matters when the request fails or the
session has expired, which shows `Your answers could not be checked` and a
`Try again` button. `Back` still works throughout, so a failed check is
never a dead end: the learner walks back to the questions with every
answer still selected.

### Visual notes

- All screens sit in the EXAM-01 shell: grey top bar, white canvas, grey
  bottom bar.
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

**The Part 2 answer key was already complete and correct. Nothing was
added, changed, or guessed in this ticket.**

EXAM-05 transcribed it from the Part 2 answer sheet and stored it in
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-2.ts`. All
five entries were re-checked against the ticket's confirmed key by exact
option text:

| Question | Confirmed answer text | Option id in the file | Matched by |
| --- | --- | --- | --- |
| 1 | a newspaper subscription | `listening-part-2-q1-a` | exact text |
| 2 | Manaz was a customer in the past. | `listening-part-2-q2-a` | exact text |
| 3 | suspicious | `listening-part-2-q3-b` | exact text |
| 4 | She would like to call him by his name. | `listening-part-2-q4-d` | exact text |
| 5 | a selection of articles | `listening-part-2-q5-c` | exact text |

Every one matched an existing option exactly. No punctuation had to be
reconciled, no option wording was edited to make a key fit, and the
content file was not modified by this ticket.

`source` is `"answer-image"` on all five entries, recording that the values
were read off the Part 2 answer sheet rather than out of the source
document text.

The key is never rendered on a question screen. It is not sent to the
browser at all, which is the subject of the next section.

## 4. Where the marking happens, and why

This is the one structural difference between Part 1 and Part 2, and it is
worth stating plainly.

Part 2 has a complete answer key. The prototype is a client component, and
a client component receives its props as serialized data, so handing it the
content object whole would put all five correct option ids in the page
payload where a learner could read them before answering. EXAM-05 saw this
and stripped the key on the server with `withoutListeningAnswerKey`, and
left a note next to that helper saying what it did not solve: a screen that
marks answers has to do the comparison where the key lives.

EXAM-06 is that screen, so it does the comparison there.

```
page.tsx        ships content WITHOUT the answer key
                                |
client          answers = { questionId: optionId }   local React state
                                |
                markListeningPartTwo(answers)        server function
                                v
server          buildListeningReviewRows(listeningPart2, answers)
                buildListeningScoreSummary(listeningPart2, answers)
                                |
                                v
client          rows + summary  ->  review and score screens
```

What this does and does not change:

- The answers still live in local client state, in the
  `{ questionId: selectedOptionId }` shape EXAM-05 used. Nothing about how
  they are held or selected changed.
- The correct answers reach the browser only after the learner has finished
  the part, as text inside finished review rows. The key itself, as a list
  of question id to correct option id, is never serialized in either
  direction.
- The scoring is the same pure EXAM-04 helpers Part 1 calls. Nothing is
  duplicated and nothing is scored differently. Only the side of the
  boundary changed.
- No API route was created. `markListeningPartTwo` is a server function,
  not a route handler.
- Nothing is written anywhere. The Supabase client in `actions.ts` is used
  for exactly one thing: reading the caller's session.

Two things the action does because a server function is reachable by a
direct POST and a page level auth check does not extend to it:

1. **It re-verifies the caller.** No session means it returns `null` and
   the screen shows the failed state. This is what stands between a signed
   out request and the answer key.
2. **It sanitizes its argument.** Only keys naming a real Part 2 question,
   with a value naming a real option on that question, survive. Anything
   else is discarded rather than rejecting the whole submission, so a stale
   answer costs one row instead of the entire result.

## 5. Score calculation rule

Practice score only. Correct out of total, and the same number as a
percentage. Nothing else is calculated. This is unchanged from EXAM-04 and
uses the same functions.

| Reading | Rule |
| --- | --- |
| Total questions | Every question in the part, 5 here |
| Answered | Questions with an option selected |
| Correct | Selected option matches a usable correct option |
| Practice score | `round(correct / total * 100)`, as a whole percent |

Because Part 2 has 5 questions, the practice score can only ever be 0, 20,
40, 60, 80 or 100 percent.

Gate: **the practice score is calculated only when every question in the
part has a usable answer key.** `buildListeningScoreSummary` returns
`correctCount: null` and `scorePercent: null` otherwise, so a screen cannot
print a partial result by accident. Part 2's key is complete, so the gate
is satisfied and real numbers are shown.

No official CELPIP score is produced. No CELPIP level is shown. No band, no
scaled score, and no conversion of any kind. The result is called a
practice score everywhere it appears, and the note under it says in full
that it is not an official CELPIP score.

## 6. What happens if answer keys are missing

The rule the whole feature is built around, unchanged: **a missing answer
key never makes a learner look wrong.**

| Situation | Review row | Score screen |
| --- | --- | --- |
| Key present, selection matches | `Correct` | counted |
| Key present, selection differs | `Incorrect` | counted |
| Key missing, learner answered | `Answer key pending`, correct answer column reads `Answer key pending` | score withheld |
| Key missing, learner did not answer | `Unanswered` | score withheld |
| Key present, learner did not answer | `Unanswered` | counted as not correct |
| Key names an option the question does not have | treated as missing | score withheld |

None of these states is reachable for Part 2 today, because its key is
complete and every id in it names a real option. They stay in place because
the components are shared with parts whose keys are not written yet, and
because a future content edit that broke an id would land here rather than
marking a learner wrong.

Status precedence is: unanswered first, then pending, then correct or
incorrect.

Pending is styled in the same quiet navy as unanswered, never in the red
used for incorrect. It is a statement about the answer key, not about the
learner.

## 7. What is intentionally not built

Nothing below was started, stubbed against a database, or half wired.

- Listening Part 3. Only the placeholder sentence on the end screen
  mentions it.
- Listening Parts 4 to 6, and the full Listening section.
- A full Listening section score. This scores one part.
- Reading, Writing and Speaking.
- Any database read or write. No attempt row, no answer row, no Supabase
  migration, and no Supabase helper change.
- Any API route, auth change, or service role call.
- Any `localStorage`, `sessionStorage` or cookie. Answers are React state
  and are lost on reload, exactly as in EXAM-05.
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

### One thing deliberately left undone, and it is a real gap

**Listening Part 1 still ships its answer key to the browser.**

When EXAM-04 was written, every Part 1 key entry was `null`, so sending the
content object whole was harmless. EXAM-C1 has since transcribed all eight,
and the Part 1 route was not changed to match. Its complete key is
therefore readable in the page payload before a learner answers, which is
the exact problem EXAM-05 fixed for Part 2 and this ticket kept fixed.

It was left out because it is a Part 1 change and this ticket is Part 2.
The fix is small now that the pattern exists: call
`withoutListeningAnswerKey` in the Part 1 route, add a Part 1 marking
action beside it, and give `ListeningPartOnePrototype` the same
`markAnswers` prop and marking state Part 2 now has. It should be its own
ticket so the Part 1 flow can be retested properly.

### Known intentional gaps

- no database save
- no full Listening section score
- no Listening Parts 3 to 6
- no official CELPIP score
- no official CELPIP level
- no locked one time audio playback yet
- no timed countdown yet
- no persisted attempt history yet

## 8. Refactor: making the EXAM-04 screens part agnostic

`docs/product/listening-part-1-review-score.md` section 9 predicted this:
the three closing screens were generic apart from their titles, which were
fixed strings saying `Listening Part 1`.

Eight strings in `listening-review-copy.ts` named the part: the review
title, the table caption, the explanation caption, the score title, the end
part button, the end title, the end message, and the restart label.

They are now built by `buildListeningReviewCopy({ partLabel, nextPartLabel })`.
The Part 1 export is that builder called with the Part 1 labels, so every
Part 1 string is character for character what it was, and Part 1 needed no
edit at all.

Five components gained an optional `copy` prop that **defaults to the Part
1 wording**, which is why `ListeningPartOnePrototype` was not touched:

- `ListeningAnswerReviewScreen`
- `ListeningAnswerReviewTable`
- `ListeningScoreScreen`
- `ListeningScoreSummaryCard`
- `ListeningPartEndScreen`

Two wording changes were made on purpose, and they affect Part 1 too:

1. `explanationPanelIntro` said the sheet was there to check answers by
   hand `while the answer key is being transcribed`. Both keys are now
   transcribed, so that sentence had become untrue on both parts. It now
   says the sheet is there to check the correct answers shown above
   against the source.
2. `nextPartPlaceholder` is empty when no `nextPartLabel` is given, and
   `ListeningPartEndScreen` skips the line when it is empty. Nothing uses
   that yet. It exists so the last part built does not have to invent a
   next one.

`ListeningPartCompleteScreen` and the `part2CompleteHeading` and
`part2RestartLabel` strings are now unused: Part 2 no longer ends on the
EXAM-05 completion screen. They were left in place rather than deleted
because the component is generic and is exactly what EXAM-07 will want for
the first cut of Part 3, before its review exists.

## 9. How EXAM-07 should continue

1. **Build Listening Part 3 content first, review second.** Part 2 took two
   tickets, EXAM-05 for the flow and EXAM-06 for the closing screens, and
   that split worked. Part 3 can follow it: `ending: "complete"` for the
   first cut, then swap to the default ending when the review lands.
2. **The closing screens now need nothing but a copy object.** Call
   `buildListeningReviewCopy({ partLabel: "Listening Part 3", nextPartLabel: "Listening Part 4" })`
   and pass it in. No component change should be required.
3. **Copy the Part 2 key handling, not the Part 1 key handling.** Strip the
   key in the route, mark on the server, keep the answers local. Part 1 is
   the outdated pattern, see section 7.
4. **Then close the Part 1 gap**, in its own ticket, as described in
   section 7.
5. **Decide where an in progress attempt lives before adding more parts.**
   Losing answers on reload is fine for one part and not fine for a full
   test. That needs a schema decision and a migration, neither of which
   belongs in a UI ticket.
6. **Media fidelity, in the EXAM-03 order:** gate Next on the clip ending,
   then one time playback, then autoplay on screen entry, then the real
   countdown.
7. **Confirm the Listening question denominator before any section level
   score screen.** The content holds 38 Listening questions and the
   official score screen shows 37, which is open item 6 in
   `docs/product/mock-test-1-content-map.md`. It does not affect this
   ticket, which scores one part out of 5.

---

## Files

Created:

- `src/app/dashboard/mock-tests/mock-test-1/listening/part-2/actions.ts`
- `docs/product/listening-part-2-review-score.md`

Changed:

- `src/components/exam/listening/ListeningPartTwoPrototype.tsx`, renders
  the three closing screens plus the marking screen, adds restart, and
  takes the `markAnswers` prop.
- `src/app/dashboard/mock-tests/mock-test-1/listening/part-2/page.tsx`,
  passes the marking action down, plus notice wording and comments.
- `src/features/exam-engine/listening-review-copy.ts`,
  `buildListeningReviewCopy` and the Part 2 export. See section 8.
- `src/features/exam-engine/listening-review-types.ts`, adds
  `ListeningMarkedPart`.
- `src/features/exam-engine/listening-copy.ts`, marking screen wording and
  a corrected Part 2 preview description.
- `src/components/exam/listening/ListeningAnswerReviewScreen.tsx`,
  `ListeningAnswerReviewTable.tsx`, `ListeningScoreScreen.tsx`,
  `ListeningScoreSummaryCard.tsx`, `ListeningPartEndScreen.tsx`, optional
  `copy` prop defaulting to Part 1.

Not changed:

- `src/features/exam-engine/mock-tests/mock-test-1/listening-part-2.ts`.
  The answer key was already complete and correct. See section 3.
- `src/features/exam-engine/listening-score.ts`. The scoring helpers did
  the job unmodified.
- `src/features/exam-engine/listening-flow.ts` and `listening-types.ts`.
- `src/components/exam/listening/ListeningPartOnePrototype.tsx` and the
  Part 1 route.
- Every EXAM-01 shell component.

## Manual test steps

1. Sign in and open `/dashboard/mock-tests/mock-test-1/listening/part-2`.
2. Walk to Question 1 and answer some but not all of the five questions.
   Leave at least one blank, and get at least one deliberately wrong.
3. Press Next on Question 5. The answer review appears with all 5 rows.
   You may see `Checking your answers` first.
4. Check the rows: an answered question reads `Correct` or `Incorrect` and
   shows both the option you chose and the correct answer, a blank question
   reads `Unanswered` with `No answer selected`. No row should read
   `Answer key pending`.
5. Open `Show the answer and explanation sheet`. The Cloudinary image loads
   inside the panel. Confirm the correct answer column matches it. Close it
   again.
6. Press `Back`. You land on Question 5 with your answer still selected.
   Change it, press Next, and confirm the review reflects the new answer.
7. Press `View score`. Total questions reads 5, `Answered` reads your count
   out of 5, `Correct` reads how many you got right out of 5, and `Practice
   score` reads that as a percentage. The practice result note is shown and
   no CELPIP level appears anywhere.
8. Press `Review answers`, confirm you land back on the review, then return
   and press `End Listening Part 2`.
9. On the end screen, confirm the line `Listening Part 3 will be added in
   the next ticket.` Press `Restart Listening Part 2`. You land on screen 1
   and every answer is cleared.
10. Press `Back to dashboard` to confirm the link works.
11. Reload mid part to confirm answers are not persisted anywhere.

To confirm the answer key is not in the browser payload:

12. Open devtools, reload the part, and search the page source and the RSC
    payload for `answerKey` and for `q1-a`. Neither should appear before
    you reach the review. After the review loads, the correct answer text
    is present, which is the intended behaviour.

To confirm Part 1 still works:

13. Open `/dashboard/mock-tests/mock-test-1/listening/part-1`, answer the
    eight questions, and check that the review says `Listening Part 1
    Answer Review`, the score says `Listening Part 1 Score`, the end screen
    says `End of Listening Part 1` with `Listening Part 2 will be added in
    the next ticket.`, and that the practice score is a real number.
