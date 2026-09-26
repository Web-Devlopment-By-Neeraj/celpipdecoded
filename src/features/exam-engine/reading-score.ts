// Practice scoring for a Reading part (EXAM-17).
//
// Pure functions with no React, no side effects and no storage, so they
// run on the server beside the answer key, which is where the marking has
// to happen for the key to stay off the page.
//
// The summary is counted from the review rows rather than marked a second
// time. buildReadingReviewRows in reading-review.ts is the one place a
// Reading answer meets a Reading key, so a question can never be correct
// in the review and wrong in the score, and a rule change lands in one
// function instead of two. The cost is one extra pass over 11 rows, which
// is nothing.
//
// The scoring rules, all of them:
//
// - correct is a selected option that matches the key
// - a blank counts as incorrect, and is also counted separately, so the
//   percentage means "of the whole part" rather than "of what was
//   attempted"
// - incorrectCount includes the blanks, so correct plus incorrect is
//   always the whole part and the two numbers cannot leave a gap a
//   learner has to work out
// - percentage is correct over total, rounded to a whole percent
//
// There is no band estimate here and no CELPIP level anywhere. A Reading
// band needs the full Reading section, and one part is not a section.
// EXAM-17 stops at the practice percentage on purpose.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { buildReadingReviewRows } from "./reading-review";
import type {
  ReadingAnswerMap,
  ReadingMarkedPart,
  ReadingPartContent,
  ReadingReviewOptions,
  ReadingReviewRow,
  ReadingScoreSummary,
} from "./reading-types";

// Practice score as a whole percentage.
//
// A part with no questions scores zero rather than dividing by zero. It
// is a content bug either way, and a zero is at least a number a screen
// can print.
function scorePercent(correctCount: number, totalQuestions: number): number {
  if (totalQuestions === 0) {
    return 0;
  }

  return Math.round((correctCount / totalQuestions) * 100);
}

// Everything the score screen needs, counted from finished review rows.
//
// Exported for a caller that already holds the rows, which is what
// markReadingPartOne does: it builds the rows once and counts them,
// rather than building them twice.
export function summarizeReadingReviewRows(
  rows: ReadingReviewRow[],
): ReadingScoreSummary {
  const totalQuestions = rows.length;
  const blankCount = rows.filter((row) => row.isBlank).length;
  const correctCount = rows.filter((row) => row.isCorrect).length;

  return {
    totalQuestions,
    answeredCount: totalQuestions - blankCount,
    correctCount,
    // Blanks are included here, which is what "a blank counts as
    // incorrect" means in the score. blankCount is beside it so the
    // screen can still say how many of them were left empty.
    incorrectCount: totalQuestions - correctCount,
    blankCount,
    percentage: scorePercent(correctCount, totalQuestions),
  };
}

// Everything the score screen needs, for a caller holding content and
// answers.
export function buildReadingScoreSummary(
  content: ReadingPartContent,
  answers: ReadingAnswerMap,
  options: ReadingReviewOptions = {},
): ReadingScoreSummary {
  return summarizeReadingReviewRows(
    buildReadingReviewRows(content, answers, options),
  );
}

// Mark a whole Reading part in one pass: the review rows and the summary
// counted from them.
//
// This is what the server action returns, and it is the reason the action
// itself is six lines of session check and a call. The rows are built
// once and counted once, so nothing is marked twice and the two halves of
// the result are guaranteed to be talking about the same marking.
export function markReadingPart(
  content: ReadingPartContent,
  answers: ReadingAnswerMap,
  // EXAM-19: the only thing a part gets to say about its own marking.
  // Reading Part 2 uses it to name its blanks after the email they sit
  // in. The counting below is identical for every Reading part and
  // takes no options, which is the point of one shared marker.
  options: ReadingReviewOptions = {},
): ReadingMarkedPart {
  const rows = buildReadingReviewRows(content, answers, options);

  return {
    rows,
    summary: summarizeReadingReviewRows(rows),
  };
}
