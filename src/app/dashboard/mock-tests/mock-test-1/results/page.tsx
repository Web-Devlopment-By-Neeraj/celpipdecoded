import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MockRunResults } from "@/components/mock-tests/MockRunResults";
import { listMockRuns } from "@/features/mock-tests/mock-run-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mock Test 1 results - CELPIP Decoded",
  robots: { index: false, follow: false },
};

export default async function MockTest1ResultsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const runs = await listMockRuns(user.id);
  return <MockRunResults slug="mock-test-1" title="Mock Test 1" runs={runs} />;
}
