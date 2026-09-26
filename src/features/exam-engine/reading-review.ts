// Answer review rows for a Reading part (EXAM-17).
//
// The Reading counterpart of the row building half of listening-score.ts.
// Pure functions over the part content and the answer map: no React, no
// side effects, no storage, no network, so the same helpers run on the
// server beside the answer key, which is the only place they are meant to
// run.
//
// This file is the one place a Reading answer is compared to a Reading
// key. reading-score.ts counts the rows this file produces rather than
// marking a second time, so the score and the review cannot disagree
// about a single question. That is the whole reason the two files are
// split this way round.
//
// It is deliberately not merged into listening-score.ts. The Listening
// core carries a fourth outcome, "answer key pending", because Listening
// was built while its keys were still being read off answer images, and
// its summary can withhold a score for the same reason. Reading Part 1
// ships with a complete key printed in the source document, so widening
// the Listening core to take a fifth content shape would mean importing
// a nullable score into a section that does not have one.
//
// Key resolution order per question, the same order Listening uses:
//
//   1. content.answerKey entry for the question, when its correctOptionId
//      is set
//   2. question.correctOptionId, for a part whose key is written question
//      by question
//   3. nothing, which leaves correctOptionId null on the row
//
// A key that names an option the question does not have is discarded and
// counts as missing, because a stale id in the key is a content bug and
// marking every learner wrong over it would be the worst answer
// available. A question with no usable key is never counted correct, and
// Mock Test 1 Reading Part 1 has none: its key is complete and confirmed,
// and reading-part-1.ts records where every entry came from.
//
// Nothing here writes an explanation. The source document publishes none
// for Reading, so the field is null throughout, and no AI and no guess
// fills it in.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { readingReviewCopy } from "./reading-copy";
import { listReadingQuestions } from "./reading-flow";
import type {
  ReadingAnswerKeyEntry,
  ReadingAnswerMap,
  ReadingPartContent,
  ReadingQuestion,
  ReadingReviewOptions,
  ReadingReviewRow,
  ReadingReviewStatus,
} from "./reading-types";

// Answer key entries by question id, built once per call rather than
// searched per question.
function indexAnswerKey(
  answerKey: ReadingAnswerKeyEntry[] | undefined,
): Map<string, ReadingAnswerKeyEntry> {
  const index = new Map<string, ReadingAnswerKeyEntry>();

  answerKey?.forEach((entry) => {
    index.set(entry.questionId, entry);
  });

  return index;
}

// The correct option for a question, or null when there is no usable key
// for it.
function resolveCorrectOptionId(
  question: ReadingQuestion,
  entry: ReadingAnswerKeyEntry | undefined,
): string | null {
  const candidate = entry?.correctOptionId ?? question.correctOptionId;

  if (!candidate) {
    return null;
  }

  // Discard a key that does not name one of this question's options.
  return question.options.some((option) => option.id === candidate)
    ? candidate
    : null;
}

// The option text for an id, or null when the id is unset or unknown.
function findOptionText(
  question: ReadingQuestion,
  optionId: string | null,
): string | null {
  if (!optionId) {
    return null;
  }

  return (
    question.options.find((option) => option.id === optionId)?.text ?? null
  );
}

// The question as the review prints it.
//
// Two shapes, the same two the question list draws:
//
// - A stem question, 1 to 6 in Reading Part 1, prints its sentence with
//   three dots where the blank falls. Dots rather than the row of
//   underscores the question screen draws: on the question screen the
//   underscores mark where the control goes, and in the review the answer
//   is already printed beside the stem, so the same underscores would be
//   noise. This is the rule formatListeningStatementLabel settled for the
//   Listening dropdown parts.
// - A blank inside the reply, 7 to 11, prints no stem of its own. The
//   sentence it completes is in the letter, and repeating anything here
//   would be inventing a stem the source does not have, so the row says
//   which blank it is instead.
// - A whole question, added by EXAM-18 for Reading Part 2 questions 6 to
//   8, prints as it stands. There is no blank in it, so there is nothing
//   to mark with dots.
//
// The whole question case is handled here rather than left to the ticket
// that builds the Part 2 review, because without it a whole question
// would fall through to the reply blank branch below and print "Blank in
// the written response." against a question that is not a blank and has
// no reply. Nothing calls this with a Part 2 question yet: EXAM-18 builds
// no Reading Part 2 review and no Reading Part 2 score. This is the
// shared helper being made correct for a shape that now exists, not the
// review being started.
export function formatReadingQuestionText(
  question: ReadingQuestion,
  // EXAM-19: what to call a question that prints no stem at all. Part 1
  // leaves it unset and keeps the written reply wording; Part 2 passes
  // the email wording, because that is where its blanks are.
  blankQuestionText: string = readingReviewCopy.responseBlankQuestionText,
): string {
  if (question.text) {
    return question.text;
  }

  if (!question.textBefore) {
    return blankQuestionText;
  }

  const head = `${question.textBefore} ...`;

  return question.textAfter ? `${head} ${question.textAfter}` : head;
}

// Outcome of one question.
//
// Order matters. A blank reads as blank whether or not a key exists,
// because that fact is true either way and is the more useful thing to
// tell the learner. A question with no usable key is not correct, which
// is what the final comparison against null gives.
export function resolveReadingReviewStatus(
  row: Pick<ReadingReviewRow, "isBlank" | "isCorrect">,
): ReadingReviewStatus {
  if (row.isBlank) {
    return "blank";
  }

  return row.isCorrect ? "correct" : "incorrect";
}

// One review row per question, in part order.
//
// Every id is resolved to text here, so the review screen renders strings
// and looks nothing up. A blank keeps its correct answer, which is the
// point of reviewing one.
export function buildReadingReviewRows(
  content: ReadingPartContent,
  answers: ReadingAnswerMap,
  options: ReadingReviewOptions = {},
): ReadingReviewRow[] {
  const keyIndex = indexAnswerKey(content.answerKey);
  const blankQuestionText =
    options.blankQuestionText ?? readingReviewCopy.responseBlankQuestionText;

  return listReadingQuestions(content).map((question, index) => {
    const entry = keyIndex.get(question.id);
    const correctOptionId = resolveCorrectOptionId(question, entry);

    // An answer naming an option the question does not have is treated as
    // no answer at all. The server action sanitizes its input, so this
    // only bites on a content edit that removed an option under a
    // selection already made.
    const submitted = answers[question.id];
    const selectedOptionId =
      submitted && question.options.some((option) => option.id === submitted)
        ? submitted
        : null;

    const isBlank = selectedOptionId === null;

    return {
      questionId: question.id,
      // number is display data from the content. Fall back to the
      // position in the part so a row is never numbered zero.
      questionNumber: question.number || index + 1,
      questionText: formatReadingQuestionText(question, blankQuestionText),
      selectedOptionId,
      selectedOptionText: findOptionText(question, selectedOptionId),
      correctOptionId,
      correctOptionText: findOptionText(question, correctOptionId),
      // A blank is never correct, and neither is a question with no
      // usable key. Both fall out of the comparison rather than being
      // special cased, because correctOptionId and selectedOptionId are
      // null in those cases and null never equals a string here.
      isCorrect:
        correctOptionId !== null && selectedOptionId === correctOptionId,
      isBlank,
      explanation: entry?.explanation ?? null,
    };
  });
}
