import { writingCopy } from "@/features/writing/task-copy";
import type { WritingTaskDetails } from "@/features/writing/task-types";
import {
  formatSeconds,
  formatWordTarget,
} from "@/features/writing/task-utils";

// Timing card for the task detail page: time limit and word target.
export function WritingTimingCard({ details }: { details: WritingTaskDetails }) {
  return (
    <section
      aria-label={writingCopy.timingCardTitle}
      className="rounded-3xl bg-cream-soft p-6 ring-1 ring-ink/5"
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">
        {writingCopy.timingCardTitle}
      </h2>

      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/5">
          <dt className="text-xs font-semibold text-ink/60">
            {writingCopy.timeLimitLabel}
          </dt>
          <dd className="mt-1 font-serif text-lg font-semibold text-ink">
            {formatSeconds(details.time_seconds)}
          </dd>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/5">
          <dt className="text-xs font-semibold text-ink/60">
            {writingCopy.wordTargetLabel}
          </dt>
          <dd className="mt-1 font-serif text-lg font-semibold text-ink">
            {formatWordTarget(details)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
