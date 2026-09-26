// Learner facing wording for the dashboard home screen (CELPIP-UX-03).
//
// All dashboard copy lives here so the hero, the progress cards, the
// recommendation and the empty states say the same thing. Tone follows
// the rest of the app: professional CELPIP Decoded wording, practice
// estimates only, and never an official CELPIP score.
//
// House style: normal hyphens only, no long hyphens or em dashes.
//
// Strings and pure helpers only, no side effects, so this file is safe
// to import from a client component.

import { BRAND_NAME, PRACTICE_ESTIMATE_LINE } from "@/features/brand/brand-copy";
import type { DashboardModuleKey } from "./dashboard-types";

// Routes the dashboard links to. All of these already exist, this file
// does not add routes.
export const dashboardRoutes = {
  dashboard: "/dashboard",
  speaking: "/dashboard/speaking",
  speakingHistory: "/dashboard/speaking/attempts",
  writing: "/dashboard/writing",
  writingHistory: "/dashboard/writing/attempts",
} as const;

// Module slugs in the modules table that the dashboard grid shows.
// Live classes is deliberately excluded: live package work comes later
// in LIVE-01, so no live class card is rendered here.
export const DASHBOARD_MODULE_SLUGS = [
  "celpip-speaking",
  "celpip-writing",
  "celpip-reading",
  "celpip-listening",
] as const;

// Module slugs that have a working route today. A module is shown as
// available when it has a route, so a catalog row still marked coming
// soon does not hide a module the learner can already practise.
export const DASHBOARD_MODULE_ROUTES: Record<string, string> = {
  "celpip-speaking": dashboardRoutes.speaking,
  "celpip-writing": dashboardRoutes.writing,
};

export const PROGRAM_NAME = BRAND_NAME;

// The one line used wherever an estimated level is shown. The full legal
// disclaimer sits once in the app footer (BRAND-01), so a result screen
// carries the short line rather than the paragraph.
export const PRACTICE_ESTIMATE_DISCLAIMER = PRACTICE_ESTIMATE_LINE;

export const MODULE_LABELS: Record<DashboardModuleKey, string> = {
  speaking: "Speaking practice",
  writing: "Writing practice",
};

// Short label for list rows and chips, where the full module title is
// too long.
export const MODULE_SHORT_LABELS: Record<DashboardModuleKey, string> = {
  speaking: "Speaking",
  writing: "Writing",
};

export const dashboardCopy = {
  pageTitle: "Welcome to " + BRAND_NAME,
  pageEyebrow: PROGRAM_NAME,
  pageDescription:
    "Pick up where you left off, review your recent feedback, and keep building your CELPIP skills.",

  heroGreetingReturning: "Welcome back",
  heroGreetingNew: "Welcome to " + BRAND_NAME,
  heroMessageReturning:
    "Short, regular practice sessions build the most progress. Continue where you left off and keep your feedback reports coming.",
  heroMessageNew:
    "Start with a speaking or writing task. Each completed task gives you an AI feedback report with an estimated practice level.",
  heroPrimaryAction: "Continue practice",
  heroSecondaryAction: "View speaking history",
  heroImageAlt: "",

  recommendedHeading: "Start your next practice",
  recommendedEyebrow: "Recommended",
  recommendedDescription:
    "Suggested from your saved practice history. You can always choose a different module.",

  accessPlaceholderTitle: "AI feedback access",
  accessPlaceholderText:
    "Your practice access details will appear here.",

  progressHeading: "Practice progress",
  progressDescription:
    "Your speaking and writing practice at a glance. Estimated practice levels use the 1 to 12 practice scale.",
  progressReportsLabel: "Feedback reports completed",
  progressBestLevelLabel: "Best estimated practice level",
  progressLatestLevelLabel: "Latest estimated practice level",
  progressLatestDateLabel: "Latest practice",
  progressNoValue: "Not yet",
  progressNoLevelHelper:
    "Complete a feedback report to see your estimated practice level.",
  continueSpeaking: "Continue speaking practice",
  continueWriting: "Continue writing practice",
  viewSpeakingHistory: "View speaking history",
  viewWritingHistory: "View writing history",

  recentHeading: "Recent feedback",
  recentDescription:
    "Your most recent completed speaking and writing feedback reports.",
  recentViewFeedback: "View feedback",
  recentSubmittedLabel: "Submitted",
  recentLevelLabel: "Estimated practice level",
  recentEmptyTitle: "No feedback reports yet",
  recentEmptyText:
    "Complete a speaking or writing task to receive your first AI feedback report.",
  recentEmptyAction: "Start speaking practice",

  badgesHeading: "Practice badges",
  badgesDescription:
    "Badges you have earned from completed practice feedback reports.",
  badgesEarnedLabel: "Earned",
  badgesEmptyTitle: "No practice badges yet",
  badgesEmptyText:
    "Your first badge is awarded with your first completed feedback report.",
  badgesEmptyAction: "Start writing practice",

  modulesHeading: "Practice modules",
  modulesDescription:
    "Speaking and writing practice are open now. More modules are coming soon.",
  modulesActiveLabel: "Active",
  modulesComingSoonLabel: "Coming soon",
  modulesOpenLabel: "Open module",
  modulesEmptyTitle: "No practice modules yet",
  modulesEmptyText:
    "Practice modules are not available right now. Please check back soon.",
} as const;

// Reason lines for each recommendation rule. Written as full sentences
// so the card can render them without extra wording.
export const recommendationCopy: Record<
  string,
  { title: string; reason: string }
> = {
  "start-practice": {
    title: "Start with speaking practice",
    reason:
      "You have no saved feedback reports yet. A short speaking task is the quickest way to get your first estimated practice level. Writing practice is ready when you are.",
  },
  "balance-writing": {
    title: "Try writing practice next",
    reason:
      "Your saved reports are all from speaking practice. Adding a writing task gives you a fuller picture of your CELPIP preparation.",
  },
  "balance-speaking": {
    title: "Try speaking practice next",
    reason:
      "Your saved reports are all from writing practice. A speaking task will round out your CELPIP preparation.",
  },
  "lower-level": {
    title: "Focus on this module next",
    reason:
      "Your latest estimated practice level is lower here, so extra practice in this module should help most.",
  },
  "less-recent": {
    title: "Return to this module next",
    reason:
      "You have not practised this module as recently. Coming back to it keeps both skills fresh.",
  },
};

// "Continue speaking practice" or "Continue writing practice" for a
// module key.
export function getContinueLabel(moduleKey: DashboardModuleKey): string {
  return moduleKey === "speaking"
    ? dashboardCopy.continueSpeaking
    : dashboardCopy.continueWriting;
}

// "View speaking history" or "View writing history" for a module key.
export function getHistoryLabel(moduleKey: DashboardModuleKey): string {
  return moduleKey === "speaking"
    ? dashboardCopy.viewSpeakingHistory
    : dashboardCopy.viewWritingHistory;
}

// Practice route for a module key.
export function getModulePracticeHref(moduleKey: DashboardModuleKey): string {
  return moduleKey === "speaking"
    ? dashboardRoutes.speaking
    : dashboardRoutes.writing;
}

// History route for a module key.
export function getModuleHistoryHref(moduleKey: DashboardModuleKey): string {
  return moduleKey === "speaking"
    ? dashboardRoutes.speakingHistory
    : dashboardRoutes.writingHistory;
}

// Shared mailbox names that are not a person. Greeting someone as
// "Office" reads worse than no name at all, so these fall back to the
// plain greeting.
const ROLE_MAILBOX_NAMES = new Set([
  "admin",
  "contact",
  "hello",
  "help",
  "info",
  "mail",
  "noreply",
  "office",
  "school",
  "support",
  "team",
  "test",
]);

// First name for the greeting, taken from the signed in email local
// part. Falls back to a plain greeting when nothing usable is there, so
// the hero never renders an address or an empty name.
export function getGreetingName(email: string | null | undefined): string {
  if (!email) return "";

  const localPart = email.split("@")[0] ?? "";
  const firstWord = localPart.split(/[._-]/)[0] ?? "";

  // Anything that is not plainly a name (numbers, symbols) is dropped
  // rather than shown back to the learner.
  if (!/^[a-zA-Z]{2,}$/.test(firstWord)) {
    return "";
  }

  if (ROLE_MAILBOX_NAMES.has(firstWord.toLowerCase())) {
    return "";
  }

  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
}
