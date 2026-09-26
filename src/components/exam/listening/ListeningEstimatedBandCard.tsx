import { examBandCard } from "@/features/exam-engine/exam-theme";
import {
  formatListeningBandBasis,
  listeningSectionCopy,
} from "@/features/exam-engine/listening-section-copy";
import type { ListeningSectionCopy } from "@/features/exam-engine/listening-section-copy";
import type { ListeningBandEstimate } from "@/features/exam-engine/listening-band-score-types";

// Estimated CELPIP Listening band on the practice score screen (EXAM-15C).
//
// One reading and the three lines that keep it honest: what it was estimated
// from, where the mapping came from, and a full sentence saying it is not an
// official CELPIP score.
//
// This component decides nothing. It prints an estimate that
// estimateListeningBand produced from the chart in
// public/Overview and Scoring Descriptors/1. Listening/Listening - Scoring.pdf,
// and it is only rendered when that function returned one, so there is no
// empty or pending state here: a score the chart does not cover means the
// screen does not show this card at all.
//
// The wording is fixed by listening-section-copy.ts and is the point of the
// card as much as the number is. It says "Estimated CELPIP Listening band",
// never official band, guaranteed band or final result, and no CELPIP
// branding, logo or colour is used anywhere on it.
//
// estimate.descriptor is rendered when it is set and is unset today. The
// project has a Listening score chart and no per level Listening descriptor
// text, so nothing is printed rather than a level description written here.

export type ListeningEstimatedBandCardProps = {
  estimate: ListeningBandEstimate;
  copy?: ListeningSectionCopy;
};

export function ListeningEstimatedBandCard({
  estimate,
  copy = listeningSectionCopy,
}: ListeningEstimatedBandCardProps) {
  // Said only when the reading actually covers two levels, so a single level
  // estimate does not carry an explanation of something it is not doing.
  const showRangeNote = estimate.levels.length > 1;

  return (
    <div className={examBandCard.card}>
      <span className={examBandCard.label}>{copy.estimatedBandLabel}</span>
      <span className={examBandCard.value}>{estimate.label}</span>

      <p className={examBandCard.basis}>
        {formatListeningBandBasis(
          estimate.correctCount,
          estimate.totalQuestions,
        )}
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
