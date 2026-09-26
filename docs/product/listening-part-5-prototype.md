# Listening Part 5 prototype (EXAM-11)

Mock Test 1, Listening Part 5: Listening to a Discussion, built as an
internal client side prototype.

The part runs end to end in the browser: the intro, the scenario, the
discussion video, one screen holding all eight multiple-choice questions,
and a completion screen. Nothing is checked, nothing is scored, and
nothing is saved.

Part 5 is the only Listening part with a video, and the only one that
prints whole questions answered from radio options. It is screen type 5
followed by screen type 7.

Ticket: `docs/tickets/EXAM-11-listening-part-5-prototype.md`
Previous part: `docs/product/listening-part-4-review-score.md`
Screen types: `docs/product/exam-engine-screen-types.md`

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route created

`/dashboard/mock-tests/mock-test-1/listening/part-5`

Source: `src/app/dashboard/mock-tests/mock-test-1/listening/part-5/page.tsx`

The route sits under `/dashboard`, so the layout auth guard covers it,
and the page calls `supabase.auth.getUser()` again close to the content
and redirects to `/login` without a session. Layouts do not re-render on
client navigation, which is why the check is repeated.

The page carries `robots: { index: false, follow: false }` and a standing
internal preview notice above the exam frame.

The content object is passed through `withoutListeningVideoAnswerKey` on
the server before it reaches the client component. The Part 5 answer key
is complete and confirmed, and a client component receives its props as
serialized data, so handing the key down would publish the answers to
anyone who opens the network panel. This is the same precaution the Part
2, Part 3 and Part 4 routes take.

There is no `actions.ts` beside the page. Nothing marks anything in this
ticket, so there is no server action to write.

No API route, no service role, no Supabase write, no migration.

## 2. Source content used

`mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`, Listening PART 05,
with the Cloudinary URL cross checked against
`mock-tests/mock-test-1/extracted-links.md` and the part summary in
`docs/product/mock-test-1-content-map.md`.

Loaded into
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-5.ts` as
a typed `ListeningVideoPartContent`. No question and no option was
rewritten.

Three notes on the source, all recorded in comments in that file:

- The document carries two instruction lines for this part, "Choose the
  best way to answer each question" and "Choose the best way to complete
  each statement from the drop-down menu". The content map records the
  second as a copy and paste artefact, because the eight items are full
  questions rather than sentence stems, and settles on the question
  wording. That is the line used here, on the intro screen and above the
  question list.
- The running time is written as the intro bullet states it, "You will
  watch a 2-minute video", rather than measured. The content map gives
  the clip as about 1.5 to 2 minutes, so the two agree.
- Part 5 has no question audio at all. The questions are printed on
  screen, which is why the video question type has no audio field.

The three scenario sentences from the source are joined into one
paragraph, because `ListeningScenario` carries a single `text` field and
the scenario screen and the intro card both print it whole. No wording
changed.

### A third content shape

Part 5 fits neither `ListeningPartContent`, the type Parts 1 to 3 use,
nor `ListeningDropdownPartContent`, the type Part 4 uses, so
`src/features/exam-engine/listening-video-types.ts` declares a third
shape. It is close to the dropdown shape and deliberately not merged with
it. The reasons, in full in that file's header:

- A dropdown part's media is a clip. This part's media is a video, so the
  screen that plays it is a different component with a poster, an aspect
  ratio and a picture to lay out.
- A dropdown question is an incomplete statement split around a blank,
  answered from a select. A question here is a whole question answered
  from a radio group, so it has one prompt string and no blank, and
  `textBefore` and `textAfter` would be dead fields on every question.

What the three shapes share is imported rather than copied: the scenario
shape, the instruction bullet shape, and the answer key entry.

## 3. Screen sequence

Five screens, built by `buildListeningVideoFlow` in
`src/features/exam-engine/listening-video-flow.ts`.

| # | Screen | Kind | What it shows |
| --- | --- | --- | --- |
| 1 | Part intro | `part-intro` | Listening to a Discussion, the three instruction bullets, the intro card with the question count and the format |
| 2 | Scenario | `scenario` | "You will watch a discussion among three colleagues. There are two women and one man. They are in a meeting room at their workplace." |
| 3 | Discussion video | `video` | "Watch the discussion." and the player |
| 4 | Questions | `questions` | All eight questions, each with four radio options |
| 5 | Part complete | `part-complete` | "Listening Part 5 complete", the answered count, Back to dashboard, Restart |

There is no section break screen, because Part 5 has no sections. There
is no per question screen, because every question is on screen 4.

The top bar reads "Screen 3 of 5" throughout, from
`formatListeningScreenPosition`.

Components:

| Screen | Component |
| --- | --- |
| 1 | `ListeningPartIntroScreen`, shared, unchanged |
| 2 | `ListeningScenarioScreen`, shared, unchanged |
| 3 | `ListeningVideoScreen`, new, wrapping the EXAM-02 `ExamVideoPlayer` |
| 4 | `ListeningVideoQuestionScreen` and `ListeningVideoQuestionList`, new |
| 5 | `ListeningPartCompleteScreen`, shared, unchanged |

The flow itself is `ListeningPartFivePrototype`.

### Changes to shared code

Neither shared listening screen needed changing. `ListeningPartIntroScreen`
was already widened by EXAM-09 to take the header fields it reads rather
than a whole `ListeningPartContent`, so the video content shape satisfies
it as it stands, and Part 5 passes no `sectionCount` so the Sections row
is left out. `ListeningScenarioScreen` and `ListeningPartCompleteScreen`
are used exactly as they are. `ListeningPartCompleteScreen` had no caller
left after EXAM-10 replaced the Part 4 ending, so Part 5 brings it back
into use rather than adding a second completion screen.

Three small additive changes elsewhere:

- `ExamVideoPlayer` gained optional `playerLabel` and `unsupportedText`
  props, both defaulting to the EXAM-02 instructional video wording, so
  every existing caller is unchanged. Part 5 overrides them, because the
  discussion video is practice test material and a screen reader should
  not announce it as "Instructional video player".
- `exam-theme.ts` gained `examListeningChoice`, the list chrome for a one
  screen multiple-choice question list. It reuses the option row recipes
  from `examListening`, so an option here is the same control as on the
  Parts 1 to 3 question screen.
- `listening-copy.ts` gained a Part 5 block and the video discussion
  wording. The "Answer every question to continue." sentence is now a
  module constant read by both the dropdown key and the new choice key,
  so the two cannot drift.

## 4. Video link used

One video, the workplace discussion:

```
https://res.cloudinary.com/dkvsshy7n/video/upload/v1785338846/Listening_Test_1_-_Part_5_-_Video_phtvso_jl84rt_vcn4ev.mp4
```

Labelled "Discussion video", with the running time shown as "About 2
minutes", which is what the source document's intro bullet states rather
than a measured value.

Referenced straight from Cloudinary. Nothing was downloaded and nothing
is re-hosted. This is the only video in the Listening section, and
`extracted-links.md` lists it once.

Player: `ExamVideoPlayer`, the native HTML `video` element added by
EXAM-02. Controls visible, no autoplay, `preload="metadata"`,
`playsInline`, and two layers of fallback text, one for a clip that fails
to load and one for a browser that cannot play video at all. The clip
sits in a clean bordered area: an aspect-video stage with a caption strip
under it carrying the clip name and its running time.

No poster image is set. The source test publishes none for this video, so
an invented still would be a picture the material does not have.

The Part 5 answer sheet image is recorded in the content object as
`answerExplanationImageUrl` with alt text, and is rendered nowhere in this
ticket. It is held for the review ticket as the source a reviewer can
check the key against.

## 5. Question count

Eight, all on screen 4.

Question ids are `listening-part-5-q1` to `listening-part-5-q8`. Option
ids are the question id plus `-a` to `-d`, four options per question, so
32 options in total.

Every question is a whole question rather than a sentence stem, printed
in full.

## 6. Radio question behaviour

- All eight questions are on one screen, numbered, left aligned, and
  separated by hairline rules.
- Each question is its own `fieldset` and its own radio group, named from
  the question id, so no two groups can share a name and answering
  question 2 cannot clear question 1.
- The question is the group's `legend`, so a screen reader announces it
  when an option takes focus rather than reading four bare fragments.
- The four options appear in source order under the question, indented.
  The whole row is the click target, so nobody has to hit the small
  circle itself.
- Nothing is preselected. A question with no answer shows four empty
  radios rather than defaulting to the first option.
- Selections are stored in local component state as
  `{ questionId: selectedOptionId }` and are keyed by question id, not by
  screen position, so they survive moving back and forward. The prototype
  component stays mounted across the whole part.
- Next is disabled until all eight questions have an answer, from
  `areAllListeningVideoQuestionsAnswered`. An empty question list is
  excluded, so a content mistake cannot open the gate.
- A count under the list reads "3 of 8 questions answered." with "Answer
  every question to continue." while any are outstanding, so a learner
  can see why Next is unavailable without hunting for the empty control.
- Back is enabled, which the official-style flow would not allow. It is a
  prototype affordance so the sequence can be walked repeatedly.
- No correct answer is shown, no answer is marked, and no score is
  calculated.

A radio group cannot be cleared once set, only changed. That matches the
official-style behaviour for a multiple-choice question and is not a gap.

## 7. Answer key stored

Stored in
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-5.ts` as
the part level `answerKey` list, one entry per question, in order.

| Question | Correct option id | Option text |
| --- | --- | --- |
| 1 | `listening-part-5-q1-b` | the format of the event |
| 2 | `listening-part-5-q2-c` | Their company regularly organizes fundraisers. |
| 3 | `listening-part-5-q3-a` | generating ideas |
| 4 | `listening-part-5-q4-b` | the chosen recipient of the funds |
| 5 | `listening-part-5-q5-d` | Bidders can make high bids for items they want. |
| 6 | `listening-part-5-q6-c` | It will encourage bidders to bid low. |
| 7 | `listening-part-5-q7-d` | It takes too long to process the results. |
| 8 | `listening-part-5-q8-c` | They will request outside input. |

Every entry has `source: "answer-image"`, because each value came from the
Part 5 answer screenshot rather than out of the source document text.

All eight values were matched to an existing option by exact text,
punctuation included. No option wording was changed to make a key fit, and
nothing was guessed. The key is complete: there is no
`correctOptionId: null` entry in this part.

The option text is repeated in a trailing comment beside each entry, so an
id can be checked against its question without scrolling, and so a later
edit to an option cannot quietly move an answer.

The key does not reach the browser. It is stripped on the server by
`withoutListeningVideoAnswerKey`, which removes both the part level list
and any per question `correctOptionId`. Nothing in this ticket reads it,
and it is shown nowhere on the question screen.

## 8. What is interactive

- Next and Back move through all five screens. Back is hidden on screen 1
  only.
- The discussion video plays, pauses, seeks and replays through the native
  controls.
- All 32 radio options are selectable, one answer per question, and the
  selections hold their value across Back and Next.
- Next on the question screen unlocks once every question has an answer.
- The answered count under the list updates as answers are chosen.
- The completion screen reports how many of the eight were answered.
- Restart clears the answers and returns to screen 1.
- Back to dashboard is a real link, so middle click and open in a new tab
  work.

## 9. What is intentionally not built

- The Part 5 answer review screen.
- The Part 5 practice score screen.
- The Part 5 end of part screen.
- Any server action for Part 5. There is no `actions.ts` beside the page.
- Listening Part 6.
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

1. The video does not autoplay. The learner presses play.
2. The video can be replayed as many times as the learner likes. The
   official-style flow plays it once.
3. Next does not wait for the video to finish. `ExamVideoPlayer` already
   takes `onEnded` and `ListeningVideoScreen` already takes
   `onVideoEnded` and `nextDisabled`, so the gate is a wiring change
   rather than a rewrite.
4. The timer is static. The question screen shows "Time remaining: 30
   seconds" in the shell's muted state, which is reserved for a fixed
   label rather than a live value. Nothing counts down, and on the
   official-style test the Part 5 allowance covers the whole question set
   rather than each question.
5. Answers are held in React state only. A page reload starts the part
   again and nothing is saved.
6. There is no answer review and no practice score for this part yet, so
   the completion screen ends the run. The pending review is a plain
   sentence rather than a greyed out button, following the rule
   `ListeningPartCompleteScreen` sets out: a disabled control says "press
   this in a moment", and there is nothing behind it. The ticket allowed
   either.
7. The part stands alone. There is no route from Part 4 to Part 5 and
   none from Part 5 onwards.
8. The video has no poster frame, so the stage is a flat dark rectangle
   until playback starts. The source test publishes no still for it.

## 11. How the next ticket should continue

The next ticket builds the Part 5 answer review and practice score. The
Part 4 pattern applies almost unchanged, and the pieces are already in
place.

1. Add an ending option to `buildListeningVideoFlow`, the way
   `buildListeningDropdownFlow` has one. The `"review"` ending appends
   `answer-review`, `score` and `part-end` in place of `part-complete`,
   taking the flow from five screens to seven, and the three new kinds
   join `ListeningVideoScreen` in `listening-video-types.ts`.
2. Add `src/app/dashboard/mock-tests/mock-test-1/listening/part-5/actions.ts`
   with a `markListeningPartFive` server action. It must mark on the
   server, because `withoutListeningVideoAnswerKey` keeps the key off the
   client and that must not be relaxed. Model it on
   `markListeningPartFour`.
3. Whatever adapter EXAM-10 wrote to feed a dropdown part into the
   EXAM-04 scoring helpers in
   `src/features/exam-engine/listening-score.ts` needs the same treatment
   for a video part. The answer map shape is already identical,
   `{ questionId: optionId }`, so nothing about the stored answers has to
   change.
4. `ListeningReviewRow.statement` is the field EXAM-10 added for a part
   that prints its questions. Part 5 prints whole questions, so pass the
   prompt text there and let `label` stay "Question 3".
5. Reuse `ListeningAnswerReviewScreen`, `ListeningScoreScreen` and
   `ListeningPartEndScreen` unchanged, with a
   `listeningPartFiveReviewCopy` entry added to
   `listening-review-copy.ts`.
6. Reuse the marking screen states and the request id guard from
   `ListeningPartFourPrototype`. `ListeningPartFivePrototype` has no
   marking state machine at all today, so that block is added rather than
   edited.
7. Retire `part5CompleteHeading` and `part5RestartLabel` from
   `listening-copy.ts` once the completion screen is replaced, the way
   EXAM-08 and EXAM-10 retired the Part 3 and Part 4 pairs. Check whether
   `ListeningPartCompleteScreen` has any caller left after that; if not,
   it goes back to being unused rather than being deleted, since Part 6
   will want it for its first cut.
8. The Part 5 answer sheet image is already in the content object as
   `answerExplanationImageUrl` with alt text, ready to pass to
   `ListeningAnswerReviewScreen` as the reference panel.

Still out of scope after that ticket: saving answers, Listening Part 6,
and the full Listening section.
