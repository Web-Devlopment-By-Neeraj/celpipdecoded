// Types for a dropdown completion Listening part (EXAM-09).
//
// Screen type 7 in docs/product/exam-engine-screen-types.md: one media
// item, then every question for the part on a single screen, each an
// incomplete statement with a dropdown where the blank falls. Listening
// Parts 4, 5 and 6 all work this way. Only Part 4 is built.
//
// This is a separate shape from ListeningPartContent in
// listening-types.ts rather than a widening of it, and the difference is
// not cosmetic:
//
// - Parts 1 to 3 interleave conversation sections and question screens,
//   so their content is a list of sections each holding its own
//   questions. Part 4 has one clip and one flat question list, so a
//   sections array would always have exactly one entry and would say
//   nothing.
// - Parts 1 to 3 speak their questions and print nothing, so a question
//   there is an audio URL plus options. A question here is printed text
//   split around a blank and has no clip of its own.
// - The flows differ. Parts 1 to 3 walk one question per screen and gate
//   Next on that one answer. Part 4 shows all five at once and gates Next
//   on the whole set.
//
// Merging the two would produce a type where half the fields are unset
// for any given part, so they stay apart. What they do share is imported
// rather than copied: the scenario shape, the instruction bullet shape,
// and the answer key entry.
//
// This file holds types only, no runtime values, so it can be imported
// from a server component or a client component without pulling any
// behaviour along with it. The helpers live in
// listening-dropdown-flow.ts. Same rule listening-types.ts follows.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ExamInstruction } from "./instruction-screen-types";
import type { ListeningAnswerKeyEntry } from "./listening-review-types";
import type { ListeningScenario } from "./listening-types";

// One choice in a completion dropdown.
//
// The id is what the answer map stores, never the option text, so the
// wording can be corrected later without invalidating a stored answer.
// Same rule as ListeningOption.
export type ListeningDropdownOption = {
  id: string;
  text: string;
};

// One completion question: an incomplete statement and the choices that
// finish it.
//
// The statement is stored split around the blank rather than as one
// string with a placeholder in it, so the screen decides how the blank is
// drawn and no component has to parse a sentence. In Mock Test 1 Part 4
// every blank ends its statement, so textAfter is unset throughout, but
// Parts 5 and 6 have blanks mid sentence and will use it.
export type ListeningDropdownQuestion = {
  id: string;
  // Position inside the part, counting from 1. Display only.
  number: number;
  // Statement text up to the blank.
  textBefore: string;
  // Statement text after the blank. Unset when the blank ends the
  // statement.
  textAfter?: string;
  options: ListeningDropdownOption[];
  // Correct option id, for a part whose key is written question by
  // question. The part level answerKey list below wins where both exist.
  // Mock Test 1 Part 4 uses the list, so this stays unset there.
  correctOptionId?: string;
};

// The single media item a dropdown part is built around.
//
// url is a clip for Part 4 and Part 6 and a video for Part 5, which is
// why the field is not named audioUrl. Only the audio case is built.
export type ListeningDropdownMedia = {
  url: string;
  // Learner facing clip name, for example "News item audio".
  title: string;
  // Running time as text, for example "About 1.5 minutes". Display only,
  // and taken from the source document rather than measured.
  durationLabel?: string;
};

// One dropdown completion Listening part, as the engine consumes it.
export type ListeningDropdownPartContent = {
  // For example "mock-test-1".
  testId: string;
  // For example "listening-part-4".
  sectionId: string;
  // Full title for the exam top bar.
  title: string;
  // Short part name, for example "Listening to a News Item".
  partTitle: string;
  // Sentence under the instructions heading on the part intro screen.
  subtitle?: string;
  instructions: ExamInstruction[];
  scenario: ListeningScenario;
  media: ListeningDropdownMedia;
  // Instruction line above the media player, for example "Listen to the
  // following news item."
  mediaInstruction?: string;
  // Instruction line above the question list.
  questionInstruction?: string;
  questions: ListeningDropdownQuestion[];

  // Answer key for the whole part, one entry per question.
  //
  // Optional, because a part can be built and walked through before its
  // key exists. An entry with correctOptionId null is a question whose
  // key is known to be missing.
  //
  // A complete key must never reach the browser. See
  // withoutListeningDropdownAnswerKey in listening-dropdown-flow.ts.
  answerKey?: ListeningAnswerKeyEntry[];

  // Answer and explanation sheet published with the source test, as an
  // image. Referenced from Cloudinary and never downloaded. Held for the
  // review ticket, and rendered nowhere in EXAM-09.
  answerExplanationImageUrl?: string;
  // Description for a learner who cannot see the sheet. Required whenever
  // answerExplanationImageUrl is set, which the content file enforces by
  // always writing both together.
  answerExplanationImageAlt?: string;
};

// Answers held while a learner works through a dropdown part.
//
// Keyed by question id, valued by the selected option id, which is the
// { questionId: selectedOptionId } shape the review ticket needs.
// Nothing here is written to a database.
export type ListeningDropdownAnswerMap = Readonly<Record<string, string>>;

// One screen in a dropdown part flow.
//
// A discriminated union rather than a screen index, for the same reason
// ListeningScreen is one: adding a screen kind should be a compile error
// everywhere it matters.
//
// Shorter than ListeningScreen because the shape of the part is simpler.
// There is one media screen and one question screen, neither of which
// needs an index, so no screen here points back into the content.
export type ListeningDropdownScreen =
  | { kind: "part-intro"; id: string }
  | { kind: "scenario"; id: string }
  | { kind: "media"; id: string }
  // Every question in the part, on one screen.
  | { kind: "questions"; id: string }
  // Closing screens, added by EXAM-10. Same three kinds ListeningScreen
  // names, and deliberately the same names: the screens themselves are
  // shared components, so a dropdown part and a section part reach the
  // end of a run the same way.
  | { kind: "answer-review"; id: string }
  | { kind: "score"; id: string }
  | { kind: "part-end"; id: string }
  // Closing screen for a part whose review and score are not built yet.
  // Part 4 ended here through EXAM-09. Kept for the dropdown parts that
  // are not built, which can ship before their review does.
  | { kind: "part-complete"; id: string };
