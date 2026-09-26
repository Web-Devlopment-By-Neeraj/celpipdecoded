# Listening Part 3 answer review and practice score (EXAM-08)

Closes the local prototype cycle for Mock Test 1 Listening Part 3. EXAM-07
built the part and stopped on a completion screen. This ticket replaces that
screen with the answer review, the practice score and the end of part
screen.

Nothing is saved. No migration. No Listening Part 4.

## 1. Route updated

`src/app/dashboard/mock-tests/mock-test-1/listening/part-3/page.tsx`

Still one route, still behind the dashboard auth guard, still
`robots: noindex`. Two changes: it passes the marking action down, and the
standing notice no longer says that no answers are checked and no score is
produced, because both are now false.

The flow goes from ten screens to twelve:

| # | Screen | Component |
| --- | --- | --- |
| 1 | Part intro | `ListeningPartIntroScreen` |
| 2 | Scenario | `ListeningScenarioScreen` |
| 3 | Conversation audio | `ListeningAudioScreen` |
| 4 to 9 | Questions 1 to 6 | `ListeningQuestionScreen` |
| 10 | Answer review | `ListeningAnswerReviewScreen` |
| 11 | Practice score | `ListeningScoreScreen` |
| 12 | End of part | `ListeningPartEndScreen` |

The only code change behind that was dropping `{ ending: "complete" }` from
the `buildListeningFlow` call. The screen order is derived from the content,
so nothing else needed rewriting.

A thirteenth screen exists but is not in the flow: the marking screen, shown
in place of the review or the score while the server checks the answers. See
section 4.

## 2. Screens added

**Answer review.** Title `Listening Part 3 Answer Review`, subtitle
`Review your answers before viewing the score.` A six row table with the
question number, the option the learner chose, the correct option, and a
status word of `Correct`, `Incorrect` or `Unanswered`. Below it, the
collapsed answer sheet panel, and the notice that nothing is saved and this
is not an official CELPIP result. `View score` continues. `Back` lands on
Question 6 with the answer still selected, which is the prototype
affordance the ticket asks for.

**Practice score.** Title `Listening Part 3 Score`. Total questions 6, the
answered count, the correct count, and the percentage. Under it, the note
`This is a Toronto Academy practice result, not an official CELPIP score.`
Two controls in the canvas: `End Listening Part 3` and `Review answers`.

**End of part.** Title `End of Listening Part 3`, message
`You have completed Listening Part 3 of Mock Test 1.` A `Back to dashboard`
link, a `Restart Listening Part 3` button that clears the answers held on
the page, and the placeholder line
`Listening Part 4 will be added in the next ticket.`

No component was written for any of these. All three already existed and
already took a `copy` prop, so Part 3 needed one export in
`listening-review-copy.ts`:

```ts
export const listeningPartThreeReviewCopy = buildListeningReviewCopy({
  partLabel: "Listening Part 3",
  nextPartLabel: "Listening Part 4",
});
```

That is what EXAM-06 factored `buildListeningReviewCopy` out for, and
section 9 of `listening-part-2-review-score.md` predicted this exactly. The
prediction held: no shell component and no review component was edited in
this ticket, so Part 1 and Part 2 could not be affected by the parts of it
that matter.

## 3. Answer key handling

**The key was already complete and correct. Nothing was remapped.**

EXAM-07 transcribed all six entries from the Part 3 answer sheet. Each was
re-checked against the answer text in the ticket, by exact option text:

| Q | Confirmed answer | Option id | Match |
| --- | --- | --- | --- |
| 1 | He wants her to add a new task to her duties. | `listening-part-3-q1-d` | exact |
| 2 | It is currently having financial difficulties. | `listening-part-3-q2-a` | exact |
| 3 | a request for a room near a washroom | `listening-part-3-q3-c` | exact |
| 4 | so he can send an invoice | `listening-part-3-q4-d` | exact |
| 5 | contact her co-worker | `listening-part-3-q5-a` | exact |
| 6 | confident | `listening-part-3-q6-b` | exact |

No punctuation differed, so no closest match rule was needed, and no option
wording was changed to make a key fit.

**Where the key lives.** On the server, and it stays there. The route calls
`withoutListeningAnswerKey` before the content reaches the client component,
so the key is not in the page payload. The comparison therefore has to run
where the key is, which is `markListeningPartThree` in
`src/app/dashboard/mock-tests/mock-test-1/listening/part-3/actions.ts`. It
returns review rows and a score summary and never the key itself.

This is the Part 2 pattern, copied on purpose. Part 1 still marks in the
browser and still ships its key, which remains open follow up work, unchanged
by this ticket.

**The key is never shown on a question screen.** The only screen that prints
a correct answer is the answer review, after the last question.

The server action re-checks the session, because a page level auth check does
not extend to a server action, and it discards any submitted answer that does
not name a real question and a real option on it.

## 4. Score calculation rule

Marking is the untouched EXAM-04 helpers in
`src/features/exam-engine/listening-score.ts`. No scoring code was added or
changed in this ticket.

- total questions: 6
- answered: how many questions have an option selected
- correct: how many selected options match the key
- practice score: `round(correct / 6 * 100)`, as a whole percent

An unanswered question is `Unanswered`, never `Incorrect`, and it counts
against the percentage because the denominator is the whole part.

Question 1 has no recording in the source material. It is marked like any
other question. Its options and its key are intact, so the comparison is
sound, and removing it from the denominator would produce a score out of 5
that no screen explains. This resolves follow up item 5 in
`listening-part-3-prototype.md` the way that note recommended. The route
notice still says the recording is missing.

Nothing here produces a CELPIP score or a CELPIP level, and no screen shows
one.

## 5. What happens if answer keys are missing

Not the current state of Part 3, and the behaviour is worth stating anyway,
because it is what protects a learner from a content edit.

`buildListeningScoreSummary` withholds the result unless every question in
the part has a usable key. `correctCount` and `scorePercent` come back null,
the score screen prints `Answer key pending` in place of a number, and the
review rows read `Answer key pending` rather than `Incorrect`. A missing key
never makes a learner look wrong.

A key that names an option the question does not have is discarded and counts
as missing, so a stale id after a content edit suppresses the score rather
than marking everyone wrong.

## 6. Marking screen

Between Question 6 and the review there is a round trip to the server, which
is normally too fast to see and can fail. `Checking your answers` stands in
for the review while it runs. On failure it becomes
`Your answers could not be checked` with a `Try again` button, and Back still
works, so a failed check is never a dead end: the learner walks back to the
questions with every answer still selected.

The request id guard from Part 2 came across with it. A learner can leave the
review, change an answer and return faster than a reply arrives, and without
the guard the older reply would overwrite the newer one with a score for
answers they have already changed. Each request takes a number and a reply is
dropped unless its number is still the latest.

The five marking strings never named a part, so rather than adding an
identical Part 3 copy of each, EXAM-08 dropped the `part2` prefix from them
in `listening-copy.ts`. Both prototypes now read `markingHeading`,
`markingText`, `markingFailedHeading`, `markingFailedText` and
`markingRetryLabel`. The wording is unchanged character for character, so
Part 2 says exactly what it said before.

## 7. What is intentionally not built

- no database save, no attempt row, no Supabase migration
- no API route
- no cookie and no localStorage. A reload starts the part again
- no Listening Part 4, and no Listening Parts 5 to 6
- no full Listening section score
- no official CELPIP score and no official CELPIP level
- no Reading, Writing or Speaking work. No AI prompt or AI flow was touched
- no locked one time audio playback
- no timed countdown. The 30 second label on the question screens is still
  static
- no persisted attempt history
- no dependency installed

`part3CompleteHeading` and `part3RestartLabel` were retired from
`listening-copy.ts`, which was follow up item 6 in
`listening-part-3-prototype.md`. Part 3 no longer ends on the EXAM-05
completion screen. `ListeningPartCompleteScreen` and the equivalent Part 2
pair stay in place as the template for the first cut of a part whose review
does not exist yet.

## 8. How EXAM-09 should continue

1. **Listening Part 4, in two tickets, the way Parts 2 and 3 went.** Content
   and flow with `ending: "complete"` first, then the closing screens. The
   closing screens will again need nothing but a
   `buildListeningReviewCopy({ partLabel: "Listening Part 4" })` export, and
   `nextPartLabel` can be dropped on the last part built, which removes the
   placeholder line rather than inventing a next part.
2. **Copy the Part 2 and Part 3 key handling.** Strip in the route, mark in a
   server action, keep answers local. Part 1 is the outdated pattern.
3. **Close the Part 1 gap in its own ticket.** Part 1 still ships its answer
   key to the browser. Three parts now use the server side pattern and Part 1
   is the only one that does not, so the case for moving it is stronger than
   it was in EXAM-06.
4. **Three prototypes are now near identical.** Parts 1, 2 and 3 differ in
   where they mark and in which copy object they pass. Before Part 4 adds a
   fourth, consider one `ListeningPartPrototype` taking `content`,
   `markAnswers` and `copy`. That is a refactor ticket on its own, not
   something to fold into a content ticket.
5. **Decide where an in progress attempt lives before adding more parts.**
   Losing answers on reload is fine for one part and not fine for a full
   test. That needs a schema decision and a migration, neither of which
   belongs in a UI ticket.
6. **Media fidelity, in the EXAM-03 order:** gate Next on the clip ending,
   then one time playback, then autoplay on screen entry, then the real
   countdown. All three are engine wide and should land across every
   Listening part in one ticket.
7. **Supply the Question 1 recording.** Adding `audioUrl` to that question in
   the content file is the only change needed. Nothing else about the
   question or its marking has to move.
8. **Confirm the Listening question denominator before any section level
   score screen.** The content holds 38 Listening questions and the official
   score screen shows 37, which is open item 6 in
   `mock-test-1-content-map.md`. It does not affect this ticket, which scores
   one part out of 6.

---

## Files

Created:

- `src/app/dashboard/mock-tests/mock-test-1/listening/part-3/actions.ts`
- `docs/product/listening-part-3-review-score.md`

Changed:

- `src/components/exam/listening/ListeningPartThreePrototype.tsx`, renders
  the three closing screens plus the marking screen, adds restart, and takes
  the `markAnswers` prop.
- `src/app/dashboard/mock-tests/mock-test-1/listening/part-3/page.tsx`,
  passes the marking action down, plus notice wording and comments.
- `src/features/exam-engine/listening-review-copy.ts`, adds the Part 3
  export. No existing string changed.
- `src/features/exam-engine/listening-copy.ts`, renames the five marking
  strings off the `part2` prefix, retires the two Part 3 completion strings,
  and corrects the Part 3 preview description. No wording changed.
- `src/components/exam/listening/ListeningPartTwoPrototype.tsx`, the five
  renamed marking strings and nothing else.
- `src/features/exam-engine/mock-tests/mock-test-1/listening-part-3.ts`,
  comments only. The answer key was already complete and correct. See
  section 3.

Not changed:

- `src/features/exam-engine/listening-score.ts`. The scoring helpers did the
  job unmodified.
- `src/features/exam-engine/listening-review-types.ts`,
  `listening-flow.ts`, `listening-types.ts`.
- `ListeningAnswerReviewScreen.tsx`, `ListeningAnswerReviewTable.tsx`,
  `ListeningScoreScreen.tsx`, `ListeningScoreSummaryCard.tsx`,
  `ListeningPartEndScreen.tsx`. All five were already part agnostic.
- `ListeningPartOnePrototype.tsx` and the Part 1 route.
- Every EXAM-01 shell component.
- Every Reading, Writing and Speaking file, including all AI scoring logic
  and prompts.

## Manual test steps

1. Sign in and open `/dashboard/mock-tests/mock-test-1/listening/part-3`.
2. Walk to Question 1 and answer some but not all of the six questions. Leave
   at least one blank, and get at least one deliberately wrong.
3. Confirm no question screen shows a correct answer anywhere.
4. Press Next on Question 6. The answer review appears with all 6 rows. You
   may see `Checking your answers` first.
5. Check the rows: an answered question reads `Correct` or `Incorrect` and
   shows both the option you chose and the correct answer, a blank question
   reads `Unanswered` with `No answer selected`. No row should read
   `Answer key pending`.
6. Open `Show the answer and explanation sheet`. The Cloudinary image loads
   inside the panel. Confirm the correct answer column matches it, against
   the six answers in section 3. Close it again.
7. Press `Back`. You land on Question 6 with your answer still selected.
   Change it, press Next, and confirm the review reflects the new answer.
8. Press `View score`. Total questions reads 6, `Answered` reads your count
   out of 6, `Correct` reads how many you got right out of 6, and
   `Practice score` reads that as a percentage. The practice result note is
   shown and no CELPIP level appears anywhere.
9. Answer all six correctly on a fresh run and confirm the score reads 100%.
   Answer none and confirm it reads 0% with six `Unanswered` rows.
10. Press `Review answers`, confirm you land back on the review, then return
    and press `End Listening Part 3`.
11. On the end screen, confirm the line `Listening Part 4 will be added in
    the next ticket.` Press `Restart Listening Part 3`. You land on screen 1
    and every answer is cleared.
12. Press `Back to dashboard` to confirm the link works.
13. Reload mid part to confirm answers are not persisted anywhere.

To confirm the answer key is not in the browser payload:

14. Open devtools, reload the part, and search the page source and the RSC
    payload for `answerKey` and for `q1-d`. Neither should appear before you
    reach the review. After the review loads, the correct answer text is
    present, which is the intended behaviour.

To confirm Parts 1 and 2 still work:

15. Open `/dashboard/mock-tests/mock-test-1/listening/part-1`, answer the
    eight questions, and check that the review says `Listening Part 1 Answer
    Review`, the score says `Listening Part 1 Score`, the end screen says
    `End of Listening Part 1` with `Listening Part 2 will be added in the
    next ticket.`, and that the practice score is a real number.
16. Open `/dashboard/mock-tests/mock-test-1/listening/part-2`, answer the
    five questions, and check the same for Part 2, including that the
    marking screen still reads `Checking your answers` if you catch it.
