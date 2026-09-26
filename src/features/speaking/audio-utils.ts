// Pure helpers for browser audio recording. Kept free of React and
// Supabase so they are easy to test and safe to import anywhere.

// Private storage bucket for attempt recordings. Lives here so both
// the browser upload code and server transcription code can share it.
export const ATTEMPT_AUDIO_BUCKET = "attempt-audio";

// UI states for the recording flow, from first render to saved upload.
export const RECORDING_STATES = [
  "idle",
  "requesting_permission",
  "recording",
  "recorded",
  "uploading",
  "uploaded",
  "error",
] as const;

export type RecordingState = (typeof RECORDING_STATES)[number];

// The final recording held in memory until the student submits it.
export type RecordedAudio = {
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
};

// Preferred container formats, best supported first. Chrome, Edge, and
// Firefox record webm with opus. Safari records mp4.
const MIME_TYPE_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
] as const;

// True when this browser can capture microphone audio.
export function isRecordingSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

// First recording mime type this browser supports, or null to let the
// browser pick its own default.
export function pickRecordingMimeType(): string | null {
  if (
    typeof window === "undefined" ||
    typeof window.MediaRecorder === "undefined" ||
    typeof MediaRecorder.isTypeSupported !== "function"
  ) {
    return null;
  }
  return MIME_TYPE_CANDIDATES.find((type) =>
    MediaRecorder.isTypeSupported(type),
  ) ?? null;
}

// Strips codec parameters, for example "audio/webm;codecs=opus"
// becomes "audio/webm". Used for blob types and upload content types.
export function getBaseMimeType(mimeType: string): string {
  const base = mimeType.split(";")[0].trim().toLowerCase();
  return base || "audio/webm";
}

// Safe file extension for a recording mime type. Unknown types fall
// back to webm, which matches the most common recording container.
export function getAudioFileExtension(mimeType: string): string {
  const base = getBaseMimeType(mimeType);
  if (base === "audio/mp4") return "mp4";
  if (base === "audio/aac" || base === "audio/x-m4a") return "m4a";
  if (base === "audio/ogg") return "ogg";
  return "webm";
}

// Storage object path for an attempt recording. The first segment must
// be the owner user id because storage policies key on that folder.
export function buildAttemptAudioPath(
  userId: string,
  attemptId: string,
  mimeType: string,
): string {
  return `${userId}/${attemptId}/answer.${getAudioFileExtension(mimeType)}`;
}

// Whole seconds elapsed since a recording started, never below zero.
export function getElapsedSeconds(startedAtMs: number, nowMs: number): number {
  return Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
}
