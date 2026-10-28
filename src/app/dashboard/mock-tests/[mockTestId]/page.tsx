import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MockTestComingSoon } from "@/components/mock-tests/MockTestComingSoon";
import { userHasPaidMockAccess } from "@/features/platform/fulfill-stripe-purchase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mock test - CELPIP Decoded",
  robots: { index: false, follow: false },
};

export default async function PlaceholderMockTestPage({
  params,
  searchParams,
}: {
  params: Promise<{ mockTestId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { mockTestId } = await params;
  const match = /^mock-test-(\d+)$/.exec(mockTestId);
  const mockNumber = match ? Number(match[1]) : 0;

  if (!Number.isInteger(mockNumber) || mockNumber < 3 || mockNumber > 5) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const query = searchParams ? await searchParams : {};
  const raw = query.section;
  const section = Array.isArray(raw) ? raw[0] : raw;
  const unlocked = await userHasPaidMockAccess(user.id);

  return (
    <MockTestComingSoon
      mockNumber={mockNumber}
      section={section}
      unlocked={unlocked}
    />
  );
}
