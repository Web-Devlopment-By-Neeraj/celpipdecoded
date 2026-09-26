# Listening format audit and correction plan (EXAM-15E)

Our Mock Test 1 Listening build measured against the rules in
`docs/product/celpip-exam-rules-research.md`.

This is an audit. No UI was changed, no timing was changed, no answer key was
changed and no scoring logic was touched by EXAM-15E. Every gap below becomes
a line in a later ticket.

Audited 2026-08-28, against the tree at commit `a208d75`.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only.

---

## 1. What was audited

Seven routes:

| Route | File |
| --- | --- |
| Full Listening section | `src/app/dashboard/mock-tests/mock-test-1/listening/page.tsx` |
| Part 1 | `src/app/dashboard/mock-tests/mock-test-1/listening/part-1/page.tsx` |
| Part 2 | `src/app/dashboard/mock-tests/mock-test-1/listening/part-2/page.tsx` |
| Part 3 | `src/app/dashboard/mock-tests/mock-test-1/listening/part-3/page.tsx` |
| Part 4 | `src/app/dashboard/mock-tests/mock-test-1/listening/part-4/page.tsx` |
| Part 5 | `src/app/dashboard/mock-tests/mock-test-1/listening/part-5/page.tsx` |
| Part 6 | `src/app/dashboard/mock-tests/mock-test-1/listening/part-6/page.tsx` |

Plus the engine modules they use: `listening-flow.ts`,
`listening-dropdown-flow.ts`, `listening-video-flow.ts`,
`listening-viewpoints-flow.ts`, `listening-section-flow.ts`,
`listening-score.ts`, `listening-section-score.ts`,
`listening-band-score.ts`, `exam-timer-utils.ts`, and the shared screen
components under `src/components/exam/`.

Gap levels used:

- **okay** - matches the researched rule, or differs only in a way that is
  correct for a practice product.
- **minor polish** - the behaviour is right and the presentation or copy is
  not.
- **needs correction** - the behaviour differs from the researched rule in a
  way a learner would feel on test day.

---

## 2. Findings that apply to every part

These four are engine-level. Fixing them in one place fixes all six parts, so
they are stated once here rather than repeated in each section below.

### 2.1 Media is a standard player, not a one-time exam clip

**Current.** Every Listening media screen renders
`src/components/exam/listening/ListeningAudioPlayer.tsx`, which is a plain
`<audio controls>` element. Part 5 uses `ExamVideoPlayer` in the same shape.
The learner can play, pause, seek, and replay any clip as many times as they
like. Nothing starts on its own; `preload` defaults to `"metadata"` and there
is no `autoPlay`. `onEnded` exists as a prop but no route passes it, and
`nextDisabled` on `ListeningAudioScreen` and `ListeningVideoScreen` defaults to
`false`, so Next is available before the clip has played at all.

**Expected.** Audio clips begin automatically, are played one time only, and
cannot be paused. Rules 11, 12 and 13 in the research document, all from the
Listening Pro Study Pack.

**Gap level:** needs correction. This is the single largest fidelity gap in
the Listening build. A learner can currently replay a Part 6 report three
times and score a level they would not score on test day, which makes the
estimated practice band misleading rather than merely approximate.

The code is honest about it today. Every part route prints a standing notice
saying the audio can be replayed and the timer does not count down, and the
Part 4 content file records the same thing in its header. That is the right
interim behaviour, and it is not a substitute for the fix.

**Correction ticket:** EXAM-15F.

### 2.2 The countdown displays but never expires anything

**Current.** `ExamCountdownTimer` and `useExamCountdown` are complete and
working. The clock counts down from a real duration, moves through
`running`, `warning`, `urgent` and `expired`, and re-keys per screen. It is
rendered by all four question screens: `ListeningQuestionScreen`,
`ListeningDropdownQuestionScreen`, `ListeningVideoQuestionScreen` and
`ListeningViewpointsQuestionScreen`.

`useExamCountdown` accepts an `onExpire` callback and `ExamCountdownTimer`
forwards it. No screen in the codebase passes one. Searching the whole `src`
tree for `onExpire` returns only the timer module itself. So the clock reaches
00:00, shows the expired state, and the learner stays on the screen with the
question still answerable.

**Expected.** "When your time is up, the test will automatically move forward
to the next screen." Rule 14.

**Gap level:** needs correction.

The fix is small and the foundation is already there. It is passing the flow's
own advance function into the timer that already exists, plus deciding what an
expiry means when the learner has not answered: the answer stays blank, the
blank scores zero, and the flow advances.

**Correction ticket:** EXAM-15F.

### 2.3 Every timer is 30 seconds, including the multi-question screens

**Current.** `EXAM_QUESTION_TIMER_SECONDS` is 30 in
`src/features/exam-engine/exam-timer-utils.ts`. All four question screens
default `timerSeconds` to it. Nothing in `src/app` or `src/components` passes
a `timerSeconds` override anywhere.

For Parts 1 to 3 that is correct: 30 seconds per question is the published
rule.

For Parts 4, 5 and 6 it is wrong twice over. Those screens hold 5, 8 and 6
questions respectively and get one 30 second window for the whole set, which
is a sixth of what Part 5 needs. There is also no part-level or section-level
timer anywhere in the engine.

**Expected.** Parts 1 to 3 run a per-question window of 30 seconds. Parts 4 to
6 run one per-screen window sized to the whole set. Rules 7 and 8, and section
7 of the research document.

**Gap level:** needs correction.

Note for whoever writes EXAM-15F: the per-screen numbers are not published
directly. Section 17.5 of the research document explains that they have to be
derived as part total minus clip length, and section 17.2 records that the
Part 5 part total itself is in dispute between two official sources, 6 minutes
against 9 minutes. Resolve 17.2 before setting the Part 5 number.

Derived starting points, to be confirmed rather than treated as sourced:

| Part | Part total | Clip | Derived screen window | Questions |
| --- | --- | --- | --- | --- |
| Part 4 | about 5 min | about 1.5 min | about 3.5 min | 5 |
| Part 5 | 6 or 9 min, unresolved | 1.5 to 2 min | about 4 min at 30 s per question | 8 |
| Part 6 | about 8 min | about 3 min | about 5 min | 6 |

The Part 5 row is reconciled by the study pack's own strategy note, "Give
yourself roughly 30 seconds to answer each question", which for 8 questions is
4 minutes. 4 minutes of questions plus a 2 minute video is 6 minutes, which
matches the Listening Overview PDF. That reading is plausible and is not a
source, so 17.2 still needs confirming.

### 2.4 Back navigation crosses part boundaries

**Current.** `ListeningSectionPrototype` computes `showBack = screenIndex > 0`
and passes `goBack` to every screen in the run. `screenIndex` walks the whole
section flow, so the Back button on the first screen of Part 4 returns the
learner into Part 3, and from there they can walk back to Part 1. Answers
survive the move, because the section holds one answer map for the whole run.

**Expected.** The learner cannot return to a previous part of the test. Rule
in section 7 of the research document.

**Gap level:** needs correction.

Within a part, moving back is correct: "you can change your answer(s) as much
as you like until the time for that question or section is up". So this is not
"remove Back". It is "clamp Back to the current part", and in Parts 1 to 3
further to the current question window once 2.2 lands, since a question whose
30 seconds have expired is closed.

**Correction ticket:** EXAM-15F.

---

## 3. Part 1: Listening to Problem Solving

**Current route.** `/dashboard/mock-tests/mock-test-1/listening/part-1`, plus
the same part inside the full section run.

**Current media behavior.** Three conversation section clips, played on
`ListeningAudioScreen`, interleaved with question screens. Each question also
carries its own question audio, played on the question screen itself. All
replayable and pausable. See 2.1.

**Current question UI.** `ListeningQuestionScreen`. One question per screen, a
radio group of four options, question audio in the side column, the question
text not printed. Next is gated on an answer with `nextDisabled={!hasAnswer}`.

**Current timing behavior.** A 30 second countdown per question, keyed on the
question id. Displays only. See 2.2.

**Current scoring behavior.** `markListeningPartOne` in the route's
`actions.ts` marks server-side against the key in
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-1.ts`. The key
is stripped before render by `withoutListeningAnswerKey`. 1 point per correct
answer, no deduction, unanswered recorded as `unanswered` and counted as not
correct.

**Official-style expected behavior.** 8 questions, 3 audio sections of about 1
to 1.5 minutes, 2 to 3 questions after each section, questions heard not
printed, four printed choices, one question per screen, 30 seconds each,
answered in order, about 8 minutes for the part.

**Gap level:** minor polish for structure, needs correction for media and
timing.

The structure is right and is the best match to the official format in the
whole build. Three sections with questions after each, the question spoken and
only choices printed, one question per screen, radio options, forward-only
question order. That is exactly rule 7 plus the Part 1 audio shape.

Two smaller points:

- Next is gated on having answered. The official test lets a learner leave a
  question blank and move on, and a blank simply scores zero. Gating Next is
  friendlier but it is not the exam, and once 2.2 lands the gate becomes
  actively wrong: an expired timer has to advance whether or not an answer
  exists. Fold this into EXAM-15F.
- The source document's second author note says "You will hear the second
  section of the conversation shortly" where it should say third. Already
  recorded in `mock-tests/mock-test-1/extracted-content-outline.md`. Copy
  only.

**Recommended correction ticket:** EXAM-15F for media, timer expiry, back
clamping and the Next gate.

---

## 4. Part 2: Listening to a Daily Life Conversation

**Current route.** `/dashboard/mock-tests/mock-test-1/listening/part-2`.

**Current media behavior.** One conversation clip on `ListeningAudioScreen`,
then five question screens each with question audio. Replayable and pausable.
See 2.1.

**Current question UI.** `ListeningQuestionScreen`, same as Part 1. One
question per screen, four radio options, question spoken not printed.

**Current timing behavior.** 30 seconds per question, display only. See 2.2.

**Current scoring behavior.** `markListeningPartTwo`, same shape as Part 1.
Key stripped by `withoutListeningAnswerKey`.

**Official-style expected behavior.** 5 questions, one clip of about 1.5 to 2
minutes, questions heard, four printed choices, one per screen, 30 seconds
each, in order, about 5 minutes for the part.

**Gap level:** minor polish for structure, needs correction for media and
timing.

Structurally correct. The only part-specific note is that Part 2 is the
cleanest example of the Parts 1 to 3 shape in the build, and is the right
reference when EXAM-15F rewires the others.

**Recommended correction ticket:** EXAM-15F, engine-level items only.

---

## 5. Part 3: Listening for Information

**Current route.** `/dashboard/mock-tests/mock-test-1/listening/part-3`.

**Current media behavior.** As Part 2. One clip per question, question 1
included.

Question 1's audio used to be missing, and is not any more.
`listening-part-3.ts` records that a corrected source document supplied the
real Q1 clip on 2026-08-16, named `Listening_Test_1_-_Part_3_-_Q1` in line
with the Q2 to Q6 naming, and that the earlier workaround of captioning
question 1 as a conversation replay is gone.

The route's standing notice was not updated with it. `part-3/page.tsx` still
tells the learner "Question 1 has no recording yet", which is no longer true.
That is stale copy, not a content defect.

Separately, `mock-tests/mock-test-1/extracted-links.md` records that the Part
3 conversation audio exists on two Cloudinary accounts, an older `ds1wvtjft`
copy and a `dkvsshy7n` re-upload. The content file uses the re-upload,
deliberately, because every other Part 3 clip is served from that account.
Whether the old copy is still live is unconfirmed and does not affect the
build.

**Current question UI.** `ListeningQuestionScreen`, six questions, one per
screen, four radio options.

**Current timing behavior.** 30 seconds per question, display only. See 2.2.

**Current scoring behavior.** `markListeningPartThree`, same shape.

**Official-style expected behavior.** 6 questions, one clip of about 2 to 2.5
minutes, questions heard, four printed choices, one per screen, 30 seconds
each, in order, about 6 minutes for the part.

**Gap level:** minor polish for the stale notice, plus the engine-level items
that apply to every part.

Structurally Part 3 now matches Parts 1 and 2 exactly. The only part-specific
item is deleting the "Question 1 has no recording yet" sentence from the route
notice, which is a one-line copy fix.

This is a good argument for the notices being generated from the content
rather than typed per route. A route that describes its own known gaps in
hand-written prose will drift from the content every time the content is
fixed. The blueprint document handles this by making known-gap text a field on
a part rather than copy in a page.

**Recommended correction ticket:** EXAM-15F, including the stale notice
deletion.

---

## 6. Part 4: Listening to a News Item

This is the part the ticket asks to confirm first.

**Current route.** `/dashboard/mock-tests/mock-test-1/listening/part-4`.

**Current media behavior.** One news clip on `ListeningAudioScreen`,
replayable and pausable. There is no question audio anywhere in this part,
which is correct. See 2.1 for the replay gap.

**Current question UI.** `ListeningDropdownQuestionScreen` rendering
`ListeningDropdownQuestionList`. All five questions on one screen. Each is an
incomplete statement with a `<select>` where the blank falls. The statement is
stored split around the blank as `textBefore` and `textAfter` on
`ListeningDropdownQuestion`, so the screen draws the blank rather than parsing
a placeholder out of a sentence. Four options per question. Next is gated on
`allAnswered`.

**Current timing behavior.** One 30 second countdown for the whole five
question screen, keyed on the screen. Display only. Wrong duration, see 2.3.

**Current scoring behavior.** `markListeningPartFour` marks server-side
against the key in `listening-part-4.ts`, stripped before render by
`withoutListeningDropdownAnswerKey`. All five key entries are sourced
`answer-image`, read off the Part 4 answer screenshot.

**Official-style expected behavior.** 5 sentence completion questions, all on
one screen, questions and four choices both printed, one time allowance for
the screen, answerable in any order, one speaker, one clip of about 1.5
minutes, about 5 minutes for the part.

### Does our dropdown UI match the source and the official format?

Yes, on both counts, and the source is unambiguous.

The source document is explicit. `mock-tests/mock-test-1/Mock Test 1
-Sajinlinks.docx`, Listening PART 04, carries the drop-down instruction twice:

> Choose the best way to complete each statement from the drop-down menu.

in the part intro, and again immediately above the question list:

> Choose the best way to complete each statement from the drop-down menu (  ).

And all five items in the source really are sentence stems ending in a blank,
not questions:

> One of the magician's tricks involved \_\_\_\_\_\_\_\_\_\_\_
> Before giving the magician money, Patricia \_\_\_\_\_\_\_\_\_\_\_
> Patricia noticed that the new bill \_\_\_\_\_\_\_\_\_\_\_
> Patricia knew about counterfeit from \_\_\_\_\_\_\_\_\_\_\_
> The magician was in trouble because he \_\_\_\_\_\_\_\_\_\_\_

Each has exactly four options. So the drop-down control is supported by the
source file directly, and the sentence completion shape matches rule 8 in the
research document. This part was built correctly.

**Gap level:** okay for question UI. Needs correction for media and timing,
both engine-level.

Part 4 is the reference implementation for the Parts 4 to 6 format. EXAM-15F
should bring Parts 5 and 6 toward it rather than the other way around.

**Recommended correction ticket:** EXAM-15F, engine-level items only. No
question UI change.

---

## 7. Part 5: Listening to a Discussion

**Current route.** `/dashboard/mock-tests/mock-test-1/listening/part-5`.

**Current media behavior.** One discussion video on `ListeningVideoScreen`.
Replayable, pausable, and Next does not wait for it to finish. The route says
so in its standing notice. See 2.1.

**Current question UI.** `ListeningVideoQuestionScreen` rendering
`ListeningVideoQuestionList`. All eight questions on one screen, each a whole
printed question with a radio group of four options. The content type
`ListeningVideoQuestion` has a required `prompt` field and no `textBefore` or
`textAfter`, so this part cannot express a sentence stem at all as currently
typed.

**Current timing behavior.** One 30 second countdown for eight questions.
Display only. Badly undersized, see 2.3.

**Current scoring behavior.** `markListeningPartFive`, key in
`listening-part-5.ts`, stripped by `withoutListeningVideoAnswerKey`.

**Official-style expected behavior per the study pack.** Sentence completion
questions, all on one screen, four choices, one screen window, any order. Rule
8.

### Should Part 5 be converted to sentence completion?

**No, not for Mock Test 1.** The source file does not support it, and
converting would mean rewriting content that came from the source test.

The evidence is direct. The source document's Part 5 intro says:

> Choose the best way to answer each question.

and all eight items in the source are whole questions, not stems:

> What aspect of the fundraiser are the three colleagues debating?
> Why are the three colleagues planning a fundraiser?
> What stage are the three colleagues at in their planning?
> What is Eric pleased about?
> Which statement is true about a traditional silent auction?
> Why does Marie dislike the change that Isabella suggested?
> Why does Isabella dislike traditional silent auctions?
> How will the group's indecision be resolved?

Not one of them ends in a blank. Every one is a full interrogative with a
question mark.

The source does also carry the line "Choose the best way to complete each
statement from the drop-down menu (  )." immediately above the question list.
That single line is a copy and paste artefact: it appears verbatim above the
question list in Parts 4, 5 and 6 alike, and in Part 5 it contradicts both the
part's own intro line and all eight of its items. `docs/product/mock-test-1-content-map.md`
reached this conclusion during EXAM-11 and the code comment in
`src/features/exam-engine/listening-video-types.ts` records the reasoning. The
audit confirms it: the artefact reading is correct.

So there are two defensible positions, and they point the same way for this
ticket:

1. Our Part 5 content is faithful to our source test. Radio buttons on whole
   questions is the right rendering for the content we actually hold.
2. The official study pack describes Parts 4 to 6 as sentence completion, so
   an official Part 5 would be stems. Our source test appears to diverge from
   the current official format here.

Rewriting eight source questions into stems to satisfy position 2 would mean
inventing content, which this ticket forbids and which would put our answer
key at risk. The correct response is to record the divergence, keep Part 5
rendering what the source says, and make the engine able to express both.

**What EXAM-15F should actually do for Part 5:**

- Do not rewrite the eight questions.
- Do not convert the radio group to a dropdown for this content. A dropdown
  in the middle of a full interrogative has nowhere to sit.
- Do make the Parts 4 to 6 screen family able to render either shape from
  data, so a future test whose Part 5 is written as stems needs no new
  component. Today Part 4, Part 5 and Part 6 have three separate content
  types, three flows and three screen families for what the official format
  describes as one format with one control.
- Do fix the screen timer, the video one-time playback, and back clamping.
- Do flag in the Mock Test 2 authoring notes that Part 5 should be written as
  sentence stems, to match the current official format.

**Gap level:** okay for question UI given our source. Needs correction for
media, timing and back clamping. Needs correction at the engine level for the
three-way duplication that makes the format unrepresentable in one place.

**Recommended correction ticket:** EXAM-15F.

---

## 8. Part 6: Listening for Viewpoints

**Current route.** `/dashboard/mock-tests/mock-test-1/listening/part-6`.

**Current media behavior.** One report clip on `ListeningViewpointsScreen`.
Replayable, pausable, Next does not wait. See 2.1.

**Current question UI.** `ListeningViewpointsQuestionScreen` rendering
`ListeningViewpointsQuestionList`. All six questions on one screen. The
content type `ListeningViewpointsQuestion` stores each item as `textBefore`
and `textAfter` around a blank, exactly like the Part 4 dropdown type. But the
screen renders a **radio group**, not a select.

**Current timing behavior.** One 30 second countdown for six questions.
Display only. Undersized, see 2.3.

**Current scoring behavior.** `markListeningPartSix`, key in
`listening-part-6.ts`, stripped by `withoutListeningViewpointsAnswerKey`.

**Official-style expected behavior.** Sentence completion, all on one screen,
four choices, one screen window, any order, one speaker, one clip of about 3
minutes, about 8 minutes for the part.

### Should Part 6 be converted to sentence completion or select style?

**Yes. This one is a genuine mismatch, and both the source file and the
official format agree against the current UI.**

The source document is as explicit for Part 6 as it is for Part 4. The part
intro says:

> Choose the best way to answer each question from the drop-down menu.

and the line above the question list says:

> Choose the best way to complete each statement from the drop-down menu (  ).

Unlike Part 5, this is not contradicted by the items, because all six items
are sentence stems ending in a blank:

> Nelson has requested that city council \_\_\_\_\_\_\_\_\_\_
> According to the mother of two, high-density apartment buildings \_\_\_\_\_\_\_\_\_\_
> Stanley Creek \_\_\_\_\_\_\_\_\_\_\_
> Nelson Development Company envisions a \_\_\_\_\_\_\_\_\_\_\_
> The city councilor believes that \_\_\_\_\_\_\_\_\_\_\_
> If city council approves Nelson's current proposal, \_\_\_\_\_\_\_\_\_\_\_

Both source instruction lines say drop-down menu. All six items are stems.
Four options each. The official study pack says Parts 4 to 6 are sentence
completion. Everything points one way.

The code already knows this. The header of
`src/features/exam-engine/listening-viewpoints-types.ts` says so directly:

> The Mock Test 1 document instructs this part with "Choose the best way to
> complete each statement from the drop-down menu", and unlike Part 5 that is
> not a copy and paste artefact: the six items really are sentence stems.
> EXAM-13 still renders radio options, because the ticket asks for them, so
> the wording that reaches the screen drops the drop-down clause rather than
> promising a control that is not there.

So EXAM-13 shipped radio buttons knowingly, because its own ticket specified
them, and dropped the drop-down clause from the learner-facing copy to avoid
promising a control that was not there. That was the right call at the time.
It leaves a part whose data is already in the correct sentence completion
shape being drawn with the wrong control, and whose instruction copy has been
weakened to match the wrong control.

**What EXAM-15F should do for Part 6:**

- Convert the Part 6 question screen to the select control that Part 4 already
  uses. The content needs no change at all: `ListeningViewpointsQuestion`
  already carries `textBefore` and `textAfter`, so the data is ready.
- Restore the drop-down clause to the Part 6 instruction copy once the control
  is real.
- Preferably, retire `ListeningViewpointsQuestionScreen` and
  `ListeningViewpointsQuestionList` in favour of the Part 4 screen family,
  since after the conversion the two are the same screen. The separate
  viewpoints content type can stay if it is still carrying its own media
  shape; the duplicated question screen should not.

**Gap level:** needs correction, for the question UI specifically, and for
media, timing and back clamping along with everything else.

Part 6 is the highest-value single fix in this document, because it is the
only part where the correction is unambiguous, fully supported by the source,
and cheap: the data is already right.

**Recommended correction ticket:** EXAM-15F.

---

## 9. Full Listening section route

**Current route.** `/dashboard/mock-tests/mock-test-1/listening`.

**Current media behavior.** Each part's own media screens, played through the
same shared components, with the same replay and pause behaviour. See 2.1.
Adds a section instruction screen and a shared Listening instructional video
before Part 1, from `getInstructionalVideoAsset("listening")`.

**Current question UI.** Delegates to the four part screen families through
`ListeningSectionPrototype`, driven by
`mockTest1ListeningSection` in
`src/features/exam-engine/mock-tests/mock-test-1/full-listening-section.ts`.
That file assembles all six parts with a `kind` discriminator of `sections`,
`sections`, `sections`, `dropdown`, `video`, `viewpoints`.

Rendered inside `ExamModeViewport`, which is the locked exam shell, unlike the
individual part routes which render inside `AppPageShell` with a prototype
notice.

**Current timing behavior.** Per-question and per-screen countdowns as in the
parts. No section-level clock at all. No part-level clock. Display only.

**Current scoring behavior.** `markListeningSection` marks all six parts
server-side and returns a section review plus a section score. The estimated
band comes from `estimateListeningBand` in `listening-band-score.ts`, which
requires `totalQuestions === 38` and a complete key before it will return
anything.

`LISTENING_BAND_CHART` reproduces the official Listening chart row for row,
including the overlapping rows, and `formatListeningBandLabel` renders an
overlap as "Level 9 or 10-12" rather than choosing one. This is correct and
matches the research document, section 14.

**Official-style expected behavior.** Six parts run in order, 38 questions,
46-55 minutes, per-part windows, no return to a previous part, automatic
advance on expiry, one-time media.

**Gap level:** okay for structure and scoring. Needs correction for media,
timing and back clamping.

The section assembly is genuinely good. All six parts in order, 38 questions,
one answer map, one server marking pass, key never sent to the browser, band
estimate refusing to produce a number when the key is incomplete or the count
is not 38. The wording on the score screens uses "practice" and "estimate"
throughout and does not claim an official CELPIP score, which satisfies the
wording rules in section 16 of the research document.

Two section-level gaps beyond the four in section 2:

- **No section clock.** The official section runs 46-55 minutes as a whole. We
  have no clock above the part level, so a learner has no sense of section
  pace. Lower priority than the per-part timers, because the per-part windows
  are what actually constrain the test.
- **No part-level clock.** Between the per-question window and the section
  total sits the per-part allowance from the Listening Overview PDF, 8, 5, 6,
  5, 6 and 8 minutes. Nothing models it. Worth adding when the timer types in
  the blueprint document are implemented, since a Parts 1 to 3 part window is
  what makes the per-question windows add up.

**Recommended correction ticket:** EXAM-15F for the shared items, and the
section-level and part-level clocks with it if scope allows. If it does not,
they can follow as EXAM-15G without blocking Reading.

---

## 10. Summary table

| Part | Question UI | Media | Timing | Scoring | Overall gap |
| --- | --- | --- | --- | --- | --- |
| Full section | okay | needs correction | needs correction | okay | needs correction |
| Part 1 | okay | needs correction | needs correction | okay | needs correction |
| Part 2 | okay | needs correction | needs correction | okay | needs correction |
| Part 3 | okay | needs correction, plus stale notice copy | needs correction | okay | needs correction |
| Part 4 | okay, dropdown confirmed correct | needs correction | needs correction | okay | needs correction |
| Part 5 | okay for our source, diverges from official format | needs correction | needs correction | okay | needs correction |
| Part 6 | needs correction, radio should be select | needs correction | needs correction | okay | needs correction |

What is already right and should not be disturbed:

- Answer keys never reach the browser. Every route strips its key with a
  `without...AnswerKey` helper before render, and every route marks
  server-side in a `"use server"` action behind an auth check.
- Scoring is 1 point per correct answer with no deduction, and an unanswered
  question is recorded as `unanswered` and counted as not correct, which
  matches the official rule that a blank earns nothing.
- The band chart matches the official chart exactly, overlaps included, and
  refuses to produce an estimate from an incomplete key.
- Learner-facing copy consistently says practice and estimate, never official
  CELPIP score.
- The four content types are separate rather than one type with half its
  fields unset, and every content file documents its source and its known
  gaps in its header. That discipline is why this audit was possible at all.

---

## 11. What EXAM-15F should contain

Drawn from the findings above, in the order they should be done.

1. **Part 6 question UI to select.** Data is already correct. Restore the
   drop-down clause to the instruction copy. Retire the duplicated viewpoints
   question screen in favour of the Part 4 screen family.
2. **Timer expiry advances the flow.** Pass `onExpire` from each flow into the
   countdown that already renders. Remove the Next gates that block advance on
   an unanswered question, since an expiry must advance regardless.
3. **Per-screen timer durations for Parts 4 to 6.** Resolve research document
   section 17.2 first. Record each duration with its source or with the fact
   that it was derived.
4. **Back clamped to the current part.** Within a part, keep it. Across parts,
   remove it.
5. **One-time media.** Autoplay on mount, no pause, no seek, no replay,
   advance gated on the clip finishing. Update every route's standing notice
   once the behaviour is real, and remove the lines that are no longer true.
6. **Stale route copy.** Delete "Question 1 has no recording yet" from the
   Part 3 route notice, and revise every route notice once items 2 and 5 make
   the replay and timer sentences untrue.
7. **Part-level and section-level clocks**, if scope allows.

Out of scope for EXAM-15F and tracked separately:

- Anything about Reading.
- Any move of Listening content into a database, which is ADMIN-00 and
  ADMIN-01.

---

## 12. Recommended next tickets

1. `EXAM-15F` - Listening Part 4-6 Format and Strict Timing Correction
2. `EXAM-16` - Reading Part 1 Prototype
3. `EXAM-17` - Reading Part 1 Review and Score
4. `READING-FULL` - Full Reading Section Flow and Estimated Band Score
5. `ADMIN-00` - Admin Mock Test Builder Database Blueprint
6. `ADMIN-01` - Admin Mock Test Builder MVP

EXAM-15F should land before EXAM-16. Reading Part 1 will copy whatever timing
and navigation model Listening ends up with, so it is cheaper to fix Listening
first than to build Reading against a model that is about to change.

None of these tickets are created by EXAM-15E. The sequence is documented
only.
