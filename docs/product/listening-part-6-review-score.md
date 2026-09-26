# Listening Part 6 answer review and practice score (EXAM-14)

Closes the local prototype cycle for Mock Test 1 Listening Part 6. EXAM-13
built the part and stopped on a completion screen. This ticket replaces that
screen with the answer review, the practice score and the end of part
screen.

Part 6 is the first viewpoints part to reach the closing screens, so this is
also the ticket where the shared review and score machinery learned to mark
a part whose questions are incomplete statements answered from radio groups.
Listening Parts 1, 2, 3, 4 and 5 are untouched by that change and still
render exactly as they did.

It is also the last Listening part, so this ticket ends the run of one part
per pair of tickets. What it does not do is add up the six parts. Nothing is
saved. No migration. No Listening section result.

## 1. Route updated

`src/app/dashboard/mock-tests/mock-test-1/listening/part-6/page.tsx`

Still one route, still behind the dashboard auth guard, still
`robots: noindex`. Two changes: it passes the marking action down, and the
standing notice no longer says the answer review and practice score are not
built, because they now are.

The flow goes from five screens to seven:

| # | Screen | Component |
| --- | --- | --- |
| 1 | Part intro | `ListeningPartIntroScreen` |
| 2 | Scenario | `ListeningScenarioScreen` |
| 3 | Report audio | `ListeningViewpointsScreen` |
| 4 | All six viewpoints questions | `ListeningViewpointsQuestionScreen` |
| 5 | Answer review | `ListeningAnswerReviewScreen` |
| 6 | Practice score | `ListeningScoreScreen` |
| 7 | End of part | `ListeningPartEndScreen` |

The only code change behind that was giving `buildListeningViewpointsFlow`
an ending option that defaults to `"review"`, the way `buildListeningFlow`
got one in EXAM-05, `buildListeningDropdownFlow` got one in EXAM-10 and
`buildListeningVideoFlow` got one in EXAM-12, and dropping the EXAM-13
single completion screen from the default path. A viewpoints part built
before its review exists can still ask for `{ ending: "complete" }` and
ship.

An eighth screen exists but is not in the flow: the marking screen, shown in
place of the review or the score while the server checks the answers. See
section 5.

A new file sits beside the route:
`src/app/dashboard/mock-tests/mock-test-1/listening/part-6/actions.ts`. It
is a server action, not an API route, and it holds the marking. Both the
Part 6 content file and the Part 6 route comment written by EXAM-13 name it
as the thing this ticket should add, for the reason in section 5.

## 2. Screens added

**Answer review.** Title `Listening Part 6 Answer Review`, subtitle
`Review your answers before viewing the score.` A six row table. Each row
carries the question number, the incomplete statement under it, the option
the learner chose, the correct option, and a status word of `Correct`,
`Incorrect` or `Unanswered`. Below the table, the collapsed answer sheet
panel, and the notice that nothing is saved and this is not an official
CELPIP result. `View score` continues. `Back` lands on the question screen
with all six selections still set, which is the prototype affordance the
ticket asks for.

**Practice score.** Title `Listening Part 6 Score`. Total questions 6, the
answered count, the correct count, and the percentage. Under it, the note
`This is a Toronto Academy practice result, not an official CELPIP score.`
Two controls in the canvas: `End Listening Part 6` and `Review answers`.

**End of part.** Title `End of Listening Part 6`, message
`You have completed Listening Part 6 of Mock Test 1.` A `Back to dashboard`
link, a `Restart Listening Part 6` button that clears the answers held on
the page, and the placeholder line
`Full Listening section result will be added in a later ticket.`

All three are the existing EXAM-04 components with Part 6 wording passed in.
No screen component was copied and no screen component was changed. The
wording is `listeningPartSixReviewCopy`, built by the same
`buildListeningReviewCopy` that produces the Part 1 to Part 5 wording.

`buildListeningReviewCopy` did gain one optional field, `nextStepText`,
which writes the end screen placeholder line out instead of generating it
from `nextPartLabel`. Part 6 is the last Listening part, so the generated
sentence would have been wrong in both halves: there is no Listening Part 7,
and what follows is the full Listening section result, which is a later
ticket rather than the next one. Parts 1 to 5 leave the new field unset and
their line is generated exactly as before, character for character.

`listeningCopy.part6CompleteHeading` and `listeningCopy.part6RestartLabel`
are gone, the way the Part 3, Part 4 and Part 5 pairs went when their
reviews shipped. They belonged to the EXAM-13 completion screen, which the
default flow no longer builds. The Part 2 pair stays as the template for the
first cut of a part that has no review yet.

## 3. Answer key handling

The answer key was already complete in
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-6.ts` from
EXAM-13. All six entries were confirmed again in this ticket against the
values in the EXAM-14 ticket and none of them changed. Nothing was added and
nothing was guessed.

| Question | Correct answer | Option id |
| --- | --- | --- |
| 1 | approve a plan to redevelop the vacant land. | `listening-part-6-q1-a` |
| 2 | could put her community at risk. | `listening-part-6-q2-d` |
| 3 | may be developed into a nature walkway. | `listening-part-6-q3-d` |
| 4 | compact community with a vibrant local economy. | `listening-part-6-q4-b` |
| 5 | both economic and community interests can be satisfied. | `listening-part-6-q5-a` |
| 6 | Mother of two, Eleanor Wentworth, will be disappointed. | `listening-part-6-q6-a` |

Every value matches an existing option by exact text, punctuation included.
No option wording was changed to make a key fit. Each entry carries
`source: "answer-image"`, because the values were read off the Part 6 answer
screenshot rather than out of the source document text, and each is
annotated with its option text in a trailing comment so a later edit to an
option cannot quietly move an answer.

The key never reaches the browser. `withoutListeningViewpointsAnswerKey`
strips it on the server before the content is handed to the client
component, which EXAM-13 already did, and the marking happens on the server
where the key stays. See section 5. The question screen shows no correct
answer and no marking of any kind, and the review screen is the first place
a correct answer is printed.

## 4. Viewpoints question answer review behavior

A Part 6 question is an incomplete statement printed on screen and completed
from a radio group, and its content type is
`ListeningViewpointsPartContent`. That is the fourth Listening content
shape, after `ListeningPartContent` for Parts 1 to 3,
`ListeningDropdownPartContent` for Part 4 and `ListeningVideoPartContent`
for Part 5. It sits between the last two: the statement shape of a dropdown
part with the control of a video part.

For the review, only the statement half matters. The control a question was
answered with is invisible to marking, which compares two option ids.

How that was handled, without touching Parts 1 to 5:

**`listening-score.ts` grew a fourth adapter, not a fourth set of rules.**
EXAM-10 already moved the marking rules down into private functions that
work on any list of questions carrying an id, a number and options.
`ListeningViewpointsQuestion` satisfies that shape already, so nothing had
to be converted and no rule had to be written twice. The public surfaces are
now:

- `buildListeningReviewRows` and `buildListeningScoreSummary`, taking
  `ListeningPartContent`, for Parts 1 to 3. Same names, same signatures,
  same behaviour.
- `buildListeningDropdownReviewRows` and
  `buildListeningDropdownScoreSummary`, taking
  `ListeningDropdownPartContent`, for Part 4. Unchanged.
- `buildListeningVideoReviewRows` and `buildListeningVideoScoreSummary`,
  taking `ListeningVideoPartContent`, for Part 5. Unchanged.
- `buildListeningViewpointsReviewRows` and
  `buildListeningViewpointsScoreSummary`, taking
  `ListeningViewpointsPartContent`, for Part 6. New in this ticket.

Nothing was widened to fit all four. The four content types stay apart,
which is what keeps a viewpoints part from being able to break a video part,
a dropdown part or a section part.

**The statement is what the row carries.** A Part 6 row sets the optional
`statement` field on `ListeningReviewRow` to the incomplete statement, built
by `formatListeningStatementLabel`, which is the same helper a Part 4 row
uses. So a row reads `Question 3` with `Stanley Creek ...` underneath, and
the answer columns finish the sentence. Without it the review would be a
list of sentence fragments with nothing to attach them to:
`may be developed into a nature walkway.` beside `Question 3` says nothing
about what was being asked.

The blank prints as three dots rather than the row of underscores the
question screen draws. On the question screen the underscores mark where the
control goes; in the review the answer is already in the next column, so the
same underscores would only be noise. Every Mock Test 1 Part 6 blank ends
its statement, so no row prints trailing text, and a part whose blank falls
mid sentence would print the tail after the dots with no change needed.

`describeViewpointsQuestion` is deliberately a twin of
`describeDropdownQuestion` rather than a reuse of it. The two take different
question types, and merging them would mean widening one part's describe
function to accept the other part's content, which is the coupling the
sibling type files were split up to avoid. The shared work is already in
`formatListeningStatementLabel`.

**No component changed.** `ListeningAnswerReviewTable` prints `statement`
under the question number when it is there and renders nothing when it is
not, so Parts 1 to 5 produce byte for byte the same tables. The review
screen, the score screen, the score card and the end screen were all already
part agnostic.

**The number stays the row label.** The row is headed `Question 4` with the
statement underneath, rather than being headed by the statement itself. The
answer columns are read against a numbered list, and a row headed by a
sentence loses the one thing that ties it back to the question screen.

**Unanswered rows.** A learner cannot normally reach the review with a
question blank, because Next on the question screen is disabled until all
six are answered. The `Unanswered` status is still implemented and still
rendered, since a direct call to the marking action can submit a partial
set, and a partial set must not read as six wrong answers.

## 5. Score calculation rule

Practice score only. `correct / total` as a whole percentage, rounded. No
official CELPIP score and no CELPIP level anywhere on the screen.

The calculation runs on the server inside `markListeningPartSix`, in
`src/app/dashboard/mock-tests/mock-test-1/listening/part-6/actions.ts`. The
learner's answers are held in local React state in the browser as
`{ questionId: selectedOptionId }`, sent to the action when they walk onto
the review screen, and only the finished result comes back: review rows and
a score summary. The key is never serialized to the client in either
direction.

That split is why marking is a server action rather than something the
prototype does in the browser. A client component receives its props as
serialized data, so a complete key handed down that way is readable in the
page payload before a learner has answered anything. Part 6 has a complete
key, so the comparison has to happen where the key lives. Parts 2 to 5 all
work this way.

The action does three things before it marks:

1. **Verifies the session.** A page level auth check does not extend to a
   server action defined for that page, so the caller is checked again.
   No session returns `null`.
2. **Sanitizes the submission.** A server action is reachable by direct
   POST, so the argument is untrusted. Anything that does not name a real
   Part 6 question and a real option on that question is dropped, rather
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
screen with all six options still selected.

No database write, no attempt row, no API route, no cookie and no
`localStorage`. A page reload starts the part again.

## 6. What happens if answer keys are missing

Part 6's key is complete, so none of this is visible today. It is the
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
- no full Listening section score and no Listening section result screen
- no Reading, Writing or Speaking work of any kind
- no change to the Speaking or Writing AI flows and no change to any AI
  scoring prompt
- no official CELPIP score
- no official CELPIP level
- no locked one time audio playback yet: the report can still be replayed,
  and Next does not wait for it to finish
- no timed countdown yet
- no full Mock Test 1 section assembly yet
- no payment and no live classes
- no Supabase migration, no API route, no service role call, no auth change
- no official screenshots used as public UI images and no official CELPIP
  branding in the UI

## 8. How the next Listening ticket should continue

All six Listening parts now exist individually, each with its own review and
practice score, so the next ticket is the first one with something to add
up. Suggested order:

1. **The Listening section result.** Six part summaries into one Listening
   result: total questions 48, answered, correct, and a percentage. The
   `ListeningScoreSummary` shape is already the right unit to combine, and
   the four `build...ScoreSummary` adapters in `listening-score.ts` all
   return it, so a section summary is a fold over six of them rather than
   new marking. Keep it a practice result, with no CELPIP score and no
   CELPIP level, and keep the note that says so.
2. **A section flow above the part flows.** Six routes with no way from one
   to the next is the real gap. That means deciding where a part ends and
   the section continues, which is also where the Part 1 to Part 6 end
   screens stop being the end of anything.
3. **Then persistence.** A section result is the first thing worth saving,
   because it is the first thing a learner would want back later. That is
   where a database backed test session starts to be worth building, and it
   is the point at which the answer maps held in local state need somewhere
   to go. Everything before this ticket is deliberately reload and forget.
4. **Then the exam conditions.** Single playback, the countdown, and Back
   being disabled. All three are prototype affordances today, listed on
   every part screen notice, and all three should land together rather than
   part by part.
