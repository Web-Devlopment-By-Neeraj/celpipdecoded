import Link from "next/link";
import { writingResultCopy } from "@/features/writing/task-copy";

// Actions after reviewing writing feedback: start another task, retry
// the same task, return to the writing history, or return to the task
// library. taskId can be null if the task was removed, in which case
// the retry link is hidden.
export function WritingNextPracticeActions({
  taskId,
}: {
  taskId: string | null;
}) {
  return (
    <section
      aria-label={writingResultCopy.actionsLabel}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
        {writingResultCopy.actionsLabel}
      </h2>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/dashboard/writing"
          className="inline-flex h-11 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark sm:w-auto"
        >
          {writingResultCopy.practiceAnotherTask}
        </Link>
        {taskId ? (
          <Link
            href={`/dashboard/writing/practice/${taskId}`}
            className="inline-flex h-11 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 text-sm font-semibold text-brand ring-1 ring-brand/30 transition-colors hover:bg-brand/5 sm:w-auto"
          >
            {writingResultCopy.tryTaskAgain}
          </Link>
        ) : null}
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-6">
        <Link
          href="/dashboard/writing/attempts"
          className="inline-flex items-center whitespace-nowrap text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          {writingResultCopy.backToHistory}
        </Link>
        <Link
          href="/dashboard/writing"
          className="inline-flex items-center whitespace-nowrap text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          {writingResultCopy.backToTasks}
        </Link>
      </div>
    </section>
  );
}
