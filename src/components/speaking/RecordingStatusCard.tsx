import type { RecordingState } from "@/features/speaking/audio-utils";
import { recordingCopy } from "@/features/speaking/practice-flow";
import { formatClock } from "@/features/speaking/timer-utils";

// Live status line for the recording flow. Announced politely so
// screen reader users hear state changes without losing the timer.
export function RecordingStatusCard({
  state,
  errorMessage,
  elapsedSeconds,
  finishing = false,
}: {
  state: RecordingState;
  errorMessage: string | null;
  elapsedSeconds: number;
  finishing?: boolean;
}) {
  if (state === "error") {
    return (
      <div
        role="alert"
        className="rounded-2xl bg-red-50 p-4 text-center ring-1 ring-red-200"
      >
        <p className="text-sm leading-6 text-red-800">
          {errorMessage ?? recordingCopy.errors.recordingFailed}
        </p>
      </div>
    );
  }

  if (state === "recording") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl bg-ink/[0.04] p-4 text-center ring-1 ring-ink/10"
      >
        {finishing ? (
          <p className="text-sm font-semibold text-ink">
            {recordingCopy.statusFinishing}
          </p>
        ) : (
          <>
            <p className="flex items-center justify-center gap-2 text-sm font-semibold text-ink">
              <span
                aria-hidden
                className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500"
              />
              {recordingCopy.statusRecording}
              <span className="tabular-nums text-ink/60">
                {formatClock(elapsedSeconds)}
              </span>
            </p>
            <p className="mt-1 text-xs leading-5 text-ink/50">
              {recordingCopy.privacyNote}
            </p>
          </>
        )}
      </div>
    );
  }

  const statusText: Record<Exclude<RecordingState, "error" | "recording">, string> = {
    idle: recordingCopy.statusIdle,
    requesting_permission: recordingCopy.statusRequesting,
    recorded: recordingCopy.statusRecorded,
    uploading: recordingCopy.statusUploading,
    uploaded: recordingCopy.statusUploaded,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl bg-ink/[0.04] p-4 text-center ring-1 ring-ink/10"
    >
      <p className="text-sm leading-6 text-ink/70">{statusText[state]}</p>
      {state === "idle" && (
        <p className="mt-1 text-xs leading-5 text-ink/50">
          {recordingCopy.privacyNote}
        </p>
      )}
    </div>
  );
}
