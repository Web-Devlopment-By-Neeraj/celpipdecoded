import {
  getPhaseStep,
  PRACTICE_STEP_COUNT,
  practicePhaseInfo,
  type PracticePhase,
} from "@/features/speaking/practice-flow";

// Shows where the student is in the practice flow: step position,
// phase name, and a one line hint about what happens next.
export function PracticePhaseCard({ phase }: { phase: PracticePhase }) {
  const info = practicePhaseInfo[phase];
  const step = getPhaseStep(phase);

  return (
    <section
      aria-label="Current phase"
      className="rounded-3xl bg-cream-soft p-5 ring-1 ring-ink/5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
          Step {step} of {PRACTICE_STEP_COUNT}
        </p>
        <div aria-hidden className="flex items-center gap-1.5">
          {Array.from({ length: PRACTICE_STEP_COUNT }, (_, index) => (
            <span
              key={index}
              className={`h-1.5 w-6 rounded-full ${
                index < step ? "bg-brand" : "bg-ink/10"
              }`}
            />
          ))}
        </div>
      </div>
      <h2 className="mt-3 font-serif text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {info.label}
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-ink/70">{info.hint}</p>
    </section>
  );
}
