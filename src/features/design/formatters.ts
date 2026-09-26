// Shared display formatters for the signed in app.
//
// Speaking and writing already have their own feature level formatters
// that are tied to their data shapes. This file holds the generic ones
// the design system components need, so a new card does not invent its
// own date or percent formatting.
//
// All output is en-US and student facing. Nothing here reads from the
// database or from a request.

const NO_VALUE = "Not available yet";

// Friendly date, for example "Jan 5, 2026". Returns an empty string for
// an unparseable value so a caller can hide the field.
export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Date with time, for example "Jan 5, 2026, 2:30 PM".
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

// Clamps a value into a 0 to 100 percentage of max. Used by progress
// bars and metric cards so the fill can never overflow its track.
export function toPercent(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, (value / max) * 100));
}

// Whole number percentage string, for example "58%".
export function formatPercent(value: number, max: number): string {
  return `${Math.round(toPercent(value, max))}%`;
}

// Practice level against the scale, for example "7 of 12".
export function formatLevelOutOf(
  level: number | null | undefined,
  max: number,
): string {
  if (level === null || level === undefined || !Number.isFinite(level)) {
    return NO_VALUE;
  }
  return `${Math.round(level)} of ${max}`;
}

// Compact duration, for example "26m 05s".
export function formatDurationShort(
  totalSeconds: number | null | undefined,
): string {
  if (
    totalSeconds === null ||
    totalSeconds === undefined ||
    !Number.isFinite(totalSeconds)
  ) {
    return NO_VALUE;
  }
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

// Counted noun, for example "1 report" or "3 reports". Pass a plural
// when adding an s is wrong.
export function formatCount(
  count: number,
  singular: string,
  plural?: string,
): string {
  const safeCount = Number.isFinite(count) ? Math.round(count) : 0;
  const word = safeCount === 1 ? singular : (plural ?? `${singular}s`);
  return `${safeCount} ${word}`;
}

// Turns a stored slug into a readable label, for example
// "celpip-speaking" becomes "Celpip speaking". Feature specific labels
// should still come from their own copy files, this is a safe fallback.
export function formatSlugLabel(slug: string | null | undefined): string {
  if (!slug) return "";
  const words = slug.split(/[-_]/).join(" ").trim();
  if (!words) return "";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// Placeholder used where a metric has no value yet.
export const NO_VALUE_TEXT = NO_VALUE;
