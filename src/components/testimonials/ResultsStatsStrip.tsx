import { cx } from "@/features/design/design-tokens";
import {
  SKILL_LABELS,
  type ResultsStats,
} from "@/features/testimonials/testimonials";

// The numbers under the results headline. Every figure is computed from
// the cards on the page (resultsStats), never typed in.

export function ResultsStatsStrip({
  stats,
  className,
}: {
  stats: ResultsStats;
  className?: string;
}) {
  const items = [
    { value: String(stats.shown), label: "results shared on this page" },
    { value: String(stats.clb9AllFour), label: "with CLB 9+ in all four skills" },
    { value: String(stats.perfectTwelve), label: "with a perfect 12 in a skill" },
    stats.biggest
      ? {
          value: `+${stats.biggest.to - stats.biggest.from}`,
          label: `biggest jump: ${SKILL_LABELS[stats.biggest.skill]} ${stats.biggest.from} → ${stats.biggest.to}`,
        }
      : null,
  ].filter((item) => item !== null);

  return (
    <dl
      className={cx(
        "grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-ink/10 shadow-sm ring-1 ring-ink/10 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex flex-col-reverse gap-1 bg-white px-4 py-5 sm:px-6">
          <dt className="text-xs leading-5 text-ink/65 sm:text-sm">{item.label}</dt>
          <dd className="text-3xl font-extrabold tracking-tight text-ink tabular-nums sm:text-4xl">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
