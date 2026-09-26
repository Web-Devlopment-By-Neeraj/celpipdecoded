// Shared vocabulary for scored attempt access (USAGE-01).
//
// USAGE-00 measures what an AI call costs us. USAGE-01 decides whether a
// learner is allowed to make one. A scored attempt is one completed
// speaking or writing feedback report, and it is charged only after that
// report has been saved.
//
// Types and constants only, no side effects, so this file is safe to
// import from a client component. The server only helpers live in
// get-usage-access-summary.ts, check-scored-attempt-access.ts, and
// consume-scored-attempt-credit.ts.

// Where a charged attempt came from. Admin grants are added to the paid
// balance today, so they are spent as paid_pack; the value is kept in
// the vocabulary because a future grant ledger will want it.
export const CREDIT_SOURCES = [
  "free_trial",
  "monthly_plan",
  "paid_pack",
  "admin_grant",
] as const;

export type CreditSource = (typeof CREDIT_SOURCES)[number];

// Anything other than "active" blocks scored attempts regardless of the
// balances on the account.
export const ACCESS_STATUSES = ["active", "suspended"] as const;

export type AccessStatus = (typeof ACCESS_STATUSES)[number];

// One learner's remaining access, as returned by
// public.get_learner_usage_summary and by GET /api/usage/access.
export type UsageAccessSummary = {
  accessStatus: AccessStatus;
  freeAttemptsRemaining: number;
  monthlyAttemptsRemaining: number;
  paidAttemptsRemaining: number;
  totalAttemptsRemaining: number;
  // Free preview totals, so the UI can say "1 of 1 used" without a
  // second request.
  freeAttemptsTotal: number;
  freeAttemptsUsed: number;
  // Null until a monthly plan is granted. No plan is sold yet.
  planCode: string | null;
  monthlyAttemptLimit: number | null;
  monthlyPeriodStart: string | null;
  monthlyPeriodEnd: string | null;
};

// The result of the check that runs before an expensive AI call.
// "already_consumed" means this attempt has been charged before, so the
// work is a retry the learner has already paid for.
export type ScoredAttemptAccessReason =
  | "already_consumed"
  | "has_access"
  | "no_attempts_remaining"
  | "access_suspended";

export type ScoredAttemptAccessResult = {
  allowed: boolean;
  reason: ScoredAttemptAccessReason;
  summary: UsageAccessSummary;
};

// The result of charging one scored attempt after feedback was saved.
export type ConsumeScoredAttemptStatus =
  | "consumed"
  | "already_consumed"
  | "blocked"
  | "failed";

export type ConsumeScoredAttemptResult = {
  status: ConsumeScoredAttemptStatus;
  creditSource: CreditSource | null;
  summary: UsageAccessSummary | null;
};

// The single error code the API returns when a learner has no scored
// attempts left. The client matches on this, never on the message.
export const NO_SCORED_ATTEMPTS_REMAINING = "NO_SCORED_ATTEMPTS_REMAINING";

export const NO_SCORED_ATTEMPTS_ERROR = "No scored attempts remaining";

// 402 Payment Required is the honest status here: the request is valid
// and the session is fine, the learner has simply run out of access.
export const NO_SCORED_ATTEMPTS_STATUS = 402;

// Body shared by every route that blocks an AI call, so the shape the
// client matches on is defined once.
export function noScoredAttemptsResponseBody(): {
  ok: false;
  error: string;
  code: string;
} {
  return {
    ok: false,
    error: NO_SCORED_ATTEMPTS_ERROR,
    code: NO_SCORED_ATTEMPTS_REMAINING,
  };
}

// An account row is created on first use, so a learner with no row yet
// still has their free preview. This is the shape used when the summary
// cannot be read, so the UI degrades to "no access" rather than
// promising attempts that may not exist.
export const EMPTY_USAGE_ACCESS_SUMMARY: UsageAccessSummary = {
  accessStatus: "active",
  freeAttemptsRemaining: 0,
  monthlyAttemptsRemaining: 0,
  paidAttemptsRemaining: 0,
  totalAttemptsRemaining: 0,
  freeAttemptsTotal: 1,
  freeAttemptsUsed: 1,
  planCode: null,
  monthlyAttemptLimit: null,
  monthlyPeriodStart: null,
  monthlyPeriodEnd: null,
};
