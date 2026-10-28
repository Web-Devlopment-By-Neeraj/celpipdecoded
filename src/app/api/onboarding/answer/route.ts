import { NextResponse } from "next/server";
import type { OnboardingQuestionKey } from "@/features/onboarding/onboarding-questions";
import {
  nextUiStep,
  uiStepsForLearner,
  type OnboardingUiStep,
} from "@/features/onboarding/onboarding-flow";
import {
  loadIntakeAnswers,
  upsertIntakeAnswer,
} from "@/features/onboarding/onboarding-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const QUESTION_KEYS = new Set<string>([
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
]);

function isQuestionKey(value: string): value is OnboardingQuestionKey {
  return QUESTION_KEYS.has(value);
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { questionKey?: string; answer?: unknown; currentStep?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const questionKey = body.questionKey;
  if (!questionKey || !isQuestionKey(questionKey)) {
    return NextResponse.json({ ok: false, error: "Invalid question" }, { status: 400 });
  }

  const existing = await loadIntakeAnswers(supabase, user.id);
  const merged = { ...existing, [questionKey]: body.answer };
  const steps = uiStepsForLearner(merged);
  const fromStep = (body.currentStep ?? questionKey) as OnboardingUiStep;
  const nextStep = nextUiStep(steps, fromStep);

  const saveResult = await upsertIntakeAnswer(
    supabase,
    user.id,
    questionKey,
    body.answer,
    nextStep,
  );

  if (!saveResult.ok) {
    return NextResponse.json(
      { ok: false, error: saveResult.message },
      { status: 500 },
    );
  }

  const answers = await loadIntakeAnswers(supabase, user.id);

  return NextResponse.json({
    ok: true,
    nextStep,
    steps: uiStepsForLearner(answers),
    answers,
  });
}
