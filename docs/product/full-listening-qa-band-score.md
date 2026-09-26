# Full Listening QA, exam lock polish, and estimated band (EXAM-15C)

House style: normal hyphens only, no long hyphens or em dashes.

Route this ticket is about:

    /dashboard/mock-tests/mock-test-1/listening

Three things were done: the Part 3 Question 1 audio screen was fixed, the
locked exam shell was tightened, and the CELPIP Listening score chart
already in the project was used to show an estimated practice band on the
final score screen.

The Part 3 Question 1 fix was then superseded inside this same ticket. On
2026-08-16 the source document `mock-tests/mock-test-1/Mock Test 1
-Sajinlinks.docx` was corrected and now carries the real Question 1
recording, so the workaround that had been built for it was removed and
Question 1 became an ordinary question. Sections 1 and 2 are written in
that order: what the problem was, and what replaced the workaround.

---

## 1. Part 3 Question 1 audio root cause, and its correction

The root cause was in the source practice test, not in the flow, and not in
either route. Nothing was mis-mapped and no field name was mismatched.

What the source document held for Part 3 when this ticket opened:

    AUDIO       https://res.cloudinary.com/ds1wvtjft/.../Listening_Test_1_-_Part_3_-_Audio_nk6pmi.mp3
    Question 1  https://res.cloudinary.com/dkvsshy7n/.../Listening_Test_1_-_Part_3_-_Audio_nk6pmi_ugrx14.mp3
    Question 2  https://res.cloudinary.com/dkvsshy7n/.../Listening_Test_1_-_Part_3_-_Q2_jgb51x_kvkjvq.mp3
    Question 3  ... Q3 ...
    Question 4  ... Q4 ...
    Question 5  ... Q5 ...
    Question 6  ... Q6 ...

So the link in the Question 1 slot did exist, and that was the confusing
part. It was not a question clip. Three things said so:

- its asset name was `Listening_Test_1_-_Part_3_-_Audio_nk6pmi`, the same
  asset name as the conversation clip on the AUDIO line above it, with the
  extra `_ugrx14` suffix Cloudinary adds on re-upload. It was the Part 3
  conversation, re-uploaded from the old `ds1wvtjft` account to the current
  `dkvsshy7n` one.
- every other question slot in the whole document pointed at a file named
  `Q<n>`. There was no `Part_3_-_Q1` file anywhere in the document.
- Part 3 is the only part whose conversation clip is labelled `AUDIO` at
  all, which is consistent with someone re-uploading that one clip and
  pasting it a row lower than they meant to.

`src/features/exam-engine/mock-tests/mock-test-1/listening-part-3.ts` had
already read it that way in EXAM-07. It used the current account copy as
`CONVERSATION_AUDIO_URL` for the conversation screen and left Question 1
with no `audioUrl`, and the question screen therefore drew its missing clip
notice. That was correct about the content and wrong as a screen: the
questions in Part 3 are spoken and never printed, so a learner on Question 1
had no recording at all and nothing to answer from except the four options.

That was risk 2 in `docs/product/exam-engine-reference-audit.md`. The real
fix was always the missing recording, which only the content owner could
supply, and it was supplied.

**The correction.** `mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`
was updated on 2026-08-16. The Part 3 Question 1 slot now reads:

    Question 1  https://res.cloudinary.com/dkvsshy7n/video/upload/v1786331722/Listening_Test_1_-_Part_3_-_Q1_eavvnb_in9hcf.mp3

It is a real question clip, on the same `dkvsshy7n` account as the rest of
Part 3 and named `Listening_Test_1_-_Part_3_-_Q1`, matching the `Q<n>`
naming every other question slot in the document uses. Risk 2 is closed in
the audit and `mock-tests/mock-test-1/extracted-links.md` now lists 19
question clips rather than 18.

One consequence worth recording. The corrected document no longer prints
the `_ugrx14` re-upload anywhere, because that URL only ever appeared in
the Question 1 slot it did not belong in. `CONVERSATION_AUDIO_URL` still
points at it, deliberately: it is the same asset as the AUDIO line, it is
on the account every other Part 3 clip is served from, and the AUDIO line's
own `ds1wvtjft` account is still flagged unconfirmed in
`extracted-links.md`. Swapping the conversation over to the old account
would trade a working clip for an unverified one. Revisit only if that
Cloudinary asset is actually removed.

Both routes behaved identically before and after, because both read the
same resolver, so this was never a full-route-only bug. The ticket
described it as one because that is the route a learner sees.

## 2. Part 3 audio fix, and the removal of the workaround

**What the workaround was.** Before the document was corrected, this ticket
added an opt in content field, `fallbackToConversationAudio?: boolean` on
`ListeningQuestion`, and a `conversation` member on the
`ListeningQuestionAudio` union. Part 3 Question 1 set the flag, and the
question screen then drew the section conversation captioned "Conversation
replay" under a notice saying the source practice test had no separate
recording for that question. It was labelled honestly and it was still a
workaround for a missing file.

**What replaced it.** The recording exists, so the workaround is gone
rather than left dormant. Removed:

- `fallbackToConversationAudio` from `ListeningQuestion` in
  `src/features/exam-engine/listening-types.ts`
- the `conversation` member of `ListeningQuestionAudio` in the same file
- the fallback branch in `resolveListeningQuestionAudio` in
  `src/features/exam-engine/listening-flow.ts`
- the replay branches in `ListeningQuestionScreen`, which set the left
  column label, the instruction row, the notice and the player caption
- the four `questionConversationFallback*` strings in
  `src/features/exam-engine/listening-copy.ts`

Nothing in the project sets or reads any of them now, which is why they
could be taken out rather than kept as dead paths.

**What was kept.** The parts of this layer that are generic survive,
because they were not built for Question 1:

- `resolveListeningQuestionAudio` stays. It is still the single place that
  decides what a question screen plays, and it is still what stops a part
  route and the full section route from disagreeing.
- The `ListeningQuestionAudio` union stays, now with two members,
  `question` and `missing`.
- The `missing` state and its two copy strings,
  `questionAudioMissingHeading` and `questionAudioMissingText`, stay. That
  is the honest answer for a real gap in a source practice test: a screen
  with nothing to play says so instead of showing an empty player or
  substituting another clip. No shipped content reaches it today. All 19
  spoken questions in Parts 1 to 3 have their own clip.

**Adapter.** `resolveListeningQuestionAudio(content, screen)` is now one
rule with no special cases: the question's own clip plays, and a question
with no clip is `missing`.

**Screen.** `ListeningQuestionScreen` draws whichever of the two states it
is given. Part 3 Question 1 renders exactly like Questions 2 to 6: left
column label "Question audio", instruction "Listen to the question.",
player captioned "Question audio 1", and no notice of any kind.

**Callers.** All four call sites pass the resolved value, unchanged:

- `ListeningPartOnePrototype`
- `ListeningPartTwoPrototype`
- `ListeningPartThreePrototype`
- `ListeningSectionPrototype`

**Content.** Part 3 Question 1 sets `audioUrl` to the corrected Q1 URL and
sets no flag. Question text, options and the answer key are untouched by
the correction; they were always read from the document text and the Part 3
answer sheet image, never from the audio.

Verified by transpiling the pure modules and resolving every Part 3
question screen. All six are `question`, none is a replay and none is
missing:

    Q1  question  Listening_Test_1_-_Part_3_-_Q1_eavvnb_in9hcf.mp3
    Q2  question  Listening_Test_1_-_Part_3_-_Q2_jgb51x_kvkjvq.mp3
    Q3  question  Listening_Test_1_-_Part_3_-_Q3_tm8ncz_ni6qao.mp3
    Q4  question  Listening_Test_1_-_Part_3_-_Q4_cu3weu_k1cn63.mp3
    Q5  question  Listening_Test_1_-_Part_3_-_Q5_pcbseb_ebj30k.mp3
    Q6  question  Listening_Test_1_-_Part_3_-_Q6_stqqhq_c4twqn.mp3

The Part 3 flow is still 12 screens: intro, scenario, conversation, six
questions, review, score, end of part. Removing the workaround changed no
screen order and no question count.

## 3. Full Listening route QA result

Checked by reading the flow and the screen components, and by `npm run lint`
and `npm run build`, both of which pass. The route sits behind the dashboard
auth guard and the marking action needs a real session, so no signed in
browser pass was possible from this environment. The manual steps a signed
in reviewer should walk are in section 12.

Retested after the 2026-08-16 document correction and the removal of the
conversation replay workaround. Both routes were re-checked, not just the
one that changed:

- **Full Listening route**, `/dashboard/mock-tests/mock-test-1/listening`.
  Re-resolved every question screen in the assembled flow. Part 3 Question 1
  now resolves to its own clip, Questions 2 to 6 are unchanged, and Parts 1
  and 2 are unchanged. The screen order, the 38 question count, the review
  tables and the score screen with the estimated band card are all as they
  were. Nothing outside Part 3 Question 1 moved.
- **Individual Part 3 route**,
  `/dashboard/mock-tests/mock-test-1/listening/part-3`. Still 12 screens and
  still runs end to end into its own review and score. Both routes read the
  same `resolveListeningQuestionAudio`, so Question 1 cannot present
  differently in one than in the other.

The lint and build pass was repeated after the removal, with no unused
imports or dead exports left behind. `examScreenBody` and `examInstruction`
were dropped from `ListeningQuestionScreen`'s imports, since only the replay
notice used them.

| Screen | State after this ticket |
| --- | --- |
| Listening instruction text screen | Unchanged, inside the locked shell |
| Listening instructional video screen | Unchanged, Skip still goes where Next goes |
| Part 1 intro, scenario with context image, 3 conversation clips, 2 section breaks, 8 question screens | Unchanged |
| Part 2 intro, scenario, conversation, 5 question screens | Unchanged |
| Part 3 Question 1 | Fixed. Own question clip, rendered like any other question |
| Part 3 Questions 2 to 6 | Unchanged, own question clips |
| Part 4 news audio and 5 dropdown questions on one screen | Unchanged, scrolls inside the canvas |
| Part 5 discussion video and 8 questions on one screen | Unchanged, scrolls inside the canvas |
| Part 6 report audio and 6 viewpoints questions on one screen | Unchanged, scrolls inside the canvas |
| Five part transitions | Unchanged, still carry no score |
| Full answer review, 38 questions in six tables | Unchanged |
| Full practice score | Estimated band card added between the summary and the part breakdown |
| End of Listening section | Unchanged |

Score is still out of 38 and is still marked on the server in `actions.ts`
beside the route, where the answer keys stay. The six part level routes are
unchanged and still show their own review and score.

New behaviour worth knowing about while testing: the exam frame now remounts
when the screen changes, so every screen opens at the top of the canvas and
a player from the previous screen is torn down instead of being reused. An
answer selected on a question is unaffected, because answers live in the
prototype's state and are keyed by question id.

## 4. Exam lock polish completed

EXAM-15B had already removed the page level chrome and covered the layout
level chrome. Re-checked and still true on this route:

- no breadcrumb trail
- no INTERNAL PREVIEW eyebrow
- no prototype or preview warning box
- no page heading or description above the exam
- no dashboard sidebar, sticky header or footer on screen
- nothing on the page but the exam

What this ticket added on top of that:

1. **The two bars cannot be squeezed.** `examBar.top` and `examBar.bottom`
   gained `shrink-0`. Inside the fixed viewport the frame is a flex column
   with a hard height, and a flex item shrinks below its content by default,
   so a tall screen could compress the title bar's padding and clip the Back
   and Next controls on a short window. The canvas absorbs the difference
   now, which is what `grow` and `min-h-0` on it are for.
2. **No scroll chaining and no rubber band.** `ExamModeViewport` sets
   `overscroll-behavior: none` on the document element and the body while it
   is mounted, alongside the `overflow: hidden` lock it already had, and puts
   both previous inline values back on unmount. `examViewport.overlay` gained
   `overscroll-none` and `examCanvas.region` gained `overscroll-contain`. A
   flick that runs past the end of a long question list can no longer bounce
   the document and flash a strip of the dashboard behind the exam.
3. **The canvas no longer inherits a scroll offset.** The canvas is the same
   DOM element on every screen, so pressing Next at the bottom of the Part 5
   question list used to land on the next screen already scrolled halfway
   down it. `ListeningSectionPrototype` now wraps the flow in one keyed
   fragment, keyed on the screen id, so each screen opens at the top. A
   fragment rather than a wrapper element, because the frame fills its parent
   by height and an extra element in that chain would need the same flex
   rules.

Scroll rules on the route, unchanged in intent and now enforced harder:

- the browser page never scrolls
- the top bar and the bottom bar never move
- exactly one region scrolls, `examCanvas.region`, and only when the screen
  is taller than the space the two bars leave
- the review tables keep their own horizontal scroll, so the frame never
  scrolls sideways

Not built, deliberately: no fullscreen API request, no focus containment, and
no attempt to block the browser back button, tab switching or a reload. The
screen is locked visually, it is not proctored. Focus can still be tabbed
into the dashboard behind the overlay, which is a real gap and belongs to a
proctoring ticket rather than to this one.

## 5. Media inventory checklist

Every media URL the full Listening route can play, and where it lives in the
content. Nothing was downloaded, nothing was re-hosted, and no network call
is made at build time. All URLs were read out of the content files and cross
checked against `mock-tests/mock-test-1/extracted-links.md`.

Route checked for all rows: `/dashboard/mock-tests/mock-test-1/listening`.
Each row is also reachable on that part's own route,
`/dashboard/mock-tests/mock-test-1/listening/part-N`.

| Part | Screen or question | Media type | URL exists in content | Notes |
| --- | --- | --- | --- | --- |
| Section | Instructional video screen | mp4, local | Yes | `/assets/instructional-thumbnails/2. Listening Instructional Video.mp4`, from the EXAM-02 registry |
| Part 1 | Scenario | png, Cloudinary | Yes | Dogsled tour context image |
| Part 1 | Conversation 1 | mp3, Cloudinary | Yes | |
| Part 1 | Conversation 2 | mp3, Cloudinary | Yes | |
| Part 1 | Conversation 3 | mp3, Cloudinary | Yes | |
| Part 1 | Questions 1 to 8 | mp3, Cloudinary | Yes, 8 clips | One per question |
| Part 2 | Conversation | mp3, Cloudinary | Yes | |
| Part 2 | Questions 1 to 5 | mp3, Cloudinary | Yes, 5 clips | One per question |
| Part 3 | Conversation | mp3, Cloudinary | Yes | Current account copy, `..._Audio_nk6pmi_ugrx14.mp3`. See section 1 on why this URL is kept |
| Part 3 | Question 1 | mp3, Cloudinary | Yes | Own clip, `..._Part_3_-_Q1_eavvnb_in9hcf.mp3`, from the corrected document |
| Part 3 | Questions 2 to 6 | mp3, Cloudinary | Yes, 5 clips | One per question |
| Part 4 | News item audio | mp3, Cloudinary | Yes | |
| Part 4 | Questions 1 to 5 | none | n/a | Printed on screen, no audio by design |
| Part 5 | Discussion video | mp4, Cloudinary | Yes | No poster image exists, so none is set |
| Part 5 | Questions 1 to 8 | none | n/a | Printed on screen, no audio by design |
| Part 6 | Report audio | mp3, Cloudinary | Yes | |
| Part 6 | Questions 1 to 6 | none | n/a | Printed on screen, no audio by design |

Counts: 1 local mp4, 1 Cloudinary mp4, 26 Cloudinary mp3 played as distinct
clips, 1 Cloudinary png. Counted from the six content files: 11 mp3 in Part
1, 6 in Part 2, 7 in Part 3, 1 in Part 4, none in Part 5, 1 in Part 6.

No clip is played twice on the route any more. It was 25 distinct mp3 plus
the Part 3 conversation replayed on Question 1 until the document
correction supplied the Q1 recording. The 21 printed here before was a
miscount and is corrected above.

Not rendered anywhere in the full section route: the six Cloudinary answer
sheet images. They are held on the part content objects as
`answerExplanationImageUrl` and are used by the part level review screens
only. The section review does not show them.

A development only media QA page was not built. The ticket allows a
documented checklist instead and this table is it, which keeps one more
unlinked internal route out of the app.

## 6. CELPIP band criteria source found

Searched `public/`, `docs/`, `_reference/`, `reference/` and `mock-tests/`
for CELPIP, band, score, scoring, descriptor, Listening, CLB and level.

The criteria the user placed are here:

    public/Overview and Scoring Descriptors/
      1. Listening/Listening - Overview.pdf
      1. Listening/Listening - Scoring.pdf
      2. Reading/Reading - Overview.pdf
      2. Reading/Reading - Scoring.pdf
      3. Writing/Writing - Overview.pdf
      3. Writing/Writing - PerformanceStandards.pdf
      3. Writing/Writing - ScoreDescriptors.pdf
      4. Speaking/Speaking - Overview.pdf
      4. Speaking/Speaking - PerformanceStandards.pdf
      4. Speaking/Speaking - ScoreDescriptors.pdf

The one file this ticket uses:

    public/Overview and Scoring Descriptors/1. Listening/Listening - Scoring.pdf

It is a one page chart with three columns: CELPIP Level, Listening score /38,
and Scoring Information. The Scoring Information column states that the
Listening test has 38 scored questions, that each correct answer receives one
point, that points are not deducted for incorrect answers, that there may be
one unscored part, and that the real level is calculated from the number of
points and the difficulty of the questions with score equating.

`1. Listening/Listening - Overview.pdf` is the part format and part content
summary. It confirms the six part shape and the 8, 5, 6, 5, 8, 6 question
counts this project already had, and carries no band information.

Two notes on these files. They were already inside `public/`, so they were
already publicly served before this ticket; nothing was moved into or out of
`public/` here, and no new link to them was added to any UI. No logo, wordmark
or brand colour from them is used in the product.

**This is the source for the Listening band estimate and it did not change.**
The document correction was to Part 3 Question 1's audio link only. The
estimated Listening band still comes from the project provided Listening
scoring criteria in `public/Overview and Scoring Descriptors/`, transcribed
exactly as printed and with no mapping invented anywhere. The corrected
audio link changes which clip plays on one screen; it does not touch the
score, the raw total of 38, or the band chart.

**The same source can carry Reading later.** `2. Reading/Reading -
Scoring.pdf` sits in the same public folder and is the Reading equivalent of
the chart used here, so a Reading band can be built from it the same way
when Reading is built. That is a note for a later ticket. No Reading band,
no Reading chart transcription and no Reading content was built in EXAM-15C.
See section 11.

## 7. Whether a raw score to band mapping exists

Yes, for Listening, out of 38. Transcribed into
`src/features/exam-engine/listening-band-score.ts` exactly as printed:

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

Two properties of the chart drove the implementation:

- **It is a chart out of 38.** Mock Test 1 Listening has exactly 38
  questions, which is the only reason an estimate is possible. A score out
  of any other total is not on this chart, so none is produced for it.
- **The rows overlap.** 30 to 33 is level 8 and 27 to 31 is level 7, so a raw
  31 sits on both. That is in the source chart, not a transcription mistake,
  and it follows from the chart's own note that a real level comes from points
  plus question difficulty. An estimate that picked one side of an overlap
  would invent a precision the chart does not have, so both levels are carried
  and printed.

**A per level Listening descriptor does not exist in the project.** Writing and
Speaking were each given a `ScoreDescriptors.pdf`; Listening was given an
Overview and a Scoring chart and nothing else. So no descriptor sentence is
shown next to the estimated band, and none was written here.
`ListeningBandEstimate.descriptor` exists, is unset, and is rendered when it
is set, so a later ticket that receives real Listening descriptors has
somewhere to put them.

Nothing else was invented. There is no CLB conversion in the project, so no
CLB level is shown anywhere.

## 8. Estimated band implementation

Files created:

    src/features/exam-engine/listening-band-score-types.ts
    src/features/exam-engine/listening-band-score.ts
    src/components/exam/listening/ListeningEstimatedBandCard.tsx

`estimateListeningBand(summary)` takes the marked section summary and returns
`ListeningBandEstimate | null`. It returns null, and the card is then left off
the screen entirely, whenever an estimate would not be supported by the chart:

- the answer key is incomplete, so there is no correct count to map
- the attempt is not out of 38, which is what keeps a part level score out of
  8 or 6 from ever being handed a band
- the correct count falls outside 0 to 38

Verified against the chart:

    correct  estimate
      0      Level M-2
      7      Level M-2 or 3
     10      Level 3
     12      Level 3 or 4
     18      Level 4 or 5
     21      Level 5
     25      Level 6
     28      Level 6 or 7
     31      Level 7 or 8
     34      Level 9
     35      Level 9 or 10-12
     38      Level 10-12

    incomplete key        null
    4 correct out of 6    null
    39 correct out of 38  null

`ListeningSectionScoreScreen` calls it and renders
`ListeningEstimatedBandCard` between the summary card and the part breakdown.
The card is the same bordered strip as the score summary: no seal, no ribbon,
no coloured band, nothing that could be mistaken for a score report. It shows
the label, the reading, the line it was estimated from, the source note, and
the practice estimate note.

The score screen otherwise still shows what it showed before: title
"Listening Practice Score", total questions 38, answered count, correct count,
percentage, the six part breakdown rows, the practice result note, the "End
Listening section" button and the "Review answers" control.

The estimate is derived from the marked summary, which already crossed from
the server. No answer key reaches the browser, and nothing about the band is
saved anywhere.

## 9. Exact wording used to avoid official score claims

On the score screen, verbatim:

- Label: `Estimated CELPIP Listening band`
- Reading: `Level 6`, or `Level 6 or 7` where the chart's ranges overlap
- Basis line: `Estimated from 25 correct answers out of 38.`
- Source note: `Estimated from the published CELPIP Listening score chart,
  which maps a Listening score out of 38 to a CELPIP level. A real CELPIP
  level also takes question difficulty into account, which a practice
  estimate cannot do.`
- Overlap note, added to the source note only when the reading covers two
  levels: `The score ranges on that chart overlap, so an estimate can cover
  two levels.`
- Required note: `This is a Toronto Academy practice estimate, not an
  official CELPIP score.`

The rest of the score and review screens keep their existing line, `This is a
Toronto Academy practice result, not an official CELPIP score.`

Not used anywhere: official CELPIP score, official CELPIP band, official
CELPIP level, official result, guaranteed band, final CELPIP result, your
CELPIP level. The word "estimate" or "estimated" appears in the label, the
basis line and the note.

On the Part 3 Question 1 screen, verbatim, and identical to Questions 2 to 6:

- Left column label: `Question audio`
- Instruction: `Listen to the question.`
- Player caption: `Question audio 1`
- No notice of any kind

The four replay strings that were here, `Listen to the conversation again.`,
`Conversation replay`, `This question has no separate recording` and its
notice text, were deleted from `listening-copy.ts` along with the branch
that rendered them. None of them appears anywhere in the product.

The missing clip strings, `This question has no audio yet` and its notice
text, are still in `listening-copy.ts` for a genuine future gap in a source
practice test. No screen in the project renders them, because all 19 spoken
questions in Parts 1 to 3 have their own clip.

## 10. What is intentionally not built

Still intentional after this ticket:

- media can be replayed
- media does not autoplay
- Next does not wait for media to finish
- timers are static, nothing counts down
- no database save for Listening attempts
- no persisted Listening score history, a reload starts the test again
- no full Mock Test 1 assembly across Listening, Reading, Writing and
  Speaking
- Reading has not started
- no Supabase migration, no service role call, no auth change
- no answer key on any question screen
- no payment and no live classes
- no fullscreen request, no focus containment, and no attempt to block the
  browser back button, tab switching or a reload
- no development only media QA route. Section 5 is the checklist instead
- no Listening band descriptor sentence, because the project has no per level
  Listening descriptor text
- no CLB mapping, because the project has no CLB conversion
- no band on a part level score screen. Only a section of 38 is on the chart
- no conversation replay on any question screen. The Part 3 Question 1
  workaround was removed once the corrected document supplied the real
  recording, so nothing in the project substitutes one clip for another
- no Reading band, no Reading chart transcription, no Reading content and no
  Reading route. `2. Reading/Reading - Scoring.pdf` is available in the same
  public folder for a later ticket and was not read into code here
- no database save, no Supabase migration, no new dependency, and no change
  to the Speaking or Writing AI flows

## 11. How EXAM-16 Reading should start next

The EXAM-15B guidance still holds: `ExamModeViewport` is section agnostic,
the height and scroll behaviour lives in the shared `examFrame`, `examBar`
and `examCanvas` recipes, and Reading gets the locked shell for free. Do not
add a second viewport or a second scroll lock.

What EXAM-15C adds to that plan:

1. Build the Reading content files under
   `src/features/exam-engine/mock-tests/mock-test-1/`, one per part, keys
   included, the same shape the Listening part files use. Reading answer keys
   are already present as text in the source document, unlike Listening's,
   which were images.
2. When a Reading question's media or passage is missing from the source,
   resolve it in the flow layer the way `resolveListeningQuestionAudio` does
   and let the screen say plainly that the source is short a file. Do not let
   a screen invent a stand in. Listening briefly carried an opt in
   `fallbackToConversationAudio` field for exactly one question and it was
   removed as soon as the real recording arrived, which is the pattern worth
   copying: a substitution is a temporary, labelled, content declared
   exception, never a default and never permanent.
3. Reading needs two scrolling regions on one screen, the passage and the
   question list, which is the one place it differs from Listening under the
   fixed viewport. Give each its own `overflow-y-auto overscroll-contain`
   inside the canvas rather than letting the canvas scroll the pair together.
4. Build the part level routes first, unlinked and noindex, then the section
   flow with the keys stripped on the server, then the assembled route inside
   `ExamModeViewport`.
5. For the Reading score screen, reuse the band pattern rather than copying
   it. The public Overview and Scoring Descriptors folder that supports the
   Listening band estimate supports Reading too:
   `public/Overview and Scoring Descriptors/2. Reading/Reading - Scoring.pdf`
   is the Reading equivalent of the chart this ticket used. Build a
   `reading-band-score.ts` beside `listening-band-score.ts` with its own
   chart, its own total, and the same rule: no estimate unless the chart
   covers the attempt, and no descriptor unless the project has one. Nothing
   about Reading was built in EXAM-15C, so that file does not exist yet and
   no Reading mapping has been read into code.
6. Keep the wording rules. Estimated practice band, never an official score,
   and the Toronto Academy practice estimate note on every screen that shows
   a number.

## 12. Manual browser test steps

Sign in first. The route is behind the dashboard auth guard and the marking
action needs a session.

1. Open `/dashboard` and follow the "Mock Test 1 - Listening Test" card.
2. Confirm the screen is the exam and nothing else: no breadcrumbs, no
   INTERNAL PREVIEW, no warning box, no heading, no sidebar or footer.
3. Try to scroll the page with the wheel, the trackpad and the space bar on
   the instruction screen. Nothing should move.
4. Walk to Part 3 Question 1. Confirm the player is captioned "Question
   audio 1", that the left column label reads "Question audio" and the
   instruction reads "Listen to the question.", that there is no notice and
   nothing on the screen mentions a conversation replay, and that the clip
   plays and is a short spoken question rather than the two and a half
   minute conversation.
5. Confirm Part 3 Questions 2 to 6 each show their own "Question audio N"
   player, and that Question 1 is indistinguishable from them.
6. On Part 5, scroll to the bottom of the eight question list. Confirm the top
   bar and the bottom bar stay put, that the page behind does not bounce, and
   that pressing Next lands on the next screen scrolled to the top.
7. Answer all 38 questions, walk to the end, and confirm the review lists 38
   rows and the score screen reads out of 38.
8. On the score screen, confirm the estimated band card sits between the
   summary and the part breakdown, that it says "Estimated CELPIP Listening
   band", and that it carries "This is a Toronto Academy practice estimate,
   not an official CELPIP score."
9. Open `/dashboard/mock-tests/mock-test-1/listening/part-3` directly and
   confirm the part route still runs end to end, that Question 1 shows the
   same "Question audio 1" player it shows on the full route, and that the
   part's own review and score still appear at the end.
