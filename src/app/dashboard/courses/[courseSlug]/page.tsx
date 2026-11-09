import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { firstOpenLessonId } from "@/features/courses/page-data";
import { loadCourse } from "@/features/courses/library";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cx, text } from "@/features/design/design-tokens";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ courseSlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await loadCourse(courseSlug);
  return { title: course ? `${course.title} - CELPIP Decoded` : "Course - CELPIP Decoded" };
}

export default async function CourseIndexPage({ params }: Params) {
  const { courseSlug } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/dashboard/courses/${courseSlug}`);

  const course = await loadCourse(courseSlug);
  if (!course) notFound();

  const lessonId = await firstOpenLessonId(user.id, course.slug);
  if (lessonId) redirect(`/dashboard/courses/${course.slug}/${lessonId}`);

  return (
    <div>
      <Link href="/dashboard/courses" className={cx("text-sm font-semibold", text.secondary)}>
        ← All courses
      </Link>
      <h1 className={cx(text.heading, "mt-3 text-3xl")}>{course.title}</h1>
      <p className={cx("mt-3 max-w-xl text-sm leading-6", text.secondary)}>
        No lesson videos are in this course folder yet. Add a video file and it will show up here.
      </p>
    </div>
  );
}
