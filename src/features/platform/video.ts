// Course video playback. A paid lesson without an entitlement gets a
// preview token only. Switching language keeps the playhead.

export type LanguageStatus = "live" | "coming_soon";

export type CourseLanguage = {
  code: string;
  name: string;
  nativeName: string;
  status: LanguageStatus;
  ordinal: number;
};

export const DEFAULT_LANGUAGES: CourseLanguage[] = [
  { code: "en", name: "English", nativeName: "English", status: "live", ordinal: 1 },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", status: "live", ordinal: 2 },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", status: "coming_soon", ordinal: 3 },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", status: "coming_soon", ordinal: 4 },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", status: "coming_soon", ordinal: 5 },
];

export type LessonVideo = {
  lessonId: string;
  lang: string;
  videoId: string;
  durationSec: number;
  published: boolean;
};

export type PlaybackGrant =
  | { ok: true; mode: "full" | "preview"; maxSeconds: number | null; expiresAt: Date }
  | { ok: false; reason: "coming_soon" | "missing" | "forbidden" };

export function authorizePlayback(input: {
  hasCourse: boolean;
  isFreeLesson: boolean;
  language: CourseLanguage | undefined;
  video: LessonVideo | undefined;
  previewSeconds: number;
  ttlMinutes: number;
  now: Date;
}): PlaybackGrant {
  if (!input.language || input.language.status !== "live") {
    return { ok: false, reason: "coming_soon" };
  }
  if (!input.video || !input.video.published) return { ok: false, reason: "missing" };
  const expiresAt = new Date(input.now.getTime() + input.ttlMinutes * 60 * 1000);
  if (input.hasCourse || input.isFreeLesson) {
    return { ok: true, mode: "full", maxSeconds: null, expiresAt };
  }
  return {
    ok: true,
    mode: "preview",
    maxSeconds: input.previewSeconds,
    expiresAt,
  };
}

export function playbackTokenExpired(expiresAt: Date, now: Date): boolean {
  return now.getTime() > expiresAt.getTime();
}

export function seekAfterLanguageSwitch(positionSeconds: number, nextDuration: number): number {
  return Math.min(Math.max(0, positionSeconds), nextDuration);
}

export function lessonCompleted(secondsWatched: number, durationSec: number, threshold: number): boolean {
  if (durationSec <= 0) return false;
  return secondsWatched / durationSec >= threshold;
}

export function missingLanguageMessage(nativeName: string): string {
  return `This lesson is not available in ${nativeName} yet.`;
}
