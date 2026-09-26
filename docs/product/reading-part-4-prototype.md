# Reading Part 4 prototype (EXAM-22)

Mock Test 1, Reading Part 4: Reading for Viewpoints. An internal
prototype of the question experience only. It answers, it counts, and it
stops. There is no review, no score and no saving anywhere in it.

This is the fourth and last of the four Reading parts to get a prototype.
It follows EXAM-16 and EXAM-17 (Part 1), EXAM-18 and EXAM-19 (Part 2),
and EXAM-20 and EXAM-21 (Part 3).

---

## 1. Route created

| Field | Value |
| --- | --- |
| URL | `/dashboard/mock-tests/mock-test-1/reading/part-4` |
| File | `src/app/dashboard/mock-tests/mock-test-1/reading/part-4/page.tsx` |
| Auth | Behind the `/dashboard` layout guard, and the page checks the session again itself |
| Indexing | `robots: { index: false, follow: false }` |
| Exam mode | Yes. Listed in `src/features/navigation/exam-mode-routes.ts`, so no dashboard sidebar, header, breadcrumb or footer renders |
| Server action | None. Nothing is marked in this ticket, so there is no `actions.ts` beside the page |

---

## 2. Source content used

The authority is the source document:

`mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`, the block headed
"Reading Part 4: Reading for Viewpoints".

Cross checked against:

- `docs/product/mock-test-1-content-map.md`, the Part 4 summary and the
  PART04 answer key row
- `mock-tests/mock-test-1/extracted-content-outline.md`, the Reading Part
  4 outline line
- `mock-tests/mock-test-1/extracted-links.md`, which lists one Reading
  image in the whole test and it belongs to Part 2
- `docs/product/celpip-exam-rules-research.md` sections 3, 10 and 11, for
  the question count, the part timing and the timing rule

Everything taken from the document is in one file:

`src/features/exam-engine/mock-tests/mock-test-1/reading-part-4.ts`

What was taken:

| Piece | Source |
| --- | --- |
| Part title | "Reading Part 4: Reading for Viewpoints" |
| Article, 5 paragraphs | Verbatim from the document |
| Instruction above the article | "Read the following article from a website." |
| Instruction above questions 1 to 5 | "Using the drop-down menu, choose the best option according to the information given on the website." |
| Instruction above the comment | "The following is a comment by a visitor to the website page. Complete the comment by choosing the best option to fill in each blank." |
| 5 sentence stems, questions 1 to 5 | Verbatim, with the trailing underscores dropped because the screen draws the blank |
| Reader comment, 1 paragraph, 5 blanks | Verbatim, split into text and blank segments |
| 40 answer options | Verbatim, 4 per question |
| Answer key, 10 entries | The PART04 table under "Answers & Explanations" |
| Images | None. This part has none |

Nothing was invented. No passage text, no question, no option and no
answer key entry was written for this prototype.

Three transcription decisions, all following what the earlier Reading
content files already did:

- Curly quotation marks and curly apostrophes are written straight. House
  style, and no wording changes with it.
- The document writes its drop-down instruction lines with an empty pair
  of brackets in them, "from the drop-down menu (  )", where the brackets
  stand in for a picture of the control. The brackets are dropped, as
  they were for Parts 1 and 2, because an empty pair of brackets on
  screen reads as a missing image.
- The comment prints "7. _______ ." and "9. _______ ." with a space
  before the full stop, a consequence of the underscores being typed
  inline. The space is dropped so each sentence closes normally once the
  blank is filled. Reading Part 1's reply needed the same handling.

Two things in the block are deliberately not in the product:

- The author notes "(the article will come here on the left side of the
  screen)" and "And question will appear on the right side of the
  screen". They are instructions to us, and what they describe is the
  layout the split screen already implements.
- The printed headings "QUESTIONS:" and "Questions:". On screen each
  panel already carries its own label and its own instruction line.

---

## 3. Task structure

One working screen, screen type 8 from
`docs/product/exam-engine-screen-types.md`, in a new viewpoints variant.

Left column: the website article about the proposed Canadian annexation
of Turks and Caicos, five paragraphs of running prose. No headline, no
byline, no labelled sections, no image.

Right column: two panels, in document order.

1. Questions 1 to 5. Five sentence stems about the article, each with its
   own drop-down.
2. Questions 6 to 10. The reader comment, one paragraph with five
   numbered blanks in it, followed by the five drop-downs that fill them.
   Choosing an option writes the option text back into the comment in
   place of the underscores, so the comment reads as prose while it is
   being answered.

Screen flow, three screens:

1. Part intro
2. The viewpoints split, all 10 questions on it
3. Completion

Structurally this is the pair Reading Part 1 already is: prose on the
left, stems and then a body of text with blanks on the right. That is why
no shape in `reading-types.ts` had to change for it.

---

## 4. Question count

10 questions, numbered 1 to 10 continuously across the two panels.

- Questions 1 to 5: about the article
- Questions 6 to 10: blanks inside the reader comment

This matches `docs/product/celpip-exam-rules-research.md` section 3 (Part
4, 10 questions), the content map, and the 10 row PART04 answer key.

---

## 5. Question types used

Both types already existed. Nothing new was added to `ReadingQuestion`.

| Questions | Type | Shape |
| --- | --- | --- |
| 1 to 5 | Sentence stem with a drop-down | `textBefore` set, blank drawn at the end of the stem |
| 6 to 10 | Blank inside a body of text | No `text` and no `textBefore`. The sentence lives in the comment above the list |

Every question has exactly four options and one selection. There is no
paragraph matching in this part, so no shared option set.

---

## 6. Timer behavior

| Field | Value |
| --- | --- |
| Window | 780 seconds (13 minutes) |
| Scope | The whole part, one window |
| Source | `published` |
| Amber at | 60 seconds remaining |
| Red at | 20 seconds remaining |

13 minutes is published per Reading part in the official Reading Overview
PDF and recorded in `docs/product/celpip-exam-rules-research.md` sections
3 and 10.

Behaviour, the same as Reading Parts 1, 2 and 3:

- The countdown is live and starts when the split screen mounts.
- It is keyed on the flow screen id, so answering a question does not
  restart it.
- Warning and urgent states work.
- At zero the reading shows "Time is up" and stops.
- Nothing auto-submits. Nothing advances.
- No answer is erased. Every selection is still there after the window
  closes, and the learner finishes the part by hand.

The part intro screen and the completion screen carry no countdown.

---

## 7. Answer state strategy

Answers are held in local React state in `ReadingPartFourPrototype`, in
the shape Reading Parts 1 to 3 already use:

```
{ questionId: selectedOptionId }
```

- One map for the whole part, across both panels.
- Keyed by question id, not by screen position or by panel, so an answer
  survives moving back and forward.
- Written through `setReadingAnswer` from `reading-flow.ts`, which
  returns a new object so React sees a changed reference.
- The prototype component stays mounted for the whole part, so the map
  lives as long as the visit.

Nothing is written to a database, to `localStorage`, to `sessionStorage`
or to a cookie. Reloading the page starts the part again with an empty
map. Restart clears the map and returns to the first screen.

---

## 8. Blank answer behavior

Blanks are allowed everywhere and block nothing.

- Every drop-down starts on a "Select answer" placeholder with an empty
  value, so an unanswered question is genuinely unanswered rather than
  silently set to the first option.
- Next is never gated on the answers, on any screen.
- The completion screen is reachable with all 10 questions blank.
- The progress line under the question column says how many of the 10 are
  answered, and while any are outstanding it adds that a question left
  blank is counted as incorrect. It reports; it does not gate.
- The completion screen prints "You answered X of 10 questions."

No score is calculated, so a blank costs nothing in this ticket. The
"counted as incorrect" wording is shared with the marked parts and is
what EXAM-23 will make true here.

---

## 9. Answer key status

**Present, complete and confirmed. Not exposed to the client.**

The source document prints a PART04 table under "Answers & Explanations"
with 10 rows, Question 1 to Question 10. Unlike the PART03 table, which
gives letters, this one gives the option text itself, so each entry was
matched by finding the option whose text is the one the table prints.

| Question | Key |
| --- | --- |
| 1 | strengthen economic ties. |
| 2 | increased opportunities for both parties. |
| 3 | a pointless proposition. |
| 4 | lead a different lifestyle than Canadians. |
| 5 | in favour of the proposal. |
| 6 | incorporate a group of sunny southern islands |
| 7 | Ewing remained largely silent on the matter |
| 8 | need an incentive from |
| 9 | tersely dismissive Conservative position |
| 10 | an unfeasible scheme |

The document gives no explanations for Reading, so every entry carries
`source: "document"` and no `explanation`. None is invented and no AI
writes one.

How it is kept off the browser:

- It is stored in `ANSWER_KEY` inside the content module, which is a
  server module until something imports it into a client component.
- The route calls `withoutReadingAnswerKey(readingPart4)` on the server
  before the content is passed to the client prototype. That strips both
  `content.answerKey` and any per question `correctOptionId`.
- Nothing in this ticket reads the key. There is no marking action and no
  score, so the key is stored and never used.

---

## 10. Visual layout

Neutral exam surface, consistent with the three Reading parts before it:

- Exam mode route: no dashboard sidebar, header, breadcrumb trail or
  footer.
- `ExamModeViewport` gives a fixed, one window tall frame with document
  scrolling switched off. The page itself never scrolls.
- Grey top bar with the part title, the screen position and the live
  countdown. Blue Next in the top bar, Back in the bottom bar.
- White exam canvas, unpadded on the split screen, filled edge to edge by
  one divided work area.
- Left column labelled "Article", right column labelled "Questions" on
  the light blue answer wash, one full height divider between them.
- Both columns scroll internally and independently, at the same fixed
  height. A long article never pushes the questions off the screen.
- Article paragraphs keep one comfortable measure. The reader comment is
  drawn as a bordered document inside the answer column, so it reads as a
  posted comment rather than as an instruction.
- The question panel is compact: the stem or the number as the label,
  then the drop-down under it, so option text several words long never
  pushes the sentence around.
- No orange or marketing background, no official CELPIP branding, no
  internal preview label anywhere on the exam surface.

The prototype caveats are said where a learner meets them instead: the
part intro notice, and the completion screen notice.

---

## 11. Dashboard internal preview link

A fourth Internal preview card in the Mock tests section of the
dashboard, beside the Part 1, Part 2 and Part 3 cards, in
`src/components/dashboard/DashboardMockTestCard.tsx`:

| Field | Value |
| --- | --- |
| Title | Mock Test 1 - Reading Part 4 |
| Badge | Internal preview |
| Description | Reading for Viewpoints prototype with local answers. No review and no score yet. |
| Meta | Reading / Part 4 / 10 questions |
| Button | Open Reading Part 4 |
| Href | `/dashboard/mock-tests/mock-test-1/reading/part-4` |

It is dressed as an internal build link, the way the other three are: a
tinted panel with a dashed rule, a neutral badge where the Available pill
sits, and a secondary button.

Untouched:

- The student facing Listening card and its route.
- The Reading Part 1, Part 2 and Part 3 preview cards.

Nothing on the dashboard claims a Reading test or a full Reading section
exists. It does not: four separate part prototypes are not a section.

---

## 12. Source gaps and timing conflicts

**Timing conflict, one minute.** The research document gives Reading Part
4 13 minutes, from the official Reading Overview PDF.
`docs/product/mock-test-1-content-map.md` records 12 minutes, read off an
official screenshot. 13 minutes is used, because the overview PDF is the
only source giving a figure for every Reading part in one consistent
unit, and because preferring it is the call Reading Parts 1 and 3 already
made for the same disagreement. The difference is one minute and nothing
in the prototype enforces the window anyway.

**Option punctuation.** Question 10 option d reads "too burdensome for
businesses." with a full stop where the other three options in that group
end without one. That is the document's own inconsistency and it is kept,
the way Reading Part 1 question 1 option c keeps its missing full stop.
Option text is source text.

**No explanations.** The source gives none for any Reading question, so
the review EXAM-23 builds will have none to show. Nothing should invent
them.

**No source gaps in the content itself.** Unlike Reading Part 3, whose
instruction line above the passage says "message" where the passage is an
article, everything Part 4 prints matches what it governs. The article,
all 10 questions, all 40 options and all 10 answer key entries are
present and unambiguous.

---

## 13. What is intentionally not built

- No Reading Part 4 answer review screen
- No Reading Part 4 practice score screen
- No Reading band estimate, for this part or for anything else
- No full Reading section flow
- No Reading section instructions screen
- No database save, no attempt row, no persisted history
- No `localStorage`, `sessionStorage` or cookie state
- No Supabase migration and no Supabase helper change
- No server action beside this route
- No admin panel and no admin mock test builder work
- No full Mock Test 1 all-skills flow
- No auto-submit when the timer expires
- No payment, no live classes
- No change to Listening, Writing or Speaking

Regression scope for this ticket: `reading-types.ts`, `reading-flow.ts`
and `reading-copy.ts` gained additions only, and nothing existing in them
changed behaviour. Reading Parts 1, 2 and 3 and the whole Listening
section are untouched.

---

## 14. How EXAM-23 should continue

Reading Part 4 review and score. It is the same move EXAM-19 made for
Part 2 and EXAM-21 made for Part 3, and the pieces it needs already
exist.

1. **Add `actions.ts` beside the route** holding `markReadingPartFour`.
   It should import `readingPart4` directly on the server, read
   `ANSWER_KEY` there, and never trust anything the browser sends beyond
   the selections. Model it on `markReadingPartThree`.
2. **Pass a blank question line.** Questions 6 to 10 print no stem of
   their own, so `buildReadingReviewRows` needs a
   `blankQuestionText` through `ReadingReviewOptions`. Neither of the two
   existing lines fits: Part 1's names a written reply, Part 2's names an
   email message. Add one naming the reader comment, beside them in
   `readingReviewCopy`.
3. **Add the two screen titles** to `readingReviewCopy`, following the
   Part 2 and Part 3 pairs: `partFourScoreTitle` and
   `partFourReviewTitle`. Everything else on those screens is part
   neutral and reused as it stands.
4. **Create `ReadingPartFourScoreScreen` and
   `ReadingPartFourReviewScreen`** as thin wrappers over the shared
   `ReadingScoreSummaryCard` and `ReadingReviewQuestionCard`, the way the
   Part 3 pair are.
5. **Change the prototype.** Drop `ending: "complete"` from the
   `buildReadingFlow` call, add a `markAnswers` prop and the marking
   state around it (idle, working, ready, failed, with a request id
   guard), and render the score and the review in place of the
   `return null` branch at the foot of the file. Keep the completion
   branch: `buildReadingFlow` can still build that ending.
6. **Change nothing in `reading-flow.ts`.** The flow builder already
   builds both endings for the viewpoints screen.
7. **Keep the rules.** No CELPIP level, no Reading band from one part,
   the result named a Toronto Academy practice score everywhere it
   appears, no explanations invented, nothing saved and no migration.

After that, the four Reading parts are all complete to the same depth,
and the next thing worth building is the assembled Reading section flow
with its own instructions screen and its own student facing card, which
is the point at which the four Internal preview cards and their wording
in `reading-copy.ts` come out.
