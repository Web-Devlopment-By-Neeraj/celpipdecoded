import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MockTestsHub } from "@/components/mock-tests/MockTestsHub";
import { userHasPaidMockAccess } from "@/features/platform/fulfill-stripe-purchase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mock tests - CELPIP Decoded",
  robots: { index: false, follow: false },
};

export default async function MockTestsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const mocksUnlocked = await userHasPaidMockAccess(user.id);

  return <MockTestsHub mocksUnlocked={mocksUnlocked} />;
}
