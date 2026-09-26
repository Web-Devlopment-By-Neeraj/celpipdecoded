// Mock Test 1, Listening Part 1: Listening to Problem Solving (EXAM-03).
//
// Source: mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx, with the
// Cloudinary URLs taken from mock-tests/mock-test-1/extracted-links.md.
// Nothing was downloaded, and nothing is re-hosted. The clips and the
// context image are served straight from Cloudinary.
//
// This is licensed Toronto Academy content. Every route that imports this
// file must sit behind the dashboard auth guard.
//
// Three notes on the source text, all deliberate:
//
// - Question 1 option 4 reads "to pay for a dogsled excursion222" in the
//   document. The trailing "222" is a typing artefact, not content, so it
//   is dropped here.
// - Question 4 option 4 reads "She pulls the reigns." The spelling is the
//   document's, and it is kept as written rather than silently corrected,
//   because changing option wording changes the question.
// - Question 8 option 4 has no full stop in the document, unlike its
//   three siblings. Kept as written for the same reason.
//
// The answer key for all eight questions is now transcribed, from the
// Part 1 answer and explanation sheet. Every entry below was matched to
// an existing option by exact text, so no question wording changed to
// make a key fit. The sheet stays linked as answerExplanationImageUrl,
// because it carries the per question explanations, which are not
// transcribed.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ListeningPartContent } from "@/features/exam-engine/listening-types";
import type { ListeningAnswerKeyEntry } from "@/features/exam-engine/listening-review-types";

// Answer key for the whole part, one entry per question, in order.
//
// source is "answer-image" on every entry because each value was read off
// the Part 1 answer and explanation sheet rather than out of the source
// document text. The option text is repeated in a trailing comment so the
// id can be checked against the question below without scrolling, and so
// a later edit to an option cannot quietly move an answer.
const ANSWER_KEY: ListeningAnswerKeyEntry[] = [
  // to pay for a dogsled excursion
  { questionId: "listening-part-1-q1", correctOptionId: "listening-part-1-q1-d", source: "answer-image" },
  // Her card is refused.
  { questionId: "listening-part-1-q2", correctOptionId: "listening-part-1-q2-a", source: "answer-image" },
  // falling into the lake
  { questionId: "listening-part-1-q3", correctOptionId: "listening-part-1-q3-a", source: "answer-image" },
  // She steps on the brake.
  { questionId: "listening-part-1-q4", correctOptionId: "listening-part-1-q4-b", source: "answer-image" },
  // to reassure the woman
  { questionId: "listening-part-1-q5", correctOptionId: "listening-part-1-q5-d", source: "answer-image" },
  // for safety reasons
  { questionId: "listening-part-1-q6", correctOptionId: "listening-part-1-q6-a", source: "answer-image" },
  // It was very annoying.
  { questionId: "listening-part-1-q7", correctOptionId: "listening-part-1-q7-b", source: "answer-image" },
  // Consider riding the sled as a passenger.
  { questionId: "listening-part-1-q8", correctOptionId: "listening-part-1-q8-c", source: "answer-image" },
];

const AUDIO_BASE = "https://res.cloudinary.com/dkvsshy7n/video/upload";
const IMAGE_BASE = "https://res.cloudinary.com/dkvsshy7n/image/upload";

// Each conversation section runs about the same length in the source
// document, so the label is shared rather than repeated three times.
const SECTION_DURATION_LABEL = "About 1 to 1.5 minutes";

export const listeningPart1: ListeningPartContent = {
  testId: "mock-test-1",
  sectionId: "listening-part-1",
  title: "Practice Test 1 - Listening Part 1: Listening to Problem Solving",
  partTitle: "Listening to Problem Solving",
  subtitle:
    "Read the following information before this part of the practice test begins.",
  instructions: [
    "You will hear a conversation in 3 sections.",
    "You will hear each section only once.",
    "After each section, you will hear 2 or 3 questions.",
    "Choose the best answer to each question.",
  ],
  scenario: {
    text: "You will hear a conversation between two people, a man and a woman, who are at a dogsled tour business.",
    imageUrl: `${IMAGE_BASE}/v1785336047/Listening_Test_1_-_Part_1_-_1_m8gpqw_yf4nel.png`,
    imageAlt:
      "Illustration of a dogsled tour business, where the conversation in this part takes place.",
  },
  answerKey: ANSWER_KEY,
  // Answer and explanation sheet for Part 1, from
  // mock-tests/mock-test-1/extracted-links.md. Referenced from Cloudinary
  // and never downloaded. The key above now covers the answers, but the
  // sheet is still the only place the explanations exist, so the review
  // screen keeps offering it as a reference panel.
  answerExplanationImageUrl: `${IMAGE_BASE}/v1785339013/Listening_Test_1_zAnswers_-_Part_1_hdrodb_pary29.png`,
  answerExplanationImageAlt:
    "Answer and explanation sheet for Listening Part 1, listing the correct answer and a short explanation for each of the eight questions.",
  sections: [
    {
      id: "listening-part-1-section-1",
      conversationAudioUrl: `${AUDIO_BASE}/v1785336094/Listening_Test_1_-_Part_1_-_Audio_1_xdk2ff_1_qiudsc.mp3`,
      durationLabel: SECTION_DURATION_LABEL,
      questions: [
        {
          id: "listening-part-1-q1",
          number: 1,
          audioUrl: `${AUDIO_BASE}/v1785336148/Listening_Test_1_-_Part_1_-_Q1_v01ioo_eksyhv.mp3`,
          options: [
            { id: "listening-part-1-q1-a", text: "to schedule dog training lessons" },
            { id: "listening-part-1-q1-b", text: "to purchase some souvenirs" },
            { id: "listening-part-1-q1-c", text: "to arrange for an overnight trip" },
            { id: "listening-part-1-q1-d", text: "to pay for a dogsled excursion" },
          ],
        },
        {
          id: "listening-part-1-q2",
          number: 2,
          audioUrl: `${AUDIO_BASE}/v1785336210/Listening_Test_1_-_Part_1_-_Q2_bl7yyd_ykiqp0.mp3`,
          options: [
            { id: "listening-part-1-q2-a", text: "Her card is refused." },
            { id: "listening-part-1-q2-b", text: "She used a debit card." },
            { id: "listening-part-1-q2-c", text: "They don't accept credit cards." },
            { id: "listening-part-1-q2-d", text: "Her credit card expired." },
          ],
        },
      ],
    },
    {
      id: "listening-part-1-section-2",
      conversationAudioUrl: `${AUDIO_BASE}/v1785336265/Listening_Test_1_-_Part_1_-_Audio_2_s8wx4a_rtwq2f.mp3`,
      durationLabel: SECTION_DURATION_LABEL,
      questions: [
        {
          id: "listening-part-1-q3",
          number: 3,
          audioUrl: `${AUDIO_BASE}/v1785336315/Listening_Test_1_-_Part_1_-_Q3_fdfd7x_vi6auu.mp3`,
          options: [
            { id: "listening-part-1-q3-a", text: "falling into the lake" },
            { id: "listening-part-1-q3-b", text: "knowing where to go" },
            { id: "listening-part-1-q3-c", text: "going too fast" },
            { id: "listening-part-1-q3-d", text: "paying for the drive" },
          ],
        },
        {
          id: "listening-part-1-q4",
          number: 4,
          audioUrl: `${AUDIO_BASE}/v1785336363/Listening_Test_1_-_Part_1_-_Q4_m9ehrp_fmajwg.mp3`,
          options: [
            { id: "listening-part-1-q4-a", text: "She moves from side to side." },
            { id: "listening-part-1-q4-b", text: "She steps on the brake." },
            { id: "listening-part-1-q4-c", text: "She tells the dogs to stop." },
            { id: "listening-part-1-q4-d", text: "She pulls the reigns." },
          ],
        },
        {
          id: "listening-part-1-q5",
          number: 5,
          audioUrl: `${AUDIO_BASE}/v1785336402/Listening_Test_1_-_Part_1_-_Q5_vvpcht_trlrkl.mp3`,
          options: [
            { id: "listening-part-1-q5-a", text: "to scare the woman" },
            { id: "listening-part-1-q5-b", text: "to confuse the woman" },
            { id: "listening-part-1-q5-c", text: "to amuse the woman" },
            { id: "listening-part-1-q5-d", text: "to reassure the woman" },
          ],
        },
      ],
    },
    {
      id: "listening-part-1-section-3",
      conversationAudioUrl: `${AUDIO_BASE}/v1785336452/Listening_Test_1_-_Part_1_-_Audio_3_yju6z2_njlegx.mp3`,
      durationLabel: SECTION_DURATION_LABEL,
      questions: [
        {
          id: "listening-part-1-q6",
          number: 6,
          audioUrl: `${AUDIO_BASE}/v1785336498/Listening_Test_1_-_Part_1_-_Q6_ndylu9_ddyitt.mp3`,
          options: [
            { id: "listening-part-1-q6-a", text: "for safety reasons" },
            { id: "listening-part-1-q6-b", text: "to give directions" },
            { id: "listening-part-1-q6-c", text: "the woman asked him to" },
            { id: "listening-part-1-q6-d", text: "to help the woman stop" },
          ],
        },
        {
          id: "listening-part-1-q7",
          number: 7,
          audioUrl: `${AUDIO_BASE}/v1785336547/Listening_Test_1_-_Part_1_-_Q7_viptu4_dy5yfb.mp3`,
          options: [
            { id: "listening-part-1-q7-a", text: "She wanted to thank the driver." },
            { id: "listening-part-1-q7-b", text: "It was very annoying." },
            { id: "listening-part-1-q7-c", text: "She was interested in driving one." },
            { id: "listening-part-1-q7-d", text: "It frightened the dogs." },
          ],
        },
        {
          id: "listening-part-1-q8",
          number: 8,
          audioUrl: `${AUDIO_BASE}/v1785336586/Listening_Test_1_-_Part_1_-_Q8_ii7eql_q8g1mh.mp3`,
          options: [
            {
              id: "listening-part-1-q8-a",
              text: "Try it only if you can get a special rate.",
            },
            {
              id: "listening-part-1-q8-b",
              text: "It is great for adventurous people.",
            },
            {
              id: "listening-part-1-q8-c",
              text: "Consider riding the sled as a passenger.",
            },
            {
              id: "listening-part-1-q8-d",
              text: "It is more suited to children than adults",
            },
          ],
        },
      ],
    },
  ],
};
