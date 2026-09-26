// Types for a video discussion Listening part (EXAM-11).
//
// Screen type 5 followed by screen type 7 in
// docs/product/exam-engine-screen-types.md: one video, then every
// question for the part on a single screen. Listening Part 5 is the only
// part built this way, and it is the only Listening part with a video at
// all.
//
// This is a third content shape, beside ListeningPartContent in
// listening-types.ts and ListeningDropdownPartContent in
// listening-dropdown-types.ts. It is close to the dropdown shape and
// deliberately not merged with it:
//
// - A dropdown part's media is a clip. This part's media is a video, so
//   the screen that plays it is a different component with a poster, an
//   aspect ratio and a picture to lay out.
// - A dropdown question is an incomplete statement split around a blank,
//   answered from a select. A question here is a whole question answered
//   from a radio group, so it has one prompt string and no blank, and
//   textBefore and textAfter would be dead fields on every question.
//
// docs/product/mock-test-1-content-map.md records the source document as
// carrying both instruction lines for this part, "Choose the best way to
// answer each question" and the drop-down menu sentence, and settles it:
// the questions are full questions rather than sentence stems, so the
// drop-down sentence is a copy and paste artefact and the question
// wording is the one to use. This shape follows that reading.
//
// What the three shapes share is imported rather than copied: the
// scenario shape, the instruction bullet shape, and the answer key entry.
//
// This file holds types only, no runtime values, so it can be imported
// from a server component or a client component without pulling any
// behaviour along with it. The helpers live in listening-video-flow.ts.
// Same rule listening-types.ts and listening-dropdown-types.ts follow.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ExamInstruction } from "./instruction-screen-types";
import type { ListeningAnswerKeyEntry } from "./listening-review-types";
import type { ListeningScenario } from "./listening-types";

// One choice in a multiple-choice question.
//
// The id is what the answer map stores, never the option text, so the
// wording can be corrected later without invalidating a stored answer.
// Same rule as ListeningOption and ListeningDropdownOption.
export type ListeningVideoOption = {
  id: string;
  text: string;
};

// One printed multiple-choice question.
//
// prompt is the whole question, printed on screen. Parts 1 to 3 speak
// their questions and print nothing, which is why their question type has
// an audio URL and an optional prompt. This part is the other way round:
// there is no question audio anywhere in Part 5, so there is no audio
// field here and the prompt is required.
export type ListeningVideoQuestion = {
  id: string;
  // Position inside the part, counting from 1. Display only.
  number: number;
  // The question as the learner reads it.
  prompt: string;
  options: ListeningVideoOption[];
  // Correct option id, for a part whose key is written question by
  // question. The part level answerKey list below wins where both exist.
  // Mock Test 1 Part 5 uses the list, so this stays unset there.
  correctOptionId?: string;
};

// The single video a discussion part is built around.
export type ListeningVideoMedia = {
  url: string;
  // Learner facing clip name, for example "Discussion video".
  title: string;
  // Running time as text, for example "About 2 minutes". Display only,
  // and taken from the source document rather than measured.
  durationLabel?: string;
  // Still image shown before playback starts. Unset for Mock Test 1,
  // which publishes no poster frame for this video.
  posterUrl?: string;
};

// One video discussion Listening part, as the engine consumes it.
export type ListeningVideoPartContent = {
  // For example "mock-test-1".
  testId: string;
  // For example "listening-part-5".
  sectionId: string;
  // Full title for the exam top bar.
  title: string;
  // Short part name, for example "Listening to a Discussion".
  partTitle: string;
  // Sentence under the instructions heading on the part intro screen.
  subtitle?: string;
  instructions: ExamInstruction[];
  scenario: ListeningScenario;
  media: ListeningVideoMedia;
  // Instruction line above the player, for example "Watch the
  // discussion."
  mediaInstruction?: string;
  // Instruction line above the question list.
  questionInstruction?: string;
  questions: ListeningVideoQuestion[];

  // Answer key for the whole part, one entry per question.
  //
  // Optional, because a part can be built and walked through before its
  // key exists. An entry with correctOptionId null is a question whose
  // key is known to be missing.
  //
  // A complete key must never reach the browser. See
  // withoutListeningVideoAnswerKey in listening-video-flow.ts.
  answerKey?: ListeningAnswerKeyEntry[];

  // Answer and explanation sheet published with the source test, as an
  // image. Referenced from Cloudinary and never downloaded. Held for the
  // review ticket, and rendered nowhere in EXAM-11.
  answerExplanationImageUrl?: string;
  // Description for a learner who cannot see the sheet. Required whenever
  // answerExplanationImageUrl is set, which the content file enforces by
  // always writing both together.
  answerExplanationImageAlt?: string;
};

// Answers held while a learner works through a video discussion part.
//
// Keyed by question id, valued by the selected option id, which is the
// { questionId: selectedOptionId } shape the review ticket needs.
// Nothing here is written to a database.
export type ListeningVideoAnswerMap = Readonly<Record<string, string>>;

// One screen in a video discussion part flow.
//
// A discriminated union rather than a screen index, for the same reason
// ListeningScreen and ListeningDropdownScreen are: adding a screen kind
// should be a compile error everywhere it matters.
//
// There is one media screen and one question screen, neither of which
// needs an index, so no screen here points back into the content.
//
// EXAM-12 added the three closing screens. A part built this way now
// ends on the answer review, the practice score and the end of part
// screen, which is what buildListeningVideoFlow returns by default.
// part-complete is kept for a video part shipped before its review
// exists, which is the ending EXAM-11 had. See the ending note in
// listening-video-flow.ts.
export type ListeningVideoScreen =
  | { kind: "part-intro"; id: string }
  | { kind: "scenario"; id: string }
  | { kind: "video"; id: string }
  // Every question in the part, on one screen.
  | { kind: "questions"; id: string }
  // Closing screen for a part whose review and score are not built yet.
  | { kind: "part-complete"; id: string }
  // Every question with the chosen option, the correct option and a
  // status word.
  | { kind: "answer-review"; id: string }
  // Practice result for the part. Never an official CELPIP score.
  | { kind: "score"; id: string }
  // Last screen of the run: back to the dashboard, or restart.
  | { kind: "part-end"; id: string };
