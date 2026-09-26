import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WritingTaskDetailPanel } from "@/components/writing/WritingTaskDetailPanel";
import type { WritingTaskRow } from "@/features/writing/task-types";
import {
  isValidTaskId,
  normalizeWritingTask,
} from "@/features/writing/task-utils";

export const metadata: Metadata = {
  title: "Writing task - CELPIP Decoded",
  description: "Practice a CELPIP writing task with a CELPIP Decoded prompt.",
};

// Detail page for one writing task: prompt, timing, word target,
// evaluation focus, and the timed writing placeholder.
export default async function WritingTaskPage({
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
      "id, task_type, title, prompt, status, sort_order, modules!inner(slug), writing_task_details(task_number, time_seconds, word_min, word_max, evaluation_focus)",
    )
    .eq("id", taskId)
    .eq("modules.slug", "celpip-writing")
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error("Could not load this writing task. Please try again.");
  }

  if (!task) {
    notFound();
  }

  return (
    <WritingTaskDetailPanel
      task={normalizeWritingTask(task as unknown as WritingTaskRow)}
    />
  );
}
