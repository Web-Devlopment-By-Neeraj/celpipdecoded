import Link from "next/link";
import { writingCopy } from "@/features/writing/task-copy";
import type { WritingTask } from "@/features/writing/task-types";
import {
  getEvaluationFocus,
  getTaskNumber,
} from "@/features/writing/task-utils";
import { WritingTimingCard } from "./WritingTimingCard";

// Full detail view for one writing task: back link, heading, practice
// prompt, timing, evaluation focus, and the timed writing placeholder.
export function WritingTaskDetailPanel({ task }: { task: WritingTask }) {
  const taskNumber = getTaskNumber(task);
  const evaluationFocus = getEvaluationFocus(task);

  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
      <Link
        href="/dashboard/writing"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
      >
        <span aria-hidden>&larr;</span>
        {writingCopy.backToTasks}
      </Link>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
        Task {taskNumber}
      </p>
      <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {task.title}
      </h1>

      <section aria-label={writingCopy.practicePromptTitle} className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">
          {writingCopy.practicePromptTitle}
        </h2>
        <div className="mt-3 rounded-2xl border-l-4 border-brand bg-cream-soft p-5">
          <p className="whitespace-pre-line text-sm leading-7 text-ink sm:text-base">
            {task.prompt}
          </p>
        </div>
        <p className="mt-3 text-xs leading-5 text-ink/50">
          {writingCopy.promptDisclaimer}
        </p>
      </section>

      {task.details ? (
        <div className="mt-6">
          <WritingTimingCard details={task.details} />
        </div>
      ) : null}

      <section aria-label={writingCopy.evaluationFocusTitle} className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">
          {writingCopy.evaluationFocusTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          {writingCopy.evaluationFocusSubtext}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {evaluationFocus.map((area) => (
            <li
              key={area}
              className="rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand"
            >
              {area}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <Link
          href={`/dashboard/writing/practice/${task.id}`}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-8 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark sm:w-auto"
        >
          {writingCopy.startWritingButton}
        </Link>
        <p className="mt-3 text-xs leading-5 text-ink/50">
          {writingCopy.startWritingNote}
        </p>
      </div>
    </article>
  );
}
