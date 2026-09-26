import Link from "next/link";
import { writingCopy } from "@/features/writing/task-copy";

// Friendly 404 for invalid or missing writing task ids. Renders inside
// the dashboard layout, so the header stays visible.
export default function WritingTaskNotFound() {
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">
        Task not found
      </h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        We could not find that writing task. It may have been moved or
        removed.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <Link
          href="/dashboard/writing"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
        >
          {writingCopy.backToTasks}
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          {writingCopy.backToDashboard}
        </Link>
      </div>
    </div>
  );
}
