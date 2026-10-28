import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadOnboardingProfile } from "@/features/onboarding/onboarding-store";

export async function requireOnboardingComplete(userId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const profileResult = await loadOnboardingProfile(supabase, userId);

  if (!profileResult.ok) {
    return;
  }

  if (!profileResult.profile.onboarding_completed_at) {
    redirect("/onboarding");
  }
}

export async function requireOnboardingIncomplete(userId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const profileResult = await loadOnboardingProfile(supabase, userId);

  if (!profileResult.ok) {
    redirect("/dashboard");
  }

  if (profileResult.profile.onboarding_completed_at) {
    redirect("/dashboard");
  }
}
