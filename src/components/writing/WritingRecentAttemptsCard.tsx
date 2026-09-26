import Link from "next/link";
import {
  formatWritingAttemptDate,
  writingHistoryCopy,
  type WritingAttemptHistoryItem,
} from "@/features/writing/writing-attempt-history";
import { formatWritingPracticeLevel } from "@/features/writing/writing-progress-summary";
import { WritingAttemptActions } from "./WritingAttemptActions";
import { WritingAttemptStatusBadge } from "./WritingAttemptStatusBadge";

const RECENT_LIMIT = 4;

// Compact list of the latest writing attempts for the writing overview,
// with a link to the full history page. Attempts arrive newest first.
export function WritingRecentAttemptsCard({
  attempts,
}: {
  attempts: WritingAttemptHistoryItem[];
}) {
  const recent = attempts.slice(0, RECENT_LIMIT);

  return (
    <section
      aria-label={writingHistoryCopy.recentHeading}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
          {writingHistoryCopy.recentHeading}
        </h2>
        {attempts.length > 0 && (
          <Link
            href="/dashboard/writing/attempts"
            className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
          >
            {writingHistoryCopy.viewAllAttempts}
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-ink/70">
          {writingHistoryCopy.recentEmptyText}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {recent.map((attempt) => (
            <li
              key={attempt.id}
              className="rounded-2xl bg-cream-soft p-4 ring-1 ring-ink/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-semibold text-ink">
                  {attempt.taskTitle}
                </p>
                <WritingAttemptStatusBadge status={attempt.status} />
              </div>
              <p className="mt-1 text-xs text-ink/60">
                {attempt.taskTypeLabel} -{" "}
                {formatWritingAttemptDate(attempt.createdAt)}
                {attempt.estimatedLevel !== null &&
                  ` - ${writingHistoryCopy.levelColumnShort} ${formatWritingPracticeLevel(
                    attempt.estimatedLevel,
                  )}`}
              </p>
              <div className="mt-3">
                <WritingAttemptActions
                  attemptId={attempt.id}
                  status={attempt.status}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
