import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TaskDetailPanel } from "@/components/speaking/TaskDetailPanel";
import type { SpeakingTaskRow } from "@/features/speaking/task-types";
import {
  isValidTaskId,
  normalizeSpeakingTask,
} from "@/features/speaking/task-utils";

export const metadata: Metadata = {
  title: "Speaking task - CELPIP Decoded",
  description: "Practice a CELPIP speaking task with a CELPIP Decoded prompt.",
};

// Detail page for one speaking task: prompt, timing, skill focus, and
// the entry point into the timed practice flow.
export default async function SpeakingTaskPage({
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

  const { data: task, error } = await supabase
    .from("tasks")
    .select(
      "id, task_type, title, prompt, status, sort_order, modules!inner(slug), speaking_task_details(task_number, prep_seconds, speaking_seconds, scoring_focus)",
    )
    .eq("id", taskId)
    .eq("modules.slug", "celpip-speaking")
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error("Could not load this speaking task. Please try again.");
  }

  if (!task) {
    notFound();
  }

  return (
    <TaskDetailPanel
      task={normalizeSpeakingTask(task as unknown as SpeakingTaskRow)}
    />
  );
}
