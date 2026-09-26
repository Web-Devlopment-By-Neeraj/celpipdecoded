import { examBandCard } from "@/features/exam-engine/exam-theme";
import {
  formatReadingBandBasis,
  readingSectionCopy,
} from "@/features/exam-engine/reading-copy";
import type { ReadingSectionCopy } from "@/features/exam-engine/reading-copy";
import type { ReadingBandEstimate } from "@/features/exam-engine/reading-section-types";

// Estimated CELPIP Reading band on the full Reading practice score screen
// (EXAM-24).
//
// One reading and the three lines that keep it honest: what it was
// estimated from, where the mapping came from, and a full sentence saying
// it is not an official CELPIP score.
//
// This component decides nothing. It prints an estimate that
// estimateReadingBand produced from the chart in
// public/Overview and Scoring Descriptors/2. Reading/Reading - Scoring.pdf,
// and it is only rendered when that function returned one, so there is no
// empty state and no pending state here: a score the chart does not cover
// means the screen does not show this card at all.
//
// It appears on the full Reading section score screen and nowhere else.
// The four Reading part score screens show no band, because a band is a
// reading of the whole section and one part is not a section. That rule
// is enforced a level down rather than here: estimateReadingBand refuses
// any total that is not the chart's 38, and no part level code path calls
// it.
//
// The wording is fixed by reading-copy.ts and is the point of the card as
// much as the number is. It says "Estimated CELPIP Reading band", never
// official band, guaranteed band or final result, and no CELPIP branding,
// logo or colour is used anywhere on it.
//
// estimate.descriptor is rendered when it is set and is unset today. The
// program materials hold a Reading score chart and no per level Reading
// descriptor text, so nothing is printed rather than a level description
// written here.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ReadingEstimatedBandCardProps = {
  estimate: ReadingBandEstimate;
  copy?: ReadingSectionCopy;
};

export function ReadingEstimatedBandCard({
  estimate,
  copy = readingSectionCopy,
}: ReadingEstimatedBandCardProps) {
  // Said only when the reading actually covers two levels, so a single
  // level estimate does not carry an explanation of something it is not
  // doing.
  const showRangeNote = estimate.levels.length > 1;

  return (
    <div className={examBandCard.card}>
      <span className={examBandCard.label}>{copy.estimatedBandLabel}</span>
      <span className={examBandCard.value}>{estimate.label}</span>

      <p className={examBandCard.basis}>
        {formatReadingBandBasis(estimate.correctCount, estimate.totalQuestions)}
      </p>

      {estimate.descriptor ? (
        <p className={examBandCard.basis}>{estimate.descriptor}</p>
      ) : null}

      <p className={examBandCard.note}>
        {copy.estimatedBandSourceNote}
        {showRangeNote ? ` ${copy.estimatedBandRangeNote}` : ""}
      </p>

      <p className={examBandCard.note}>{copy.estimatedBandNote}</p>
    </div>
  );
}
