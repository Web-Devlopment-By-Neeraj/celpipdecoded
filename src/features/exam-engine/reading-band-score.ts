// Estimated CELPIP Reading band from a raw practice score (EXAM-24).
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
//   public/Overview and Scoring Descriptors/2. Reading/Reading - Scoring.pdf
//
// It is a one page chart with three columns, CELPIP Level, Reading score
// /38, and Scoring Information, and it was already in the project before
// this ticket. Nothing was downloaded and nothing was invented: the nine
// rows below are that chart's nine rows, in its order, with its numbers.
// It is the Reading twin of the Listening chart listening-band-score.ts
// transcribes, and the two charts are not the same: Reading level 8 is 28
// to 31 where Listening level 8 is 30 to 33, so neither table may be
// copied from the other.
//
// The Scoring Information column on the same page is where the notes in
// reading-copy.ts come from: 38 scored questions, one point per correct
// answer, no deduction for a wrong answer, and a real level calculated
// from the number of points together with the difficulty of the
// questions, with score equating.
//
// Two properties of the chart matter for the code:
//
// 1. It is a chart out of 38. Mock Test 1 Reading has exactly 38
//    questions, 11 plus 8 plus 9 plus 10, which is why an estimate is
//    possible at all. A score out of any other total is not on this
//    chart, so no estimate is produced for it. That is the guard in
//    estimateReadingBand, and it is what keeps a part level score out of
//    11 from being handed a band.
//
// 2. The rows overlap. 28 to 31 is level 8 and 24 to 28 is level 7, so a
//    raw 28 is on both rows. That is in the source chart, not a typo
//    here, and it follows from what the chart says about how a real level
//    is produced: the official level comes from the number of points and
//    the difficulty of the questions, with score equating, so a raw count
//    maps to a neighbourhood rather than to one level. An estimate that
//    picked one side of an overlap would be inventing a precision the
//    chart does not have and a tie break rule the ticket asks us not to
//    invent, so both levels are carried and printed, for example
//    "Level 7 or 8".
//
// What this file deliberately does not do
// ---------------------------------------
//
// - It does not model score equating or question difficulty. It cannot:
//   the project has the chart and nothing else.
// - It does not produce a descriptor. The Reading folder holds an
//   Overview and a Scoring chart, and neither carries per level Reading
//   descriptor text. Writing and Speaking were each given a
//   ScoreDescriptors.pdf and Reading was not, so
//   ReadingBandEstimate.descriptor stays unset rather than being filled
//   from a level description written here.
// - It does not claim an official result. Every screen that prints an
//   estimate from this file calls it a practice estimate and says in a
//   full sentence that it is not an official CELPIP score. The wording is
//   in reading-copy.ts.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ReadingBandChartRow,
  ReadingBandEstimate,
} from "./reading-section-types";
import type { ReadingScoreSummary } from "./reading-types";

// The total the chart is drawn for. An attempt with any other total gets
// no estimate.
export const READING_BAND_CHART_TOTAL = 38;

// The nine rows of the chart, highest level first, exactly as printed.
//
// The level labels keep the chart's own wording, including the two rows
// that name a span rather than a single level: "10-12" at the top and
// "M-2" at the bottom, where M is the minimal level below 1.
export const READING_BAND_CHART: readonly ReadingBandChartRow[] = [
  { level: "10-12", minCorrect: 33, maxCorrect: 38 },
  { level: "9", minCorrect: 31, maxCorrect: 33 },
  { level: "8", minCorrect: 28, maxCorrect: 31 },
  { level: "7", minCorrect: 24, maxCorrect: 28 },
  { level: "6", minCorrect: 19, maxCorrect: 25 },
  { level: "5", minCorrect: 15, maxCorrect: 20 },
  { level: "4", minCorrect: 10, maxCorrect: 16 },
  { level: "3", minCorrect: 8, maxCorrect: 11 },
  { level: "M-2", minCorrect: 0, maxCorrect: 7 },
] as const;

// The chart levels a raw score falls on, highest first.
//
// One row for most scores, two where the rows overlap. Never more than
// two in this chart, but the display below does not rely on that.
function findChartLevels(correctCount: number): string[] {
  return READING_BAND_CHART.filter(
    (row) => correctCount >= row.minCorrect && correctCount <= row.maxCorrect,
  ).map((row) => row.level);
}

// Display string for a set of chart levels.
//
// One level reads "Level 8". An overlap reads "Level 7 or 8", lowest
// first, because that is the order a learner reads a range in. The word
// "or" is deliberate: the chart does not say which of the two a real test
// would give, and neither does this.
export function formatReadingBandLabel(levels: string[]): string {
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

// Estimate a band for a marked full Reading attempt.
//
// Returns null, and every caller has to handle it, whenever an estimate
// would not be supported by the chart:
//
// - the attempt is not out of 38, so it is not on this chart at all,
//   which is what keeps an individual Reading part from being handed a
//   band
// - the correct count is outside 0 to 38, which no marked attempt should
//   produce, and which would otherwise fall through the rows silently
//
// Nothing is extrapolated and nothing is rounded to the nearest row. An
// estimate exists when the chart covers the score and does not exist
// otherwise.
//
// There is no incomplete key branch here, unlike the Listening twin.
// ReadingScoreSummary carries no hasCompleteAnswerKey field, because
// every Reading part ships with a complete key printed in the source
// document and reading-score.ts was built on that. A Reading part with a
// missing key would score those questions as incorrect, which is a
// content bug to fix rather than a state to model.
export function estimateReadingBand(
  summary: Pick<ReadingScoreSummary, "correctCount" | "totalQuestions">,
): ReadingBandEstimate | null {
  const { correctCount, totalQuestions } = summary;

  if (totalQuestions !== READING_BAND_CHART_TOTAL) {
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
    label: formatReadingBandLabel(levels),
  };
}
