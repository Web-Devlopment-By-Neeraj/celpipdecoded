import {
  type OnboardingQuestionKey,
  REPEAT_TAKER_ONLY,
} from "@/features/onboarding/onboarding-questions";
import { MOCK_TEST_1_HUB_PATH } from "@/features/mock-tests/mock-test-1-routes";

export type OnboardingUiStep =
  | "welcome"
  | OnboardingQuestionKey
  | "finish";

export type IntakeAnswerMap = Partial<Record<OnboardingQuestionKey, unknown>>;

export function isRepeatTaker(answers: IntakeAnswerMap): boolean {
  return answers.taken_celpip_before === "repeat";
}

export function questionKeysForLearner(answers: IntakeAnswerMap): OnboardingQuestionKey[] {
  const base: OnboardingQuestionKey[] = [
    "whatsapp",
    "instagram",
    "taken_celpip_before",
    "times_taken",
    "last_test_date",
    "last_scores",
    "target_clb",
    "why_now",
    "referral_source",
    "weakest_sections",
    "next_test",
    "marketing_consent",
  ];

  if (!isRepeatTaker(answers)) {
    return base.filter((key) => !REPEAT_TAKER_ONLY.includes(key));
  }

  return base;
}

export function uiStepsForLearner(answers: IntakeAnswerMap): OnboardingUiStep[] {
  return ["welcome", ...questionKeysForLearner(answers), "finish"];
}

export function progressIndex(
  steps: OnboardingUiStep[],
  current: OnboardingUiStep,
): { index: number; total: number } {
  const questionSteps = steps.filter((s) => s !== "welcome" && s !== "finish");
  const currentKey =
    current === "welcome" || current === "finish" ? null : current;
  const index =
    currentKey === null
      ? 0
      : Math.max(1, questionSteps.indexOf(currentKey) + 1);
  return { index, total: questionSteps.length };
}

export function nextUiStep(
  steps: OnboardingUiStep[],
  current: OnboardingUiStep,
): OnboardingUiStep | null {
  const i = steps.indexOf(current);
  if (i < 0 || i >= steps.length - 1) return null;
  return steps[i + 1] ?? null;
}

export function previousUiStep(
  steps: OnboardingUiStep[],
  current: OnboardingUiStep,
): OnboardingUiStep | null {
  const i = steps.indexOf(current);
  if (i <= 0) return null;
  return steps[i - 1] ?? null;
}

export function resumeUiStep(
  answers: IntakeAnswerMap,
  savedStep: string | null | undefined,
): OnboardingUiStep {
  const steps = uiStepsForLearner(answers);
  if (savedStep && steps.includes(savedStep as OnboardingUiStep)) {
    return savedStep as OnboardingUiStep;
  }

  for (const key of questionKeysForLearner(answers)) {
    if (answers[key] === undefined) {
      return key;
    }
  }

  if (answers.marketing_consent !== undefined) {
    return "finish";
  }

  return "welcome";
}

export type FirstStepRecommendation = {
  message: string;
  href: string;
  cta: string;
};

export function buildFirstStepRecommendation(
  answers: IntakeAnswerMap,
): FirstStepRecommendation {
  const nextTest = answers.next_test as
    | { range?: string; exactDate?: string | null }
    | undefined;
  const range = nextTest?.range;
  const exactDate = nextTest?.exactDate;
  const weakest = (answers.weakest_sections as string[] | undefined) ?? [];
  const repeat = isRepeatTaker(answers);

  if (range === "within_7_days") {
    return {
      message:
        "Your test is in a few days. Don't start anything new. Start here: the Speaking Task 1 structure.",
      href: "/dashboard/speaking",
      cta: "Open Speaking practice",
    };
  }

  if (repeat && weakest.includes("speaking")) {
    return {
      message:
        "You've fallen short in speaking before. That is rarely about vocabulary. Start here: the three-part answer shape.",
      href: "/dashboard/speaking",
      cta: "Open Speaking practice",
    };
  }

  if (repeat && weakest.length > 0) {
    const section = weakest[0] ?? "writing";
    const label =
      section.charAt(0).toUpperCase() + section.slice(1);
    return {
      message: `You know the test already. Start here: a timed ${label} practice set, so we can see exactly where the points go.`,
      href: `/dashboard/${section}`,
      cta: `Open ${label} practice`,
    };
  }

  if (!repeat && range === "not_booked") {
    return {
      message:
        "Before anything else, find out where you stand. Start here: your free mock test.",
      href: MOCK_TEST_1_HUB_PATH,
      cta: "Start free mock test",
    };
  }

  if (!repeat && range && range !== "not_booked") {
    const dateBit = exactDate ? ` until ${exactDate}` : "";
    return {
      message: `Start here: your free mock test, then we'll plan the weeks${dateBit}.`,
      href: MOCK_TEST_1_HUB_PATH,
      cta: "Start free mock test",
    };
  }

  return {
    message:
      "Before anything else, find out where you stand. Start here: your free mock test.",
    href: MOCK_TEST_1_HUB_PATH,
    cta: "Start free mock test",
  };
}

export function firstNameFromFullName(fullName: string | null | undefined): string {
  const trimmed = (fullName ?? "").trim();
  if (!trimmed) return "there";
  return trimmed.split(/\s+/)[0] ?? "there";
}
