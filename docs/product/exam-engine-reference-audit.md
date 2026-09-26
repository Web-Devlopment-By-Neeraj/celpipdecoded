# Exam engine reference audit (EXAM-00)

Audit of the two reference documents that describe the CELPIP-style
practice test engine, done before any engine code is written.

Ticket: `docs/tickets/EXAM-00-reference-content-audit.md`

This document is planning only. No app source file, route, component,
migration, or asset was changed by this ticket.

House style: normal hyphens only, no long hyphens or em dashes.

Companion documents:

- `docs/product/exam-engine-screen-types.md` - reusable screen and
  question types
- `docs/product/mock-test-1-content-map.md` - Mock Test 1 content map
- `docs/product/exam-engine-ticket-sequence.md` - recommended build order
- `mock-tests/mock-test-1/extracted-links.md` - grouped Cloudinary links
- `mock-tests/mock-test-1/extracted-content-outline.md` - text outline

---

## 1. Source files

Both reference files are present in the repository. The paths differ
slightly from the paths named in the ticket. Files were read in place and
nothing was moved, because the ticket forbids moving files.

| Ticket expected | Actual path in repo | Size |
| --- | --- | --- |
| `reference/exam-engine/official-screens/Official Test Explanation with Screenshots.docx` | `_reference/exam-engine/official-screens/Official Test Explanation with Screenshots (1).docx` | 9.4 MB, 93 embedded screenshots |
| `reference/mock-tests/mock-test-1/Mock Test 1 - Sajinlinks.docx` | `mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx` | 51 KB, 0 embedded media, 46 external Cloudinary links |

Neither directory is git ignored, so both source documents and the
derived notes are tracked.

The two optional output files were written next to the source document in
`mock-tests/mock-test-1/` rather than under a new `reference/` tree, so
that the extraction notes sit beside the file they were extracted from.

Follow up decision needed: whether to normalise these two locations into
one `reference/` tree. That is a file move, so it belongs in its own
ticket, not here.

---

## 2. What each document actually is

**Official Test Explanation with Screenshots.docx** is a short narrated
walkthrough written by the program owner. It contains 93 screenshots of
the official CELPIP practice test engine plus about 25 lines of
commentary describing the intended order. The commentary is where the
product intent lives, for example:

- The overview instructional video is skipped when a learner jumps
  straight into a single section.
- Writing needs spell check and a word count.
- Speaking is split into a preparation phase and a recording phase, and
  the timings vary per task.
- The official engine does not record speaking audio. Our engine must
  record it and run AI evaluation on it.
- Writing and Speaking AI evaluation must follow the published
  Performance Standards, supplied separately as PDFs plus a fixed prompt.

**Mock Test 1 - Sajinlinks.docx** is the content source. It carries the
full text of every Listening question and option, the full text of every
Reading passage, question and option, the Reading answer keys, and 46
Cloudinary URLs for audio, video and images. Writing and Speaking prompts
exist only as images.

Correct answers are not marked in the Listening question text. The only
yellow highlighting in the file is two author notes about audio
sequencing, not answer marking.

---

## 3. Official screen sequence

Order taken from the commentary and the screenshot order in the official
document. Screenshot numbers refer to the embedded images in the source
docx and are internal reference only.

| Step | Screen | Source images |
| --- | --- | --- |
| 1 | Overview instructional video (skipped when entering a single section directly) | image1 |
| 2 | Listening test instructions | image2 |
| 3 | Listening instructional video | image3 |
| 4 | Listening Part 1 to Part 6, each with part instructions, context screen, audio or video screen, question screens | image4 to image47 |
| 5 | Listening result page, answer key beside learner answer | image48 |
| 6 | Listening score screen, raw score plus approximate level | image49 |
| 7 | End of Listening test screen | image50 |
| 8 | Listening raw score conversion chart and level chart, reference only, not shown in the real exam | image51, image52 |
| 9 | Reading test instructions | image53 |
| 10 | Reading instructional video | image54 |
| 11 | Reading Part 1 to Part 4, split passage and question layout | image55 to image59 |
| 12 | Reading result page, answer key beside learner answer | image60 |
| 13 | Reading score screen | image61 |
| 14 | End of Reading test screen | image62 |
| 15 | Reading raw score conversion chart and level chart, reference only | image63, image64 |
| 16 | Writing test instructions | image65 |
| 17 | Writing instructional video | image66 |
| 18 | Writing Task 1, split information and editor layout | image67 |
| 19 | Writing Task 2, option choice, editor opens after a choice is made | image68, image69 |
| 20 | End of Writing test screen | image70 |
| 21 | Performance Standards for Writing reference screen | image71 |
| 22 | Speaking test instructions | image72 |
| 23 | Speaking instructional video | image73 |
| 24 | Speaking Task 1 to Task 8, preparation phase then recording phase | image74 to image92 |
| 25 | End of Speaking test screen | image92 |
| 26 | Performance Standards for Speaking reference screen | image93 |

Notes on the sequence.

- Every section follows the same shape: instructions, video, parts,
  result page, score page, end of section.
- Writing and Speaking have no result or score page in the official
  engine. They end at the end-of-section screen and point at the
  Performance Standards and at sample responses. Our engine replaces that
  with AI evaluation.
- The two conversion charts per section are explicitly marked in the
  source as reference material that does not appear in the exam screens.

---

## 4. Shared UI patterns observed in the screenshots

These are layout and behaviour observations. They describe what the
screens do, and are used to build original Toronto Academy screens. No
official screenshot, logo, colour, or wording is copied into the product.

**Frame**

- A single fixed exam frame with a light grey title bar at the top and a
  light grey footer bar at the bottom. The exam canvas between them is
  white or very pale blue.
- The title bar carries the test title on the left, in the form
  `Practice Test 1 - Listening Part 1: Listening to Problem Solving`. The
  title states the test, the section, the part number, and the part name.
- The forward control sits at the top right of the title bar, labelled
  `NEXT`, blue background, white uppercase text.
- The back control sits at the bottom right of the footer bar, labelled
  `BACK`. Forward and back are deliberately far apart.
- Some screens add a secondary control at the bottom left of the footer,
  for example `Answer Key` on Reading part screens.

**Timers**

- Listening and Reading show `Time remaining: 30 seconds` or
  `Time remaining: 9 minutes` in the title bar, left of the Next button.
  The value turns red as the time gets short.
- Speaking shows two values in the same slot,
  `Preparation: 30 seconds  Recording: 90 seconds`, both fixed labels for
  the task rather than a live countdown.
- Writing shows a single `Time remaining: 26 minutes` value.
- Instruction, video, and end-of-section screens show no timer.

**Instruction blocks**

- A small circled information icon precedes every instruction heading.
- Part instructions are a bulleted list, one idea per bullet, separated by
  faint dotted rules.
- Key words inside instruction sentences are emphasised in a lighter
  accent colour, for example the word `best` in
  `Choose the best answer to each question.`

**Two-column layouts**

- Listening question screens: left column is the audio player, right
  column is the question. The right column has a pale blue background so
  the two halves read as separate panes.
- Reading part screens: left column is the passage or diagram, right
  column is the question set. Both columns scroll independently and each
  has its own scrollbar.
- Writing task screens: left column is the source information plus a
  sample responses link, right column is the prompt and the editor.
- Speaking Task 5 uses two side-by-side option cards, and the chosen card
  is tinted green.

**Media**

- Audio uses a large grey panel containing a speaker glyph, the word
  `Playing...`, and a progress bar with no seek control. A native playbar
  appears underneath it in the practice engine only, with a callout
  reading `This playbar will not appear in the official test.`
- Video uses a standard inline player with a `Skip Video` button
  underneath, for instructional videos only.
- The Listening Part 5 discussion video plays in the same slot as the
  audio panel.

**Answer states**

- Radio options are a vertical list with a small circle and a dotted
  bottom rule per row. The selected row is underlined and gets a pale
  blue row highlight, and the circle fills.
- Dropdown blanks are inline underlined select controls placed inside the
  sentence, so the question reads as a sentence with a gap.
- Reading paragraph matching puts the dropdown before the statement.

**Result and score**

- The result page is a three column table: `Question`, `Answer Key`,
  `Your Answer`, with a green check or a red cross in a fourth narrow
  column. Row labels are fully qualified, for example
  `Listening Part 1: Listening to Problem Solving - Q1`.
- Rows with no learner answer show a blank `Your Answer` cell and no mark.
- A `Return to the beginning of Part N` row separates the parts.
- The score screen is a small table of `Number of Questions`,
  `Your Score`, `Your Approximate CELPIP Score`, followed by a boxed note
  explaining that the score is an estimate only.

The estimate note on the official score screen is the exact behaviour our
product already uses in wording such as `Practice estimates are for
preparation only and are not official CELPIP scores`. Reuse the existing
constant `PRACTICE_ESTIMATE_DISCLAIMER` in
`src/features/dashboard/dashboard-copy.ts` rather than writing new copy.

---

## 5. Cloudinary asset summary

46 unique Cloudinary URLs. Full grouped list with URLs is in
`mock-tests/mock-test-1/extracted-links.md`. Nothing was downloaded.

| Group | Count |
| --- | --- |
| Listening section audio (passage or news or report) | 8 |
| Listening question audio | 18 |
| Listening video | 1 |
| Listening context images | 1 |
| Listening answer explanation images | 6 |
| Reading images (diagram) | 1 |
| Writing images (task prompts) | 2 |
| Speaking images (task prompts) | 9 |
| Total | 46 |

By media type: 26 mp3, 1 mp4, 19 png.

This table counts the document as it was audited. The 2026-08-16
correction to `Mock Test 1 -Sajinlinks.docx` swapped one URL without
changing the total: the Part 3 Question 1 slot lost the section audio
re-upload and gained a real question clip, so section audio is 7 and
question audio is 19 in the corrected document. Both counts are current in
`mock-tests/mock-test-1/extracted-links.md`. The re-upload URL is still
what the Part 3 content serves the conversation from, so no asset was
retired.

Two Cloudinary cloud names appear: `dkvsshy7n` for 45 assets and
`ds1wvtjft` for 1. The single `ds1wvtjft` asset is the Listening Part 3
section audio and looks like a leftover from an earlier upload account.

---

## 6. Question types needed

Detail and screen mapping are in
`docs/product/exam-engine-screen-types.md`. Summary:

| Type | Where it is used | Auto scored |
| --- | --- | --- |
| Single choice radio | Listening Parts 1, 2, 3 | Yes |
| Image answer radio | Listening, official practice test Part 1 Q6 shows image options | Yes |
| Dropdown blank in a sentence | Listening Parts 4, 5, 6 and Reading Parts 1, 2, 4 | Yes |
| Paragraph matching dropdown, A to E | Reading Part 3 | Yes |
| Option choice plus writing textarea | Writing Task 2 | No, AI evaluated |
| Writing textarea | Writing Task 1 | No, AI evaluated |
| Option choice plus speaking recording | Speaking Task 5 | No, AI evaluated |
| Speaking recording | Speaking Tasks 1 to 8 | No, AI evaluated |
| Answer review row | Listening and Reading result pages | n/a |
| Score summary | Listening and Reading score pages | n/a |

The image answer radio type appears in the official practice test result
table but not in Mock Test 1. Build the data model to allow it, and defer
the UI until a mock test actually uses it.

---

## 7. How this connects to the current app later

Nothing below is implemented in this ticket. This section records where
the seams are so later tickets do not have to rediscover them.

**Dashboard**

`src/features/dashboard/dashboard-copy.ts` already lists four module
slugs, `celpip-speaking`, `celpip-writing`, `celpip-reading`,
`celpip-listening`, and maps only the first two to routes in
`DASHBOARD_MODULE_ROUTES`. Reading and Listening render as coming soon
because they have no route. Shipping the exam engine is what turns those
two cards on. The change is one entry per module in that map, not a
dashboard rewrite.

**Navigation**

`src/features/navigation/app-nav-items.ts` is the single source for the
sidebar, mobile drawer, and breadcrumbs. A practice test entry is one new
`AppNavItem` plus one `AppNavIconName` plus segment labels in
`SEGMENT_LABELS`. Do not add navigation until a route exists.

**Speaking**

`src/features/speaking/` already contains the pieces the Speaking section
of the exam needs: `practice-flow.ts` for the preparation and recording
phases, `timer-utils.ts`, `recording-upload.ts`,
`generate-speaking-feedback.ts`, `scoring-prompt.ts`,
`scoring-schema.ts`, `transcribe-attempt.ts`, and the
`TimedPracticeShell` and `useAudioRecorder` components. The exam engine
should present a different shell around these, not a second pipeline.
The Speaking section is a presentation adapter over the existing task
runner.

**Writing**

Same shape. `src/features/writing/` has `submit-writing-attempt.ts`,
`evaluate-writing-attempt.ts`, `generate-writing-feedback.ts`,
`word-count.ts`, `writing-timer.ts`, plus `TimedWritingShell`,
`WritingEditor`, and `WordCountCard`. The official screens call for spell
check and a live word count; `WordCountCard` already covers the count.

**Usage limits**

`src/features/usage/` gates scored attempts:
`check-scored-attempt-access.ts` runs before an expensive AI call and
`consume-scored-attempt-credit.ts` charges after a report is saved. A
scored attempt is defined today as one completed speaking or writing
feedback report.

Open product question for EXAM-07 and EXAM-08, not for this ticket: a
full mock test contains 2 writing tasks and 8 speaking tasks. At the
current definition that is 10 scored attempts for one mock test. Decide
whether a mock test is charged as one unit or per task before any exam
route calls the AI endpoints. Listening and Reading are auto scored and
cost nothing, so they should not be charged at all.

**Result history**

Speaking and Writing each already have an attempt history surface,
`/dashboard/speaking/attempts` and `/dashboard/writing/attempts`, backed
by `attempt-history.ts` and `writing-attempt-history.ts`. A mock test
result needs its own record that links to the per-task attempts rather
than duplicating them, so a learner sees one mock test entry that expands
into its speaking and writing reports plus its listening and reading
scores.

**AI scoring**

`src/features/speaking/scoring-prompt.ts` and
`src/features/writing/writing-scoring-prompt.ts` hold the graded prompts,
with matching schemas. The exam engine must not write new prompts and
must not call the model directly. It calls the existing
`/api/speaking/feedback` and `/api/writing/evaluate` endpoints.

**AI usage instrumentation**

`src/features/usage/record-ai-usage-event.ts` and
`ai-usage-metadata.ts` record cost per call. Any new call path must go
through the same recorder, otherwise the cost reporting silently
undercounts.

---

## 8. Do not change list

Nothing in this list may be touched by EXAM-01 through EXAM-09 without
its own ticket.

| Area | Files |
| --- | --- |
| Speaking AI backend | `src/app/api/speaking/feedback/route.ts`, `src/app/api/speaking/transcribe/route.ts`, `src/features/speaking/generate-speaking-feedback.ts`, `transcribe-attempt.ts`, `transcription-client.ts` |
| Writing AI backend | `src/app/api/writing/evaluate/route.ts`, `src/app/api/writing/attempts/route.ts`, `src/features/writing/evaluate-writing-attempt.ts`, `generate-writing-feedback.ts`, `submit-writing-attempt.ts` |
| AI prompts and schemas | `src/features/speaking/scoring-prompt.ts`, `scoring-schema.ts`, `src/features/writing/writing-scoring-prompt.ts`, `writing-scoring-schema.ts` |
| Usage access logic | all of `src/features/usage/`, `src/app/api/usage/access/route.ts` |
| Dashboard redesign | `src/app/dashboard/page.tsx`, `src/components/dashboard/`, `src/features/dashboard/` |
| Supabase schema | `supabase/migrations/` |
| Auth | `src/app/(auth)/`, `src/app/auth/callback/route.ts`, `src/lib/supabase/` |
| Payment | not built yet, do not start it here |
| Live classes | `src/components/landing/LiveClassesSection.tsx` and the `/#live-classes` nav item |
| Design system | `src/features/design/`, `src/components/app/` primitives, `src/app/globals.css` tokens. Consume them, do not fork them. |

---

## 9. Copyright and branding rules

- The 93 official screenshots are internal layout reference only. They
  stay inside the source docx. They are not extracted into `public/`,
  not served to learners, and not embedded in any component.
- No official CELPIP logo, wordmark, or maple leaf mark goes into the
  product. Toronto Academy branding only.
- Do not describe the product as the official CELPIP test. Approved
  wording: practice test engine, CELPIP-style practice, Toronto Academy
  practice test, practice estimates are not official CELPIP scores.
- Screen titles in the product should read
  `Toronto Academy Practice Test 1 - Listening Part 1`, not
  `Practice Test 1 - Listening Part 1` copied from the official engine.
- The score conversion charts in the official document are reference for
  our own estimate mapping. Publish the resulting level as an estimate
  with the existing disclaimer, never as a CELPIP score.
- Mock Test 1 content is licensed material held by Toronto Academy. Serve
  it only to authenticated learners with access, never from a public
  route and never in a page that search engines can index.

---

## 10. Risks and manual review items

Each of these needs a human decision or a content fix before the ticket
that depends on it can ship.

1. **Listening answer keys are images only.** All six Listening answer
   keys exist only as PNG screenshots on Cloudinary. Nothing in the
   document text marks the correct Listening options. Listening cannot
   be auto scored until someone transcribes the six answer key images
   into structured data. This blocks EXAM-04. Reading answer keys are
   present as text and are already captured in the content map.

2. **Listening Part 3 Question 1 audio is probably wrong.** Closed on
   2026-08-16. The reading was right: the Question 1 slot held
   `Listening_Test_1_-_Part_3_-_Audio_nk6pmi_ugrx14.mp3`, a re-upload of
   the Part 3 section audio, and the real Q1 recording had never been
   uploaded. The source document was corrected and that slot now holds
   `Listening_Test_1_-_Part_3_-_Q1_eavvnb_in9hcf.mp3`, matching the `Q<n>`
   naming every other question slot uses. Part 3 Question 1 plays its own
   question audio, and the EXAM-15C conversation replay workaround built
   while the clip was missing has been removed.

3. **Listening Part 3 has two section audio URLs.** One on the old
   `ds1wvtjft` cloud, one on `dkvsshy7n`. Confirm which is current and
   whether the `ds1wvtjft` account is still live, otherwise Part 3 breaks
   silently when that account is closed.

4. **Writing and Speaking prompts are images only.** All 11 Writing and
   Speaking prompt assets are PNG screenshots. The AI scoring prompts
   need the task text as text, and screen readers need it too. The prompt
   text must be typed out into the task library before EXAM-07 and
   EXAM-08.

5. **Listening question counts do not match the official score screen.**
   Mock Test 1 has 38 Listening questions (8, 5, 6, 5, 8, 6). The
   official score screen screenshot shows 37 and the conversion chart is
   out of 38. Confirm the denominator used for the estimate.

6. **Scored attempt cost of a full mock test.** 2 writing plus 8 speaking
   tasks equals 10 scored attempts under the current rule. Decide the
   charging model before any exam route calls an AI endpoint.

7. **Spell check on the writing editor.** The source document asks for
   spell check. The browser gives this for free on a textarea, and a
   custom spell checker is a large piece of work. Confirm that native
   browser spell check is acceptable.

8. **Speaking recording is a product difference.** The official engine
   does not record. Ours must. Recording consent, storage, and retention
   are already handled for the existing speaking practice flow, so the
   exam engine should reuse that path rather than opening a new one.

9. **Reference directory layout.** Two parallel trees, `_reference/` and
   `mock-tests/`, hold reference material. Consolidating them is a file
   move and needs its own ticket.

10. **Timings are not in Mock Test 1.** Per-part time limits, and the
    preparation and recording seconds per speaking task, appear only in
    the official screenshots. They must be entered as configuration in
    EXAM-01 and confirmed against the official published timings.
