import { writingPracticeCopy } from "@/features/writing/task-copy";

// Primary action for the timed writing screen. Disabled while the
// save request runs so the same response cannot be submitted twice.
export function WritingSubmitButton({
  submitting,
  onSubmit,
}: {
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSubmit}
      disabled={submitting}
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-8 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {submitting
        ? writingPracticeCopy.submitting
        : writingPracticeCopy.submitResponse}
    </button>
  );
}
