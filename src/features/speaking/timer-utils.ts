// Pure helpers for the countdown timer used by the timed practice flow.
// Kept free of React so they are easy to test and reuse.

// Clamps a duration to a safe non-negative whole number of seconds.
export function clampSeconds(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.floor(value);
}

// Formats seconds as a clock string, for example "0:45" or "1:30".
// Always shows minutes so the display never jumps in width mid-countdown.
export function formatClock(totalSeconds: number): string {
  const safe = clampSeconds(totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Absolute end time for a countdown, so the timer stays accurate even
// if interval ticks are delayed on a backgrounded mobile tab.
export function getDeadline(nowMs: number, durationSeconds: number): number {
  return nowMs + clampSeconds(durationSeconds) * 1000;
}

// Whole seconds left until the deadline, never below zero. Uses ceil so
// the display shows "1" until the final second has fully elapsed.
export function getRemainingSeconds(deadlineMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}
