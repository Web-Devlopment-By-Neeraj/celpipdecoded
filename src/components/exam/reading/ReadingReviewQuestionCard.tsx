import { cx } from "@/features/design/design-tokens";
import {
  examReadingReview,
  examReadingReviewStatusTones,
} from "@/features/exam-engine/exam-theme";
import {
  formatReadingQuestionLabel,
  readingReviewCopy,
  readingReviewStatusLabels,
} from "@/features/exam-engine/reading-copy";
import { resolveReadingReviewStatus } from "@/features/exam-engine/reading-review";
import type { ReadingReviewRow } from "@/features/exam-engine/reading-types";

// One question in the Reading answer review (EXAM-17).
//
// A card rather than a table row, which is where the Reading review parts
// company with the Listening one. A Listening row is a number and two
// short options, so four columns fit; a Reading Part 1 row is a full
// sentence stem plus two option texts that are themselves sentences, and
// 11 of those in a four column table would be a wall of wrapped prose
// with a horizontal scrollbar under it. The card gives the question its
// own full width line and puts the two answers side by side underneath.
//
// It is the same boxed block the question screen draws, on purpose: a
// bordered item, a tinted header strip carrying the number and the
// question, and the content in the body under it. A learner reviewing
// question 7 should recognise the box they answered it in.
//
// Three states, and the status word in the header says which:
//
// - Correct. The selected option matched the key.
// - Incorrect. It did not.
// - Blank. Nothing was selected. The selected answer column says "No
//   answer selected" in the quiet tone, and the correct answer is still
//   printed, because that is the point of reviewing a blank.
//
// The status word is coloured but is not a badge, so a column of 11 of
// them stays readable.
//
// Presentational only. It receives a row already built by
// buildReadingReviewRows on the server, and looks nothing up: no content
// object, no answer key, and no marking of its own.
//
// The explanation strip is printed only when the source gives one. Mock
// Test 1 publishes no Reading explanations, so it draws nothing there.
// Nothing invents an explanation and no AI writes one.

export type ReadingReviewQuestionCardProps = {
  row: ReadingReviewRow;
};

export function ReadingReviewQuestionCard({
  row,
}: ReadingReviewQuestionCardProps) {
  const status = resolveReadingReviewStatus(row);

  return (
    <li className={examReadingReview.card}>
      <div className={examReadingReview.header}>
        <span className={examReadingReview.number}>
          {formatReadingQuestionLabel(row.questionNumber)}
        </span>

        <span className={examReadingReview.question}>{row.questionText}</span>

        <span
          className={cx(
            examReadingReview.status,
            examReadingReviewStatusTones[status],
          )}
        >
          {readingReviewStatusLabels[status]}
        </span>
      </div>

      <div className={examReadingReview.body}>
        <div className={examReadingReview.answer}>
          <span className={examReadingReview.answerLabel}>
            {readingReviewCopy.yourAnswerLabel}
          </span>
          <span
            className={
              row.selectedOptionText
                ? examReadingReview.answerText
                : examReadingReview.answerTextEmpty
            }
          >
            {row.selectedOptionText ?? readingReviewCopy.noAnswerText}
          </span>
        </div>

        <div className={examReadingReview.answer}>
          <span className={examReadingReview.answerLabel}>
            {readingReviewCopy.correctAnswerLabel}
          </span>
          <span
            className={
              row.correctOptionText
                ? examReadingReview.answerTextCorrect
                : examReadingReview.answerTextEmpty
            }
          >
            {/* The fallback is for a part with no usable key for the
                question. Mock Test 1 Reading Part 1 never reaches it: its
                key is complete and confirmed. */}
            {row.correctOptionText ?? readingReviewCopy.missingAnswerText}
          </span>
        </div>
      </div>

      {row.explanation ? (
        <p className={examReadingReview.explanation}>{row.explanation}</p>
      ) : null}
    </li>
  );
}
