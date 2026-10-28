import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ExamModeViewport } from "@/components/exam/ExamModeViewport";
import { MockTest1FullStartFlow } from "@/components/mock-tests/MockTest1FullStartFlow";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mock Test 1 — Full mock - CELPIP Decoded",
  robots: { index: false, follow: false },
};

export default async function MockTest1FullStartPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <ExamModeViewport label="Mock Test 1 — Full mock">
      <MockTest1FullStartFlow />
    </ExamModeViewport>
  );
}
