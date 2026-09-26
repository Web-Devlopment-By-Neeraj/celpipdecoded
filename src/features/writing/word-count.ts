// Pure word count helpers for the timed writing editor. Kept free of
// React so they can be shared by the client editor and the API route.

// Default CELPIP writing word target, used when a task has no stored
// word_min or word_max.
export const DEFAULT_WORD_MIN = 150;
export const DEFAULT_WORD_MAX = 200;

// Minimum words required before a response can be submitted. The word
// target itself is guidance only and never blocks submission.
export const MIN_SUBMIT_WORD_COUNT = 20;

// Counts words by trimming the text and splitting on whitespace.
// Empty and whitespace-only strings count as zero words.
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

export type WordTargetStatus = "below" | "within" | "above";

// Guidance status against the word target. Missing bounds fall back to
// the default CELPIP target range.
export function getWordTargetStatus(
  wordCount: number,
  wordMin: number | null,
  wordMax: number | null,
): WordTargetStatus {
  const min = wordMin ?? DEFAULT_WORD_MIN;
  const max = wordMax ?? DEFAULT_WORD_MAX;

  if (wordCount < min) {
    return "below";
  }
  if (wordCount > max) {
    return "above";
  }
  return "within";
}
