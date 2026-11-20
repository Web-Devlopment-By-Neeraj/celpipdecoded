import type { MockRunTimer } from "@/features/mock-tests/mock-run";

// One restored window, consumed the next time that screen's clock opens.
//
// The countdown itself stays in the timer. This map only hands it a
// shorter duration when the student comes back to a saved screen.

const seeds = new Map<string, MockRunTimer>();
const consumed = new Set<string>();
let sample: MockRunTimer | null = null;

function timerMark(timer: MockRunTimer): string {
  return `${timer.screenKey}:${timer.savedAt}`;
}

export function seedExamTimerResume(timer: MockRunTimer): void {
  if (consumed.has(timerMark(timer))) return;
  seeds.set(timer.screenKey, timer);
}

export function takeExamTimerResume(screenKey: string): number | null {
  const seed = seeds.get(screenKey);
  if (!seed) return null;
  seeds.delete(screenKey);
  consumed.add(timerMark(seed));

  const elapsed = Math.max(0, Math.floor((Date.now() - seed.savedAt) / 1000));
  return Math.max(0, seed.remainingSeconds - elapsed);
}

export function noteExamTimer(screenKey: string, remainingSeconds: number): void {
  sample = {
    screenKey,
    remainingSeconds,
    savedAt: Date.now(),
  };
}

export function readExamTimerSample(): MockRunTimer | null {
  return sample;
}
