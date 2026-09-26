import { cx } from "@/features/design/design-tokens";
import {
  examReview,
  examReviewStatusTones,
} from "@/features/exam-engine/exam-theme";
import {
  listeningReviewCopy,
  listeningReviewStatusLabels,
} from "@/features/exam-engine/listening-review-copy";
import type { ListeningReviewCopy } from "@/features/exam-engine/listening-review-copy";
import type { ListeningReviewRow } from "@/features/exam-engine/listening-review-types";

// Answer review table for a Listening part (EXAM-04).
//
// A real table element, not a grid of divs, because this is tabular data:
// one row per question, four columns, and a header row. Screen readers
// get the column association for free, and the correct answer column can
// be empty without the row losing its shape.
//
// The correct answer column prints "Answer key pending" rather than a
// blank or a dash when the key for that question is not transcribed yet.
// A blank cell reads as a missing value in the learner's answer, which is
// the wrong story.
//
// Presentational only. It receives rows already built by
// buildListeningReviewRows and looks nothing up itself.
//
// EXAM-06 added the copy prop. Only the table caption is part specific,
// but the caption names the part out loud to a screen reader, so it has
// to say the right one.
//
// EXAM-10 added the printed question under the question number, for the
// dropdown completion parts. A row there is a sentence fragment in the
// answer columns, so the number alone would not say what was asked. The
// field is optional and Listening Parts 1 to 3 leave it unset, so their
// rows render exactly as they did.

export type ListeningAnswerReviewTableProps = {
  rows: ListeningReviewRow[];
  // Wording for the part. Defaults to Listening Part 1.
  copy?: ListeningReviewCopy;
};

export function ListeningAnswerReviewTable({
  rows,
  copy = listeningReviewCopy,
}: ListeningAnswerReviewTableProps) {
  return (
    <div className={examReview.wrap}>
      <table className={examReview.table}>
        <caption className={examReview.caption}>{copy.tableCaption}</caption>

        <thead>
          <tr className={examReview.headRow}>
            <th scope="col" className={examReview.headCell}>
              {copy.columnQuestion}
            </th>
            <th scope="col" className={examReview.headCell}>
              {copy.columnSelected}
            </th>
            <th scope="col" className={examReview.headCell}>
              {copy.columnCorrect}
            </th>
            <th scope="col" className={examReview.headCell}>
              {copy.columnStatus}
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const hasCorrectAnswer = Boolean(row.correctOptionText);

            return (
              <tr key={row.questionId} className={examReview.row}>
                <th scope="row" className={examReview.numberCell}>
                  {row.label}

                  {/* Printed question, for a part that prints its
                      questions. Listening Parts 1 to 3 set no statement
                      and this renders nothing, so their rows are
                      unchanged. */}
                  {row.statement ? (
                    <span className={examReview.statement}>
                      {row.statement}
                    </span>
                  ) : null}
                </th>

                <td
                  className={
                    row.selectedOptionText
                      ? examReview.cell
                      : examReview.emptyCell
                  }
                >
                  {row.selectedOptionText ?? copy.noAnswerText}
                </td>

                <td
                  className={
                    hasCorrectAnswer ? examReview.cell : examReview.emptyCell
                  }
                >
                  {row.correctOptionText ?? copy.pendingAnswerText}

                  {row.explanation ? (
                    <span className={examReview.explanation}>
                      {row.explanation}
                    </span>
                  ) : null}
                </td>

                <td
                  className={cx(
                    examReview.statusCell,
                    examReviewStatusTones[row.status],
                  )}
                >
                  {listeningReviewStatusLabels[row.status]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
