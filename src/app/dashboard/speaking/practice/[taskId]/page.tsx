import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TimedPracticeShell } from "@/components/speaking/TimedPracticeShell";
import {
  DEFAULT_PREP_SECONDS,
  DEFAULT_SPEAKING_SECONDS,
  type PracticeTask,
} from "@/features/speaking/practice-flow";
import type { SpeakingTaskRow } from "@/features/speaking/task-types";
import {
  getScoringFocus,
  getTaskNumber,
  isValidTaskId,
  normalizeSpeakingTask,
} from "@/features/speaking/task-utils";

export const metadata: Metadata = {
  title: "Timed speaking practice - CELPIP Decoded",
  description:
    "Run a timed CELPIP speaking practice session with preparation and speaking timers.",
};

// Timed practice screen for one speaking task. The task is fetched on
// the server and only safe fields are passed to the client shell, which
// handles the timers, browser recording, and the audio upload.
export default async function TimedPracticePage({
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
      "id, module_id, task_type, title, prompt, status, sort_order, modules!inner(slug), speaking_task_details(task_number, prep_seconds, speaking_seconds, scoring_focus)",
    )
    .eq("id", taskId)
    .eq("modules.slug", "celpip-speaking")
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error("Could not load this speaking task. Please try again.");
  }

  if (!row) {
    notFound();
  }

  const task = normalizeSpeakingTask(row as unknown as SpeakingTaskRow);

  // The module id is needed for the attempt row created on submit. The
  // inner join on modules guarantees it exists for a returned row.
  const moduleId = (row as unknown as { module_id: string | null }).module_id;

  if (!moduleId) {
    notFound();
  }

  // Only the fields the practice shell needs cross into the client.
  const practiceTask: PracticeTask = {
    id: task.id,
    moduleId,
    title: task.title,
    prompt: task.prompt,
    taskType: task.task_type,
    taskNumber: getTaskNumber(task),
    prepSeconds: task.details?.prep_seconds ?? DEFAULT_PREP_SECONDS,
    speakingSeconds: task.details?.speaking_seconds ?? DEFAULT_SPEAKING_SECONDS,
    scoringFocus: getScoringFocus(task),
  };

  return <TimedPracticeShell task={practiceTask} />;
}
