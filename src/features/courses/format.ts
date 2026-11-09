// Display helpers shared by the server and the course player.
// This file stays free of Node APIs so a client component can import it.

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export const SAY_HI_BODY = "Hi";

export const LESSON_GROUPS = [
  "Listening",
  "Reading",
  "Writing",
  "Speaking",
  "Lessons",
] as const;

export type LessonGroup = (typeof LESSON_GROUPS)[number];

export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const paddedSeconds = String(secs).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`;
  }
  return `${minutes}:${paddedSeconds}`;
}

export function formatDuration(seconds: number | null): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return null;
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes} min`;
  return `${secs} sec`;
}

export function remainingAtRate(duration: number, current: number, rate: number): number {
  const safeRate = rate > 0 ? rate : 1;
  return Math.max(0, (duration - current) / safeRate);
}

export function formatRate(rate: number): string {
  const rounded = Math.round(rate * 100) / 100;
  return `${rounded}x`;
}
