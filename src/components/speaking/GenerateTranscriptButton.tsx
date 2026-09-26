import { transcriptCopy } from "@/features/speaking/practice-flow";

// Primary action for the transcription step. Disabled with a visible
// spinner while the server prepares the transcript, so a student
// cannot request the same transcription twice. After a failure the
// same button becomes the retry action.
export function GenerateTranscriptButton({
  working,
  retry = false,
  onGenerate,
}: {
  working: boolean;
  retry?: boolean;
  onGenerate: () => void;
}) {
  const idleLabel = retry ? transcriptCopy.tryAgain : transcriptCopy.generate;
  return (
    <button
      type="button"
      onClick={onGenerate}
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
      {working ? transcriptCopy.generating : idleLabel}
    </button>
  );
}
