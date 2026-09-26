# Listening Part 5 answer review and practice score (EXAM-12)

Closes the local prototype cycle for Mock Test 1 Listening Part 5. EXAM-11
built the part and stopped on a completion screen. This ticket replaces that
screen with the answer review, the practice score and the end of part
screen.

Part 5 is the first video discussion part to reach the closing screens, so
this is also the ticket where the shared review and score machinery learned
to mark a part whose questions are printed in full and answered from radio
groups. Listening Parts 1, 2, 3 and 4 are untouched by that change and still
render exactly as they did.

Nothing is saved. No migration. No Listening Part 6.

## 1. Route updated

`src/app/dashboard/mock-tests/mock-test-1/listening/part-5/page.tsx`

Still one route, still behind the dashboard auth guard, still
`robots: noindex`. Two changes: it passes the marking action down, and the
standing notice no longer says the answer review and practice score are not
built, because they now are.

The flow goes from five screens to seven:

| # | Screen | Component |
| --- | --- | --- |
| 1 | Part intro | `ListeningPartIntroScreen` |
| 2 | Scenario | `ListeningScenarioScreen` |
| 3 | Discussion video | `ListeningVideoScreen` |
| 4 | All eight multiple-choice questions | `ListeningVideoQuestionScreen` |
| 5 | Answer review | `ListeningAnswerReviewScreen` |
| 6 | Practice score | `ListeningScoreScreen` |
| 7 | End of part | `ListeningPartEndScreen` |

The only code change behind that was giving `buildListeningVideoFlow` an
ending option that defaults to `"review"`, the way `buildListeningFlow` got
one in EXAM-05 and `buildListeningDropdownFlow` got one in EXAM-10, and
dropping the EXAM-11 single completion screen from the default path. A video
part built before its review exists can still ask for
`{ ending: "complete" }` and ship.

An eighth screen exists but is not in the flow: the marking screen, shown in
place of the review or the score while the server checks the answers. See
section 5.

## 2. Screens added

**Answer review.** Title `Listening Part 5 Answer Review`, subtitle
`Review your answers before viewing the score.` An eight row table. Each row
carries the question number, the printed question under it, the option the
learner chose, the correct option, and a status word of `Correct`,
`Incorrect` or `Unanswered`. Below the table, the collapsed answer sheet
panel, and the notice that nothing is saved and this is not an official
CELPIP result. `View score` continues. `Back` lands on the question screen
with all eight selections still set, which is the prototype affordance the
ticket asks for.

**Practice score.** Title `Listening Part 5 Score`. Total questions 8, the
answered count, the correct count, and the percentage. Under it, the note
`This is a Toronto Academy practice result, not an official CELPIP score.`
Two controls in the canvas: `End Listening Part 5` and `Review answers`.

**End of part.** Title `End of Listening Part 5`, message
`You have completed Listening Part 5 of Mock Test 1.` A `Back to dashboard`
link, a `Restart Listening Part 5` button that clears the answers held on
the page, and the placeholder line
`Listening Part 6 will be added in the next ticket.`

All three are the existing EXAM-04 components with Part 5 wording passed in.
No screen component was copied and no screen component was changed. The
wording is `listeningPartFiveReviewCopy`, three lines of configuration in
`listening-review-copy.ts`, built by the same `buildListeningReviewCopy`
that produces the Part 1, 2, 3 and 4 wording.

`listeningCopy.part5CompleteHeading` and `listeningCopy.part5RestartLabel`
are gone, the way the Part 3 and Part 4 pairs went when their reviews
shipped. They belonged to the EXAM-11 completion screen, which the default
flow no longer builds.

## 3. Answer key handling

The answer key was already complete in
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-5.ts` from
EXAM-11. All eight entries were confirmed again in this ticket and none of
them changed. Nothing was added and nothing was guessed.

| Question | Correct answer | Option id |
| --- | --- | --- |
| 1 | the format of the event | `listening-part-5-q1-b` |
| 2 | Their company regularly organizes fundraisers. | `listening-part-5-q2-c` |
| 3 | generating ideas | `listening-part-5-q3-a` |
| 4 | the chosen recipient of the funds | `listening-part-5-q4-b` |
| 5 | Bidders can make high bids for items they want. | `listening-part-5-q5-d` |
| 6 | It will encourage bidders to bid low. | `listening-part-5-q6-c` |
| 7 | It takes too long to process the results. | `listening-part-5-q7-d` |
| 8 | They will request outside input. | `listening-part-5-q8-c` |

Every value matches an existing option by exact text, punctuation included.
No option wording was changed to make a key fit.

The key never reaches the browser. `withoutListeningVideoAnswerKey` strips
it on the server before the content is handed to the client component, which
EXAM-11 already did, and the marking happens on the server where the key
stays. See section 5. The question screen shows no correct answer and no
marking of any kind, and the review screen is the first place a correct
answer is printed.

## 4. Video question answer review behavior

A Part 5 question is a whole question printed on screen and answered from a
radio group, and its content type is `ListeningVideoPartContent`, not the
`ListeningPartContent` the review helpers were written against in EXAM-04
nor the `ListeningDropdownPartContent` EXAM-10 added. Two differences
mattered, and neither is about marking:

- **Question list shape.** Parts 1 to 3 hold questions inside conversation
  sections. Part 5 has one flat list, like Part 4.
- **The question is printed.** Parts 1 to 3 speak their questions and print
  nothing, so a review row there is labelled `Question 3` and that is
  honest. A Part 5 row whose answer column reads `generating ideas` says
  nothing without the question it answers.

How that was handled, without touching Parts 1 to 4:

**`listening-score.ts` grew a third adapter, not a third set of rules.**
EXAM-10 already moved the marking rules down into private functions that
work on any list of questions carrying an id, a number and options.
`ListeningVideoQuestion` satisfies that shape already, so nothing had to be
converted and no rule had to be written twice. The public surfaces are now:

- `buildListeningReviewRows` and `buildListeningScoreSummary`, taking
  `ListeningPartContent`, for Parts 1 to 3. Same names, same signatures,
  same behaviour.
- `buildListeningDropdownReviewRows` and
  `buildListeningDropdownScoreSummary`, taking
  `ListeningDropdownPartContent`, for Part 4. Unchanged.
- `buildListeningVideoReviewRows` and `buildListeningVideoScoreSummary`,
  taking `ListeningVideoPartContent`, for Part 5. New in this ticket.

Nothing was widened to fit all three. The three content types stay apart,
which is what keeps a video part from being able to break a dropdown part or
a section part.

**No component changed.** The optional `statement` field on
`ListeningReviewRow` is the EXAM-10 field, and a Part 5 row sets it to the
question prompt. `ListeningAnswerReviewTable` prints it under the question
number when it is there and renders nothing when it is not, so Parts 1 to 4
produce byte for byte the same tables. The review screen, the score screen,
the score card and the end screen were all already part agnostic.

**The number stays the row label.** The row is headed `Question 4` with the
question underneath, rather than being headed by the question itself. The
answer columns are read against a numbered list, and a row headed by a whole
sentence loses the one thing that ties it back to the question screen.

**Unanswered rows.** A learner cannot normally reach the review with a
question blank, because Next on the question screen is disabled until all
eight are answered. The `Unanswered` status is still implemented and still
rendered, since a direct call to the marking action can submit a partial
set, and a partial set must not read as eight wrong answers.

## 5. Score calculation rule

Practice score only. `correct / total` as a whole percentage, rounded. No
official CELPIP score and no CELPIP level anywhere on the screen.

The calculation runs on the server inside `markListeningPartFive`, in
`src/app/dashboard/mock-tests/mock-test-1/listening/part-5/actions.ts`. The
learner's answers are held in local React state in the browser as
`{ questionId: selectedOptionId }`, sent to the action when they walk onto
the review screen, and only the finished result comes back: review rows and
a score summary. The key is never serialized to the client in either
direction.

The action does three things before it marks:

1. **Verifies the session.** A page level auth check does not extend to a
   server action defined for that page, so the caller is checked again.
   No session returns `null`.
2. **Sanitizes the submission.** A server action is reachable by direct
   POST, so the argument is untrusted. Anything that does not name a real
   Part 5 question and a real option on that question is dropped, rather
   than the whole submission being rejected.
3. **Marks and summarizes**, using the shared helpers.

Marking is requested from the handler that walks onto the review screen, not
from an effect. Answers cannot change while the review is showing without
going back to the question screen first, so that is exactly the moment the
result is needed and exactly the moment it is known to be current. Every
request takes a sequence number and a reply is discarded unless its number
is still the latest, so a learner who goes back, changes an answer and
returns faster than the first reply arrives cannot be shown a stale score.

While the request is in flight, and if it fails, the marking screen stands
in for the review or the score. It carries a retry, and Back still works, so
a failed check is never a dead end: the learner walks back to the question
screen with all eight options still selected.

No database write, no attempt row, no API route, no cookie and no
`localStorage`. A page reload starts the part again.

## 6. What happens if answer keys are missing

Part 5's key is complete, so none of this is visible today. It is the
behaviour the shared helpers guarantee, and it is what protects the part if
an option id is ever edited out from under the key.

The rule the scoring is built around: a missing answer key must never make a
learner look wrong.

- A question with no usable key gets the status `Answer key pending`, not
  `Incorrect`. Its correct answer cell reads `Answer key pending` rather
  than sitting blank, because a blank cell reads as a missing answer from
  the learner, which is the wrong story.
- A key naming an option the question does not have is discarded and counts
  as missing. A stale id is a content bug, and marking every learner wrong
  because of it would be the worst possible answer.
- The score is withheld entirely until every question in the part has a
  usable key. `correctCount` and `scorePercent` come back as `null`, and
  the score card prints `Pending` in those two cells plus a short block
  saying how many keys are missing. It never prints a number calculated
  against a partial key.
- `Answer key pending` is coloured the same quiet navy as `Unanswered`, not
  red. It is a statement about the key, never about the learner.

## 7. What is intentionally not built

- no database save, no attempt history, no persisted result
- no full Listening section score
- no Listening Part 6
- no Reading, Writing or Speaking work of any kind
- no change to the Speaking or Writing AI flows and no change to any AI
  scoring prompt
- no official CELPIP score
- no official CELPIP level
- no locked one time video playback yet: the discussion video can still be
  replayed, and Next does not wait for it to finish
- no timed countdown yet
- no payment and no live classes
- no Supabase migration, no API route, no service role call, no auth change
- no official screenshots used as public UI images and no official CELPIP
  branding in the UI

## 8. How EXAM-13 should continue

Listening Part 6, Listening to Viewpoints. Most of this ticket is reusable,
and the one open question is the shape of the content:

1. **Content object.** A new `listening-part-6.ts`. Check the source
   document before picking a type. Part 6 is an audio monologue with
   multiple-choice questions, so it is closest to
   `ListeningVideoPartContent` minus the video, which means either a fourth
   shape or a small widening of the media field on an existing one. Decide
   that from the content, not from convenience.
2. **Ship the part first, review second.** Build Part 6 with the
   `{ ending: "complete" }` ending, the way EXAM-11 shipped Part 5, then
   swap to the default `"review"` ending in the following ticket once the
   key is confirmed. The ending option exists for exactly this.
3. **Closing screens.** Three lines of wording in `listening-review-copy.ts`
   and a marking action beside the Part 6 route, with `nextPartLabel` left
   unset so the end screen drops the placeholder line. Part 6 is the last
   Listening part, so there is no next part to name. No new screen component
   should be needed.
4. **Then the section.** Only once Parts 1 to 6 exist individually is there
   anything to say about a full Listening section score, and that is where
   a database backed test session starts to be worth building.
