import type { Metadata } from "next";
import { CourseCatalog } from "@/components/courses/CourseCatalog";
import { userHasCourseAccess } from "@/features/platform/fulfill-stripe-purchase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses - CELPIP Decoded",
  description: "Course lessons stay visible when they are locked. English and Hindi are the live languages.",
};

export default async function DashboardCoursesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const unlocked = user ? await userHasCourseAccess(user.id) : false;

  return <CourseCatalog unlocked={unlocked} />;
}
