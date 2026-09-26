import { examSpeakingReview } from "@/features/exam-engine/exam-theme";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockMistake } from "@/features/exam-engine/speaking-mock-evaluation-types";

// Top mistakes for one Speaking task (EXAM-28).
//
// Up to eight corrections, each one a pair: the learner's own words as
// the transcript recorded them, and the stronger version. A correction
// shown as a pair can be seen; the same correction written out as a
// sentence has to be parsed, and a learner reading eight of those has
// stopped reading by the fourth.
//
// The original is struck through and the correction is not. That is the
// whole visual language of the block, and it is deliberately not red and
// green: this is practice feedback on an answer a learner just spoke
// under time pressure, and a column of red is a discouraging thing to
// hand someone. The strike-through says which half is which without
// scoring it.
//
// Each pair carries the criterion it belongs to, so a learner can see
// that four of their eight corrections are Listenability and act on the
// pattern rather than on eight separate facts.
//
// One thing worth saying about a spoken original: the words in the left
// half came through an automatic transcription, so an occasional one
// will not be what the learner actually said. The transcript card above
// carries the note that says so, which is why it sits above this block
// on the card rather than below it.
//
// A task with no corrections says so, rather than rendering an empty
// block. That is a real result for a clean answer and it should read as
// one.
//
// Presentational only. It holds no state.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingTopMistakesCardProps = {
  mistakes: SpeakingMockMistake[];
  // Heading above the list. Defaults to the top mistakes heading, and is
  // overridden by the rewrite card, which shows the same pairs under
  // "What changed".
  heading?: string;
  // Shown in place of the list when there are no corrections. Pass null
  // to render nothing at all in that case.
  emptyText?: string | null;
  copy?: SpeakingMockCopy;
};

export function SpeakingTopMistakesCard({
  mistakes,
  heading,
  emptyText,
  copy = speakingMockCopy,
}: SpeakingTopMistakesCardProps) {
  const title = heading ?? copy.reviewTopMistakesHeading;
  const empty = emptyText === undefined ? copy.reviewNoMistakesText : emptyText;

  if (mistakes.length === 0 && empty === null) {
    return null;
  }

  return (
    <section className={examSpeakingReview.section}>
      <h4 className={examSpeakingReview.sectionTitle}>{title}</h4>

      {mistakes.length === 0 ? (
        <p className={examSpeakingReview.sectionText}>{empty}</p>
      ) : (
        <ul className={examSpeakingReview.mistakeList}>
          {mistakes.map((mistake, index) => (
            <li
              // The corrections have no ids and two of them can quote the
              // same words, so the index is part of the key. The list is
              // never reordered or filtered after it is rendered, so an
              // index key is stable here.
              key={mistake.original + "-" + index}
              className={examSpeakingReview.mistakeRow}
            >
              <div className={examSpeakingReview.mistakePair}>
                <div className={examSpeakingReview.mistakeHalf}>
                  <span className={examSpeakingReview.mistakeLabel}>
                    {copy.reviewMistakeOriginalLabel}
                  </span>
                  <span className={examSpeakingReview.mistakeOriginal}>
                    {mistake.original}
                  </span>
                </div>

                <div className={examSpeakingReview.mistakeHalf}>
                  <span className={examSpeakingReview.mistakeLabel}>
                    {copy.reviewMistakeCorrectionLabel}
                  </span>
                  <span className={examSpeakingReview.mistakeCorrection}>
                    {mistake.correction}
                  </span>
                </div>
              </div>

              <p className={examSpeakingReview.mistakeCriterion}>
                {mistake.criterion}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
