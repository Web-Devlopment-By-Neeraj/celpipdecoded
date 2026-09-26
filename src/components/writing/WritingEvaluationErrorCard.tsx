import { writingEvaluationCopy } from "@/features/writing/task-copy";

// Error state after a failed evaluation run. The student's response is
// already saved at this point, so the card reassures and points to the
// retry action rendered next to it.
export function WritingEvaluationErrorCard({ message }: { message: string }) {
  return (
    <section
      role="alert"
      aria-label={writingEvaluationCopy.failedHeading}
      className="rounded-2xl bg-red-50 p-5 text-center ring-1 ring-red-200 sm:p-6"
    >
      <h3 className="font-serif text-lg font-semibold tracking-tight text-red-900">
        {writingEvaluationCopy.failedHeading}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-800">
        {message}
      </p>
    </section>
  );
}
