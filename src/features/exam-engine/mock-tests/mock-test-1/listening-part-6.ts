// Mock Test 1, Listening Part 6: Listening for Viewpoints (EXAM-13).
//
// Source: mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx, Listening
// PART 06, with the Cloudinary URLs cross checked against
// mock-tests/mock-test-1/extracted-links.md and the part summary in
// docs/product/mock-test-1-content-map.md. Nothing was downloaded and
// nothing is re-hosted. The clip is served straight from Cloudinary.
//
// This is licensed Toronto Academy content. Every route that imports this
// file must sit behind the dashboard auth guard.
//
// Part 6 is the last Listening part. Its six items are sentence stems, the
// way Part 4's are, but EXAM-13 answers them from radio options rather
// than from a select, so it is typed as ListeningViewpointsPartContent
// rather than reusing the dropdown shape. The reasoning is in the header
// of src/features/exam-engine/listening-viewpoints-types.ts.
//
// Four notes on the source material, all deliberate:
//
// - The source intro bullet reads "You will hear a report once. It is
//   about 3 minutes long." and the media line reads "Listen to the
//   following report. You will hear the report only once." This prototype
//   lets the clip be replayed, so the one time promise is dropped from
//   both, the same way listening-copy.ts drops it for Parts 1 to 3. The
//   sentence comes back with the ticket that enforces single playback.
// - The source instructs the questions with "Choose the best way to
//   complete each statement from the drop-down menu ( )". Unlike Part 5,
//   that is not a copy and paste artefact here: the six items really are
//   stems. EXAM-13 rendered radio options because its ticket asked for
//   them, and dropped the drop-down clause rather than naming a control
//   that was not on the screen. EXAM-15F renders the select the source
//   describes, so both instruction lines carry the clause again and this
//   file's wording is the source's wording. See
//   docs/product/listening-format-strict-timing-polish.md. Nothing else in
//   this file changed: the six ids, the four option ids under each of them
//   and the answer key are exactly as EXAM-13 wrote them.
// - The running time is written as the source document states it, "about
//   3 minutes", rather than measured. The content map agrees.
// - Part 6 has no question audio at all. The statements are read on
//   screen, which is why ListeningViewpointsQuestion has no audio field.
//
// The statement text below stops where the source document's underscores
// begin. The blank is drawn by the question list, so the underscores are
// not stored, and their count varies between items in the source anyway.
//
// The answer key is confirmed and complete, which means this file must
// never be handed to the browser whole. See the note on ANSWER_KEY.
//
// House style: normal hyphens only, no long hyphens or em dashes. The
// source document's curly apostrophes are written as straight ones, which
// is what the Part 5 content file does.

import type { ListeningAnswerKeyEntry } from "@/features/exam-engine/listening-review-types";
import type { ListeningViewpointsPartContent } from "@/features/exam-engine/listening-viewpoints-types";

// Answer key for the whole part, one entry per question, in order.
//
// source is "answer-image" on every entry because each value was read off
// the Part 6 answer screenshot rather than out of the source document
// text. The option text is repeated in a trailing comment so the id can be
// checked against the question below without scrolling, and so a later
// edit to an option cannot quietly move an answer.
//
// Every value below was matched to an existing option by exact text,
// punctuation included. No option wording was changed to make a key fit,
// and nothing was guessed.
//
// The key is complete, so shipping it to the browser would hand a learner
// the answers. The Part 6 route strips it with
// withoutListeningViewpointsAnswerKey before rendering, the same way the
// Part 2 to Part 5 routes strip theirs, so nothing here reaches the
// question screen. Since EXAM-14 the key is read on the server by
// markListeningPartSix, in actions.ts beside the Part 6 route, the way
// markListeningPartFive reads the Part 5 key. Only the finished review
// rows and practice score cross to the browser, so the key itself never
// crosses in either direction.
const ANSWER_KEY: ListeningAnswerKeyEntry[] = [
  // approve a plan to redevelop the vacant land.
  { questionId: "listening-part-6-q1", correctOptionId: "listening-part-6-q1-a", source: "answer-image" },
  // could put her community at risk.
  { questionId: "listening-part-6-q2", correctOptionId: "listening-part-6-q2-d", source: "answer-image" },
  // may be developed into a nature walkway.
  { questionId: "listening-part-6-q3", correctOptionId: "listening-part-6-q3-d", source: "answer-image" },
  // compact community with a vibrant local economy.
  { questionId: "listening-part-6-q4", correctOptionId: "listening-part-6-q4-b", source: "answer-image" },
  // both economic and community interests can be satisfied.
  { questionId: "listening-part-6-q5", correctOptionId: "listening-part-6-q5-a", source: "answer-image" },
  // Mother of two, Eleanor Wentworth, will be disappointed.
  { questionId: "listening-part-6-q6", correctOptionId: "listening-part-6-q6-a", source: "answer-image" },
];

const AUDIO_BASE = "https://res.cloudinary.com/dkvsshy7n/video/upload";
const IMAGE_BASE = "https://res.cloudinary.com/dkvsshy7n/image/upload";

export const listeningPart6: ListeningViewpointsPartContent = {
  testId: "mock-test-1",
  sectionId: "listening-part-6",
  title: "Practice Test 1 - Listening Part 6: Listening for Viewpoints",
  partTitle: "Listening for Viewpoints",
  subtitle:
    "Read the following information before this part of the practice test begins.",
  instructions: [
    // The source bullet adds "once" here. See the note at the top of the
    // file: the clip can be replayed in this prototype, so the promise is
    // left out rather than printed and broken.
    "You will hear a report. It is about 3 minutes long.",
    "Then 6 questions will appear.",
    // The source bullet ends "from the drop-down menu". EXAM-13 dropped
    // the clause because it rendered radio options; EXAM-15F renders the
    // select the source describes, so the bullet is the source bullet
    // again.
    "Choose the best way to answer each question from the drop-down menu.",
  ],
  // No context image for this part. extracted-links.md records Part 1 as
  // the only Listening part with one, so imageUrl stays unset rather than
  // borrowing artwork from another part. The scenario is the source
  // document's own Instructions sentence for this part.
  scenario: {
    text: "You will hear a presentation about community development.",
  },
  media: {
    url: `${AUDIO_BASE}/v1785338937/Listening_Test_1_-_Part_6_-_Audio_vyzpjt_ydlff9.mp3`,
    title: "Report audio",
    // Running time as the source document states it, not measured.
    durationLabel: "About 3 minutes",
  },
  mediaInstruction: "Listen to the following report.",
  // The source document's own line above the question list, restored in
  // full by EXAM-15F now that the control is a select. EXAM-13 dropped the
  // drop-down clause rather than name a control that was not there.
  questionInstruction:
    "Choose the best way to complete each statement from the drop-down menu.",
  answerKey: ANSWER_KEY,
  // Answer sheet for Part 6, from
  // mock-tests/mock-test-1/extracted-links.md. Referenced from Cloudinary
  // and never downloaded. The key above covers the answers, so this is the
  // source a reviewer can check the key against. Since EXAM-14 it sits on
  // the answer review screen, collapsed behind a disclosure the way Parts
  // 1 to 5 show theirs.
  answerExplanationImageUrl: `${IMAGE_BASE}/v1785339234/Listening_Test_1_zAnswers_-_Part_6_zregl5_omthfw.png`,
  answerExplanationImageAlt:
    "Answer sheet for Listening Part 6, listing the correct answer for each of the six questions.",
  questions: [
    {
      id: "listening-part-6-q1",
      number: 1,
      textBefore: "Nelson has requested that city council",
      options: [
        {
          id: "listening-part-6-q1-a",
          text: "approve a plan to redevelop the vacant land.",
        },
        {
          id: "listening-part-6-q1-b",
          text: "maintain the zoning bylaw for an area of land.",
        },
        {
          id: "listening-part-6-q1-c",
          text: "work to reduce urban sprawl.",
        },
        {
          id: "listening-part-6-q1-d",
          text: "clean up a polluted local creek.",
        },
      ],
    },
    {
      id: "listening-part-6-q2",
      number: 2,
      textBefore:
        "According to the mother of two, high-density apartment buildings",
      options: [
        {
          id: "listening-part-6-q2-a",
          text: "are a good option for families with children.",
        },
        {
          id: "listening-part-6-q2-b",
          text: "can help to preserve green space.",
        },
        {
          id: "listening-part-6-q2-c",
          text: "could be built in addition to a park.",
        },
        {
          id: "listening-part-6-q2-d",
          text: "could put her community at risk.",
        },
      ],
    },
    {
      id: "listening-part-6-q3",
      number: 3,
      textBefore: "Stanley Creek",
      options: [
        {
          id: "listening-part-6-q3-a",
          text: "has been rehabilitated by the surrounding community.",
        },
        {
          id: "listening-part-6-q3-b",
          text: "is an obstacle to development in the area.",
        },
        {
          id: "listening-part-6-q3-c",
          text: "is endangered by the development proposal.",
        },
        {
          id: "listening-part-6-q3-d",
          text: "may be developed into a nature walkway.",
        },
      ],
    },
    {
      id: "listening-part-6-q4",
      number: 4,
      textBefore: "Nelson Development Company envisions a",
      options: [
        {
          id: "listening-part-6-q4-a",
          text: "business community with several large retail chain stores.",
        },
        {
          id: "listening-part-6-q4-b",
          text: "compact community with a vibrant local economy.",
        },
        {
          id: "listening-part-6-q4-c",
          text: "mixed community combining high-rise offices and apartments.",
        },
        {
          id: "listening-part-6-q4-d",
          text: "sprawling residential community for families with children.",
        },
      ],
    },
    {
      id: "listening-part-6-q5",
      number: 5,
      textBefore: "The city councilor believes that",
      options: [
        {
          id: "listening-part-6-q5-a",
          text: "both economic and community interests can be satisfied.",
        },
        {
          id: "listening-part-6-q5-b",
          text: "development of the area may lead to greenland expansion.",
        },
        {
          id: "listening-part-6-q5-c",
          text: "more rezoning should be done along the north bank of the river.",
        },
        {
          id: "listening-part-6-q5-d",
          text: "Stanley Creek is a problematic location for a park.",
        },
      ],
    },
    {
      id: "listening-part-6-q6",
      number: 6,
      // The comma is the source document's own. The blank follows it.
      textBefore: "If city council approves Nelson's current proposal,",
      options: [
        {
          id: "listening-part-6-q6-a",
          text: "Mother of two, Eleanor Wentworth, will be disappointed.",
        },
        {
          id: "listening-part-6-q6-b",
          text: "City Councillor, Emma Orr, will feel the need for more negotiations.",
        },
        {
          id: "listening-part-6-q6-c",
          text: "Developer Nelson will worry about the building costs.",
        },
        {
          id: "listening-part-6-q6-d",
          text: "The children will be happy with their new play area.",
        },
      ],
    },
  ],
};
