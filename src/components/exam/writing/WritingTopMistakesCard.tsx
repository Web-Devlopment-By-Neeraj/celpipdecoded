import { examWritingReview } from "@/features/exam-engine/exam-theme";
import { writingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockMistake } from "@/features/exam-engine/writing-mock-evaluation-types";

// Top mistakes for one Writing task (EXAM-26).
//
// Up to eight corrections, each one a pair: the learner's own words, and
// the stronger version. A correction shown as a pair can be seen; the
// same correction written out as a sentence has to be parsed, and a
// learner reading eight of those has stopped reading by the fourth.
//
// The original is struck through and the correction is not. That is the
// whole visual language of the block, and it is deliberately not red and
// green: this is practice feedback on writing a learner just produced
// under time pressure, and a column of red is a discouraging thing to
// hand someone. The strike-through says which half is which without
// scoring it.
//
// Each pair carries the criterion it belongs to, so a learner can see
// that four of their eight corrections are Readability and act on the
// pattern rather than on eight separate facts.
//
// A task with no corrections says so, rather than rendering an empty
// block. That is a real result for a clean response and it should read as
// one.
//
// Presentational only. It holds no state.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingTopMistakesCardProps = {
  mistakes: WritingMockMistake[];
  // Heading above the list. Defaults to the top mistakes heading, and is
  // overridden by the rewrite card, which shows the same pairs under
  // "What changed".
  heading?: string;
  // Shown in place of the list when there are no corrections. Pass null
  // to render nothing at all in that case.
  emptyText?: string | null;
  copy?: WritingMockCopy;
};

export function WritingTopMistakesCard({
  mistakes,
  heading,
  emptyText,
  copy = writingMockCopy,
}: WritingTopMistakesCardProps) {
  const title = heading ?? copy.reviewTopMistakesHeading;
  const empty = emptyText === undefined ? copy.reviewNoMistakesText : emptyText;

  if (mistakes.length === 0 && empty === null) {
    return null;
  }

  return (
    <section className={examWritingReview.section}>
      <h4 className={examWritingReview.sectionTitle}>{title}</h4>

      {mistakes.length === 0 ? (
        <p className={examWritingReview.sectionText}>{empty}</p>
      ) : (
        <ul className={examWritingReview.mistakeList}>
          {mistakes.map((mistake, index) => (
            <li
              // The corrections have no ids and two of them can quote the
              // same words, so the index is part of the key. The list is
              // never reordered or filtered after it is rendered, so an
              // index key is stable here.
              key={mistake.original + "-" + index}
              className={examWritingReview.mistakeRow}
            >
              <div className={examWritingReview.mistakePair}>
                <div className={examWritingReview.mistakeHalf}>
                  <span className={examWritingReview.mistakeLabel}>
                    {copy.reviewMistakeOriginalLabel}
                  </span>
                  <span className={examWritingReview.mistakeOriginal}>
                    {mistake.original}
                  </span>
                </div>

                <div className={examWritingReview.mistakeHalf}>
                  <span className={examWritingReview.mistakeLabel}>
                    {copy.reviewMistakeCorrectionLabel}
                  </span>
                  <span className={examWritingReview.mistakeCorrection}>
                    {mistake.correction}
                  </span>
                </div>
              </div>

              <p className={examWritingReview.mistakeCriterion}>
                {mistake.criterion}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
