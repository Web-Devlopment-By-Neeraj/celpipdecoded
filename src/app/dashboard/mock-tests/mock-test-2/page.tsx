import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MockTestComingSoon } from "@/components/mock-tests/MockTestComingSoon";
import { userHasPaidMockAccess } from "@/features/platform/fulfill-stripe-purchase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mock Test 2 - CELPIP Decoded",
  robots: { index: false, follow: false },
};

export default async function MockTest2Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = searchParams ? await searchParams : {};
  const raw = params.section;
  const section = Array.isArray(raw) ? raw[0] : raw;
  const unlocked = await userHasPaidMockAccess(user.id);

  return (
    <MockTestComingSoon
      mockNumber={2}
      section={section}
      unlocked={unlocked}
    />
  );
}
