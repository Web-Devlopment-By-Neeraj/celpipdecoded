# Mock Test 1 - extracted content outline (EXAM-00)

Structure of `Mock Test 1 -Sajinlinks.docx` in document order, with what
each block contains and what shape it needs to take in the exam engine.

This is an outline for planning. It is not the content library. Question
and option text stays in the source document until a content ticket loads
it into structured data.

Extracted 2026-07-31. Nothing was downloaded.

Parent audit: `docs/product/exam-engine-reference-audit.md`
Content map: `docs/product/mock-test-1-content-map.md`
Asset list: `mock-tests/mock-test-1/extracted-links.md`

House style: normal hyphens only, no long hyphens or em dashes.

---

## Document shape

| Property | Value |
| --- | --- |
| Size | 51 KB |
| Embedded media | none |
| External links | 46 Cloudinary URLs plus 2 mailto links |
| Answer marking in question text | none |
| Highlighting | yellow, on 2 author notes about audio sequencing only |

Answer options are written as plain text lines beginning with `[ ]`. No
option is marked as correct anywhere in the Listening question text. That
is why the Listening answer keys can only come from the six answer key
images.

---

## Outline

```
MOCK TEST 1

Listening Test Instructions                      -> screen type 1
  3 instruction bullets

Listening PART 01 - Listening To Problem Solving
  part instructions, 3 bullets                   -> screen type 1
  context text + context image                   -> screen type 3
  section audio 1                                -> screen type 4
  Q1  question audio + 4 options                 -> screen type 6
  Q2  question audio + 4 options                 -> screen type 6
  author note: now 2nd part of audio will play
  section audio 2                                -> screen type 4
  Q3, Q4, Q5  question audio + 4 options each    -> screen type 6
  author note: now 3rd part of audio will play
  section audio 3                                -> screen type 4
  Q6, Q7, Q8  question audio + 4 options each    -> screen type 6

Listening PART 02 - Listening to a Daily Life Conversation
  part instructions, 3 bullets                   -> screen type 1
  context text, no image                         -> screen type 3
  section audio                                  -> screen type 4
  Q1 to Q5  question audio + 4 options each      -> screen type 6

Listening PART 03 - Listening for Information
  part instructions, 3 bullets                   -> screen type 1
  context text, no image                         -> screen type 3
  section audio, two URLs, see extracted-links   -> screen type 4
  Q1  audio slot holds a section audio file
  Q2 to Q6  question audio + 4 options each      -> screen type 6

Listening PART 04 - Listening to a News Item
  part instructions, 3 bullets                   -> screen type 1
  context text                                   -> screen type 3
  section audio                                  -> screen type 4
  5 sentence stems, 4 options each, one screen   -> screen type 7

Listening PART 05 - Listening to a Discussion
  part instructions, 2 bullets                   -> screen type 1
  context text                                   -> screen type 3
  discussion video                               -> screen type 5
  8 questions, 4 options each, one screen        -> screen type 7

Listening PART 06 - Listening for Viewpoints
  part instructions, 3 bullets                   -> screen type 1
  context text                                   -> screen type 3
  section audio                                  -> screen type 4
  6 sentence stems, 4 options each, one screen   -> screen type 7

Listening result
  author note: result page with answer key and student answer
  Answers & Explanations, 6 images, Parts 1 to 6 -> screen types 13, 14, 15

Reading Test Instructions                        -> screen type 1
  3 instruction bullets
  author note: Reading instructions video        -> screen type 2

Reading Part 1: Reading Correspondence           -> screen type 8
  left  : letter from Jim to Scott, 4 paragraphs
  right : Q1 to Q6, sentence stems, 4 options each
  right : reply letter from Scott with 5 inline blanks, Q7 to Q11
  author notes confirm passage left, questions right

Reading Part 2: Reading to Apply a Diagram       -> screen type 8
  left  : course brochure image
  right : email from Gerry to Charlie, 5 inline blanks, Q1 to Q5
  right : Q6 to Q8, sentence stems
  2 mailto links inside the passage text

Reading Part 3: Reading for Information          -> screen type 8
  left  : paragraphs A to D plus fixed option E, one dollar coin article
  right : 9 statements, each with an A to E dropdown

Reading Part 4: Reading for Viewpoints           -> screen type 8
  left  : website article, Turks and Caicos annexation, 5 paragraphs
  right : Q1 to Q5, sentence stems
  right : reader comment with 5 inline blanks, Q6 to Q10

Reading result
  Answers & Explanations, 4 tables of text keys  -> screen types 13, 14, 15
  PART01 11 answers, PART02 8, PART03 9, PART04 10

Writing Test Instructions                        -> screen type 1
  2 instruction bullets
  author note: Writing instructions video        -> screen type 2

Writing Task 1: Writing an Email                 -> screen type 9
  prompt image only

Writing Task 2: Responding to Survey Questions   -> screen type 9, option variant
  prompt image only

Writing end                                      -> screen types 15, 16

Speaking Test Instructions                       -> screen type 1
  5 instruction bullets, 2 of which describe behaviour our product
  does not share and must be rewritten
  author note: Speaking instructions video       -> screen type 2

Speaking Task 1: Giving Advice                   -> screen types 10, 11
Speaking Task 2: Talking about a Personal Experience
Speaking Task 3: Describing a Scene
Speaking Task 4: Making Predictions
Speaking Task 5: Comparing and Persuading        -> screen types 12, 10, 11
  two prompt images
Speaking Task 6: Dealing with a Difficult Situation
Speaking Task 7: Expressing Opinions
Speaking Task 8: Describing an Unusual Situation
  all prompt images only

Speaking end                                     -> screen types 15, 16
```

Screen type numbers refer to
`docs/product/exam-engine-screen-types.md`.

---

## Author notes found in the document

These are instructions from the program owner, not learner facing copy.
They must not be rendered in the product.

- `You will hear the second section of the conversation shortly. (now 2nd
  part of audio will play)` on Listening Part 1, highlighted yellow.
- `You will hear the second section of the conversation shortly. (now 3rd
  part of audio will play)` on Listening Part 1, highlighted yellow. The
  sentence says second but the note says third, so this is a copy of the
  previous line. The learner facing sentence needs correcting to third.
- `(the passage will come here on the left side of the screen)` and
  `And question will appear on the right side of the screen` on each
  Reading part.
- `Once listening part is done it will show the result page` and the
  matching reading line.
- `And then end of listening test screen will appear` and the matching
  lines for the other three sections.

---

## What is directly usable and what is not

| Content | State | Action |
| --- | --- | --- |
| Listening question text and options | text, usable | load into the content library |
| Listening correct answers | image only | EXAM-C1, transcribe 6 images |
| Listening audio and video | Cloudinary URLs | reference, do not re-host yet |
| Reading passages | text, usable | load into the content library |
| Reading question text and options | text, usable | load into the content library |
| Reading correct answers | text, usable | already captured in the content map |
| Reading Part 2 diagram | Cloudinary URL | reference |
| Writing prompts | image only | EXAM-C2, type out as text |
| Speaking prompts | image only | EXAM-C2, type out as text |
| Timings | mostly absent | read from the official screenshots and confirm |
