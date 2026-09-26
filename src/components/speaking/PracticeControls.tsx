import {
  practiceCopy,
  recordingCopy,
  type PracticePhase,
} from "@/features/speaking/practice-flow";

const primaryButtonClasses =
  "inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-8 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

const secondaryButtonClasses =
  "inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-brand ring-1 ring-brand/30 transition-colors hover:bg-brand/5 sm:w-auto";

// The primary action for the current phase. The speaking phase has no
// button here because AudioRecorder owns the stop control, and the
// complete phase renders its own cards in the shell.
export function PracticeControls({
  phase,
  micRequesting,
  micError,
  onStartPreparation,
  onSkipPreparation,
  onStartSpeaking,
}: {
  phase: PracticePhase;
  micRequesting: boolean;
  micError: boolean;
  onStartPreparation: () => void;
  onSkipPreparation: () => void;
  onStartSpeaking: () => void;
}) {
  if (phase === "speaking" || phase === "complete") {
    return null;
  }

  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onStartPreparation}
            className={primaryButtonClasses}
          >
            {practiceCopy.startPreparation}
          </button>
          <button
            type="button"
            onClick={onSkipPreparation}
            className={secondaryButtonClasses}
          >
            {practiceCopy.skipPreparation}
          </button>
        </div>
        <p className="text-center text-xs leading-5 text-ink/50">
          {practiceCopy.introRecordingNote}
        </p>
      </div>
    );
  }

  if (phase === "preparation") {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-center text-sm leading-6 text-ink/60">
          {practiceCopy.preparationWaitNote}
        </p>
        <button
          type="button"
          onClick={onSkipPreparation}
          className={secondaryButtonClasses}
        >
          {practiceCopy.skipPreparation}
        </button>
      </div>
    );
  }

  // ready_to_speak: starting speaking time also starts the recording,
  // so this button doubles as the retry action after a mic error.
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={onStartSpeaking}
        disabled={micRequesting}
        className={primaryButtonClasses}
      >
        {micError ? recordingCopy.tryRecordingAgain : practiceCopy.startSpeaking}
      </button>
      <p className="text-center text-xs leading-5 text-ink/50">
        {practiceCopy.readyToSpeakNote}
      </p>
    </div>
  );
}
