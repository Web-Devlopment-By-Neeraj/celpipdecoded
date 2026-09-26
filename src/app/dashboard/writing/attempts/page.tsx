import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WritingAttemptHistoryTable } from "@/components/writing/WritingAttemptHistoryTable";
import { WritingEmptyAttemptsState } from "@/components/writing/WritingEmptyAttemptsState";
import { WritingProgressSummary } from "@/components/writing/WritingProgressSummary";
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
  title: "Writing practice history - CELPIP Decoded",
  description:
    "Review your CELPIP writing practice attempts and return to saved feedback reports.",
};

// Full writing attempt history for the logged-in user: summary strip
// plus every writing attempt with a saved response, newest first.
export default async function WritingAttemptsPage() {
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
  // come back. The explicit user_id filter is a second guard, and the
  // module filter keeps speaking attempts out of the writing history.
  const attemptsResult = await supabase
    .from("attempts")
    .select(WRITING_ATTEMPT_HISTORY_SELECT)
    .eq("user_id", user.id)
    .eq("tasks.modules.slug", WRITING_MODULE_SLUG)
    .in("status", [...WRITING_HISTORY_STATUSES])
    .order("created_at", { ascending: false });

  if (attemptsResult.error) {
    throw new Error(
      "Could not load your writing attempt history. Please try again.",
    );
  }

  const attempts = (
    (attemptsResult.data ?? []) as unknown as WritingAttemptHistoryRow[]
  ).map(normalizeWritingAttemptHistoryRow);

  // Badges tied to this user's writing attempts. Counted from the
  // attempt ids above so speaking badges never appear in the writing
  // summary.
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

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/dashboard/writing"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          <span aria-hidden>&larr;</span>
          {writingHistoryCopy.backToWriting}
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          {writingHistoryCopy.pageBadge}
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {writingHistoryCopy.pageHeading}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">
          {writingHistoryCopy.pageDescription}
        </p>
      </header>

      <WritingProgressSummary summary={summary} variant="strip" />

      {attempts.length === 0 ? (
        <WritingEmptyAttemptsState />
      ) : (
        <WritingAttemptHistoryTable attempts={attempts} />
      )}
    </div>
  );
}
