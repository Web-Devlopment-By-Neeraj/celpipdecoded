// Types for Listening answer review and practice scoring (EXAM-04).
//
// Types only, no runtime values, so this file can be imported from a
// server component or a client component without pulling behaviour
// along with it. Same rule listening-types.ts follows.
//
// It deliberately imports nothing from listening-types.ts. The answer key
// entry is declared here and imported there, so the content type can
// carry a key without this file having to know what a part looks like.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// One answer key entry for one question.
//
// correctOptionId is null, not undefined, when the key is known to be
// missing. Null says "we looked and it is not transcribed yet", which is
// the state every Mock Test 1 Listening question is in, and it is what
// the review screen turns into "Answer key pending".
//
// source records where a key came from, so a value transcribed by hand
// from an answer image can be told apart from one that was typed out of
// the source document text.
export type ListeningAnswerKeyEntry = {
  questionId: string;
  correctOptionId: string | null;
  // Short reason the option is correct, when the source gives one.
  explanation?: string;
  source: "manual" | "answer-image";
};

// Outcome of one question, as the review table prints it.
//
// answer-key-pending is not an error state. It means the learner chose an
// option and there is nothing to check it against yet, so nothing is
// marked right or wrong.
export type ListeningReviewStatus =
  | "correct"
  | "incorrect"
  | "unanswered"
  | "answer-key-pending";

// One row of the review table.
//
// The row carries text as well as ids, so the table renders without
// reaching back into the content object for every cell.
export type ListeningReviewRow = {
  questionId: string;
  // Position in the part, counting from 1.
  questionNumber: number;
  // Short label for the question. Listening Parts 1 to 3 never print
  // their question stems, so this falls back to "Question 3" rather than
  // inventing a stem.
  label: string;
  // The printed question, when the part has one (EXAM-10).
  //
  // Set for a dropdown completion part, where the question is an
  // incomplete statement the learner reads on screen, and the review is
  // unreadable without it: "Question 2" beside "took a picture of her $20
  // bill." says nothing about what was being asked. Unset for Listening
  // Parts 1 to 3, which speak their questions and print nothing, so a row
  // there is unchanged and the table prints label alone.
  statement?: string;
  selectedOptionId?: string;
  selectedOptionText?: string;
  correctOptionId?: string;
  correctOptionText?: string;
  explanation?: string;
  status: ListeningReviewStatus;
};

// Practice result for one part.
//
// correctCount and scorePercent are null whenever the answer key is
// incomplete, so a screen cannot print a number that was calculated
// against a partial key. Any consumer has to handle null, which is the
// point.
export type ListeningScoreSummary = {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number | null;
  scorePercent: number | null;
  hasCompleteAnswerKey: boolean;
  // How many questions have no usable correct option yet.
  missingKeyCount: number;
};

// A marked part: everything the review and score screens need, and
// nothing else (EXAM-06).
//
// This exists so a part whose answer key stays on the server can be
// marked there and hand back only the result. The rows carry the correct
// option text for the questions the learner has now finished, which is
// the point at which showing it is fair, and the summary carries the
// counts. Neither carries the key itself, so nothing here lets a caller
// work out an answer it was not given.
export type ListeningMarkedPart = {
  rows: ListeningReviewRow[];
  summary: ListeningScoreSummary;
};
