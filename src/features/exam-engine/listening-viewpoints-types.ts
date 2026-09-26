// Types for a viewpoints Listening part (EXAM-13).
//
// Screen type 4 followed by screen type 7 in
// docs/product/exam-engine-screen-types.md: one clip, then every question
// for the part on a single screen. Listening Part 6, Listening for
// Viewpoints, is the only part built this way, and it is the last part of
// the Listening section.
//
// This is a fourth content shape, beside ListeningPartContent in
// listening-types.ts, ListeningDropdownPartContent in
// listening-dropdown-types.ts and ListeningVideoPartContent in
// listening-video-types.ts. It sits between the last two and is
// deliberately not merged with either:
//
// - A dropdown part's questions are incomplete statements answered from a
//   select, and since EXAM-15F Part 6's are too. What still separates the
//   two shapes is the media: a dropdown part's clip is
//   ListeningDropdownMedia and a viewpoints part's is
//   ListeningViewpointsMedia, and the two parts keep separate flows and
//   separate content files. The question shapes are now identical, which
//   is why the question list is shared rather than duplicated: EXAM-15F
//   deleted ListeningViewpointsQuestionList and
//   ListeningViewpointsQuestionScreen now renders
//   ListeningDropdownQuestionList over these questions directly.
// - A video part's questions are whole questions answered from a radio
//   group, and its media is a video with a poster and an aspect ratio. Its
//   question type has one prompt string and no blank, so textBefore and
//   textAfter would be dead fields there and prompt would be a dead field
//   here. Part 5 keeps that shape on purpose: its eight source items are
//   whole interrogatives with no blank for a select to sit in.
//
// So this shape is the statement of the dropdown part with the media of a
// viewpoints part. What all four shapes share is imported rather than
// copied: the scenario shape, the instruction bullet shape, and the answer
// key entry.
//
// One note on the source material, now settled. The Mock Test 1 document
// instructs this part with "Choose the best way to complete each statement
// from the drop-down menu", and unlike Part 5 that is not a copy and paste
// artefact: the six items really are sentence stems. EXAM-13 rendered
// radio options anyway, because its ticket asked for them, and dropped the
// drop-down clause from the learner-facing wording rather than promising a
// control that was not there.
//
// EXAM-15F corrected the control rather than the copy. The screen now
// draws a select, the instruction lines carry the drop-down clause again,
// and the deviation recorded in
// docs/product/listening-part-6-prototype.md is closed. Nothing in this
// file changed to do it: the fields below were already the right shape,
// which is the whole reason the correction was cheap. See
// docs/product/listening-format-strict-timing-polish.md.
//
// This file holds types only, no runtime values, so it can be imported
// from a server component or a client component without pulling any
// behaviour along with it. The helpers live in
// listening-viewpoints-flow.ts. Same rule the three sibling type files
// follow.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ExamInstruction } from "./instruction-screen-types";
import type { ListeningAnswerKeyEntry } from "./listening-review-types";
import type { ListeningScenario } from "./listening-types";

// One choice under a viewpoints statement.
//
// The id is what the answer map stores, never the option text, so the
// wording can be corrected later without invalidating a stored answer.
// Same rule as ListeningOption, ListeningDropdownOption and
// ListeningVideoOption.
export type ListeningViewpointsOption = {
  id: string;
  text: string;
};

// One viewpoints question: an incomplete statement and the choices that
// finish it.
//
// The statement is stored split around the blank rather than as one string
// with a placeholder in it, so the screen decides how the blank is drawn
// and no component has to parse a sentence. Same reasoning as
// ListeningDropdownQuestion, and structurally the same type, which is what
// lets ListeningDropdownQuestionList render one of these without a
// conversion step. In Mock Test 1 Part 6 every blank ends its statement,
// so textAfter is unset throughout, but the field is here for a part whose
// blank falls mid sentence.
export type ListeningViewpointsQuestion = {
  id: string;
  // Position inside the part, counting from 1. Display only.
  number: number;
  // Statement text up to the blank.
  textBefore: string;
  // Statement text after the blank. Unset when the blank ends the
  // statement.
  textAfter?: string;
  options: ListeningViewpointsOption[];
  // Correct option id, for a part whose key is written question by
  // question. The part level answerKey list below wins where both exist.
  // Mock Test 1 Part 6 uses the list, so this stays unset there.
  correctOptionId?: string;
};

// The single clip a viewpoints part is built around.
//
// url rather than audioUrl, matching the sibling media types, so a
// viewpoints part published as a video later does not need the field
// renamed. Mock Test 1 Part 6 is an mp3.
export type ListeningViewpointsMedia = {
  url: string;
  // Learner facing clip name, for example "Report audio".
  title: string;
  // Running time as text, for example "About 3 minutes". Display only,
  // and taken from the source document rather than measured.
  durationLabel?: string;
};

// One viewpoints Listening part, as the engine consumes it.
export type ListeningViewpointsPartContent = {
  // For example "mock-test-1".
  testId: string;
  // For example "listening-part-6".
  sectionId: string;
  // Full title for the exam top bar.
  title: string;
  // Short part name, for example "Listening for Viewpoints".
  partTitle: string;
  // Sentence under the instructions heading on the part intro screen.
  subtitle?: string;
  instructions: ExamInstruction[];
  scenario: ListeningScenario;
  media: ListeningViewpointsMedia;
  // Instruction line above the player, for example "Listen to the
  // following report."
  mediaInstruction?: string;
  // Instruction line above the question list.
  questionInstruction?: string;
  questions: ListeningViewpointsQuestion[];

  // Answer key for the whole part, one entry per question.
  //
  // Optional, because a part can be built and walked through before its
  // key exists. An entry with correctOptionId null is a question whose key
  // is known to be missing.
  //
  // A complete key must never reach the browser. See
  // withoutListeningViewpointsAnswerKey in listening-viewpoints-flow.ts.
  answerKey?: ListeningAnswerKeyEntry[];

  // Answer and explanation sheet published with the source test, as an
  // image. Referenced from Cloudinary and never downloaded. Held for the
  // review ticket, and rendered nowhere in EXAM-13.
  answerExplanationImageUrl?: string;
  // Description for a learner who cannot see the sheet. Required whenever
  // answerExplanationImageUrl is set, which the content file enforces by
  // always writing both together.
  answerExplanationImageAlt?: string;
};

// Answers held while a learner works through a viewpoints part.
//
// Keyed by question id, valued by the selected option id, which is the
// { questionId: selectedOptionId } shape the review ticket needs. Nothing
// here is written to a database.
export type ListeningViewpointsAnswerMap = Readonly<Record<string, string>>;

// One screen in a viewpoints part flow.
//
// A discriminated union rather than a screen index, for the same reason
// the three sibling screen unions are: adding a screen kind should be a
// compile error everywhere it matters.
//
// There is one media screen and one question screen, neither of which
// needs an index, so no screen here points back into the content.
//
// EXAM-13 closed the part on part-complete, because the Part 6 answer
// review and practice score were not built. EXAM-14 adds the three closing
// kinds the sibling unions already carry, answer-review, score and
// part-end, and buildListeningViewpointsFlow now produces them by default.
// part-complete stays declared rather than being deleted, because the
// "complete" ending is still available for a viewpoints part that ships
// before its review exists. That is how listening-dropdown-types.ts and
// listening-video-types.ts grew.
//
// Named the way ListeningDropdownScreen and ListeningVideoScreen are, so
// it shares a name with the ListeningViewpointsScreen component. They live
// in different modules and no file needs both, which is the same
// arrangement ListeningVideoScreen already has.
export type ListeningViewpointsScreen =
  | { kind: "part-intro"; id: string }
  | { kind: "scenario"; id: string }
  | { kind: "media"; id: string }
  // Every question in the part, on one screen.
  | { kind: "questions"; id: string }
  // Closing screen for a part whose review and score are not built yet.
  | { kind: "part-complete"; id: string }
  // Closing screens for a part that has a review (EXAM-14).
  | { kind: "answer-review"; id: string }
  | { kind: "score"; id: string }
  | { kind: "part-end"; id: string };
