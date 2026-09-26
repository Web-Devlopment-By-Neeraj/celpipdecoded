import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TimedWritingShell } from "@/components/writing/TimedWritingShell";
import type {
  WritingPracticeTask,
  WritingTaskRow,
} from "@/features/writing/task-types";
import {
  getEvaluationFocus,
  getTaskNumber,
  isValidTaskId,
  normalizeWritingTask,
} from "@/features/writing/task-utils";
import { DEFAULT_WRITING_TIME_SECONDS } from "@/features/writing/writing-timer";

export const metadata: Metadata = {
  title: "Timed writing practice - CELPIP Decoded",
  description:
    "Run a timed CELPIP writing practice session with a live word count.",
};

// Timed writing screen for one writing task. The task is fetched on
// the server and only safe fields are passed to the client shell,
// which handles the timer, the editor, and the submit request.
export default async function TimedWritingPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;

  // Reject anything that is not a UUID before querying, so a bad URL
  // becomes a 404 instead of a database error.
  if (!isValidTaskId(taskId)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again close
  // to the data.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: row, error } = await supabase
    .from("tasks")
    .select(
      "id, task_type, title, prompt, status, sort_order, modules!inner(slug), writing_task_details(task_number, time_seconds, word_min, word_max, evaluation_focus)",
    )
    .eq("id", taskId)
    .eq("modules.slug", "celpip-writing")
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error("Could not load this writing task. Please try again.");
  }

  if (!row) {
    notFound();
  }

  const task = normalizeWritingTask(row as unknown as WritingTaskRow);

  // Only the fields the writing shell needs cross into the client.
  const practiceTask: WritingPracticeTask = {
    id: task.id,
    title: task.title,
    taskNumber: getTaskNumber(task),
    prompt: task.prompt,
    timeSeconds: task.details?.time_seconds ?? DEFAULT_WRITING_TIME_SECONDS,
    wordMin: task.details?.word_min ?? null,
    wordMax: task.details?.word_max ?? null,
    evaluationFocus: getEvaluationFocus(task),
  };

  return <TimedWritingShell task={practiceTask} />;
}
