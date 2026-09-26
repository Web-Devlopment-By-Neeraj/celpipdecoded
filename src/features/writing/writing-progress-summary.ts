// Builds the writing progress summary shown on the writing overview
// and the writing history page: total attempts, feedback reports ready,
// best and average estimated practice level, most recent practice date,
// and badges earned.
//
// Every value is derived from the logged-in user's writing attempts
// only. The caller is responsible for scoping the query to the user and
// to the celpip-writing module.

import type { WritingAttemptHistoryItem } from "./writing-attempt-history";
import { isWritingFeedbackReady } from "./writing-status-labels";

// The practice scale used across the writing module.
export const WRITING_PRACTICE_LEVEL_MAX = 12;

export type WritingProgressSummaryData = {
  totalAttempts: number;
  feedbackReports: number;
  bestLevel: number | null;
  averageLevel: number | null;
  lastPracticeDate: string | null;
  badgesEarned: number;
};

// Display string for an estimated level, for example "7 of 12".
export function formatWritingPracticeLevel(level: number): string {
  return `${Math.round(level)} of ${WRITING_PRACTICE_LEVEL_MAX}`;
}

// Aggregates history items into the summary. Works with the items in
// any order, so callers do not have to pre-sort. Only attempts with a
// saved feedback report contribute to the level values, so a response
// that is still waiting never moves the average.
export function buildWritingProgressSummary(
  attempts: WritingAttemptHistoryItem[],
  badgesEarned: number,
): WritingProgressSummaryData {
  let feedbackReports = 0;
  let bestLevel: number | null = null;
  let lastPracticeDate: string | null = null;
  let levelTotal = 0;
  let levelCount = 0;

  for (const attempt of attempts) {
    if (isWritingFeedbackReady(attempt.status)) {
      feedbackReports += 1;
    }

    if (attempt.estimatedLevel !== null) {
      if (bestLevel === null || attempt.estimatedLevel > bestLevel) {
        bestLevel = attempt.estimatedLevel;
      }
      levelTotal += attempt.estimatedLevel;
      levelCount += 1;
    }

    if (lastPracticeDate === null || attempt.createdAt > lastPracticeDate) {
      lastPracticeDate = attempt.createdAt;
    }
  }

  return {
    totalAttempts: attempts.length,
    feedbackReports,
    bestLevel,
    averageLevel: levelCount > 0 ? levelTotal / levelCount : null,
    lastPracticeDate,
    badgesEarned,
  };
}

// Student facing copy for the writing progress summary and the level
// progress card.
export const writingProgressCopy = {
  summaryLabel: "Writing progress summary",
  totalAttemptsLabel: "Writing attempts",
  feedbackReportsLabel: "Feedback reports ready",
  bestLevelLabel: "Best estimated practice level",
  averageLevelLabel: "Average estimated practice level",
  lastPracticeLabel: "Most recent writing practice",
  badgesLabel: "Badges earned",
  levelCardHeading: "Writing progress",
  levelCardSubtext:
    "Your best estimated practice level from saved writing feedback reports.",
  levelCardEmptyText:
    "Submit a writing response for evaluation to see your estimated practice level here.",
  levelScaleNote: "out of 12",
  currentBadgeLabel: "Current practice badge",
  practiceEstimateNote:
    "Practice estimates are for preparation only and are not official CELPIP scores.",
} as const;
