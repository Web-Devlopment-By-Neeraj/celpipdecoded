// Reads the course video folder on the server. Videos are not bundled
// and are not served from /public. Playback goes through the media route,
// which checks the signed-in learner first.

import { existsSync } from "node:fs";
import { readdir, realpath } from "node:fs/promises";
import path from "node:path";
import {
  COURSES,
  LESSON_COPY,
  buildLessons,
  isSafeMediaFileName,
  isVideoFileName,
  resolveInsideRoot,
  slugifyCourseName,
  uniqueSlug,
  type CourseDefinition,
  type CourseTier,
  type LessonRecord,
} from "./catalog";
import { readVideoDurationSeconds } from "./media";

export type LoadedLesson = LessonRecord & {
  durationSec: number | null;
  absolutePath: string;
};

export type LoadedCourse = {
  slug: string;
  title: string;
  summary: string;
  tier: CourseTier;
  languageLabel: string;
  lessons: LoadedLesson[];
};

const DEV_FALLBACK = "/Users/themachine/Desktop/Course Videos (English)";

export function courseVideosRoot(): string | null {
  const configured = process.env.COURSE_VIDEOS_DIR?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") return null;
  return existsSync(DEV_FALLBACK) ? DEV_FALLBACK : null;
}

type CacheEntry = { at: number; courses: LoadedCourse[] };
let cache: CacheEntry | null = null;
const CACHE_MS = 15_000;

export function clearCourseLibraryCache(): void {
  cache = null;
}

async function listVideoNames(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isFile() && isVideoFileName(entry.name))
    .map((entry) => entry.name);
}

async function pathInsideRoot(root: string, candidate: string): Promise<string | null> {
  try {
    const [realRoot, realCandidate] = await Promise.all([
      realpath(root),
      realpath(candidate),
    ]);
    if (
      realCandidate !== realRoot &&
      !realCandidate.startsWith(realRoot + path.sep)
    ) {
      return null;
    }
    return realCandidate;
  } catch {
    return null;
  }
}

async function lessonsFromFiles(
  root: string,
  directory: string,
  fileNames: string[],
): Promise<LoadedLesson[]> {
  const records = buildLessons(fileNames, LESSON_COPY);
  const lessons = await Promise.all(
    records.map(async (record) => {
      if (!isSafeMediaFileName(record.fileName)) return null;
      const joined = resolveInsideRoot(directory, record.fileName);
      if (!joined) return null;
      const absolutePath = await pathInsideRoot(root, joined);
      if (!absolutePath) return null;
      let durationSec: number | null = null;
      try {
        durationSec = await readVideoDurationSeconds(absolutePath);
      } catch {
        durationSec = null;
      }
      return { ...record, durationSec, absolutePath };
    }),
  );
  return lessons.filter((lesson): lesson is LoadedLesson => lesson != null);
}

async function loadDefinedCourse(
  root: string | null,
  course: CourseDefinition,
): Promise<LoadedCourse> {
  if (!root) {
    return { ...course, lessons: [] };
  }
  const directory = course.directory
    ? resolveInsideRoot(root, course.directory)
    : path.resolve(root);
  if (!directory) {
    return { ...course, lessons: [] };
  }
  const names = await listVideoNames(directory);
  const lessons = await lessonsFromFiles(root, directory, names);
  return { ...course, lessons };
}

async function discoverExtraCourses(
  root: string,
  defined: CourseDefinition[],
  takenSlugs: Set<string>,
): Promise<LoadedCourse[]> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }

  const usedDirectories = new Set(
    defined.map((course) => course.directory).filter((directory) => directory.length > 0),
  );

  const extras: LoadedCourse[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    if (usedDirectories.has(entry.name)) continue;
    const directory = resolveInsideRoot(root, entry.name);
    if (!directory) continue;
    const names = await listVideoNames(directory);
    if (names.length === 0) continue;
    const slug = uniqueSlug(slugifyCourseName(entry.name), takenSlugs);
    const lessons = await lessonsFromFiles(root, directory, names);
    if (lessons.length === 0) continue;
    extras.push({
      slug,
      title: entry.name,
      summary: `Lessons from the ${entry.name} folder.`,
      tier: "course",
      languageLabel: entry.name,
      lessons,
    });
  }
  return extras;
}

export async function loadCourseLibrary(): Promise<LoadedCourse[]> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) return cache.courses;

  const root = courseVideosRoot();
  const defined = await Promise.all(
    COURSES.map((course) => loadDefinedCourse(root, course)),
  );
  const taken = new Set(defined.map((course) => course.slug));
  const extras = root ? await discoverExtraCourses(root, COURSES, taken) : [];
  const courses = [...defined, ...extras];
  cache = { at: now, courses };
  return courses;
}

export async function loadCourse(slug: string): Promise<LoadedCourse | null> {
  const courses = await loadCourseLibrary();
  return courses.find((course) => course.slug === slug) ?? null;
}

export async function findLesson(
  courseSlug: string,
  lessonId: string,
): Promise<{ course: LoadedCourse; lesson: LoadedLesson } | null> {
  const course = await loadCourse(courseSlug);
  if (!course) return null;
  const lesson = course.lessons.find((item) => item.id === lessonId) ?? null;
  if (!lesson) return null;
  return { course, lesson };
}
