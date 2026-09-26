import { writingPracticeCopy } from "@/features/writing/task-copy";
import { formatClock } from "@/features/writing/writing-timer";

// Large countdown display for the timed writing screen. Sized for
// mobile first, since many students practice on their phone. When the
// timer has expired the display switches to a warning tone but the
// student can keep working: nothing is auto-submitted.
export function WritingTimer({
  seconds,
  totalSeconds,
  running,
  expired,
}: {
  seconds: number;
  totalSeconds: number;
  running: boolean;
  expired: boolean;
}) {
  const progress =
    totalSeconds > 0 ? Math.min(1, Math.max(0, seconds / totalSeconds)) : 0;

  return (
    <section
      role="timer"
      aria-label={`${writingPracticeCopy.timerLabel}: ${formatClock(seconds)} remaining`}
      className="rounded-3xl bg-ink p-5 text-center text-white sm:p-6"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        {writingPracticeCopy.timerLabel}
      </p>
      <p
        className={`mt-2 font-serif text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl ${
          expired ? "text-red-300" : ""
        }`}
      >
        {formatClock(seconds)}
      </p>
      <div
        aria-hidden
        className="mx-auto mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/15"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-linear ${
            expired ? "bg-red-400" : "bg-brand"
          } ${running ? "" : "opacity-60"}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </section>
  );
}
