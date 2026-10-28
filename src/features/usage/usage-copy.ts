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

export const REQUEST_ACCESS_HREF = "/pricing";

export const DASHBOARD_HREF = "/dashboard";

// Previous feedback lives in the two module histories. Speaking is the
// default because it is the module most learners start with.
export const PREVIOUS_FEEDBACK_HREF = "/dashboard/speaking/attempts";

export const usageAccessCopy = {
  cardTitle: "AI feedback access",
  cardEyebrow: "Your access",
  badgeLabel: "AI feedback",
  freeSpeakingLabel: "Free Speaking AI",
  freeWritingLabel: "Free Writing AI",
  freeLabel: "Free preview",
  monthlyLabel: "Monthly plan",
  paidLabel: "Practice package",
  remainingSuffix: "remaining",
  suspendedTitle: "Your practice access is on hold",
  suspendedText:
    "Your account is not able to request AI feedback right now. Please contact the academy so we can help.",
  helperWithAccess:
    "You get one free AI feedback report for Speaking and one for Writing. Each saved report uses the matching free line (or your plan balance). Practising without AI feedback is always free.",
  helperWithoutAccess:
    "Recording, writing, and timed practice stay available. AI feedback reports need available access.",
  loadFailed:
    "We could not load your practice access just now. Please refresh the page.",
} as const;

// The blocked state, shown when a learner has no scored attempts left.
export const scoredAttemptLimitCopy = {
  title: "No free AI feedback left for this section",
  message:
    "You have used your free AI feedback for this section. To continue with AI feedback here, choose a practice plan.",
  requestAccess: "Choose a plan",
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
