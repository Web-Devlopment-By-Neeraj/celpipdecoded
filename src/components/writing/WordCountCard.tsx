import { writingPracticeCopy } from "@/features/writing/task-copy";
import { formatWordRange } from "@/features/writing/task-utils";
import {
  getWordTargetStatus,
  type WordTargetStatus,
} from "@/features/writing/word-count";

const statusLabels: Record<WordTargetStatus, string> = {
  below: writingPracticeCopy.belowTarget,
  within: writingPracticeCopy.withinTarget,
  above: writingPracticeCopy.aboveTarget,
};

const statusStyles: Record<WordTargetStatus, string> = {
  below: "bg-amber-100 text-amber-800",
  within: "bg-emerald-100 text-emerald-800",
  above: "bg-amber-100 text-amber-800",
};

// Live word count with the word target and a guidance label. The
// target never blocks submission: the labels are guidance only.
export function WordCountCard({
  wordCount,
  wordMin,
  wordMax,
}: {
  wordCount: number;
  wordMin: number | null;
  wordMax: number | null;
}) {
  const status = getWordTargetStatus(wordCount, wordMin, wordMax);

  return (
    <section
      aria-label={`${writingPracticeCopy.wordsLabel}: ${wordCount}`}
      className="rounded-2xl bg-cream-soft p-4 ring-1 ring-ink/5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-sm font-semibold text-ink">
            {writingPracticeCopy.wordsLabel}:{" "}
            <span className="font-serif text-lg tabular-nums">{wordCount}</span>
          </p>
          <p className="text-sm text-ink/60">
            {writingPracticeCopy.targetLabel}:{" "}
            {formatWordRange(wordMin, wordMax)}
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
        >
          {statusLabels[status]}
        </span>
      </div>
    </section>
  );
}
