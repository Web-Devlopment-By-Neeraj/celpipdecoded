"use client";

import { ExamButton } from "../ExamButton";
import { MockTestSpeakingRecorderFrame } from "../player/MockTestSpeakingRecorderFrame";
import {
  useSpeakingMockRecorder,
  useSpeakingRecordingSupported,
} from "./useSpeakingMockRecorder";
import { examSpeaking } from "@/features/exam-engine/exam-theme";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { MockTestRecorderStatus } from "../player/MockTestSpeakingRecorderFrame";
import type { SpeakingMockRecording } from "./useSpeakingMockRecorder";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type {
  SpeakingRecordingErrorKind,
  SpeakingRecordingStatus,
} from "@/features/exam-engine/speaking-mock-types";

// The recording controls on a Speaking task screen (EXAM-27).
//
// One block: a status line, one or two buttons, and whatever went wrong.
// It owns the MediaRecorder through useSpeakingMockRecorder and it owns
// nothing else. The status, the error and the finished audio all belong
// to the screen above it, which is what lets a recording survive
// navigation while the recorder itself does not have to.
//
// EXAM-UI-03 moved what it looks like into
// MockTestSpeakingRecorderFrame, the mirror of the Listening audio card:
// a microphone mark, a status word and the controls, in one centred card
// instead of five rows of small print stacked down the answer column. The
// frame is presentational and records nothing, so everything below this
// comment, the permission rule and the three failure states included, is
// exactly what it was.
//
// The permission rule the ticket sets, and where it is kept
// --------------------------------------------------------
//
// The microphone is asked for when Start recording is pressed, and at no
// other moment. Opening a task screen mounts this component and asks for
// nothing: the only call to getUserMedia in the whole section is inside
// the hook's start(), and the only caller of start() is the click handler
// below. There is no effect that starts recording, no autoplay, and no
// warm up call to hold a stream open between tasks.
//
// Three failures, three different screens
// ---------------------------------------
//
// The hook reports a kind rather than a sentence, and each kind gets what
// can actually help:
//
// - "unsupported" says the browser cannot record and offers no retry,
//   because pressing again cannot change the answer. Start recording is
//   not drawn at all in this state, so there is no dead control on the
//   screen
// - "permission-denied" says the microphone was blocked and offers a
//   retry, because a learner can change a browser setting and press again
// - "failed" says something went wrong and offers a retry
//
// All three say the same last thing: the run is not stuck, and moving to
// the next task is allowed. A task with no recording is reported as
// missing on the completion screen and nothing else happens.
//
// Unsupported is checked twice, and deliberately. The hook checks before
// it touches getUserMedia, which is what makes it safe, and this
// component checks at render through useSpeakingRecordingSupported so the
// button is never offered in a browser that cannot honour it. The render
// check is the display half and the hook check is the correctness half;
// neither is enough on its own, because a browser can pass the feature
// test and still refuse the call.
//
// A browser with no MediaRecorder therefore shows the unsupported notice
// before anything is pressed, and shows no Start recording button at all.
// It can still read every task, watch both clocks and walk the whole
// section, which is the ticket's own rule: the flow does not crash and is
// not blocked by a missing recording.
//
// What it does not do: no upload, no database write, no localStorage, no
// object URL. The blob is handed up the moment it exists and the screen
// above decides what to do with it.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingRecorderProps = {
  // Names the recorder for assistive technology, for example
  // "Speaking Task 3".
  taskLabel: string;
  status: SpeakingRecordingStatus;
  errorKind: SpeakingRecordingErrorKind | null;
  // True when this task already has a recording, which turns Start
  // recording into Re-record.
  hasRecording: boolean;

  // The permission prompt is open.
  onRequestStart: () => void;
  // The recorder is running.
  onRecordingStarted: () => void;
  // Stop has been pressed and the audio is being assembled.
  onRecordingStopping: () => void;
  // A finished take.
  onRecorded: (recording: SpeakingMockRecording) => void;
  // A take that could not be made or finished.
  onRecordingError: (kind: SpeakingRecordingErrorKind) => void;

  copy?: SpeakingMockCopy;
};

// The status line, as a dot and the words that repeat it.
//
// The state is never colour alone: the dot carries it visually and the
// sentence beside it carries it for everybody else.
// The status word the card carries, and the frame state that colours the
// microphone mark. "recorded" is not one of the recorder's own states: it
// is the idle state once a take exists, which is a different thing to say
// to a learner and so a different thing to draw.
function statusPresentation(
  status: SpeakingRecordingStatus,
  hasRecording: boolean,
  copy: SpeakingMockCopy,
): { frameStatus: MockTestRecorderStatus; text: string } {
  if (status === "requesting") {
    return { frameStatus: "requesting", text: copy.statusRequestingLabel };
  }

  if (status === "recording") {
    return { frameStatus: "recording", text: copy.statusRecordingLabel };
  }

  if (status === "stopping") {
    return { frameStatus: "stopping", text: copy.statusStoppingLabel };
  }

  return hasRecording
    ? { frameStatus: "recorded", text: copy.statusRecordedLabel }
    : { frameStatus: "idle", text: copy.statusIdleLabel };
}

// The heading and sentence for one kind of failure.
function errorPresentation(
  kind: SpeakingRecordingErrorKind,
  copy: SpeakingMockCopy,
): { heading: string; text: string; canRetry: boolean } {
  if (kind === "unsupported") {
    return {
      heading: copy.errorUnsupportedHeading,
      text: copy.errorUnsupportedText,
      // Pressing again cannot add a MediaRecorder to this browser.
      canRetry: false,
    };
  }

  if (kind === "permission-denied") {
    return {
      heading: copy.errorPermissionHeading,
      text: copy.errorPermissionText,
      canRetry: true,
    };
  }

  return {
    heading: copy.errorFailedHeading,
    text: copy.errorFailedText,
    canRetry: true,
  };
}

export function SpeakingRecorder({
  taskLabel,
  status,
  errorKind,
  hasRecording,
  onRequestStart,
  onRecordingStarted,
  onRecordingStopping,
  onRecorded,
  onRecordingError,
  copy = speakingMockCopy,
}: SpeakingRecorderProps) {
  const recordingSupported = useSpeakingRecordingSupported();

  const recorder = useSpeakingMockRecorder({
    onRecorded,
    onError: onRecordingError,
  });

  const beginRecording = async () => {
    // Guard against a second press while the prompt is open or the
    // recorder is already running. The hook is safe either way, and this
    // keeps the status from flickering back to "requesting".
    if (status === "requesting" || status === "recording") {
      return;
    }

    onRequestStart();

    const started = await recorder.start();

    if (started) {
      onRecordingStarted();
    }

    // Nothing to do on failure. The hook has already reported the kind
    // through onError, and the screen above has already left the
    // requesting state.
  };

  const endRecording = () => {
    if (status !== "recording") {
      return;
    }

    onRecordingStopping();
    recorder.stop();
  };

  const recording = status === "recording";
  const requesting = status === "requesting";
  const stopping = status === "stopping";
  const presentation = statusPresentation(status, hasRecording, copy);

  // A browser with no MediaRecorder shows the unsupported notice before
  // anything is pressed, so the learner is told why there is no Start
  // recording button rather than left looking for one. A reported error
  // wins over the standing one, because a reported error is about
  // something the learner just did.
  const failure = errorKind
    ? errorPresentation(errorKind, copy)
    : recordingSupported
      ? null
      : errorPresentation("unsupported", copy);

  // The hint under the heading follows the state rather than the error,
  // because the error block below says its own piece.
  const hint = recording
    ? copy.recorderRecordingHint
    : hasRecording
      ? copy.recorderRecordedHint
      : copy.recorderIdleHint;

  // Start is offered whenever this browser can record and nothing is in
  // flight. In a browser that cannot record it is not drawn at all: the
  // unsupported notice below is the whole of what this panel can offer.
  const showStart = recordingSupported && !recording;

  const startLabel = requesting
    ? copy.requestingMicrophoneLabel
    : hasRecording
      ? copy.reRecordLabel
      : failure?.canRetry
        ? copy.errorRetryLabel
        : copy.startRecordingLabel;

  return (
    <section aria-label={`${copy.recorderHeading}: ${taskLabel}`}>
      <MockTestSpeakingRecorderFrame
        status={presentation.frameStatus}
        statusLabel={presentation.text}
        hint={hint}
        note={copy.recorderPrivacyNote}
        footer={
          failure ? (
            <div className={examSpeaking.error} role="alert">
              <p className={examSpeaking.errorHeading}>{failure.heading}</p>
              <p className={examSpeaking.errorText}>{failure.text}</p>
              <p className={examSpeaking.errorHint}>{copy.errorContinueHint}</p>
            </div>
          ) : null
        }
      >
        {showStart ? (
          <ExamButton
            variant="primary"
            size="md"
            uppercase={false}
            disabled={requesting || stopping}
            onClick={() => void beginRecording()}
          >
            {startLabel}
          </ExamButton>
        ) : null}

        {recording ? (
          <ExamButton
            variant="secondary"
            size="md"
            uppercase={false}
            onClick={endRecording}
          >
            {copy.stopRecordingLabel}
          </ExamButton>
        ) : null}
      </MockTestSpeakingRecorderFrame>
    </section>
  );
}
