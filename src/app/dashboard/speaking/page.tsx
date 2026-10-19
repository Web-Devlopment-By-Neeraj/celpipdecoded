import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LevelProgressCard } from "@/components/speaking/LevelProgressCard";
import { RecentAttemptsCard } from "@/components/speaking/RecentAttemptsCard";
import { SpeakingEmptyState } from "@/components/speaking/SpeakingEmptyState";
import { SpeakingHero } from "@/components/speaking/SpeakingHero";
import { SpeakingProgressSummary } from "@/components/speaking/SpeakingProgressSummary";
import { SpeakingTaskGrid } from "@/components/speaking/SpeakingTaskGrid";
import { ScoredAttemptBalanceBadge } from "@/components/usage/ScoredAttemptBalanceBadge";
import { getUsageAccessSummary } from "@/features/usage/get-usage-access-summary";
import {
  ATTEMPT_HISTORY_SELECT,
  HISTORY_STATUSES,
  normalizeAttemptHistoryRow,
  type AttemptHistoryRow,
} from "@/features/speaking/attempt-history";
import { buildProgressSummary } from "@/features/speaking/progress-summary";
import type { SpeakingTaskRow } from "@/features/speaking/task-types";
import { speakingCopy } from "@/features/speaking/task-copy";
import { normalizeSpeakingTask } from "@/features/speaking/task-utils";

export const metadata: Metadata = {
  title: "Speaking practice - CELPIP Decoded",
  description:
    "Practice CELPIP speaking tasks, track your progress, and review your feedback reports.",
};

// Speaking module overview: hero, progress summary, recent attempts,
// and the task library of the 8 CELPIP speaking task types.
export default async function SpeakingPage() {
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

  // The session-scoped client enforces RLS on attempts and badges, so
  // only the user's own rows come back. The explicit user_id filters
  // are a second guard.
  let taskList: ReturnType<typeof normalizeSpeakingTask>[] = [];
  let attempts: ReturnType<typeof normalizeAttemptHistoryRow>[] = [];
  let badgesEarned = 0;
  let practiceDataFailed = false;

  try {
    const [tasksResult, attemptsResult, badgesResult] = await Promise.all([
      supabase
        .from("tasks")
        .select(
          "id, task_type, title, prompt, status, sort_order, modules!inner(slug), speaking_task_details(task_number, prep_seconds, speaking_seconds, scoring_focus)",
        )
        .eq("modules.slug", "celpip-speaking")
        .eq("status", "active")
        .order("sort_order", { ascending: true }),
      supabase
        .from("attempts")
        .select(ATTEMPT_HISTORY_SELECT)
        .eq("user_id", user.id)
        .in("status", [...HISTORY_STATUSES])
        .order("created_at", { ascending: false }),
      supabase
        .from("user_badges")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    // A failed read used to throw. Production hides that message and
    // replaces the page with the generic server error, so keep the
    // speaking home on screen instead.
    if (tasksResult.error) {
      console.error("Speaking tasks query failed:", tasksResult.error.message);
      practiceDataFailed = true;
    } else {
      taskList = (
        (tasksResult.data ?? []) as unknown as SpeakingTaskRow[]
      ).map(normalizeSpeakingTask);
    }

    if (attemptsResult.error) {
      console.error(
        "Speaking attempts query failed:",
        attemptsResult.error.message,
      );
      practiceDataFailed = true;
    } else {
      attempts = (
        (attemptsResult.data ?? []) as unknown as AttemptHistoryRow[]
      ).map(normalizeAttemptHistoryRow);
    }

    if (!badgesResult.error) {
      badgesEarned = badgesResult.count ?? 0;
    }
  } catch (err) {
    console.error("Speaking practice data request failed:", err);
    practiceDataFailed = true;
    taskList = [];
    attempts = [];
    badgesEarned = 0;
  }

  const summary = buildProgressSummary(attempts, badgesEarned);

  // USAGE-01: remaining AI feedback access, shown as a small badge so
  // the learner knows before recording whether a report is available.
  const accessResult = await getUsageAccessSummary(user.id);

  return (
    <>
      {practiceDataFailed ? (
        <p
          role="status"
          className="mb-6 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-ink/70 shadow-sm ring-1 ring-ink/5"
        >
          {speakingCopy.dataNotice}
        </p>
      ) : null}

      <SpeakingHero />

      {accessResult.ok ? (
        <div className="mt-5">
          <ScoredAttemptBalanceBadge summary={accessResult.summary} />
        </div>
      ) : null}

      <div className="mt-8 space-y-5">
        <SpeakingProgressSummary summary={summary} />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <LevelProgressCard bestLevel={summary.bestLevel} />
          <RecentAttemptsCard attempts={attempts} />
        </div>
      </div>

      {taskList.length === 0 ? (
        <SpeakingEmptyState />
      ) : (
        <SpeakingTaskGrid tasks={taskList} />
      )}
    </>
  );
}
