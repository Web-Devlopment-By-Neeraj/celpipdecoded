import {
  formatWritingAttemptDate,
  formatWritingTimeUsed,
  writingHistoryCopy,
  type WritingAttemptHistoryItem,
} from "@/features/writing/writing-attempt-history";
import {
  formatWritingPracticeLevel,
  writingProgressCopy,
} from "@/features/writing/writing-progress-summary";
import { WritingAttemptActions } from "./WritingAttemptActions";
import { WritingAttemptStatusBadge } from "./WritingAttemptStatusBadge";

function BadgePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
      {label}
    </span>
  );
}

function CardFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink/50">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

// Full writing attempt history. Renders stacked cards below the lg
// breakpoint and a table from lg up, so the wider column set never
// overflows on small screens.
export function WritingAttemptHistoryTable({
  attempts,
}: {
  attempts: WritingAttemptHistoryItem[];
}) {
  return (
    <section aria-label={writingHistoryCopy.pageHeading}>
      {/* Mobile and tablet: stacked cards */}
      <ul className="space-y-4 lg:hidden">
        {attempts.map((attempt) => (
          <li
            key={attempt.id}
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5"
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
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              <CardFact
                label={writingHistoryCopy.wordsColumn}
                value={
                  attempt.wordCount !== null
                    ? String(attempt.wordCount)
                    : writingHistoryCopy.noValue
                }
              />
              <CardFact
                label={writingHistoryCopy.timeColumn}
                value={formatWritingTimeUsed(attempt.timeSpentSeconds)}
              />
              <CardFact
                label={writingHistoryCopy.levelColumn}
                value={
                  attempt.estimatedLevel !== null
                    ? formatWritingPracticeLevel(attempt.estimatedLevel)
                    : writingHistoryCopy.noValue
                }
              />
            </dl>

            {attempt.badgeLabel && (
              <p className="mt-3">
                <BadgePill label={attempt.badgeLabel} />
              </p>
            )}

            <div className="mt-4">
              <WritingAttemptActions
                attemptId={attempt.id}
                status={attempt.status}
                variant="button"
              />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-ink/5 lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs font-semibold uppercase tracking-wide text-ink/50">
              <th scope="col" className="px-6 py-4">
                {writingHistoryCopy.taskColumn}
              </th>
              <th scope="col" className="px-4 py-4">
                {writingHistoryCopy.typeColumn}
              </th>
              <th scope="col" className="px-4 py-4">
                {writingHistoryCopy.dateColumn}
              </th>
              <th scope="col" className="px-4 py-4">
                {writingHistoryCopy.wordsColumn}
              </th>
              <th scope="col" className="px-4 py-4">
                {writingHistoryCopy.timeColumn}
              </th>
              <th scope="col" className="px-4 py-4">
                {writingHistoryCopy.statusColumn}
              </th>
              <th scope="col" className="px-4 py-4">
                {writingHistoryCopy.levelColumnShort}
              </th>
              <th scope="col" className="px-4 py-4">
                {writingHistoryCopy.badgeColumn}
              </th>
              <th scope="col" className="px-6 py-4">
                {writingHistoryCopy.actionColumn}
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
                  {formatWritingAttemptDate(attempt.createdAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-ink/70">
                  {attempt.wordCount ?? writingHistoryCopy.noValue}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-ink/70">
                  {formatWritingTimeUsed(attempt.timeSpentSeconds)}
                </td>
                <td className="px-4 py-4">
                  <WritingAttemptStatusBadge status={attempt.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-ink/80">
                  {attempt.estimatedLevel !== null
                    ? formatWritingPracticeLevel(attempt.estimatedLevel)
                    : writingHistoryCopy.noValue}
                </td>
                <td className="px-4 py-4">
                  {attempt.badgeLabel ? (
                    <BadgePill label={attempt.badgeLabel} />
                  ) : (
                    <span className="text-ink/40">
                      {writingHistoryCopy.noValue}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <WritingAttemptActions
                    attemptId={attempt.id}
                    status={attempt.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-5 text-ink/50">
        {writingProgressCopy.practiceEstimateNote}
      </p>
    </section>
  );
}
