import { resultCopy } from "@/features/speaking/practice-flow";

// Transcript reference at the bottom of the result page. The text area
// scrolls on its own so long answers never overflow on small screens.
export function TranscriptReferenceCard({
  transcript,
}: {
  transcript: string;
}) {
  return (
    <section
      aria-label={resultCopy.transcriptHeading}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
        {resultCopy.transcriptHeading}
      </h2>
      <p className="mt-2 text-sm leading-6 text-ink/70">
        {resultCopy.transcriptNote}
      </p>
      <div className="mt-4 max-h-64 overflow-y-auto rounded-2xl bg-cream-soft p-4 ring-1 ring-ink/5 sm:p-5">
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-ink/80">
          {transcript}
        </p>
      </div>
    </section>
  );
}
