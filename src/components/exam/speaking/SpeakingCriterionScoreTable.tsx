import { examReview } from "@/features/exam-engine/exam-theme";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCriterionResult } from "@/features/exam-engine/speaking-mock-evaluation-types";

// Criterion levels for one Speaking task (EXAM-28).
//
// Four rows, one per CELPIP Speaking criterion: Content/Coherence,
// Vocabulary, Listenability and Task Fulfillment. The third is
// Listenability and not Readability, which is the Writing criterion; the
// server validates the four names against a closed enum, so a table with
// the wrong criterion in it cannot reach this component.
//
// A table rather than four cards, and this is the one place on the
// result screen where a table is the right shape. Every row holds the
// same four short things, the criterion names are being compared against
// each other rather than read in isolation, and a learner scanning for
// their weakest criterion should be able to run their eye down one
// column. That is what the Listening and Reading reviews use examReview
// for and this reuses it rather than drawing new chrome.
//
// The two prose columns are the point of the table rather than
// decoration on it. The level on its own says where the answer sits;
// evidence says what in the answer put it there, and missingForNextLevel
// says the one change that would move it up. A criterion table without
// those two is a score card a learner cannot act on.
//
// Renders nothing when there are no criteria, which is what a task with
// no reviewable recording carries: there is nothing to judge against a
// criterion when nothing was said, and four rows all reading "No
// recording" would say nothing four times. The task card draws its
// status block instead.
//
// Presentational only. It holds no state and computes nothing.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingCriterionScoreTableProps = {
  criteria: SpeakingMockCriterionResult[];
  // Accessible caption, normally the task name, so a screen reader user
  // moving between eight tables can tell which task each belongs to.
  caption: string;
  copy?: SpeakingMockCopy;
};

export function SpeakingCriterionScoreTable({
  criteria,
  caption,
  copy = speakingMockCopy,
}: SpeakingCriterionScoreTableProps) {
  if (criteria.length === 0) {
    return null;
  }

  return (
    <div className={examReview.wrap}>
      <table className={examReview.table}>
        <caption className={examReview.caption}>{caption}</caption>

        <thead>
          <tr className={examReview.headRow}>
            <th scope="col" className={examReview.headCell}>
              {copy.reviewCriterionColumn}
            </th>
            <th scope="col" className={examReview.headCell}>
              {copy.reviewCriterionLevelColumn}
            </th>
            <th scope="col" className={examReview.headCell}>
              {copy.reviewCriterionEvidenceColumn}
            </th>
            <th scope="col" className={examReview.headCell}>
              {copy.reviewCriterionNextColumn}
            </th>
          </tr>
        </thead>

        <tbody>
          {criteria.map((entry) => (
            <tr key={entry.criterion} className={examReview.row}>
              <th scope="row" className={examReview.cell}>
                {entry.criterion}
              </th>

              <td className={examReview.numberCell}>{entry.level}</td>

              <td className={examReview.cell}>{entry.evidence}</td>

              <td className={examReview.cell}>{entry.missingForNextLevel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
