import Link from "next/link";
import { writingPracticeCopy } from "@/features/writing/task-copy";
import { SubmitWritingEvaluationButton } from "./SubmitWritingEvaluationButton";
import { WritingEvaluationErrorCard } from "./WritingEvaluationErrorCard";

// State after a writing response is saved but evaluation has not
// finished. Shown when an evaluation run fails: the response is safe,
// the error is explained, and the student can retry the evaluation.
export function WritingSavedCard({
  evaluationError,
  onSubmitForEvaluation,
}: {
  evaluationError: string | null;
  onSubmitForEvaluation: () => void;
}) {
  return (
    <section
      aria-label={writingPracticeCopy.savedHeading}
      className="rounded-3xl bg-cream-soft p-6 text-center ring-1 ring-ink/5 sm:p-8"
    >
      <span
        aria-hidden
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-700"
      >
        &#10003;
      </span>
      <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-ink">
        {writingPracticeCopy.savedHeading}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/70">
        {writingPracticeCopy.savedBody}
      </p>
      {evaluationError && (
        <div className="mt-5 text-left">
          <WritingEvaluationErrorCard message={evaluationError} />
        </div>
      )}
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <SubmitWritingEvaluationButton
          working={false}
          retry={evaluationError !== null}
          onSubmit={onSubmitForEvaluation}
        />
        <Link
          href="/dashboard/writing"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-brand ring-1 ring-brand/30 transition-colors hover:bg-brand/5 sm:w-auto"
        >
          {writingPracticeCopy.backToTasks}
        </Link>
      </div>
    </section>
  );
}
