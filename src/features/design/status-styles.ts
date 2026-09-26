// One place for status colours across the signed in app.
//
// Before this file, speaking and writing each carried their own copy of
// the same pill classes. Feature modules keep their own tone vocabulary
// (ready, working, failed, neutral) because that wording matches the
// stored attempt statuses. This file maps those tones onto the shared
// design tones so the colours only exist once.

import type { StatusTone as SpeakingStatusTone } from "@/features/speaking/attempt-history";
import type { WritingStatusTone } from "@/features/writing/writing-status-labels";

// The shared design tones. Progress is a distinct tone from info so an
// in flight state does not read as a static note.
export type StatusToneName =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "progress";

export type StatusToneStyle = {
  // Pill background plus text, used by AppStatusBadge.
  badge: string;
  // Text only, for inline status wording inside a card.
  text: string;
  // Soft surface, for callout blocks that carry a status.
  surface: string;
  // Small dot, for list rows that show status without a pill.
  dot: string;
};

export const STATUS_TONE_STYLES: Record<StatusToneName, StatusToneStyle> = {
  success: {
    badge: "bg-emerald-100 text-emerald-800",
    text: "text-emerald-700",
    surface: "bg-emerald-50 ring-1 ring-emerald-200",
    dot: "bg-emerald-600",
  },
  warning: {
    badge: "bg-amber-100 text-amber-900",
    text: "text-amber-800",
    surface: "bg-amber-50 ring-1 ring-amber-200",
    dot: "bg-amber-500",
  },
  error: {
    badge: "bg-academy-red-soft text-academy-red",
    text: "text-academy-red",
    surface: "bg-academy-red-soft ring-1 ring-academy-red/20",
    dot: "bg-academy-red",
  },
  info: {
    badge: "bg-academy-blue-soft text-academy-blue",
    text: "text-academy-blue",
    surface: "bg-academy-blue-soft ring-1 ring-academy-blue/20",
    dot: "bg-academy-blue",
  },
  neutral: {
    badge: "bg-academy-navy/5 text-academy-navy/70",
    text: "text-academy-navy/60",
    surface: "bg-academy-navy-soft/60 ring-1 ring-academy-navy/10",
    dot: "bg-academy-navy/40",
  },
  progress: {
    badge: "bg-academy-navy-soft text-academy-navy",
    text: "text-academy-navy/80",
    surface: "bg-academy-navy-soft ring-1 ring-academy-navy/10",
    dot: "bg-academy-navy",
  },
};

export function getStatusToneStyle(tone: StatusToneName): StatusToneStyle {
  return STATUS_TONE_STYLES[tone];
}

// Maps the speaking attempt tone onto a shared design tone. Ready means
// a feedback report is available, so it reads as success.
export function toneFromSpeakingStatus(
  tone: SpeakingStatusTone,
): StatusToneName {
  switch (tone) {
    case "ready":
      return "success";
    case "working":
      return "progress";
    case "failed":
      return "error";
    default:
      return "neutral";
  }
}

// Same mapping for writing attempt tones.
export function toneFromWritingStatus(tone: WritingStatusTone): StatusToneName {
  switch (tone) {
    case "ready":
      return "success";
    case "working":
      return "progress";
    case "failed":
      return "error";
    default:
      return "neutral";
  }
}

// Module availability on the dashboard: an active module reads as
// success, anything else is a neutral coming soon state.
export function toneFromModuleStatus(
  status: string,
  hasRoute: boolean,
): StatusToneName {
  return status === "active" && hasRoute ? "success" : "neutral";
}
