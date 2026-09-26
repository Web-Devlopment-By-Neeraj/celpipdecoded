# Exam engine ticket sequence (EXAM-00)

Recommended build order for the CELPIP-style practice test engine.

Parent audit: `docs/product/exam-engine-reference-audit.md`
Screen types: `docs/product/exam-engine-screen-types.md`
Content map: `docs/product/mock-test-1-content-map.md`

House style: normal hyphens only, no long hyphens or em dashes.

---

## What sets the order

**The frame is shared by all 16 screen types.** Every screen sits inside
the same title bar, timer, and next and back controls. Building any
section before the frame means building the frame three times.

**Listening and Reading are new work, Writing and Speaking are not.**
`src/features/speaking/` and `src/features/writing/` already run a timed
task, an editor or recorder, an AI evaluation, and a result report end to
end. The exam engine needs a different presentation around them, not a
second pipeline. So Listening and Reading come first, because they are
where the actual new capability is.

**Two content gaps block scoring.** The Listening answer keys exist only
as images, and the Writing and Speaking prompts exist only as images.
Neither is a code problem. Both need a person to transcribe them, and
both should start now so they are not on the critical path.

**Usage limits are a decision, not a task.** A full mock test is 2
writing plus 8 speaking responses, which is 10 scored attempts under the
current rule in `src/features/usage/`. That decision must be made before
any exam route calls an AI endpoint, which means before EXAM-07.

---

## Parallel content track

Not code. Start immediately, run alongside EXAM-01 and EXAM-02.

**EXAM-C1 - Transcribe Listening answer keys.** Turn the six Cloudinary
answer key images into structured data, one correct option id per
question, plus the explanation text. Blocks EXAM-04.

**EXAM-C2 - Transcribe Writing and Speaking prompts.** Turn the 11 prompt
images into task text. Blocks EXAM-07 and EXAM-08. Also fixes an
accessibility problem, since an image-only prompt cannot be read aloud.

---

## Code tickets

### EXAM-01 - Exam engine screen shell

The frame and nothing else.

- Exam frame with header bar, canvas, footer bar, title slot, timer slot,
  next, back, and an optional secondary action.
- Timer behaviour: absent, single countdown, or the speaking preparation
  and recording pair. The frame owns the clock, a screen only declares
  what it needs.
- Screen sequence runner: an ordered list of screens, forward and back,
  and answer state held across the whole sequence.
- Screen type 1, instructional text, as the first consumer, so the shell
  ships with something rendering.
- Built from `src/features/design/` and `src/components/app/`. No new
  design tokens, no new button variants.
- Timings enter as configuration, using the values in the content map,
  each marked as needing confirmation.

Does not touch: any existing route, the dashboard, navigation, usage,
either AI pipeline. No Supabase migration. Route lives behind auth but is
not linked from navigation yet.

Why first: everything else renders inside it.

### EXAM-02 - Instructional video screen

Screen type 2. Small on purpose, and it proves the shell handles a screen
whose next control depends on media state.

- Video player, skip control, next enabled on end or on skip.
- The routing rule from the source document: the overview video is
  skipped when a learner enters a single section directly rather than
  starting a full mock test.

Why here: it is the smallest real screen, and it is the first place the
shell has to coordinate with media.

### EXAM-03 - Listening Part 1 prototype

The hardest listening shape, done first so the model is proved against
the worst case rather than the easiest one.

- Screen types 3, 4, and 6: context screen, audio intro screen, radio
  question screen.
- Part 1 structure: audio section 1 then Q1 and Q2, audio section 2 then
  Q3 to Q5, audio section 3 then Q6 to Q8.
- Play once behaviour, non seekable progress, next disabled until a clip
  finishes.
- The optional practice playbar, defaulting to off in a full mock test
  and on when a single part is opened for study.
- Cloudinary URLs referenced directly. No download, no re-hosting.

Answers are collected, not yet scored. Scoring arrives in EXAM-04.

Why here: Part 1 is the only part with interleaved audio and questions.
If the sequence model survives Part 1, Parts 2 to 6 are configuration.

### EXAM-04 - Listening result and answer review

- Screen type 13, answer review table, with the fully qualified row
  labels, the answer key column, the learner answer column, and the mark
  column. Unanswered rows stay blank and unmarked.
- Screen type 14, score summary, reusing
  `PRACTICE_ESTIMATE_DISCLAIMER` from
  `src/features/dashboard/dashboard-copy.ts`.
- Screen type 15, end of section.
- The auto scoring function shared by all four auto scored question
  types.
- The raw score to estimated level mapping, published as an estimate
  only.

Blocked by EXAM-C1. Without the transcribed answer keys there is nothing
to score against.

Why here: a section that cannot show a result is not shippable, and the
review and score screens are reused unchanged by Reading.

### EXAM-05 - Reading Part 1 prototype

- Screen type 8, the split screen, with two independently scrolling
  columns.
- `dropdown_blank` questions rendered inline inside sentence stems.
- Two question panels on one screen, the question set and the
  fill-in-the-blank reply.
- Reading Part 1 answer keys already exist as text, so this part is
  scorable the day it is built.

Why here: it reuses the shell and the scoring function, and it is the
second and last genuinely new layout.

### EXAM-06 - Reading result and answer review

- Reuses screen types 13, 14, 15 unchanged from EXAM-04.
- Adds `paragraph_match` to the scoring function and to the review table,
  which prints the letter rather than the option text.
- Remaining Reading parts 2, 3, 4 enter as content on the layouts already
  built. Part 2 uses the diagram variant of the left panel.

At the end of this ticket, Listening and Reading are complete and
scorable, and the two coming soon dashboard cards can be turned on by
adding two entries to `DASHBOARD_MODULE_ROUTES` in
`src/features/dashboard/dashboard-copy.ts`.

### EXAM-07 - Writing exam-style UI adapter

Presentation only. The pipeline does not change.

- Screen type 9, the split information and editor layout, plus the option
  variant for Task 2 where the editor appears after a choice is made.
- Live word count via the existing `WordCountCard`, native browser spell
  check on the textarea.
- Submits through the existing `/api/writing/evaluate` route. No new
  prompt, no new schema, no direct model call.
- Records cost through `src/features/usage/record-ai-usage-event.ts` on
  the same path as today.

Blocked by EXAM-C2 and by the usage decision.

Prerequisite decision: whether a mock test is one scored attempt or ten.
`check-scored-attempt-access.ts` and `consume-scored-attempt-credit.ts`
must not be changed by this ticket. If the answer is one attempt per mock
test, that is its own usage ticket and it comes before this one.

### EXAM-08 - Speaking exam-style UI adapter

Presentation only, same rule.

- Screen types 10, 11, and 12: preparation, recording, and the Task 5
  two-card option choice.
- Reuses `useAudioRecorder`, `recording-upload.ts`, `practice-flow.ts`,
  and `timer-utils.ts` from `src/features/speaking/`.
- Submits through the existing `/api/speaking/transcribe` and
  `/api/speaking/feedback` routes.
- Instruction copy rewritten for Toronto Academy behaviour. The source
  document says the practice test does not record and gives no score.
  Ours records and gives an estimate, so that copy cannot be reused.

Blocked by EXAM-C2 and by the same usage decision.

### EXAM-09 - Mock Test 1 flow assembly

The first end to end run.

- Chains all four sections into one sequence with the overview
  instructional video at the front.
- Screen type 16, the performance standards reference screens, rendering
  from the same rating categories the AI schemas already use, so the
  explanation and the report cannot drift.
- A mock test result record that links to the per-task speaking and
  writing attempts rather than duplicating them, so a learner sees one
  mock test entry that expands into its four section results.
- One navigation entry in `src/features/navigation/app-nav-items.ts`,
  plus the segment labels for breadcrumbs.
- Resume behaviour: a mock test is long, so a learner must be able to
  leave and return.

This is the first ticket that touches navigation and the dashboard, and
it touches them by adding entries to the two existing registries, not by
redesigning either.

---

## Summary

| Ticket | Depends on | New capability |
| --- | --- | --- |
| EXAM-C1 | none | Listening answer keys as data |
| EXAM-C2 | none | Writing and Speaking prompts as text |
| EXAM-01 | none | exam frame and sequence runner |
| EXAM-02 | EXAM-01 | instructional video screen |
| EXAM-03 | EXAM-01 | listening audio and radio questions |
| EXAM-04 | EXAM-03, EXAM-C1 | auto scoring, answer review, score summary |
| EXAM-05 | EXAM-01, EXAM-04 | reading split screen and dropdown blanks |
| EXAM-06 | EXAM-05 | paragraph matching, remaining reading parts |
| EXAM-07 | EXAM-01, EXAM-C2, usage decision | writing exam layout |
| EXAM-08 | EXAM-01, EXAM-C2, usage decision | speaking exam layout |
| EXAM-09 | all | full mock test flow and result record |

Recommended next ticket: **EXAM-01**, with **EXAM-C1** and **EXAM-C2**
started in parallel as content work.

---

## Applies to every ticket in this sequence

- No official screenshot, logo, or wordmark enters the product.
- No claim that this is the official CELPIP test. Approved wording is
  practice test engine, CELPIP-style practice, Toronto Academy practice
  test, and practice estimates are not official CELPIP scores.
- Estimated levels always carry `PRACTICE_ESTIMATE_DISCLAIMER`.
- The do not change list in
  `docs/product/exam-engine-reference-audit.md` section 8 applies
  throughout.
- Normal hyphens only, no long hyphens or em dashes, in code, comments,
  docs, and learner facing copy.
