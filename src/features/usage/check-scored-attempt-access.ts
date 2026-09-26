// Pre-flight access check for an AI scored attempt (USAGE-01).
//
// Runs before any expensive OpenAI work. It never charges anything: the
// charge happens in consume-scored-attempt-credit.ts once a feedback
// report has been saved.
//
// This module uses the service role client, so it must only run on the
// server. Never import it into a client component.
//
// Two cases are allowed through without spending anything:
//   - the attempt already has a consumption row, so this run is a retry
//     of work the learner has already paid for
//   - the learner still has attempts remaining
//
// The caller is responsible for the third case, an attempt that already
// has a saved feedback report; both feedback pipelines return that
// report before they reach this check.

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  EMPTY_USAGE_ACCESS_SUMMARY,
  type ScoredAttemptAccessResult,
  type UsageAccessSummary,
} from "./access-types";
import { getUsageAccessSummary } from "./get-usage-access-summary";

export type CheckScoredAttemptAccessInput = {
  userId: string;
  attemptId: string;
};

// True when this attempt has already been charged. A lookup failure
// returns false, so the worst case is that the summary decides instead
// of a stale ledger read.
async function hasExistingConsumption(
  userId: string,
  attemptId: string,
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("scored_attempt_consumptions")
      .select("id")
      .eq("attempt_id", attemptId)
      .eq("user_id", userId)
      .limit(1);

    if (error) {
      console.error("Consumption lookup failed:", error.message);
      return false;
    }

    return Boolean(data && data.length > 0);
  } catch (err) {
    console.error("Consumption lookup could not run:", err);
    return false;
  }
}

export async function checkScoredAttemptAccess(
  input: CheckScoredAttemptAccessInput,
): Promise<ScoredAttemptAccessResult> {
  const alreadyConsumed = await hasExistingConsumption(
    input.userId,
    input.attemptId,
  );

  const summaryResult = await getUsageAccessSummary(input.userId);

  // A paid attempt stays retryable even when the balance is now empty,
  // so this check comes before the summary is trusted.
  if (alreadyConsumed) {
    return {
      allowed: true,
      reason: "already_consumed",
      summary: summaryResult.ok
        ? summaryResult.summary
        : EMPTY_USAGE_ACCESS_SUMMARY,
    };
  }

  // The summary could not be read, for example because migration 012 has
  // not been applied yet. Blocking is the safe direction: the alternative
  // is unlimited free AI calls whenever the database is unhappy.
  if (!summaryResult.ok) {
    return {
      allowed: false,
      reason: "no_attempts_remaining",
      summary: EMPTY_USAGE_ACCESS_SUMMARY,
    };
  }

  const summary: UsageAccessSummary = summaryResult.summary;

  if (summary.accessStatus !== "active") {
    return { allowed: false, reason: "access_suspended", summary };
  }

  if (summary.totalAttemptsRemaining <= 0) {
    return { allowed: false, reason: "no_attempts_remaining", summary };
  }

  return { allowed: true, reason: "has_access", summary };
}
