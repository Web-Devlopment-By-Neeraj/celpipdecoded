// Types, status labels, and row normalization for the speaking attempt
// history. Shared by the speaking overview, the attempt history page,
// and the recent attempts card.

import { getBadgeLabel } from "./level-badges";

// Attempt statuses that appear in history views. Attempts still in the
// "created" or "failed_upload" state never saved a recording, so they
// are excluded from every history query.
export const HISTORY_STATUSES = [
  "uploaded",
  "transcribing",
  "transcribed",
  "scoring",
  "feedback_ready",
  "transcription_failed",
  "scoring_failed",
] as const;

export type HistoryStatus = (typeof HISTORY_STATUSES)[number];

// Readable status labels shown to students.
const STATUS_LABELS: Record<HistoryStatus, string> = {
  uploaded: "Recording saved",
  transcribing: "Preparing transcript",
  transcribed: "Transcript ready",
  scoring: "Preparing feedback",
  feedback_ready: "Feedback ready",
  transcription_failed: "Transcript failed",
  scoring_failed: "Feedback failed",
};

// Label for a status value, with a calm fallback for any status added
// to the database before this map is updated.
export function getAttemptStatusLabel(status: string): string {
  return STATUS_LABELS[status as HistoryStatus] ?? "In progress";
}

// Visual tone for the status pill.
export type StatusTone = "ready" | "working" | "failed" | "neutral";

export function getAttemptStatusTone(status: string): StatusTone {
  if (status === "feedback_ready") {
    return "ready";
  }
  if (status === "transcription_failed" || status === "scoring_failed") {
    return "failed";
  }
  if ((HISTORY_STATUSES as readonly string[]).includes(status)) {
    return "working";
  }
  return "neutral";
}

type TaskEmbed = {
  title: string;
  task_type: string;
};

type ScoreEmbed = {
  estimated_level: number | null;
  badge_slug: string | null;
};

// Shape returned by the shared history select below.
export type AttemptHistoryRow = {
  id: string;
  status: string;
  created_at: string;
  tasks: TaskEmbed | TaskEmbed[] | null;
  attempt_scores: ScoreEmbed | ScoreEmbed[] | null;
};

// One attempt as displayed in history lists and tables.
export type AttemptHistoryItem = {
  id: string;
  taskTitle: string;
  taskTypeLabel: string;
  createdAt: string;
  status: string;
  estimatedLevel: number | null;
  badgeLabel: string | null;
};

// Select used by every history query so all views load the same shape.
export const ATTEMPT_HISTORY_SELECT =
  "id, status, created_at, tasks(title, task_type), attempt_scores(estimated_level, badge_slug)";

// PostgREST returns embeds as an object or an array depending on the
// relationship and schema cache. Normalize both to a single object.
function normalizeEmbed<T>(embed: T | T[] | null): T | null {
  return Array.isArray(embed) ? (embed[0] ?? null) : (embed ?? null);
}

// Display label for a stored task_type value, for example
// "giving_advice" becomes "Giving advice".
export function formatTaskTypeLabel(taskType: string): string {
  const words = taskType.split("_").join(" ").trim();
  if (!words) {
    return "Speaking task";
  }
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// Friendly date for an attempt, for example "Jan 5, 2026".
export function formatAttemptDate(iso: string): string {
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

// Converts a raw history row into the display item. Level and badge are
// only surfaced once feedback is ready, so an in-progress attempt never
// shows a stale or partial score.
export function normalizeAttemptHistoryRow(
  row: AttemptHistoryRow,
): AttemptHistoryItem {
  const task = normalizeEmbed(row.tasks);
  const score = normalizeEmbed(row.attempt_scores);
  const feedbackReady = row.status === "feedback_ready";

  return {
    id: row.id,
    taskTitle: task?.title ?? "CELPIP Speaking Practice",
    taskTypeLabel: task ? formatTaskTypeLabel(task.task_type) : "Speaking task",
    createdAt: row.created_at,
    status: row.status,
    estimatedLevel: feedbackReady ? (score?.estimated_level ?? null) : null,
    badgeLabel:
      feedbackReady && score?.badge_slug
        ? getBadgeLabel(score.badge_slug)
        : null,
  };
}

// Result route for one attempt, used by every history link.
export function getAttemptHistoryPath(attemptId: string): string {
  return `/dashboard/speaking/attempts/${attemptId}`;
}

// Student facing copy for attempt history views.
export const historyCopy = {
  pageBadge: "Practice history",
  pageHeading: "Speaking attempt history",
  pageDescription:
    "Review your completed speaking practice attempts and return to feedback reports.",
  backToSpeaking: "Back to speaking tasks",
  viewFeedback: "View feedback",
  taskColumn: "Task",
  typeColumn: "Task type",
  dateColumn: "Date",
  statusColumn: "Status",
  levelColumn: "Estimated level",
  badgeColumn: "Badge",
  noValue: "-",
  emptyHeading: "No speaking attempts yet",
  emptyText: "Start with a speaking task to create your first practice record.",
  emptyButton: "Start speaking practice",
  recentHeading: "Recent attempts",
  recentEmptyText:
    "No attempts yet. Start with a speaking task below to create your first practice record.",
  viewAllAttempts: "View all attempts",
} as const;
