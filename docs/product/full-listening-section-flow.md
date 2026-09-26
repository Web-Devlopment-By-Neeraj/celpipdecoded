# Full Listening Section Flow (EXAM-15)

Mock Test 1 Listening, assembled from the six part prototypes into one
complete CELPIP-style Listening section run.

House style note: normal hyphens only, no long hyphens or em dashes.

## 1. Route created

```
/dashboard/mock-tests/mock-test-1/listening
```

Source: `src/app/dashboard/mock-tests/mock-test-1/listening/page.tsx`

It is a protected route. It sits under `/dashboard`, where the layout auth
guard covers it, and the page verifies the session again close to the
content because layouts do not re-render on client navigation. It carries
`robots: { index: false, follow: false }` and is absent from navigation.

The six part level prototype routes are unchanged and still work:

- `/dashboard/mock-tests/mock-test-1/listening/part-1`
- `/dashboard/mock-tests/mock-test-1/listening/part-2`
- `/dashboard/mock-tests/mock-test-1/listening/part-3`
- `/dashboard/mock-tests/mock-test-1/listening/part-4`
- `/dashboard/mock-tests/mock-test-1/listening/part-5`
- `/dashboard/mock-tests/mock-test-1/listening/part-6`

They remain the internal way to check one part, and they still show their
own answer review, practice score and end of part screen. Nothing about
them was edited by this ticket.

A dashboard entry point was added to `ExamShellPreviewLink`, titled
"Mock Test 1 Full Listening Section" and marked Internal preview, beside
the six part cards.

## 2. Full screen sequence

The section is one local client-side flow. `buildListeningSectionFlow`
derives the order from the content rather than typing it out, so a part
gaining a question changes the data and nothing else. For Mock Test 1 it
produces 54 screens:

| # | Screen | Count |
| --- | --- | --- |
| 1 | Listening instruction text screen | 1 |
| 2 | Listening instructional video screen | 1 |
| 3 | Listening Part 1: intro, scenario, 3 conversation clips, 2 section breaks, 8 question screens | 15 |
| 4 | Part 1 to Part 2 transition | 1 |
| 5 | Listening Part 2: intro, scenario, conversation clip, 5 question screens | 8 |
| 6 | Part 2 to Part 3 transition | 1 |
| 7 | Listening Part 3: intro, scenario, conversation clip, 6 question screens | 9 |
| 8 | Part 3 to Part 4 transition | 1 |
| 9 | Listening Part 4: intro, scenario, news audio, 5 dropdown questions on one screen | 4 |
| 10 | Part 4 to Part 5 transition | 1 |
| 11 | Listening Part 5: intro, scenario, discussion video, 8 multiple-choice questions on one screen | 4 |
| 12 | Part 5 to Part 6 transition | 1 |
| 13 | Listening Part 6: intro, scenario, report audio, 6 viewpoints questions on one screen | 4 |
| 14 | Full Listening answer review | 1 |
| 15 | Full Listening practice score | 1 |
| 16 | End of Listening section | 1 |

**No part level score appears anywhere inside the run.** That is the point
of the ticket, and it is enforced one level down rather than by the
prototype component remembering not to draw it: each part flow is asked
for its `{ ending: "complete" }` ending, which is the shortest of the two
the four builders offer, and even that ending's single completion screen is
filtered out. So the six parts contribute question screens only, and the
section closes once.

The transition screens carry the part that finished, the part that is
starting, and the progress bar. They carry no count of what was correct.

## 3. Parts included

All six, in test order, each reading the same content file its part level
route reads:

| Part | Content file | Content shape | Screen style |
| --- | --- | --- | --- |
| Listening Part 1, Listening to Problem Solving | `listening-part-1.ts` | `ListeningPartContent` | one question per screen |
| Listening Part 2, Listening to a Daily Life Conversation | `listening-part-2.ts` | `ListeningPartContent` | one question per screen |
| Listening Part 3, Listening for Information | `listening-part-3.ts` | `ListeningPartContent` | one question per screen |
| Listening Part 4, Listening to a News Item | `listening-part-4.ts` | `ListeningDropdownPartContent` | all questions on one screen, dropdowns |
| Listening Part 5, Listening to a Discussion | `listening-part-5.ts` | `ListeningVideoPartContent` | all questions on one screen, radio options |
| Listening Part 6, Listening for Viewpoints | `listening-part-6.ts` | `ListeningViewpointsPartContent` | all questions on one screen, radio options |

`full-listening-section.ts` adds no question, option, clip URL or answer
key of its own. It adds three facts per part that the content objects do
not carry: the part number, the part label a learner reads
("Listening Part 3"), and the Format line for the intro card. Those three
were previously typed into the six prototype components.

No fifth content shape was introduced. A part in the section is one of the
four existing shapes plus those three labels.

## 4. Question count

| Part | Questions |
| --- | --- |
| Part 1 | 8 |
| Part 2 | 5 |
| Part 3 | 6 |
| Part 4 | 5 |
| Part 5 | 8 |
| Part 6 | 6 |
| **Total** | **38** |

The count is read from the content by `countListeningSectionQuestions`,
never typed into the score path, so the score is out of whatever the
content actually holds. The "38" on the instruction screen intro card is
display text and is the one place the number is written out.

## 5. Answer state strategy

One combined map for all six parts:

```
{ questionId: selectedOptionId }
```

Held in local React state in `ListeningSectionPrototype`, which stays
mounted for the whole section.

- One map works because the question ids are unique across the six Mock
  Test 1 content files, so no part prefix and no nesting is needed.
- Back and Next preserve answers, including across a part boundary in
  either direction, because answers are keyed by question id rather than
  by screen position.
- Restart clears all 38 answers and returns to the instruction screen.
  They are all in that one map, so there is nothing else to clear.
- No localStorage. No cookies. No database save. No Supabase migration. A
  page reload starts the section again.

## 6. Secure scoring strategy

The same secure server-action pattern the Part 2 to Part 6 review tickets
use, applied once for the whole section. No API route was added, because
the existing pattern is a server action.

1. All six Listening parts have complete, confirmed answer keys, held in
   the content files.
2. The route calls `withoutListeningSectionAnswerKeys` on the server
   before rendering. It delegates to the four existing per shape strip
   helpers, so every part level key and every per question
   `correctOptionId` is removed. The client component never receives an
   answer key, so nothing readable in the page payload or the flight data
   gives an answer away before the learner has finished.
3. The learner's answers stay in local React state in the browser.
4. On entering the answer review, the prototype calls the server action
   `markListeningSection` in
   `src/app/dashboard/mock-tests/mock-test-1/listening/actions.ts`, beside
   the route and next to the keys.
5. The action verifies the session again with `supabase.auth.getUser` and
   returns `null` when there is none. A page level check does not extend
   to a server action defined for it, and the correct answers for all 38
   questions are part of the reply, so this check is what stands between a
   signed out request and the whole section answer key.
6. The action sanitizes the submitted map with
   `sanitizeListeningSectionAnswers`, keeping only answers that name a
   real question in the section and a real option on that question. A
   server action is reachable by direct POST, so the argument is untrusted
   input.
7. It returns review rows and counts per part, plus the section totals.
   Neither half carries the key itself, so nothing in the reply lets a
   caller work out an answer it was not given.
8. No database write, no attempt row, and no persistence of any kind. The
   Supabase client is used for one thing: reading the caller's session.

Marking adds no new rule. Each part is marked by the adapter it already
used in `listening-score.ts`, so a question checked through the full
section and the same question checked through its part level route get the
same answer from the same code.

A marking screen stands in for the review and the score while the request
is in flight, and carries a retry when it fails. Back still works from it,
so a failed check is never a dead end. A request id ref drops a stale reply
so a slow answer cannot overwrite a newer one.

### Known gap outside this ticket

`/dashboard/mock-tests/mock-test-1/listening/part-1` still hands
`listeningPart1` to its client prototype without stripping the key. Its
page comment describes the key as untranscribed, which was true when
EXAM-03 wrote it and is not true now. Parts 2 to 6 all strip. That is a
Part 1 route change, not a full section change, so this ticket did not
make it. It should be picked up on its own.

## 7. Final review behaviour

Screen: `ListeningSectionReviewScreen`, reached with Next from the last
question screen of Part 6.

- Title: Listening Answer Review
- Subtitle: Review your answers before viewing your practice score.
- Progress bar and the answered count over 38
- Six groups, one per part, in test order. Each group heads with the part
  label, the part name, and how many of that part's questions were
  answered.
- Under each heading, the EXAM-04 review table, reused rather than
  rewritten: question number, the printed statement where the part prints
  one, the option the learner chose, the correct option, and a status word
  of correct, incorrect, unanswered, or answer key pending.
- Forward control: **View Listening score**
- Back returns to the last question screen of Part 6, with every answer
  still selected. That is a prototype affordance and would not exist in an
  official-style run.
- A notice under the tables repeats that nothing is saved and this is not
  an official CELPIP result.

The group heading carries the answered count and never a correct count.
Putting a part result there would be the part level score this ticket
exists to remove.

## 8. Final score behaviour

Screen: `ListeningSectionScoreScreen`.

- Title: Listening Practice Score
- Total questions: 38
- Answered count, out of 38
- Correct count, out of 38
- Practice score as a whole percentage
- Part breakdown table: Part 1 answered and correct out of 8, Part 2 out
  of 5, Part 3 out of 6, Part 4 out of 5, Part 5 out of 8, Part 6 out of 6
- Note: This is a Toronto Academy practice result, not an official CELPIP
  score.
- Primary control: **End Listening section**
- Secondary control: **Review answers**, which also lives on the bottom
  bar Back

Scoring is simple practice scoring only: correct count, total, percentage,
and the part breakdown. No official CELPIP score is calculated, no CELPIP
level is shown anywhere, and nothing calls the result official.

The four headline readings are the EXAM-04 `ListeningScoreSummaryCard`,
not a copy of it, with section wording poured into a part copy object.

The section correct count and the section percentage are withheld unless
every part reports a complete answer key, so a section total can never be
a number calculated against a partial key. All six parts have complete
keys today, so that is a guard rather than the state in use.

## 9. What is intentionally not built

- No Reading section
- No Writing section
- No Speaking section
- No full Mock Test 1 assembly across the four sections
- No change to Speaking AI logic
- No change to Writing AI logic
- No change to any AI scoring prompt
- No payment
- No live classes
- No answers saved to Supabase
- No Supabase migration
- No database write of any kind
- No API route
- No auth change
- No service role call
- No official screenshot used as a public UI image
- No official CELPIP branding in production UI
- No official CELPIP score and no CELPIP level

## 10. Known fidelity gaps

These are deliberate for now and carry over from the part prototypes:

- Audio and video can be replayed. The source document says each clip
  plays once, so the official-style "you will hear this only once" wording
  is deliberately not printed.
- Media does not autoplay.
- Next does not wait for a clip to finish anywhere in the section.
- Timers are static. Nothing counts down.
- Back is enabled on every screen, including out of a part and back into
  the previous one. An official-style run would not allow it. It is kept so
  the 54 screen sequence can be walked repeatedly during review.
- No answers are saved, so a page reload starts the section again.
- No practice history is kept and nothing appears on the dashboard
  afterwards.
- No official CELPIP score and no CELPIP level.
- The section transition screens have no timed preparation pause.
- The answer and explanation sheets are not offered on the section review.
  A part level review shows one part's sheet behind a disclosure. Six
  disclosures stacked at the end of a full run is a different screen, and
  it is left as a follow up rather than guessed at.
- The progress bar appears on the screens the section owns, which are the
  instructions, the video, the five transitions, the review and the score.
  A part screen carries its position in the top bar meta line instead, for
  example "Listening Part 3 of 6 - Screen 27 of 54", because the part
  screen components are shared with the part routes and have no slot for
  section chrome.

## 11. How Reading should start next

The Listening section is now the shape a section takes, so Reading should
follow the same three layers rather than inventing a fourth:

1. **Content per part.** One file per Reading part under
   `src/features/exam-engine/mock-tests/mock-test-1/`, holding the
   passage, the questions, the options and the answer key, the way the six
   Listening part files do. A new content shape is fine and expected:
   Reading is a split screen with a passage, which none of the four
   Listening shapes describe.
2. **Part prototypes first, section second.** Each Reading part gets its
   own internal route with its own review and score, exactly as
   EXAM-03 to EXAM-14 did, before anything assembles them. That is what
   made this ticket small: every screen it needed already existed and had
   been reviewed one part at a time.
3. **A section layer that mirrors this one.** `reading-section-types.ts`,
   `reading-section-flow.ts`, `reading-section-score.ts` and
   `reading-section-copy.ts`, built the same way: the flow asks each part
   builder for its shortest ending and trims the closing screen, the
   scoring delegates to the per shape adapters and only aggregates, and
   the copy file holds the section wording behind a builder that takes the
   test label.

Two things worth carrying over deliberately:

- Keep one answer map for the whole section, keyed by question id. It is
  what makes Back, Next and Restart correct without any extra work.
- Keep the answer keys on the server and mark in a server action beside
  the route. The strip helper and the marking action are a pair, and
  splitting them is what would let a key reach the browser.

The end of Listening section screen carries the placeholder line
"Reading section will be added later." That line, and the section flow
this document describes, are the two places to update when Reading lands.
