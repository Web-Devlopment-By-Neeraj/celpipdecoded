# Writing mock test prototype (EXAM-25)

The Mock Test 1 Writing section as one client side run: the section
instructions, Task 1 with its email prompt and editor, a transition, Task
2 with its survey prompt and editor, and a completion screen reporting
what was typed.

Nothing is marked, nothing is saved and nothing is sent to an AI
reviewer. This is the screen experience only. EXAM-26 adds the review.

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route created

| Item | Value |
| --- | --- |
| Route | `src/app/dashboard/mock-tests/mock-test-1/writing/page.tsx` |
| URL | `/dashboard/mock-tests/mock-test-1/writing` |
| Auth | Under `/dashboard`, so the layout guard covers it. The page calls `supabase.auth.getUser` again and redirects to `/login` when there is no session, because a layout does not re-render on client navigation. |
| Indexing | `robots: { index: false, follow: false }` |
| Exam mode | Listed in `src/features/navigation/exam-mode-routes.ts`, so no sidebar, no header, no breadcrumb trail and no footer. `ExamModeViewport` locks the frame to one window. |
| Server action | None. There is no `actions.ts` beside this page, because there is nothing to mark and nothing to save. |

The Listening and Reading section routes and the ten part level routes
are untouched.

---

## 2. Source content used

The authority is
`mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`.

What that document holds as text for Writing:

- the section heading, `Writing Test Instructions`
- two instruction sentences, one of which gives the 27 minute Task 1
  figure and one of which gives the 53 minute section figure
- the two task names, `Writing Task 1: Writing an Email` and
  `Writing Task 2: Responding to Survey Questions`
- one Cloudinary PNG per task, and nothing else

The prompts themselves were image only. That is what
`mock-tests/mock-test-1/extracted-content-outline.md` records as "prompt
image only" and what `docs/product/mock-test-1-content-map.md` lists as an
open content gap: "Type out the two Writing prompts as text."

**This ticket closes that gap for Writing.** The situation text, the
prompt instructions, the Task 1 requirements and the Task 2 positions in
`src/features/exam-engine/mock-tests/mock-test-1/writing-section.ts` are
transcribed word for word from the two source images listed under
"Writing images" in `mock-tests/mock-test-1/extracted-links.md`:

| Task | Source image |
| --- | --- |
| Task 1 | `.../v1785339425/Writing_Test_1_-_Task_1_c7ci7n_zmasqv.png` |
| Task 2 | `.../v1785339462/Writing_Test_1_-_Task_2_chkqmx_ubu4fa.png` |

Nothing was paraphrased, reworded into house style, shortened or added.
The only change made to the characters is the house style rule: the
source images use curly apostrophes and the content file uses straight
ones.

Each task keeps its source image URL in `promptImage`, so the
transcription can be checked against the original. The image is
referenced, not re-hosted, exactly as the Reading Part 2 brochure is, and
no screen depends on it: every word in the picture is on the screen as
text. That matters twice over. An image only prompt is not readable by
assistive technology, and it cannot be sent to an AI reviewer, because
`src/features/writing/writing-scoring-prompt.ts` needs the task text as
text.

Also read, and used: `docs/product/celpip-exam-rules-research.md`
sections 4 and 12 for the 150 to 200 word target and the note that the
official writing space has a word count and a spell check;
`docs/product/mock-test-1-content-map.md` for the timing screenshot
table; `docs/product/admin-mock-test-builder-blueprint.md` for the timer
source rule.

Nothing was invented. No prompt, no requirement, no option and no image.

---

## 3. Tasks included

| Task | Title from source | Response |
| --- | --- | --- |
| Writing Task 1 | Writing an Email | One typed email, target 150 to 200 words |
| Writing Task 2 | Responding to Survey Questions | One position chosen from two, plus one typed response, target 150 to 200 words |

Both are in the one run. There are no individual task routes and no
individual task cards.

---

## 4. Prompt structure

One screen type serves both tasks, `WritingTaskScreen`, built on the
shared `ExamTwoColumnLayout`:

```
left column  : "Read the following information."
               optional bold heading (Task 2 prints the survey name)
               the situation paragraphs

right column : the prompt instruction sentence
               the requirement bullets, where the source prints them
               the positions to choose between, where the source has them
               the editor, its word count and its hint
```

The two tasks differ only in what their content object holds:

- Task 1 has three requirement bullets and no positions.
- Task 2 has no bullets, because the source prints none, and two
  positions, Option A and Option B.

Neither case is special cased in a component. An empty requirement list
renders nothing and an unset options list renders nothing.

The positions are a real radio group in a fieldset with a legend, so
arrow key selection and screen reader grouping both work, and the whole
row is the click target.

One deliberate difference from the official screens: they open the
writing space only after a position is chosen, which
`docs/product/celpip-exam-rules-research.md` section 12 records. This
prototype leaves the editor open throughout, because the ticket asks for
nothing to block and for empty responses to be allowed. Choosing a
position never clears what has been typed.

---

## 5. Timer behaviour

Both windows are source supported. Neither is a placeholder.

| Task | Window | Source | Basis |
| --- | --- | --- | --- |
| Task 1 | 27 minutes, 1620 s | `published` | Named in the source document's own Writing instructions: "if you do not finish Task 1 in 27 minutes, the screen will move to Task 2". The content map screenshot table reads the same figure. |
| Task 2 | 26 minutes, 1560 s | `derived` | The published 53 minute Writing Test allowance minus the published 27 minutes for Task 1. The screenshot table reads 26 as well. Marked derived rather than published because no source prints "26 minutes" in words. |

The two sum to the 53 minutes the source publishes for the Writing Test,
and that sum is what the section intro card shows as Writing time, read
off the content by `sumWritingSectionSeconds`. So the card and the two
countdowns cannot drift apart.

Thresholds: amber at 5 minutes remaining, red at 1 minute. Wider than the
60 and 20 seconds the Reading parts use, because a Reading part ends with
a click and a writing task ends with a sentence.

Behaviour, which is the prototype behaviour the ticket asks for:

- the countdown runs live, using the shared `ExamCountdownTimer` and the
  one deadline based clock in `useExamCountdown`
- warning and urgent states colour the reading amber and then red
- at zero the reading is replaced by "Time is up"
- **nothing auto-submits**, because no `onTimeExpire` handler is passed
- **nothing is erased.** Every word stays on the screen and the learner
  continues by hand
- the window belongs to the flow screen, so typing, choosing a position
  and every re-render that follows keep the same window

Not built yet, and left for a later ticket: strict Writing timing, a
forward only run, and a section wide clock. The countdown lives in the
browser and starts again on a reload, which is correct for a practice run
and is the same intentional gap `docs/product/exam-timer-foundation.md`
records.

---

## 6. Answer state strategy

Local React state in `WritingSectionPrototype`, and nothing else:

```
responses : { [taskId]: string }   the typed text
choices   : { [taskId]: string }   the chosen position, Task 2 only
```

- **Keyed by task id, not by screen position.** That is what makes a
  response survive navigation: the task screen is remounted by moving
  back and forward, the map is not touched at all, and the prototype
  holding it stays mounted for the whole section.
- **The two maps are separate.** A choice and an essay are different
  answers, and only Task 2 has both. Changing a position therefore cannot
  disturb a response, which matters on a mis-click.
- **Restart clears both** and returns to the first screen. Nothing was
  saved, so there is nothing else to clear.

No database, no Supabase call, no server action, no `localStorage`, no
`sessionStorage`, no cookie, no migration. A reload starts the section
again, and that is stated on the intro notice, under the editor and on
the completion screen so a learner is never surprised by it.

---

## 7. Editor behaviour

`WritingResponseEditor` is a plain controlled `textarea` with a label
above it and the count under it. No toolbar, no formatting controls, no
autosave indicator, no submit button, which matches the CELPIP writing
space described in the research doc: a plain field with a word count and a
spell check.

- multiline typing, with line breaks kept exactly as typed, so a Task 1
  email keeps its greeting, paragraphs and sign off
- large: `min-h-[16rem]`, rising to `min-h-[20rem]` from the small
  breakpoint, and vertically resizable by the learner
- `spellCheck` is on, because the browser provides it and the official
  space has one
- `autoComplete` off, because a response is prose and not a form field
- readable on desktop and usable on mobile: the split stacks to one
  column below the large breakpoint and the field keeps its height
- the situation column scrolls on its own; the response column does not,
  so the editor is never a scrollbar inside a scrollbar
- empty responses are allowed everywhere. Nothing gates Next
- no autosave, no submission, no AI call, no score

---

## 8. Word count behaviour

`countWritingWords` in `writing-mock-flow.ts` delegates to `countWords`
in `src/features/writing/word-count.ts`, which is the one word count in
the app. It is reused rather than rewritten so the mock test editor and
the standalone Writing Practice editor can never disagree about what a
word is. `word-count.ts` is a pure module and was read, not edited.

- counts words from the typed response, trimming first and splitting on
  runs of whitespace
- updates live, on every keystroke, because the count is computed during
  render from the controlled value
- shows `0 words` when empty
- whitespace only input counts 0 and cannot crash: the trimmed empty
  string returns early
- singular is handled, so a one word response reads `1 word`
- the target beside it, `150-200 words`, comes from the task content and
  is guidance from the prompt's own "about 150-200 words"

The count never blocks, never warns and never changes colour. Colouring a
short response red would turn the source's guidance into a rule it does
not set. `isWithinWritingWordTarget` exists in the flow module for a
later screen to use and is read by nothing that gates anything.

The count appears in three places, all from the same function: under the
editor, on the transition screen for Task 1, and on the completion screen
for both tasks.

---

## 9. Dashboard link status

`src/components/dashboard/DashboardMockTestCard.tsx` now shows three
cards under Mock tests, one per section that can be sat end to end:

| Card | Badge | Route |
| --- | --- | --- |
| Mock Test 1 - Listening Test | Available | `/dashboard/mock-tests/mock-test-1/listening` |
| Mock Test 1 - Reading Test | Internal preview | `/dashboard/mock-tests/mock-test-1/reading` |
| Mock Test 1 - Writing Test | Internal preview | `/dashboard/mock-tests/mock-test-1/writing` |

The Writing card:

- Title: `Mock Test 1 - Writing Test`
- Badge: `Internal preview`
- Description: "Writing section prototype with Task 1 and Task 2 editors.
  AI review will be added next."
- Facts line: Writing / Tasks 1-2 / 150-200 words, the last read off the
  content
- Button: `Open Writing Test`

The Listening and Reading cards are unchanged. The grid gained a third
column at the large breakpoint so three cards read as one row rather than
as two plus an afterthought.

No individual Writing task cards, for the same reason there are no
Reading part cards: the tasks are screens inside one run.

Nothing on the dashboard claims that a full all-skills Mock Test 1
exists. Three sections of four are built, and one of the three produces
no result yet.

---

## 10. What is intentionally not built

- **No AI review.** Nothing calls OpenAI, and no evaluator is imported
  anywhere in this flow.
- **No Writing score.**
- **No estimated Writing band.**
- **No task level feedback and no result screen.**
- **No database save.** No attempt row, no Supabase write, no server
  action beside the route.
- **No migration.**
- **No persisted attempt history.** A reload starts the section again.
- **No `localStorage`, `sessionStorage` or cookie use.**
- **No admin panel.**
- **No Speaking mock test section.**
- **No full all-skills mock test flow.**
- **No strict Writing timing.** Back works throughout, nothing
  auto-submits and nothing advances on expiry.
- **No writing space gate on Task 2.** The editor is open before a
  position is chosen. See section 4.
- **No Writing instructional video screen.** No Writing clip is
  registered in `instructional-video-assets.ts` and one was not invented.
- **No official CELPIP branding**, and no wording claiming an official
  test, an official score, or a guaranteed result.

Untouched by this ticket: the Listening routes, the Reading routes, the
standalone Writing Practice AI flow under `/dashboard/writing`, the
standalone Speaking Practice AI flow, auth, and every scoring module.

---

## 11. EXAM-26 continuation note

The flow was built so the review can be added without rearranging it.

**Where the screen goes.** `buildWritingSectionFlow` in
`src/features/exam-engine/writing-mock-flow.ts` builds the five screen
order from the content. Add a `section-result` kind to
`WritingSectionScreen` in `writing-mock-types.ts` and push it after
`section-complete`, or replace `section-complete` with it. The prototype
switches on the screen kind, so a new kind is a compile error everywhere
it matters.

**Where the request goes.** Add `actions.ts` beside
`src/app/dashboard/mock-tests/mock-test-1/writing/page.tsx`, the way the
Listening and Reading section routes have one, and pass it into
`WritingSectionPrototype` as a prop rather than importing it there. The
Reading section prototype's `markAnswers` prop is the pattern to copy,
including its request id guard against an older reply landing after a
newer one, and its idle / working / ready / failed state.

**What to send.** Everything the reviewer needs is already in local
state and in the content object:

- `responses[taskId]`, the typed text
- `choices[taskId]`, the chosen position id, which resolves to
  `Option A` or `Option B` through `task.options`
- `task.promptInstruction`, `task.promptRequirements`,
  `task.situationParagraphs` and `task.wordTarget`, which is the task
  text `src/features/writing/writing-scoring-prompt.ts` expects and the
  reason this ticket transcribed the prompts

**What to reuse.** `src/features/writing/writing-scoring-prompt.ts`,
`writing-scoring-schema.ts` and `evaluate-writing-attempt.ts` already
exist for the standalone flow. Reuse the prompt and the schema. Do not
reuse the attempt persistence path unless EXAM-26 decides mock test
attempts should be saved, which is a product decision and a migration,
not a side effect of adding a review.

**Wording rules that carry over.** Anything shown must be named a
Toronto Academy practice estimate, never a CELPIP score, and no wording
may suggest a rater produced it. See
`docs/product/celpip-exam-rules-research.md` section 15, and the estimate
wording the Reading section score screen already uses.

**Copy to add.** `writing-mock-copy.ts` is where the new wording goes.
`completePendingReview` is the sentence that comes out when the review
goes in.

**Still open after EXAM-26**, and not its job: strict per task timing
with a forward only run, saved attempt history for mock tests, the
Speaking mock test section, and the full all-skills mock test flow.
