# Listening format, strict timing and exam theme polish (EXAM-15F)

Mock Test 1 Listening finished off, so Reading can be built against a
settled timing and navigation model rather than one that is about to
change.

This ticket applies the findings of EXAM-15E, which are in
`docs/product/listening-format-audit-and-correction-plan.md`, against the
rules in `docs/product/celpip-exam-rules-research.md`.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

---

## 1. What was fixed

Six things, in the order they matter to a learner.

1. **The exam no longer sits on a marketing background.** Every surface in
   exam mode was the warm off white the signed in product and the landing
   page share, with the bars and the gutter drawn as translucent navy over
   it. Exam mode now has its own pair of flat, cool neutrals and no alpha
   is laid over anything warm. Section 2.
2. **Listening Part 6 asks its six questions with the control its own
   content describes.** The items were already sentence stems with a blank
   and the source instructs the part with the drop-down wording twice, and
   the screen drew radio buttons. It draws a select now. Section 3.
3. **Parts 4, 5 and 6 have answering windows sized for their question
   sets** instead of one 30 second window for a screen holding five, eight
   or six questions. Section 6.
4. **A window that runs out moves the test forward** on the full route,
   instead of printing "Time is up" and waiting. Sections 5 and 8.
5. **The full route is forward only.** Back used to walk from Part 4 back
   into Part 1. Section 5.
6. **Media starts on its own** when a media screen opens on the full
   route, with a visible fallback when the browser refuses. Section 7.

Two decisions were made and deliberately produced no code: Part 4 and Part
5. Section 4.

A browser test after the first pass found more, and section 12 records it:
the dashboard chrome is no longer rendered on the exam route at all, the
exam fills the browser window instead of drawing itself as a card, and the
Parts 4 to 6 question screens are boxed exam blocks rather than ruled rows.
Where section 12 and an earlier section disagree, section 12 is the later
one and it says so.

### Files created

    src/features/exam-engine/listening-timing.ts
    docs/product/listening-format-strict-timing-polish.md

### Files changed

Theme:

    src/app/globals.css
    src/features/exam-engine/exam-theme.ts

Part 6 format:

    src/components/exam/listening/ListeningViewpointsQuestionScreen.tsx
    src/features/exam-engine/listening-viewpoints-types.ts
    src/features/exam-engine/listening-copy.ts
    src/features/exam-engine/mock-tests/mock-test-1/listening-part-6.ts

Timing, navigation and media:

    src/components/exam/listening/ListeningSectionPrototype.tsx
    src/components/exam/listening/ListeningQuestionScreen.tsx
    src/components/exam/listening/ListeningDropdownQuestionScreen.tsx
    src/components/exam/listening/ListeningVideoQuestionScreen.tsx
    src/components/exam/listening/ListeningAudioScreen.tsx
    src/components/exam/listening/ListeningVideoScreen.tsx
    src/components/exam/listening/ListeningViewpointsScreen.tsx
    src/components/exam/listening/ListeningSectionVideoScreen.tsx
    src/components/exam/listening/ListeningAudioPlayer.tsx
    src/components/exam/ExamVideoScreen.tsx
    src/components/exam/ExamVideoPlayer.tsx
    src/features/exam-engine/exam-copy.ts

Screen window durations on the internal part routes:

    src/components/exam/listening/ListeningPartFourPrototype.tsx
    src/components/exam/listening/ListeningPartFivePrototype.tsx
    src/components/exam/listening/ListeningPartSixPrototype.tsx

### Files removed

    src/components/exam/listening/ListeningViewpointsQuestionList.tsx

### Not touched

The four Listening flow files, `listening-score.ts`,
`listening-section-score.ts`, `listening-band-score.ts`, every `actions.ts`
that marks a part, the content files for Parts 1 to 5, every answer key,
every Supabase helper, every API route, both AI flows, the dashboard and
the auth guard. No dependency was installed, no migration was created and
nothing new is written to a database.

---

## 2. Background and theme correction

### What was wrong

Everything in exam mode was drawn on `--academy-paper-warm`, `#faf8f4`,
which is the warm off white the signed in product uses and which carries a
little of the landing page cream in it. On top of that:

- `examViewport.overlay`, the sheet pinned over the dashboard for the whole
  length of the test, was that warm colour, so the frame was surrounded by
  it from the first screen to the last
- `examFrame.page` was the same colour again
- `examFrame.frame` and `examCanvas.region` were `academy-navy-soft` at 45
  and 30 percent, so the grey gutter around the white sheet was a wash of
  navy over warm paper and came out warm
- `examBar.top` and `examBar.bottom` were vertical gradients between a
  solid navy tint and a translucent one, which picked up whatever was
  behind them and read as a product header rather than test chrome

None of it was orange as such. All of it was warm, and a warm cast plus a
gradient in the chrome is what makes a test screen read as a marketing
page with an exam in the middle of it.

### What it is now

Two new tokens in `globals.css`, used only by the exam engine:

    --academy-exam-surface: #e6eaf0
    --academy-exam-gutter:  #eff2f6

With the two colours that were already there, exam mode is one flat
neutral ramp, darkest on the outside and lightest on the sheet a learner
actually reads:

| Surface | Colour | Where |
| --- | --- | --- |
| Desk behind the exam window | `#e6eaf0` | `examViewport.overlay`, `examFrame.page` |
| Top and bottom bars | `#e9eef6` | `examBar.top`, `examBar.bottom` |
| Gutter around the sheet | `#eff2f6` | `examFrame.frame`, `examCanvas.region` |
| The sheet | `#ffffff` | `examCanvas.sheet` |

And two rules that come with it:

- **No alpha over anything warm.** Every one of those four is opaque, so
  nothing underneath can tint it.
- **No gradient in the chrome.** Both bars are one flat colour. A bar that
  never changes shade is a bar a learner stops looking at, which is what
  chrome is for.

The result is what the ticket asks for: a neutral background from the
instruction screen to the end of section screen, a top bar and a bottom bar
that keep their height and colour on every screen, and a white canvas.

Two points worth being explicit about:

- The change is in the shared `examFrame`, `examBar` and `examCanvas`
  recipes, so the six internal part routes get the same neutral treatment
  as the full route. Only the full route is inside the locked viewport, but
  neither should look warm.
- Toronto Academy branding is unchanged and stays where it was, which is
  the copy and the route metadata rather than the exam surface. No CELPIP
  branding, logo, colour or screenshot appears anywhere in the run, and
  none was added.

---

## 3. Part 6 format correction

### The mismatch

`docs/product/listening-format-audit-and-correction-plan.md` section 8
called this the highest value single fix in the Listening build, because it
is the only part where every piece of evidence points one way:

- All six Part 6 items in the Mock Test 1 source are sentence stems ending
  in a blank, for example "Nelson has requested that city council ____".
- The source instructs the part twice with the drop-down wording, in the
  intro bullet and again above the question list.
- The official study pack describes Listening Parts 4 to 6 as sentence
  completion.
- The content type, `ListeningViewpointsQuestion`, already stored each
  statement split around its blank as `textBefore` and `textAfter`, which
  is exactly what `ListeningDropdownQuestion` stores.

And the screen drew a radio group. EXAM-13 did that knowingly, because its
own ticket asked for radio options, and it dropped the drop-down clause
from the learner-facing copy rather than name a control that was not on the
screen. That was the right call then and it left the part with the correct
data drawn by the wrong control and described by weakened copy.

### What changed

- `ListeningViewpointsQuestionScreen` renders
  `ListeningDropdownQuestionList`, the same list Part 4 has used since
  EXAM-09. The two question types are structurally identical, so a Part 6
  question renders through it with no conversion step.
- `ListeningViewpointsQuestionList`, the radio version, is deleted. After
  the correction it was the same list as Part 4's, and the audit asked for
  the duplicate to be retired rather than kept in step by hand.
- The drop-down clause is back in both instruction lines, because the
  control is real now:
  - `listeningCopy.viewpointsInstruction` is
    "Choose the best way to complete each statement from the drop-down
    menu."
  - `listening-part-6.ts` carries the source's own wording again in its
    `questionInstruction` and in the intro bullet.

The screen keeps its own component rather than being folded into
`ListeningDropdownQuestionScreen`, because a viewpoints part still has its
own content type and its own media shape. What is shared is the question
list, which is the piece the two formats genuinely have in common.

### What did not change

Nothing that scoring depends on:

- all six questions, in the same order, with the same ids
- the four option ids under each of them, and their text
- the part answer key in `listening-part-6.ts`
- `markListeningPartSix` and `markListeningSection`, both untouched
- `withoutListeningViewpointsAnswerKey`, so the key still never reaches
  the browser

The answer key is still, in order:

| Question | Correct option |
| --- | --- |
| q1 | approve a plan to redevelop the vacant land. |
| q2 | could put her community at risk. |
| q3 | may be developed into a nature walkway. |
| q4 | compact community with a vibrant local economy. |
| q5 | both economic and community interests can be satisfied. |
| q6 | Mother of two, Eleanor Wentworth, will be disappointed. |

No mapping issue was found, so no key entry was edited. An answer selected
from the select stores the same option id the radio stored, so Part 6 marks
exactly as it did.

Both routes that show Part 6 share the component, so the individual route
at `/dashboard/mock-tests/mock-test-1/listening/part-6` shows the corrected
UI as well as the full run.

---

## 4. Part 4 and Part 5 decisions

### Part 4 stays a dropdown, and it was already right

No change. The audit confirmed it against the source directly: the Part 4
intro carries "Choose the best way to complete each statement from the
drop-down menu", all five items are stems ending in a blank, and each has
exactly four options. `ListeningDropdownQuestionScreen` is the reference
implementation for the Parts 4 to 6 format, and this ticket brought Part 6
toward it rather than the other way around.

The only Part 4 change is its screen window, section 6.

### Part 5 stays source-based, and this is deliberate

**Decision: do not convert Part 5 to sentence completion or to a
drop-down. Keep the eight whole questions and the radio group.**

The tension is real and worth stating plainly, because the two halves of it
disagree:

- The official study pack describes Listening Parts 4 to 6 as sentence
  completion, so an official Part 5 would be stems.
- Our source test's Part 5 is not. All eight items are full interrogatives
  ending in a question mark, for example "What aspect of the fundraiser are
  the three colleagues debating?", and the part's own intro line is "Choose
  the best way to answer each question."

The source also carries the drop-down line above its question list, but
that single line appears verbatim above the question list in Parts 4, 5 and
6 alike, and in Part 5 it contradicts both the part's own intro and all
eight of its items. `docs/product/mock-test-1-content-map.md` reached the
copy and paste artefact reading during EXAM-11 and the audit confirmed it.

So converting Part 5 would mean writing eight sentence stems the source
does not contain. That is inventing content, it puts an answer key that is
currently confirmed at risk, and this ticket forbids it. There is also
nowhere for a select to sit: a drop-down in the middle of a full
interrogative has no blank to fill.

The divergence is recorded rather than fixed. Part 5 renders what our
source says, and `ListeningVideoQuestionScreen` carries the reasoning in
its header so nobody "corrects" it back later.

**Carry forward to Mock Test 2 authoring:** Part 5 should be written as
sentence stems, to match the current official format. That is an authoring
standard for new content, not a rewrite of Mock Test 1.

Part 5 did get its screen window fixed, section 6, and the strict rules in
section 5 apply to it like every other part.

---

## 5. Full route strict timing behaviour

Applies to `/dashboard/mock-tests/mock-test-1/listening` and to nothing
else. All of it lives in `ListeningSectionPrototype`, as props passed down
to shared screens, so no screen component has an opinion about which mode
it is in.

### Forward only

Back is hidden from the section instruction screen through the last
question screen of Part 6. A learner cannot return to a previous question
or a previous part.

The audit suggested clamping Back to the current part rather than removing
it. Removing it is the right end state once expiry advances the flow: a
question whose 30 seconds have run out is closed, so a Back that sometimes
works and sometimes does not is harder to understand than one that is not
offered.

Two screens keep Back, and neither is answerable:

- the practice score, where Back returns to the answer review, which is the
  same move the score screen's own "Review answers" control makes
- the end of section screen, where Back returns to the score

The answer review does not get Back, because behind it is Part 6 with the
correct answers now on display.

The bottom bar still renders on every screen, so hiding Back does not
change the height of anything. That is what "stable bottom nav" means here.

### A window that closes moves the test on

Every question screen is handed `goNext` as its `onTimeExpire`. Reaching
zero does exactly what pressing Next does and nothing more. Section 8 has
the full list of what does and does not happen.

### Next never waits for an answer

`requireAnswer` on the Parts 1 to 3 screen and `requireAllAnswered` on the
Parts 4 to 6 screens are false throughout the run, and the "answer all
questions to continue" hints that explained the gate are hidden with it.

Two reasons. A gate that blocks Next until every question is answered
cannot survive a window that has to advance regardless, and the official
test lets a learner leave a question blank and take the zero for it.

### What is not built here

No section level clock and no part level clock. The Listening section runs
46 to 55 minutes as a whole and the per-part allowances are 8, 5, 6, 5, 6
and 8 minutes, and nothing models either. The per-screen windows are what
actually constrain a learner, which is why they came first. Both are listed
in section 11.

---

## 6. Timer durations used for Parts 1 to 6

All of them are in `src/features/exam-engine/listening-timing.ts`, with the
working written beside each one. Nothing reads a bare number out of a
component any more.

| Part | Questions | Screens | Window | Warning | Urgent | Source |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 8 | one question per screen | 30 s per question | 10 s | 5 s | published |
| 2 | 5 | one question per screen | 30 s per question | 10 s | 5 s | published |
| 3 | 6 | one question per screen | 30 s per question | 10 s | 5 s | published |
| 4 | 5 | all five on one screen | 210 s, 3.5 min | 60 s | 20 s | derived |
| 5 | 8 | all eight on one screen | 240 s, 4 min | 60 s | 20 s | derived |
| 6 | 6 | all six on one screen | 300 s, 5 min | 60 s | 20 s | derived |

### Why the Parts 4 to 6 numbers are labelled derived

Research document section 17.5 records that no source publishes a
per-screen window as a number. What is published is the per-part allowance,
and that includes the clip. So each of the three had to be worked out as
part total minus clip length:

- **Part 4:** about 5 minutes, minus a news clip of about 1.5 minutes,
  leaves about 3.5 minutes for 5 questions.
- **Part 5:** 6 minutes, minus a discussion video of about 2 minutes,
  leaves 4 minutes for 8 questions.
- **Part 6:** about 8 minutes, minus a report clip of about 3 minutes,
  leaves about 5 minutes for 6 questions.

Every one of them carries `source: "derived"` and its arithmetic in
`listening-timing.ts`, so nobody later reads them as sourced figures.

### Research document section 17.2, resolved

Part 5's part total was itself in dispute: the Listening Overview PDF says
6 minutes and the Listening Pro Study Pack says about 9 minutes. EXAM-15F
resolves it **in favour of 6 minutes**, on three grounds:

1. The overview PDF is the only source giving a per-part figure for every
   part in one consistent unit, which is what section 17.2 itself says to
   prefer until the conflict is settled.
2. The study pack's own strategy note says to allow roughly 30 seconds per
   question. Eight questions at 30 seconds is 4 minutes, and 4 minutes of
   answering plus the 1.5 to 2 minute video is 6 minutes, which is the
   overview PDF figure exactly. The 9 minute reading appears to include
   more than the part.
3. Taking 9 minutes would put Part 5 above Part 6, an 8 minute part with a
   3 minute clip, which no other source supports.

Part 5 is therefore the one derived window that two independent readings
agree on. Section 17.2 of the research document should be read alongside
this paragraph; the conflict is resolved for our purposes and the published
sources still disagree with each other.

### Why the long windows get their own thresholds

Ten seconds of amber and five of red are right for a 30 second question and
useless on a five minute screen, where they would arrive after 98 percent
of the window had already gone. The long windows warn at 60 seconds and
turn red at 20. Both thresholds travel with the duration rather than being
left to the generic defaults.

---

## 7. Media autoplay behaviour

On the full route, every media screen asks its clip to start when the
screen opens:

| Screen | Clip | Controls |
| --- | --- | --- |
| Listening instructional video | Toronto Academy walkthrough | kept, plus the skip control |
| Parts 1 and 3 conversation screens | conversation sections | kept |
| Parts 1 to 3 question screens | the spoken question | kept |
| Part 2 conversation screen | the conversation | kept |
| Part 4 media screen | news item | kept |
| Part 5 media screen | discussion video | kept |
| Part 6 media screen | report | kept |

The instructional video keeps its controls deliberately: it is
instructional, and a learner may well want to pause it or watch a step
again. Its skip control is unchanged.

### It is an attempt, never a promise

Browser autoplay policies refuse a clip with sound unless the page has
earned enough of a user gesture, and what counts differs between browsers
and can be switched off by the person using one. So both players call
`play()` when they mount and handle the refusal rather than assuming
success:

- `play()` resolves: the clip is running, and nothing extra is drawn.
- `play()` rejects: a short line appears under the controls, "This clip did
  not start on its own. Press play to begin." The controls are right above
  it and still work, so it is a pointer rather than an error.

The learner reaches every one of those screens by pressing Next, which is
the gesture the policy is looking for, so in practice most browsers allow
it. The fallback exists because some will not.

**No clip is muted to get around a policy.** Muting is the usual trick for
guaranteeing autoplay and it is worse than useless in a Listening test.

**No clip is downloaded and no Cloudinary URL changed.** No broken mapping
was found, so nothing needed correcting. `preload` stays at metadata.

The internal part routes pass nothing and behave as they always did:
autoplay is off by default on both players, so a development route does not
start playing at whoever opened it.

### Still not built

One time playback, no pause, no seek, and gating Next on a clip finishing.
The audit lists them as the largest remaining fidelity gap in Listening and
they are a ticket of their own: enforcing them means deciding what happens
to a learner whose connection drops mid clip. Section 11.

---

## 8. What happens when time expires

On the full route, when a window reaches zero:

- the flow advances, to the next question screen, the next part transition
  or the answer review, exactly as pressing Next would
- the answer map is untouched, so every answer already selected stays
  selected and is marked
- an unanswered question stays blank, is recorded as `unanswered`, and
  counts as not correct, which is the official rule that a blank earns
  nothing
- the reading in the top bar becomes a red "Time is up" for the moment
  before the screen changes, and the screen reader region says it once

What explicitly does not happen:

- no modal
- no browser alert or confirm
- no sound
- no flashing and no animation. The countdown changes colour at its
  thresholds and never blinks
- no page jump and no document scroll. The document cannot scroll at all
  inside the locked viewport
- no focus move
- no answer cleared or changed
- no submit, and nothing written to a database

The one visible movement is the screen changing, which is the same movement
Next produces.

On the six individual part routes nothing at all happens. No `onTimeExpire`
is passed there, so the reading reaches "Time is up" and the screen stays
put, which is the EXAM-15D behaviour and is what keeps those routes usable
for development.

---

## 9. What remains flexible in the individual part routes

`/dashboard/mock-tests/mock-test-1/listening/part-1` through `part-6` still
work by direct URL, are still unlinked from the dashboard, still carry
robots noindex, and still show their own answer review and practice score.

What they keep that the full route no longer has:

| Behaviour | Part routes | Full route |
| --- | --- | --- |
| Back | on every screen after the first | forward only, section 5 |
| Next before answering | blocked until answered | always available |
| Timer expiry | shows "Time is up", stays put | advances the flow |
| Media autoplay | off | on, section 7 |
| Screen chrome | `AppPageShell`, preview heading and notice | locked `ExamModeViewport` |

What they now share with the full route:

- the corrected Part 6 select control, because both routes render
  `ListeningViewpointsQuestionScreen`
- the neutral exam theme, because both use the shared frame recipes
- the corrected Parts 4 to 6 screen windows. Nothing enforces them on a
  part route, so a longer window costs a developer nothing, and having the
  same number in both places means the durations are checked every time
  somebody opens a part route

---

## 10. Review and score regression result

Checked against the full run after the changes. Nothing in the review or
score path was edited by this ticket.

- The answer review lists all **38** questions, in part order, 8 + 5 + 6 +
  5 + 8 + 6.
- The practice score reads **out of 38** and shows the six part breakdown.
- The estimated CELPIP Listening band still appears.
  `estimateListeningBand` refuses to return anything unless
  `totalQuestions === 38` and the key is complete, so the count and the key
  are checked by the code every run, not only by hand.
- `LISTENING_BAND_CHART` still reproduces the official chart row for row,
  overlaps included, and `formatListeningBandLabel` still renders an
  overlap as "Level 9 or 10-12" rather than picking one.
- The wording is unchanged and still says this is a Toronto Academy
  practice estimate: "This is a Toronto Academy practice result, not an
  official CELPIP score." No official CELPIP score and no CELPIP level is
  claimed anywhere.
- Part 6 marks exactly as before. The select stores the same option id the
  radio stored, and the key, the marking action and the key stripping are
  untouched.
- Answer keys still never reach the browser.
  `withoutListeningSectionAnswerKeys` strips all six parts on the server
  before the content crosses into the client component, and marking still
  happens in the route's `"use server"` action behind an auth check.

`npm run lint` passes with no errors or warnings. `npm run build` compiles,
type checks and generates all 28 routes.

---

## 11. Known intentional gaps

Carried forward, all deliberate:

- no database save. Answers live in React state for the length of the visit
  and a reload starts the section again
- no persisted timing history, and no record of which windows expired
- no admin panel yet. The content is still hand written TypeScript per
  part. That is ADMIN-00 and ADMIN-01, and the shape is in
  `docs/product/admin-mock-test-builder-blueprint.md`
- no full Mock Test 1 flow across Listening, Reading, Writing and Speaking
- no proctoring and no focus lock. The screen is locked visually, not
  proctored: there is no fullscreen request, no block on the browser back
  button, no block on tab switching, and a reload restarts both the run and
  every countdown. That is correct for a practice product
- browser autoplay can still be blocked, and the fallback prompt is the
  answer, section 7
- one time media playback is still not enforced. Clips can be replayed,
  paused and seeked, and Next does not wait for a clip to finish. This is
  the largest remaining fidelity gap in Listening
- no section level clock and no part level clock, section 5
- Part 5 remains source-based and diverges from the official-style sentence
  completion format, section 4
- no automated test file. The project has no test runner set up. The timing
  values in `listening-timing.ts` are plain data and the countdown
  arithmetic is pure and callable with a made up clock, so both are ready
  for one
- the Part 3 route notice still says "Question 1 has no recording yet",
  which stopped being true when the corrected source supplied the clip.
  Route notice copy was out of scope here and belongs with the ticket that
  rewrites every route notice once one time playback lands

---

## 12. Second QA corrections after browser test

The first pass was checked by reading the code and by running lint and
build. It was then opened in a browser, and that found things a build
cannot. This section records what the browser test reported, what was
actually wrong, and what changed. Everything above stays true; this section
corrects and extends it.

### 12.1 What the browser test reported

1. The full Listening route still showed the dashboard shell and sidebar.
2. The account pill and top app chrome were still visible.
3. The test was still embedded in the dashboard page area.
4. The route did not feel like locked exam mode.
5. Part 6 was a drop-down, which was correct.
6. Part 5 was a long normal question and radio list that did not feel like
   CELPIP exam UI.
7. The background still felt like a dashboard layout.
8. The score and review screen scrolled inside a narrow embedded panel with
   dashboard UI still visible.

### 12.2 What was actually wrong, checked in the browser

Two separate things, and only one of them was the bug that was reported.

**The route in the screenshot was an internal part route, not the full
test.** Opening `/dashboard/mock-tests/mock-test-1/listening/part-5`
reproduces every symptom exactly: the sidebar, the account pill reading the
signed in address, the breadcrumb trail of Dashboard / Details / Details,
the warm page background, the exam drawn as a panel inside the dashboard
content column, and the whole page scrolling. Opening the full route at
`/dashboard/mock-tests/mock-test-1/listening` at the same window size showed
none of it: the fixed overlay was covering the shell as EXAM-15B intended.

The six part routes look like that deliberately. They are internal
development routes, they keep their preview heading and their prototype
notice, and EXAM-15B recorded that as the point of them. They are also, less
helpfully, one URL segment away from the real test, which is how a QA pass
ends up screenshotting one and reporting the other.

**The full route was still drawing the test as a card.** This half of the
report was right and was not a route mix up. `examFrame.container` caps the
frame at `max-w-5xl` and centres it, and `examViewport.inner` put a gutter
around it, so on a wide monitor the test was a 1024 pixel column floating on
a grey field, at roughly the width and position of the dashboard content
column it had just replaced. It read as embedded because it was shaped like
the thing it replaced.

### 12.3 Exam viewport corrected

Both mechanisms are in place now, because covering chrome and not rendering
it are not the same thing.

**The dashboard shell no longer renders its chrome on an exam route.** New
files:

    src/features/navigation/exam-mode-routes.ts
    src/components/app/AppShellFrame.tsx

`AppShell` hands its four chrome pieces, the side nav, the top nav, the
breadcrumbs and the footer, to `AppShellFrame`, a client component that
reads the pathname and returns either the ordinary app frame or the page on
its own. `usePathname` resolves during the server render of a client
component, so the correct frame is in the first HTML the browser receives
and no chrome flashes before hydration. Every chrome piece stays a server
component, because they are passed in as elements rather than imported.

EXAM-15B chose to cover the chrome rather than teach the shell about exam
routes, to keep test engine rules out of the frame every signed in screen
shares. That was reasonable then and is the wrong call now: an overlay
leaves the sidebar mounted, focusable and readable by a screen reader, and
it only stays an overlay for as long as nothing up the tree creates a
containing block for a fixed element. The route is exam mode or it is not,
and one small module now says which.

The list holds exactly one route,
`/dashboard/mock-tests/mock-test-1/listening`, and matching is exact. The
six part routes are deliberately not in it, so they keep their dashboard
chrome and stay recognisable as development routes. Adding one is a one line
change if that decision is ever revisited.

**The viewport is full bleed.** `examViewport.inner` lost its padding and
its centring, the overlay went from `z-[60]` to `z-[100]`, and two rules in
`globals.css`, hung off `data-exam-viewport`, lift the frame's width cap and
drop its border and rounded corners inside the viewport only:

    [data-exam-viewport] [data-exam-frame] { max-width: none; }
    [data-exam-viewport] [data-exam-window] { border-width: 0; border-radius: 0; }

A descendant selector outranks a utility class, so the exam wins without
`!important` and without depending on stylesheet order. The same frame keeps
its card everywhere else, which is what the part routes want.

**Measured in the browser afterwards**, on the full route in a 1707 by 825
window:

| Check | Result |
| --- | --- |
| `aside` sidebar in the DOM | absent |
| Sticky app header with the account pill | absent |
| Breadcrumb trail | absent |
| App `main` element and footer | absent |
| Overlay position and z-index | `fixed`, `100` |
| Overlay size | 1707 by 825, the whole window |
| Exam frame max width | `none`, 1707 wide |
| Exam window border and radius | `0px`, `0px` |
| Document scrollHeight against clientHeight | 825 against 825, nothing to scroll |
| `body` overflow | `hidden` |

### 12.4 Score and review layout corrected

The same fix, not a separate change. The score screen was narrow because the
frame was capped and the review was scrolling inside that cap. With the cap
lifted the score screen uses the full exam canvas: the four readings sit in
one row rather than wrapping, the estimated band card and the part breakdown
table run the width of the canvas, and the bottom bar holding End Listening
section and Review answers stays at the foot of the window while the canvas
scrolls behind it.

Checked in the browser on a complete run:

- the answer review renders 38 rows across 6 tables, Parts 1 to 6 in order
- the score screen reads Total questions 38, Answered 8 of 38, Correct 4 of
  38, and a practice score percentage
- the estimated CELPIP Listening band appears, with "Estimated from 4
  correct answers out of 38"
- both screens carry the practice wording, "This is a Toronto Academy
  practice result, not an official CELPIP score" and "This is a Toronto
  Academy practice estimate, not an official CELPIP score"
- the part breakdown lists all six parts

### 12.5 Part 5 kept source-based, and restyled

**The decision in section 4 is unchanged.** Part 5 was not converted to
sentence completion or to a drop-down, and no wording was invented. All
eight items in the Mock Test 1 source are full interrogatives ending in a
question mark, so there is no blank for a select to sit in, and building one
would mean authoring content the source does not contain.

**What was wrong was the shape of the screen, not the control.** Eight
questions drawn as ruled rows, each with four options stacked in one column,
made a screen a learner scrolls the way they scroll an article. The question
list recipes were rewritten as boxed exam blocks:

- every question is a bordered box with a tinted header strip carrying its
  number and the question
- its four options sit in a two column grid from the small breakpoint up,
  falling back to one column on a narrow window
- a chosen option is a filled row in the accent wash rather than a slightly
  bolder rule, so what is answered is legible across a screen of 32 options
- the whole row stays the click target, with a hover wash to make that
  obvious

On the Part 5 screen six of the eight questions are now visible at once
where three and a half were before, and the screen reads as a form to work
through rather than a page to read.

The same recipes draw the Part 4 and Part 6 completion lists, so all three
one screen parts look like one screen type with two controls rather than two
unrelated screens. Files changed: `ListeningVideoQuestionList.tsx`, and the
`examListeningChoice` and `examListeningDropdown` recipes in
`exam-theme.ts`.

No Part 5 content, question id, option id or answer key was touched.

### 12.6 Part 6 preserved

Checked in the browser on both routes after the restyle.

On the full route, screen 51 of 54: six sentence stems each with a
drop-down, the instruction line "Choose the best way to complete each
statement from the drop-down menu", a five minute screen window, and no Back
button.

On `/dashboard/mock-tests/mock-test-1/listening/part-6`, screen 4 of 7: six
selects, five options each, which is the four answers plus the "Select
answer" placeholder, zero radio inputs, the same instruction line, a live
countdown, and Back available because it is a development route.

Scoring survived. A run answering all six Part 6 questions produced a Part 6
line in the breakdown reading 6 of 6 answered, marked against the unchanged
answer key.

### 12.7 Strict timing preserved

Confirmed in the browser on the full route, unchanged by this pass:

- the Part 5 question screen showed `Time remaining: 03:55` counting down
  from the four minute window, and Part 6 showed `04:57` from five minutes
- no Back button on any question screen, part intro, media screen or
  transition
- Back returns on the practice score screen, where it is labelled "Review
  answers", and on the end of section screen
- Next is available on a question screen with nothing answered
- unanswered questions reached the review as "No answer selected" with
  status "Unanswered" and scored zero, and the parts left blank read 0 of 8,
  0 of 5, 0 of 6 and 0 of 5 in the breakdown
- answers selected before moving on were still selected in the review
- no modal, alert, sound or flashing appeared at any point

### 12.8 No Reading was built

No Reading route, component, content file, type or timing entry was created
in this pass either. Nothing was written to a database, no migration was
created, no Supabase helper or auth code was touched, and no dependency was
installed.

### 12.9 Files added or changed in this pass

Created:

    src/features/navigation/exam-mode-routes.ts
    src/components/app/AppShellFrame.tsx

Changed:

    src/components/app/AppShell.tsx
    src/components/exam/ExamModeViewport.tsx
    src/components/exam/ExamShell.tsx
    src/components/exam/listening/ListeningVideoQuestionList.tsx
    src/features/exam-engine/exam-theme.ts
    src/app/globals.css
    docs/product/listening-format-strict-timing-polish.md

### 12.10 How to check it by hand

1. Sign in and open `/dashboard/mock-tests/mock-test-1/listening`. There
   must be no sidebar, no account pill, no breadcrumbs and no footer, and
   the exam must reach all four edges of the browser window. The browser's
   own address bar stays, which is expected.
2. Try to scroll the page with the wheel, a trackpad flick and the space
   bar. Nothing must move except the canvas between the two bars, and only
   when a screen is longer than it.
3. Press Next to the first Part 1 question. The top bar must read
   `Time remaining: 00:30` and count down, and there must be no Back button.
   Let it reach zero: the screen must advance on its own, with no dialog and
   no sound.
4. Reach Part 5. All eight questions must be boxed, with options in two
   columns, under one countdown of `04:00` for the screen.
5. Reach Part 6. Six sentence stems, each with a drop-down, under one
   countdown of `05:00`.
6. Finish the run. The review must list 38 questions across six tables, and
   the score must read out of 38 with the part breakdown, the estimated band
   and the practice wording. Both must use the full width of the window.
7. Open `/dashboard/mock-tests/mock-test-1/listening/part-1` through
   `part-6` by typing the URL. Each still shows the dashboard chrome and its
   internal preview heading on purpose, each still has Back, and each still
   ends in its own review and score.

---

## 13. How EXAM-16 Reading should start next

Listening is finished, so Reading can copy a settled model instead of
guessing at one.

**Confirm one thing first.** Research document section 17.4: our source for
automatic advance and no return to a previous part is a Listening study
pack, and we hold no equally direct source saying Reading behaves the same
way. The Reading Overview PDF publishing a per-part time table strongly
implies per-part windows, which is the shape Reading needs anyway. Confirm
before EXAM-16 enforces Reading timing, and look for a Reading Pro Study
Pack.

Then, in order:

1. **Build the Reading content files** under
   `src/features/exam-engine/mock-tests/mock-test-1/`, one per part, with
   the answer keys in them, the same shape the Listening part files use.
   Reading is 4 parts and 38 questions: 11, 8, 9 and 10.
2. **Add the Reading windows to a timing module** of its own, the way
   `listening-timing.ts` works, with the published per-part allowances of
   11, 9, 10 and 13 minutes and a `source` on every entry. Reading is timed
   per part rather than per question, so the window is one per part with
   the part id as its `screenKey`, and the timer has to be mounted above
   the screens that change inside it. `ExamCountdownTimer` and
   `useExamCountdown` need no change for that.
3. **Build the Reading screen types Listening does not have,** principally
   a passage beside a question set. `ExamTwoColumnLayout` and the
   `examTwoColumn` recipes are already there. The passage column will want
   its own internal scroll, which is the one place Reading differs from
   Listening under the fixed viewport: two scrolling regions on one screen
   rather than one.
4. **Build the part level prototype routes first,** under
   `/dashboard/mock-tests/mock-test-1/reading/part-N`, unlinked and
   noindex, flexible the way the Listening part routes are: Back on, Next
   ungated, no expiry enforcement. That is the development surface.
5. **Assemble the section flow,** with the keys stripped on the server by a
   Reading equivalent of `withoutListeningSectionAnswerKeys` and the
   marking done in an `actions.ts` beside the route. Never send a key to
   the browser.
6. **Only then add `/dashboard/mock-tests/mock-test-1/reading`,** rendering
   the flow inside `ExamModeViewport` with no page chrome, and add its
   dashboard card next to the Listening one. Copy the strict rules from
   `ListeningSectionPrototype`: forward only, `onTimeExpire` wired to the
   flow's own advance, and no answer gate on Next.

Two things Reading gets for free and should not rebuild: the neutral exam
theme, which lives in the shared recipes, and `ExamModeViewport`. If
Reading needs something the viewport does not do, change
`ExamModeViewport` so both sections get it, rather than adding a second
copy or a second scroll lock.

Reading is not started in this ticket. No Reading route, component,
content file or type was created.
