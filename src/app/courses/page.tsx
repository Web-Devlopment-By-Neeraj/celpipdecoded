import type { Metadata } from "next";
import { CourseCatalog } from "@/components/courses/CourseCatalog";
import { userHasCourseAccess } from "@/features/platform/fulfill-stripe-purchase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Course videos - CELPIP Decoded",
  description: "Course lessons stay visible when they are locked. English and Hindi are the live languages.",
};

export default async function CoursesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const unlocked = user ? await userHasCourseAccess(user.id) : false;

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink">
      <CourseCatalog unlocked={unlocked} />
    </main>
  );
}
