# Listening Part 1 prototype (EXAM-03)

First practice test prototype built on real Mock Test 1 content rather
than placeholder text. It covers Listening Part 1 only.

Ticket: `docs/tickets/EXAM-03-listening-part-1-prototype.md`
Shell: `docs/product/exam-engine-screen-shell.md` (EXAM-01)
Instruction screens: `docs/product/exam-engine-instruction-screens.md` (EXAM-02)
Content map: `docs/product/mock-test-1-content-map.md`
Asset list: `mock-tests/mock-test-1/extracted-links.md`

House style: normal hyphens only, no long hyphens or em dashes.

> Superseded in one place. EXAM-04 replaced screen 16, the completion
> placeholder, with three screens: the answer review, the practice score,
> and the end of part screen. The flow is 18 screens now, and screens 1 to
> 15 are exactly as described below. See
> `docs/product/listening-part-1-review-score.md`.

---

## 1. Route created

| Property | Value |
| --- | --- |
| Route | `/dashboard/mock-tests/mock-test-1/listening/part-1` |
| File | `src/app/dashboard/mock-tests/mock-test-1/listening/part-1/page.tsx` |
| Rendering | Server component, dynamic |
| Auth | Behind the dashboard layout guard, and the page calls `getUser` again close to the content |
| Indexing | `robots: { index: false, follow: false }` |
| Status | Internal preview, not a student facing mock test entry |

The route is a server component that checks the session and then renders
the client prototype. It touches no API route, no Supabase helper beyond
the existing session client, no service role, and writes nothing.

Dashboard link: `ExamShellPreviewLink` now carries a third card, titled
`Mock Test 1 Listening Part 1 Prototype`, marked `Internal preview` like
the other two.

## 2. Source content used

`mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`, Listening Part 01,
with the Cloudinary URLs cross checked against
`mock-tests/mock-test-1/extracted-links.md`. Nothing was downloaded and
nothing is re-hosted. All 12 media URLs appear verbatim in the source
document.

The content is typed and centralized in
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-1.ts`.

Three source oddities, handled deliberately and recorded in that file:

| Item | Source | Decision |
| --- | --- | --- |
| Question 1, option 4 | `to pay for a dogsled excursion222` | Trailing `222` dropped as a typing artefact |
| Question 4, option 4 | `She pulls the reigns.` | Spelling kept as written, because changing option wording changes the question |
| Question 8, option 4 | No full stop, unlike its three siblings | Kept as written, same reason |

Two wording changes against the source, both deliberate:

- The break line before section 3 reads `second` in the document. The
  author note beside it says third, and
  `mock-tests/mock-test-1/extracted-content-outline.md` records this as a
  copy and paste slip. The ordinal is generated in
  `listening-copy.ts`, so the third break reads third.
- `You will hear the conversation only once` and `You will hear it only
  once` are not printed anywhere in this prototype, because the clips can
  be replayed here. The sentence returns with one time playback.

No author note from the document is rendered. This is licensed Toronto
Academy content, so it is served only from the authenticated route.

## 3. Screen sequence

16 screens, built from the content by `buildListeningFlow` rather than
typed out, so a content change reorders the flow on its own.

| # | Screen | Component |
| --- | --- | --- |
| 1 | Part intro | `ListeningPartIntroScreen` |
| 2 | Scenario, text and image | `ListeningScenarioScreen` |
| 3 | Conversation section 1 | `ListeningAudioScreen` |
| 4 | Question 1 | `ListeningQuestionScreen` |
| 5 | Question 2 | `ListeningQuestionScreen` |
| 6 | Section break before section 2 | `ListeningSectionBreakScreen` |
| 7 | Conversation section 2 | `ListeningAudioScreen` |
| 8 | Question 3 | `ListeningQuestionScreen` |
| 9 | Question 4 | `ListeningQuestionScreen` |
| 10 | Question 5 | `ListeningQuestionScreen` |
| 11 | Section break before section 3 | `ListeningSectionBreakScreen` |
| 12 | Conversation section 3 | `ListeningAudioScreen` |
| 13 | Question 6 | `ListeningQuestionScreen` |
| 14 | Question 7 | `ListeningQuestionScreen` |
| 15 | Question 8 | `ListeningQuestionScreen` |
| 16 | Completion | Rendered by `ListeningPartOnePrototype` |

The top bar shows `Screen N of 16` on every screen, which exists for
internal review and is not official-style chrome.

### Layout notes

- Question screens use the EXAM-01 split: grey top bar with the static
  timer reading, question audio and its instruction on the left, light
  blue answer panel on the right, question number at the top of that
  panel, compact radio rows with a rule between them, blue Next in the
  top bar, Back in the bottom bar.
- Conversation, scenario and break screens are single column, and hide
  the timer.
- No dashboard card, badge or artwork appears inside the exam canvas.

## 4. Audio links used

All from `res.cloudinary.com/dkvsshy7n`, referenced and never downloaded.

### Conversation audio, 3 clips

| Section | URL |
| --- | --- |
| 1 | `/video/upload/v1785336094/Listening_Test_1_-_Part_1_-_Audio_1_xdk2ff_1_qiudsc.mp3` |
| 2 | `/video/upload/v1785336265/Listening_Test_1_-_Part_1_-_Audio_2_s8wx4a_rtwq2f.mp3` |
| 3 | `/video/upload/v1785336452/Listening_Test_1_-_Part_1_-_Audio_3_yju6z2_njlegx.mp3` |

### Question audio, 8 clips

| Question | URL |
| --- | --- |
| 1 | `/video/upload/v1785336148/Listening_Test_1_-_Part_1_-_Q1_v01ioo_eksyhv.mp3` |
| 2 | `/video/upload/v1785336210/Listening_Test_1_-_Part_1_-_Q2_bl7yyd_ykiqp0.mp3` |
| 3 | `/video/upload/v1785336315/Listening_Test_1_-_Part_1_-_Q3_fdfd7x_vi6auu.mp3` |
| 4 | `/video/upload/v1785336363/Listening_Test_1_-_Part_1_-_Q4_m9ehrp_fmajwg.mp3` |
| 5 | `/video/upload/v1785336402/Listening_Test_1_-_Part_1_-_Q5_vvpcht_trlrkl.mp3` |
| 6 | `/video/upload/v1785336498/Listening_Test_1_-_Part_1_-_Q6_ndylu9_ddyitt.mp3` |
| 7 | `/video/upload/v1785336547/Listening_Test_1_-_Part_1_-_Q7_viptu4_dy5yfb.mp3` |
| 8 | `/video/upload/v1785336586/Listening_Test_1_-_Part_1_-_Q8_ii7eql_q8g1mh.mp3` |

### Scenario image, 1 file

`/image/upload/v1785336047/Listening_Test_1_-_Part_1_-_1_m8gpqw_yf4nel.png`

The dogsled tour business context illustration from the source document.
It is rendered with a plain `img` element, not `next/image`, so this
ticket does not have to add `images.remotePatterns` to `next.config.ts`
and so licensed practice artwork is not routed through the Next image
optimizer. Alt text is stored beside the URL in the content file.

Cloudinary delivery from the app origin has not been re-confirmed in this
ticket. `mock-tests/mock-test-1/extracted-links.md` lists that check, and
the question of whether these assets should sit behind signed URLs, as
open items.

## 5. Question count

8 questions, 4 radio options each, 32 options in total. Every option
string matches the source document verbatim except the Question 1
artefact described in section 2.

Distribution: section 1 has questions 1 and 2, section 2 has questions 3
to 5, section 3 has questions 6 to 8.

No correct answer is stored. Every `correctOptionId` is unset, because
the Listening answer keys for Mock Test 1 exist only as PNG images and
are not transcribed yet. That is EXAM-C1, and it blocks EXAM-04. A
practical consequence: no answer key is serialized into the browser
payload by this route.

## 6. What is interactive

- Moving forward with Next and back with Back, across all 16 screens.
- Native audio playback on all 11 clips: play, pause, seek, volume, and
  replay, using the browser control set.
- Selecting one option per question. The whole row is the click target.
- Answers are held in local component state as `{ questionId: optionId }`
  and survive moving back and forward within the visit.
- Next is disabled on a question screen until an option is selected, and
  a short line under the options says why.
- The completion screen counts the answers actually selected.
- A clip that fails to load swaps the control bar for a readable message
  instead of a broken element.

Back is enabled throughout, which the official-style flow would not
allow. It is there so the sequence can be walked repeatedly during
review.

## 7. What is intentionally not built

Nothing below was started, stubbed against a database, or half wired.

- Listening Parts 2 to 6, and the full Listening section.
- Reading, Writing and Speaking screens.
- The result page and any score calculation.
- Answer review.
- Any database read or write. No attempt row, no answer row, no
  migration, no Supabase helper change.
- Any API route change, auth change, or service role call.
- Payment and live classes.
- Any change to the Speaking or Writing AI flows or scoring prompts.
- Any new dependency. The audio player is the native element.
- A student facing mock test entry point. The dashboard card is marked
  `Internal preview`.

No official screenshot is embedded anywhere, and no official CELPIP
branding is copied into the UI. The screens are Toronto Academy practice
chrome built in EXAM-01 and EXAM-02.

## 8. Known fidelity gaps

Intentional for this prototype, listed so the next ticket does not have
to rediscover them.

| Gap | Current behaviour | Official-style behaviour |
| --- | --- | --- |
| Autoplay | Clips never play on their own | The clip starts when the screen opens |
| Replay | Any clip can be replayed and seeked | Each clip plays once, with no seek |
| Next gating | Next is available while a clip is playing | Next is unavailable until the clip ends |
| Answer window timer | Static reading, `Time remaining: 30 seconds`, in the shell muted state | A real 30 second countdown that moves the screen on at zero |
| Section break | Learner presses Next to leave | A timed pause runs and moves on by itself |
| Back | Enabled on every screen | Not available once a screen is left |
| Answer storage | Local component state, lost on reload | Persisted to the attempt |
| Answer review | Not built | Review after the section |
| Scoring | Not built, and no answer key is stored | Auto scored |
| Progress | `Screen N of 16` in the top bar | Not part of the official-style chrome |

The static timer uses the shell `muted` state on purpose. `muted` is the
state EXAM-01 reserves for a fixed label rather than a live value, so the
reading does not look like a running clock while it is not one.

`ListeningAudioPlayer` and `ListeningAudioScreen` already accept
`onEnded` and `onAudioEnded`. Media gating can be added through those
props without reworking the components.

## 9. How EXAM-04 should continue

Order the work by what unblocks the most.

1. **EXAM-C1 first.** Transcribe the six Listening answer key images into
   structured data. Nothing can be reviewed or scored until the Part 1
   key exists. Load it into `correctOptionId` on each question in
   `listening-part-1.ts`, which is already typed for it.
2. **Keep the answer key off the client.** As soon as keys exist, the
   content object stops being safe to hand to a client component whole.
   Split it: send the questions and options to the browser, and keep the
   key on the server for review and scoring.
3. **Answer review screen.** The state shape is already what review
   needs, `{ questionId: optionId }`. Read it from
   `ListeningPartOnePrototype`, or lift it once the part becomes part of
   a longer attempt.
4. **Persistence.** Decide where an in progress attempt lives before
   adding more parts. The prototype loses answers on reload, which is
   fine for one part and not fine for a full test. This needs a schema
   decision and a migration, neither of which belongs in a UI ticket.
5. **Media fidelity, in this order:** gate Next on the clip ending, then
   one time playback, then autoplay on screen entry, then the real
   countdown. Each step is a smaller behaviour change than the one after
   it, and the props for the first two already exist.
6. **Then Parts 2 and 3.** They are the same screen types with a single
   conversation clip, so they should need content only. Parts 4 to 6 need
   screen type 7, the all questions on one screen dropdown layout, which
   does not exist yet. Part 5 needs the video screen from EXAM-02, and
   Part 3 needs the two open questions in
   `mock-tests/mock-test-1/extracted-links.md` resolved: the missing
   Question 1 audio, and which of its two section audio URLs is current.

Confirm the Listening question denominator before any score screen is
built. The content holds 38 Listening questions and the official score
screen shows 37, which is open item 6 in
`docs/product/mock-test-1-content-map.md`.

---

## Files

Created:

- `src/app/dashboard/mock-tests/mock-test-1/listening/part-1/page.tsx`
- `src/features/exam-engine/listening-types.ts`
- `src/features/exam-engine/listening-flow.ts`
- `src/features/exam-engine/listening-copy.ts`
- `src/features/exam-engine/mock-tests/mock-test-1/listening-part-1.ts`
- `src/components/exam/listening/ListeningPartIntroScreen.tsx`
- `src/components/exam/listening/ListeningScenarioScreen.tsx`
- `src/components/exam/listening/ListeningAudioScreen.tsx`
- `src/components/exam/listening/ListeningQuestionScreen.tsx`
- `src/components/exam/listening/ListeningSectionBreakScreen.tsx`
- `src/components/exam/listening/ListeningAudioPlayer.tsx`
- `src/components/exam/listening/ListeningPartOnePrototype.tsx`
- `docs/product/listening-part-1-prototype.md`

`ListeningAudioPlayer` is the one file beyond the ticket list. Both the
conversation screen and the question screen need a player with the same
load failure handling, so it is one component rather than two copies. It
mirrors `ExamVideoPlayer` from EXAM-02.

Changed:

- `src/features/exam-engine/exam-theme.ts`, two new class recipe blocks,
  `examAudio` and `examListening`. Existing recipes untouched.
- `src/components/exam/ExamShellPreviewLink.tsx`, third internal preview
  card.

No existing component behaviour was changed, and no EXAM-01 or EXAM-02
component was edited.
