# Listening Part 3 prototype (EXAM-07)

Mock Test 1, Listening Part 3: Listening for Information, built as an
internal client side prototype.

The part runs end to end in the browser: the intro, the scenario, the
conversation clip, six question screens with local answer selection, and
a completion screen. Nothing is checked, nothing is scored, and nothing
is saved.

Ticket: `docs/tickets/EXAM-07-listening-part-3-prototype.md`
Previous part: `docs/product/listening-part-2-prototype.md`
Screen types: `docs/product/exam-engine-screen-types.md`

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route created

`/dashboard/mock-tests/mock-test-1/listening/part-3`

Source: `src/app/dashboard/mock-tests/mock-test-1/listening/part-3/page.tsx`

The route sits under `/dashboard`, so the layout auth guard covers it,
and the page calls `supabase.auth.getUser()` again close to the content
and redirects to `/login` without a session. Layouts do not re-render on
client navigation, which is why the check is repeated.

The page carries `robots: { index: false, follow: false }` and a standing
internal preview notice above the exam frame.

The content object is passed through `withoutListeningAnswerKey` on the
server before it reaches the client component. The Part 3 answer key is
complete, and a client component receives its props as serialized data,
so handing the key down would publish the answers to anyone who opens the
network panel. This is the same precaution the Part 2 route takes.

No API route, no service role, no Supabase write, no migration.

## 2. Source content used

`mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`, Listening PART 03,
with the Cloudinary URLs cross checked against
`mock-tests/mock-test-1/extracted-links.md`.

Loaded into `src/features/exam-engine/mock-tests/mock-test-1/listening-part-3.ts`
as a typed `ListeningPartContent`. No text was rewritten.

Three notes on the source, all recorded in comments in that file:

- The scenario sentence uses a curly apostrophe in "woman's". It is
  normalized to a straight apostrophe. Typography only, no wording
  changed. EXAM-03 and EXAM-05 made the same normalization in Parts 1
  and 2.
- The conversation clip is listed twice, on two different Cloudinary
  accounts. See section 4.
- Question 1 has no question clip anywhere in the document. See
  section 4.

Nothing was downloaded and nothing is re-hosted. This is licensed Toronto
Academy content, so every route that imports the content file has to stay
behind the dashboard auth guard.

## 3. Screen sequence

Ten screens, built by `buildListeningFlow(content, { ending: "complete" })`.

| # | Screen | Component | Type |
| --- | --- | --- | --- |
| 1 | Part intro | `ListeningPartIntroScreen` | 1 |
| 2 | Scenario | `ListeningScenarioScreen` | 3 |
| 3 | Conversation audio | `ListeningAudioScreen` | 4 |
| 4 | Question 1 | `ListeningQuestionScreen` | 6 |
| 5 | Question 2 | `ListeningQuestionScreen` | 6 |
| 6 | Question 3 | `ListeningQuestionScreen` | 6 |
| 7 | Question 4 | `ListeningQuestionScreen` | 6 |
| 8 | Question 5 | `ListeningQuestionScreen` | 6 |
| 9 | Question 6 | `ListeningQuestionScreen` | 6 |
| 10 | Part complete | `ListeningPartCompleteScreen` | - |

Part 3 is a one section part, so no section break screen appears. A break
only sits before a section that is not the first, which is why Part 1
gets two of them and Parts 2 and 3 get none.

The `"complete"` ending is the EXAM-05 ending: one completion screen, and
no answer review or practice score. Part 1 and Part 2 use the default
`"review"` ending instead, because theirs are built.

Screen order is derived from the content rather than typed out, so the
part is ten screens because it has one section and six questions, not
because ten is written down anywhere.

The intro and scenario copy come from the content object:

- intro: "You will hear a conversation followed by 6 questions.",
  "Listen to each question. You will hear the question only once.",
  "Choose the best answer to each question."
- scenario: "You will hear a conversation between a man and a woman who
  work at a university. The man, who is the woman's supervisor, has
  stopped to speak to the woman."

## 4. Audio links used

All Cloudinary, referenced and never downloaded.

| Slot | URL |
| --- | --- |
| Conversation | `https://res.cloudinary.com/dkvsshy7n/video/upload/v1785338301/Listening_Test_1_-_Part_3_-_Audio_nk6pmi_ugrx14.mp3` |
| Question 1 | none, see below |
| Question 2 | `https://res.cloudinary.com/dkvsshy7n/video/upload/v1785338355/Listening_Test_1_-_Part_3_-_Q2_jgb51x_kvkjvq.mp3` |
| Question 3 | `https://res.cloudinary.com/dkvsshy7n/video/upload/v1785338430/Listening_Test_1_-_Part_3_-_Q3_tm8ncz_ni6qao.mp3` |
| Question 4 | `https://res.cloudinary.com/dkvsshy7n/video/upload/v1785338482/Listening_Test_1_-_Part_3_-_Q4_cu3weu_k1cn63.mp3` |
| Question 5 | `https://res.cloudinary.com/dkvsshy7n/video/upload/v1785338528/Listening_Test_1_-_Part_3_-_Q5_pcbseb_ebj30k.mp3` |
| Question 6 | `https://res.cloudinary.com/dkvsshy7n/video/upload/v1785338595/Listening_Test_1_-_Part_3_-_Q6_stqqhq_c4twqn.mp3` |

The answer sheet image is stored on the content object as
`answerExplanationImageUrl` and is not rendered anywhere in this ticket:

`https://res.cloudinary.com/dkvsshy7n/image/upload/v1785339104/Listening_Test_1_zAnswers_-_Part_3_sqjvxw_qobj63.png`

### Which conversation clip, and why Question 1 has none

The source document lists the Part 3 conversation twice:

1. under the AUDIO heading, on the old Cloudinary account `ds1wvtjft`
2. under the Question 1 heading, on the current account `dkvsshy7n`

Both filenames end in the same asset name,
`Listening_Test_1_-_Part_3_-_Audio_nk6pmi`, so the second is a re-upload
of the same conversation and not a question clip with an odd name. The
current account is used, because every other Part 3 clip lives there and
`extracted-links.md` flags the old account as unconfirmed.

That leaves nothing for Question 1, and there is no `Part_3_-_Q1` file
anywhere in the document. This is risk 2 in
`docs/product/exam-engine-reference-audit.md` and it is a gap in the
source material, not a decision made here.

Question 1 therefore has no `audioUrl`, and its screen shows a notice in
the player's place saying the recording is missing and is added once it
is supplied. Pointing it at the conversation clip instead would play the
whole two and a half minute conversation in place of a one sentence
question, which is worse than saying nothing. The options and the answer
key for Question 1 are intact and come from the document as written.

To close the gap: add the clip URL as `audioUrl` on question
`listening-part-3-q1` in the content file. Nothing else has to change.

## 5. Question count

Six, all `single_choice_radio` with four options each, matching
`docs/product/mock-test-1-content-map.md`.

Question stems are spoken, not printed, in Parts 1 to 3, so no question
carries a `prompt`. The options are the only text on the answer panel
besides the question number and the instruction line.

## 6. Answer key stored

Stored, complete, and not shown anywhere in this ticket.

The key lives in `ANSWER_KEY` in
`src/features/exam-engine/mock-tests/mock-test-1/listening-part-3.ts` and
is attached to the content object as `answerKey`. Every entry has
`source: "answer-image"`, because each value was read off the Part 3
answer sheet rather than out of the source document text.

| Question | Correct option id | Option text |
| --- | --- | --- |
| 1 | `listening-part-3-q1-d` | He wants her to add a new task to her duties. |
| 2 | `listening-part-3-q2-a` | It is currently having financial difficulties. |
| 3 | `listening-part-3-q3-c` | a request for a room near a washroom |
| 4 | `listening-part-3-q4-d` | so he can send an invoice |
| 5 | `listening-part-3-q5-a` | contact her co-worker |
| 6 | `listening-part-3-q6-b` | confident |

Every value was matched to an existing option by exact text. No option
wording was changed to make a key fit, and nothing was guessed.

The key never reaches the browser. `withoutListeningAnswerKey` strips it
on the server in the route, so the client component renders the part
without ever holding a correct option.

## 7. What is interactive

- walking the ten screens with Next and Back
- playing the conversation clip, with the native control set: play,
  pause, seek, volume
- playing each question clip, on the five questions that have one
- selecting one option per question, by clicking anywhere on the row or
  by using the keyboard on the radio group
- Next stays disabled on a question screen until an option is selected,
  with "Select an answer to continue." under the options while it is
- changing a selection, including after going back to an earlier question
- the completion screen's answered count, for example "You answered 4 of
  6 questions."
- Restart Listening Part 3, which clears the answers and returns to
  screen 1
- Back to dashboard, a real link, so middle click and open in a new tab
  work

Answers are held as `{ questionId: optionId }` in local React state in
`ListeningPartThreePrototype`. They are keyed by question id rather than
by screen position, which is why moving back and forward preserves them,
and it is the shape the review and scoring helpers already read.

## 8. What is intentionally not built

Out of scope by the ticket:

- the Part 3 answer review screen
- the Part 3 practice score screen
- any database save, and any Supabase migration
- Listening Part 4, Parts 5 and 6, and the full Listening section
- Reading, Writing and Speaking
- payment and live classes

Untouched by this ticket:

- the Speaking AI logic
- the Writing AI logic
- the AI scoring prompts
- the API routes, the Supabase helpers, and auth
- `package.json`, no dependency was installed

No official screenshot is embedded and no official CELPIP branding is
copied. The prototype uses the EXAM-01 shell and the Toronto Academy
design tokens throughout.

## 9. Known fidelity gaps

All intentional for now.

| Gap | Official-style behaviour | Where it is |
| --- | --- | --- |
| Audio does not autoplay | Clips start on their own | `ListeningAudioPlayer` |
| Audio can be replayed | Every clip plays once | `ListeningAudioPlayer` |
| Next does not wait for the clip to finish | The learner cannot skip ahead | `ListeningAudioScreen`, `ListeningQuestionScreen` |
| Timer is static, "Time remaining: 30 seconds" | 30 seconds counts down per question | `ExamShell`, `timerState="muted"` |
| Back is enabled throughout | There is no going back | `ListeningPartThreePrototype` |
| Answers are not saved | The attempt is recorded | local React state only |
| No answer review, no score | Both exist | the flow ends on `part-complete` |
| Question 1 has no clip | Every question is spoken | see section 4 |

Two of these are copy decisions rather than layout ones. The intro
bullets keep "You will hear the question only once" because that sentence
is in the source document, but `listening-copy.ts` deliberately does not
print "You will hear the conversation only once" on the conversation
screen, since a replayable clip would make that a promise the screen does
not keep. It comes back with one time playback.

A page reload restarts the part and clears the answers. That is a
consequence of holding everything in local state and is not a bug.

## 10. How the next ticket should continue

The next ticket builds the Part 3 answer review and practice score, the
way EXAM-06 did for Part 2. The shortest correct path:

1. Keep the key on the server. Part 3 has a complete key and the
   prototype is a client component, so the comparison has to happen where
   the key lives. Copy the shape of
   `src/app/dashboard/mock-tests/mock-test-1/listening/part-2/actions.ts`:
   a server action that takes the answer map, runs the EXAM-04 scoring
   helpers against `listeningPart3`, and returns a `ListeningMarkedPart`.
   Do not remove the `withoutListeningAnswerKey` call in the route.
2. Switch the ending. Drop `{ ending: "complete" }` from the
   `buildListeningFlow` call in `ListeningPartThreePrototype`, which
   turns the last screen into the answer review, the practice score and
   the end of part screen. The flow goes from ten screens to twelve.
3. Reuse the screens. `ListeningAnswerReviewScreen`, `ListeningScoreScreen`
   and `ListeningPartEndScreen` all exist and are content driven. They
   need a Part 3 entry in `listening-review-copy.ts`, next to
   `listeningPartTwoReviewCopy`.
4. Reuse the marking screen. Part 2 shows a "Checking your answers"
   screen while the server marks, with a retry on failure. Part 3 needs
   the same, including the request id guard in
   `ListeningPartTwoPrototype` that drops a stale reply.
5. Decide what a missing clip means for a score. Question 1 can be
   answered and marked normally, since its options and key are intact,
   but a learner who never heard the question is guessing. Either mark it
   like any other question and say nothing, or leave it out of the
   percentage. Marking it normally is the simpler and more defensible
   choice while this is an internal preview.
6. Retire `part3CompleteHeading` and `part3RestartLabel` from
   `listening-copy.ts` once the completion screen is gone, unless the
   restart control moves onto the end of part screen.

Beyond the next ticket, and not blocked by it: one time playback, gating
Next on the clip finishing, and the live 30 second timer. All three are
engine wide and should land in one ticket across every Listening part
rather than part by part.
