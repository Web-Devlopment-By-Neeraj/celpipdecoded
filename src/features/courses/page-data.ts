import { isAdminEmail } from "@/lib/admin/require-admin";
import { userHasCourseAccess } from "@/features/platform/fulfill-stripe-purchase";
import { defaultSettings } from "@/features/platform/settings";
import { lessonPlayback } from "./access";
import type { CourseTier } from "./catalog";
import { loadCourse, loadCourseLibrary, type LoadedCourse } from "./library";
import { listComments, loadProgressMap, type LessonProgress } from "./store";

export async function viewerCanWatchCourse(
  userId: string,
  email: string | null | undefined,
  tier: CourseTier,
): Promise<boolean> {
  if (tier === "free") return true;
  if (isAdminEmail(email)) return true;
  return userHasCourseAccess(userId);
}

export async function loadCourseCards(input: {
  userId: string | null;
  signedIn: boolean;
}) {
  const courses = await loadCourseLibrary();
  const progress = await progressForCourses(input.userId, courses);
  return courses.map((course, index) => {
    const rows = progress[index] ?? {};
    const completedCount = course.lessons.filter((lesson) => rows[lesson.id]?.completed).length;
    const destination = `/dashboard/courses/${course.slug}`;
    return {
      slug: course.slug,
      title: course.title,
      summary: course.summary,
      languageLabel: course.languageLabel,
      tier: course.tier,
      lessonCount: course.lessons.length,
      completedCount,
      href:
        course.lessons.length === 0
          ? null
          : input.signedIn
            ? destination
            : `/login?next=${encodeURIComponent(destination)}`,
    };
  });
}

async function progressForCourses(
  userId: string | null,
  courses: LoadedCourse[],
): Promise<Array<Record<string, LessonProgress>>> {
  if (!userId) return courses.map(() => ({}));
  return Promise.all(
    courses.map(async (course) => {
      try {
        return await loadProgressMap(userId, course.slug);
      } catch {
        return {};
      }
    }),
  );
}

export async function loadLessonScreen(input: {
  userId: string;
  email: string | null;
  courseSlug: string;
  lessonId: string;
}) {
  const course = await loadCourse(input.courseSlug);
  if (!course) return null;
  const lesson = course.lessons.find((item) => item.id === input.lessonId);
  if (!lesson) return null;

  const settings = defaultSettings();
  const unlocked = await viewerCanWatchCourse(input.userId, input.email, course.tier);
  const grant = lessonPlayback({
    hasCourse: unlocked,
    tier: course.tier,
    available: true,
    previewSeconds: settings["video.preview_seconds"],
  });

  let progress: Record<string, LessonProgress> = {};
  try {
    progress = await loadProgressMap(input.userId, course.slug);
  } catch {
    progress = {};
  }

  let comments: Array<{
    id: string;
    authorLabel: string;
    body: string;
    createdAt: string;
    mine: boolean;
  }> = [];
  let commentsError: string | null = null;
  try {
    const stored = await listComments(course.slug, lesson.id);
    comments = stored.map((comment) => ({
      id: comment.id,
      authorLabel: comment.authorLabel,
      body: comment.body,
      createdAt: comment.createdAt,
      mine: comment.userId === input.userId,
    }));
  } catch {
    commentsError = "Comments could not be loaded.";
  }

  return {
    course: { slug: course.slug, title: course.title },
    lessons: course.lessons.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      group: item.group,
      durationSec: item.durationSec,
      positionSeconds: progress[item.id]?.positionSeconds ?? 0,
      completed: progress[item.id]?.completed === true,
    })),
    lessonId: lesson.id,
    playback: {
      src: grant.ok ? `/api/courses/media/${course.slug}/${lesson.id}` : null,
      maxSeconds: grant.ok && grant.mode === "preview" ? grant.maxSeconds : null,
      unavailable: grant.ok ? null : "This lesson is not available yet.",
    },
    completeRatio: settings["lesson.completed_threshold"],
    comments,
    commentsError,
  };
}

export async function firstOpenLessonId(userId: string, courseSlug: string): Promise<string | null> {
  const course = await loadCourse(courseSlug);
  if (!course || course.lessons.length === 0) return null;
  let progress: Record<string, LessonProgress> = {};
  try {
    progress = await loadProgressMap(userId, course.slug);
  } catch {
    progress = {};
  }
  const open = course.lessons.find((lesson) => !progress[lesson.id]?.completed);
  return (open ?? course.lessons[0]).id;
}
