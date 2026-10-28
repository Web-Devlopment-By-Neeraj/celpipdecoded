import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  loadIntakeAnswers,
  loadOnboardingProfile,
  resolveResumeStep,
} from "@/features/onboarding/onboarding-store";
import {
  buildFirstStepRecommendation,
  firstNameFromFullName,
  uiStepsForLearner,
} from "@/features/onboarding/onboarding-flow";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const profileResult = await loadOnboardingProfile(supabase, user.id);
  if (!profileResult.ok) {
    return NextResponse.json(
      { ok: false, error: "Could not load your profile." },
      { status: 500 },
    );
  }

  const answers = await loadIntakeAnswers(supabase, user.id);
  const { profile } = profileResult;
  const completed = Boolean(profile.onboarding_completed_at);
  const currentStep = resolveResumeStep(profile, answers);
  const steps = uiStepsForLearner(answers);
  const firstStep = buildFirstStepRecommendation(answers);

  return NextResponse.json({
    ok: true,
    completed,
    currentStep,
    steps,
    answers,
    firstName: firstNameFromFullName(profile.full_name),
    firstStep,
  });
}
