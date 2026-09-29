export type Lesson = {
  id: string;
  module: "Listening" | "Reading" | "Writing" | "Speaking";
  ordinal: number;
  isFree: boolean;
  titles: Record<string, string>;
  durationSec: number;
  languages: string[];
};

export type LanguageRow = {
  code: string;
  name: string;
  nativeName: string;
  status: "live" | "coming_soon";
  showInSwitch: boolean;
  ordinal: number;
};

export const LANGUAGES: LanguageRow[] = [
  { code: "en", name: "English", nativeName: "English", status: "live", showInSwitch: true, ordinal: 1 },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", status: "live", showInSwitch: true, ordinal: 2 },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", status: "coming_soon", showInSwitch: true, ordinal: 3 },
  { code: "ta", name: "Tamil", nativeName: "Tamil", status: "coming_soon", showInSwitch: false, ordinal: 4 },
  { code: "gu", name: "Gujarati", nativeName: "Gujarati", status: "coming_soon", showInSwitch: false, ordinal: 5 },
];

export function switchLanguages(rows: LanguageRow[]): LanguageRow[] {
  return rows.filter((row) => row.showInSwitch).sort((a, b) => a.ordinal - b.ordinal);
}

export function followLine(rows: LanguageRow[]): string {
  const names = rows
    .filter((row) => row.status === "coming_soon" && !row.showInSwitch)
    .map((row) => row.name);
  if (names.length === 0) return "";
  if (names.length === 1) return `${names[0]} follows`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]} follow`;
}

export const COURSE_HEADING = "Learn CELPIP in English or हिंदी";
export const COURSE_SUBHEAD =
  "Learn CELPIP in English or Hindi – with simple, step-by-step explanations that make the test easier to understand. Punjabi is coming soon.";

export function courseLessons(): Lesson[] {
  const modules = ["Listening", "Reading", "Writing", "Speaking"] as const;
  return modules.flatMap((module) =>
    [1, 2, 3].map((ordinal) => ({
      id: `${module.toLowerCase()}-${ordinal}`,
      module,
      ordinal,
      isFree: ordinal === 1,
      titles: {
        en: `${module} section ${ordinal}`,
        hi: `${module} अनुभाग ${ordinal}`,
      },
      durationSec: 480,
      languages: ordinal === 3 && module === "Writing" ? ["en"] : ["en", "hi"],
    })),
  );
}

export function lessonTitle(lesson: Lesson, lang: string): string {
  return lesson.titles[lang] ?? lesson.titles.en;
}

export function lessonAvailable(lesson: Lesson, lang: string): boolean {
  return lesson.languages.includes(lang);
}

export function previewStopsAt(entitled: boolean, isFree: boolean, signedIn: boolean): boolean {
  if (!signedIn) return true;
  if (isFree) return false;
  return !entitled;
}

export function completedLesson(secondsWatched: number, durationSec: number, threshold: number): boolean {
  return durationSec > 0 && secondsWatched / durationSec >= threshold;
}

export const SKILL_TAGS = [
  "writing:content",
  "writing:vocabulary",
  "writing:readability",
  "writing:task",
  "speaking:content",
  "speaking:vocabulary",
  "speaking:listenability",
  "speaking:task",
  "listening:main-idea",
  "listening:detail",
  "listening:inference",
  "reading:main-idea",
  "reading:detail",
  "reading:inference",
] as const;

export type MiniCourse = {
  id: string;
  skillTag: string;
  lang: string;
  title: string;
  isFree: boolean;
  published: boolean;
};

export function miniCourseLibrary(liveLanguages: string[]): MiniCourse[] {
  return SKILL_TAGS.flatMap((tag) =>
    liveLanguages.map((lang) => ({
      id: `${tag}-${lang}`,
      skillTag: tag,
      lang,
      title: tag.replace(":", " · "),
      isFree: tag.endsWith("content"),
      published: true,
    })),
  );
}

export function coverageGaps(courses: MiniCourse[], tags: readonly string[], languages: string[]): string[] {
  const gaps: string[] = [];
  for (const tag of tags) {
    for (const lang of languages) {
      const found = courses.some((course) => course.skillTag === tag && course.lang === lang && course.published);
      if (!found) gaps.push(`${tag}/${lang}`);
    }
  }
  return gaps;
}
