// Mock Test 1, Listening Part 5: Listening to a Discussion (EXAM-11).
//
// Source: mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx, Listening
// PART 05, with the Cloudinary URL cross checked against
// mock-tests/mock-test-1/extracted-links.md and the part summary in
// docs/product/mock-test-1-content-map.md. Nothing was downloaded and
// nothing is re-hosted. The video is served straight from Cloudinary.
//
// This is licensed Toronto Academy content. Every route that imports this
// file must sit behind the dashboard auth guard.
//
// Part 5 is the only Listening part with a video, and the only one that
// prints whole questions answered from radio options. It fits neither
// ListeningPartContent nor ListeningDropdownPartContent, so it is typed
// as ListeningVideoPartContent. The reasoning is in the header of
// src/features/exam-engine/listening-video-types.ts.
//
// Three notes on the source material, all deliberate:
//
// - The source document carries two instruction lines for this part,
//   "Choose the best way to answer each question" and "Choose the best
//   way to complete each statement from the drop-down menu".
//   docs/product/mock-test-1-content-map.md records the second as a copy
//   and paste artefact, because the eight items are full questions rather
//   than sentence stems. The question wording is the one used here, on
//   the intro screen and above the question list.
// - The running time is written as the intro bullet states it, "You will
//   watch a 2-minute video", rather than measured. The content map gives
//   the clip as about 1.5 to 2 minutes, so the two agree.
// - Part 5 has no question audio at all. The questions are read on
//   screen, which is why ListeningVideoQuestion has no audio field.
//
// The answer key is confirmed and complete, which means this file must
// never be handed to the browser whole. See the note on ANSWER_KEY.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ListeningAnswerKeyEntry } from "@/features/exam-engine/listening-review-types";
import type { ListeningVideoPartContent } from "@/features/exam-engine/listening-video-types";

// Answer key for the whole part, one entry per question, in order.
//
// source is "answer-image" on every entry because each value was read off
// the Part 5 answer screenshot rather than out of the source document
// text. The option text is repeated in a trailing comment so the id can
// be checked against the question below without scrolling, and so a later
// edit to an option cannot quietly move an answer.
//
// Every value below was matched to an existing option by exact text,
// punctuation included. No option wording was changed to make a key fit,
// and nothing was guessed.
//
// The key is complete, so shipping it to the browser would hand a learner
// the answers. The Part 5 route strips it with
// withoutListeningVideoAnswerKey before rendering, the same way the Part
// 2, Part 3 and Part 4 routes strip theirs. Nothing here is rendered on
// the question screen.
//
// EXAM-12 confirmed every entry below against the options and changed
// none of them. What reads the key is markListeningPartFive, the server
// action beside the Part 5 route, the way markListeningPartFour reads the
// Part 4 key. The key itself never crosses to the browser in either
// direction: only the finished review rows and the practice score do.
const ANSWER_KEY: ListeningAnswerKeyEntry[] = [
  // the format of the event
  { questionId: "listening-part-5-q1", correctOptionId: "listening-part-5-q1-b", source: "answer-image" },
  // Their company regularly organizes fundraisers.
  { questionId: "listening-part-5-q2", correctOptionId: "listening-part-5-q2-c", source: "answer-image" },
  // generating ideas
  { questionId: "listening-part-5-q3", correctOptionId: "listening-part-5-q3-a", source: "answer-image" },
  // the chosen recipient of the funds
  { questionId: "listening-part-5-q4", correctOptionId: "listening-part-5-q4-b", source: "answer-image" },
  // Bidders can make high bids for items they want.
  { questionId: "listening-part-5-q5", correctOptionId: "listening-part-5-q5-d", source: "answer-image" },
  // It will encourage bidders to bid low.
  { questionId: "listening-part-5-q6", correctOptionId: "listening-part-5-q6-c", source: "answer-image" },
  // It takes too long to process the results.
  { questionId: "listening-part-5-q7", correctOptionId: "listening-part-5-q7-d", source: "answer-image" },
  // They will request outside input.
  { questionId: "listening-part-5-q8", correctOptionId: "listening-part-5-q8-c", source: "answer-image" },
];

const VIDEO_BASE = "https://res.cloudinary.com/dkvsshy7n/video/upload";
const IMAGE_BASE = "https://res.cloudinary.com/dkvsshy7n/image/upload";

export const listeningPart5: ListeningVideoPartContent = {
  testId: "mock-test-1",
  sectionId: "listening-part-5",
  title: "Practice Test 1 - Listening Part 5: Listening to a Discussion",
  partTitle: "Listening to a Discussion",
  subtitle:
    "Read the following information before this part of the practice test begins.",
  instructions: [
    "You will watch a 2-minute video.",
    "Then 8 questions will appear.",
    // The source bullet ends "from the drop-down menu". EXAM-11 dropped
    // the clause because it drew radio options; EXAM-UI-03 renders the
    // select the source describes, so the bullet is the source bullet
    // again. Nothing else in this file changed: the eight ids, the four
    // option ids under each of them, every word of question and option
    // text, and the answer key are exactly as EXAM-11 wrote them.
    "Choose the best way to answer each question from the drop-down menu.",
  ],
  // No context image for this part. extracted-links.md records Part 1 as
  // the only Listening part with one, so imageUrl stays unset rather than
  // borrowing artwork from another part. The three scenario sentences
  // from the source document are joined into one paragraph, which is what
  // the scenario screen and the intro card both print.
  scenario: {
    text: "You will watch a discussion among three colleagues. There are two women and one man. They are in a meeting room at their workplace.",
  },
  media: {
    url: `${VIDEO_BASE}/v1785338846/Listening_Test_1_-_Part_5_-_Video_phtvso_jl84rt_vcn4ev.mp4`,
    title: "Discussion video",
    // Running time as the source document states it, not measured.
    durationLabel: "About 2 minutes",
    // No poster frame is published with this video, so none is set. An
    // invented still would be a picture the source test does not have.
  },
  mediaInstruction: "Watch the discussion.",
  questionInstruction:
    "Choose the best way to answer each question from the drop-down menu.",
  answerKey: ANSWER_KEY,
  // Answer sheet for Part 5, from
  // mock-tests/mock-test-1/extracted-links.md. Referenced from Cloudinary
  // and never downloaded. The key above covers the answers, so this is
  // the source a reviewer can check the key against. EXAM-12 puts it on
  // the answer review screen, collapsed behind a disclosure the way Parts
  // 1 to 4 show theirs, so opening the review does not put the sheet on
  // screen unasked.
  answerExplanationImageUrl: `${IMAGE_BASE}/v1785339197/Listening_Test_1_zAnswers_-_Part_5_n3arah_kzgfkh.png`,
  answerExplanationImageAlt:
    "Answer sheet for Listening Part 5, listing the correct answer for each of the eight questions.",
  questions: [
    {
      id: "listening-part-5-q1",
      number: 1,
      prompt:
        "What aspect of the fundraiser are the three colleagues debating?",
      options: [
        { id: "listening-part-5-q1-a", text: "the recipient of the funds" },
        { id: "listening-part-5-q1-b", text: "the format of the event" },
        { id: "listening-part-5-q1-c", text: "the schedule of the auction" },
        { id: "listening-part-5-q1-d", text: "the purpose of the fundraiser" },
      ],
    },
    {
      id: "listening-part-5-q2",
      number: 2,
      prompt: "Why are the three colleagues planning a fundraiser?",
      options: [
        {
          id: "listening-part-5-q2-a",
          text: "Eric's wife asked the company for help.",
        },
        {
          id: "listening-part-5-q2-b",
          text: "The hospital wards are in bad condition.",
        },
        {
          id: "listening-part-5-q2-c",
          text: "Their company regularly organizes fundraisers.",
        },
        {
          id: "listening-part-5-q2-d",
          text: "The employees enjoy participating in silent auctions.",
        },
      ],
    },
    {
      id: "listening-part-5-q3",
      number: 3,
      prompt: "What stage are the three colleagues at in their planning?",
      options: [
        { id: "listening-part-5-q3-a", text: "generating ideas" },
        { id: "listening-part-5-q3-b", text: "finalizing details" },
        { id: "listening-part-5-q3-c", text: "distributing tasks" },
        { id: "listening-part-5-q3-d", text: "awaiting approval" },
      ],
    },
    {
      id: "listening-part-5-q4",
      number: 4,
      prompt: "What is Eric pleased about?",
      options: [
        {
          id: "listening-part-5-q4-a",
          text: "the new fundraising strategy",
        },
        {
          id: "listening-part-5-q4-b",
          text: "the chosen recipient of the funds",
        },
        { id: "listening-part-5-q4-c", text: "the postponed meeting time" },
        { id: "listening-part-5-q4-d", text: "the traditional auction system" },
      ],
    },
    {
      id: "listening-part-5-q5",
      number: 5,
      prompt: "Which statement is true about a traditional silent auction?",
      options: [
        {
          id: "listening-part-5-q5-a",
          text: "Bidders know how much each person bids.",
        },
        {
          id: "listening-part-5-q5-b",
          text: "The highest bidders are notified immediately.",
        },
        {
          id: "listening-part-5-q5-c",
          text: "It requires choosing an identification number.",
        },
        {
          id: "listening-part-5-q5-d",
          text: "Bidders can make high bids for items they want.",
        },
      ],
    },
    {
      id: "listening-part-5-q6",
      number: 6,
      prompt: "Why does Marie dislike the change that Isabella suggested?",
      options: [
        {
          id: "listening-part-5-q6-a",
          text: "It will make the auction longer.",
        },
        {
          id: "listening-part-5-q6-b",
          text: "It will confuse experienced bidders.",
        },
        {
          id: "listening-part-5-q6-c",
          text: "It will encourage bidders to bid low.",
        },
        {
          id: "listening-part-5-q6-d",
          text: "It will make the auction less efficient.",
        },
      ],
    },
    {
      id: "listening-part-5-q7",
      number: 7,
      prompt: "Why does Isabella dislike traditional silent auctions?",
      options: [
        {
          id: "listening-part-5-q7-a",
          text: "The system is difficult to understand.",
        },
        {
          id: "listening-part-5-q7-b",
          text: "The bidding is too competitive.",
        },
        {
          id: "listening-part-5-q7-c",
          text: "Bidders' names are made public.",
        },
        {
          id: "listening-part-5-q7-d",
          text: "It takes too long to process the results.",
        },
      ],
    },
    {
      id: "listening-part-5-q8",
      number: 8,
      prompt: "How will the group's indecision be resolved?",
      options: [
        {
          id: "listening-part-5-q8-a",
          text: "They will do further research.",
        },
        { id: "listening-part-5-q8-b", text: "They will vote on the matter." },
        {
          id: "listening-part-5-q8-c",
          text: "They will request outside input.",
        },
        {
          id: "listening-part-5-q8-d",
          text: "They will continue the debate later.",
        },
      ],
    },
  ],
};
