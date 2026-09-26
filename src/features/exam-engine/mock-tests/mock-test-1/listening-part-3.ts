// Mock Test 1, Listening Part 3: Listening for Information (EXAM-07).
//
// Source: mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx, Listening
// PART 03, with the Cloudinary URLs cross checked against
// mock-tests/mock-test-1/extracted-links.md. Nothing was downloaded and
// nothing is re-hosted. Every clip is served straight from Cloudinary.
//
// This is licensed Toronto Academy content. Every route that imports this
// file must sit behind the dashboard auth guard.
//
// Part 3 is a one section part, like Part 2: a single conversation, then
// six questions. Part 1 splits its conversation into three sections and
// so fills sections with three entries. Here there is one, which is why
// the flow produces no section break screens.
//
// Two notes on the source material, both deliberate:
//
// - The scenario sentence in the document wraps "woman's" in a curly
//   apostrophe. It is normalized to a straight apostrophe here, the same
//   normalization EXAM-03 applied to the Part 1 option "They don't accept
//   credit cards." and EXAM-05 applied to the curly quotation marks in
//   the Part 2 option about the name "Amir". Typography only. No wording
//   changed.
// - The conversation clip is served from the current Cloudinary account,
//   which is not the account the document's AUDIO line points at. See
//   CONVERSATION_AUDIO_URL below.
//
// Question 1 used to be the third note here. The source document was
// corrected on 2026-08-16 and now carries a real Q1 recording, so that
// question is an ordinary question again and the EXAM-15C conversation
// replay workaround is gone. See the note on Q1_AUDIO_URL below.
//
// The answer key is confirmed and complete, which means this file must
// never be handed to the browser whole. See the note on ANSWER_KEY.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ListeningPartContent } from "@/features/exam-engine/listening-types";
import type { ListeningAnswerKeyEntry } from "@/features/exam-engine/listening-review-types";

// Answer key for the whole part, one entry per question, in order.
//
// source is "answer-image" on every entry because each value was read off
// the Part 3 answer sheet rather than out of the source document text.
// The option text is repeated in a trailing comment so the id can be
// checked against the question below without scrolling, and so a later
// edit to an option cannot quietly move an answer.
//
// Every value below was matched to an existing option by exact text. No
// option wording was changed to make a key fit, and nothing was guessed.
//
// The key is complete, so shipping it to the browser would hand a learner
// the answers. The Part 3 route strips it with withoutListeningAnswerKey
// before rendering, the same way the Part 2 route does. EXAM-08 kept that
// and marked answers where the key lives: markListeningPartThree in
// src/app/dashboard/mock-tests/mock-test-1/listening/part-3/actions.ts
// compares on the server and returns only the finished review rows and
// score summary. Nothing here is rendered on a question screen. See
// docs/product/listening-part-3-review-score.md section 3.
//
// EXAM-08 re-checked all six entries against the answer texts in the
// ticket and changed none of them. Every id below is the option whose
// text matches the confirmed answer exactly.
const ANSWER_KEY: ListeningAnswerKeyEntry[] = [
  // He wants her to add a new task to her duties.
  { questionId: "listening-part-3-q1", correctOptionId: "listening-part-3-q1-d", source: "answer-image" },
  // It is currently having financial difficulties.
  { questionId: "listening-part-3-q2", correctOptionId: "listening-part-3-q2-a", source: "answer-image" },
  // a request for a room near a washroom
  { questionId: "listening-part-3-q3", correctOptionId: "listening-part-3-q3-c", source: "answer-image" },
  // so he can send an invoice
  { questionId: "listening-part-3-q4", correctOptionId: "listening-part-3-q4-d", source: "answer-image" },
  // contact her co-worker
  { questionId: "listening-part-3-q5", correctOptionId: "listening-part-3-q5-a", source: "answer-image" },
  // confident
  { questionId: "listening-part-3-q6", correctOptionId: "listening-part-3-q6-b", source: "answer-image" },
];

const AUDIO_BASE = "https://res.cloudinary.com/dkvsshy7n/video/upload";
const IMAGE_BASE = "https://res.cloudinary.com/dkvsshy7n/image/upload";

// The conversation clip, and the one content decision in this file worth
// reading before changing it.
//
// The document that EXAM-07 read listed the Part 3 conversation twice:
//
//   1. under the AUDIO heading, on the old Cloudinary account ds1wvtjft
//   2. under the Question 1 heading, on the current account dkvsshy7n
//
// Both filenames ended in the same asset name, Listening_Test_1_-_Part_3_
// -_Audio_nk6pmi, so the second was a re-upload of the same conversation
// and not a question clip that happened to be named oddly. The current
// account copy is what is used here, because every other Part 3 clip
// lives there and mock-tests/mock-test-1/extracted-links.md flags the old
// account as unconfirmed.
//
// The corrected document no longer carries that second copy: the Question
// 1 slot now holds the real Q1 recording, which is the whole point of the
// correction. The current account url is kept anyway rather than swapped
// for the old account url on the AUDIO line, because it is the same
// asset, it is the account every other clip in this part is served from,
// and it is recorded in extracted-links.md as the confirmed copy. Swap it
// only if that Cloudinary asset is actually removed.
const CONVERSATION_AUDIO_URL = `${AUDIO_BASE}/v1785338301/Listening_Test_1_-_Part_3_-_Audio_nk6pmi_ugrx14.mp3`;

// Question 1's own recording, supplied in the corrected source document on
// 2026-08-16 and read from the Question 1 slot of Listening PART 03.
//
// It is a real question clip, not another copy of the conversation: the
// asset name is Listening_Test_1_-_Part_3_-_Q1, matching the Q2 to Q6
// naming this part already used, and it sits on the current dkvsshy7n
// account with the rest of them. Before this correction that slot held the
// conversation re-upload, which is why EXAM-15C had to caption Question 1
// as a conversation replay. Nothing about that workaround is left.
const Q1_AUDIO_URL = `${AUDIO_BASE}/v1786331722/Listening_Test_1_-_Part_3_-_Q1_eavvnb_in9hcf.mp3`;

export const listeningPart3: ListeningPartContent = {
  testId: "mock-test-1",
  sectionId: "listening-part-3",
  title: "Practice Test 1 - Listening Part 3: Listening for Information",
  partTitle: "Listening for Information",
  subtitle:
    "Read the following information before this part of the practice test begins.",
  instructions: [
    "You will hear a conversation followed by 6 questions.",
    "Listen to each question. You will hear the question only once.",
    "Choose the best answer to each question.",
  ],
  // No context image for this part. The source document gives Part 3 a
  // scenario paragraph and nothing else, so imageUrl stays unset rather
  // than borrowing artwork from another part.
  scenario: {
    text: "You will hear a conversation between a man and a woman who work at a university. The man, who is the woman's supervisor, has stopped to speak to the woman.",
  },
  answerKey: ANSWER_KEY,
  // Answer sheet for Part 3, from
  // mock-tests/mock-test-1/extracted-links.md. Referenced from Cloudinary
  // and never downloaded. The key above covers the answers, so this is
  // held for the review ticket as the source a reviewer can check the key
  // against. Nothing in this ticket renders it.
  answerExplanationImageUrl: `${IMAGE_BASE}/v1785339104/Listening_Test_1_zAnswers_-_Part_3_sqjvxw_qobj63.png`,
  answerExplanationImageAlt:
    "Answer sheet for Listening Part 3, listing the correct answer for each of the six questions.",
  sections: [
    {
      id: "listening-part-3-section-1",
      conversationAudioUrl: CONVERSATION_AUDIO_URL,
      // Running time as the source document states it, not measured.
      durationLabel: "About 2 to 2.5 minutes",
      questions: [
        {
          id: "listening-part-3-q1",
          number: 1,
          // An ordinary question clip since the source document was
          // corrected. This closes risk 2 in
          // docs/product/exam-engine-reference-audit.md, which was the
          // missing Q1 recording, and it retires the EXAM-15C
          // fallbackToConversationAudio workaround: the field is gone from
          // this question and from ListeningQuestion, so nothing replays
          // the conversation on a question screen any more.
          //
          // The options and the answer key below are untouched by the
          // correction. They were always read from the document text and
          // the Part 3 answer sheet, never from the audio.
          audioUrl: Q1_AUDIO_URL,
          options: [
            {
              id: "listening-part-3-q1-a",
              text: "He wants her to replace another employee.",
            },
            {
              id: "listening-part-3-q1-b",
              text: "He wants her to organize the classroom renovations.",
            },
            {
              id: "listening-part-3-q1-c",
              text: "He wants her to bring a package to someone in Finance.",
            },
            {
              id: "listening-part-3-q1-d",
              text: "He wants her to add a new task to her duties.",
            },
          ],
        },
        {
          id: "listening-part-3-q2",
          number: 2,
          audioUrl: `${AUDIO_BASE}/v1785338355/Listening_Test_1_-_Part_3_-_Q2_jgb51x_kvkjvq.mp3`,
          options: [
            {
              id: "listening-part-3-q2-a",
              text: "It is currently having financial difficulties.",
            },
            {
              id: "listening-part-3-q2-b",
              text: "It makes a lot of money renting rooms.",
            },
            {
              id: "listening-part-3-q2-c",
              text: "It recently purchased new booking software.",
            },
            {
              id: "listening-part-3-q2-d",
              text: "It holds regular first aid courses for students.",
            },
          ],
        },
        {
          id: "listening-part-3-q3",
          number: 3,
          audioUrl: `${AUDIO_BASE}/v1785338430/Listening_Test_1_-_Part_3_-_Q3_tm8ncz_ni6qao.mp3`,
          options: [
            {
              id: "listening-part-3-q3-a",
              text: "a request for more than one room",
            },
            {
              id: "listening-part-3-q3-b",
              text: "a refusal to pay the rental fee",
            },
            {
              id: "listening-part-3-q3-c",
              text: "a request for a room near a washroom",
            },
            {
              id: "listening-part-3-q3-d",
              text: "a complaint about the room sizes",
            },
          ],
        },
        {
          id: "listening-part-3-q4",
          number: 4,
          audioUrl: `${AUDIO_BASE}/v1785338482/Listening_Test_1_-_Part_3_-_Q4_cu3weu_k1cn63.mp3`,
          options: [
            { id: "listening-part-3-q4-a", text: "so he can prepare the room" },
            {
              id: "listening-part-3-q4-b",
              text: "so he can reschedule the classes",
            },
            {
              id: "listening-part-3-q4-c",
              text: "so he can confirm the booking",
            },
            { id: "listening-part-3-q4-d", text: "so he can send an invoice" },
          ],
        },
        {
          id: "listening-part-3-q5",
          number: 5,
          audioUrl: `${AUDIO_BASE}/v1785338528/Listening_Test_1_-_Part_3_-_Q5_pcbseb_ebj30k.mp3`,
          options: [
            { id: "listening-part-3-q5-a", text: "contact her co-worker" },
            { id: "listening-part-3-q5-b", text: "call the Community Centre" },
            { id: "listening-part-3-q5-c", text: "offer an alternate date" },
            {
              id: "listening-part-3-q5-d",
              text: "decline the booking request",
            },
          ],
        },
        {
          id: "listening-part-3-q6",
          number: 6,
          audioUrl: `${AUDIO_BASE}/v1785338595/Listening_Test_1_-_Part_3_-_Q6_stqqhq_c4twqn.mp3`,
          options: [
            { id: "listening-part-3-q6-a", text: "confused" },
            { id: "listening-part-3-q6-b", text: "confident" },
            { id: "listening-part-3-q6-c", text: "angry" },
            { id: "listening-part-3-q6-d", text: "surprised" },
          ],
        },
      ],
    },
  ],
};
