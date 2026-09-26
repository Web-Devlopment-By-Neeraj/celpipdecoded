import { writingResultCopy } from "@/features/writing/task-copy";

// Original response reference at the bottom of the result page. Line
// breaks are preserved and the text area scrolls on its own so long
// responses never overflow on small screens.
export function WritingResponseReferenceCard({
  responseText,
}: {
  responseText: string;
}) {
  return (
    <section
      aria-label={writingResultCopy.responseHeading}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
        {writingResultCopy.responseHeading}
      </h2>
      <p className="mt-2 text-sm leading-6 text-ink/70">
        {writingResultCopy.responseNote}
      </p>
      <div className="mt-4 max-h-80 overflow-y-auto rounded-2xl bg-cream-soft p-4 ring-1 ring-ink/5 sm:p-5">
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-ink/80">
          {responseText}
        </p>
      </div>
    </section>
  );
}
