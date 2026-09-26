import Link from "next/link";
import { speakingCopy } from "@/features/speaking/task-copy";
import type { SpeakingTask } from "@/features/speaking/task-types";
import {
  formatSeconds,
  getTaskNumber,
  getTaskShortDescription,
} from "@/features/speaking/task-utils";

// Card for one speaking task in the library grid. Links to the task
// detail page.
export function SpeakingTaskCard({ task }: { task: SpeakingTask }) {
  const taskNumber = getTaskNumber(task);

  return (
    <article className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
          Task {taskNumber}
        </p>
        <span className="shrink-0 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          {speakingCopy.practiceBadge}
        </span>
      </div>

      <h3 className="mt-2 font-serif text-xl font-semibold tracking-tight text-ink">
        {task.title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-ink/70">
        {getTaskShortDescription(task.task_type)}
      </p>

      {task.details ? (
        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink/60">
          <div className="flex items-center gap-1.5">
            <dt className="font-semibold text-ink/70">Prep:</dt>
            <dd>{formatSeconds(task.details.prep_seconds)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="font-semibold text-ink/70">Speaking:</dt>
            <dd>{formatSeconds(task.details.speaking_seconds)}</dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-auto pt-5">
        <Link
          href={`/dashboard/speaking/tasks/${task.id}`}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark sm:w-auto"
        >
          {speakingCopy.viewTaskButton}
        </Link>
      </div>
    </article>
  );
}
