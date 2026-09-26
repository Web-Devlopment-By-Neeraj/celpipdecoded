import {
  DEFAULT_EVALUATION_FOCUS,
  taskShortDescriptions,
  taskTypeGroupTitles,
} from "./task-copy";
import type {
  WritingTask,
  WritingTaskDetails,
  WritingTaskRow,
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
export function normalizeWritingTask(row: WritingTaskRow): WritingTask {
  const embed = row.writing_task_details;
  const details: WritingTaskDetails | null = Array.isArray(embed)
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
// "26 minutes" or "27 minutes 30 seconds".
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

// Formats the word target range as friendly copy, for example
// "150 to 200 words". Falls back cleanly when only one bound exists.
export function formatWordTarget(details: WritingTaskDetails | null): string {
  return formatWordRange(details?.word_min ?? null, details?.word_max ?? null);
}

// Same formatting from plain bounds, for callers that do not hold a
// full details object, like the timed writing screen.
export function formatWordRange(
  min: number | null,
  max: number | null,
): string {
  if (min !== null && max !== null) {
    return `${min} to ${max} words`;
  }
  if (min !== null) {
    return `At least ${min} words`;
  }
  if (max !== null) {
    return `Up to ${max} words`;
  }
  return "No word target set";
}

// Group heading for a task type, with a safe fallback for task types
// added to the database before the copy map is updated.
export function getTaskTypeGroupTitle(taskType: string): string {
  return taskTypeGroupTitles[taskType] ?? "Writing task";
}

// Short card description for a task type, with a safe fallback.
export function getTaskShortDescription(taskType: string): string {
  return (
    taskShortDescriptions[taskType] ??
    "Practice this CELPIP writing task format."
  );
}

// Evaluation focus areas for a task, falling back to the standard five.
export function getEvaluationFocus(task: WritingTask): string[] {
  const stored = task.details?.evaluation_focus;
  if (Array.isArray(stored) && stored.length > 0) {
    return stored.filter((item): item is string => typeof item === "string");
  }
  return [...DEFAULT_EVALUATION_FOCUS];
}

// Display number for a task, preferring the stored task_number and
// falling back to the sort order.
export function getTaskNumber(task: WritingTask): number {
  return task.details?.task_number ?? task.sort_order;
}

// Groups tasks by task_type in a stable order so the library page can
// render one section per CELPIP writing task type.
export function groupTasksByType(
  tasks: WritingTask[],
): { taskType: string; tasks: WritingTask[] }[] {
  const groups = new Map<string, WritingTask[]>();

  for (const task of tasks) {
    const group = groups.get(task.task_type);
    if (group) {
      group.push(task);
    } else {
      groups.set(task.task_type, [task]);
    }
  }

  return Array.from(groups.entries()).map(([taskType, groupTasks]) => ({
    taskType,
    tasks: groupTasks,
  }));
}
