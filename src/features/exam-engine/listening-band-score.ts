// Estimated CELPIP Listening band from a raw practice score (EXAM-15C).
//
// Pure functions and one transcribed table. No React, no side effects and
// no storage, so this runs on the server or in the browser and can be
// tested on its own.
//
// Where the table comes from
// --------------------------
//
// One file in this repository, and only that file:
//
//   public/Overview and Scoring Descriptors/1. Listening/Listening - Scoring.pdf
//
// It is a one page chart with three columns, CELPIP Level, Listening score
// /38, and Scoring Information, and it was already in the project before
// this ticket. Nothing was downloaded and nothing was invented: the nine
// rows below are that chart's nine rows, in its order, with its numbers.
// The chart is also what the Scoring Information column bases its own notes
// on, which is where the "38 scored questions" and "each correct answer
// receives 1 point" lines come from.
//
// Two properties of the chart matter for the code:
//
// 1. It is a chart out of 38. Mock Test 1 Listening has exactly 38
//    questions, which is why an estimate is possible at all. A score out of
//    any other total is not on this chart, so no estimate is produced for
//    it. That is the guard in estimateListeningBand, and it is what keeps a
//    part level score out of 8 from being handed a band.
//
// 2. The rows overlap. 30 to 33 is level 8 and 27 to 31 is level 7, so a
//    raw 31 is on both rows. That is in the source chart, not a typo here,
//    and it follows from what the chart says about how a real level is
//    produced: the official level comes from the number of points and the
//    difficulty of the questions, with score equating, so a raw count maps
//    to a neighbourhood rather than to one level. An estimate that picked
//    one side of an overlap would be inventing a precision the chart does
//    not have, so both levels are carried and printed, for example
//    "Level 7 or 8".
//
// What this file deliberately does not do
// ---------------------------------------
//
// - It does not model score equating or question difficulty. It cannot: the
//   project has the chart and nothing else.
// - It does not produce a descriptor. The Listening folder has an Overview
//   and a Scoring chart, and neither carries per level Listening descriptor
//   text. Writing was given ScoreDescriptors.pdf and Speaking was too, but
//   Listening was not, so ListeningBandEstimate.descriptor stays unset
//   rather than being filled from a level description written here.
// - It does not claim an official result. Every screen that prints an
//   estimate from this file calls it a practice estimate and says in a full
//   sentence that it is not an official CELPIP score. The wording is in
//   listening-section-copy.ts.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ListeningBandChartRow,
  ListeningBandEstimate,
} from "./listening-band-score-types";
import type { ListeningScoreSummary } from "./listening-review-types";

// The total the chart is drawn for. An attempt with any other total gets no
// estimate.
export const LISTENING_BAND_CHART_TOTAL = 38;

// The nine rows of the chart, highest level first, exactly as printed.
//
// The level labels keep the chart's own wording, including the two rows
// that name a span rather than a single level: "10-12" at the top and "M-2"
// at the bottom, where M is the minimal level below 1.
export const LISTENING_BAND_CHART: readonly ListeningBandChartRow[] = [
  { level: "10-12", minCorrect: 35, maxCorrect: 38 },
  { level: "9", minCorrect: 33, maxCorrect: 35 },
  { level: "8", minCorrect: 30, maxCorrect: 33 },
  { level: "7", minCorrect: 27, maxCorrect: 31 },
  { level: "6", minCorrect: 22, maxCorrect: 28 },
  { level: "5", minCorrect: 17, maxCorrect: 23 },
  { level: "4", minCorrect: 11, maxCorrect: 18 },
  { level: "3", minCorrect: 7, maxCorrect: 12 },
  { level: "M-2", minCorrect: 0, maxCorrect: 7 },
] as const;

// The chart levels a raw score falls on, highest first.
//
// One row for most scores, two where the rows overlap. Never more than two
// in this chart, but the display below does not rely on that.
function findChartLevels(correctCount: number): string[] {
  return LISTENING_BAND_CHART.filter(
    (row) => correctCount >= row.minCorrect && correctCount <= row.maxCorrect,
  ).map((row) => row.level);
}

// Display string for a set of chart levels.
//
// One level reads "Level 8". An overlap reads "Level 7 or 8", lowest first,
// because that is the order a learner reads a range in. The word "or" is
// deliberate: the chart does not say which of the two a real test would
// give, and neither does this.
export function formatListeningBandLabel(levels: string[]): string {
  if (levels.length === 0) {
    return "";
  }

  if (levels.length === 1) {
    return `Level ${levels[0]}`;
  }

  const lowest = levels[levels.length - 1];
  const highest = levels[0];

  return `Level ${lowest} or ${highest}`;
}

// Estimate a band for a marked Listening attempt.
//
// Returns null, and every caller has to handle it, whenever an estimate
// would not be supported by the chart:
//
// - the answer key is incomplete, so there is no correct count to map
// - the attempt is not out of 38, so it is not on this chart at all
// - the correct count is outside 0 to 38, which no marked attempt should
//   produce, and which would otherwise fall through the rows silently
//
// Nothing is extrapolated and nothing is rounded to the nearest row. An
// estimate exists when the chart covers the score and does not exist
// otherwise.
export function estimateListeningBand(
  summary: Pick<
    ListeningScoreSummary,
    "correctCount" | "totalQuestions" | "hasCompleteAnswerKey"
  >,
): ListeningBandEstimate | null {
  const { correctCount, totalQuestions, hasCompleteAnswerKey } = summary;

  if (!hasCompleteAnswerKey || correctCount === null) {
    return null;
  }

  if (totalQuestions !== LISTENING_BAND_CHART_TOTAL) {
    return null;
  }

  const levels = findChartLevels(correctCount);

  if (levels.length === 0) {
    return null;
  }

  return {
    correctCount,
    totalQuestions,
    levels,
    label: formatListeningBandLabel(levels),
  };
}
