import { formatWritingAttemptDate } from "@/features/writing/writing-attempt-history";
import {
  formatWritingPracticeLevel,
  writingProgressCopy,
  type WritingProgressSummaryData,
} from "@/features/writing/writing-progress-summary";

// "full" shows every progress value and is used on the writing
// overview. "strip" shows the four headline values for the history
// page, where the table below already carries the detail.
export type WritingProgressSummaryVariant = "full" | "strip";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
        {label}
      </p>
      <p className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink">
        {value}
      </p>
    </div>
  );
}

// Summary strip with the student's writing progress. Two columns on
// mobile and three from the sm breakpoint, so the tiles stack cleanly.
export function WritingProgressSummary({
  summary,
  variant = "full",
}: {
  summary: WritingProgressSummaryData;
  variant?: WritingProgressSummaryVariant;
}) {
  const noValue = "-";

  const stats = [
    {
      label: writingProgressCopy.totalAttemptsLabel,
      value: String(summary.totalAttempts),
    },
    {
      label: writingProgressCopy.feedbackReportsLabel,
      value: String(summary.feedbackReports),
    },
    {
      label: writingProgressCopy.bestLevelLabel,
      value:
        summary.bestLevel !== null
          ? formatWritingPracticeLevel(summary.bestLevel)
          : noValue,
    },
    ...(variant === "full"
      ? [
          {
            label: writingProgressCopy.averageLevelLabel,
            value:
              summary.averageLevel !== null
                ? formatWritingPracticeLevel(summary.averageLevel)
                : noValue,
          },
          {
            label: writingProgressCopy.lastPracticeLabel,
            value: summary.lastPracticeDate
              ? formatWritingAttemptDate(summary.lastPracticeDate)
              : noValue,
          },
        ]
      : []),
    {
      label: writingProgressCopy.badgesLabel,
      value: String(summary.badgesEarned),
    },
  ];

  return (
    <section
      aria-label={writingProgressCopy.summaryLabel}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatTile key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <p className="mt-6 text-xs leading-5 text-ink/50">
        {writingProgressCopy.practiceEstimateNote}
      </p>
    </section>
  );
}
