import Link from "next/link";
import { resultCopy } from "@/features/speaking/practice-flow";

// Actions after reviewing feedback: start another task, retry the same
// task, or return to the task library. taskId can be null if the task
// was removed, in which case the retry link is hidden.
export function NextPracticeActions({ taskId }: { taskId: string | null }) {
  return (
    <section
      aria-label={resultCopy.actionsLabel}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <h2 className="text-center font-serif text-xl font-semibold tracking-tight text-ink sm:text-left">
        {resultCopy.actionsLabel}
      </h2>
      <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Link
          href="/dashboard/speaking"
          className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-8 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
        >
          {resultCopy.practiceAnotherTask}
        </Link>
        {taskId && (
          <Link
            href={`/dashboard/speaking/practice/${taskId}`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-brand ring-1 ring-brand/30 transition-colors hover:bg-brand/5"
          >
            {resultCopy.tryTaskAgain}
          </Link>
        )}
        <Link
          href="/dashboard/speaking"
          className="inline-flex h-12 items-center justify-center px-4 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          {resultCopy.backToTasks}
        </Link>
      </div>
    </section>
  );
}
