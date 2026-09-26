# Exam engine screen types (EXAM-00)

Reusable screen types and question types for the CELPIP-style practice
test engine, derived from the 93 official screenshots in
`_reference/exam-engine/official-screens/`.

These are behaviour specifications, not visual copies. Every screen is
built from the existing Toronto Academy design system in
`src/features/design/` and `src/components/app/`. No official screenshot,
logo, or colour is reproduced in the product.

Parent audit: `docs/product/exam-engine-reference-audit.md`

House style: normal hyphens only, no long hyphens or em dashes.

---

## The frame

Every exam screen sits inside one frame. The frame is the only place that
knows about the title bar, the timer, and the navigation controls, so a
screen type never renders its own chrome.

```
+--------------------------------------------------------------+
| title (left)                        timer (right)   [ NEXT ]  |  header bar
+--------------------------------------------------------------+
|                                                              |
|                        screen body                           |  canvas
|                                                              |
+--------------------------------------------------------------+
| [ secondary ]                                      [ BACK ]  |  footer bar
+--------------------------------------------------------------+
```

Frame contract:

| Slot | Content |
| --- | --- |
| Title | `Toronto Academy Practice Test 1 - Listening Part 1: Listening to Problem Solving` |
| Timer | absent, single countdown, or the speaking pair of preparation and recording |
| Next | primary forward action, top right, disabled while a blocking media clip plays |
| Secondary | optional bottom left action, for example a review control |
| Back | bottom left of the footer on the right side, far from Next by design |

Rules that belong to the frame, not to any screen:

- Forward and back are deliberately separated so a learner cannot lose an
  answer with a mis-click.
- A screen declares whether it is timed, and the frame owns the clock.
- The frame owns advance-on-timeout. In our practice engine the learner
  must click Next, matching the Mock Test 1 instructions which state that
  unlike the official test, the learner advances manually and may go back.

---

## Screen types

### 1. Instructional text screen

Used for section instructions and part instructions.

- Circled information icon, then a heading, then a bulleted list.
- One idea per bullet, faint rules between bullets.
- No timer, Next always enabled.
- Data: `title`, `heading`, `bullets: string[]`.
- Examples: Listening test instructions, each part heading screen,
  Reading, Writing, and Speaking test instructions.

### 2. Instructional video screen

- Video player, centered, fixed aspect box.
- A skip control below the player.
- No timer, Next always enabled.
- Data: `title`, `videoUrl`, `posterUrl`, `allowSkip`.
- Note from the source document: the overview instructional video is
  skipped entirely when a learner enters a single section directly rather
  than starting a full mock test. That is a routing rule, not a screen
  rule.

### 3. Listening context screen

- Circled information icon, heading `Instructions:`, one or two sentences
  setting the scene.
- Optional context image, centered, below the text.
- No timer.
- Data: `title`, `contextText`, `imageUrl?`.
- Mock Test 1 has exactly one context image, on Listening Part 1.

### 4. Listening audio intro screen

- One instruction line, for example
  `Listen to the conversation. You will hear the conversation only once.`
- Large audio panel: speaker glyph, status text, non seekable progress
  bar.
- Next is disabled until the clip finishes, matching the play once rule.
- No visible countdown.
- Data: `title`, `instruction`, `audioUrl`, `playOnce: true`.
- The official practice engine adds a native playbar for practice
  convenience with a note that it does not appear in the real test. Our
  engine should make this a per-test setting, defaulting to off for a
  full mock test and on for a single part in study mode.

### 5. Listening video intro screen

Same as the audio intro screen with a video player in place of the audio
panel. Used only by Listening Part 5.

### 6. Listening question screen (radio)

Two columns.

- Left: question audio panel, same visual as the audio intro screen, plus
  the instruction `Listen to the question. You will hear it only once.`
- Right: pale panel with `Question N of M`, the choose instruction, and a
  radio list.
- Timer in the header, counting the answer window. It turns to a danger
  tone as the window closes.
- Data: `questionNumber`, `questionTotal`, `questionAudioUrl`,
  `instruction`, `options`, `answerSeconds`.
- Used by Listening Parts 1, 2, 3.

### 7. Listening dropdown question screen

Single column. All questions for the part on one screen.

- One instruction line at the top.
- A numbered list of statements, each with an inline dropdown placed
  where the blank falls in the sentence.
- Timer in the header, covering the whole set.
- Data: `instruction`, `items: { number, textBefore, textAfter, options }[]`,
  `partSeconds`.
- Used by Listening Parts 4, 5, 6.

### 8. Reading split screen

Two independently scrolling columns.

- Left: passage, diagram, or article. Own scrollbar.
- Right: one or more question panels, own scrollbar. Reading Part 1,
  Part 2, and Part 4 each have two panels, a question set and a
  fill-in-the-blank response text.
- Timer in the header for the whole part.
- Optional secondary footer action for answer review in study mode.
- Data: `leftPanel: { kind: "text" | "image", content }`,
  `rightPanels: QuestionPanel[]`, `partSeconds`.
- Used by all four Reading parts. Part 2 is the diagram variant, where
  the left panel is a single image rather than text.

### 9. Writing task screen

Two columns.

- Left: source information block, plus an optional link to sample
  responses.
- Right: prompt with bulleted requirements, then the editor.
- Editor is a large textarea with a live word count below it and native
  browser spell check enabled.
- Timer in the header.
- Data: `sourceInfo`, `prompt`, `requirements: string[]`,
  `wordTarget: { min, max }`, `taskSeconds`.
- Variant for Writing Task 2: a radio option choice sits above the
  editor, and the editor panel only appears after an option is chosen.

### 10. Speaking preparation screen

- Prompt text at the top, full width.
- Optional prompt image, or two side-by-side option cards for Task 5.
- Centered panel with a clock glyph, the label `Preparation Time`, and a
  live countdown in seconds.
- The header shows the fixed pair
  `Preparation: 30 seconds  Recording: 60 seconds`.
- Data: `prompt`, `imageUrl?`, `optionCards?`, `preparationSeconds`.

### 11. Speaking recording screen

Same layout as the preparation screen with the preparation panel replaced
by a recording panel: microphone glyph, status text, and a progress bar
counting down the recording window.

- Data: `recordingSeconds`.
- Product difference: the official engine does not record. Ours records
  and uploads through the existing speaking pipeline in
  `src/features/speaking/recording-upload.ts`.

### 12. Speaking option choice screen

Used by Speaking Task 5 only, before the preparation screen.

- Two option cards side by side, each with an image, a title, and a short
  bullet list.
- The chosen card takes a selected tint.
- The source states that if no choice is made the system picks one, and
  that the learner does not speak during this step.
- Data: `prompt`, `optionCards: { imageUrl, title, bullets }[]`,
  `choiceSeconds`, `autoPickOnTimeout: true`.

### 13. Answer review screen

Full width scrolling table.

| Column | Content |
| --- | --- |
| Question | fully qualified label, for example `Listening Part 1: Listening to Problem Solving - Q1` |
| Answer Key | the correct option text, or an image when the option is an image |
| Your Answer | the learner option text, blank when unanswered |
| Mark | check for correct, cross for incorrect, blank when unanswered |

- A separator row between parts.
- Data: `rows: { label, answerKey, learnerAnswer, isCorrect }[]`.
- Used at the end of Listening and at the end of Reading. Not used for
  Writing or Speaking.

### 14. Score summary screen

- Small table: `Number of Questions`, `Your Score`,
  `Your Approximate Level`.
- Below it a boxed note explaining that the number is an estimate.
- Reuse `PRACTICE_ESTIMATE_DISCLAIMER` from
  `src/features/dashboard/dashboard-copy.ts`. Do not write new wording
  and do not label the value a CELPIP score.
- Data: `questionCount`, `rawScore`, `estimatedLevel`.

### 15. End of section screen

- Bulleted list: the section is finished, any optional links, and the
  instruction to continue.
- No timer.
- Data: `title`, `bullets`, `links?`.

### 16. Performance standards reference screen

- Long scrolling explanatory panel describing the four rating categories.
- Reference only, reached from the end of Writing and end of Speaking
  screens.
- The rating categories the AI evaluation already uses live in
  `src/features/writing/writing-scoring-schema.ts` and
  `src/features/speaking/scoring-schema.ts`. This screen must render from
  the same source of truth so the explanation and the report never drift.

---

## Question types

| Type | Screen type | Answer shape | Auto scored |
| --- | --- | --- | --- |
| `single_choice_radio` | 6 | one option id | Yes |
| `image_choice_radio` | 6 | one option id, options carry an image | Yes |
| `dropdown_blank` | 7, 8 | one option id per blank | Yes |
| `paragraph_match` | 8 | one letter A to E per statement | Yes |
| `writing_response` | 9 | free text plus word count | No, AI evaluated |
| `writing_option_response` | 9 | one option id plus free text | No, AI evaluated |
| `speaking_response` | 11 | one audio recording | No, AI evaluated |
| `speaking_option_response` | 12 then 11 | one option id plus one recording | No, AI evaluated |

Notes.

- `paragraph_match` is a `dropdown_blank` whose option set is the fixed
  letters A to E and whose blank sits before the statement rather than
  inside it. Model it as its own type so the answer review table can print
  the letter rather than the option text.
- `image_choice_radio` appears in the official practice test result table
  but not in Mock Test 1. Allow it in the data model, defer the UI.
- The auto scored types share one scoring function. The AI evaluated types
  never touch it; they call the existing speaking and writing endpoints.

---

## Screen type to Mock Test 1 mapping

| Section | Part or task | Screen types in order |
| --- | --- | --- |
| Overview | - | 2 |
| Listening | instructions | 1, 2 |
| Listening | Part 1 | 1, 3, 4, 6 x2, 4, 6 x3, 4, 6 x3 |
| Listening | Part 2 | 1, 4, 6 x5 |
| Listening | Part 3 | 1, 4, 6 x6 |
| Listening | Part 4 | 1, 4, 7 |
| Listening | Part 5 | 1, 5, 7 |
| Listening | Part 6 | 1, 4, 7 |
| Listening | end | 13, 14, 15 |
| Reading | instructions | 1, 2 |
| Reading | Part 1 to Part 4 | 1, 8 |
| Reading | end | 13, 14, 15 |
| Writing | instructions | 1, 2 |
| Writing | Task 1 | 9 |
| Writing | Task 2 | 9 option variant |
| Writing | end | 15, 16 |
| Speaking | instructions | 1, 2 |
| Speaking | Tasks 1 to 4, 6 to 8 | 10, 11 |
| Speaking | Task 5 | 12, 10, 11 |
| Speaking | end | 15, 16 |

Listening Part 1 alternates because the conversation arrives in three
sections with questions between them: audio section 1, questions 1 and 2,
audio section 2, questions 3 to 5, audio section 3, questions 6 to 8.
