# CELPIP exam rules research (EXAM-15E)

The rulebook this product builds against. Every rule below is traced to an
official CELPIP source or to a Toronto Academy source file. Nothing here is
invented, and anything that could not be traced is listed in section 17
rather than stated as fact.

Researched 2026-08-28. Ticket: `docs/tickets/EXAM-15E-celpip-rules-admin-model.md`.

Companion documents:

- `docs/product/listening-format-audit-and-correction-plan.md` - our Listening
  build measured against these rules.
- `docs/product/admin-mock-test-builder-blueprint.md` - the data model that
  encodes these rules.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

---

## Source labels used throughout

| Label | Source |
| --- | --- |
| `[format]` | CELPIP Test Format page, https://www.celpip.ca/take-celpip/test-format/ |
| `[results]` | CELPIP Test Results page, https://www.celpip.ca/take-celpip/test-results/ |
| `[pack]` | CELPIP Listening Pro Study Pack 2026, https://www.celpip.ca/wp-content/uploads/2026/01/Listening-Pro-Study-Pack-2026.pdf (the PDF itself is marked "CELPIP Listening Pro Study Pack, Copyright 2022 Prometric") |
| `[l-ovw]` | `public/Overview and Scoring Descriptors/1. Listening/Listening - Overview.pdf` |
| `[l-sco]` | `public/Overview and Scoring Descriptors/1. Listening/Listening - Scoring.pdf` |
| `[r-ovw]` | `public/Overview and Scoring Descriptors/2. Reading/Reading - Overview.pdf` |
| `[r-sco]` | `public/Overview and Scoring Descriptors/2. Reading/Reading - Scoring.pdf` |
| `[w-ovw]` | `public/Overview and Scoring Descriptors/3. Writing/Writing - Overview.pdf` |
| `[w-desc]` | `public/Overview and Scoring Descriptors/3. Writing/Writing - ScoreDescriptors.pdf` |
| `[s-ovw]` | `public/Overview and Scoring Descriptors/4. Speaking/Speaking - Overview.pdf` |
| `[s-desc]` | `public/Overview and Scoring Descriptors/4. Speaking/Speaking - ScoreDescriptors.pdf` |
| `[mt1]` | `mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx` |
| `[screens]` | `_reference/exam-engine/official-screens/Official Test Explanation with Screenshots (1).docx` |

The four local PDF sets are CELPIP Accelerate materials published by Paragon
Testing Enterprises. They are official CELPIP publications held locally, and
they are treated here as primary sources alongside the website.

`[mt1]` and `[screens]` are Toronto Academy source files. They are the source
of truth for our Mock Test 1 content, not for CELPIP rules. Where they
disagree with an official source, the disagreement is recorded rather than
resolved silently.

---

## 1. CELPIP General full test structure

The CELPIP - General Test has four components: Listening, Reading, Writing,
and Speaking. `[format]`

| Component | Time allotted | Scored questions or tasks |
| --- | --- | --- |
| Listening | 46-55 minutes | 38 scored questions |
| Reading | 43-56 minutes | 38 scored questions |
| Writing | 53 minutes | 2 tasks |
| Speaking | 15 minutes | 8 tasks |

`[format]` for all four rows. Scored question counts for Listening and
Reading are from `[l-sco]` and `[r-sco]`.

Whole test: takes under 2 hours and 50 minutes to complete and can be done in
one sitting with no separate speaking session. `[format]`

Section order: Listening is the first part of the CELPIP Test. `[pack]` The
order in `[screens]` and `[mt1]` is Listening, Reading, Writing, Speaking,
which is the order this product builds in.

Unscored items: "The CELPIP test may contain unscored reading or listening
items used for test development. These unscored items can be found anywhere
within the Listening and Reading Tests and will have the same format as the
scored items. You will not be able to tell scored items from unscored items,
so apply your best effort to the entire test." `[format]`

`[l-ovw]` and `[r-ovw]` both list a "Practice Task" of 1 question and 1
minute before Part 1, and an "Unscored Items" row after the last part. The
practice task is unscored.

Product note: a practice mock test does not need unscored items or the
research practice task. We reproduce the scored structure only. This is a
deliberate deviation and is recorded in section 16.

---

## 2. Listening structure

Time allotted: 46-55 minutes. `[format]`
38 scored questions. `[l-sco]`

| Part | Name | Questions | Time |
| --- | --- | --- | --- |
| Practice Task | unscored | 1 | 1 minute |
| Part 1 | Listening to Problem Solving | 8 | 8 minutes |
| Part 2 | Listening to a Daily Life Conversation | 5 | 5 minutes |
| Part 3 | Listening for Information | 6 | 6 minutes |
| Part 4 | Listening to a News Item | 5 | 5 minutes |
| Part 5 | Listening to a Discussion | 8 | 6 minutes |
| Part 6 | Listening to Viewpoints | 6 | 8 minutes |
| Unscored Items | research items | - | - |

Question counts: `[format]` and `[l-ovw]` agree exactly. Per-part times are
from `[l-ovw]` only; `[format]` publishes no per-part timing.

Part names: `[format]` and `[l-ovw]` name Part 6 "Listening to Viewpoints".
`[pack]` names it "Listening for Viewpoints" in its part heading, and `[mt1]`
follows `[pack]`. Both names refer to the same part. Our product uses
"Listening for Viewpoints" because that is what our source test says.

8 + 5 + 6 + 5 + 8 + 6 = 38, which matches the 38 scored questions in
`[l-sco]`.

Part content: `[l-ovw]`

| Part | Content |
| --- | --- |
| Part 1 | 2 speakers; 3-part conversation |
| Part 2 | 2 speakers; 1 commonplace conversation |
| Part 3 | 2 speakers; conversation includes specialized knowledge |
| Part 4 | 1 speaker; short news story |
| Part 5 | Video; 3 speakers with conflicting opinions |
| Part 6 | 1 speaker; report with multiple viewpoints |

Part 5 is the only part with video. `[l-ovw]`, `[pack]`

---

## 3. Reading structure

Time allotted: 43-56 minutes. `[format]`
38 scored questions. `[r-sco]`

| Part | Name | Questions | Time |
| --- | --- | --- | --- |
| Practice Task | unscored | 1 | 1 minute |
| Part 1 | Reading Correspondence | 11 | 11 minutes |
| Part 2 | Reading to Apply a Diagram | 8 | 9 minutes |
| Part 3 | Reading for Information | 9 | 10 minutes |
| Part 4 | Reading for Viewpoints | 10 | 13 minutes |
| Unscored Items | research items | - | - |

Question counts: `[format]` and `[r-ovw]` agree exactly. Per-part times are
from `[r-ovw]` only.

11 + 8 + 9 + 10 = 38, which matches `[r-sco]`.

---

## 4. Writing structure

Time allotted: 53 minutes. `[format]`
Two tasks. `[format]`

| Task | Name | Word count |
| --- | --- | --- |
| Task 1 | Writing an Email | 150-200 words |
| Task 2 | Responding to Survey Questions | 150-200 words |

Word counts from `[w-ovw]`. `[format]` publishes no word counts and no
per-task timing.

`[w-ovw]` quick tips add: "The total test time is about an hour; you've got
around half an hour for each task." That is guidance, not a published
per-task limit, and section 11 treats it as such.

---

## 5. Speaking structure

Time allotted: 15 minutes. `[format]`
Eight tasks. `[format]`

| Task | Name | Preparation | Recording |
| --- | --- | --- | --- |
| Practice Task | unscored | 30 seconds | 60 seconds |
| Task 1 | Giving Advice | 30 seconds | 90 seconds |
| Task 2 | Talking about a Personal Experience | 30 seconds | 60 seconds |
| Task 3 | Describing a Scene | 30 seconds | 60 seconds |
| Task 4 | Making Predictions | 30 seconds | 60 seconds |
| Task 5 | Comparing and Persuading | 60 seconds (x2) | 60 seconds |
| Task 6 | Dealing with a Difficult Situation | 60 seconds | 60 seconds |
| Task 7 | Expressing Opinions | 30 seconds | 90 seconds |
| Task 8 | Describing an Unusual Situation | 30 seconds | 60 seconds |

Task names from `[format]`. Preparation and recording times from `[s-ovw]`.

Task 5 shows "60 seconds (x2)" for preparation because the task presents two
screens with images: "decide between 2 choices and compare with a 3rd
choice". `[s-ovw]`

---

## 6. Listening part-by-part rules

### Parts 1 to 3, shared question format `[pack]`

- Multiple choice questions.
- Hear the questions, read the 4 answer choices.
- Questions appear one by one.
- 30 seconds to hear and answer each question.
- Must answer questions in the order presented.

### Parts 4 to 6, shared question format `[pack]`

- Sentence completion questions.
- Read the questions and the 4 answer choices.
- All questions appear on the same screen.
- Set amount of time to answer all questions on screen.
- Can answer questions in any order.

Note the difference in how the question reaches the learner. In Parts 1 to 3
the question is spoken and only the four choices are printed. In Parts 4 to 6
the question and the four choices are both printed and nothing extra is
spoken.

### Part 1: Listening to Problem Solving `[pack]`

- About 8 minutes to listen to the audio and answer 8 questions.
- 2 speakers, one man and one woman.
- The conversation is broken into 3 sections of audio.
- Each audio section is about 1 to 1.5 minutes.
- After each audio section, 2 to 3 questions about that section.
- 30 seconds to hear and answer each question.
- Tone: conversational, relatively informal, polite, helpful.

### Part 2: Listening to a Daily Life Conversation `[pack]`

- About 5 minutes to listen to the audio and answer about 5 questions.
- 2 speakers, one man and one woman.
- One audio clip, about 1.5 to 2 minutes.
- 30 seconds to hear and answer each question.
- Tone: conversational, relatively informal, polite, not too casual.

### Part 3: Listening for Information `[pack]`

- About 6 minutes to listen to the audio and answer about 6 questions.
- 2 speakers, one man and one woman.
- One audio clip, about 2 to 2.5 minutes.
- 30 seconds to hear and answer each question.
- Tone: polite, informal to somewhat formal. One speaker has expertise the
  other is interested in.

### Part 4: Listening to a News Item `[pack]`

- About 5 minutes to listen to the audio and answer about 5 questions.
- One speaker.
- One audio clip, about 1.5 minutes.
- Tone: formal, factual, descriptive, like a radio or TV news report.

### Part 5: Listening to a Discussion `[pack]`

- About 9 minutes to watch the video and answer about 8 questions.
- 3 speakers.
- One video clip, about 1.5 to 2 minutes.
- Tone: relatively informal, includes facts, opinions and emotions. Speakers
  will sometimes disagree.
- Strategy note in the same source: "Give yourself roughly 30 seconds to
  answer each question."
- "You will not be tested on visual details unrelated to the conversation."

The 9 minutes in `[pack]` and the 6 minutes in `[l-ovw]` do not agree. See
section 17.

### Part 6: Listening for Viewpoints `[pack]`

- About 8 minutes to listen to the audio and answer about 6 questions.
- One speaker.
- One audio clip, about 3 minutes.
- Tone: formal, not improvised. The speaker uses low-frequency and
  specialized language.

---

## 7. Listening timing rules

- Each Listening part has its own time allowance. `[l-ovw]`, `[pack]`
- Parts 1 to 3 run a per-question window: 30 seconds to hear and answer each
  question. `[pack]`
- Parts 4 to 6 run a per-screen window: a set amount of time to answer all
  questions on screen. `[pack]`
- Within a part, "you can change your answer(s) as much as you like until the
  time for that question or section is up". `[pack]`
- "When your time is up, the test will automatically move forward to the next
  screen." `[pack]`
- The learner cannot return to a previous part of the test. `[pack]` (see the
  extraction note in section 17)
- The audio passages and questions increase in difficulty from Parts 1 to 6.
  `[pack]`

The two timing shapes are the reason our data model needs both a
`per_question` and a `per_screen` timer type. See the blueprint document.

---

## 8. Listening media rules

- All audio clips are played one time only. `[pack]`
- Audio clips begin automatically. `[pack]`
- Audio cannot be paused. `[pack]` (see the extraction note in section 17)
- All speakers use English as a native language and have Canadian accents.
  `[pack]`
- For all conversations with two speakers, one is female and one is male.
  `[pack]`
- The questions for each Listening part come after the audio. `[pack]`
- Part 5 is video; every other part is audio only. `[l-ovw]`

Consequence for the engine: a Listening media screen is not a normal media
player. It has no pause, no seek and no replay, it starts on its own, and the
learner cannot advance past it early or return to it. Our current build does
not do this. That is the largest single gap in the audit document.

---

## 9. Listening question type rules

Structural rules `[pack]`:

- For each question, choose the best answer from four options.
- Each question has one correct answer.
- Parts 1 to 3 are multiple choice: the question is heard, the four choices
  are read.
- Parts 4 to 6 are sentence completion: the incomplete statement and the four
  choices are read.
- Four answer choices apply to Parts 4 to 6 as well as to Parts 1 to 3. The
  `[pack]` Parts 4 to 6 format block says "Read the questions and the 4
  answer choices".

Cognitive question types, which apply to both Listening and Reading `[pack]`:

1. General Meaning - put together ideas from a larger section of the
   conversation. Example stem: "The two speakers are talking about _____."
2. Specific Information - one piece of information such as a date, name,
   place or fact mentioned in one specific place. Example stem: "The man
   offers the woman _____."
3. Inference - use information from the clip to draw a conclusion about
   something not stated directly. Example stems: "Ms. Wilson will probably
   _____ tonight.", "Dr. Jenkins would most likely agree with Larry that
   _____."

Paraphrase rule: "You should never expect the correct answer choice, or any
answer choice, to be stated in the exact same words that were said in the
audio clip." `[pack]`

The three cognitive types are useful for authoring and for explanations. They
are not a rendering concern, so the blueprint keeps them as an optional tag on
a question rather than as a question type.

---

## 10. Reading part-by-part rules

`[r-ovw]` part content:

### Part 1: Reading Correspondence, 11 questions, 11 minutes

- Commonplace message and response between 2 people.
- 6 questions about the first message; 5 questions about the response.

`[mt1]` shows the shape our source test uses: the letter sits on the left,
questions 1 to 6 are sentence stems with four options on the right, and
questions 7 to 11 are five inline blanks inside a reply letter, also on the
right.

### Part 2: Reading to Apply a Diagram, 8 questions, 9 minutes

- Diagram and email.
- 5 questions about the email; 3 questions about the overall situation.

`[mt1]`: a course brochure image on the left, an email with 5 inline blanks
on the right for questions 1 to 5, then questions 6 to 8 as sentence stems.

### Part 3: Reading for Information, 9 questions, 10 minutes

- 4 paragraphs on a single topic.
- Scan for key words.

`[mt1]`: paragraphs A to D plus a fixed option E on the left, and 9
statements on the right, each answered from an A to E selector. This is the
one Reading part whose options are shared across all questions rather than
written per question, which the blueprint has to allow for.

### Part 4: Reading for Viewpoints, 10 questions, 13 minutes

- Article containing multiple viewpoints.
- 5 questions about the main passage; 5 questions about the response.

`[mt1]`: a website article on the left, questions 1 to 5 as sentence stems on
the right, then a reader comment with 5 inline blanks for questions 6 to 10.

### Shared Reading layout rule

Passage on the left, questions on the right, with a scroll bar so the whole
passage can be read. `[screens]`, and repeated as an author note on each
Reading part in `[mt1]`.

---

## 11. Reading timing rules

- Section total 43-56 minutes. `[format]`
- Per-part allowances 11, 9, 10 and 13 minutes. `[r-ovw]`
- The timing model in `[pack]` ("when your time is up the test moves forward",
  "you cannot go back to a previous part") is written for the Listening Test.
  We have no equally direct official statement that Reading behaves the same
  way. Section 17 records this as needing confirmation, and the Reading
  tickets should confirm it before Reading timing is enforced.

Reading has no per-question timer in any source we hold. Reading is a
per-part timed section: a part opens, the learner works through its questions
in any order, and the part closes when its time is up.

---

## 12. Writing task rules

- Two tasks, 53 minutes in total. `[format]`
- Task 1, Writing an Email: "Write an email about a day-to-day situation."
  150-200 words. `[w-ovw]`
- Task 2, Responding to Survey Questions: "Respond to a survey and explain the
  reasons for your choice." 150-200 words. `[w-ovw]`
- Task 2 begins with a choice: "Once student will choose 1 option then the
  writing space will open". `[screens]`
- Spell check and word count are present in the writing space. `[screens]`
- Guidance, not a rule: about half an hour per task. `[w-ovw]`

`[mt1]` carries both Writing prompts as images only. They still need to be
typed out as text before they can become database records.

---

## 13. Speaking task rules

- Eight tasks, 15 minutes in total. `[format]`
- Every task is preparation time followed by recording time. `[s-ovw]`,
  `[screens]`
- Per-task preparation and recording times are in the table in section 5.
- Task content `[s-ovw]`:
  - Task 1: give someone advice.
  - Task 2: talk about a past experience.
  - Task 3: describe an image.
  - Task 4: predict what will happen next in an image.
  - Task 5: 2 screens with images; decide between 2 choices and compare with
    a 3rd choice.
  - Task 6: decide between 2 difficult choices and explain.
  - Task 7: explain your opinion on a social issue.
  - Task 8: describe an unusual image.
- Test takers read the questions in the Speaking Test. `[format]`

Product deviation, recorded and deliberate: "The official website is not
recording the audio, but I want to enhance my website where student can record
and get the AI evaluation". `[screens]` Our Speaking section records the
learner and returns an AI estimate. The official test records for human
raters. This is a product feature, not a claim about how CELPIP works, and the
wording rules in section 15 apply to it.

---

## 14. Scoring rules for Listening and Reading

Identical rules for both sections. `[l-sco]`, `[r-sco]`

- There are 38 scored questions on the test.
- Each correct answer receives 1 point.
- There may be one unscored part. If so, you will not know which part is
  unscored.
- Points are not deducted for incorrect answers. Always answer every question.
- The test is computer-scored.
- "Your CELPIP Level is calculated by the computer based on the number of
  points and the difficulty level of the questions. Score equating ensures
  fairness."

`[results]` adds, on re-evaluation requests: "requesting a re-evaluation of the
Listening and Reading components is unlikely to result in a change in your
scores as they are computer rated."

A blank answer earns no point, which makes it equivalent to an incorrect
answer for the total. This follows from "each correct answer receives 1 point"
plus "points are not deducted for incorrect answers"; no source states it in
those words.

### The official approximation disclaimer

`[results]` publishes both charts below under the heading "Approximate Scores
and CELPIP Levels", each followed by this disclaimer:

> DISCLAIMER: This example chart shows how scores in the Listening Test
> approximately correspond to CELPIP Levels. Since questions may have
> different levels of difficulty and may therefore be equated differently, the
> raw score required for a certain level may vary slightly from one test to
> another.

This is the single most important scoring rule for this product. CELPIP itself
calls the mapping approximate and says the raw score required for a level
varies from one test form to another. Every number we derive from these charts
is therefore an estimate by the publisher's own account, which is what the
wording rules at the end of section 16 exist to protect.

### Listening raw score to CELPIP level `[l-sco]`, `[results]`

| CELPIP Level | Listening score /38 |
| --- | --- |
| 10-12 | 35-38 |
| 9 | 33-35 |
| 8 | 30-33 |
| 7 | 27-31 |
| 6 | 22-28 |
| 5 | 17-23 |
| 4 | 11-18 |
| 3 | 7-12 |
| M-2 | 0-7 |

### Reading raw score to CELPIP level `[r-sco]`, `[results]`

| CELPIP Level | Reading score /38 |
| --- | --- |
| 10-12 | 33-38 |
| 9 | 31-33 |
| 8 | 28-31 |
| 7 | 24-28 |
| 6 | 19-25 |
| 5 | 15-20 |
| 4 | 10-16 |
| 3 | 8-11 |
| M-2 | 0-7 |

Both charts overlap deliberately. A raw score of 33 on Listening falls in both
the 9 row and the 10-12 row. The overlap exists because the real level depends
on question difficulty and score equating, not on the raw count alone. Any
product that maps a raw score to a level from these charts is producing an
approximation, and must say so.

The two sources label the bottom row differently. `[l-sco]` and `[r-sco]` call
it "M-2"; `[results]` calls it "M". They describe the same 0-7 band. Our
implementation uses "M-2".

Our implementation already handles the overlap. `LISTENING_BAND_CHART` in
`src/features/exam-engine/listening-band-score.ts` reproduces the Listening
chart above row for row, and `formatListeningBandLabel` renders an overlap as
"Level 9 or 10-12" rather than picking one. That is the correct behaviour and
should be copied for Reading.

### CELPIP Level to CLB and CEFR `[results]`

Published on the Test Results page as the CELPIP Test Level Descriptor chart.
Useful for a results screen and for explaining what a level means, and not
used in any calculation.

| CELPIP Level | CLB Level | CEFR Level | Descriptor |
| --- | --- | --- | --- |
| 12 | 12 | C2 | Expert proficiency in high-stakes social, educational, or workplace contexts |
| 11 | 11 | C1 | Advanced proficiency in high-stakes social, educational, or workplace contexts |
| 10 | 10 | C1 | Highly effective proficiency in some high-stakes social, educational, or workplace contexts |
| 9 | 9 | B2 | Effective proficiency in some high-stakes social, educational, or workplace contexts |
| 8 | 8 | B2 | Good proficiency in more demanding social, educational, or workplace contexts |
| 7 | 7 | B2 | Adequate proficiency in somewhat demanding social, educational, or workplace contexts |
| 6 | 6 | B1 | Developing proficiency in everyday social, educational, or workplace contexts |
| 5 | 5 | B1 | Acquiring proficiency in everyday social, educational, or workplace contexts |
| 4 | 4 | A2 | Adequate proficiency for daily life activities |
| 3 | 3 | A2 | Some proficiency in limited contexts |
| 2 | 1, 2 | A1 | Limited ability in contexts related to immediate needs |
| 1 | - | - | Insufficient information to assess |
| 0 | - | - | Insufficient information to assess |
| NA | - | - | Not administered: test taker did not receive this test component |

Scores are valid for two years from the date the score report is issued, and
are available online 2 to 4 business days after the test date. `[results]`

---

## 15. Scoring descriptor rules for Writing and Speaking

Writing and Speaking are not computer scored against a key. They are judged
against published performance descriptors.

### Writing `[w-desc]`

Four dimensions, each described level by level:

1. Content/Coherence
2. Vocabulary
3. Readability
4. Task Fulfillment

Plus a "When:" column describing the audience and formality the level applies
to.

Levels run 12 down to 3, then M. Level labels: 12 and 11 "Advanced
proficiency in workplace and community contexts", 10 "Highly effective
proficiency", 9 "Effective proficiency", 8 "Good proficiency", 7 "Adequate
proficiency in workplace and community contexts", 6 "Developing proficiency",
5 "Acquiring proficiency", 4 "Adequate proficiency for daily life
activities", 3 "Some proficiency in limited contexts", M "Minimal proficiency
or insufficient information to assess".

### Speaking `[s-desc]`

Four dimensions:

1. Content/Coherence
2. Vocabulary
3. Listenability
4. Task Fulfillment

Plus the same style of "When:" column.

Levels run 12 down to 3, then a combined "0, 1, 2" row labelled "Limited
ability in contexts related to immediate needs or insufficient information to
assess". Level 3 is labelled "Some proficiency in limited contexts of personal
relevance".

Speaking uses Listenability where Writing uses Readability. Everything else
lines up. A shared four-dimension rubric shape works for both, with the third
dimension named per section.

### Performance Standards factors `[results]`

`[results]` publishes the factors inside each category. These are the specific
things a rater looks at, and they are what an AI rubric prompt should be built
from.

| Category | Writing factors | Speaking factors |
| --- | --- | --- |
| 1. Content/Coherence | Number of ideas; Quality of ideas; Organization of ideas; Examples and supporting details | Number of ideas; Quality of ideas; Organization of ideas; Examples and supporting details |
| 2. Vocabulary | Word choice; Suitable use of words and phrases; Range of words and phrases; Precision and accuracy | Word choice; Precision and accuracy; Range of words and phrases; Suitable use of words and phrases |
| 3. Readability (Writing) / Listenability (Speaking) | Format and paragraphing; Connectors and transitions; Grammar and sentence structure; Spelling and punctuation | Rhythm, pronunciation, and intonation; Pauses, interjections, and self-correction; Grammar and sentence structure; Variety of sentence structure |
| 4. Task Fulfillment | Relevance; Completeness; Tone; Word count | Relevance; Completeness; Tone; Length |

Categories 1 and 2 carry the same four factors in both sections. Only
categories 3 and 4 differ, and category 4 differs only in its last factor,
Word count against Length. So a single rubric table with a per-section factor
list is enough to model both.

The fuller level-by-level wording is in `[w-desc]` and `[s-desc]`, and the
two PerformanceStandards PDFs listed in section 18 hold the rater-facing
version. This ticket changes no AI logic, so none of this is wired up yet.

`[screens]` states the requirement on our side: evaluation should be based on
the Performance Standards for the CELPIP-General Writing Test and the
CELPIP-General Speaking Test, so that the AI "does not [do] anything on its
own". The descriptor PDFs are the rubric the AI must be given. This ticket
changes no Writing or Speaking AI logic.

### Wording rules for any Writing or Speaking result we show

The same rules as section 16. An AI estimate against published descriptors is
an estimated practice band. It is not a CELPIP score, and no wording may
suggest a rater produced it.

---

## 16. Confirmed rules

Everything in this section is stated directly by an official source and can be
built against.

Structure:

1. Four components: Listening, Reading, Writing, Speaking. `[format]`
2. Listening 46-55 minutes, 38 scored questions, 6 parts of 8, 5, 6, 5, 8, 6.
   `[format]`, `[l-sco]`
3. Reading 43-56 minutes, 38 scored questions, 4 parts of 11, 8, 9, 10.
   `[format]`, `[r-sco]`
4. Writing 53 minutes, 2 tasks, 150-200 words each. `[format]`, `[w-ovw]`
5. Speaking 15 minutes, 8 tasks, each preparation then recording. `[format]`,
   `[s-ovw]`
6. All eight Speaking task names and all six Listening and four Reading part
   names. `[format]`

Listening format:

7. Parts 1 to 3: multiple choice, questions heard, four choices printed,
   questions appear one by one, 30 seconds each, answered in order. `[pack]`
8. Parts 4 to 6: sentence completion, questions and four choices printed, all
   questions on one screen, one time allowance for the screen, answered in any
   order. `[pack]`
9. Four answer options per question, one correct answer per question.
   `[pack]`
10. The questions for each part come after the audio. `[pack]`

Media:

11. Audio clips are played one time only. `[pack]`
12. Audio clips begin automatically. `[pack]`
13. Part 5 is the only video part. `[l-ovw]`

Timing:

14. When time is up, the test automatically moves forward to the next screen.
    `[pack]`
15. Answers can be changed freely until the window for that question or
    section closes. `[pack]`

Scoring:

16. Listening and Reading are computer scored, 1 point per correct answer, no
    deduction for incorrect answers. `[l-sco]`, `[r-sco]`
17. The published raw-score-to-level charts in section 14, including their
    overlapping rows. `[l-sco]`, `[r-sco]`, `[results]`
18. The charts are approximate, and the raw score required for a level may
    vary slightly from one test to another, because questions differ in
    difficulty and are equated differently. `[results]`, and consistent with
    `[l-sco]` and `[r-sco]` on score equating.
19. Writing is judged on Content/Coherence, Vocabulary, Readability and Task
    Fulfillment. `[w-desc]`
20. Speaking is judged on Content/Coherence, Vocabulary, Listenability and
    Task Fulfillment. `[s-desc]`

### Wording rules this product must follow

Because rule 18 makes any chart lookup approximate, and because we are not
CELPIP, every number this product shows a learner is an estimate:

- Say "estimated practice score".
- Say "estimated practice band".
- Say "not an official CELPIP score".
- Never say "your CELPIP level is", "your CELPIP score", "band score" without
  the word estimated, or anything that implies Paragon Testing Enterprises
  produced or endorsed the number.
- Never reproduce official CELPIP branding, logos or trade dress in
  production UI. The reference materials in `public/` and `_reference/` are
  internal source documents, not design assets.

These rules apply to Listening, Reading, Writing and Speaking results alike,
and to any future certificate, report or export.

---

## 17. Rules needing further confirmation

Nothing in this section may be built against until it is confirmed.

### 17.1 Listening section total: 46-55 or 47-55 minutes

`[format]` says 46-55 minutes. `[pack]` says "The Listening Test takes about
47-55 minutes to complete."

Treat 46-55 as authoritative, because `[format]` is the current published test
format page and `[pack]` is a 2022 study pack redistributed in 2026. Low
impact: we do not enforce a section total today.

### 17.2 Part 5 allowance: 6 or 9 minutes

`[l-ovw]` says Part 5 is 6 minutes for 8 questions. `[pack]` says "About 9
minutes to watch the video and answer about 8 questions".

The `[pack]` figure appears to include the video, and its own strategy note
says to allow roughly 30 seconds per question, which is 4 minutes of answering
for 8 questions plus a 1.5 to 2 minute video. Neither reading is certain.

This matters, because Part 5 is the part whose timer we most need to set.
Resolve it in EXAM-15F before a Part 5 screen timer is enforced. Until then,
prefer the `[l-ovw]` per-part table, because it is the only source that gives
a per-part figure for every part in one consistent unit.

The same tension exists at a smaller scale for Part 6: `[l-ovw]` and `[pack]`
both say about 8 minutes, so Part 6 is not in doubt.

### 17.3 Exact wording of two `[pack]` sentences

Two sentences in `[pack]` place their key words in bold, and those bold runs
did not survive text extraction from the PDF:

- "When your time is up, the test will automatically move forward to the next
  screen. You [___] to a previous part of the test."
- "Audio clips begin automatically and [___]."

The surrounding sentences and the ticket's own statement of the official facts
both give the same reading: the learner cannot go back to a previous part, and
audio cannot be paused. Both rules are listed as confirmed on that basis. What
is not confirmed is the exact published phrasing, which matters only if we
ever quote `[pack]` verbatim in learner-facing copy. Confirm by opening the
PDF and reading page 3 before quoting.

### 17.4 Whether Reading follows the same timing and navigation model

`[pack]` is a Listening study pack. Its statements about automatic advance and
no return to a previous part are made about the Listening Test. We hold no
equally direct source saying Reading behaves the same way, although `[r-ovw]`
publishing a per-part time table strongly implies per-part windows.

Confirm before EXAM-16 enforces Reading timing. A Reading Pro Study Pack, if
one is published, is the source to look for.

### 17.5 Whether a per-screen window in Parts 4 to 6 is published as a number

`[pack]` says there is "a set amount of time to answer all questions on
screen" but does not publish that number separately from the part total. The
part totals in `[l-ovw]` include the audio.

So a Part 4 screen timer cannot be read off a source directly. It has to be
derived: part total minus clip length. For Part 4 that is about 5 minutes
minus about 1.5 minutes, leaving about 3.5 minutes for 5 questions. Derived
numbers must be labelled as derived in the data model, which is why the
blueprint gives a timer rule a `source` field.

### 17.6 Mock Test 1 Part 5 question format

Our source test writes Part 5 as eight full questions, while `[pack]` says
Parts 4 to 6 are sentence completion. This is a content-level conflict, not a
rules-level one, and it is analysed in full in the audit document, section 5.

### 17.7 Practice task and unscored items

Both `[l-ovw]` and `[r-ovw]` list an unscored practice task and an unscored
items block. We reproduce neither. That is a deliberate product decision for a
practice test rather than an unconfirmed rule, but it should be a conscious
decision at the point Mock Test 2 is authored, not an accident. The blueprint
carries an `is_scored` flag on a part so the decision stays available.

---

## 18. Source links used

Official CELPIP sources:

- CELPIP Test Format - https://www.celpip.ca/take-celpip/test-format/
- CELPIP Test Results - https://www.celpip.ca/take-celpip/test-results/
- CELPIP Listening Pro Study Pack 2026 -
  https://www.celpip.ca/wp-content/uploads/2026/01/Listening-Pro-Study-Pack-2026.pdf

All three were retrieved and read on 2026-08-28. The Test Results page supplied
the approximation disclaimer in section 14, both raw score charts, the CELPIP
Level to CLB and CEFR chart, the Performance Standards factor lists in section
15, and the statement that Listening and Reading are computer rated.

The raw score charts on the Test Results page and in the local Listening and
Reading Scoring PDFs are identical, row for row, apart from the bottom row
being labelled M rather than M-2. That agreement between two independent
official sources is why the charts are listed as confirmed.

Official CELPIP publications held locally (CELPIP Accelerate, Paragon Testing
Enterprises):

- `public/Overview and Scoring Descriptors/1. Listening/Listening - Overview.pdf`
- `public/Overview and Scoring Descriptors/1. Listening/Listening - Scoring.pdf`
- `public/Overview and Scoring Descriptors/2. Reading/Reading - Overview.pdf`
- `public/Overview and Scoring Descriptors/2. Reading/Reading - Scoring.pdf`
- `public/Overview and Scoring Descriptors/3. Writing/Writing - Overview.pdf`
- `public/Overview and Scoring Descriptors/3. Writing/Writing - PerformanceStandards.pdf`
- `public/Overview and Scoring Descriptors/3. Writing/Writing - ScoreDescriptors.pdf`
- `public/Overview and Scoring Descriptors/4. Speaking/Speaking - Overview.pdf`
- `public/Overview and Scoring Descriptors/4. Speaking/Speaking - PerformanceStandards.pdf`
- `public/Overview and Scoring Descriptors/4. Speaking/Speaking - ScoreDescriptors.pdf`

Toronto Academy source files:

- `mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`
- `mock-tests/mock-test-1/extracted-content-outline.md`
- `mock-tests/mock-test-1/extracted-links.md`
- `_reference/exam-engine/official-screens/Official Test Explanation with Screenshots (1).docx`

Existing project documents consulted:

- `docs/product/exam-engine-screen-types.md`
- `docs/product/mock-test-1-content-map.md`
- `docs/product/exam-engine-reference-audit.md`
- `docs/product/full-listening-qa-band-score.md`
- `docs/product/exam-timer-foundation.md`

---

## 19. Recommended next tickets

The sequence these three documents feed into:

1. `EXAM-15F` - Listening Part 4-6 Format and Strict Timing Correction
2. `EXAM-16` - Reading Part 1 Prototype
3. `EXAM-17` - Reading Part 1 Review and Score
4. `READING-FULL` - Full Reading Section Flow and Estimated Band Score
5. `ADMIN-00` - Admin Mock Test Builder Database Blueprint
6. `ADMIN-01` - Admin Mock Test Builder MVP

None of these tickets are created by EXAM-15E. The sequence is documented
only.
