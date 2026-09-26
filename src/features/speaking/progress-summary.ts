// Builds the speaking progress summary shown on the speaking overview
// and the attempt history page: feedback reports, best estimated
// practice level, most recent practice date, and badges earned.

import type { AttemptHistoryItem } from "./attempt-history";

// The practice scale used across the speaking module.
export const PRACTICE_LEVEL_MAX = 12;

export type SpeakingProgressSummaryData = {
  totalAttempts: number;
  feedbackReports: number;
  bestLevel: number | null;
  lastPracticeDate: string | null;
  badgesEarned: number;
};

// Display string for an estimated level, for example "7 of 12".
export function formatPracticeLevel(level: number): string {
  return `${Math.round(level)} of ${PRACTICE_LEVEL_MAX}`;
}

// Aggregates history items into the summary. Works with the items in
// any order, so callers do not have to pre-sort.
export function buildProgressSummary(
  attempts: AttemptHistoryItem[],
  badgesEarned: number,
): SpeakingProgressSummaryData {
  let feedbackReports = 0;
  let bestLevel: number | null = null;
  let lastPracticeDate: string | null = null;

  for (const attempt of attempts) {
    if (attempt.status === "feedback_ready") {
      feedbackReports += 1;
    }

    if (
      attempt.estimatedLevel !== null &&
      (bestLevel === null || attempt.estimatedLevel > bestLevel)
    ) {
      bestLevel = attempt.estimatedLevel;
    }

    if (lastPracticeDate === null || attempt.createdAt > lastPracticeDate) {
      lastPracticeDate = attempt.createdAt;
    }
  }

  return {
    totalAttempts: attempts.length,
    feedbackReports,
    bestLevel,
    lastPracticeDate,
    badgesEarned,
  };
}

// Student facing copy for the progress summary and level progress card.
export const progressCopy = {
  summaryLabel: "Speaking progress summary",
  feedbackReportsLabel: "Feedback reports",
  bestLevelLabel: "Best estimated level",
  lastPracticeLabel: "Most recent practice",
  badgesLabel: "Badges earned",
  levelCardHeading: "Speaking progress",
  levelCardSubtext:
    "Your best estimated practice level from completed feedback reports.",
  levelCardEmptyText:
    "Complete a feedback report to see your estimated practice level here.",
  levelScaleNote: "out of 12",
  currentBadgeLabel: "Current practice badge",
  practiceEstimateNote:
    "Estimated levels are a practice guide only, not an official CELPIP score.",
} as const;
