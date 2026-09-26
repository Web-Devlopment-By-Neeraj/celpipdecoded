import {
  examReview,
  examSectionReview,
} from "@/features/exam-engine/exam-theme";
import {
  formatListeningSectionCountOfTotal,
  listeningSectionCopy,
} from "@/features/exam-engine/listening-section-copy";
import type { ListeningSectionCopy } from "@/features/exam-engine/listening-section-copy";
import type { ListeningSectionPartResult } from "@/features/exam-engine/listening-section-types";

// Part breakdown for the full Listening practice score (EXAM-15).
//
// One row per part: Part 1 correct out of 8, Part 2 correct out of 5, and
// so on. It is the answer to the question a single section percentage
// cannot answer, which is where the marks were lost.
//
// A real table element, not a grid of divs, because this is tabular data,
// and it reuses the EXAM-04 review table chrome so the breakdown and the
// answer review read as the same kind of object.
//
// A part whose answer key is incomplete prints the pending word in the
// correct column rather than a number or a blank. A blank cell reads as a
// missing value in the learner's answers, which is the wrong story, and a
// number there would be counted against a partial key. Every Mock Test 1
// part has a complete key today, so this is a guard rather than the state
// in use.
//
// No CELPIP level and no official score appears here, per part or in
// total.
//
// Presentational only. It receives results already marked on the server.

export type ListeningSectionScoreBreakdownProps = {
  parts: ListeningSectionPartResult[];
  copy?: ListeningSectionCopy;
};

export function ListeningSectionScoreBreakdown({
  parts,
  copy = listeningSectionCopy,
}: ListeningSectionScoreBreakdownProps) {
  return (
    <div className={examSectionReview.breakdown}>
      <p className={examSectionReview.breakdownTitle}>{copy.breakdownTitle}</p>

      <div className={examReview.wrap}>
        <table className={examReview.table}>
          <caption className={examReview.caption}>
            {copy.breakdownTitle}
          </caption>

          <thead>
            <tr className={examReview.headRow}>
              <th scope="col" className={examReview.headCell}>
                {copy.breakdownPartColumn}
              </th>
              <th scope="col" className={examReview.headCell}>
                {copy.breakdownAnsweredColumn}
              </th>
              <th scope="col" className={examReview.headCell}>
                {copy.breakdownCorrectColumn}
              </th>
            </tr>
          </thead>

          <tbody>
            {parts.map((part) => (
              <tr key={part.partNumber} className={examReview.row}>
                <th scope="row" className={examReview.numberCell}>
                  {part.partLabel}
                </th>

                <td className={examReview.cell}>
                  {formatListeningSectionCountOfTotal(
                    part.summary.answeredCount,
                    part.summary.totalQuestions,
                  )}
                </td>

                <td
                  className={
                    part.summary.correctCount === null
                      ? examReview.emptyCell
                      : examReview.cell
                  }
                >
                  {part.summary.correctCount === null
                    ? copy.pendingValue
                    : formatListeningSectionCountOfTotal(
                        part.summary.correctCount,
                        part.summary.totalQuestions,
                      )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
