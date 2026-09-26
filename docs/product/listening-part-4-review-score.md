# Listening Part 4 answer review and practice score (EXAM-10)

Closes the local prototype cycle for Mock Test 1 Listening Part 4. EXAM-09
built the part and stopped on a completion screen. This ticket replaces that
screen with the answer review, the practice score and the end of part
screen.

Part 4 is the first dropdown completion part to reach the closing screens,
so this is also the ticket where the shared review and score machinery
learned to mark a part that prints its questions. Listening Parts 1, 2 and 3
are untouched by that change and still render exactly as they did.

Nothing is saved. No migration. No Listening Part 5.

## 1. Route updated

`src/app/dashboard/mock-tests/mock-test-1/listening/part-4/page.tsx`

Still one route, still behind the dashboard auth guard, still
`robots: noindex`. Two changes: it passes the marking action down, and the
standing notice no longer says the answer review and practice score are not
built, because they now are.

The flow goes from five screens to seven:

| # | Screen | Component |
| --- | --- | --- |
| 1 | Part intro | `ListeningPartIntroScreen` |
| 2 | Scenario | `ListeningScenarioScreen` |
| 3 | News item audio | `ListeningAudioScreen` |
| 4 | All five completion questions | `ListeningDropdownQuestionScreen` |
| 5 | Answer review | `ListeningAnswerReviewScreen` |
| 6 | Practice score | `ListeningScoreScreen` |
| 7 | End of part | `ListeningPartEndScreen` |

The only code change behind that was giving `buildListeningDropdownFlow` an
ending option that defaults to `"review"`, the way `buildListeningFlow` got
one in EXAM-05, and dropping the EXAM-09 single completion screen from the
default path. Listening Parts 5 and 6 can still ask for
`{ ending: "complete" }` and ship before their review does.

An eighth screen exists but is not in the flow: the marking screen, shown in
place of the review or the score while the server checks the answers. See
section 5.

## 2. Screens added

**Answer review.** Title `Listening Part 4 Answer Review`, subtitle
`Review your answers before viewing the score.` A five row table. Each row
carries the question number, the incomplete statement under it, the option
the learner chose, the correct option, and a status word of `Correct`,
`Incorrect` or `Unanswered`. Below the table, the collapsed answer sheet
panel, and the notice that nothing is saved and this is not an official
CELPIP result. `View score` continues. `Back` lands on the dropdown question
screen with all five selections still set, which is the prototype affordance
the ticket asks for.

**Practice score.** Title `Listening Part 4 Score`. Total questions 5, the
answered count, the correct count, and the percentage. Under it, the note
`This is a Toronto Academy practice result, not an official CELPIP score.`
Two controls in the canvas: `End Listening Part 4` and `Review answers`.

**End of part.** Title `End of Listening Part 4`, message
`You have completed Listening Part 4 of Mock Test 1.` A `Back to dashboard`
link, a `Restart Listening Part 4` button that clears the answers held on
the page, and the placeholder line
`Listening Part 5 will be added in the next ticket.`

All three are the existing EXAM-04 components with Part 4 wording passed in.
No screen component was copied. The wording is
`listeningPartFourReviewCopy`, three lines of configuration in
`listening-review-copy.ts`, built by the same `buildListeningReviewCopy` that
produces the Part 1, 2 and 3 wording.

## 3. Answer key handling

The answer key was already complete in
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-4.ts` from
EXAM-09. All five entries were confirmed again in this ticket and none of
them changed. Nothing was added and nothing was guessed.

| Question | Correct answer | Option id |
| --- | --- | --- |
| 1 | tearing up a $20 bill. | `listening-part-4-q1-d` |
| 2 | took a picture of her $20 bill. | `listening-part-4-q2-b` |
| 3 | had different numbers. | `listening-part-4-q3-a` |
| 4 | a school project. | `listening-part-4-q4-c` |
| 5 | stole money from his audience. | `listening-part-4-q5-b` |

Every value matches an existing option by exact text, punctuation included.
No option wording was changed to make a key fit.

The key never reaches the browser. `withoutListeningDropdownAnswerKey`
strips it on the server before the content is handed to the client
component, which EXAM-09 already did, and the marking happens on the server
where the key stays. See section 4. The dropdown question screen shows no
correct answer and no marking of any kind, and the review screen is the
first place a correct answer is printed.

## 4. Dropdown answer review behavior

A Part 4 question is an incomplete statement with a dropdown where the blank
falls, and its content type is `ListeningDropdownPartContent`, not the
`ListeningPartContent` the review helpers were written against in EXAM-04.
Two differences mattered, and neither is about marking:

- **Question list shape.** Parts 1 to 3 hold questions inside conversation
  sections. Part 4 has one flat list.
- **The question is printed.** Parts 1 to 3 speak their questions and print
  nothing, so a review row there is labelled `Question 3` and that is
  honest. A Part 4 row whose answer column reads
  `took a picture of her $20 bill.` says nothing without the statement it
  completes.

How that was handled, without touching Parts 1 to 3:

**`listening-score.ts` grew an internal core.** The marking rules moved down
into private functions that work on any list of questions carrying an id, a
number and options. Both `ListeningQuestion` and
`ListeningDropdownQuestion` satisfy that shape already, so neither had to be
converted. Two public surfaces sit on top of the core:

- `buildListeningReviewRows` and `buildListeningScoreSummary`, taking
  `ListeningPartContent`, for Parts 1 to 3. Same names, same signatures,
  same behaviour.
- `buildListeningDropdownReviewRows` and
  `buildListeningDropdownScoreSummary`, taking
  `ListeningDropdownPartContent`, for Part 4.

Nothing was widened to fit both. The two content types stay apart, which is
what keeps a dropdown part from being able to break a section part.

**`ListeningReviewRow` grew an optional `statement`.** It is set for a
dropdown part and unset for Parts 1 to 3. `ListeningAnswerReviewTable`
prints it under the question number when it is there and renders nothing
when it is not, so Parts 1 to 3 produce byte for byte the same table.

**The statement is formatted for reading, not for answering.**
`formatListeningStatementLabel` prints
`The magician was in trouble because he ...` The question screen draws the
blank as a row of underscores and reads it out as "blank", because that is
where the control goes. In the review the answer is already in the next
column, so the same underscores would only be noise.

**Unanswered rows.** A learner cannot normally reach the review with a blank
dropdown, because Next on the question screen is disabled until all five are
set. The `Unanswered` status is still implemented and still rendered, since
a direct call to the marking action can submit a partial set, and a partial
set must not read as five wrong answers.

## 5. Score calculation rule

Practice score only. `correct / total` as a whole percentage, rounded. No
official CELPIP score and no CELPIP level anywhere on the screen.

The calculation runs on the server inside `markListeningPartFour`, in
`src/app/dashboard/mock-tests/mock-test-1/listening/part-4/actions.ts`. The
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
   Part 4 question and a real option on that question is dropped, rather
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
screen with all five dropdowns still set.

No database write, no attempt row, no cookie and no `localStorage`. A page
reload starts the part again.

## 6. What happens if answer keys are missing

Part 4's key is complete, so none of this is visible today. It is the
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
- no Listening Part 5 and no Listening Part 6
- no Reading, Writing or Speaking work of any kind
- no official CELPIP score
- no official CELPIP level
- no locked one time audio playback yet: the news item can still be
  replayed, and Next does not wait for it to finish, even though the
  instructions say it is heard once
- no timed countdown yet
- no payment and no live classes
- no Supabase migration, no API route, no service role call, no auth change
- no official screenshots used as public UI images and no official CELPIP
  branding in the UI

## 8. How EXAM-11 should continue

Listening Part 5, Listening to a Discussion. It is the second dropdown
completion part, so most of this ticket is already reusable:

1. **Content object.** A new `listening-part-5.ts` typed as
   `ListeningDropdownPartContent`. Part 5 is a video rather than an audio
   clip, which is why the media field is `url` and not `audioUrl`. The media
   screen is the one piece that has to change.
2. **Statements with a tail.** Every blank in Part 4 ends its statement, so
   `textAfter` is unset throughout. Part 5 has blanks mid sentence. Both the
   question list and `formatListeningStatementLabel` already handle
   `textAfter`, but neither has been exercised with real content, so it is
   worth checking on screen rather than assuming.
3. **Ship the part first, review second.** Build Part 5 with
   `buildListeningDropdownFlow(content, { ending: "complete" })`, the way
   EXAM-09 shipped Part 4, then swap to the default `"review"` ending in the
   following ticket once the key is confirmed. The ending option exists for
   exactly this.
4. **Closing screens.** Three lines of wording in `listening-review-copy.ts`
   and a marking action beside the Part 5 route. No new screen component
   should be needed.
5. **Then the section.** Only once Parts 1 to 6 exist individually is there
   anything to say about a full Listening section score, and that is where
   a database backed test session starts to be worth building.
