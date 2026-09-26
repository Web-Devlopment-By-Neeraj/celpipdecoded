import { writingEvaluationCopy } from "@/features/writing/task-copy";

// Primary action to send a saved writing response for AI evaluation.
// Disabled with a visible spinner while the server prepares feedback,
// so a student cannot submit the same attempt twice. After a failure
// the same button becomes the retry action.
export function SubmitWritingEvaluationButton({
  working,
  retry = false,
  onSubmit,
}: {
  working: boolean;
  retry?: boolean;
  onSubmit: () => void;
}) {
  const idleLabel = retry
    ? writingEvaluationCopy.tryAgain
    : writingEvaluationCopy.submit;
  return (
    <button
      type="button"
      onClick={onSubmit}
      disabled={working}
      aria-busy={working}
      className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-brand px-8 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {working && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      {working ? writingEvaluationCopy.working : idleLabel}
    </button>
  );
}
