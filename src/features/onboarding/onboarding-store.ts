import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type IntakeAnswerMap,
  questionKeysForLearner,
  resumeUiStep,
  type OnboardingUiStep,
} from "@/features/onboarding/onboarding-flow";
import type { OnboardingQuestionKey } from "@/features/onboarding/onboarding-questions";

export type OnboardingProfileRow = {
  full_name: string | null;
  onboarding_completed_at: string | null;
  onboarding_current_step: string | null;
};

export async function loadOnboardingProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ ok: true; profile: OnboardingProfileRow } | { ok: false }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed_at, onboarding_current_step")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false };
  }

  return { ok: true, profile: data as OnboardingProfileRow };
}

export async function loadIntakeAnswers(
  supabase: SupabaseClient,
  userId: string,
): Promise<IntakeAnswerMap> {
  const { data } = await supabase
    .from("learner_intake_answers")
    .select("question_key, answer")
    .eq("user_id", userId);

  const map: IntakeAnswerMap = {};
  for (const row of data ?? []) {
    map[row.question_key as OnboardingQuestionKey] = row.answer;
  }
  return map;
}

export async function upsertIntakeAnswer(
  supabase: SupabaseClient,
  userId: string,
  questionKey: OnboardingQuestionKey,
  answer: unknown,
  nextStep: OnboardingUiStep | null,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error: answerError } = await supabase.from("learner_intake_answers").upsert(
    {
      user_id: userId,
      question_key: questionKey,
      answer,
      answered_at: new Date().toISOString(),
    },
    { onConflict: "user_id,question_key" },
  );

  if (answerError) {
    return { ok: false, message: answerError.message };
  }

  if (questionKey === "taken_celpip_before" && answer === "first_time") {
    await supabase
      .from("learner_intake_answers")
      .delete()
      .eq("user_id", userId)
      .in("question_key", ["times_taken", "last_test_date", "last_scores"]);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ onboarding_current_step: nextStep })
    .eq("id", userId);

  if (profileError) {
    return { ok: false, message: profileError.message };
  }

  return { ok: true };
}

export async function completeOnboarding(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const answers = await loadIntakeAnswers(supabase, userId);
  const required = questionKeysForLearner(answers);
  for (const key of required) {
    if (answers[key] === undefined) {
      return { ok: false, message: "Please answer all questions first." };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed_at: new Date().toISOString(),
      onboarding_current_step: null,
    })
    .eq("id", userId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export function resolveResumeStep(
  profile: OnboardingProfileRow,
  answers: IntakeAnswerMap,
): OnboardingUiStep {
  if (profile.onboarding_completed_at) {
    return "finish";
  }
  return resumeUiStep(answers, profile.onboarding_current_step);
}
