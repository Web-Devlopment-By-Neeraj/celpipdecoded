import Link from "next/link";
import {
  formatAttemptDate,
  getAttemptHistoryPath,
  historyCopy,
  type AttemptHistoryItem,
} from "@/features/speaking/attempt-history";
import { formatPracticeLevel } from "@/features/speaking/progress-summary";
import { AttemptStatusBadge } from "./AttemptStatusBadge";

const RECENT_LIMIT = 3;

// Compact list of the latest attempts for the speaking overview, with
// a link to the full attempt history page.
export function RecentAttemptsCard({
  attempts,
}: {
  attempts: AttemptHistoryItem[];
}) {
  const recent = attempts.slice(0, RECENT_LIMIT);

  return (
    <section
      aria-label={historyCopy.recentHeading}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
          {historyCopy.recentHeading}
        </h2>
        <Link
          href="/dashboard/speaking/attempts"
          className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          {historyCopy.viewAllAttempts}
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-ink/70">
          {historyCopy.recentEmptyText}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {recent.map((attempt) => (
            <li
              key={attempt.id}
              className="rounded-2xl bg-cream/60 p-4 ring-1 ring-ink/5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">
                  {attempt.taskTitle}
                </p>
                <AttemptStatusBadge status={attempt.status} />
              </div>
              <p className="mt-1 text-xs text-ink/60">
                {formatAttemptDate(attempt.createdAt)}
                {attempt.estimatedLevel !== null &&
                  ` - Level ${formatPracticeLevel(attempt.estimatedLevel)}`}
              </p>
              <Link
                href={getAttemptHistoryPath(attempt.id)}
                className="mt-2 inline-flex text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
              >
                {historyCopy.viewFeedback}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
