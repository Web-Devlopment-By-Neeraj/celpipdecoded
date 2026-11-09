import type { IntakeAnswerMap } from "@/features/onboarding/onboarding-flow";
import { buildFirstStepRecommendation } from "@/features/onboarding/onboarding-flow";
import {
  NEXT_TEST_OPTIONS,
  TARGET_CLB_OPTIONS,
} from "@/features/onboarding/onboarding-questions";
import { zonedParts } from "@/features/platform/time";
import type { UsageAccessSummary } from "@/features/usage/access-types";

// Eastern time, the same zone the live class schedule uses.
export const DASHBOARD_TIME_ZONE = "America/Toronto";

// The pack's Test Sprint daily allowance. The account still blocks on the
// monthly balance. A separate daily block is Task 10, so the card says so.
export const SPRINT_DAILY_ALLOWANCE = 10;

export type TestCountdown = {
  headline: string;
  detail: string;
};

export type EvaluationSnapshot =
  | {
      kind: "sprint";
      usedToday: number;
      leftToday: number;
      dailyAllowance: number;
      leftThisMonth: number;
      monthLimit: number | null;
    }
  | {
      kind: "free";
      speakingLeft: number;
      writingLeft: number;
    };

export type NextStepCard = {
  message: string;
  href: string;
  cta: string;
};

function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
): string | null {
  return options.find((option) => option.value === value)?.label ?? null;
}

function calendarDayNumber(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

function readExactDate(answer: unknown): string | null {
  if (!answer || typeof answer !== "object") return null;
  const exact = (answer as { exactDate?: unknown }).exactDate;
  return typeof exact === "string" && /^\d{4}-\d{2}-\d{2}$/.test(exact)
    ? exact
    : null;
}

function readRange(answer: unknown): string | null {
  if (typeof answer === "string") return answer;
  if (!answer || typeof answer !== "object") return null;
  const range = (answer as { range?: unknown }).range;
  return typeof range === "string" ? range : null;
}

export function describeTestCountdown(
  answer: unknown,
  now: Date,
): TestCountdown {
  const exactDate = readExactDate(answer);
  if (exactDate) {
    const [year, month, day] = exactDate.split("-").map(Number);
    const today = zonedParts(now, DASHBOARD_TIME_ZONE);
    const diff =
      calendarDayNumber(year, month, day) -
      calendarDayNumber(today.year, today.month, today.day);

    if (diff > 1) {
      return {
        headline: `${diff} days left`,
        detail: `Test date ${exactDate}.`,
      };
    }
    if (diff === 1) {
      return { headline: "1 day left", detail: `Test date ${exactDate}.` };
    }
    if (diff === 0) {
      return { headline: "Your test is today", detail: `Test date ${exactDate}.` };
    }
    return {
      headline: "Test date has passed",
      detail: `The date on file is ${exactDate}.`,
    };
  }

  const range = readRange(answer);
  const label = range ? optionLabel(NEXT_TEST_OPTIONS, range) : null;
  if (label) {
    return { headline: label, detail: "From your sign-up answers. No exact date yet." };
  }

  return {
    headline: "Not set yet",
    detail: "Your sign-up answers do not include a test date.",
  };
}

export function describeTargetClb(answer: unknown): string {
  if (typeof answer !== "string") return "Not set yet";
  return optionLabel(TARGET_CLB_OPTIONS, answer) ?? "Not set yet";
}

export function describeEvaluations(input: {
  summary: UsageAccessSummary | null;
  usedToday: number | null;
}): EvaluationSnapshot {
  const usedToday = input.usedToday ?? 0;
  if (input.summary?.planCode) {
    const leftToday = Math.max(0, SPRINT_DAILY_ALLOWANCE - usedToday);
    return {
      kind: "sprint",
      usedToday,
      leftToday,
      dailyAllowance: SPRINT_DAILY_ALLOWANCE,
      leftThisMonth: input.summary.monthlyAttemptsRemaining,
      monthLimit: input.summary.monthlyAttemptLimit,
    };
  }

  return {
    kind: "free",
    speakingLeft: input.summary?.freeSpeakingRemaining ?? 0,
    writingLeft: input.summary?.freeWritingRemaining ?? 0,
  };
}

export function describeNextStep(answers: IntakeAnswerMap): NextStepCard {
  const recommendation = buildFirstStepRecommendation(answers);
  return {
    message: recommendation.message,
    href: recommendation.href,
    cta: recommendation.cta,
  };
}
