# Listening Part 4 prototype (EXAM-09)

Mock Test 1, Listening Part 4: Listening to a News Item, built as an
internal client side prototype.

The part runs end to end in the browser: the intro, the scenario, the
news item clip, one screen holding all five dropdown completion
questions, and a completion screen. Nothing is checked, nothing is
scored, and nothing is saved.

Part 4 is the first Listening part that does not walk one question per
screen. It is screen type 7, the dropdown completion screen, which
Listening Parts 4, 5 and 6 all use.

Ticket: `docs/tickets/EXAM-09-listening-part-4-prototype.md`
Previous part: `docs/product/listening-part-3-review-score.md`
Screen types: `docs/product/exam-engine-screen-types.md`

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route created

`/dashboard/mock-tests/mock-test-1/listening/part-4`

Source: `src/app/dashboard/mock-tests/mock-test-1/listening/part-4/page.tsx`

The route sits under `/dashboard`, so the layout auth guard covers it,
and the page calls `supabase.auth.getUser()` again close to the content
and redirects to `/login` without a session. Layouts do not re-render on
client navigation, which is why the check is repeated.

The page carries `robots: { index: false, follow: false }` and a standing
internal preview notice above the exam frame.

The content object is passed through `withoutListeningDropdownAnswerKey`
on the server before it reaches the client component. The Part 4 answer
key is complete and confirmed, and a client component receives its props
as serialized data, so handing the key down would publish the answers to
anyone who opens the network panel. This is the same precaution the Part
2 and Part 3 routes take.

No API route, no server action, no service role, no Supabase write, no
migration.

## 2. Source content used

`mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`, Listening PART 04,
with the Cloudinary URL cross checked against
`mock-tests/mock-test-1/extracted-links.md` and the part summary in
`docs/product/mock-test-1-content-map.md`.

Loaded into
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-4.ts` as
a typed `ListeningDropdownPartContent`. No statement and no option was
rewritten.

Two notes on the source, both recorded in comments in that file:

- The first statement uses a curly apostrophe in "magician's". It is
  normalized to a straight apostrophe. Typography only, no wording
  changed. EXAM-03, EXAM-05 and EXAM-07 made the same normalization in
  Parts 1 to 3.
- The document says the news item is heard once. That sentence is kept in
  the intro bullets, and it is not yet true of this prototype. See
  section 10.

Part 4 has no question audio at all. The questions are printed on screen,
which is why the dropdown question type has no audio field.

### A second content shape

Part 4 does not fit `ListeningPartContent`, the type Parts 1 to 3 use, so
`src/features/exam-engine/listening-dropdown-types.ts` declares a second
shape. The reasons, in full in that file's header:

- Parts 1 to 3 interleave conversation sections with question screens, so
  their content is a list of sections each holding its own questions. Part
  4 has one clip and one flat question list, so a sections array would
  always hold exactly one entry and would say nothing.
- Parts 1 to 3 speak their questions and print nothing, so a question
  there is an audio URL plus options. A question here is printed text
  split around a blank.
- The flows differ. Parts 1 to 3 gate Next on one answer per screen. Part
  4 gates it on the whole set.

What the two shapes share is imported rather than copied: the scenario
shape, the instruction bullet shape, and the answer key entry.

## 3. Screen sequence

Five screens, built by `buildListeningDropdownFlow` in
`src/features/exam-engine/listening-dropdown-flow.ts`.

| # | Screen | Kind | What it shows |
| --- | --- | --- | --- |
| 1 | Part intro | `part-intro` | Listening to a News Item, the four instruction bullets, the intro card with the question count and the format |
| 2 | Scenario | `scenario` | "You will hear a news story about a magician." |
| 3 | News item audio | `media` | "Listen to the following news item." and the player |
| 4 | Questions | `questions` | All five completion statements, each with a dropdown |
| 5 | Part complete | `part-complete` | "Listening Part 4 complete", the answered count, Back to dashboard, Restart |

There is no section break screen, because Part 4 has no sections. There
is no per question screen, because every question is on screen 4.

The top bar reads "Screen 3 of 5" throughout, from
`formatListeningScreenPosition`.

Components:

| Screen | Component |
| --- | --- |
| 1 | `ListeningPartIntroScreen`, shared, widened by this ticket |
| 2 | `ListeningScenarioScreen`, shared, unchanged |
| 3 | `ListeningAudioScreen`, shared, widened by this ticket |
| 4 | `ListeningDropdownQuestionScreen` and `ListeningDropdownQuestionList`, new |
| 5 | `ListeningPartCompleteScreen`, shared, unchanged |

The flow itself is `ListeningPartFourPrototype`.

### Changes to shared components

Both are widenings with defaults, so Parts 1 to 3 render exactly as
before.

- `ListeningPartIntroScreen` used to take a whole `ListeningPartContent`,
  which meant a part needed a sections array to have an intro screen. It
  now takes the header fields it actually reads, which both content
  shapes satisfy, plus optional `sectionCount`, `formatLabel` and
  `details`. Parts 1 to 3 pass `sectionCount={content.sections.length}`
  and keep their Sections row. Part 4 passes none, so the row is left out
  rather than reading "Sections 1".
- `ListeningAudioScreen` had the instruction and the hint as fixed
  strings, always "Listen to the conversation." Both are now props
  defaulting to the conversation wording. Part 4 passes "Listen to the
  following news item."

## 4. Audio link used

One clip, the news item:

```
https://res.cloudinary.com/dkvsshy7n/video/upload/v1785338654/Listening_Test_1_-_Part_4_-_Audio_sgdzdx_rnbaom.mp3
```

Labelled "News item audio", with the running time shown as "About 1.5
minutes", which is what the source document states rather than a measured
value.

Referenced straight from Cloudinary. Nothing was downloaded and nothing
is re-hosted. Unlike Part 3, Part 4 lists this clip once and on the
current Cloudinary account, so there is no ambiguity to resolve.

Player: `ListeningAudioPlayer`, the native HTML `audio` element added by
EXAM-03. Controls visible, no autoplay, `preload="metadata"`, and two
layers of fallback text, one for a clip that fails to load and one for a
browser that cannot play audio at all.

The Part 4 answer sheet image is recorded in the content object as
`answerExplanationImageUrl` and is rendered nowhere in this ticket. It is
held for the review ticket as the source a reviewer can check the key
against.

## 5. Question count

Five, all on screen 4.

Question ids are `listening-part-4-q1` to `listening-part-4-q5`. Option
ids are the question id plus `-a` to `-d`, four options per question.

Every blank in this part ends its statement, so no question sets
`textAfter`. Parts 5 and 6 have blanks mid sentence and will use it.

## 6. Dropdown question behaviour

- All five statements are on one screen, numbered, left aligned, and
  separated by hairline rules.
- Each statement is followed by a `select` holding a "Select answer"
  placeholder and the four options in source order.
- The placeholder is a real option with an empty value, not a disabled
  first choice, so an unanswered question shows "Select answer" rather
  than silently defaulting to the first answer. Re-selecting it clears
  the answer.
- The statement is the select's label, wired with `htmlFor`, so a screen
  reader announces the sentence when the control takes focus. The blank
  keeps the underscores from the source document, quieted, with the word
  "blank" read in their place.
- Selections are stored in local component state as
  `{ questionId: selectedOptionId }` and are keyed by question id, not by
  screen position, so they survive moving back and forward. The prototype
  component stays mounted across the whole part.
- Next is disabled until all five questions have an answer, from
  `areAllListeningDropdownQuestionsAnswered`. An empty question list is
  excluded, so a content mistake cannot open the gate.
- A count under the list reads "3 of 5 questions answered." with "Answer
  every question to continue." while any are outstanding, so a learner
  can see why Next is unavailable without hunting for the empty control.
- Back is enabled, which the official-style flow would not allow. It is a
  prototype affordance so the sequence can be walked repeatedly.
- No correct answer is shown, no answer is marked, and no score is
  calculated.

The control sits under its statement rather than inline in the sentence.
Screen type 7 describes an inline dropdown, and the option text here is a
sentence fragment several words long, so an inline control would push the
tail of the statement around as the value changed. The ticket allows
either. Recorded in section 10 as a fidelity gap.

## 7. Answer key stored

Stored in
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-4.ts` as
the part level `answerKey` list, one entry per question, in order.

| Question | Correct option id | Option text |
| --- | --- | --- |
| 1 | `listening-part-4-q1-d` | tearing up a $20 bill. |
| 2 | `listening-part-4-q2-b` | took a picture of her $20 bill. |
| 3 | `listening-part-4-q3-a` | had different numbers. |
| 4 | `listening-part-4-q4-c` | a school project. |
| 5 | `listening-part-4-q5-b` | stole money from his audience. |

Every entry has `source: "answer-image"`, because each value was read off
the Part 4 answer screenshot rather than out of the source document text.

Every value was matched to an existing option by exact text, punctuation
included. No option wording was changed to make a key fit, and nothing
was guessed. The key is complete: there is no `correctOptionId: null`
entry in this part.

The option text is repeated in a trailing comment beside each entry, so
an id can be checked against its question without scrolling, and so a
later edit to an option cannot quietly move an answer.

The key does not reach the browser. It is stripped on the server by
`withoutListeningDropdownAnswerKey`, which removes both the part level
list and any per question `correctOptionId`. Nothing in this ticket reads
it.

## 8. What is interactive

- Next and Back move through all five screens. Back is hidden on screen 1
  only.
- The news item plays, pauses, seeks and replays through the native
  controls.
- All five dropdowns are selectable and hold their value across Back and
  Next.
- Next on the question screen unlocks once every dropdown has an answer,
  and locks again if one is cleared.
- The answered count under the list updates as answers are chosen.
- The completion screen reports how many of the five were answered.
- Restart clears the answers and returns to screen 1.
- Back to dashboard is a real link, so middle click and open in a new tab
  work.

## 9. What is intentionally not built

- The Part 4 answer review screen.
- The Part 4 practice score screen.
- The Part 4 end of part screen.
- Any server action for Part 4. There is no `actions.ts` beside the page.
- Listening Part 5 and Listening Part 6.
- The full Listening section, and any link between the parts.
- Reading, Writing and Speaking.
- Any database write. No answer, no attempt and no timing is saved.
- Any Supabase migration.
- Any payment or live class work.

Untouched by this ticket: the Speaking AI flow, the Writing AI flow, the
AI scoring prompts, the API routes, the Supabase helpers, and auth. No
dependency was installed.

No official screenshot is embedded anywhere in the UI, and no official
CELPIP branding is copied. The screens are Toronto Academy practice
chrome built from the EXAM-01 shell.

## 10. Known fidelity gaps

All intentional for now.

1. The news item does not autoplay. The learner presses play.
2. The news item can be replayed, and the intro bullets say it is heard
   once. That sentence comes from the source document and the ticket asks
   for it, so it is printed and the gap is recorded here and in the
   standing notice on the page. One time playback arrives with a later
   ticket, and the sentence becomes true then.
3. Next does not wait for the clip to finish. `ListeningAudioPlayer`
   already takes `onEnded` and `ListeningAudioScreen` already takes
   `nextDisabled`, so the gate is a wiring change rather than a rewrite.
4. The timer is static. The question screen shows "Time remaining: 30
   seconds" in the shell's muted state, which is reserved for a fixed
   label rather than a live value. Nothing counts down, and on the
   official-style test the Part 4 allowance covers the whole question set
   rather than each question.
5. The dropdowns sit under their statements rather than inline in the
   sentence. See the note at the end of section 6.
6. Answers are held in React state only. A page reload starts the part
   again and nothing is saved.
7. There is no answer review and no practice score for this part yet, so
   the completion screen ends the run. The pending review is a plain
   sentence rather than a greyed out button, following the rule
   `ListeningPartCompleteScreen` sets out: a disabled control says "press
   this in a moment", and there is nothing behind it.
8. The part stands alone. There is no route from Part 3 to Part 4 and
   none from Part 4 onwards.

## 11. How the next ticket should continue

The next ticket builds the Part 4 answer review and practice score. The
Part 2 and Part 3 pattern applies almost unchanged, and the pieces are
already in place.

1. Add an ending option to `buildListeningDropdownFlow`, the way
   `buildListeningFlow` has one. The `"review"` ending appends
   `answer-review`, `score` and `part-end` in place of `part-complete`,
   taking the flow from five screens to seven.
2. Add `src/app/dashboard/mock-tests/mock-test-1/listening/part-4/actions.ts`
   with a `markListeningPartFour` server action. It must mark on the
   server, because `withoutListeningDropdownAnswerKey` keeps the key off
   the client and that must not be relaxed. Model it on
   `markListeningPartThree`.
3. The EXAM-04 scoring helpers in
   `src/features/exam-engine/listening-score.ts` take
   `ListeningPartContent`, so they need either a dropdown overload or a
   small adapter that flattens a dropdown part into the rows they expect.
   The answer map shape is already the same, `{ questionId: optionId }`,
   so nothing about the stored answers has to change.
4. `ListeningReviewRow.label` falls back to "Question 3" for Parts 1 to 3
   because those parts never print a stem. Part 4 does print one, so pass
   the statement text as the label. That is what the field is for.
5. Reuse `ListeningAnswerReviewScreen`, `ListeningScoreScreen` and
   `ListeningPartEndScreen` unchanged, with a
   `listeningPartFourReviewCopy` entry added to
   `listening-review-copy.ts`.
6. Reuse the marking screen states from `ListeningPartThreePrototype`,
   including the request id guard that drops a stale reply.
7. Retire `part4CompleteHeading` and `part4RestartLabel` from
   `listening-copy.ts` once the completion screen is replaced, the way
   EXAM-08 retired the Part 3 pair.
8. The Part 4 answer sheet image is already in the content object as
   `answerExplanationImageUrl` with alt text, ready to pass to
   `ListeningAnswerReviewScreen` as the reference panel.

Still out of scope after that ticket: saving answers, Listening Parts 5
and 6, and the full Listening section.
