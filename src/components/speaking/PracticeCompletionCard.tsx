import Link from "next/link";
import { practiceCopy } from "@/features/speaking/practice-flow";

// Completion state for the timed practice flow, with clear paths back
// to the task detail page and the speaking task library.
export function PracticeCompletionCard({ taskId }: { taskId: string }) {
  return (
    <section
      aria-label={practiceCopy.completionHeading}
      className="rounded-3xl bg-white p-6 text-center ring-1 ring-ink/5 sm:p-8"
    >
      <span
        aria-hidden
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-xl text-brand"
      >
        &#10003;
      </span>
      <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-ink">
        {practiceCopy.completionHeading}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/70">
        {practiceCopy.completionText}
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/dashboard/speaking/tasks/${taskId}`}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark sm:w-auto"
        >
          {practiceCopy.backToTask}
        </Link>
        <Link
          href="/dashboard/speaking"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-brand ring-1 ring-brand/30 transition-colors hover:bg-brand/5 sm:w-auto"
        >
          {practiceCopy.practiceAnotherTask}
        </Link>
      </div>
    </section>
  );
}
