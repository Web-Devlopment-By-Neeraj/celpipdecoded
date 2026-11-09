import type { Metadata } from "next";
import { CourseLibrary } from "@/components/courses/CourseLibrary";
import { loadCourseCards, viewerCanWatchCourse } from "@/features/courses/page-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses - CELPIP Decoded",
  description: "Video lessons for CELPIP Listening, Writing, and Speaking.",
};

export default async function CoursesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const signedIn = Boolean(user);
  const [courses, unlocked] = await Promise.all([
    loadCourseCards({ userId: user?.id ?? null, signedIn }),
    user ? viewerCanWatchCourse(user.id, user.email, "course") : Promise.resolve(false),
  ]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <CourseLibrary courses={courses} unlocked={unlocked} signedIn={signedIn} />
      </div>
    </main>
  );
}
