import {
  examReview,
  examSectionReview,
} from "@/features/exam-engine/exam-theme";
import {
  formatReadingScorePercent,
  formatReadingSectionCountOfTotal,
  readingSectionCopy,
} from "@/features/exam-engine/reading-copy";
import type { ReadingSectionCopy } from "@/features/exam-engine/reading-copy";
import type { ReadingSectionPartResult } from "@/features/exam-engine/reading-section-types";

// Part breakdown for the full Reading practice score (EXAM-24).
//
// One row per part: Part 1 correct out of 11, Part 2 correct out of 8,
// Part 3 out of 9, Part 4 out of 10. It is the answer to the question a
// single section percentage cannot answer, which is where the marks were
// lost.
//
// Every denominator is the part's own question count, taken from the
// summary the server counted off that part's content. Nothing here is
// written down, so a part gaining a question moves its row and the
// section total together.
//
// A real table element, not a grid of divs, because this is tabular data,
// and it reuses the EXAM-04 review table chrome so the breakdown and the
// answer review read as the same kind of object.
//
// It carries five readings per part rather than the Listening
// breakdown's two, because the Reading summary has them and a learner
// comparing four parts wants to see which one they left blank as well as
// which one they got wrong. Blank is a column of its own for the reason
// the score card gives: a blank counts as incorrect in the percentage,
// and "you left three of Part 3 empty" is a different fact from "you got
// three of Part 3 wrong".
//
// No CELPIP level and no estimated band appears here, per part or in
// total. The band is a reading of the whole section and it has its own
// card above this one.
//
// Presentational only. It receives results already marked on the server.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ReadingPartBreakdownCardProps = {
  parts: ReadingSectionPartResult[];
  copy?: ReadingSectionCopy;
};

export function ReadingPartBreakdownCard({
  parts,
  copy = readingSectionCopy,
}: ReadingPartBreakdownCardProps) {
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
                {copy.breakdownQuestionsColumn}
              </th>
              <th scope="col" className={examReview.headCell}>
                {copy.breakdownAnsweredColumn}
              </th>
              <th scope="col" className={examReview.headCell}>
                {copy.breakdownBlankColumn}
              </th>
              <th scope="col" className={examReview.headCell}>
                {copy.breakdownCorrectColumn}
              </th>
              <th scope="col" className={examReview.headCell}>
                {copy.breakdownScoreColumn}
              </th>
            </tr>
          </thead>

          <tbody>
            {parts.map((part) => (
              <tr key={part.partId} className={examReview.row}>
                <th scope="row" className={examReview.numberCell}>
                  {part.partLabel}
                  <span className={examReview.statement}>{part.partTitle}</span>
                </th>

                <td className={examReview.cell}>
                  {part.summary.totalQuestions}
                </td>

                <td className={examReview.cell}>
                  {formatReadingSectionCountOfTotal(
                    part.summary.answeredCount,
                    part.summary.totalQuestions,
                  )}
                </td>

                <td className={examReview.cell}>
                  {formatReadingSectionCountOfTotal(
                    part.summary.blankCount,
                    part.summary.totalQuestions,
                  )}
                </td>

                <td className={examReview.cell}>
                  {formatReadingSectionCountOfTotal(
                    part.summary.correctCount,
                    part.summary.totalQuestions,
                  )}
                </td>

                <td className={examReview.cell}>
                  {formatReadingScorePercent(part.summary.percentage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
