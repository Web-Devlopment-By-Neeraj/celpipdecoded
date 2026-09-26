// Practice scoring for the full Reading section (EXAM-24).
//
// The layer above reading-score.ts. Pure functions over the section
// content and the combined answer map, no React, no side effects and no
// storage, so the same helpers run on the server where the answer keys
// live.
//
// It adds no marking rule. The per part rows and counts come from
// reading-section-review.ts, which calls the same buildReadingReviewRows
// the four part actions call, so the section and the parts cannot
// disagree about a single question. What this file adds is the
// aggregation and the band lookup.
//
// The section scoring rules, all of them, inherited unchanged from
// reading-score.ts:
//
// - correct is a selected option that matches the key
// - a blank counts as incorrect, and is also counted separately, so the
//   percentage means "of the whole section" rather than "of what was
//   attempted"
// - incorrectCount includes the blanks, so correct plus incorrect is
//   always the whole section and the two numbers cannot leave a gap a
//   learner has to work out
// - percentage is correct over total, rounded to a whole percent
//
// The totals are summed from the part summaries rather than recounted
// from a flat row list. Both would give the same numbers today; summing
// is what guarantees the breakdown rows and the headline always add up,
// which is the one thing a learner can check by hand.
//
// The estimated band is looked up once, here, from the section totals.
// That is the only place in the Reading engine that reaches for a band,
// which is what keeps a part level score out of 11 from ever showing one:
// estimateReadingBand refuses any total that is not the chart's 38, and
// no part level code path calls it at all.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { estimateReadingBand } from "./reading-band-score";
import { buildReadingSectionPartResults } from "./reading-section-review";
import type { ReadingScoreSummary } from "./reading-types";
import type {
  ReadingSectionAnswerMap,
  ReadingSectionContent,
  ReadingSectionMarkedResult,
} from "./reading-section-types";

// Practice score as a whole percentage.
//
// A section with no questions scores zero rather than dividing by zero.
// It is a content bug either way, and a zero is at least a number a
// screen can print.
function scorePercent(correctCount: number, totalQuestions: number): number {
  if (totalQuestions === 0) {
    return 0;
  }

  return Math.round((correctCount / totalQuestions) * 100);
}

// Section totals, summed from the part summaries.
//
// percentage is recalculated from the section totals rather than averaged
// across the parts, because the parts hold different numbers of questions
// and an average of four percentages would not be the section's
// percentage.
export function aggregateReadingSectionSummaries(
  summaries: ReadingScoreSummary[],
): ReadingScoreSummary {
  const total = (pick: (summary: ReadingScoreSummary) => number) =>
    summaries.reduce((running, summary) => running + pick(summary), 0);

  const totalQuestions = total((summary) => summary.totalQuestions);
  const correctCount = total((summary) => summary.correctCount);
  const blankCount = total((summary) => summary.blankCount);

  return {
    totalQuestions,
    answeredCount: totalQuestions - blankCount,
    correctCount,
    // Blanks are included here, which is what "a blank counts as
    // incorrect" means in the score. blankCount is beside it so the
    // screen can still say how many of them were left empty.
    incorrectCount: totalQuestions - correctCount,
    blankCount,
    percentage: scorePercent(correctCount, totalQuestions),
  };
}

// Mark a whole Reading section attempt.
//
// Returns the per part review rows and counts, the section totals, and
// the estimated band or null. Call this where the answer keys are, which
// is the server: the content the browser holds has had every key stripped
// by withoutReadingSectionAnswerKeys, so calling it there would mark
// every question as having no usable key and score the whole section
// zero.
//
// Deterministic and local to the mock content: the same answers always
// produce the same result, nothing is read from a database, and nothing
// is written anywhere.
export function buildReadingSectionResult(
  content: ReadingSectionContent,
  answers: ReadingSectionAnswerMap,
): ReadingSectionMarkedResult {
  const parts = buildReadingSectionPartResults(content, answers);
  const summary = aggregateReadingSectionSummaries(
    parts.map((part) => part.summary),
  );

  return {
    parts,
    summary,
    // null whenever the local Reading scoring chart does not cover the
    // attempt. The score screen leaves the band card out entirely in that
    // case rather than showing it empty.
    estimatedBand: estimateReadingBand(summary),
  };
}
