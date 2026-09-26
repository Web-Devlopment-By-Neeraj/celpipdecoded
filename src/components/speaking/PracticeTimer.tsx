import { formatClock } from "@/features/speaking/timer-utils";

// Large countdown display for the practice screen. Sized for mobile
// first, since many students open practice links on their phone.
export function PracticeTimer({
  label,
  seconds,
  totalSeconds,
  running,
}: {
  label: string;
  seconds: number;
  totalSeconds: number;
  running: boolean;
}) {
  const progress =
    totalSeconds > 0 ? Math.min(1, Math.max(0, seconds / totalSeconds)) : 0;

  return (
    <section
      role="timer"
      aria-label={`${label}: ${formatClock(seconds)} remaining`}
      className="rounded-3xl bg-ink p-6 text-center text-white sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        {label}
      </p>
      <p className="mt-2 font-serif text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl">
        {formatClock(seconds)}
      </p>
      <div
        aria-hidden
        className="mx-auto mt-5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/15"
      >
        <div
          className={`h-full rounded-full bg-brand transition-[width] duration-300 ease-linear ${
            running ? "" : "opacity-60"
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </section>
  );
}
