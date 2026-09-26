import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WritingEmptyState } from "@/components/writing/WritingEmptyState";
import { WritingHero } from "@/components/writing/WritingHero";
import { WritingLevelProgressCard } from "@/components/writing/WritingLevelProgressCard";
import { WritingProgressSummary } from "@/components/writing/WritingProgressSummary";
import { WritingRecentAttemptsCard } from "@/components/writing/WritingRecentAttemptsCard";
import { WritingTaskGrid } from "@/components/writing/WritingTaskGrid";
import { ScoredAttemptBalanceBadge } from "@/components/usage/ScoredAttemptBalanceBadge";
import { getUsageAccessSummary } from "@/features/usage/get-usage-access-summary";
import type { WritingTaskRow } from "@/features/writing/task-types";
import { normalizeWritingTask } from "@/features/writing/task-utils";
import {
  normalizeWritingAttemptHistoryRow,
  WRITING_ATTEMPT_HISTORY_SELECT,
  WRITING_MODULE_SLUG,
  writingHistoryCopy,
  type WritingAttemptHistoryRow,
} from "@/features/writing/writing-attempt-history";
import { buildWritingProgressSummary } from "@/features/writing/writing-progress-summary";
import { WRITING_HISTORY_STATUSES } from "@/features/writing/writing-status-labels";

export const metadata: Metadata = {
  title: "Writing practice - CELPIP Decoded",
  description:
    "Practice CELPIP writing tasks, track your writing progress, and review your saved feedback reports.",
};

// Writing module overview: hero, writing progress, recent attempts, and
// the task library grouped by the two CELPIP writing task types.
export default async function WritingPage() {
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

  // The session-scoped client enforces RLS on attempts, so only the
  // user's own rows come back. The explicit user_id filter is a second
  // guard, and the module filter keeps speaking attempts out of the
  // writing progress values.
  const [tasksResult, attemptsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, task_type, title, prompt, status, sort_order, modules!inner(slug), writing_task_details(task_number, time_seconds, word_min, word_max, evaluation_focus)",
      )
      .eq("modules.slug", WRITING_MODULE_SLUG)
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
    supabase
      .from("attempts")
      .select(WRITING_ATTEMPT_HISTORY_SELECT)
      .eq("user_id", user.id)
      .eq("tasks.modules.slug", WRITING_MODULE_SLUG)
      .in("status", [...WRITING_HISTORY_STATUSES])
      .order("created_at", { ascending: false }),
  ]);

  if (tasksResult.error) {
    throw new Error("Could not load writing tasks. Please try again.");
  }

  if (attemptsResult.error) {
    throw new Error("Could not load your writing progress. Please try again.");
  }

  const taskList = (
    (tasksResult.data ?? []) as unknown as WritingTaskRow[]
  ).map(normalizeWritingTask);

  const attempts = (
    (attemptsResult.data ?? []) as unknown as WritingAttemptHistoryRow[]
  ).map(normalizeWritingAttemptHistoryRow);

  // Badges tied to this user's writing attempts, counted from the
  // attempt ids above so speaking badges never appear here.
  let badgesEarned = 0;

  if (attempts.length > 0) {
    const { count } = await supabase
      .from("user_badges")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in(
        "attempt_id",
        attempts.map((attempt) => attempt.id),
      );

    badgesEarned = count ?? 0;
  }

  const summary = buildWritingProgressSummary(attempts, badgesEarned);

  // USAGE-01: remaining AI feedback access, shown as a small badge so
  // the learner knows before writing whether a report is available.
  const accessResult = await getUsageAccessSummary(user.id);

  return (
    <>
      <WritingHero />

      {accessResult.ok ? (
        <div className="mt-5">
          <ScoredAttemptBalanceBadge summary={accessResult.summary} />
        </div>
      ) : null}

      <div className="mt-8 space-y-5">
        <WritingProgressSummary summary={summary} />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <WritingLevelProgressCard bestLevel={summary.bestLevel} />
          <WritingRecentAttemptsCard attempts={attempts} />
        </div>
      </div>

      <section
        className="mt-10"
        aria-label={writingHistoryCopy.taskLibraryHeading}
      >
        <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
          {writingHistoryCopy.taskLibraryHeading}
        </h2>

        {taskList.length === 0 ? (
          <div className="mt-4">
            <WritingEmptyState />
          </div>
        ) : (
          <WritingTaskGrid tasks={taskList} />
        )}
      </section>
    </>
  );
}
