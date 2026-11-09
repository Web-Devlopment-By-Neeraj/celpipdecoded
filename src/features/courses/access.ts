// Playback decision for one lesson. Full length for a free lesson or a
// learner who has the course. Everyone else gets the preview window.

import { authorizePlayback, DEFAULT_LANGUAGES, type PlaybackGrant } from "@/features/platform/video";
import type { CourseTier } from "./catalog";

export function lessonPlayback(input: {
  hasCourse: boolean;
  tier: CourseTier;
  available: boolean;
  previewSeconds: number;
  now?: Date;
}): PlaybackGrant {
  const english = DEFAULT_LANGUAGES.find((language) => language.code === "en");
  return authorizePlayback({
    hasCourse: input.hasCourse,
    isFreeLesson: input.tier === "free",
    language: english,
    video: input.available
      ? {
          lessonId: "lesson",
          lang: "en",
          videoId: "file",
          durationSec: 1,
          published: true,
        }
      : undefined,
    previewSeconds: input.previewSeconds,
    ttlMinutes: 10,
    now: input.now ?? new Date(),
  });
}
