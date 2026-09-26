# Listening Part 2 prototype (EXAM-05)

Second Listening part built on real Mock Test 1 content. It covers
Listening Part 2 only: Listening to a Daily Life Conversation.

Ticket: `docs/tickets/EXAM-05-listening-part-2-prototype.md`
Shell: `docs/product/exam-engine-screen-shell.md` (EXAM-01)
Instruction screens: `docs/product/exam-engine-instruction-screens.md` (EXAM-02)
Part 1 prototype: `docs/product/listening-part-1-prototype.md` (EXAM-03)
Part 1 review and score: `docs/product/listening-part-1-review-score.md` (EXAM-04)
Content map: `docs/product/mock-test-1-content-map.md`
Asset list: `mock-tests/mock-test-1/extracted-links.md`

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route created

| Property | Value |
| --- | --- |
| Route | `/dashboard/mock-tests/mock-test-1/listening/part-2` |
| File | `src/app/dashboard/mock-tests/mock-test-1/listening/part-2/page.tsx` |
| Rendering | Server component, dynamic |
| Auth | Behind the dashboard layout guard, and the page calls `getUser` again close to the content |
| Indexing | `robots: { index: false, follow: false }` |
| Status | Internal preview, not a student facing mock test entry |

The route is a server component that checks the session, strips the
answer key from the content, and then renders the client prototype. It
touches no API route, no Supabase helper beyond the existing session
client, no service role, and writes nothing.

Dashboard link: `ExamShellPreviewLink` now carries a fourth card, titled
`Mock Test 1 Listening Part 2 Prototype`, marked `Internal preview` like
the other three.

## 2. Source content used

`mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`, Listening PART 02,
with the Cloudinary URLs cross checked against
`mock-tests/mock-test-1/extracted-links.md`. Nothing was downloaded and
nothing is re-hosted. All six media URLs appear verbatim in the source
document.

The content is typed and centralized in
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-2.ts`.

One change against the source text, deliberate and recorded in that file:

| Item | Source | Decision |
| --- | --- | --- |
| Question 4, option 1 | `She has never heard the name "Amir" before.` with curly quotation marks | Normalized to straight quotes, the same normalization EXAM-03 applied to the curly apostrophe in Part 1. Typography only, no wording changed |

Part 2 has no context image. The source document gives it a scenario
sentence and nothing else, so `scenario.imageUrl` is unset rather than
borrowing artwork from another part. The scenario screen renders the
sentence alone, which the shared component already supports.

Two source sentences are carried in the content instructions as written,
including `You will hear the question only once`. The prototype does not
enforce that yet. See section 9.

## 3. Screen sequence

Part 2 is a one section part, so `buildListeningFlow` produces nine
screens. No section break screen appears, because a break only sits
before a section that is not the first.

| # | Screen | Component | Notes |
| --- | --- | --- | --- |
| 1 | Part intro | `ListeningPartIntroScreen` | Part name, the three source instructions, and an intro card with the section and question counts |
| 2 | Scenario | `ListeningScenarioScreen` | `Instructions:` heading and the telephone conversation sentence. No image |
| 3 | Conversation audio | `ListeningAudioScreen` | One clip, captioned `About 1.5 to 2 minutes` |
| 4 | Question 1 | `ListeningQuestionScreen` | Question audio left, four radio options right |
| 5 | Question 2 | `ListeningQuestionScreen` | Same |
| 6 | Question 3 | `ListeningQuestionScreen` | Same |
| 7 | Question 4 | `ListeningQuestionScreen` | Same |
| 8 | Question 5 | `ListeningQuestionScreen` | Same |
| 9 | Completion | `ListeningPartCompleteScreen` | `Listening Part 2 complete`, the answered count, and a sentence about the review that is not built yet |

The top bar shows `Screen 4 of 9` and so on throughout, so the position
in the flow is always visible.

Components created or changed for this part:

| File | Change |
| --- | --- |
| `src/components/exam/listening/ListeningPartTwoPrototype.tsx` | New. Owns the screen index and the answer map |
| `src/components/exam/listening/ListeningPartCompleteScreen.tsx` | New. Completion screen for a part whose review and score are not built yet |
| `src/features/exam-engine/listening-flow.ts` | Added the `ending` option and `withoutListeningAnswerKey` |
| `src/features/exam-engine/listening-types.ts` | Added the `part-complete` screen kind |
| `src/features/exam-engine/listening-copy.ts` | Added the completion screen wording, the Part 2 preview card wording, and `formatListeningAnsweredMessage` |
| `src/components/exam/ExamShellPreviewLink.tsx` | Added the fourth preview card |

`ListeningPartIntroScreen`, `ListeningScenarioScreen`,
`ListeningAudioScreen`, `ListeningQuestionScreen` and
`ListeningAudioPlayer` were reused unchanged. Part 2 needed nothing from
them that Part 1 had not already established.

`ListeningPartTwoPrototype` is deliberately a separate component from
`ListeningPartOnePrototype` rather than a merge of the two. The parts end
differently: Part 1 closes on the answer review, the practice score and
the end of part screen, and Part 2 has none of those yet. One component
covering both would have to render screens its caller has to prove it
will never reach. They can be merged once Part 2 has the same ending,
which is EXAM-06's decision to make.

## 4. Audio links used

Six Cloudinary clips, all referenced and none downloaded.

| Slot | URL |
| --- | --- |
| Conversation | `https://res.cloudinary.com/dkvsshy7n/video/upload/v1785336642/Listening_Test_1_-_Part_2_-_Audio_jwpkne_vodvcl.mp3` |
| Question 1 | `https://res.cloudinary.com/dkvsshy7n/video/upload/v1785336686/Listening_Test_1_-_Part_2_-_Q1_y0tuae_rjgtdy.mp3` |
| Question 2 | `https://res.cloudinary.com/dkvsshy7n/video/upload/v1785336731/Listening_Test_1_-_Part_2_-_Q2_ivsxrc_uicql8.mp3` |
| Question 3 | `https://res.cloudinary.com/dkvsshy7n/video/upload/v1785336780/Listening_Test_1_-_Part_2_-_Q3_ssh5zr_nbeq1b.mp3` |
| Question 4 | `https://res.cloudinary.com/dkvsshy7n/video/upload/v1785336828/Listening_Test_1_-_Part_2_-_Q4_ueomg6_j0emyc.mp3` |
| Question 5 | `https://res.cloudinary.com/dkvsshy7n/video/upload/v1785338140/Listening_Test_1_-_Part_2_-_Q5_nvvqr5_pdb3vo.mp3` |

One image URL is held in the content object and rendered nowhere in this
ticket: the Part 2 answer sheet,
`https://res.cloudinary.com/dkvsshy7n/image/upload/v1785339061/Listening_Test_1_zAnswers_-_Part_2_dwrmfm_i03rbe.png`.
It is kept as the source a reviewer can check the transcribed key
against. It is a source document scan, not a public UI image, and no
screen in this ticket displays it.

Every player is `ListeningAudioPlayer`: native HTML `audio`, controls
visible, `preload="metadata"`, no autoplay, with fallback text when a clip
fails to load and a second fallback inside the element for a browser that
cannot play audio at all.

## 5. Question count

Five questions, four radio options each, one conversation section.

## 6. Answer key stored

The confirmed key is stored in
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-2.ts` as
the part level `answerKey` list. Every entry was matched to an existing
option by exact text. No option wording was changed to make a key fit and
nothing was guessed.

| Question | Correct answer | Option id |
| --- | --- | --- |
| 1 | a newspaper subscription | `listening-part-2-q1-a` |
| 2 | Manaz was a customer in the past. | `listening-part-2-q2-a` |
| 3 | suspicious | `listening-part-2-q3-b` |
| 4 | She would like to call him by his name. | `listening-part-2-q4-d` |
| 5 | a selection of articles | `listening-part-2-q5-c` |

`source` is `answer-image` on every entry, because each value was read off
the Part 2 answer sheet rather than out of the source document text.

The key is not shown anywhere. It is not shown on the question screens,
it is not shown on the completion screen, and it does not reach the
browser at all.

That last point is the one difference from Part 1 worth knowing about.
Part 1's key is entirely pending, so its route hands the content object
to the client whole and its own file records that the day the key lands
is the day that has to change. Part 2's key is complete, and the
prototype is a client component, which means a client component's props
are serialized into the page and readable by anyone who looks. So the
route calls `withoutListeningAnswerKey(listeningPart2)` on the server and
passes the stripped copy across the boundary. The helper removes the part
level `answerKey` list and any per question `correctOptionId`.

Stripping the key is not a substitute for scoring on the server. It keeps
the answers off the page for a prototype that does no marking. See
section 10.

## 7. What is interactive

- Next and Back move through all nine screens. Back is enabled from
  screen 2 onward, which the official-style flow would not allow, and is
  here so the sequence can be walked repeatedly during review
- Every audio player plays, pauses, seeks and replays
- Selecting a radio option stores the answer in local component state as
  `{ questionId: optionId }`
- Next is disabled on a question screen until an option is selected, and
  a line under the options says why
- Answers survive moving back and forward, because they are keyed by
  question id rather than by screen position
- The completion screen counts the answers from the same local state and
  offers Back to dashboard and a restart that clears the answers

Nothing is written anywhere. A page reload starts the part again with an
empty answer map.

## 8. What is intentionally not built

- Part 2 answer review screen
- Part 2 score screen
- Listening Part 3
- Listening Parts 4 to 6
- The full Listening section
- Reading, Writing, Speaking
- Any database save, and any Supabase migration
- Any change to the Speaking or Writing AI flows or to any scoring prompt
- Payment, live classes
- Official screenshots as UI images, and official CELPIP branding

No dependency was installed.

## 9. Known fidelity gaps

All intentional for now, all carried over from the Part 1 prototype
unless noted.

| Gap | Current behaviour | Official-style behaviour |
| --- | --- | --- |
| Autoplay | Nothing plays until the learner presses play | The clip plays on its own when the screen opens |
| One time playback | Every clip can be replayed freely | Each clip plays once |
| Next gating | Next is available while a clip is still playing | Next appears when the clip ends |
| Timer | `Time remaining: 30 seconds` is a fixed label on the question screens, shown in the muted state the shell reserves for a fixed reading. Nothing counts down | A real countdown per question, which advances the screen when it expires |
| Back | Enabled throughout | Not available inside a part |
| Persistence | Answers are held on the page and lost on reload | The attempt is stored |
| Result | No answer review and no score | Both exist |

The content instructions say `You will hear the question only once`,
because that is the source wording and the content file carries the
source. The prototype does not enforce it yet. The chrome copy in
`listening-copy.ts` deliberately avoids repeating that promise on the
audio screens themselves, which is the rule EXAM-03 set: a screen should
not claim a rule the screen does not keep.

`ListeningAudioPlayer` already takes `onEnded`, and `ListeningAudioScreen`
already takes `onAudioEnded` and `nextDisabled`. The ticket that adds one
time playback and Next gating has somewhere to hook into without
reworking either component.

## 10. How EXAM-06 should continue

EXAM-06 builds the Part 2 answer review and the Part 2 score.

The pieces already in place:

- The answer map is `{ questionId: optionId }`, held in
  `ListeningPartTwoPrototype`, which is the shape
  `buildListeningReviewRows` and `buildListeningScoreSummary` in
  `src/features/exam-engine/listening-score.ts` already read
- The Part 2 key is complete, so `hasCompleteAnswerKey` returns true for
  this part and a real practice score can be produced. Part 1 is still
  pending and its score is still withheld
- `ListeningAnswerReviewScreen`, `ListeningScoreScreen` and
  `ListeningPartEndScreen` exist from EXAM-04 and are part agnostic in
  layout
- `buildListeningFlow` takes `{ ending: "review" }`, which is the default,
  so switching Part 2 onto the Part 1 ending is one argument change plus
  the branches for the three extra screen kinds

Four things to decide before writing code:

1. **Where the marking happens.** The key must not reach the browser.
   `withoutListeningAnswerKey` keeps it off the page today, which also
   means the review rows and the score cannot be computed inside the
   client prototype the way Part 1 does it. Compute them on the server
   from the submitted answers, through a server action or a route
   handler, and send back rows and a summary rather than a key. The pure
   helpers in `listening-score.ts` run unchanged on the server, which is
   what they were written for.
2. **What Part 1 does about the same problem.** Part 1's route still
   passes its content whole, and that is only safe while its key is
   pending. When the Part 1 key is transcribed, that route has to move to
   the same pattern. Doing both parts in one pass is likely cheaper than
   doing them twice.
3. **The review copy.** `listening-review-copy.ts` names Listening Part 1
   in about a dozen strings, for example `reviewTitle`, `scoreTitle`,
   `endTitle` and `restartLabel`. Part 2 needs the same strings with a
   different number. Parameterize the part label rather than adding a
   second hardcoded set, otherwise Part 3 adds a third.
4. **Whether the two prototypes merge.** Once Part 2 has the Part 1
   ending, `ListeningPartOnePrototype` and `ListeningPartTwoPrototype`
   differ only in their content object. Merging them into one
   `ListeningPartPrototype` at that point removes the duplication. It
   would be premature now, while the endings differ.

When Part 2 moves onto the review ending, the `part-complete` screen kind
and `ListeningPartCompleteScreen` become unused unless Part 3 lands first
and needs the same interim ending. Delete them or keep them for Part 3
knowingly, rather than leaving them to rot.
