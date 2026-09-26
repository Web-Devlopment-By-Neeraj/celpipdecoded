"use client";

import type { RecordingState } from "@/features/speaking/audio-utils";
import { recordingCopy } from "@/features/speaking/practice-flow";
import { RecordingStatusCard } from "./RecordingStatusCard";

const stopButtonClasses =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-8 text-sm font-semibold text-white transition-colors hover:bg-ink/90 sm:w-auto";

// Recording status and the stop control for the speaking phase.
// Recording starts together with the speaking timer, so there is no
// separate start action here. The parent shell owns the recorder.
export function AudioRecorder({
  recordingState,
  errorMessage,
  elapsedSeconds,
  onStop,
}: {
  recordingState: RecordingState;
  errorMessage: string | null;
  elapsedSeconds: number;
  onStop: () => void;
}) {
  return (
    <section aria-label={recordingCopy.sectionLabel} className="space-y-3">
      <RecordingStatusCard
        state={recordingState}
        errorMessage={errorMessage}
        elapsedSeconds={elapsedSeconds}
      />
      {recordingState === "recording" && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onStop}
            className={stopButtonClasses}
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-sm bg-red-400"
            />
            {recordingCopy.stopRecording}
          </button>
        </div>
      )}
    </section>
  );
}
