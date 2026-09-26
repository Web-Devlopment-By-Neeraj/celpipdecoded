// Mock Test 1, Listening Part 4: Listening to a News Item (EXAM-09).
//
// Source: mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx, Listening
// PART 04, with the Cloudinary URL cross checked against
// mock-tests/mock-test-1/extracted-links.md. Nothing was downloaded and
// nothing is re-hosted. The clip is served straight from Cloudinary.
//
// This is licensed Toronto Academy content. Every route that imports this
// file must sit behind the dashboard auth guard.
//
// Part 4 is the first part that does not fit ListeningPartContent. Parts
// 1 to 3 interleave conversation clips with one question screen each and
// never print a question. Part 4 plays one news item and then prints all
// five questions on one screen as incomplete statements with dropdowns.
// It is typed as ListeningDropdownPartContent instead. The reasoning is
// in the header of src/features/exam-engine/listening-dropdown-types.ts.
//
// Three notes on the source material, all deliberate:
//
// - The first statement wraps "magician's" in a curly apostrophe. It is
//   normalized to a straight apostrophe here, the same normalization
//   EXAM-03, EXAM-05 and EXAM-07 applied in Parts 1 to 3. Typography
//   only. No wording changed.
// - The source document says the news item is heard once. That sentence
//   is kept in the intro bullets because the ticket asks for it, and it
//   is not yet true of this prototype: the clip can be replayed and Next
//   does not wait for it to finish. One time playback arrives with a
//   later ticket. Recorded as a fidelity gap in
//   docs/product/listening-part-4-prototype.md section 10.
// - Part 4 has no question audio at all. The questions are read on
//   screen, which is why ListeningDropdownQuestion has no audio field.
//
// The answer key is confirmed and complete, which means this file must
// never be handed to the browser whole. See the note on ANSWER_KEY.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ListeningAnswerKeyEntry } from "@/features/exam-engine/listening-review-types";
import type { ListeningDropdownPartContent } from "@/features/exam-engine/listening-dropdown-types";

// Answer key for the whole part, one entry per question, in order.
//
// source is "answer-image" on every entry because each value was read off
// the Part 4 answer screenshot rather than out of the source document
// text. The option text is repeated in a trailing comment so the id can
// be checked against the question below without scrolling, and so a later
// edit to an option cannot quietly move an answer.
//
// Every value below was matched to an existing option by exact text,
// punctuation included. No option wording was changed to make a key fit,
// and nothing was guessed.
//
// The key is complete, so shipping it to the browser would hand a learner
// the answers. The Part 4 route strips it with
// withoutListeningDropdownAnswerKey before rendering, the same way the
// Part 2 and Part 3 routes strip theirs. Nothing here is rendered on the
// question screen.
//
// EXAM-10 is what reads it. markListeningPartFour in
// src/app/dashboard/mock-tests/mock-test-1/listening/part-4/actions.ts
// imports this module on the server, marks the submitted answers against
// the key here, and sends back review rows and a practice score. The key
// itself never crosses to the browser in either direction.
//
// All five entries were confirmed against the answer sheet again in
// EXAM-10 and none of them changed. Nothing was added and nothing was
// guessed.
const ANSWER_KEY: ListeningAnswerKeyEntry[] = [
  // tearing up a $20 bill.
  { questionId: "listening-part-4-q1", correctOptionId: "listening-part-4-q1-d", source: "answer-image" },
  // took a picture of her $20 bill.
  { questionId: "listening-part-4-q2", correctOptionId: "listening-part-4-q2-b", source: "answer-image" },
  // had different numbers.
  { questionId: "listening-part-4-q3", correctOptionId: "listening-part-4-q3-a", source: "answer-image" },
  // a school project.
  { questionId: "listening-part-4-q4", correctOptionId: "listening-part-4-q4-c", source: "answer-image" },
  // stole money from his audience.
  { questionId: "listening-part-4-q5", correctOptionId: "listening-part-4-q5-b", source: "answer-image" },
];

const AUDIO_BASE = "https://res.cloudinary.com/dkvsshy7n/video/upload";
const IMAGE_BASE = "https://res.cloudinary.com/dkvsshy7n/image/upload";

export const listeningPart4: ListeningDropdownPartContent = {
  testId: "mock-test-1",
  sectionId: "listening-part-4",
  title: "Practice Test 1 - Listening Part 4: Listening to a News Item",
  partTitle: "Listening to a News Item",
  subtitle:
    "Read the following information before this part of the practice test begins.",
  instructions: [
    "You will hear a news item once.",
    "It is about 1.5 minutes long.",
    "Then 5 questions will appear.",
    "Choose the best way to complete each statement from the drop-down menu.",
  ],
  // No context image for this part. The source document gives Part 4 a
  // one sentence scenario and nothing else, so imageUrl stays unset
  // rather than borrowing artwork from another part.
  scenario: {
    text: "You will hear a news story about a magician.",
  },
  media: {
    url: `${AUDIO_BASE}/v1785338654/Listening_Test_1_-_Part_4_-_Audio_sgdzdx_rnbaom.mp3`,
    title: "News item audio",
    // Running time as the source document states it, not measured.
    durationLabel: "About 1.5 minutes",
  },
  mediaInstruction: "Listen to the following news item.",
  questionInstruction:
    "Choose the best way to complete each statement from the drop-down menu.",
  answerKey: ANSWER_KEY,
  // Answer sheet for Part 4, from
  // mock-tests/mock-test-1/extracted-links.md. Referenced from Cloudinary
  // and never downloaded. The key above covers the answers, so this is
  // the source a reviewer can check the key against. EXAM-10 renders it
  // on the answer review screen, collapsed behind a disclosure, the same
  // way Parts 1 to 3 do.
  answerExplanationImageUrl: `${IMAGE_BASE}/v1785339155/Listening_Test_1_zAnswers_-_Part_4_q49ylj_lcxxk7.png`,
  answerExplanationImageAlt:
    "Answer sheet for Listening Part 4, listing the correct answer for each of the five questions.",
  // Every blank in this part ends its statement, so no question sets
  // textAfter. Parts 5 and 6 have blanks mid sentence and will.
  questions: [
    {
      id: "listening-part-4-q1",
      number: 1,
      textBefore: "One of the magician's tricks involved",
      options: [
        { id: "listening-part-4-q1-a", text: "giving away a $20 bill." },
        { id: "listening-part-4-q1-b", text: "copying a $20 bill." },
        { id: "listening-part-4-q1-c", text: "making a $20 bill disappear." },
        { id: "listening-part-4-q1-d", text: "tearing up a $20 bill." },
      ],
    },
    {
      id: "listening-part-4-q2",
      number: 2,
      textBefore: "Before giving the magician money, Patricia",
      options: [
        {
          id: "listening-part-4-q2-a",
          text: "asked her father for another $20 bill.",
        },
        {
          id: "listening-part-4-q2-b",
          text: "took a picture of her $20 bill.",
        },
        {
          id: "listening-part-4-q2-c",
          text: "took a picture of the magician.",
        },
        { id: "listening-part-4-q2-d", text: "wrote down the serial number." },
      ],
    },
    {
      id: "listening-part-4-q3",
      number: 3,
      textBefore: "Patricia noticed that the new bill",
      options: [
        { id: "listening-part-4-q3-a", text: "had different numbers." },
        { id: "listening-part-4-q3-b", text: "had bigger numbers." },
        { id: "listening-part-4-q3-c", text: "had a serial number." },
        { id: "listening-part-4-q3-d", text: "had the same number." },
      ],
    },
    {
      id: "listening-part-4-q4",
      number: 4,
      textBefore: "Patricia knew about counterfeit from",
      options: [
        { id: "listening-part-4-q4-a", text: "a course on currency." },
        { id: "listening-part-4-q4-b", text: "a museum tour." },
        { id: "listening-part-4-q4-c", text: "a school project." },
        { id: "listening-part-4-q4-d", text: "training in fake money." },
      ],
    },
    {
      id: "listening-part-4-q5",
      number: 5,
      textBefore: "The magician was in trouble because he",
      options: [
        { id: "listening-part-4-q5-a", text: "stole money from the bank." },
        {
          id: "listening-part-4-q5-b",
          text: "stole money from his audience.",
        },
        { id: "listening-part-4-q5-c", text: "tore a $20 bill into pieces." },
        {
          id: "listening-part-4-q5-d",
          text: "used Patricia's $20 bill in his show.",
        },
      ],
    },
  ],
};
