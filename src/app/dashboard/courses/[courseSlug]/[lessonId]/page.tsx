import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CourseLessonScreen } from "@/components/courses/CourseLessonScreen";
import { BRAND_NAME } from "@/features/brand/brand-copy";
import { loadLessonScreen } from "@/features/courses/page-data";
import { loadCourse } from "@/features/courses/library";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ courseSlug: string; lessonId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { courseSlug, lessonId } = await params;
  const course = await loadCourse(courseSlug);
  const lesson = course?.lessons.find((item) => item.id === lessonId);
  const title = lesson?.title ?? course?.title ?? "Lesson";
  return { title: `${title} - CELPIP Decoded` };
}

export default async function CourseLessonPage({ params }: Params) {
  const { courseSlug, lessonId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/dashboard/courses/${courseSlug}/${lessonId}`);
  }

  const screen = await loadLessonScreen({
    userId: user.id,
    email: user.email ?? null,
    courseSlug,
    lessonId,
  });
  if (!screen) notFound();

  return (
    <CourseLessonScreen
      brand={BRAND_NAME}
      email={user.email ?? null}
      userId={user.id}
      {...screen}
    />
  );
}
