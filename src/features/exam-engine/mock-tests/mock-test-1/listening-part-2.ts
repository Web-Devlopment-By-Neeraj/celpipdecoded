// Mock Test 1, Listening Part 2: Listening to a Daily Life Conversation
// (EXAM-05).
//
// Source: mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx, Listening
// PART 02, with the Cloudinary URLs cross checked against
// mock-tests/mock-test-1/extracted-links.md. Nothing was downloaded and
// nothing is re-hosted. All six clips are served straight from Cloudinary.
//
// This is licensed Toronto Academy content. Every route that imports this
// file must sit behind the dashboard auth guard.
//
// Part 2 is a one section part: a single telephone conversation, then
// five questions. Part 1 splits its conversation into three sections, so
// it fills sections with three entries. Here there is one, which is why
// the flow produces no section break screens.
//
// One change against the source text, deliberate:
//
// - Question 4 option 1 reads: She has never heard the name "Amir"
//   before. The document wraps Amir in curly quotation marks. They are
//   normalized to straight quotes here, the same normalization EXAM-03
//   applied to the curly apostrophe in the Part 1 option "They don't
//   accept credit cards." Typography only. No wording changed.
//
// The answer key is confirmed and complete, unlike Part 1's, which means
// this file must never be handed to the browser whole. See the note on
// ANSWER_KEY below.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ListeningPartContent } from "@/features/exam-engine/listening-types";
import type { ListeningAnswerKeyEntry } from "@/features/exam-engine/listening-review-types";

// Answer key for the whole part, one entry per question, in order.
//
// source is "answer-image" on every entry because each value was read off
// the Part 2 answer sheet rather than out of the source document text.
// The option text is repeated in a trailing comment so the id can be
// checked against the question below without scrolling, and so a later
// edit to an option cannot quietly move an answer.
//
// Every value below was matched to an existing option by exact text. No
// option wording was changed to make a key fit, and nothing was guessed.
//
// This key is complete, which makes it different from the Part 1 key in
// one way that matters: shipping it to the browser would hand a learner
// the answers. The Part 2 route strips it with withoutListeningAnswerKey
// before rendering, and EXAM-06 has to keep review and scoring on the
// server for the same reason. See
// docs/product/listening-part-2-prototype.md section 10.
const ANSWER_KEY: ListeningAnswerKeyEntry[] = [
  // a newspaper subscription
  { questionId: "listening-part-2-q1", correctOptionId: "listening-part-2-q1-a", source: "answer-image" },
  // Manaz was a customer in the past.
  { questionId: "listening-part-2-q2", correctOptionId: "listening-part-2-q2-a", source: "answer-image" },
  // suspicious
  { questionId: "listening-part-2-q3", correctOptionId: "listening-part-2-q3-b", source: "answer-image" },
  // She would like to call him by his name.
  { questionId: "listening-part-2-q4", correctOptionId: "listening-part-2-q4-d", source: "answer-image" },
  // a selection of articles
  { questionId: "listening-part-2-q5", correctOptionId: "listening-part-2-q5-c", source: "answer-image" },
];

const AUDIO_BASE = "https://res.cloudinary.com/dkvsshy7n/video/upload";
const IMAGE_BASE = "https://res.cloudinary.com/dkvsshy7n/image/upload";

export const listeningPart2: ListeningPartContent = {
  testId: "mock-test-1",
  sectionId: "listening-part-2",
  title: "Practice Test 1 - Listening Part 2: Listening to a Daily Life Conversation",
  partTitle: "Listening to a Daily Life Conversation",
  subtitle:
    "Read the following information before this part of the practice test begins.",
  instructions: [
    "You will hear a conversation followed by 5 questions.",
    "Listen to each question. You will hear the question only once.",
    "Choose the best answer to each question.",
  ],
  // No context image for this part. The source document gives Part 2 a
  // scenario sentence and nothing else, so imageUrl stays unset rather
  // than borrowing artwork from another part.
  scenario: {
    text: "You will hear a telephone conversation between a woman and a customer.",
  },
  answerKey: ANSWER_KEY,
  // Answer sheet for Part 2, from
  // mock-tests/mock-test-1/extracted-links.md. Referenced from Cloudinary
  // and never downloaded. The key above covers the answers, so this is
  // held for EXAM-06 as the source a reviewer can check the key against.
  // Nothing in this ticket renders it.
  answerExplanationImageUrl: `${IMAGE_BASE}/v1785339061/Listening_Test_1_zAnswers_-_Part_2_dwrmfm_i03rbe.png`,
  answerExplanationImageAlt:
    "Answer sheet for Listening Part 2, listing the correct answer for each of the five questions.",
  sections: [
    {
      id: "listening-part-2-section-1",
      conversationAudioUrl: `${AUDIO_BASE}/v1785336642/Listening_Test_1_-_Part_2_-_Audio_jwpkne_vodvcl.mp3`,
      // Running time as the source document states it, not measured.
      durationLabel: "About 1.5 to 2 minutes",
      questions: [
        {
          id: "listening-part-2-q1",
          number: 1,
          audioUrl: `${AUDIO_BASE}/v1785336686/Listening_Test_1_-_Part_2_-_Q1_y0tuae_rjgtdy.mp3`,
          options: [
            { id: "listening-part-2-q1-a", text: "a newspaper subscription" },
            { id: "listening-part-2-q1-b", text: "a book series" },
            { id: "listening-part-2-q1-c", text: "a gym membership" },
            { id: "listening-part-2-q1-d", text: "a telephone plan" },
          ],
        },
        {
          id: "listening-part-2-q2",
          number: 2,
          audioUrl: `${AUDIO_BASE}/v1785336731/Listening_Test_1_-_Part_2_-_Q2_ivsxrc_uicql8.mp3`,
          options: [
            {
              id: "listening-part-2-q2-a",
              text: "Manaz was a customer in the past.",
            },
            { id: "listening-part-2-q2-b", text: "He is a regular customer." },
            { id: "listening-part-2-q2-c", text: "His name was on her list." },
            {
              id: "listening-part-2-q2-d",
              text: "Manaz filled out an application form.",
            },
          ],
        },
        {
          id: "listening-part-2-q3",
          number: 3,
          audioUrl: `${AUDIO_BASE}/v1785336780/Listening_Test_1_-_Part_2_-_Q3_ssh5zr_nbeq1b.mp3`,
          options: [
            { id: "listening-part-2-q3-a", text: "interested" },
            { id: "listening-part-2-q3-b", text: "suspicious" },
            { id: "listening-part-2-q3-c", text: "pleased" },
            { id: "listening-part-2-q3-d", text: "upset" },
          ],
        },
        {
          id: "listening-part-2-q4",
          number: 4,
          audioUrl: `${AUDIO_BASE}/v1785336828/Listening_Test_1_-_Part_2_-_Q4_ueomg6_j0emyc.mp3`,
          options: [
            {
              id: "listening-part-2-q4-a",
              text: 'She has never heard the name "Amir" before.',
            },
            {
              id: "listening-part-2-q4-b",
              text: "She is interested in the meanings of names.",
            },
            {
              id: "listening-part-2-q4-c",
              text: "She is going to write him an email.",
            },
            {
              id: "listening-part-2-q4-d",
              text: "She would like to call him by his name.",
            },
          ],
        },
        {
          id: "listening-part-2-q5",
          number: 5,
          audioUrl: `${AUDIO_BASE}/v1785338140/Listening_Test_1_-_Part_2_-_Q5_nvvqr5_pdb3vo.mp3`,
          options: [
            { id: "listening-part-2-q5-a", text: "the entire newspaper" },
            { id: "listening-part-2-q5-b", text: "only local news stories" },
            { id: "listening-part-2-q5-c", text: "a selection of articles" },
            { id: "listening-part-2-q5-d", text: "the sports highlights" },
          ],
        },
      ],
    },
  ],
};
