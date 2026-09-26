import { speakingCopy } from "@/features/speaking/task-copy";
import type { SpeakingTaskDetails } from "@/features/speaking/task-types";
import { formatSeconds } from "@/features/speaking/task-utils";

// Timing card for the task detail page: preparation and speaking time.
export function TaskTimingCard({ details }: { details: SpeakingTaskDetails }) {
  return (
    <section
      aria-label={speakingCopy.timingCardTitle}
      className="rounded-3xl bg-cream-soft p-6 ring-1 ring-ink/5"
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">
        {speakingCopy.timingCardTitle}
      </h2>

      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/5">
          <dt className="text-xs font-semibold text-ink/60">
            {speakingCopy.prepTimeLabel}
          </dt>
          <dd className="mt-1 font-serif text-lg font-semibold text-ink">
            {formatSeconds(details.prep_seconds)}
          </dd>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/5">
          <dt className="text-xs font-semibold text-ink/60">
            {speakingCopy.speakingTimeLabel}
          </dt>
          <dd className="mt-1 font-serif text-lg font-semibold text-ink">
            {formatSeconds(details.speaking_seconds)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
