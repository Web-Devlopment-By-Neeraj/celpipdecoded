import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MockTest1Hub } from "@/components/mock-tests/MockTest1Hub";
import { brandTitle } from "@/features/brand/brand-copy";
import { listMockRuns } from "@/features/mock-tests/mock-run-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: brandTitle("Mock Test 1"),
  robots: { index: false, follow: false },
};

export default async function MockTest1HubPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const runs = await listMockRuns(user.id);
  return <MockTest1Hub runs={runs} />;
}
