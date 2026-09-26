import { resultCopy } from "@/features/speaking/practice-flow";

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

// Narrative feedback for the attempt: strengths, improvements, and the
// recommended next steps for the student's next practice session.
export function FeedbackSection({
  strengths,
  improvements,
  nextSteps,
}: {
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
}) {
  return (
    <section
      aria-label={resultCopy.strengthsHeading}
      className="space-y-7 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <FeedbackList heading={resultCopy.strengthsHeading} items={strengths} />
      <FeedbackList
        heading={resultCopy.improvementsHeading}
        items={improvements}
      />
      <FeedbackList heading={resultCopy.nextStepsHeading} items={nextSteps} />
    </section>
  );
}
