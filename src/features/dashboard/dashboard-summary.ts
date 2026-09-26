// Builds the learner dashboard summary from stored attempts and scores
// (CELPIP-UX-03).
//
// One query feeds the whole dashboard: attempts joined to their task and
// module, plus the saved score. This file normalizes those rows and
// aggregates them into per module progress and the recent feedback list.
// Nothing here calls OpenAI and nothing here writes.
//
// Pure functions and constants only, no server-only imports, so the
// presentational components can reuse the same types and helpers.

import {
  formatTaskTypeLabel,
  getAttemptHistoryPath,
  HISTORY_STATUSES,
} from "@/features/speaking/attempt-history";
import { getBadgeLabel } from "@/features/speaking/level-badges";
import { getWritingAttemptPath } from "@/features/writing/writing-attempt-history";
import { getWritingBadgeLabel } from "@/features/writing/writing-level-badges";
import {
  getWritingTaskTypeLabel,
  isWritingFeedbackReady,
  WRITING_HISTORY_STATUSES,
} from "@/features/writing/writing-status-labels";
import {
  getModuleHistoryHref,
  getModulePracticeHref,
  MODULE_LABELS,
} from "./dashboard-copy";
import type {
  DashboardFeedbackItem,
  DashboardModuleKey,
  DashboardModuleProgress,
  DashboardSummary,
} from "./dashboard-types";

// The 1 to 12 practice scale shared by both modules.
export const DASHBOARD_LEVEL_MAX = 12;

// How many completed reports the recent feedback list shows. The ticket
// asks for the latest 3 to 5.
export const RECENT_FEEDBACK_LIMIT = 5;

// Upper bound on the attempts read for the dashboard. The page only
// needs counts, best and latest values, so an unbounded history read
// would grow with every attempt for no extra display value.
export const DASHBOARD_ATTEMPT_LIMIT = 200;

// Module slugs that produce feedback reports today.
export const SPEAKING_MODULE_SLUG = "celpip-speaking";
export const WRITING_MODULE_SLUG = "celpip-writing";

// Every attempt status that counts as practice history, across both
// modules. Attempts still in "created" or "failed_upload" never saved a
// response, so they stay out.
export const DASHBOARD_HISTORY_STATUSES: readonly string[] = [
  ...HISTORY_STATUSES,
  ...WRITING_HISTORY_STATUSES,
];

// Select used by the dashboard attempt query. The inner joins keep the
// result to attempts that still have a task and a module, so a row can
// always be assigned to speaking or writing.
export const DASHBOARD_ATTEMPT_SELECT =
  "id, status, created_at, submitted_at, tasks!inner(title, task_type, modules!inner(slug)), attempt_scores(estimated_level, badge_slug)";

type ModuleEmbed = {
  slug: string;
};

type TaskEmbed = {
  title: string;
  task_type: string;
  modules: ModuleEmbed | ModuleEmbed[] | null;
};

type ScoreEmbed = {
  estimated_level: number | null;
  badge_slug: string | null;
};

// Shape returned by DASHBOARD_ATTEMPT_SELECT.
export type DashboardAttemptRow = {
  id: string;
  status: string;
  created_at: string;
  submitted_at: string | null;
  tasks: TaskEmbed | TaskEmbed[] | null;
  attempt_scores: ScoreEmbed | ScoreEmbed[] | null;
};

// One normalized attempt, before it is split into progress and recent
// feedback.
export type DashboardAttempt = {
  id: string;
  moduleKey: DashboardModuleKey;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  feedbackReady: boolean;
  taskTitle: string;
  taskTypeLabel: string;
  estimatedLevel: number | null;
  badgeSlug: string | null;
  badgeLabel: string | null;
};

// PostgREST returns embeds as an object or an array depending on the
// relationship and schema cache. Normalize both to a single object.
function normalizeEmbed<T>(embed: T | T[] | null): T | null {
  return Array.isArray(embed) ? (embed[0] ?? null) : (embed ?? null);
}

// Maps a module slug to the dashboard module key, or null for a module
// that does not produce feedback reports yet.
export function toModuleKey(
  slug: string | null | undefined,
): DashboardModuleKey | null {
  if (slug === SPEAKING_MODULE_SLUG) return "speaking";
  if (slug === WRITING_MODULE_SLUG) return "writing";
  return null;
}

// True once a saved feedback report exists for the attempt. Speaking and
// writing use different status values, so the module decides.
function hasFeedbackReport(
  moduleKey: DashboardModuleKey,
  status: string,
): boolean {
  return moduleKey === "speaking"
    ? status === "feedback_ready"
    : isWritingFeedbackReady(status);
}

// Converts one raw row into a normalized attempt. Returns null for a row
// whose module is not speaking or writing, so an unrelated attempt never
// lands in the dashboard totals.
export function normalizeDashboardAttempt(
  row: DashboardAttemptRow,
): DashboardAttempt | null {
  const task = normalizeEmbed(row.tasks);
  const moduleKey = toModuleKey(normalizeEmbed(task?.modules ?? null)?.slug);

  if (!task || !moduleKey) {
    return null;
  }

  const score = normalizeEmbed(row.attempt_scores);
  const feedbackReady = hasFeedbackReport(moduleKey, row.status);
  const badgeSlug = feedbackReady ? (score?.badge_slug ?? null) : null;

  return {
    id: row.id,
    moduleKey,
    status: row.status,
    createdAt: row.created_at,
    submittedAt: row.submitted_at,
    feedbackReady,
    taskTitle: task.title || MODULE_LABELS[moduleKey],
    taskTypeLabel:
      moduleKey === "speaking"
        ? formatTaskTypeLabel(task.task_type)
        : getWritingTaskTypeLabel(task.task_type),
    // Level and badge are only surfaced once feedback is ready, so an
    // attempt still being scored never shows a partial value.
    estimatedLevel: feedbackReady ? (score?.estimated_level ?? null) : null,
    badgeSlug,
    badgeLabel: badgeSlug
      ? (moduleKey === "speaking"
          ? getBadgeLabel(badgeSlug)
          : getWritingBadgeLabel(badgeSlug))
      : null,
  };
}

// Result route for a completed report.
function getFeedbackHref(attempt: DashboardAttempt): string {
  return attempt.moduleKey === "speaking"
    ? getAttemptHistoryPath(attempt.id)
    : getWritingAttemptPath(attempt.id);
}

// Empty progress for a module with no attempts yet.
function emptyProgress(moduleKey: DashboardModuleKey): DashboardModuleProgress {
  return {
    moduleKey,
    moduleLabel: MODULE_LABELS[moduleKey],
    feedbackReports: 0,
    totalAttempts: 0,
    bestLevel: null,
    latestLevel: null,
    latestPracticeDate: null,
    practiceHref: getModulePracticeHref(moduleKey),
    historyHref: getModuleHistoryHref(moduleKey),
  };
}

// Aggregates one module's attempts. Works with the attempts in any
// order, so the caller does not have to pre-sort.
export function buildModuleProgress(
  moduleKey: DashboardModuleKey,
  attempts: DashboardAttempt[],
): DashboardModuleProgress {
  const progress = emptyProgress(moduleKey);
  let latestReportDate: string | null = null;

  for (const attempt of attempts) {
    if (attempt.moduleKey !== moduleKey) {
      continue;
    }

    progress.totalAttempts += 1;

    if (
      progress.latestPracticeDate === null ||
      attempt.createdAt > progress.latestPracticeDate
    ) {
      progress.latestPracticeDate = attempt.createdAt;
    }

    if (!attempt.feedbackReady) {
      continue;
    }

    progress.feedbackReports += 1;

    if (attempt.estimatedLevel === null) {
      continue;
    }

    if (
      progress.bestLevel === null ||
      attempt.estimatedLevel > progress.bestLevel
    ) {
      progress.bestLevel = attempt.estimatedLevel;
    }

    if (latestReportDate === null || attempt.createdAt > latestReportDate) {
      latestReportDate = attempt.createdAt;
      progress.latestLevel = attempt.estimatedLevel;
    }
  }

  return progress;
}

// The completed reports shown in the recent feedback list, newest first.
export function buildRecentFeedback(
  attempts: DashboardAttempt[],
  limit = RECENT_FEEDBACK_LIMIT,
): DashboardFeedbackItem[] {
  return attempts
    .filter((attempt) => attempt.feedbackReady)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((attempt) => ({
      attemptId: attempt.id,
      moduleKey: attempt.moduleKey,
      moduleLabel: MODULE_LABELS[attempt.moduleKey],
      taskTitle: attempt.taskTitle,
      taskTypeLabel: attempt.taskTypeLabel,
      estimatedLevel: attempt.estimatedLevel,
      badgeSlug: attempt.badgeSlug,
      badgeLabel: attempt.badgeLabel,
      submittedAt: attempt.submittedAt ?? attempt.createdAt,
      href: getFeedbackHref(attempt),
    }));
}

// The full dashboard summary from normalized attempts.
export function buildDashboardSummary(
  attempts: DashboardAttempt[],
): DashboardSummary {
  const speaking = buildModuleProgress("speaking", attempts);
  const writing = buildModuleProgress("writing", attempts);

  return {
    speaking,
    writing,
    recentFeedback: buildRecentFeedback(attempts),
    totalFeedbackReports: speaking.feedbackReports + writing.feedbackReports,
    hasAnyPractice: attempts.length > 0,
  };
}

// Convenience wrapper for the page: raw rows straight to the summary.
export function buildDashboardSummaryFromRows(
  rows: DashboardAttemptRow[],
): DashboardSummary {
  const attempts = rows
    .map(normalizeDashboardAttempt)
    .filter((attempt): attempt is DashboardAttempt => attempt !== null);

  return buildDashboardSummary(attempts);
}
