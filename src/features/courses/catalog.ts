// Course library.
//
// A course is a folder of videos plus a short entry in COURSES. Dropping
// another video into that folder adds a lesson. A new subfolder of
// COURSE_VIDEOS_DIR becomes its own course, so the library can grow
// without a schema change. Copy for a lesson is optional and matched by
// the file name.

import path from "node:path";
import type { LessonGroup } from "./format";

export { formatClock, formatDuration, remainingAtRate, PLAYBACK_RATES, SAY_HI_BODY, LESSON_GROUPS } from "./format";
export type { LessonGroup } from "./format";

export const COURSE_VIDEO_EXTENSIONS = [".mp4", ".m4v", ".webm", ".mov"] as const;

export type CourseTier = "free" | "course";

export type CourseDefinition = {
  slug: string;
  title: string;
  summary: string;
  // Subfolder of COURSE_VIDEOS_DIR. An empty string means the videos sit
  // directly in COURSE_VIDEOS_DIR (one course, one folder).
  directory: string;
  tier: CourseTier;
  languageLabel: string;
};

export type LessonCopy = {
  title?: string;
  description: string;
};

// The English folder on the desktop is this course. More courses are more
// entries here, each with its own directory, or a new subfolder which the
// library picks up on its own.
export const COURSES: CourseDefinition[] = [
  {
    slug: "english",
    title: "CELPIP Course",
    summary:
      "English lessons for Listening, Writing, and Speaking. New videos added to this folder show up as lessons.",
    directory: "",
    tier: "course",
    languageLabel: "English",
  },
];

export const LESSON_COPY: Record<string, LessonCopy> = {
  "1. CELPIP Listening Task 1, 2 & 3.mp4": {
    description:
      "How Listening Tasks 1, 2, and 3 are built, what the questions are asking, and how to take notes while the audio is still playing.",
  },
  "6. CELPIP Writing Task 2.mp4": {
    description:
      "How to plan Writing Task 2, choose the right tone, and finish a complete response in the time you get.",
  },
  "7. CELPIP Speaking Task 1 & 2.mp4": {
    description:
      "How Speaking Tasks 1 and 2 are scored, how to use the prep time, and a pattern for an answer that stays clear to the end.",
  },
};

export type LessonRecord = {
  id: string;
  fileName: string;
  title: string;
  description: string;
  group: LessonGroup;
};

const FALLBACK_DESCRIPTION =
  "Watch this lesson, then mark it complete before you move on.";

export function isVideoFileName(fileName: string): boolean {
  if (!isSafeMediaFileName(fileName)) return false;
  const extension = path.extname(fileName).toLowerCase();
  return (COURSE_VIDEO_EXTENSIONS as readonly string[]).includes(extension);
}

export function isSafeMediaFileName(fileName: string): boolean {
  if (!fileName || fileName.length > 180) return false;
  if (fileName.startsWith(".")) return false;
  if (fileName.includes("/") || fileName.includes("\\") || fileName.includes("\0")) {
    return false;
  }
  if (fileName === "." || fileName === "..") return false;
  return true;
}

export function isStorageKey(value: string): boolean {
  return /^[a-z0-9-]{1,80}$/.test(value);
}

export function slugifyCourseName(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "course";
}

export function lessonIdFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  return slugifyCourseName(base);
}

export function titleFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/i, "");
  const stripped = base.replace(/^\d+\s*[.)-]\s*/, "").trim();
  return stripped || base;
}

export function leadingNumber(fileName: string): number | null {
  const match = /^(\d+)/.exec(fileName.trim());
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

export function lessonGroup(title: string): LessonGroup {
  const value = title.toLowerCase();
  if (value.includes("listening")) return "Listening";
  if (value.includes("reading")) return "Reading";
  if (value.includes("writing")) return "Writing";
  if (value.includes("speaking")) return "Speaking";
  return "Lessons";
}

export function compareLessonFileNames(a: string, b: string): number {
  const aNumber = leadingNumber(a);
  const bNumber = leadingNumber(b);
  if (aNumber != null && bNumber != null && aNumber !== bNumber) {
    return aNumber - bNumber;
  }
  if (aNumber != null && bNumber == null) return -1;
  if (aNumber == null && bNumber != null) return 1;
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

export function buildLessons(
  fileNames: string[],
  copy: Record<string, LessonCopy> = LESSON_COPY,
): LessonRecord[] {
  const sorted = fileNames.filter(isVideoFileName).sort(compareLessonFileNames);
  const used = new Set<string>();

  return sorted.map((fileName) => {
    const baseId = lessonIdFromFileName(fileName);
    let id = baseId;
    let suffix = 2;
    while (used.has(id)) {
      id = `${baseId}-${suffix}`.slice(0, 80);
      suffix += 1;
    }
    used.add(id);

    const extra = copy[fileName];
    const title = extra?.title?.trim() || titleFromFileName(fileName);
    return {
      id,
      fileName,
      title,
      description: extra?.description?.trim() || FALLBACK_DESCRIPTION,
      group: lessonGroup(title),
    };
  });
}

export function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base;
  let suffix = 2;
  while (taken.has(slug)) {
    slug = `${base}-${suffix}`.slice(0, 80);
    suffix += 1;
  }
  taken.add(slug);
  return slug;
}

// Rejects paths that would leave the library root, including "..".
export function resolveInsideRoot(root: string, ...parts: string[]): string | null {
  if (!root.trim()) return null;
  for (const part of parts) {
    if (part.includes("\0")) return null;
  }
  const resolvedRoot = path.resolve(root);
  const target = path.resolve(resolvedRoot, ...parts);
  if (target !== resolvedRoot && !target.startsWith(resolvedRoot + path.sep)) {
    return null;
  }
  return target;
}

export function contentTypeForFileName(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".webm") return "video/webm";
  if (extension === ".mov") return "video/quicktime";
  return "video/mp4";
}

export function authorLabelFromEmail(email: string | null | undefined): string {
  const local = email?.split("@")[0]?.trim() ?? "";
  const cleaned = local.replace(/[._+-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "Learner";
  return cleaned.slice(0, 40);
}

export function parseCommentBody(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const body = input.replace(/\s+/g, " ").trim();
  if (body.length < 1 || body.length > 500) return null;
  return body;
}

export function clampPosition(input: unknown): number | null {
  if (typeof input !== "number" || !Number.isFinite(input)) return null;
  if (input < 0) return 0;
  return Math.min(input, 12 * 60 * 60);
}
