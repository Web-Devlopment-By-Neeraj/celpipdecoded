// Charges one scored attempt after a feedback report has been saved
// (USAGE-01).
//
// This module uses the service role client, so it must only run on the
// server. Never import it into a client component. There is no insert
// or update policy on learner_usage_accounts or
// scored_attempt_consumptions, and execute on the charging function is
// revoked from anon and authenticated, so a browser cannot charge or
// grant credits even with a valid session.
//
// Call order matters. The pipelines call this only after the score row
// is saved, so:
//   - a failed OpenAI call never charges
//   - a failed save never charges
//   - a refresh of the result page never charges, because the pipeline
//     returns the saved report before it reaches this point
//
// The database enforces the last guarantee anyway: attempt_id is unique
// in scored_attempt_consumptions, so the same attempt cannot be charged
// twice even if two requests race.
//
// Charging is best effort in one direction only. The learner's feedback
// is already saved by the time this runs, so a failure here is logged
// and never turned into an error the learner sees. The pre-flight check
// in check-scored-attempt-access.ts is what actually holds the line.

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  CREDIT_SOURCES,
  type ConsumeScoredAttemptResult,
  type ConsumeScoredAttemptStatus,
  type CreditSource,
} from "./access-types";
import { normalizeUsageAccessSummary } from "./get-usage-access-summary";

export type ConsumeScoredAttemptCreditInput = {
  userId: string;
  attemptId: string;
  moduleSlug: string;
  taskId?: string | null;
  metadata?: Record<string, unknown> | null;
};

function readStatus(value: unknown): ConsumeScoredAttemptStatus {
  return value === "consumed" ||
    value === "already_consumed" ||
    value === "blocked"
    ? value
    : "failed";
}

function readCreditSource(value: unknown): CreditSource | null {
  return CREDIT_SOURCES.includes(value as CreditSource)
    ? (value as CreditSource)
    : null;
}

export async function consumeScoredAttemptCredit(
  input: ConsumeScoredAttemptCreditInput,
): Promise<ConsumeScoredAttemptResult> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.rpc(
      "consume_scored_attempt_credit",
      {
        p_user_id: input.userId,
        p_attempt_id: input.attemptId,
        p_module_slug: input.moduleSlug,
        p_task_id: input.taskId ?? null,
        p_metadata: input.metadata ?? {},
      },
    );

    if (error) {
      console.error("Scored attempt charge failed:", error.message);
      return { status: "failed", creditSource: null, summary: null };
    }

    if (!data || typeof data !== "object") {
      console.error("Scored attempt charge returned no data.");
      return { status: "failed", creditSource: null, summary: null };
    }

    const payload = data as Record<string, unknown>;
    const summary =
      payload.summary && typeof payload.summary === "object"
        ? normalizeUsageAccessSummary(payload.summary as Record<string, unknown>)
        : null;

    return {
      status: readStatus(payload.status),
      creditSource: readCreditSource(payload.credit_source),
      summary,
    };
  } catch (err) {
    // Includes the case where the admin client cannot be built because
    // Supabase env vars are missing.
    console.error("Scored attempt charge could not run:", err);
    return { status: "failed", creditSource: null, summary: null };
  }
}
