// Reads one learner's remaining scored attempt access (USAGE-01).
//
// This module uses the service role client, so it must only run on the
// server. Never import it into a client component; the browser talks to
// GET /api/usage/access instead.
//
// The work happens in public.get_learner_usage_summary, which also
// creates the account row on first use and rolls a finished monthly
// period forward. Keeping that in the database means the API route, the
// pre-flight access check, and the charge all read the same numbers.

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AccessStatus, UsageAccessSummary } from "./access-types";
import { ACCESS_STATUSES } from "./access-types";

export type UsageAccessSummaryResult =
  | { ok: true; summary: UsageAccessSummary }
  | { ok: false; message: string };

// jsonb comes back as unknown, so every field is read defensively.
// A missing number reads as 0, which blocks rather than grants.
function readInteger(value: unknown, fallback = 0): number {
  const parsed = typeof value === "string" ? Number(value) : value;

  if (typeof parsed !== "number" || !Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(0, Math.trunc(parsed));
}

function readNullableInteger(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = typeof value === "string" ? Number(value) : value;

  if (typeof parsed !== "number" || !Number.isFinite(parsed)) {
    return null;
  }

  return Math.trunc(parsed);
}

function readNullableText(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readAccessStatus(value: unknown): AccessStatus {
  return ACCESS_STATUSES.includes(value as AccessStatus)
    ? (value as AccessStatus)
    : "suspended";
}

export function normalizeUsageAccessSummary(
  payload: Record<string, unknown>,
): UsageAccessSummary {
  return {
    accessStatus: readAccessStatus(payload.access_status),
    freeAttemptsRemaining: readInteger(payload.free_attempts_remaining),
    monthlyAttemptsRemaining: readInteger(payload.monthly_attempts_remaining),
    paidAttemptsRemaining: readInteger(payload.paid_attempts_remaining),
    totalAttemptsRemaining: readInteger(payload.total_attempts_remaining),
    freeAttemptsTotal: readInteger(payload.free_scored_attempts_total),
    freeAttemptsUsed: readInteger(payload.free_scored_attempts_used),
    planCode: readNullableText(payload.plan_code),
    monthlyAttemptLimit: readNullableInteger(payload.monthly_scored_attempt_limit),
    monthlyPeriodStart: readNullableText(payload.monthly_period_start),
    monthlyPeriodEnd: readNullableText(payload.monthly_period_end),
  };
}

export async function getUsageAccessSummary(
  userId: string,
): Promise<UsageAccessSummaryResult> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.rpc("get_learner_usage_summary", {
      p_user_id: userId,
    });

    if (error) {
      console.error("Usage access summary lookup failed:", error.message);
      return { ok: false, message: "Could not read your practice access." };
    }

    if (!data || typeof data !== "object") {
      console.error("Usage access summary returned no data.");
      return { ok: false, message: "Could not read your practice access." };
    }

    return {
      ok: true,
      summary: normalizeUsageAccessSummary(data as Record<string, unknown>),
    };
  } catch (err) {
    // Includes the case where the admin client cannot be built because
    // Supabase env vars are missing.
    console.error("Usage access summary could not be read:", err);
    return { ok: false, message: "Could not read your practice access." };
  }
}
