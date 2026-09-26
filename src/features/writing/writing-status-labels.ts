// Status and task type labels for CELPIP Writing Practice history
// views. Kept separate from the history query helpers so status copy
// can be edited in one place and reused by pills, rows, and actions.

// Writing attempt statuses that appear in history views. An attempt
// only reaches writing_submitted once a response has been saved, so
// earlier states never show up in history.
export const WRITING_HISTORY_STATUSES = [
  "writing_submitted",
  "writing_evaluating",
  "writing_feedback_ready",
  "writing_evaluation_failed",
] as const;

export type WritingHistoryStatus = (typeof WRITING_HISTORY_STATUSES)[number];

// Readable status labels shown to students.
const WRITING_STATUS_LABELS: Record<string, string> = {
  writing_submitted: "Response saved",
  writing_evaluating: "Preparing feedback",
  writing_feedback_ready: "Feedback ready",
  writing_evaluation_failed: "Feedback failed",
  // Older shared statuses that can still exist on an account.
  uploaded: "Recording saved",
  feedback_ready: "Feedback ready",
};

// Label for a status value, with a calm fallback for any status added
// to the database before this map is updated.
export function getWritingStatusLabel(status: string): string {
  return WRITING_STATUS_LABELS[status] ?? "In progress";
}

// Visual tone for the status pill.
export type WritingStatusTone = "ready" | "working" | "failed" | "neutral";

export function getWritingStatusTone(status: string): WritingStatusTone {
  if (status === "writing_feedback_ready" || status === "feedback_ready") {
    return "ready";
  }
  if (status === "writing_evaluation_failed") {
    return "failed";
  }
  if (status === "writing_submitted" || status === "writing_evaluating") {
    return "working";
  }
  return "neutral";
}

// True once a saved feedback report exists for the attempt.
export function isWritingFeedbackReady(status: string): boolean {
  return status === "writing_feedback_ready";
}

// The single action offered for an attempt in a history row.
// view: open the saved feedback report
// evaluate: send the saved response for its first evaluation
// retry: run the evaluation again after a failed run
// none: an evaluation is already running, so nothing to do yet
export type WritingAttemptActionKind = "view" | "evaluate" | "retry" | "none";

export function getWritingAttemptActionKind(
  status: string,
): WritingAttemptActionKind {
  if (isWritingFeedbackReady(status)) {
    return "view";
  }
  if (status === "writing_submitted") {
    return "evaluate";
  }
  if (status === "writing_evaluation_failed") {
    return "retry";
  }
  return "none";
}

// Readable labels for the two CELPIP writing task types.
const WRITING_TASK_TYPE_LABELS: Record<string, string> = {
  writing_email: "Writing an Email",
  writing_survey_response: "Responding to Survey Questions",
};

// Display label for a stored task_type value, with a safe fallback for
// task types added to the database before this map is updated.
export function getWritingTaskTypeLabel(taskType: string): string {
  return WRITING_TASK_TYPE_LABELS[taskType] ?? "Writing task";
}
