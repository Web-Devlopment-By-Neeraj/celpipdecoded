import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AttemptHistoryTable } from "@/components/speaking/AttemptHistoryTable";
import { EmptyAttemptsState } from "@/components/speaking/EmptyAttemptsState";
import { SpeakingProgressSummary } from "@/components/speaking/SpeakingProgressSummary";
import {
  ATTEMPT_HISTORY_SELECT,
  HISTORY_STATUSES,
  historyCopy,
  normalizeAttemptHistoryRow,
  type AttemptHistoryRow,
} from "@/features/speaking/attempt-history";
import { buildProgressSummary } from "@/features/speaking/progress-summary";

export const metadata: Metadata = {
  title: "Speaking practice history - CELPIP Decoded",
  description:
    "Review your completed speaking practice attempts and return to feedback reports.",
};

// Full attempt history for the logged-in user: summary strip plus a
// list of every attempt with a saved recording, newest first.
export default async function SpeakingAttemptsPage() {
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

  // The session-scoped client enforces RLS, so only the user's own rows
  // come back. The explicit user_id filters are a second guard.
  const [attemptsResult, badgesResult] = await Promise.all([
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

  if (attemptsResult.error) {
    throw new Error("Could not load your attempt history. Please try again.");
  }

  const attempts = (
    (attemptsResult.data ?? []) as unknown as AttemptHistoryRow[]
  ).map(normalizeAttemptHistoryRow);

  const summary = buildProgressSummary(attempts, badgesResult.count ?? 0);

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/dashboard/speaking"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          <span aria-hidden>&larr;</span>
          {historyCopy.backToSpeaking}
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          {historyCopy.pageBadge}
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {historyCopy.pageHeading}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">
          {historyCopy.pageDescription}
        </p>
      </header>

      <SpeakingProgressSummary summary={summary} />

      {attempts.length === 0 ? (
        <EmptyAttemptsState />
      ) : (
        <AttemptHistoryTable attempts={attempts} />
      )}
    </div>
  );
}
