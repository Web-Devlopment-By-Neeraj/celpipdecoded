import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MockRunResults } from "@/components/mock-tests/MockRunResults";
import { listMockRuns } from "@/features/mock-tests/mock-run-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mock test results - CELPIP Decoded",
  robots: { index: false, follow: false },
};

export default async function PublishedMockResultsPage({
  params,
}: {
  params: Promise<{ mockTestId: string }>;
}) {
  const { mockTestId } = await params;

  if (
    mockTestId === "mock-test-1" ||
    !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(mockTestId)
  ) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const number = /^mock-test-(\d+)$/.exec(mockTestId)?.[1];
  const title = number ? `Mock Test ${number}` : mockTestId;
  const runs = await listMockRuns(user.id);

  return <MockRunResults slug={mockTestId} title={title} runs={runs} />;
}
