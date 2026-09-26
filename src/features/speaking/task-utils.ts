import { DEFAULT_SCORING_FOCUS, taskShortDescriptions } from "./task-copy";
import type {
  SpeakingTask,
  SpeakingTaskDetails,
  SpeakingTaskRow,
} from "./task-types";

// Matches the canonical UUID text format Postgres accepts for uuid columns.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Validates a route param before it is used in a uuid query, so an invalid
// id becomes a clean 404 instead of a database error.
export function isValidTaskId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

// PostgREST returns a one-to-one embed as an object, but older schema
// caches can return an array. Normalize both to a single details object.
export function normalizeSpeakingTask(row: SpeakingTaskRow): SpeakingTask {
  const embed = row.speaking_task_details;
  const details: SpeakingTaskDetails | null = Array.isArray(embed)
    ? (embed[0] ?? null)
    : (embed ?? null);

  return {
    id: row.id,
    task_type: row.task_type,
    title: row.title,
    prompt: row.prompt,
    status: row.status,
    sort_order: row.sort_order,
    details,
  };
}

// Formats a duration in seconds as friendly copy, for example
// "30 seconds", "1 minute", or "1 minute 30 seconds".
export function formatSeconds(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "0 seconds";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];

  if (minutes > 0) {
    parts.push(minutes === 1 ? "1 minute" : `${minutes} minutes`);
  }
  if (seconds > 0) {
    parts.push(seconds === 1 ? "1 second" : `${seconds} seconds`);
  }

  return parts.join(" ");
}

// Short card description for a task type, with a safe fallback for
// task types added to the database before the copy map is updated.
export function getTaskShortDescription(taskType: string): string {
  return (
    taskShortDescriptions[taskType] ??
    "Practice this CELPIP speaking task format."
  );
}

// Scoring focus areas for a task, falling back to the standard four.
export function getScoringFocus(task: SpeakingTask): string[] {
  const stored = task.details?.scoring_focus;
  if (Array.isArray(stored) && stored.length > 0) {
    return stored.filter((item): item is string => typeof item === "string");
  }
  return [...DEFAULT_SCORING_FOCUS];
}

// Display number for a task, preferring the stored task_number and
// falling back to the sort order.
export function getTaskNumber(task: SpeakingTask): number {
  return task.details?.task_number ?? task.sort_order;
}
