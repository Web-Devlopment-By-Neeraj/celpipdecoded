import { writingEvaluationCopy } from "@/features/writing/task-copy";

// Waiting state shown while the server evaluates a writing attempt.
// Pure presentational component, so both the timed writing flow and
// the result page can render it.
export function WritingEvaluationProcessingCard() {
  return (
    <section
      role="status"
      aria-live="polite"
      className="rounded-2xl bg-brand/5 p-6 text-center ring-1 ring-brand/10 sm:p-8"
    >
      <span
        aria-hidden
        className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand"
      />
      <h3 className="mt-4 font-serif text-lg font-semibold tracking-tight text-ink">
        {writingEvaluationCopy.processingHeading}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/70">
        {writingEvaluationCopy.processingText}
      </p>
    </section>
  );
}
