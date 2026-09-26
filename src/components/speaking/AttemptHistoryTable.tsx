import Link from "next/link";
import {
  formatAttemptDate,
  getAttemptHistoryPath,
  historyCopy,
  type AttemptHistoryItem,
} from "@/features/speaking/attempt-history";
import { formatPracticeLevel } from "@/features/speaking/progress-summary";
import { AttemptStatusBadge } from "./AttemptStatusBadge";

function BadgePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
      {label}
    </span>
  );
}

// Full attempt history. Renders stacked cards below the md breakpoint
// and a table from md up, so nothing overflows on mobile.
export function AttemptHistoryTable({
  attempts,
}: {
  attempts: AttemptHistoryItem[];
}) {
  return (
    <section aria-label={historyCopy.pageHeading}>
      {/* Mobile: stacked cards */}
      <ul className="space-y-4 md:hidden">
        {attempts.map((attempt) => (
          <li
            key={attempt.id}
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-semibold text-ink">
                {attempt.taskTitle}
              </p>
              <AttemptStatusBadge status={attempt.status} />
            </div>
            <p className="mt-1 text-xs text-ink/60">
              {attempt.taskTypeLabel} - {formatAttemptDate(attempt.createdAt)}
            </p>
            {attempt.estimatedLevel !== null && (
              <p className="mt-3 text-sm text-ink/80">
                {historyCopy.levelColumn}:{" "}
                <span className="font-semibold text-ink">
                  {formatPracticeLevel(attempt.estimatedLevel)}
                </span>
              </p>
            )}
            {attempt.badgeLabel && (
              <p className="mt-2">
                <BadgePill label={attempt.badgeLabel} />
              </p>
            )}
            <Link
              href={getAttemptHistoryPath(attempt.id)}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
            >
              {historyCopy.viewFeedback}
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-ink/5 md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs font-semibold uppercase tracking-wide text-ink/50">
              <th scope="col" className="px-6 py-4">
                {historyCopy.taskColumn}
              </th>
              <th scope="col" className="px-4 py-4">
                {historyCopy.typeColumn}
              </th>
              <th scope="col" className="px-4 py-4">
                {historyCopy.dateColumn}
              </th>
              <th scope="col" className="px-4 py-4">
                {historyCopy.statusColumn}
              </th>
              <th scope="col" className="px-4 py-4">
                {historyCopy.levelColumn}
              </th>
              <th scope="col" className="px-4 py-4">
                {historyCopy.badgeColumn}
              </th>
              <th scope="col" className="px-6 py-4">
                <span className="sr-only">{historyCopy.viewFeedback}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt) => (
              <tr
                key={attempt.id}
                className="border-b border-ink/5 last:border-b-0"
              >
                <td className="px-6 py-4 font-semibold text-ink">
                  {attempt.taskTitle}
                </td>
                <td className="px-4 py-4 text-ink/70">
                  {attempt.taskTypeLabel}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-ink/70">
                  {formatAttemptDate(attempt.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <AttemptStatusBadge status={attempt.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-ink/80">
                  {attempt.estimatedLevel !== null
                    ? formatPracticeLevel(attempt.estimatedLevel)
                    : historyCopy.noValue}
                </td>
                <td className="px-4 py-4">
                  {attempt.badgeLabel ? (
                    <BadgePill label={attempt.badgeLabel} />
                  ) : (
                    <span className="text-ink/40">{historyCopy.noValue}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={getAttemptHistoryPath(attempt.id)}
                    className="whitespace-nowrap font-semibold text-brand transition-colors hover:text-brand-dark"
                  >
                    {historyCopy.viewFeedback}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
