import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOnboardingIncomplete } from "@/features/onboarding/require-onboarding-complete";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  await requireOnboardingIncomplete(user.id);

  return (
    <div className="min-h-screen bg-cream px-5 py-10 sm:py-14">
      <div className="mx-auto mb-8 flex max-w-lg justify-center">
        <CelpipDecodedLogo size="md" />
      </div>
      {children}
    </div>
  );
}
