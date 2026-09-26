# Speaking mock test transcription, AI review and practice estimate (EXAM-28)

The Mock Test 1 Speaking section now ends with an optional AI review:
the recordings are sent to the server, transcribed, and reviewed against
the four CELPIP Speaking criteria, producing a per task result card and
an overall estimated Speaking level for practice.

This continues EXAM-27, which built the eight task run and stopped at a
completion screen reporting which tasks had a recording.

Nothing is saved. There is no database write, no migration, no attempt
row, no usage event and no audio storage. A recording crosses to the
server once, for the length of one review request, and is released when
that request ends. A review lives in React state on the result screen
and nowhere else.

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route updated

| Item | Value |
| --- | --- |
| Route | `src/app/dashboard/mock-tests/mock-test-1/speaking/page.tsx` |
| URL | `/dashboard/mock-tests/mock-test-1/speaking` (unchanged) |
| Auth | Under `/dashboard`, so the layout guard covers it. The page calls `supabase.auth.getUser` again, and the API route checks the session a third time. |
| Indexing | `robots: { index: false, follow: false }` (unchanged) |
| Exam mode | Still listed in `src/features/navigation/exam-mode-routes.ts`. No sidebar, no header, no breadcrumb trail, no footer. |
| Server side | An API route, **not** an `actions.ts`. See section 4. |

The page itself barely changed. It still renders
`SpeakingSectionPrototype` with the whole section content, because a
Speaking task has no answer key to keep back. What changed is the header
note and the metadata description, both of which said the review was a
later build.

The review call is made from the client component rather than passed
down from the page as a prop, which is the one structural difference
from the Writing route. A server action can be handed to a client
component; a `fetch` cannot be, so the section prototype imports the
submit helper directly.

The Listening, Reading and Writing routes are untouched.

### Files created

| File | What it holds |
| --- | --- |
| `src/app/api/mock-tests/mock-test-1/speaking/evaluate/route.ts` | The API route. Session check, FormData parsing, size and container guards, fixed content, one call through to the pipeline. |
| `src/features/exam-engine/speaking-mock-evaluation-types.ts` | Types only, no runtime values, so the result screen can import them without pulling Zod or OpenAI into the browser bundle. |
| `src/features/exam-engine/speaking-mock-evaluation-schema.ts` | The Zod schemas, the one runtime list of the four criteria, and the helpers that order the criteria and join a model result to the server's own facts. |
| `src/features/exam-engine/speaking-mock-evaluation-prompt.ts` | System prompt, user prompt, and the eight task specific checklists. No network and no secrets, so the wording is reviewable on its own. |
| `src/features/exam-engine/transcribe-speaking-mock-audio.ts` | One recording in, one outcome out. **Server only.** Also holds the container allowlist, the size caps and the provider error classifier. |
| `src/features/exam-engine/evaluate-speaking-mock-test.ts` | The pipeline. **Server only.** Reads the environment and constructs the OpenAI client. |
| `src/features/exam-engine/submit-speaking-mock-review.ts` | Browser helper. Builds the FormData and posts it. Holds no secret and knows no model name. |
| `src/components/exam/speaking/SpeakingAiReviewButton.tsx` | Submit for AI Review, with the hint that says what leaves the page. |
| `src/components/exam/speaking/SpeakingEvaluationProcessingScreen.tsx` | Shown while a review is in flight. |
| `src/components/exam/speaking/SpeakingEvaluationErrorScreen.tsx` | Shown when a review could not be completed. |
| `src/components/exam/speaking/SpeakingSectionResultScreen.tsx` | The result screen. |
| `src/components/exam/speaking/SpeakingTaskResultCard.tsx` | One reviewed task, and the three unreviewable outcomes. |
| `src/components/exam/speaking/SpeakingCriterionScoreTable.tsx` | The four criterion levels for one task. |
| `src/components/exam/speaking/SpeakingTranscriptCard.tsx` | The transcript. The block with no Writing counterpart. |
| `src/components/exam/speaking/SpeakingTopMistakesCard.tsx` | The corrections, as pairs. |
| `src/components/exam/speaking/SpeakingRewriteCard.tsx` | Used twice: the next-level rewrite and the Level 11-12 model answer. |
| `src/components/exam/speaking/SpeakingPracticeDisclaimer.tsx` | The practice-only sentence and the audio assessment note, in one place. |

### Files changed

| File | Change |
| --- | --- |
| `src/app/dashboard/mock-tests/mock-test-1/speaking/page.tsx` | Header note and metadata description rewritten. No behaviour change. |
| `src/components/exam/speaking/SpeakingSectionPrototype.tsx` | Holds the review state machine and draws the three review screens in place of the completion screen. |
| `src/components/exam/speaking/SpeakingSectionCompleteScreen.tsx` | The "review is the next build" sentence is gone. The review block and the missing count are there instead. |
| `src/features/exam-engine/speaking-mock-copy.ts` | The review wording, and five honesty edits to wording EXAM-28 made untrue. See section 11. |
| `src/features/exam-engine/exam-theme.ts` | One new recipe block, `examSpeakingReview`. **Append only.** No Listening, Reading, Writing or existing Speaking recipe is touched. |

`speaking-mock-types.ts`, `speaking-mock-flow.ts`, `speaking-mock-timing.ts`
and `mock-tests/mock-test-1/speaking-section.ts` are **unchanged**. The
content, the timings and the flow already carried everything this ticket
needed.

No dependencies were installed. `openai` and `zod` were already in
`package.json` for the standalone flows.

---

## 2. Audio submission approach

The client posts `multipart/form-data` to one endpoint.

```
POST /api/mock-tests/mock-test-1/speaking/evaluate

metadata               one JSON string
audio-speaking-task-1  the recording for Task 1, if there is one
audio-speaking-task-2  the recording for Task 2, if there is one
...
audio-speaking-task-8
```

The metadata part:

```json
{
  "tasks": [
    {
      "taskId": "mock-test-1-speaking-task-1",
      "taskNumber": 1,
      "durationSeconds": 72,
      "hasRecording": true,
      "mimeType": "audio/webm"
    }
  ]
}
```

**A task with no recording contributes a metadata entry and no audio
part.** That is deliberate: the server can then tell "the learner skipped
this task" from "the browser failed to attach the file", and an entry
with no part says the first.

**The audio field names are positional, not keyed on task ids.** The
ticket specifies `audio-speaking-task-1` through `audio-speaking-task-8`,
and the wire format stays readable and stays stable if a content task id
is ever renamed. The server joins a part to a task by that number, using
its own content.

### The server does not trust the client

Everything in the metadata is a claim. What the server does with each
field:

| Field | What the server does with it |
| --- | --- |
| `taskNumber` | Used to find the matching audio part. The task itself comes from `mockTest1SpeakingSection`. |
| `taskId` | Compared against the server's own task id. On a mismatch the duration is dropped and the recording is still reviewed. Never used to look anything up. |
| `durationSeconds` | The only field actually used, because only the browser can measure how long its own recording ran. Coerced, clamped to 0 on anything non-finite or negative, capped at 3600. |
| `hasRecording` | A hint. Confirmed or contradicted by whether an audio part actually arrived. |
| `mimeType` | Accepted into the schema and ignored. The container is read from the part itself. |

There is deliberately **no prompt, title, task type or time limit field
to send.** Those are read from `mockTest1SpeakingSection` on the server,
so nothing a caller sends can change which prompt an answer is judged
against or claim a recording window it does not have.

The duration cap is 3600 seconds rather than a task window, on purpose.
An answer that ran past its limit must reach the review as one, because
running over is exactly the Task Fulfillment problem the length check
exists to report.

### Size and container guards, at the door

| Guard | Limit | Behaviour |
| --- | --- | --- |
| One recording | 25 MB | `audio-too-large`, before any provider call |
| Whole submission | 40 MB | `audio-too-large`, before any provider call |
| Container | `audio/webm`, `audio/mp4`, `audio/mpeg`, `audio/mpga`, `audio/m4a`, `audio/x-m4a`, `audio/wav`, `audio/ogg`, `audio/flac` | `unsupported-audio-type`, before any provider call |
| Empty part | size 0 | Treated as no recording, not as an error |

25 MB is the transcription API's own per file limit. A 90 second opus
recording is well under a megabyte, so both caps are far above any
honest submission from this section and exist to stop a hand made
request rather than a talkative learner.

The container check runs twice, in the route and again inside the
transcription helper, and the two do different jobs. The route refuses a
whole submission recorded in a format nothing can read, so a learner
whose browser records in an unreadable container is told that once
rather than shown eight failed tasks. The helper is the per task guard
for a mixed submission.

---

## 3. Transcription behavior

One transcription call per recorded task, run together rather than one
after another. Eight sequential round trips would make a learner wait
through eight waits for work that has no order to it, and one task's
failure is contained in its own outcome, so a slow or broken task delays
the others and takes none of them down.

| Item | Value |
| --- | --- |
| Model | `OPENAI_TRANSCRIPTION_MODEL`, falling back to `gpt-4o-mini-transcribe` |
| Fallback | The same default the standalone Speaking Practice transcription uses, which is the fallback pattern the ticket asks for |
| Language | `en` |
| Response format | `json` |
| Key | `OPENAI_API_KEY`, read once by the pipeline and passed as a constructed client |

### Fillers are kept on purpose

A transcription model will tidy speech if it is not told otherwise: it
drops the "um", joins the false start to the sentence that replaced it,
and hands back a fluent paragraph. That would be a transcript of a
better answer than the one that was given, and it would quietly delete
the evidence Listenability is judged on. So the transcription prompt asks
for the opposite:

> Transcribe exactly what the speaker said. Keep filler words such as um,
> uh and like. Keep repetitions, false starts and self-corrections. Do
> not correct grammar, do not tidy the wording and do not rewrite the
> answer.

**It is a bias, not a guarantee.** How much hesitation survives depends
on the model, which is exactly why the transcript card says it is a close
record rather than an exact one.

### The transcript on the screen is the transcription model's

The scoring model is shown each transcript and is **never asked to
return it**. A model asked to echo a transcript back tidies it on the way
through. So what a learner reads on the transcript card is what the
transcription model wrote, unedited, and the schema has no transcript
field at all.

### Four outcomes per recording

| Outcome | When | Result |
| --- | --- | --- |
| `transcribed` | Text came back, 20 characters or more | Sent to the scoring model |
| `insufficient` | Text came back under 20 characters | `insufficient_response` card, no scoring |
| `unsupported` | Oversized part, or a container this pipeline cannot read | `transcription_failed` card, no scoring |
| `failed` | The provider call threw | `transcription_failed` card, or the whole review stops if it was a credit failure |

20 characters is roughly four words. It is deliberately low: the job is
to catch silence and accidents, not to decide what counts as a short
answer. A genuinely brief answer of a few sentences **is** scored, and
being too short is reported by the length check on its card.

### What is logged

A task id, a byte count and a character count. Never audio, never a
transcript, never a key. A four character transcript is still something
somebody said, so even the too-short case logs only its length.

---

## 4. AI route created

```
POST /api/mock-tests/mock-test-1/speaking/evaluate
  -> 200 { ok: true, evaluation }
  |  4xx/5xx { ok: false, code, message }
```

### Why an API route and not a server action

The ticket prefers `actions.ts` and allows the route where an action
cannot safely carry multiple audio blobs. It cannot.

A Next.js server action posts its arguments through the framework's own
encoding with a body size limit that defaults to 1 MB. A Speaking
submission is up to eight audio recordings at once. A section recorded
at the full windows is comfortably past that limit, so an action would
**fail on a complete attempt and succeed on a partial one**, which is the
worst of the two behaviours. A route handler reads the body as a stream
through the platform `Request` API and is not bound by that limit.

The trade is that a route handler is a public URL rather than a framework
call, so it does its own work at the door: session check first, before
the body is read at all, then the FormData parse, then the size and
container guards, then the content join. Nothing reaches a provider until
all of those have passed.

The Writing review is still a server action, and that is right for it:
its whole input is two strings.

`runtime = "nodejs"`. The transcription step wraps a `File` through the
SDK's `toFile` helper and the pipeline constructs an SDK client, and the
standalone Speaking routes beside this one already pin Node for the same
reason.

### The pipeline, in order

1. Pair each task in `mockTest1SpeakingSection` with the audio part
   submitted for it, and clamp the duration the browser reported.
2. Nothing recorded anywhere? Return a structured no-response result.
   **No provider call at all.**
3. `OPENAI_API_KEY` missing? Return `not-configured`. The variable name
   is logged; its value never is.
4. Transcribe every task that has audio.
5. A credit failure anywhere? Stop and return `credits-exhausted`.
6. Nothing transcribed into reviewable speech? Return a structured
   result. **No scoring call.**
7. Send the reviewable tasks to the scoring model.
8. Validate with Zod, drop anything not asked for, join to the server's
   own timings and transcripts.
9. Fill in a locally built card for every task that produced no
   reviewable speech.

### Scoring call

| Item | Value |
| --- | --- |
| Model | `OPENAI_SCORING_MODEL`, falling back to `gpt-5.4-mini` |
| Fallback | The same variable and default the standalone Speaking scorer uses, so an environment configured for one is configured for the other |
| Response format | `json_object` |
| Calls | One, for the whole section, however many tasks were recorded |

### What the scoring prompt receives

Per task: the task id, the label, the title, the task type, the recording
window, the measured duration, the situation paragraphs, the prompt
instruction, the prompt paragraphs, the either-or alternatives where the
task has them, the picture descriptions from the section's own alt text,
the task specific checklist, and the transcript fenced between two
markers.

Per section: the section title, the total number of tasks, and every task
that produced nothing to review with the reason it produced nothing.

**No answer keys.** Speaking has none: it is judged against descriptors
rather than compared to a correct option.

**The picture descriptions matter.** On Tasks 3, 4 and 8 the picture is
the prompt, so without the alt text the model would be marking a
description of a scene it cannot see, which is not a judgement at all.

**The Task 6 alternatives are both sent.** The learner picks one in their
head and nothing records which, so the model is told that answering
either is correct rather than left to guess and mark the answer against
the wrong one.

**The transcript is fenced.** Everything between `<<<TRANSCRIPT_BEGIN>>>`
and `<<<TRANSCRIPT_END>>>` is declared to be content and never an
instruction. It is the cheapest guard available against prompt injection
from free text, and a transcript is free text handed straight to a model.

---

## 5. Evaluation criteria used

Every task is judged against exactly four criteria, in this order:

1. **Content/Coherence**
2. **Vocabulary**
3. **Listenability**
4. **Task Fulfillment**

**The third is Listenability, not Readability.** Readability belongs to
Writing, where a reader can slow down, re-read a clause and take the
punctuation as a guide. Listenability is whether a listener can follow
the response as it is spoken: pace, pausing, hesitation, false starts,
self-correction, repetition, and how much work the listener has to do.

This is enforced rather than stated. `SPEAKING_MOCK_CRITERIA` in
`speaking-mock-evaluation-schema.ts` is the one runtime list; the prompt
names the criteria from it and the Zod enum validates against it, so the
model can never be asked for one set and checked against another. A reply
containing "Readability" fails validation.

### Conservative scoring rules

Stated in the system prompt, because a model that is not told to be
conservative will not be:

- If a response sits between two levels, **assign the lower level.**
- **Do not inflate.** A response that would not convince an official
  rater must not be given a level that suggests it would.
- **Do not simply average the four criteria.** The overall estimate is a
  judgement, not arithmetic.
- **Weigh Task Fulfillment heavily.** A response that does not do what
  the prompt asked cannot be rescued by good vocabulary or fluent
  delivery.
- **Let a serious weakness pull the overall estimate down**, even when
  the other criteria are stronger.
- A response far short of its recording window, or one still mid sentence
  at the limit, is a **Task Fulfillment problem** and must be treated as
  one.
- The overall estimate is a single conservative reading across the whole
  section, not an average of the tasks. A weak or unanswered task pulls it
  down.

### Task specific checklists

One per CELPIP Speaking task type, derived from the task's position in
the section, because the position is what the official task type is
defined by:

| Task | Type | Checklist asks about |
| --- | --- | --- |
| 1 | Giving Advice | Clear advice, reasons, addressee and tone, ordering |
| 2 | Personal Experience | A specific experience, sequence, concrete detail, past tenses |
| 3 | Describing a Scene | What is actually in the picture, organisation, position language, present tenses |
| 4 | Making Predictions | Predictions not description, grounded in the picture, future forms, certainty |
| 5 | Comparing and Persuading | A stated choice, both options compared, persuasion, comparative language |
| 6 | Difficult Situation | Handled not described, tone, explanation and request |
| 7 | Expressing Opinions | Opinion stated early, reasons that expand it, support, consistency |
| 8 | Unusual Situation | The unusual detail identified, specific enough to act on, essential fact first |

Every list ends on the same two questions, about using the recording
window and about memorised language, because those apply to every
Speaking task and a checklist that omitted them on six tasks out of eight
would be marking the same thing inconsistently.

A section with more than eight tasks, or a prototype that reorders them,
falls back to a general checklist rather than being marked against the
wrong one.

---

## 6. Audio-first scoring behavior and limitation

**This is the most important section of this document.**

### What actually happens

The recording is used. It is sent to the server, transcribed by an audio
model, and the transcript is scored together with the task prompt, the
recording window and the measured duration. The pipeline is audio-first
in that nothing is scored that was not spoken, and the length judgement
is made against a real measurement rather than a word count.

### What the scoring model is given

The **transcript**, not the waveform. There is no direct audio
evaluation path in this project that could safely be reused: the
standalone Speaking Practice flow is also transcript-based, and it owns
an attempt row, a storage bucket, a credit check and a database write,
none of which belong in this ticket.

### What the review may and may not claim

The system prompt states the boundary explicitly:

**May judge, because a faithful transcript shows them:**

- hesitation, false starts, self-correction, repetition, filler words
- the amount of speech produced in the time
- whether the answer fits its recording window

**May not claim to judge:**

- pronunciation, accent, stress, rhythm, intonation

The prompt says so in those words, and adds that where delivery matters
to a point being made, the model must say it cannot be confirmed from the
transcript. A model that is not told this will write "your intonation was
flat" from a text file.

The prompt also tells the model that the transcript may contain
transcription errors, and that where a word looks like a transcription
artefact rather than a learner error it must not be counted as a mistake.

### The learner is told

The result screen carries a fixed **audio assessment note**, directly
under the estimated level and beside the practice disclaimer:

> Your recordings were transcribed, and the review was written from those
> transcripts together with each task prompt, its recording window and
> how long you actually spoke. Pronunciation, rhythm and intonation are
> estimated from the submitted audio and transcription pipeline and may
> require human review for full accuracy.

The model is asked for an audio assessment note as well, and the server
**replaces it** with the sentence above. Asking keeps the limitation in
front of the model while it writes the rest of the review, which is the
point: a model told to state what it cannot judge is less likely to claim
it elsewhere. What a learner reads is our wording, which cannot drift
from one review to the next.

### Not a human rater

The system prompt says the model is not a human rater and must not
describe itself as one, alongside the rule that it must never claim an
official CELPIP score, an official result, a guaranteed score or a pass
guarantee.

---

## 7. JSON schema behavior

The model is asked for JSON and JSON is not a promise. Everything that
comes back is parsed through
`src/features/exam-engine/speaking-mock-evaluation-schema.ts` before any
of it reaches a screen.

### Five fields never come from the scoring model

| Field | Where it comes from | Why |
| --- | --- | --- |
| `responseTimeLimitSeconds` | `task.responseTimer.seconds` | A model that misremembers a window cannot print a wrong limit beside a learner's answer |
| `recordedDurationSeconds` | Measured in the browser, clamped on the server | Only the browser can measure its own recording |
| `transcript` | The transcription model | A scoring model asked to echo a transcript tidies it |
| `transcriptConfidenceNote` | Fixed copy | A statement about how the product works, not a judgement |
| `recordingStatus` | The server | The model only ever sees recorded tasks, so it cannot know another was missing |

`toSpeakingMockTaskResult` joins a validated model result to those five.

### What the schema enforces

- exactly four criteria, from a **closed enum** with Listenability third
- levels as trimmed strings, 1 to 60 characters
- prose fields trimmed and capped, 600 characters short and 3000 long
- at most 8 top mistakes, at most 6 rewrite changes
- at most 10 missing prompt points and 10 template warnings
- both rewrite blocks required on a reviewed task
- at least one and at most twelve task results

The long text cap sits below the Writing one at 3000 characters, because
a spoken answer is shorter than a written one and a rewrite that runs to
4000 characters is not a rewrite of something sayable in the window.

### What the pipeline enforces on top

- criteria are **reordered** into the fixed screen order, so every task
  on every result screen prints its rows in the same order whatever order
  the model chose. A duplicated criterion keeps the first and appends the
  rest rather than throwing anything away
- a result whose `taskId` was **never sent is dropped**, so a model that
  invents a ninth task cannot add a card to the screen
- a task that **was sent and came back unreviewed fails the whole
  review**, rather than rendering a card with a hole in it
- the card title, the practice disclaimer and the audio assessment note
  are replaced with the server's own

### The submission metadata is validated too

`speakingMockSubmissionMetadataSchema` parses the metadata part. The
route is reachable by direct POST and everything in that object is a
claim, so a malformed part is one 400 with our own wording rather than an
unhandled rejection.

### Failure handling

`parseSpeakingMockEvaluationResponse` returns `null` rather than
throwing, so a malformed reply is treated exactly like a failed call: one
error screen with a retry on it, and no provider text anywhere near the
learner.

---

## 8. Missing recording behavior

**No missing recording crashes anything.** A task with no audio is normal
input, not an error, and the whole design hangs off that.

### Four recording statuses

| Status | Meaning | Level shown | Transcript card | Criteria, mistakes, rewrites |
| --- | --- | --- | --- | --- |
| `recorded` | Transcribed into reviewable speech | The model's estimate | Shown | Shown |
| `missing` | No audio arrived for this task | "No recording submitted" | Not shown | Replaced by a status block |
| `transcription_failed` | Audio arrived and could not be read | "Could not be reviewed" | Not shown | Replaced by a status block |
| `insufficient_response` | Transcribed into almost nothing | "Insufficient response" | **Shown** | Replaced by a status block |

The transcript **is** shown for an insufficient response, and that is
deliberate: a learner told their answer held almost no speech should be
able to see the handful of words that were picked up, because that is
what tells them whether the microphone failed or they stopped early.

### The three unreviewable statuses never share wording

A learner who skipped a task, a learner whose recording could not be
transcribed and a learner whose recording held almost no speech have not
done the same thing, and **the middle one did nothing wrong at all.** So
the transcription failure card says in words that it is a technical
failure and not a judgement of the answer.

### One missing task

Marked missing, given a card with no invented level, and the other seven
are still transcribed and reviewed. The overall estimate is told about
it: the user prompt names every unscored task with its reason, and says
that an unanswered Speaking task is a serious Task Fulfillment failure
for the section, while a task that failed to transcribe should be
reported as unreviewable rather than treated as a weak answer.

### All tasks missing

**No provider call is made at all.** Not a transcription call, not a
scoring call. There is no speech to transcribe and none to review, so
paying for either would buy nothing.

`buildNoResponseSpeakingEvaluation` returns eight missing cards, an
overall reading of "No recording submitted", and a sentence saying
nothing was submitted. No level is invented.

### Recordings arrived but none was reviewable

**No scoring call is made.** The transcription calls have already
happened and cannot be taken back, but a review of nothing would cost
money and say nothing. Cards are built for each task with the reason it
produced nothing, and the overall justification distinguishes "none could
be transcribed" from "there was too little speech".

### Levels are strings, always

Every level in this feature is a string rather than a number, so a task
with no recording can say "No recording submitted" and mean it. A numeric
scale would have to put a 1 there, and a 1 reads as a level a learner
earned rather than a statement that there was nothing to mark.

---

## 9. Error handling behavior

Every failure the ticket lists is handled. None of them exposes a stack,
a provider message, a model name or any part of the environment.

| Failure | Code | Status | What the learner sees |
| --- | --- | --- | --- |
| No session | `unauthenticated` | 401 | Sign in again in another tab, recordings still held |
| `OPENAI_API_KEY` missing | `not-configured` | 503 | Not configured on this environment, tell an administrator |
| `OPENAI_TRANSCRIPTION_MODEL` missing | n/a | n/a | **Falls back to the standalone default.** Not an error |
| `OPENAI_SCORING_MODEL` missing | n/a | n/a | **Falls back to the standalone default.** Not an error |
| FormData parse failure | `invalid-request` | 400 | The request could not be read, try again |
| Missing or malformed metadata | `invalid-request` | 400 | Same |
| One file over 25 MB | `audio-too-large` | 413 | Record shorter answers and try again |
| Submission over 40 MB | `audio-too-large` | 413 | Same |
| Unsupported container | `unsupported-audio-type` | 415 | Try an up to date browser and record again |
| Transcription request failure | per task | 200 | That task shows as unreviewable, the rest are reviewed |
| Every transcription failed | n/a | 200 | Structured result saying none could be transcribed |
| Scoring request failure | `evaluation-failed` | 502 | General failure, retry offered |
| JSON parse failure | `evaluation-failed` | 502 | Same |
| Zod validation failure | `evaluation-failed` | 502 | Same |
| Empty model reply | `evaluation-failed` | 502 | Same |
| A sent task missing from the reply | `evaluation-failed` | 502 | Same |
| **OpenAI 429 `credit_balance_exhausted`** | `credits-exhausted` | 402 | The required sentence, **no retry button** |
| Unknown error in the route | `evaluation-failed` | 502 | General failure, retry offered |

### Credit exhaustion

The required wording, exactly:

> AI review could not run because API credits are exhausted. Add API
> credits and try again. Your recordings are still held on this page.

It is recognised three ways, because the provider has reported it as all
three at different times: a 402, a 429 carrying a billing related code
(`credit_balance_exhausted`, `insufficient_quota`,
`billing_hard_limit_reached`, `billing_not_active`), or a 429 whose
message names the credit balance or the quota. Recognising it too eagerly
is the safer failure: the worst outcome is a learner told to add credits
when the real problem was a rate limit, and their recordings are still on
the page either way.

**A credit failure on any transcription stops the whole review.** It is
not a per task problem: the account is out of credit, so the scoring call
would fail the same way and every remaining transcription already has.
Showing eight "could not be transcribed" cards would tell a learner their
recordings were bad when the truth is that nobody topped up an account.

**The retry button is withheld for this code alone.** The next press
would fail the same way, and the wording already says what to do instead.
Every other failure, including a missing API key, is offered a retry: a
key can be added to a running environment between two presses and
offering it costs nothing.

### Nothing is lost by a failure

The recordings live in the section prototype's state, above every review
screen. Back returns to Task 8 with every take still playable, Try again
re-sends exactly what was sent before, and every failure sentence says
so, because the first thing a learner wants to know when a review fails
is whether they have to record it all again.

---

## 10. Result screen behavior

The last screen of the run, and the first one in this section that
carries a level.

```
Estimated Speaking level          bordered strip, level and justification
Practice estimate                 the disclaimer
How your audio was assessed       the audio assessment note
Task cards, one per task          eight of them, in section order
Return to dashboard / Restart
```

### One task result card

```
 1. task name and estimated level          header strip
 2. recording window, time spoken, status  meta row
 3. one sentence saying why that level
 4. time and length check
 5. the transcript of what was said        <- the Speaking-only block
 6. what worked, and what held it back
 7. prompt points not addressed            when there are any
 8. template language to avoid             when there is any
 9. the four criterion levels              table
10. top mistakes                           pairs
11. the answer, one level up               rewrite
12. Level 11-12 model answer               rewrite
```

**The transcript's position is the argument.** It sits above every
judgement below it, because those judgements all argue from it. A learner
who disagrees with a Listenability level should be able to look at the
words the level was drawn from without scrolling past the argument first.
A Writing learner already has their response on the screen they typed it
into; a Speaking learner has only a recording, so without this block the
criterion table cannot be checked at all.

**All eight cards are drawn**, including the tasks with nothing on them,
so a learner can see at a glance which three they skipped rather than
counting the cards that are present.

### Visual rules kept

- The overall estimate uses the same bordered strip the Listening band
  card uses. No seal, no ribbon, no coloured band, nothing that could be
  mistaken for an official score report.
- A missing recording is quiet navy, never red. A learner may have
  skipped a task, may have had no working microphone, or may have been
  reading the section rather than sitting it, and none of those is a
  failure a screen has any business colouring red.
- Corrections are pairs, not sentences: the learner's words struck
  through, the stronger version beside them. Deliberately not red and
  green.
- Both rewrites keep their line breaks, rendered as plain text. Nothing
  from the model is interpreted as HTML or markdown anywhere on the
  screen.
- Structured blocks throughout, never one giant AI paragraph.
- Neutral exam background, no dashboard chrome, no official CELPIP
  branding.

### Both rewrites are speech, not writing

The prompt asks for them without greetings, sign-offs, headings or bullet
points, and asks for them to be sayable inside the task's recording
window. What a learner reads is something they could practise out loud
rather than an essay they could never deliver in sixty seconds.

### Processing and error screens

The three review states are drawn in place of the completion screen
rather than as new flow screens. Adding an eighteenth screen would have
renumbered every screen in the section ("Screen 1 of 18" on the intro)
for a screen only some runs ever reach.

The processing screen has **no progress bar and no task counter.**
Nothing on it knows how far through the work is: the transcriptions run
together on the server inside one request, and a bar that fills at a made
up rate is a lie told slowly. It says instead that this takes longer than
a written review, and that the recordings are still there.

The completion screen's controls are not reachable during a review, which
matters more here than on Writing: restarting mid-request would revoke
the object URLs the result is about to be shown beside.

### Re-recording after a review clears it

The review is a judgement of eight particular recordings, so the moment
any of them changes it is a judgement of audio that no longer exists.
Re-recording returns the completion screen to its unreviewed state with
the submit button live again, and bumps the request id so a reply still
in flight is dropped.

---

## 11. Practice-only disclaimer

Two sentences, not one, and the second is what makes this different from
the Writing result screen.

### The practice estimate sentence

> This is a Toronto Academy practice estimate produced by AI-supported
> feedback. It is not an official CELPIP score and it does not predict an
> official result.

Shown on the result screen, on the processing screen, and beside the
submit button as a hint. Fixed copy in `speaking-mock-copy.ts`, one
definition, used in three places.

### The audio assessment note

Quoted in full in section 6. Shown on the result screen only, because
there is no result to describe on the processing screen.

Both are replaced server side with our fixed wording, whatever the model
returns.

### Wording used

- Toronto Academy practice estimate
- estimated Speaking level
- AI-supported feedback
- not an official CELPIP score
- audio-based practice review

### Wording never used

- official CELPIP score
- official result
- guaranteed score
- pass guarantee
- any claim to have heard the recording
- any claim to judge pronunciation, rhythm or intonation directly

### Five honesty edits EXAM-28 had to make

EXAM-27's copy was accurate for a section that produced nothing and sent
nothing. Five lines became untrue the moment this ticket shipped:

| Line | Was | Now |
| --- | --- | --- |
| Intro line 5 | "No review yet ... will be added in the next build" | "AI review at the end", describing what happens |
| Intro notice | "No score is produced here and nothing you record is saved or uploaded" | The review is a practice estimate, nothing is saved |
| Recorder privacy note | "not uploaded, not saved and not sent anywhere" | Stays in the tab, sent only if you choose to at the end |
| Completion next step | "will be added in the next build. Nothing on this screen has been scored" | The review block, with the control |
| Dashboard card | "AI review will be added next" | Lists the review and the estimated level |

The recorder privacy note is the one worth pausing on. Before this ticket
a recording never left the page at all and the line said so. It can leave
now, once, if the learner chooses, so the line says what is still true
rather than a comfortable half of it.

---

## 12. Security notes

| Requirement | How it is met |
| --- | --- |
| `.env.local` not read | Never opened. Variables are read through `process.env` in server modules only |
| No secrets printed | No key value is logged, returned or interpolated into any message. Only variable **names** appear in logs |
| Supabase service role untouched | No `getSupabaseAdmin` import anywhere in this feature |
| Auth unchanged | No middleware, policy or auth helper edited. The route uses the same `createSupabaseServerClient` session read every other route uses |
| No migrations | None created. No SQL in this ticket |
| No audio saved to a database | No table, no column, no insert |
| No audio uploaded to storage | No bucket touched. Audio exists only inside one request |
| API key server side only | `OPENAI_API_KEY` is read in `evaluate-speaking-mock-test.ts`, a server-only module reached only through the route |
| Transcription model server side only | `OPENAI_TRANSCRIPTION_MODEL` read in `transcribe-speaking-mock-audio.ts`, server only |
| Scoring model server side only | `OPENAI_SCORING_MODEL` read in `evaluate-speaking-mock-test.ts`, server only |
| No secrets in client code | The browser bundle contains no key, no model name, no prompt and no scoring rule. It knows one URL |
| No full audio logged | Only byte counts |
| Transcripts not logged | Only character counts, and only on the too-short path |

### Three more worth stating

**The session is checked before the body is read.** An unauthenticated
request never gets as far as making the server parse several megabytes of
audio, let alone spend a transcription call on it.

**The server-only modules are import-isolated.** The types file has no
runtime values at all, which is what lets the result screen and its cards
import from it without any chance of pulling Zod or the OpenAI SDK into
the browser bundle. The two server modules are imported by the route and
by nothing else.

**The transcript is fenced in the prompt.** A learner who says something
that sounds like an instruction is read as content, not direction.

---

## 13. What is intentionally not built

- **No database save.** No attempt row, no scores table, no result row.
- **No persisted attempt history.** A review exists for as long as the
  learner stays on the result screen.
- **No Supabase audio storage.** No bucket, no upload, no signed URL, no
  storage policy.
- **No migration.** No SQL, and no manual Supabase step of any kind.
- **No localStorage, sessionStorage or cookie.** A reload starts the
  section again with nothing recorded.
- **No full all-skills mock test flow.** Four sections have routes and
  all four now produce a result, but there is no combined run, no overall
  Mock Test 1 score and no cross-section summary. Nothing on the
  dashboard claims Mock Test 1 is complete, and the Speaking card keeps
  its internal preview badge.
- **No admin panel.**
- **No student analytics.**
- **No usage limit or credit changes.** This review is not gated by
  `checkScoredAttemptAccess` and consumes no scored attempt, unlike the
  standalone Speaking Practice flow. That is a deliberate gap and a real
  one: see section 14.
- **No AI usage event.** `recordAiUsageEvent` is not called, so these
  calls do not appear in USAGE-00 reporting. Also section 14.
- **No payment changes.**
- **No live classes.**
- **No direct human-equivalent pronunciation scoring claim.** Covered at
  length in section 6.
- **No strict Speaking timing.** Neither clock acts at zero. Back is
  enabled throughout, so the section can be walked repeatedly during
  review, which is the prototype behaviour every other mock route has.
- **No forced review.** A learner can finish the section and leave
  without ever pressing the button.
- **No official CELPIP branding** anywhere in the production UI.

### Regression surface

| Area | Result |
| --- | --- |
| Listening | Untouched. No Listening file changed |
| Reading | Untouched. No Reading file changed |
| Writing mock | Untouched. `examWritingReview` is read by the new Speaking recipe block and not modified; no Writing component, copy string or pipeline file changed |
| Standalone Speaking Practice | Untouched. `src/features/speaking/*` unchanged. `audio-utils.ts` is read for its mime type helpers and not edited |
| Standalone Writing Practice | Untouched |
| Dashboard | Four cards still present. Only the Speaking card's description string changed |

---

## 14. EXAM-29 continuation note

What this ticket leaves for the next one, in the order it matters:

**1. Usage instrumentation.** The standalone Speaking and Writing flows
record an AI usage event per paid call through `recordAiUsageEvent`, and
this feature records none. A full Speaking review is nine provider calls
(eight transcriptions and one scoring call), which is the most expensive
single action in the product, and it is currently invisible to USAGE-00
reporting. This should be the first thing added.

**2. Access gating.** The standalone flow checks
`checkScoredAttemptAccess` before transcribing and consumes a scored
attempt after feedback is saved. The mock review checks neither, so a
signed-in learner can submit an eight recording review as often as they
like. Acceptable for an internal preview and not acceptable once the mock
tests are open to students.

**3. Persistence.** No attempt row, no saved transcript, no saved review.
A learner who closes the tab loses everything. A saved Speaking mock
attempt would need a migration, a storage decision about the audio, and a
retention policy, which is why none of it is in this ticket.

**4. The all-skills Mock Test 1 run.** Four sections now produce four
results and there is no way to sit them as one test or to see one summary
across them. That is the shape of the remaining work and it needs the
persistence above first.

**5. Direct audio evaluation.** If a model with a safe audio input path
becomes available, the scoring step could take the recording rather than
the transcript, and the audio assessment note could then be narrowed
instead of removed. The limitation is written where a reader will meet
it: this document, the system prompt, the copy file and the result
screen.

**6. Speaking instructional video screen.** Still open from EXAM-27. A
Speaking clip is registered in `instructional-video-assets.ts` and the
source document notes a Speaking instructions video at that point, but
adding the screen changes the screen count and is a separate decision.

**7. Strict Speaking timing.** A forward-only run where the recording
window actually stops the recorder. Open since EXAM-27 for every mock
route.
