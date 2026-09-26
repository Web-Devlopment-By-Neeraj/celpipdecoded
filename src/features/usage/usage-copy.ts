// Learner facing wording for scored attempt access (USAGE-01).
//
// All access copy lives here so the dashboard, the speaking and writing
// pages, and the blocked state say the same thing. Tone follows the rest
// of the app: professional CELPIP Decoded wording, no promises of
// unlimited free AI feedback and no official score language.
//
// House style: normal hyphens only, no long hyphens or em dashes.
//
// Strings only, no side effects, so this file is safe to import from a
// client component.

import type { UsageAccessSummary } from "./access-types";

// Where "Request access" goes. The landing page inquiry form is the
// existing way to reach the academy. There is no checkout yet, and this
// ticket does not build one.
export const REQUEST_ACCESS_HREF = "/#inquiry";

export const DASHBOARD_HREF = "/dashboard";

// Previous feedback lives in the two module histories. Speaking is the
// default because it is the module most learners start with.
export const PREVIOUS_FEEDBACK_HREF = "/dashboard/speaking/attempts";

export const usageAccessCopy = {
  cardTitle: "AI feedback access",
  cardEyebrow: "Your access",
  badgeLabel: "AI feedback",
  freeLabel: "Free preview",
  monthlyLabel: "Monthly plan",
  paidLabel: "Practice package",
  remainingSuffix: "remaining",
  suspendedTitle: "Your practice access is on hold",
  suspendedText:
    "Your account is not able to request AI feedback right now. Please contact the academy so we can help.",
  helperWithAccess:
    "One scored attempt is used each time an AI feedback report is saved. Practising without AI feedback is always free.",
  helperWithoutAccess:
    "Recording, writing, and timed practice stay available. AI feedback reports need available access.",
  loadFailed:
    "We could not load your practice access just now. Please refresh the page.",
} as const;

// The blocked state, shown when a learner has no scored attempts left.
export const scoredAttemptLimitCopy = {
  title: "You have used your free AI feedback report",
  message:
    "You have used your free AI feedback report. To continue practising with AI feedback, please request access or choose a practice package.",
  requestAccess: "Request access",
  backToDashboard: "Back to dashboard",
  viewPreviousFeedback: "View previous feedback",
} as const;

// "1 attempt" reads better than "1 attempts" and the app shows this
// number often, so the plural is handled once.
export function formatAttemptCount(count: number): string {
  return count === 1 ? "1 attempt" : `${count} attempts`;
}

// Short summary line for the badge and the card, for example
// "1 attempt remaining".
export function describeRemainingAttempts(
  summary: UsageAccessSummary,
): string {
  if (summary.accessStatus !== "active") {
    return "Access on hold";
  }

  if (summary.totalAttemptsRemaining <= 0) {
    return "No attempts remaining";
  }

  return `${formatAttemptCount(summary.totalAttemptsRemaining)} ${usageAccessCopy.remainingSuffix}`;
}
