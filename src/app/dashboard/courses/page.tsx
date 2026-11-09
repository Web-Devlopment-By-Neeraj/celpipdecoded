import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CourseLibrary } from "@/components/courses/CourseLibrary";
import { loadCourseCards, viewerCanWatchCourse } from "@/features/courses/page-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses - CELPIP Decoded",
  description: "Video lessons for CELPIP Listening, Writing, and Speaking.",
};

export default async function DashboardCoursesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/courses");

  const [courses, unlocked] = await Promise.all([
    loadCourseCards({ userId: user.id, signedIn: true }),
    viewerCanWatchCourse(user.id, user.email, "course"),
  ]);

  return <CourseLibrary courses={courses} unlocked={unlocked} signedIn />;
}
