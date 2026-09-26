# Writing mock test AI review and practice estimate (EXAM-26)

The Mock Test 1 Writing section now ends with an optional AI review: a
server side model call against the four CELPIP Writing criteria, a
per task result card, and an overall estimated Writing level for
practice.

This continues EXAM-25, which built the two task run and stopped at a
completion screen reporting word counts.

Nothing is saved. There is no database write, no migration, no attempt
row and no usage event. A review lives in React state on the result
screen and nowhere else.

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route updated

| Item | Value |
| --- | --- |
| Route | `src/app/dashboard/mock-tests/mock-test-1/writing/page.tsx` |
| URL | `/dashboard/mock-tests/mock-test-1/writing` (unchanged) |
| Auth | Under `/dashboard`, so the layout guard covers it. The page calls `supabase.auth.getUser` again, and the server action checks the session a third time. |
| Indexing | `robots: { index: false, follow: false }` (unchanged) |
| Exam mode | Still listed in `src/features/navigation/exam-mode-routes.ts`. No sidebar, no header, no breadcrumb trail, no footer. |
| Server action | `actions.ts` beside the page. **New in this ticket.** EXAM-25 deliberately had none. |

The route change is one prop: the page now passes
`evaluateWritingMockTest` to `WritingSectionPrototype` as
`evaluateResponses`. The section content still crosses to the client
whole, because a Writing task has no answer key to keep back.

The Listening and Reading section routes and the ten part level routes
are untouched.

### Files created

| File | What it holds |
| --- | --- |
| `src/app/dashboard/mock-tests/mock-test-1/writing/actions.ts` | The server action. Session check, fixed content, one call through to the pipeline. |
| `src/features/exam-engine/writing-mock-evaluation-types.ts` | Types only, no runtime values, so the result screen can import them without pulling Zod or OpenAI into the browser bundle. |
| `src/features/exam-engine/writing-mock-evaluation-schema.ts` | The Zod schema, the one runtime list of the four criteria, and the two helpers that order the criteria and join a model result to the server's own word count. |
| `src/features/exam-engine/writing-mock-evaluation-prompt.ts` | System prompt, user prompt, and the two task specific checklists. No network and no secrets, so the wording is reviewable on its own. |
| `src/features/exam-engine/evaluate-writing-mock-test.ts` | The pipeline. **Server only.** Reads the environment and constructs the OpenAI client. |
| `src/components/exam/writing/WritingAiReviewButton.tsx` | Submit for AI Review, with the hint that says what leaves the page. |
| `src/components/exam/writing/WritingEvaluationProcessingScreen.tsx` | Shown while a review is in flight. |
| `src/components/exam/writing/WritingEvaluationErrorScreen.tsx` | Shown when a review could not be completed. |
| `src/components/exam/writing/WritingSectionResultScreen.tsx` | The result screen. |
| `src/components/exam/writing/WritingTaskResultCard.tsx` | One reviewed task. |
| `src/components/exam/writing/WritingCriterionScoreTable.tsx` | The four criterion levels for one task. |
| `src/components/exam/writing/WritingTopMistakesCard.tsx` | The corrections, as pairs. |
| `src/components/exam/writing/WritingRewriteCard.tsx` | Used twice: the next-level rewrite and the Level 11-12 model response. |
| `src/components/exam/writing/WritingPracticeDisclaimer.tsx` | The practice-only sentence, in one place. |

### Files changed

| File | Change |
| --- | --- |
| `src/app/dashboard/mock-tests/mock-test-1/writing/page.tsx` | Passes the server action. Header note rewritten. |
| `src/components/exam/writing/WritingSectionPrototype.tsx` | Holds the review state machine and draws the three review screens in place of the completion screen. |
| `src/components/exam/writing/WritingSectionCompleteScreen.tsx` | The "review is the next build" sentence is gone. The review block is there instead. |
| `src/features/exam-engine/writing-mock-copy.ts` | The review wording, and four honesty edits to wording EXAM-26 made untrue. See section 8. |
| `src/features/exam-engine/exam-theme.ts` | One new recipe block, `examWritingReview`. **Append only: 115 lines added, 0 changed, 0 removed.** No Listening or Reading recipe is touched. |

No dependencies were installed. `openai` and `zod` were already in
`package.json` for the standalone flows.

---

## 2. AI server action created

```
evaluateWritingMockTest({ task1Response, task2Response })
  -> { ok: true, evaluation }
  |  { ok: false, code, message }
```

**Input is two strings and nothing else.** No task ids, no prompts, no
word counts and no chosen option. The server reads
`mockTest1WritingSection` itself, so nothing a caller sends can change
which prompt a response is judged against, claim a word count it does not
have, or rename a task on a result card.

**What crosses in each direction:**

| Direction | What crosses |
| --- | --- |
| Client to server | Two response strings |
| Server to client | An estimated level, per task feedback, criterion levels, corrections, two rewrites, and a fixed practice disclaimer |

**Three checks before any model work happens:**

1. The session. The route is behind the dashboard layout guard, but a
   page level check does not extend to a server action defined for it,
   and an action is reachable by direct POST. Without this check an
   unauthenticated request could spend an OpenAI call.
2. Both responses blank. No key is read and no call is made. See
   section 6.
3. `OPENAI_API_KEY`. Missing means `not-configured`, logged by variable
   name only.

**The chosen option is deliberately not sent.** The Task 2 checklist asks
whether the response contains a clear statement of opinion or choice, so
the choice has to be visible in the writing itself. Handing the model the
radio button the learner clicked would let a response that never states
its position be marked as though it had.

**The standalone Writing Practice evaluator is untouched.**
`src/features/writing/generate-writing-feedback.ts`,
`writing-scoring-prompt.ts` and `writing-scoring-schema.ts` are neither
imported nor modified by anything in this ticket. That is a departure
from the EXAM-25 continuation note, which suggested reusing the prompt
and the schema, and the reason is worth stating: the standalone evaluator
scores **one** task against **five** categories of its own and returns
**numeric** scores that are **saved to `attempt_scores`**. This one
reviews a **whole two task section** against the **four CELPIP Writing
criteria**, returns levels as **text**, and **saves nothing**. Reusing
the standalone prompt would have meant changing it, and changing it would
have changed every standalone result already produced. The one thing
that is shared is `countWords`, through `countWritingWords`, so the mock
test editor and the standalone editor can never disagree about what a
word is.

---

## 3. Evaluation criteria used

Every task is judged against exactly these four, in this order:

1. **Content/Coherence**
2. **Vocabulary**
3. **Readability**
4. **Task Fulfillment**

**The third criterion is Readability, not Listenability.** Listenability
belongs to Speaking, where a listener has to follow a response in real
time. Writing is read, so the equivalent criterion is how easily the
writing can be read: sentence control, punctuation, spelling and
paragraphing. The criterion names are a closed enum in
`writing-mock-evaluation-types.ts` and are validated as an enum by the
schema, so a reply naming Listenability fails validation rather than
reaching a screen. This is verified: a stubbed model reply naming
Listenability returns `evaluation-failed`.

The four names exist once at runtime, as `WRITING_MOCK_CRITERIA` in
`writing-mock-evaluation-schema.ts`. The prompt names them from there and
the schema validates against them from there, so the model can never be
asked for one set and checked against another.

### Conservative scoring rules

Stated in the system prompt, because a model that is not told to be
conservative will not be:

- if a response sits between two levels, assign the **lower** level
- do not inflate
- do not simply average the four criteria; the overall estimate is a
  judgement, not arithmetic
- **weigh Task Fulfillment heavily**; good vocabulary cannot rescue a
  response that did not do what the prompt asked
- let a serious weakness pull the overall estimate down even when the
  other criteria are stronger
- a response well outside 150-200 words is a Task Fulfillment problem
- the section overall is one conservative reading across both tasks, not
  an average of them
- an unanswered task is a serious Task Fulfillment failure for the
  section and pulls the overall estimate down sharply

Levels are reported as text, in the form `Level N` or `Level N-N`, on the
CELPIP scale of 1 to 12. Text rather than a number because a blank
response has no level at all, and a numeric field would have to be filled
with a `0` or a `1` that reads as a score the learner earned. A string
can say `Insufficient response` and mean it.

---

## 4. Task-specific checklist behavior

Which checklist a task gets is derived from the content, not from the
task number: a task that offers positions to choose between is a survey
response, and a task that does not is an email. So the checklist follows
the task rather than its position in the section.

The checklist is printed into the user prompt under the task it belongs
to, with the instruction to check every item and let the answers drive
the levels assigned.

### Task 1 - Writing an Email

- organized in appropriate paragraphs
- effective, detailed arguments
- ideas ordered logically
- greeting, opener, closer and sign-off suitable to the task
- few grammar and spelling errors
- transitions and conjunctions improve the flow
- addresses every point the prompt asks for
- tone suitable for the audience
- vocabulary suitable for the task
- 150-200 words

### Task 2 - Responding to Survey Questions

- clear statement of opinion or choice
- reasons that expand on the opinion rather than repeat it
- concrete examples
- advantages of the chosen option explained
- suitable vocabulary
- few grammar and spelling errors
- suitable tone
- appropriate paragraphs
- transitions and conjunctions improve the flow
- 150-200 words

The prompt text each checklist is applied to comes from
`src/features/exam-engine/mock-tests/mock-test-1/writing-section.ts`,
which is where EXAM-25 transcribed the two image-only prompts. Task 2
prints no bullet list in the source, so its `promptRequirements` is empty
and the prompt omits the "Points the prompt requires" block rather than
inventing one.

---

## 5. JSON schema behavior

The model is asked for JSON and JSON is not a promise, so everything that
comes back is parsed through
`src/features/exam-engine/writing-mock-evaluation-schema.ts` before any
of it reaches a screen.

```
{
  "overallEstimatedLevel": "Level 7",
  "overallJustification": "string",
  "practiceDisclaimer": "string",
  "taskResults": [
    {
      "taskId": "mock-test-1-writing-task-1",
      "taskTitle": "string",
      "withinWordRange": true,
      "estimatedLevel": "Level 7",
      "oneSentenceJustification": "string",
      "criteria": [ { "criterion": "...", "level": "...", "evidence": "...", "missingForNextLevel": "..." } ],
      "criticalFeedback": { "succeeded": "string", "fellShort": "string" },
      "topMistakes": [ { "original": "...", "correction": "...", "criterion": "..." } ],
      "nextLevelRewrite": { "targetLevel": "...", "response": "...", "changeSummary": [ ... ] },
      "levelElevenTwelveModel": { "response": "string" },
      "missingPromptPoints": ["string"],
      "templateLanguageWarnings": ["string"]
    }
  ]
}
```

**Two fields on a finished result never come from the model**, so they
are not in the schema above and are not asked for:

- `wordCount`, counted server side by `countWritingWords`, so a model
  that miscounts cannot print a wrong number beside a learner's writing
- `insufficientResponse`, set server side for a task the server did not
  send to the model

`taskTitle` and `withinWordRange` **are** asked for and are then
overridden by the server, for the same reason: they are facts about the
content and the response, and the server already holds them.

### What the schema enforces

| Rule | Effect |
| --- | --- |
| `criterion` is an enum of the four names | A reply naming Listenability, Grammar, or any other criterion fails |
| `criteria` has exactly four entries | Every reviewed task draws a full table |
| Every prose field is trimmed, non-empty and length capped | One runaway field cannot make a card unreadable |
| `topMistakes` capped at 8, `changeSummary` at 6 | A correction list stays a list a learner reads |
| `taskResults` between 1 and 4 entries | A model cannot return a hundred cards |

### What the pipeline enforces on top

| Rule | Effect |
| --- | --- |
| Criteria are sorted into the fixed order | Every card prints its rows in the same order whatever order the model chose. Duplicates are de-duplicated by name; anything left over is appended rather than silently dropped |
| A `taskId` that was never sent is dropped | A model that invents a third task cannot add a card to the screen |
| A task that was sent but came back unreviewed fails the review | No card with a hole in it |
| `practiceDisclaimer` is replaced with fixed copy, always | See section 8 |

### Failure handling

Every failure path returns `{ ok: false, code, message }` rather than
throwing, because an error thrown inside a server action reaches the
client as an opaque digest and the error screen would have nothing to
say. The three codes are `unauthenticated`, `not-configured` and
`evaluation-failed`.

`evaluation-failed` covers a rejected call, an empty reply, a reply that
is not JSON, a reply that fails the schema, and a reply missing a task
that was sent. All five leave the learner in the same place with the same
two things to do, so they draw one error screen.

**No provider text ever reaches the client.** Failures are logged server
side; `message` is always our own wording. Verified with a stubbed
provider: neither a thrown provider error nor a non-JSON reply puts any
provider text into the returned message.

---

## 6. Empty response behavior

Nothing crashes and no level is invented.

| Case | Behavior |
| --- | --- |
| **Both tasks blank** | **No AI call at all.** `OPENAI_API_KEY` is not even read. A structured no-response result is built locally: overall level `Insufficient response`, a sentence saying nothing was submitted, and two insufficient task cards. |
| **One task blank** | The written task is sent to the model on its own. The blank task gets a locally built insufficient card beside the real review. The prompt names the blank task and instructs that an unanswered task is a serious Task Fulfillment failure that pulls the section overall down sharply. |
| **Both written** | Both go in one call. |

A blank task's card reports word count `0`, not within the word range, no
estimated level, an explanation that there was not enough writing to
evaluate, and every prompt point as unaddressed, which is a fact about
the task rather than a judgement of writing that does not exist.

A blank task carries `criteria: []`, `nextLevelRewrite: null` and
`levelElevenTwelveModel: null`. Four criterion rows all reading
"Insufficient response" would say nothing four times, and a rewrite of
nothing is nothing, so the card draws one insufficient-response block
instead of all three.

Whitespace counts as blank: `countWords` returns 0 for a string of
spaces and newlines, and the pipeline trims before counting.

**The submit button is never disabled for being empty.** A learner who
wrote nothing can still press it and gets the structured no-response
result. Greying the button out would leave them on a screen with a dead
control and no explanation. The hint under the button changes wording
when both responses are empty, so the outcome is not a surprise.

**Untrusted input.** A server action is reachable by direct POST, so both
strings are coerced to `string`, capped at 20,000 characters and trimmed
before anything else happens. A non-string field reads as blank rather
than throwing. Verified: `{ task1Response: 42, task2Response: null }`
returns the structured no-response result.

---

## 7. Result screen behavior

Reached from the completion screen by pressing Submit for AI Review. It
is not a sixth screen in `buildWritingSectionFlow`: the four review
states (idle, working, failed, ready) are drawn in the completion
screen's place, so the section is still "Screen 1 of 5" throughout. A
sixth flow screen would have renumbered every screen in the section for a
screen only some runs reach.

In order down the page:

1. **Overall estimated Writing level**, in the same bordered strip the
   Listening band card uses. No seal, no ribbon, no coloured band and
   nothing that could be mistaken for an official score report.
2. **The justification sentence**, directly under it, so the level never
   sits alone.
3. **The practice-only disclaimer**, directly under that. It is not at
   the foot of the screen, because it is what stops the reading above
   being taken for an official result and it has to be read with it.
4. **One task result card per task**, in the section's own task order.
5. **Return to dashboard** and **Restart Writing section**.
6. The notice saying nothing was saved.

### One task result card

1. Task name and estimated level, in the header strip
2. Word count, word target, and within or outside the target
3. One sentence saying why that level
4. What worked, and what held it back, side by side
5. Prompt points not addressed, when there are any
6. Template language to avoid, when there is any
7. The four criterion levels, with evidence and the next step
8. Top mistakes
9. The response rewritten one level up, with a change summary
10. A Level 11-12 model response

The order is the argument. The level is at the top because it is what a
learner opens the screen looking for; the two rewrites are last because
they are the longest blocks and nothing after them would be read.

Task cards are matched to the section content **by task id**, not by
position, so a review that came back in a different order still draws the
right word target beside the right task.

### Visual rules kept

Neutral exam background, no orange and no marketing surface, no dashboard
sidebar inside the exam route, no official CELPIP branding, square
cornered bordered cards built from the existing engine recipes, and
structured blocks rather than one AI paragraph. The criterion table
scrolls inside its own container on a narrow screen, so the page never
scrolls sideways.

### Corrections are pairs, not sentences

Each correction shows the learner's own words and the stronger version in
two labelled halves. The original is struck through and the correction is
not. Deliberately not red and green: this is feedback on writing produced
under time pressure, and a column of red is a discouraging thing to hand
someone.

### Rewrites keep their paragraphs

Both rewrite blocks render with `whitespace-pre-line`, so paragraph
breaks survive into the page. That is not only a readability choice:
paragraphing is marked by both checklists, so a rewrite demonstrating good
paragraphing has to be allowed to show it.

Everything from the model renders as **plain text**. Nothing is
interpreted as HTML or markdown anywhere on this screen.

### Processing and error screens

The processing screen is a full screen rather than a spinner on the
completion screen, so the completion screen's controls cannot be pressed
while a call is in flight. Restarting under a request that is about to
land is how a learner ends up reading a review of writing they have
already cleared. There is no progress bar: nothing knows how far through
the call is, and a bar that fills at a made up rate is a lie told slowly.

Back stays available on both, so a learner is never trapped. The
responses are held above these screens, so Back returns to Task 2 with
every word still in the editor and Try again re-sends exactly what was
sent before.

### Editing after a review clears it

A review is a judgement of two particular pieces of text, so the moment
either changes it is a judgement of writing that no longer exists.
Editing returns the completion screen to its unreviewed state with the
submit button live again, and bumps the request id so a reply still in
flight is dropped rather than landing on the edited text.

---

## 8. Practice-only disclaimer

The sentence, defined once in `writing-mock-copy.ts` as
`reviewPracticeDisclaimer`:

> This is a Toronto Academy practice estimate produced by AI-supported
> feedback. It is not an official CELPIP score and it does not predict an
> official result.

**The disclaimer is ours, always, and never the model's.** The model is
asked for one, because asking keeps the framing in front of it while it
writes the rest, and the server then throws that sentence away and
substitutes this one. So the sentence a learner reads cannot drift from
one review to the next.

It is rendered by `WritingPracticeDisclaimer` in two places: on the
result screen directly under the estimated level, and on the processing
screen, so the framing arrives before the level does rather than after
it.

### Wording used

`Toronto Academy practice estimate`, `estimated Writing level`,
`AI-supported feedback`, `not an official CELPIP score`.

### Wording never used

`official CELPIP score`, `official result`, `guaranteed score`,
`pass guarantee`, except inside the sentences that deny them.

### Four honesty edits EXAM-26 had to make

EXAM-25 wording that adding a review made untrue:

| Copy key | Was | Now |
| --- | --- | --- |
| `introLines` item 4 | "No review yet ... There is no AI review, no score and no estimated band in this version." | "AI review at the end ... you can send your writing for AI review." |
| `introNotice` | "the AI review is added in the next build" | "The review is AI-supported and gives a practice estimate, not an official CELPIP score." |
| `editorHint` | "not saved, not checked and **not sent anywhere**" | "held on this screen only and is not saved. At the end of the section you can choose to send it for AI review." |
| `completePendingReview` | "The AI review and the estimated Writing band are added in the next build." | Removed. The control is real now. |

`editorHint` is the one that mattered most. It sat beside the field and
promised the writing was never sent anywhere, which stopped being true
the moment a Submit for AI Review button existed.

---

## 9. Security notes

| Item | Where it is |
| --- | --- |
| `OPENAI_API_KEY` | Read only in `evaluate-writing-mock-test.ts`, which runs on the server. Never in a client component, never in a prop, never in a returned value, never logged. |
| `OPENAI_WRITING_MODEL` | Same. The model name is never returned to the client and never appears in an error message. |
| The prompts | Built on the server. Neither the system prompt nor the user prompt crosses to the browser. |
| The OpenAI client | Constructed in `evaluate-writing-mock-test.ts` only. Nothing in `src/components/` imports it, directly or transitively. |

- **No `.env.local` is read or logged by this ticket.** The only
  environment access is `process.env.OPENAI_API_KEY` and
  `process.env.OPENAI_WRITING_MODEL` in the pipeline. A missing key is
  logged **by variable name**; no value is ever read into a message.
- **No provider text reaches the client.** Provider errors are logged
  server side and the client gets one of three codes plus our own
  wording.
- **The session is checked in the action.** A page level check does not
  extend to a server action, and an action is reachable by direct POST.
  Without this an unauthenticated request could spend an OpenAI call.
- **Untrusted input is treated as untrusted.** Both response strings are
  coerced, capped at 20,000 characters and trimmed.
- **Prompt injection guard.** The learner's response is fenced between
  `<<<RESPONSE_BEGIN>>>` and `<<<RESPONSE_END>>>` markers, and the prompt
  states that everything between them is content to review and never an
  instruction to follow. This is a mitigation, not a proof: it is the
  cheapest available guard on a free text field handed straight to a
  model, and the blast radius is a wrong practice estimate on a screen
  that saves nothing.
- **No service role client.** `getSupabaseAdmin` is not imported. The
  only Supabase call in this ticket reads the caller's own session.
- **No database write and no migration.** Nothing is inserted, updated or
  deleted, in any table.
- **Model output is rendered as text.** No `dangerouslySetInnerHTML`, no
  markdown renderer, nothing from the model interpreted as markup.

---

## 10. What is intentionally not built

- **No database save.** No attempt row, no `attempt_scores` row, no saved
  responses and no saved review.
- **No Supabase migration.** Nothing under `supabase/` is touched.
- **No persisted attempt history** for mock tests. A review is gone on
  reload. There is no mock test equivalent of
  `/dashboard/writing/attempts`.
- **No AI usage event.** The standalone flow records one per paid call
  through `recordAiUsageEvent`; that is a database write, so this ticket
  does not. It is the first thing to add if mock test reviews are ever
  metered.
- **No usage limit and no scored attempt charge.** The standalone flow
  checks and consumes a scored attempt credit. This route does neither,
  so a mock test review does not spend a learner's credit and is not
  gated by one.
- **No marked-up inline rewrite.** The result screen shows the rewrite as
  a clean block plus a change summary, not the learner's response with
  inline insertions and deletions marked up. A real inline diff needs
  either a diff algorithm over two texts or markup from the model that
  would have to be parsed and rendered as HTML, and rendering model
  markup is exactly what section 9 rules out. See the future improvement
  note in section 11.
- **No `localStorage`.** Nothing is written to browser storage.
- **No Speaking mock test section.** No Speaking card on the dashboard.
- **No full all-skills mock test flow** and no all-skills summary. Three
  sections of four exist and nothing claims Mock Test 1 is complete.
- **No admin panel** and **no student analytics.**
- **No payment changes** and **no live classes.**
- **No strict per task timing.** The countdown still expires without
  submitting or advancing, exactly as EXAM-25 left it.
- **No change to Listening or Reading.** The only shared file touched is
  `exam-theme.ts`, and that change is append only.
- **No change to the standalone Writing or Speaking Practice AI flows.**
- **No official CELPIP branding** anywhere in the production UI.

### Dashboard status

Unchanged by this ticket except one card description.
`DashboardMockTestCard` still shows exactly three cards:

- Mock Test 1 - Listening Test
- Mock Test 1 - Reading Test
- Mock Test 1 - Writing Test

The Writing card keeps its internal preview badge. Its description
changed from "AI review will be added next" to "Writing section
prototype with Task 1 and Task 2 editors, AI review and an estimated
Writing level for practice", because the old sentence was a promise this
ticket kept. **No Speaking card was added**, and nothing on the dashboard
claims the all-skills Mock Test 1 is complete.

---

## 11. EXAM-27 continuation note

**Where the review currently stops.** It produces a result and then
forgets it. A learner who reloads has nothing, and there is no way to
compare two attempts at the same section.

**The obvious next ticket is persistence, and it is a product decision
before it is a code change.** Saving mock test reviews means a migration,
an attempt row, an ownership check on a result route, and a decision
about whether a mock test review costs a scored attempt credit the way a
standalone one does. None of that is a side effect of adding a review, so
none of it is here.

**Concrete follow-ups, in the order they are worth doing:**

1. **Marked-up inline rewrite.** Skipped here on purpose. The safe
   approach is a diff computed **on the server** over the learner's
   response and the returned rewrite, turned into a typed array of
   `{ kind: "same" | "removed" | "added", text }` runs and rendered as
   spans. It must not be model-authored HTML or markdown: section 9
   rules out rendering model markup. `WritingRewriteCard` is where it
   goes and its props already isolate the rewrite prose.
2. **AI usage event per call.** `recordAiUsageEvent` already exists.
   Adding it makes mock test review cost visible beside standalone cost.
   It is a database write, which is why it waited.
3. **Saved attempts and a result route**, with the migration and the
   ownership check that implies.
4. **Speaking mock test section**, and only then a full all-skills Mock
   Test 1 flow with a section summary. Speaking's third criterion is
   **Listenability**, not Readability. The criterion enum in
   `writing-mock-evaluation-types.ts` is Writing's and must not be
   widened to cover both; Speaking gets its own.
5. **Strict per task timing** with a forward only run, which is still
   open from EXAM-25 and is unrelated to the review.

**What to reuse when Speaking arrives.** The shape of this feature
transfers cleanly: a types file with no runtime values, a schema file
holding the one runtime list of criteria, a prompt file with no network
in it, a server only pipeline, and a thin server action that checks the
session and passes fixed content through. The four files are small on
purpose so the pattern is cheap to copy. What must **not** be shared is
the criterion enum, the checklists, or the prompt itself.
