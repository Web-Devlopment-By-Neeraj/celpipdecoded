import { transcriptCopy } from "@/features/speaking/practice-flow";

// Transcript preview shown after transcription succeeds. The text area
// scrolls on its own so long answers stay readable on small screens.
export function TranscriptCard({ transcript }: { transcript: string }) {
  return (
    <section
      aria-label={transcriptCopy.readyHeading}
      className="rounded-2xl bg-brand/5 p-5 text-left ring-1 ring-brand/10 sm:p-6"
    >
      <h3 className="font-serif text-lg font-semibold tracking-tight text-ink">
        {transcriptCopy.readyHeading}
      </h3>
      <p className="mt-2 text-sm leading-6 text-ink/70">
        {transcriptCopy.readyText}
      </p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
        {transcriptCopy.transcriptLabel}
      </p>
      <div className="mt-2 max-h-64 overflow-y-auto rounded-xl bg-white p-4 ring-1 ring-ink/5">
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-ink/80">
          {transcript}
        </p>
      </div>
    </section>
  );
}
