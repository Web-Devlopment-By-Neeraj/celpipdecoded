# Listening Part 6 prototype (EXAM-13)

Mock Test 1, Listening Part 6, Listening for Viewpoints. The last part of
the Listening section, built as an internal preview.

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route created

```
/dashboard/mock-tests/mock-test-1/listening/part-6
```

Source file: `src/app/dashboard/mock-tests/mock-test-1/listening/part-6/page.tsx`

The route sits under `/dashboard`, so the layout auth guard covers it, and
the page verifies the session again close to the content. It carries
`robots: { index: false, follow: false }` and a standing internal preview
notice above the exam frame. It is not in navigation.

The page is a server component. It strips the answer key with
`withoutListeningViewpointsAnswerKey` before the content crosses to the
client prototype, which is the same precaution the Part 2 to Part 5 routes
take. No API route, no service role, no Supabase write, no migration.

---

## 2. Source content used

Primary source: `mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`,
section `Listening PART 06 - Listening for Viewpoints`.

Cross checked against:

- `mock-tests/mock-test-1/extracted-links.md` for the Cloudinary URLs
- `mock-tests/mock-test-1/extracted-content-outline.md` for the part shape
- `docs/product/mock-test-1-content-map.md` for the part summary

Nothing was downloaded and nothing is re-hosted. The clip is served
straight from Cloudinary. No official screenshot is embedded anywhere in
the UI, and no official CELPIP branding is copied.

Content lives in one place:

```
src/features/exam-engine/mock-tests/mock-test-1/listening-part-6.ts
```

The six statements and their twenty-four options are the source document's
own wording, punctuation included. Nothing was invented and nothing was
paraphrased.

### Deliberate wording changes, and why

Three lines from the source document are not printed as written. Each is a
sentence the prototype could not keep, not a content edit.

| Source line | What the screen says | Why |
| --- | --- | --- |
| `You will hear a report once. It is about 3 minutes long.` | `You will hear a report. It is about 3 minutes long.` | The clip can be replayed here, so the one time promise would be broken by the screen that made it. `listening-copy.ts` drops the same sentence for Parts 1 to 3. |
| `Listen to the following report. You will hear the report only once. It is about 3 minutes long.` | `Listen to the following report.` | Same reason. The running time is shown on the player caption instead, as `About 3 minutes`. |
| `Choose the best way to complete each statement from the drop-down menu (  ).` | `Choose the best way to complete each statement.` | EXAM-13 renders radio options because the ticket asks for them, so naming a drop-down menu would name a control that is not on the screen. |

The intro bullet `Choose the best way to answer each question from the
drop-down menu.` is shortened to `Choose the best way to answer each
question.` for the third reason above.

Note the difference from Part 5. There, the drop-down instruction was a
copy and paste artefact, because the items were full questions rather than
stems. Here it is not: Part 6's items really are sentence stems, and the
official test really does answer them from a drop-down. The control is a
deliberate EXAM-13 deviation, recorded again under fidelity gaps below.

No unclear wording and no missing options were found. All six statements
carry four options each.

---

## 3. Screen sequence

Five screens, built by `buildListeningViewpointsFlow` in
`src/features/exam-engine/listening-viewpoints-flow.ts` so the prototype
cannot drift from the flow.

| # | Screen | Component | What it shows |
| --- | --- | --- | --- |
| 1 | Part intro | `ListeningPartIntroScreen` | Listening for Viewpoints, the three instruction bullets, and an intro card giving Questions 6 and Format "Report audio and viewpoints questions". |
| 2 | Scenario | `ListeningScenarioScreen` | Instructions heading and the scenario sentence. |
| 3 | Report audio | `ListeningViewpointsScreen` | Instruction row, then the native player in a bordered area. |
| 4 | Questions | `ListeningViewpointsQuestionScreen` | All six statements with four radio options each. |
| 5 | Completion | `ListeningPartCompleteScreen` | "Listening Part 6 complete", the answered count, back to dashboard, restart. |

Back is enabled on screens 2 to 5 and hidden on screen 1, because there is
nothing behind it inside the part. The top bar reads `Screen n of 5`
throughout.

---

## 4. Media link used

Report audio, from `extracted-links.md`:

```
https://res.cloudinary.com/dkvsshy7n/video/upload/v1785338937/Listening_Test_1_-_Part_6_-_Audio_vyzpjt_ydlff9.mp3
```

Played by the shared `ListeningAudioPlayer` through
`ListeningViewpointsScreen`, which wraps the existing
`ListeningAudioScreen`. Behaviour:

- native HTML `audio`, no player library and no new dependency
- controls visible
- `preload="metadata"`, so the control bar shows a real duration without
  pulling the whole clip down
- no autoplay
- fallback message replaces the control bar when the clip fails to load,
  and the text inside the element covers a browser that cannot play audio
  at all
- caption strip under the player reads `Report audio` and `About 3 minutes`

The answer sheet image for this part is referenced in the content object
as `answerExplanationImageUrl` and is rendered nowhere in this ticket. It
is held for the review ticket:

```
https://res.cloudinary.com/dkvsshy7n/image/upload/v1785339234/Listening_Test_1_zAnswers_-_Part_6_zregl5_omthfw.png
```

---

## 5. Question count

Six. All six are on one screen, screen 4 of 5.

Each is an incomplete statement with a blank where the source document
puts its underscores, and four options underneath.

---

## 6. Radio question behavior

- Each question is its own `fieldset` and its own radio group, named from
  the question id, so answering question 2 cannot clear question 1.
- The statement is the group's `legend`, so a screen reader announces the
  whole stem when an option takes focus rather than reading four bare
  fragments.
- The underscores are hidden from assistive technology with `aria-hidden`
  and the word "blank" is read in their place.
- The whole option row is the click target, so nobody has to hit the small
  circle itself.
- One selected option per question. Selecting another replaces it.
- Selections are held in local component state as
  `{ questionId: selectedOptionId }`, owned by `ListeningPartSixPrototype`,
  which stays mounted for the whole part.
- Because the map is keyed by question id rather than by screen position,
  answers survive moving back and forward. Back from the completion screen
  lands on the question screen with all six options still selected.
- Next on the question screen is disabled until all six questions have an
  answer. The rule is `areAllListeningViewpointsQuestionsAnswered`, which
  also refuses to open the gate on an empty question list.
- A count under the list reads, for example, `4 of 6 questions answered.
  Answer every question to continue.` so a learner can see why Next is
  unavailable without hunting for the empty control.
- Nothing on this screen knows which option is correct.

---

## 7. Answer key stored

Stored in the content object at
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-6.ts`, as
`ANSWER_KEY`, one `ListeningAnswerKeyEntry` per question, every entry with
`source: "answer-image"`.

| Q | Correct option id | Option text |
| --- | --- | --- |
| 1 | `listening-part-6-q1-a` | approve a plan to redevelop the vacant land. |
| 2 | `listening-part-6-q2-d` | could put her community at risk. |
| 3 | `listening-part-6-q3-d` | may be developed into a nature walkway. |
| 4 | `listening-part-6-q4-b` | compact community with a vibrant local economy. |
| 5 | `listening-part-6-q5-a` | both economic and community interests can be satisfied. |
| 6 | `listening-part-6-q6-a` | Mother of two, Eleanor Wentworth, will be disappointed. |

All six were matched to an existing option by exact text, punctuation
included. No option wording was changed to make a key fit, and nothing was
guessed.

The key never reaches the browser. The route strips it with
`withoutListeningViewpointsAnswerKey`, which also removes any per question
`correctOptionId`, before the content is handed to the client prototype.
Nothing renders it, and EXAM-13 builds no review and no score, so nothing
reads it yet.

---

## 8. What is interactive

- Next and Back move through all five screens.
- The report clip plays, pauses, seeks and can be replayed.
- All six radio groups are selectable, and selections persist across Back
  and Next for the length of the visit.
- Next on the question screen unlocks once all six are answered.
- The answered count under the question list updates as options are
  chosen.
- The completion screen prints how many of the six are answered, links
  back to the dashboard, and restarts the part with the answers cleared.

---

## 9. What is intentionally not built

Per the ticket:

- Part 6 answer review screen
- Part 6 score screen
- full Listening section result
- any Supabase save of answers
- any Supabase migration
- Reading, Writing, Speaking
- payment, live classes
- any new dependency

Untouched by this ticket: Speaking AI logic, Writing AI logic, AI scoring
prompts, API routes, Supabase helpers, auth.

No official screenshot is used as a UI image, and no official CELPIP
branding is copied into the product.

---

## 10. Known fidelity gaps

All intentional for now.

| Gap | Official-style behaviour | Where it is |
| --- | --- | --- |
| Questions use radio options | Part 6 answers its statements from a drop-down menu | `ListeningViewpointsQuestionList`. Asked for by EXAM-13. |
| Media does not autoplay | The clip starts on its own | `ListeningAudioPlayer` |
| Media can be replayed | Heard once only | `ListeningAudioPlayer`, `onEnded` is already wired for the gate |
| Next does not wait for the clip | Next unlocks when the clip ends | `ListeningViewpointsScreen` passes `nextDisabled` through already |
| Timer is static | Counts down | Shell reads `Time remaining: 30 seconds` in the muted state |
| Back is open throughout | Once you leave a page you cannot return | `ListeningPartSixPrototype` |
| Answers are not saved | Attempt is recorded | Local React state only, cleared by a reload |
| No result page | Score after the part | Next ticket |
| No Part 6 answer review | Review after the part | Next ticket |
| No full Listening section result | Section result after Part 6 | Later ticket |

---

## 11. How the next ticket should continue

The Part 6 review and score ticket should follow the shape EXAM-10 used
for Part 4 and EXAM-12 used for Part 5, in this order.

1. Add `ListeningViewpointsFlowEnding` with `"review"` and `"complete"` to
   `listening-viewpoints-flow.ts`, plus the options argument, and make
   `"review"` the default. Add the `answer-review`, `score` and `part-end`
   kinds to `ListeningViewpointsScreen` in
   `listening-viewpoints-types.ts`. Leave `"complete"` available for a part
   that ships before its review does.
2. Add `actions.ts` beside
   `src/app/dashboard/mock-tests/mock-test-1/listening/part-6/`, holding a
   `markListeningPartSix` server action modelled on `markListeningPartFive`.
   The key stays on the server: the action reads `listeningPart6.answerKey`
   and returns finished review rows and a practice score. Neither the key
   nor the option ids of correct answers should cross to the browser.
3. The review rows should carry the printed statement, the way the Part 4
   rows do. `ListeningReviewRow` already has the field for it, and a row
   reading "Question 2" beside "could put her community at risk." says
   nothing about what was asked.
4. Add Part 6 review copy to `listening-review-copy.ts`, then render the
   three closing screens with the existing `ListeningAnswerReviewScreen`,
   `ListeningScoreScreen` and `ListeningPartEndScreen`. Put
   `answerExplanationImageUrl` behind the same collapsed disclosure Parts 1
   to 5 use, so opening the review does not put the sheet on screen
   unasked.
5. In `ListeningPartSixPrototype`, add the marking state machine and the
   request id ref from `ListeningPartFivePrototype`, and kick marking off
   from the handler that walks onto the review screen rather than from an
   effect.
6. Retire `part6CompleteHeading` and `part6RestartLabel` from
   `listening-copy.ts` once the completion screen is no longer reached, the
   way the Part 3, Part 4 and Part 5 pairs were retired. Keep the Part 2
   pair, which is still the template for a part with no review yet.
7. Update the Part 6 preview description and the standing notice on the
   route, both of which currently say the review and score are not built.

After that, the full Listening section result becomes the next piece of
work, since Parts 1 to 6 will each have a practice score of their own.
