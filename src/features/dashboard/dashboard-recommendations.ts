// Picks the next recommended practice for the dashboard (CELPIP-UX-03).
//
// Deliberately deterministic. The rules below read only stored attempts
// and scores that the dashboard has already loaded. No OpenAI call, no
// extra query, and no writes, so the recommendation costs nothing and is
// the same on every render for the same history.
//
// Rule order, first match wins:
// 1. no saved reports in either module          -> start with speaking
// 2. saved reports in speaking only             -> try writing
// 3. saved reports in writing only              -> try speaking
// 4. one module has a lower latest level        -> that module
// 5. otherwise                                  -> practised less recently

import {
  getContinueLabel,
  getHistoryLabel,
  MODULE_LABELS,
  recommendationCopy,
} from "./dashboard-copy";
import type {
  DashboardModuleKey,
  DashboardModuleProgress,
  DashboardRecommendation,
  DashboardRecommendationRule,
  DashboardSummary,
} from "./dashboard-types";

// Builds the display shape once the rule and module are decided. The
// title from the copy file is used as written for the two rules that
// name a module, and specialized for the two that do not.
function toRecommendation(
  rule: DashboardRecommendationRule,
  progress: DashboardModuleProgress,
): DashboardRecommendation {
  const copy = recommendationCopy[rule];
  const moduleKey = progress.moduleKey;
  const moduleLabel = MODULE_LABELS[moduleKey];

  const title =
    rule === "lower-level" || rule === "less-recent"
      ? `${rule === "lower-level" ? "Focus on" : "Return to"} ${moduleLabel}`
      : copy.title;

  return {
    rule,
    moduleKey,
    moduleLabel,
    title,
    reason: copy.reason,
    ctaLabel: getContinueLabel(moduleKey),
    href: progress.practiceHref,
    secondaryLabel: getHistoryLabel(moduleKey),
    secondaryHref: progress.historyHref,
  };
}

// Compares two dates that may be missing. A module never practised
// counts as the least recent, so it is the one to return to.
function isLessRecent(
  candidate: string | null,
  other: string | null,
): boolean {
  if (candidate === null) return true;
  if (other === null) return false;
  return candidate < other;
}

// The module the learner practised less recently. Speaking wins a tie,
// because it is the module most learners start with.
function lessRecentModule(summary: DashboardSummary): DashboardModuleKey {
  return isLessRecent(
    summary.speaking.latestPracticeDate,
    summary.writing.latestPracticeDate,
  )
    ? "speaking"
    : "writing";
}

export function getDashboardRecommendation(
  summary: DashboardSummary,
): DashboardRecommendation {
  const { speaking, writing } = summary;
  const hasSpeakingReports = speaking.feedbackReports > 0;
  const hasWritingReports = writing.feedbackReports > 0;

  // 1. Nothing completed yet. Speaking is the suggested starting point
  // and the card copy also points at writing.
  if (!hasSpeakingReports && !hasWritingReports) {
    return toRecommendation("start-practice", speaking);
  }

  // 2 and 3. Only one module has saved reports, so suggest the other one
  // and give the learner a fuller picture of their preparation.
  if (hasSpeakingReports && !hasWritingReports) {
    return toRecommendation("balance-writing", writing);
  }

  if (hasWritingReports && !hasSpeakingReports) {
    return toRecommendation("balance-speaking", speaking);
  }

  // 4. Both modules have reports. Where the two latest levels differ,
  // the weaker module gets the recommendation.
  const speakingLevel = speaking.latestLevel;
  const writingLevel = writing.latestLevel;

  if (
    speakingLevel !== null &&
    writingLevel !== null &&
    speakingLevel !== writingLevel
  ) {
    return toRecommendation(
      "lower-level",
      speakingLevel < writingLevel ? speaking : writing,
    );
  }

  // 5. Levels are equal or not comparable, so keep both skills fresh by
  // returning to whichever module has waited longest.
  const moduleKey = lessRecentModule(summary);

  return toRecommendation(
    "less-recent",
    moduleKey === "speaking" ? speaking : writing,
  );
}
