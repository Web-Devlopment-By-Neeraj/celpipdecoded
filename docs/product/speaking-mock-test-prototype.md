# Speaking mock test section prototype (EXAM-27)

Mock Test 1 Speaking as one client-side run: the section instructions,
all eight task screens with their prompts, pictures, preparation
countdown, recording countdown and browser recorder, a transition before
each task after the first, and a completion screen.

Nothing is transcribed, reviewed, scored, uploaded or saved. This
document says exactly what was built, where every word and every number
came from, and what EXAM-28 has to add.

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route created

```
src/app/dashboard/mock-tests/mock-test-1/speaking/page.tsx
```

URL:

```
/dashboard/mock-tests/mock-test-1/speaking
```

Protected. The route sits under `/dashboard`, so the layout auth guard
covers it, and the page calls `supabase.auth.getUser()` again close to
the content because layouts do not re-render on client navigation. An
unauthenticated visitor is redirected to `/login`. The page carries
`robots: { index: false, follow: false }`.

There is deliberately no `actions.ts` beside this page. The Listening and
Reading routes have one to keep answer keys off the client, and Speaking
has no key. The Writing route has one to keep `OPENAI_API_KEY` off the
client, and this ticket calls no model. Nothing in this section needs a
server, so nothing in it has one.

The route is listed in `src/features/navigation/exam-mode-routes.ts`, so
it runs in exam mode: no dashboard sidebar, header, breadcrumb trail or
footer, and `ExamModeViewport` gives the frame a fixed, one window tall
viewport with document scrolling switched off.

---

## 2. Source content used

Authority: `mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`.

What that document holds for Speaking:

- the section title, "Speaking Test Instructions"
- five instruction sentences, including "Try to complete this practice
  Speaking Test in 15 minutes."
- the eight task names, for example "Speaking Task 1: Giving Advice"
- nine Cloudinary image URLs, one per task except Task 5 which has two
- an author note that a Speaking instructions video appears after the
  instructions

What it does not hold: any prompt text. Every one of the eight prompts
exists in the source only as a picture, which is what
`mock-tests/mock-test-1/extracted-content-outline.md` records as "all
prompt images only" and what `docs/product/mock-test-1-content-map.md`
lists as an open content gap: "Type out the eight Speaking prompts as
text."

**This ticket closes that gap.** Every prompt sentence, option card
heading and card detail line in
`src/features/exam-engine/mock-tests/mock-test-1/speaking-section.ts` is
transcribed word for word from those nine images. Nothing is
paraphrased, nothing is reworded into house style, and nothing is added.
The only change to the characters themselves is the house style rule:
the source images use curly apostrophes and the content file uses
straight ones.

The nine source images, all referenced from Cloudinary and none
downloaded or re-hosted:

| Task | Source image |
| --- | --- |
| Task 1 | `v1785339532/Speaking_Test_1_-_Task_1_hcanik_kyge8y.png` |
| Task 2 | `v1785339562/Speaking_Test_1_-_Task_2_cupftv_e5gpe3.png` |
| Task 3 | `v1785339602/Speaking_Test_1_-_Task_3_ciuvf2_xuy0my.png` |
| Task 4 | `v1785339642/Speaking_Test_1_-_Task_4_im56t0_bepfcq.png` |
| Task 5 | `v1785339673/Speaking_Test_1_-_Task_5_1_c0vbub_giqbsl.png` |
| Task 5 | `v1785339706/Speaking_Test_1_-_Task_5_2_tcpomi_hkalna.png` |
| Task 6 | `v1785339741/Speaking_Test_1_-_Task_6_dgu9uf_ga3fxi.png` |
| Task 7 | `v1785339780/Speaking_Test_1_-_Task_7_siaes0_owwvhj.png` |
| Task 8 | `v1785339814/Speaking_Test_1_-_Task_8_hldd7b_dd0ael.png` |

Also inspected: `mock-tests/mock-test-1/extracted-links.md`,
`docs/product/mock-test-1-content-map.md`,
`docs/product/celpip-exam-rules-research.md`,
`docs/product/admin-mock-test-builder-blueprint.md`.

### Section instruction copy is a rewrite, not a copy

Three of the five source instruction sentences describe software that
behaves differently from ours:

- "In this practice test, no score will be provided for any of the
  Speaking tasks. However, you can refer to the Performance Standards for
  Speaking or listen to sample speaking responses at the end of the
  Speaking Test." We have no sample responses screen and no Performance
  Standards link.
- "For this practice test, you should use a timer to make sure that you
  complete each task within the given time." This engine has its own two
  countdowns per task.
- "The practice test will not record your answers. If you wish to record
  your own answers, record and save your responses using your computer
  microphone or your own recording device." This engine records in the
  browser.

`docs/product/mock-test-1-content-map.md` already flagged this as work to
do: "Rewrite the Speaking instruction copy so it describes Toronto
Academy behaviour". The five instruction lines in
`src/features/exam-engine/speaking-mock-copy.ts` are that rewrite. The
two facts in the source instructions that are true here, that you move
forward by pressing Next and that the Speaking Test is about 15 minutes,
are both kept.

### The one source sentence deliberately dropped from a prompt

Task 5's first source screen ends with "If you do not choose an option,
the computer will choose one for you. You do not need to speak for this
part." That sentence describes the interactive choice step, which this
prototype does not build, so on our single Task 5 screen it would
describe behaviour that does not exist. It is replaced by a short note of
our own that says plainly what this screen does instead. See section 5.

---

## 3. Tasks included

All eight, in source order, with the section's own task names.

| Task | Title | Visual prompt | Preparation | Recording |
| --- | --- | --- | --- | --- |
| Task 1 | Giving Advice | none | 30 s | 90 s |
| Task 2 | Talking about a Personal Experience | none | 30 s | 60 s |
| Task 3 | Describing a Scene | cafe scene | 30 s | 60 s |
| Task 4 | Making Predictions | cafe scene | 30 s | 60 s |
| Task 5 | Comparing and Persuading | two rows of option cards | 60 s | 60 s |
| Task 6 | Dealing with a Difficult Situation | none | 60 s | 60 s |
| Task 7 | Expressing Opinions | none | 30 s | 90 s |
| Task 8 | Describing an Unusual Situation | roadside drawing | 30 s | 60 s |

Seventeen screens in all: intro, eight tasks, seven transitions, and the
completion screen. The order is derived from the content by
`buildSpeakingSectionFlow`, not typed out, so a section with a different
number of tasks needs no code change.

---

## 4. Prompt structure

One content type covers all eight tasks. The eight differ only in which
fields are filled, and no difference is special cased in a component: an
absent field renders nothing.

`SpeakingTaskContent` in
`src/features/exam-engine/speaking-mock-types.ts`:

| Field | What it holds | Which tasks use it |
| --- | --- | --- |
| `situationParagraphs` | source text printed above the instruction | Task 5 |
| `promptInstruction` | the source's own instruction sentence | all eight |
| `promptParagraphs` | further source paragraphs under it | Task 7 |
| `alternativesLead` + `alternatives` | the "Choose ONE:" either or pair | Task 6 |
| `visuals` | pictures and option cards, in source order | Tasks 3, 4, 5, 8 |
| `promptNote` | our own line where the screen departs from the source | Task 5 |
| `prepTimer`, `responseTimer` | the two windows | all eight |

Two decisions worth naming:

- **The Task 6 either or pair is not a control.** The source asks the
  learner to pick one in their head and speak. Nothing is selectable,
  nothing is stored and nothing is gated on it, which is why it is not
  modelled as the Writing Task 2 radio group. A radio group would promise
  a choice this task does not record.
- **`promptNote` is the only sentence on a prompt panel that is ours.**
  Everything else on the left of a task screen is source text.

---

## 5. Visual prompt handling

Four tasks show pictures. On Tasks 3, 4 and 8 the picture is the prompt:
the learner is asked to describe it or predict what happens next in it,
so there is no text form of it and it is content rather than decoration.
It is never hidden at a small width and never deferred.

### Why the pictures are cropped

Each source image is a screenshot of a whole official screen, not a bare
picture. It carries the prompt sentence across the top, the picture
below, and on Tasks 3, 4 and 8 a grey "Preparation Time" panel beside the
picture holding a frozen number (29 on Tasks 3 and 4, 30 on Task 8).

Showing the whole screenshot would put the prompt on the page twice and
put a dead clock reading 29 next to our live preparation countdown, which
is a misleading thing to show a learner.

So the picture is cut out of the screenshot with a Cloudinary `c_crop`
delivery parameter, and the prompt sentence is transcribed as text above
it. The crop is a delivery parameter on the same referenced asset: no
file is downloaded, nothing is re-hosted, and the untransformed URL still
returns the original screenshot for anyone checking a crop. Every crop
rectangle is recorded in a comment beside the URL in the content file.

| Where | Crop out of | Delivered size |
| --- | --- | --- |
| Task 3 scene | Task 3 screenshot | 545 x 390 |
| Task 4 scene | Task 4 screenshot | 545 x 389 |
| Task 8 scene | Task 8 screenshot | 360 x 247 |
| Music camp photo | Task 5 screenshot 1 | 420 x 280 |
| Track and field photo | Task 5 screenshot 1 | 420 x 300 |
| Reading and writing photo | Task 5 screenshot 2 | 377 x 327 |

Each picture carries alt text written from the picture itself, stating
only what is visibly in it. Unlike the Writing prompt images, this alt
text cannot be a description of text that is also on the screen, because
on these tasks there is no text form of the picture.

Each `img` is a plain element rather than `next/image`, for the reason
`ReadingPartTwoInformationScreen` and `ListeningScenarioScreen` both
record: a remote Cloudinary asset would need an `images.remotePatterns`
entry in `next.config.ts` and would route licensed practice test artwork
through the Next image optimizer.

The intrinsic width and height go on the element, so the browser reserves
the right box before the file arrives. The picture is capped at 34rem
wide with automatic height, which is the width of the largest picture as
the source delivers it: the two cafe scenes draw at their own size, the
smaller Task 8 drawing is scaled up by about half rather than by more
than twice, and all three end up roughly the same size on screen.
`object-contain` is a guarantee rather than a layout, after an earlier
pass in this ticket distorted the pictures by capping the height of a
flex item that was already being stretched to the column width.

### Task 5, the one place the screen departs from the source

The official Task 5 runs across two screens: a choice screen with the two
camps, and a comparison screen where the chosen camp is set against the
sister's camp. `docs/product/exam-engine-screen-types.md` calls the first
of those screen type 12, and it is not built in this ticket.

This prototype gives Task 5 one screen, which shows, in source order:

1. the setup paragraph from source screen 1
2. the persuade instruction from source screen 2
3. a short note of our own saying the choice step is not built and that
   the source's own choice is what is shown
4. the two camps from source screen 1, as option cards
5. the sister's choice and your choice from source screen 2, as option
   cards carrying the source's own "Your Sister's Choice" and "Your
   Choice" headings

Nothing on it is selectable. What was omitted, and why, is in section 2.

---

## 6. Timer behaviour

Two countdowns per task, drawn as cards in the answer column rather than
as readings in the thin top bar.

That is a deliberate departure from Listening, Reading and Writing, which
all put their clock in the bar. In those sections the clock is a
constraint on work the learner is already doing. In Speaking the clock is
the instruction: there is a window to plan in and then a window to speak
in, and the change from one to the other is the whole structure of the
task. The source screens agree, and they are the reference this engine is
built against: the Task 3, 4 and 8 prompt images all show a large
"Preparation Time" panel beside the picture. Each window is drawn once,
so there is one clock per window rather than two components counting the
same one.

Both clocks are `useExamCountdown`, the one clock in the engine, whose
own comments say it was written for this pair. Nothing new computes time.

### Where the numbers came from

`src/features/exam-engine/speaking-mock-timing.ts` holds all sixteen
windows and the reasoning. In short:

- the Mock Test 1 source publishes one Speaking timing, "Try to complete
  this practice Speaking Test in 15 minutes", and no per-task figure in
  words
- three of its prompt images show a preparation countdown in the picture,
  which is a 30 second window caught mid tick on Tasks 3, 4 and 8
- the sixteen per-task figures come from the official Speaking overview,
  `public/Overview and Scoring Descriptors/4. Speaking/Speaking -
  Overview.pdf`, as transcribed into the table in
  `docs/product/celpip-exam-rules-research.md` section 5

They are labelled `source: "reference"` rather than `"published"`,
because they are a transcription of a scanned PDF rather than something
printed in the Mock Test 1 file. No figure anywhere in the section is a
placeholder: every one has a source.

**A recorded disagreement.** `docs/product/mock-test-1-content-map.md`
also holds a timing table, read from screenshots, and it disagrees on two
tasks: it gives Task 6 a 30 second preparation where the research gives
60, and Task 7 a 60 second recording where the research gives 90. The
research table is used, for three reasons. It names its source as the
official Speaking overview, while the content map calls its own table
"values read from the screenshots, for reference only" and lists
confirming them as an open task. It is per-task rather than grouped. And
it adds up: 5 minutes of preparation plus 9 minutes of recording is 14
minutes of clock inside the published 15 minute allowance, where the
content map's figures total 13 and leave two minutes unaccounted for. The
check is in code as well as in prose, in
`speakingWindowsFitPublishedAllowance`.

**Task 5 is the one simplification.** The research table reads "60
seconds (x2)" for its preparation, because the official task has a
preparation window on each of its two screens. This prototype gives Task
5 one screen and one 60 second preparation window. That is a
simplification of a source figure, not an invention of one.

### What the clocks do

- The preparation window opens when the task screen opens.
- The recording window opens when Start recording is pressed, and closes
  when the take does. Before and after a take the card shows the window
  length in a muted tone.
- The preparation window ends when recording starts, whether or not it
  had run out, and the card then reads "Complete". It does not come back
  for a re-record: the learner has already had their planning window.
- At zero the reading becomes "Time is up" and a line underneath says
  nothing stops and nothing is deleted.

**Nothing happens at zero.** No recording starts, no recording stops, no
screen advances, nothing is submitted, no AI is called and nothing is
erased. The learner finishes their sentence and presses Next when they
are ready. Neither clock is given an expiry handler at all. Strict
Speaking timing, where the window closes the recorder, is a later ticket.

Both clocks restart when a screen is revisited, because a countdown is
keyed to its screen and Back remounts it. That is the same behaviour
every other timed screen in the engine has and is prototype behaviour,
not proctoring.

---

## 7. Recording behaviour

Browser `MediaRecorder`, through
`src/components/exam/speaking/useSpeakingMockRecorder.ts`.

- **The microphone is asked for when Start recording is pressed, and at
  no other moment.** The only `getUserMedia` call in the section is
  inside the hook's `start()`, and the only caller of `start()` is the
  click handler. Opening a task screen asks for nothing. There is no
  effect that starts recording and no warm up stream held between tasks.
- Stop ends the take, and the finished audio arrives as a `Blob`.
- Re-record starts a new take and replaces the old one. Only the most
  recent take is kept, which every screen says.
- Leaving a task while recording stops the recorder and releases the
  microphone, through the hook's unmount cleanup. The abandoned audio is
  dropped rather than written into a task the learner has already left.

**Nothing is uploaded, at all.** No `fetch`, no server action, no
Supabase client, no storage bucket, no API route. No database write. No
`localStorage`, no `sessionStorage`, no cookie.

### What is shared with the standalone Speaking Practice flow

Only the pure helpers in `src/features/speaking/audio-utils.ts`:
`isRecordingSupported`, `pickRecordingMimeType` and `getBaseMimeType`.
They are read, not edited, so the two flows can never disagree about
which container this browser records in.

`src/components/speaking/useAudioRecorder.ts` is deliberately not reused.
It reports a failure as a finished sentence from `recordingCopy`, which
suits a screen that prints it. This section has to do more than print it:
an unsupported browser gets no retry button, a blocked microphone does,
and both have different wording from an ordinary failure. Deciding that
by comparing message strings would be a coupling nobody could safely
reword either flow through. The mock hook reports a
`SpeakingRecordingErrorKind` and `speaking-mock-copy.ts` turns it into
words. Its structure is otherwise the same as the standalone hook's,
because that structure is correct and already in production use.

---

## 8. Audio state strategy

Local React state in `SpeakingSectionPrototype`, and nowhere else:

```ts
{
  [taskId: string]: {
    audioUrl: string | null,
    audioBlob: Blob | null,
    durationSeconds: number,
    recordedAt: string | null,
    mimeType: string | null,
  }
}
```

`mimeType` is the one field beyond the shape the ticket suggests. The
browser picks the container rather than us, and EXAM-28 needs to know
which one the moment audio leaves the page.

**Why recordings survive navigation.** They are keyed by task id rather
than by screen position, and the prototype stays mounted for the whole
section, so moving to a transition and back, or to Task 8 and back to
Task 3, does not touch the map. The task screen is remounted by that
navigation and the audio is not, which is the whole reason the state
lives one level up from the recorder.

Verified in a browser: a take recorded on Task 5 was still on Task 5,
playable and correctly labelled, after walking forward to the completion
screen and back again.

**Object URLs.** A `Blob` cannot be played by an `audio` element
directly, so `URL.createObjectURL` turns it into a `blob:` URL that
resolves inside the document. Every displaced URL is revoked:

- recording again over a take revokes the take it replaced, in the same
  handler that creates the new one, reading the previous URL out of the
  state updater argument so batching cannot leak one
- restarting the section revokes every URL in the map before clearing it

Creation and revocation both happen in event handlers, never during
render and never in an effect. Leaving the page needs no cleanup of its
own: a `blob:` URL is scoped to the document that made it.

**What is deliberately transient.** The recorder's own status, the error
kind and the take key live in `SpeakingTaskScreen` and are lost when the
learner leaves the screen. A take in progress is not something to resume
from another task.

A reload starts the section again with nothing recorded. Three separate
screens say so: the intro notice, the line under every recorder, and the
completion notice.

---

## 9. Unsupported browser and permission behaviour

Three failure kinds, each getting only what can actually help.

| Kind | What the screen says | Retry offered |
| --- | --- | --- |
| `unsupported` | Recording is not available in this browser, with a suggestion to open it in an up to date browser | no |
| `permission-denied` | Microphone access was blocked, with a pointer to browser settings | yes |
| `failed` | The recording could not be completed, with a pointer to the microphone being connected and free | yes |

All three add the same last line: the run is not stuck, and moving to the
next task is allowed. A task with no recording is reported as missing on
the completion screen and nothing else happens.

**Unsupported is checked twice, deliberately.** The hook checks before it
touches `getUserMedia`, which is what makes it safe. The component checks
at render through `useSpeakingRecordingSupported`, so the Start recording
button is never offered in a browser that cannot honour it, and the
unsupported notice appears before anything is pressed. Neither check is
enough alone: a browser can pass the feature test and still refuse the
call.

That render time check is `useSyncExternalStore`, not state pushed from
an effect. `isRecordingSupported` reads `window` and `navigator`, so a
plain call in a component body would answer false on the server and true
in the browser and the two would disagree at hydration, and this
project's lint rules refuse a state push from an effect. The server
answer is optimistic, so a page drawn on the server has the button and a
browser that turns out to have no `MediaRecorder` replaces it with the
notice on its first client render.

Nothing crashes in any of the three cases, and Next is never gated on a
recording, so a learner with no working microphone can read all eight
tasks and reach the completion screen.

---

## 10. Dashboard link status

`src/components/dashboard/DashboardMockTestCard.tsx` gains a fourth card
under Mock tests:

- **Title:** Mock Test 1 - Speaking Test
- **Badge:** Internal preview
- **Description:** Speaking section prototype with Tasks 1-8, preparation
  timer, and local recordings. AI review will be added next.
- **Facts:** Speaking / Tasks 1-8 / 9 minutes, where the 9 minutes is
  summed off the content rather than written down
- **Button:** Open Speaking Test
- **Route:** `/dashboard/mock-tests/mock-test-1/speaking`

Dressed exactly as the Reading and Writing cards: a tinted panel with a
dashed rule, an Internal preview badge where the Listening card's
Available pill sits, and a secondary button.

The Listening, Reading and Writing cards are unchanged. The grid moved
from three columns to two, so four cards sit in two even rows: four
columns were tried and dropped, because inside the dashboard content
column they leave each card about 215px wide and break "Mock Test 1 -
Reading Test" over four lines.

There are no individual Speaking task cards. The eight tasks are screens
inside one run and are not reachable on their own.

Nothing on the dashboard claims that a full all-skills Mock Test 1
exists. All four sections now have a route and they are still four
separate runs.

---

## 11. What is intentionally not built

- no transcription
- no AI review
- no Speaking score
- no estimated Speaking band or level
- no task level feedback
- no audio upload, to Supabase Storage or anywhere else
- no database save and no attempt history
- no Supabase migration
- no server action and no API route for this section
- no OpenAI call
- no `localStorage`, `sessionStorage` or cookie
- no Speaking instructions video screen. A Speaking clip is registered in
  `instructional-video-assets.ts` and the source document notes that a
  video appears after the instructions, but adding a video screen changes
  the screen flow the ticket sets out and is left as a follow up
- no Task 5 two-card choice step (screen type 12). See section 5
- no strict Speaking timing. Time up changes a reading and nothing else,
  and Back works throughout
- no full all-skills Mock Test 1 flow
- no admin panel
- no payment and no live classes

Untouched by this ticket: the Listening section, the Reading section, the
Writing section, the standalone Speaking Practice AI flow and the
standalone Writing Practice AI flow.

---

## 12. EXAM-28 continuation note

EXAM-28 adds transcription, AI review and an estimated Speaking level.
The four criteria will be Content/Coherence, Vocabulary, Listenability
and Task Fulfillment, which is what
`docs/product/celpip-exam-rules-research.md` section 15 records for
Speaking.

What this ticket already leaves in place for it:

1. **Every prompt is text.** That is the point of the transcription work
   in section 2: an image-only prompt cannot be sent to an AI reviewer.
   `src/features/speaking/scoring-prompt.ts` needs the task text as text,
   and now there is one.
2. **Every recording is a `Blob` with its `mimeType` beside it**, keyed
   by task id, in one map on `SpeakingSectionPrototype`. That is what an
   upload or a direct multipart POST needs, and nothing has to be
   reconstructed to get it.
3. **The completion screen is where the review belongs.** Follow the
   shape EXAM-26 settled for Writing: keep the completion screen as the
   last flow screen, add a Submit for AI Review control to it, and draw
   the processing, error and result states in its place rather than
   adding an eighteenth screen. Adding a flow screen would renumber every
   screen in the section for a screen only some runs reach.
   `SpeakingSectionCompleteScreen` today says in a sentence that the
   review is the next build; that sentence is what the control replaces.
4. **The server boundary is not yet drawn, and should be drawn the way
   the Writing one is.** Add an `actions.ts` beside
   `page.tsx`, verify the session inside it because a page level check
   does not extend to an action, and keep `OPENAI_API_KEY` and the model
   name on the server. Pass the action into the prototype as a prop
   rather than importing it inside the component, so the component stays
   renderable without a server. `WritingSectionPrototype` is the working
   example, including the request id ref that drops a stale reply.
5. **Decide the audio path deliberately.** Nothing in this ticket
   uploads, and the honest options are a direct multipart POST to a
   server action, or an upload to Supabase Storage under the learner's
   own folder. The standalone flow already does the second, in
   `src/features/speaking/recording-upload.ts` and
   `buildAttemptAudioPath`, which keys on the owner user id because
   storage policies do. If audio starts being stored, the intro notice,
   the line under every recorder and the completion notice all currently
   promise it is not, and all three have to change in
   `speaking-mock-copy.ts` in the same commit.
6. **A recording that fails review must not be lost.** The prototype's
   response map is the only copy of a take, so a failed review has to
   return to the completion screen with every recording still held, which
   is the rule `WritingEvaluationErrorScreen` already follows.
7. **Wording rules do not relax.** Whatever comes back is a Toronto
   Academy practice estimate produced by AI-supported feedback. It is not
   an official CELPIP score and does not predict one. The Writing result
   screen states that directly under the estimated level, and the
   Speaking one should do the same.

Two smaller follow ups this ticket noticed and did not take:

- the Speaking instructions video screen, from section 11
- the Task 5 choice step as screen type 12, which would let the learner
  pick a camp and would make the persuade prompt reflect their own
  choice rather than the source's
