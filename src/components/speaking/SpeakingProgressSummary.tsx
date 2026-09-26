import { formatAttemptDate } from "@/features/speaking/attempt-history";
import {
  formatPracticeLevel,
  progressCopy,
  type SpeakingProgressSummaryData,
} from "@/features/speaking/progress-summary";

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

// Summary strip with the student's speaking progress: feedback reports,
// best estimated practice level, most recent practice date, and badges
// earned. Two columns on mobile, four from the sm breakpoint.
export function SpeakingProgressSummary({
  summary,
}: {
  summary: SpeakingProgressSummaryData;
}) {
  const stats = [
    {
      label: progressCopy.feedbackReportsLabel,
      value: String(summary.feedbackReports),
    },
    {
      label: progressCopy.bestLevelLabel,
      value:
        summary.bestLevel !== null
          ? formatPracticeLevel(summary.bestLevel)
          : "-",
    },
    {
      label: progressCopy.lastPracticeLabel,
      value: summary.lastPracticeDate
        ? formatAttemptDate(summary.lastPracticeDate)
        : "-",
    },
    {
      label: progressCopy.badgesLabel,
      value: String(summary.badgesEarned),
    },
  ];

  return (
    <section
      aria-label={progressCopy.summaryLabel}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </section>
  );
}
