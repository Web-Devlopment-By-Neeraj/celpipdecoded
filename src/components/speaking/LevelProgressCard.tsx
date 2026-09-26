import { getBadgeForLevel } from "@/features/speaking/level-badges";
import {
  PRACTICE_LEVEL_MAX,
  progressCopy,
} from "@/features/speaking/progress-summary";

// Level progress for the speaking overview: best estimated practice
// level on the 1 to 12 scale, a progress bar, and the badge tier that
// level maps to. Shows a gentle empty state before the first report.
export function LevelProgressCard({ bestLevel }: { bestLevel: number | null }) {
  const rounded = bestLevel !== null ? Math.round(bestLevel) : null;
  const percent =
    rounded !== null
      ? Math.min(100, Math.max(0, (rounded / PRACTICE_LEVEL_MAX) * 100))
      : 0;
  const badge = rounded !== null ? getBadgeForLevel(rounded) : null;

  return (
    <section
      aria-label={progressCopy.levelCardHeading}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
        {progressCopy.levelCardHeading}
      </h2>

      {rounded === null ? (
        <p className="mt-3 text-sm leading-6 text-ink/70">
          {progressCopy.levelCardEmptyText}
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            {progressCopy.levelCardSubtext}
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-4xl font-semibold leading-none text-brand">
              {rounded}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              {progressCopy.levelScaleNote}
            </span>
          </div>

          <div
            role="progressbar"
            aria-label={progressCopy.bestLevelLabel}
            aria-valuemin={0}
            aria-valuemax={PRACTICE_LEVEL_MAX}
            aria-valuenow={rounded}
            className="mt-4 h-2 w-full rounded-full bg-ink/10"
          >
            <div
              className="h-2 rounded-full bg-brand"
              style={{ width: `${percent}%` }}
            />
          </div>

          {badge && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
                {progressCopy.currentBadgeLabel}
              </p>
              <p className="mt-2 inline-flex items-center rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                {badge.label}
              </p>
            </div>
          )}
        </>
      )}

      <p className="mt-4 text-xs leading-5 text-ink/50">
        {progressCopy.practiceEstimateNote}
      </p>
    </section>
  );
}
