import Link from "next/link";
import { speakingCopy } from "@/features/speaking/task-copy";

// Friendly 404 for invalid or missing practice task ids, matching the
// task detail 404 so the dashboard shell stays visible.
export default function TimedPracticeNotFound() {
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">
        Task not found
      </h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        We could not find that speaking task. It may have been moved or
        removed.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <Link
          href="/dashboard/speaking"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
        >
          {speakingCopy.backToTasks}
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          {speakingCopy.backToDashboard}
        </Link>
      </div>
    </div>
  );
}
