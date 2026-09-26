import { resultCopy } from "@/features/speaking/practice-flow";

// Score summary at the top of the result page: estimated practice
// level, badge label, task title, and the practice-only disclaimer.
export function ResultSummaryCard({
  taskTitle,
  estimatedLevel,
  levelLabel,
  badgeLabel,
  overallSummary,
}: {
  taskTitle: string;
  estimatedLevel: number;
  levelLabel: string | null;
  badgeLabel: string;
  overallSummary: string | null;
}) {
  return (
    <section
      aria-label={resultCopy.levelHeading}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
        {taskTitle}
      </p>

      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full bg-brand/10 ring-1 ring-brand/20">
          <span className="font-serif text-4xl font-semibold leading-none text-brand">
            {Math.round(estimatedLevel)}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-brand/70">
            {resultCopy.levelScale}
          </span>
        </div>

        <div className="text-center sm:text-left">
          <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
            {resultCopy.levelHeading}
          </h2>
          <p className="mt-2 inline-flex items-center rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
            {badgeLabel}
          </p>
          {levelLabel && (
            <p className="mt-2 text-sm leading-6 text-ink/70">{levelLabel}</p>
          )}
        </div>
      </div>

      {overallSummary && (
        <p className="mt-5 text-sm leading-7 text-ink/80">{overallSummary}</p>
      )}

      <p className="mt-4 text-xs leading-5 text-ink/50">
        {resultCopy.practiceEstimateNote}
      </p>
    </section>
  );
}
