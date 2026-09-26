// Shared types for the learner dashboard (CELPIP-UX-03).
//
// Types only, no side effects and no server-only imports, so both the
// dashboard page and the presentational components under
// src/components/dashboard can read from here.

// The two practice modules that produce AI feedback reports today.
// Reading and listening are still coming soon, so they never appear in
// progress, recommendations or recent feedback.
export type DashboardModuleKey = "speaking" | "writing";

// One completed feedback report, as shown in the recent feedback list.
export type DashboardFeedbackItem = {
  attemptId: string;
  moduleKey: DashboardModuleKey;
  moduleLabel: string;
  taskTitle: string;
  taskTypeLabel: string;
  // Only set once the report is saved, so an in progress attempt never
  // shows a partial level.
  estimatedLevel: number | null;
  badgeSlug: string | null;
  badgeLabel: string | null;
  submittedAt: string;
  // Route to the saved feedback report.
  href: string;
};

// Progress for one module, used by the two progress cards.
export type DashboardModuleProgress = {
  moduleKey: DashboardModuleKey;
  moduleLabel: string;
  // Attempts that reached a saved feedback report.
  feedbackReports: number;
  // Attempts of any history status, including ones still in progress.
  totalAttempts: number;
  bestLevel: number | null;
  // Level from the most recent saved report, which can be lower than
  // the best level.
  latestLevel: number | null;
  // Most recent attempt of any status, so a learner who practised
  // without a saved report still sees activity.
  latestPracticeDate: string | null;
  practiceHref: string;
  historyHref: string;
};

// Everything the dashboard derives from stored attempts and scores.
export type DashboardSummary = {
  speaking: DashboardModuleProgress;
  writing: DashboardModuleProgress;
  // Newest first, already trimmed to the display limit.
  recentFeedback: DashboardFeedbackItem[];
  totalFeedbackReports: number;
  hasAnyPractice: boolean;
};

// One earned badge, read from user_badges joined to the badge catalog.
export type DashboardBadgeItem = {
  id: string;
  // Catalog slug, resolved to artwork through badge-asset-map.
  slug: string | null;
  title: string;
  description: string | null;
  earnedAt: string | null;
};

// Which deterministic rule produced the recommendation. Kept on the
// result so the reason line and any future analytics stay in step.
export type DashboardRecommendationRule =
  | "start-practice"
  | "balance-writing"
  | "balance-speaking"
  | "lower-level"
  | "less-recent";

export type DashboardRecommendation = {
  rule: DashboardRecommendationRule;
  moduleKey: DashboardModuleKey;
  moduleLabel: string;
  title: string;
  // Short learner facing explanation of why this module is suggested.
  reason: string;
  ctaLabel: string;
  href: string;
  secondaryLabel: string;
  secondaryHref: string;
};
