// Types, query shape, and row normalization for the CELPIP writing
// attempt history. Shared by the writing overview, the full history
// page, and the recent attempts card.
//
// This module is imported by client components, so it must stay free of
// server-only code: no admin Supabase helper and no secret keys.

import { getWritingTaskTypeLabel } from "./writing-status-labels";
import { getWritingBadgeLabel } from "./writing-level-badges";

type ModuleEmbed = {
  slug: string;
};

type TaskEmbed = {
  id: string;
  title: string;
  task_type: string;
  modules: ModuleEmbed | ModuleEmbed[] | null;
};

type ScoreEmbed = {
  estimated_level: number | null;
  badge_slug: string | null;
};

// Shape returned by the shared history select below.
export type WritingAttemptHistoryRow = {
  id: string;
  status: string;
  created_at: string;
  word_count: number | null;
  time_spent_seconds: number | null;
  tasks: TaskEmbed | TaskEmbed[] | null;
  attempt_scores: ScoreEmbed | ScoreEmbed[] | null;
};

// One writing attempt as displayed in history lists and tables.
export type WritingAttemptHistoryItem = {
  id: string;
  taskId: string | null;
  taskTitle: string;
  taskTypeLabel: string;
  createdAt: string;
  status: string;
  wordCount: number | null;
  timeSpentSeconds: number | null;
  estimatedLevel: number | null;
  badgeLabel: string | null;
};

// Select used by every writing history query so all views load the
// same shape. The inner joins on tasks and modules keep the result set
// to writing attempts only.
export const WRITING_ATTEMPT_HISTORY_SELECT =
  "id, status, created_at, word_count, time_spent_seconds, tasks!inner(id, title, task_type, modules!inner(slug)), attempt_scores(estimated_level, badge_slug)";

// Module slug every writing attempt belongs to.
export const WRITING_MODULE_SLUG = "celpip-writing";

// PostgREST returns embeds as an object or an array depending on the
// relationship and schema cache. Normalize both to a single object.
function normalizeEmbed<T>(embed: T | T[] | null): T | null {
  return Array.isArray(embed) ? (embed[0] ?? null) : (embed ?? null);
}

// Friendly date for an attempt, for example "Jan 5, 2026".
export function formatWritingAttemptDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Compact time used for narrow history columns, for example "26m 05s".
// The long form in task-utils is used on the result page, where there
// is room for full words.
export function formatWritingTimeUsed(totalSeconds: number | null): string {
  if (totalSeconds === null || !Number.isFinite(totalSeconds)) {
    return writingHistoryCopy.noValue;
  }

  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

// Converts a raw history row into the display item. Level and badge are
// only surfaced once feedback is ready, so an attempt that is still
// waiting never shows a stale or partial score.
export function normalizeWritingAttemptHistoryRow(
  row: WritingAttemptHistoryRow,
): WritingAttemptHistoryItem {
  const task = normalizeEmbed(row.tasks);
  const score = normalizeEmbed(row.attempt_scores);
  const feedbackReady = row.status === "writing_feedback_ready";

  return {
    id: row.id,
    taskId: task?.id ?? null,
    taskTitle: task?.title ?? "CELPIP Writing Practice",
    taskTypeLabel: task
      ? getWritingTaskTypeLabel(task.task_type)
      : "Writing task",
    createdAt: row.created_at,
    status: row.status,
    wordCount: row.word_count,
    timeSpentSeconds: row.time_spent_seconds,
    estimatedLevel: feedbackReady ? (score?.estimated_level ?? null) : null,
    badgeLabel:
      feedbackReady && score?.badge_slug
        ? getWritingBadgeLabel(score.badge_slug)
        : null,
  };
}

// Result route for one writing attempt, used by every history link.
export function getWritingAttemptPath(attemptId: string): string {
  return `/dashboard/writing/attempts/${attemptId}`;
}

// Timed writing route for a task, used by the retry actions.
export function getWritingPracticePath(taskId: string): string {
  return `/dashboard/writing/practice/${taskId}`;
}

// Student facing copy for writing history views.
export const writingHistoryCopy = {
  pageBadge: "Writing practice history",
  pageHeading: "Writing attempt history",
  pageDescription:
    "Review your CELPIP writing practice attempts and return to saved feedback reports.",
  backToWriting: "Back to writing tasks",
  backToHistory: "Back to writing history",
  viewFeedback: "View feedback",
  submitForEvaluation: "Submit for evaluation",
  tryAgain: "Try again",
  preparingFeedback: "Preparing your writing feedback...",
  actionUnavailable: "Feedback in progress",
  taskColumn: "Task",
  typeColumn: "Task type",
  dateColumn: "Submitted",
  wordsColumn: "Words",
  timeColumn: "Time used",
  statusColumn: "Status",
  levelColumn: "Estimated practice level",
  levelColumnShort: "Level",
  badgeColumn: "Practice badge",
  actionColumn: "Action",
  noValue: "-",
  emptyHeading: "No writing attempts yet",
  emptyText:
    "Start with a writing task to create your first practice response.",
  emptyButton: "Start writing practice",
  recentHeading: "Recent writing attempts",
  recentEmptyText:
    "No writing attempts yet. Start with a writing task below to create your first practice response.",
  viewAllAttempts: "View all writing attempts",
  taskLibraryHeading: "Writing task library",
} as const;
