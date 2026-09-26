import { writingResultCopy } from "@/features/writing/task-copy";

// One list block inside the feedback section. Rendered only when the
// list has items, so an unexpected empty array never leaves a bare
// heading behind.
function FeedbackList({
  heading,
  items,
}: {
  heading: string;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">
        {heading}
      </h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
            />
            <p className="text-sm leading-6 text-ink/80">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Narrative feedback for the writing attempt: strengths, improvements,
// a suggested structure for this task type, and the recommended next
// steps for the student's next practice session.
export function WritingFeedbackSection({
  strengths,
  improvements,
  suggestedStructure,
  nextSteps,
}: {
  strengths: string[];
  improvements: string[];
  suggestedStructure: string | null;
  nextSteps: string[];
}) {
  return (
    <section
      aria-label={writingResultCopy.strengthsHeading}
      className="space-y-7 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <FeedbackList
        heading={writingResultCopy.strengthsHeading}
        items={strengths}
      />
      <FeedbackList
        heading={writingResultCopy.improvementsHeading}
        items={improvements}
      />
      {suggestedStructure && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">
            {writingResultCopy.suggestedStructureHeading}
          </h3>
          <p className="mt-3 rounded-2xl bg-cream-soft p-4 text-sm leading-7 text-ink/80 ring-1 ring-ink/5 sm:p-5">
            {suggestedStructure}
          </p>
        </div>
      )}
      <FeedbackList
        heading={writingResultCopy.nextStepsHeading}
        items={nextSteps}
      />
    </section>
  );
}
