import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUsageAccessSummary } from "@/features/usage/get-usage-access-summary";
import { usageAccessCopy } from "@/features/usage/usage-copy";

// Remaining AI feedback access for the signed in learner (USAGE-01).
//
// The user comes from the caller's session cookies and is validated
// against Supabase, so this route can only ever describe the caller's
// own access. The user id is never read from the request body or the
// query string.
export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Your session has expired. Please sign in again." },
      { status: 401 },
    );
  }

  const result = await getUsageAccessSummary(user.id);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: usageAccessCopy.loadFailed },
      { status: 500 },
    );
  }

  const { summary } = result;

  return NextResponse.json({
    ok: true,
    accessStatus: summary.accessStatus,
    freeAttemptsRemaining: summary.freeAttemptsRemaining,
    paidAttemptsRemaining: summary.paidAttemptsRemaining,
    monthlyAttemptsRemaining: summary.monthlyAttemptsRemaining,
    totalAttemptsRemaining: summary.totalAttemptsRemaining,
    planCode: summary.planCode,
    monthlyPeriod:
      summary.monthlyPeriodStart && summary.monthlyPeriodEnd
        ? { start: summary.monthlyPeriodStart, end: summary.monthlyPeriodEnd }
        : null,
  });
}
