import { writingPracticeCopy } from "@/features/writing/task-copy";
import {
  formatSeconds,
  formatWordRange,
} from "@/features/writing/task-utils";

// Intro card shown before the timed session starts. Summarizes the
// time limit, word target, and evaluation focus, and holds the Start
// writing button. The timer does not run until the student clicks it.
export function WritingStartCard({
  timeSeconds,
  wordMin,
  wordMax,
  evaluationFocus,
  onStart,
}: {
  timeSeconds: number;
  wordMin: number | null;
  wordMax: number | null;
  evaluationFocus: string[];
  onStart: () => void;
}) {
  return (
    <section
      aria-label={writingPracticeCopy.startCardTitle}
      className="rounded-3xl bg-cream-soft p-6 ring-1 ring-ink/5"
    >
      <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
        {writingPracticeCopy.startCardTitle}
      </h2>

      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/5">
          <dt className="text-xs font-semibold text-ink/60">
            {writingPracticeCopy.timeLimitLabel}
          </dt>
          <dd className="mt-1 font-serif text-lg font-semibold text-ink">
            {formatSeconds(timeSeconds)}
          </dd>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/5">
          <dt className="text-xs font-semibold text-ink/60">
            {writingPracticeCopy.wordTargetLabel}
          </dt>
          <dd className="mt-1 font-serif text-lg font-semibold text-ink">
            {formatWordRange(wordMin, wordMax)}
          </dd>
        </div>
      </dl>

      {evaluationFocus.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
            {writingPracticeCopy.evaluationFocusTitle}
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {evaluationFocus.map((area) => (
              <li
                key={area}
                className="rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand"
              >
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-8 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark sm:w-auto"
        >
          {writingPracticeCopy.startWriting}
        </button>
        <p className="mt-3 text-xs leading-5 text-ink/50">
          {writingPracticeCopy.startCardNote}
        </p>
      </div>
    </section>
  );
}
