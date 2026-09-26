import type { ReactNode } from "react";
import { cx } from "@/features/design/design-tokens";
import { playerRecorder } from "@/features/exam-engine/mock-test-player-theme";

// The card a Speaking answer is recorded in (EXAM-UI-03).
//
// This is the audio screen's mirror image. The Listening card says "a clip
// is playing, listen to it"; this one says "you are being recorded, speak".
// They are drawn from the same three parts on purpose, a mark, a status
// word and a bar, so a learner who has already sat the Listening section
// reads this screen without being taught it.
//
// Before this ticket the recorder was a bordered box holding a heading, a
// coloured status dot, a hint sentence, the buttons and a privacy note,
// five rows of small print stacked down the answer column. Nothing in it
// said, at a glance, whether the microphone was live.
//
// So the card carries, in the order a learner reads them:
//
// - **a microphone mark**, so the screen announces itself before any text
//   is read, and it turns red while the recorder is live
// - **a status word**, Not recorded yet, Recording in progress, Recorded
// - **a bar**, when the caller has a reading to give it
// - **the controls**, passed in
// - **the practice note** under them
//
// **This component records nothing.** It holds no MediaRecorder, asks for
// no microphone, owns no clock and keeps no state. It is handed a status
// and draws it, and the buttons inside it are the caller's own. Everything
// that actually captures audio stays in SpeakingRecorder and
// useSpeakingMockRecorder. That separation is deliberate: the EXAM-UI-03
// brief asks for the recording screen to look right and explicitly asks
// for the microphone, transcription and review logic not to change, and a
// presentational component cannot change them by accident.
//
// **The bar is the recording window, not a level meter.** When a caller
// passes a progress reading it fills as the window runs down, so it
// answers "how much of my time is left". It never pretends to show how
// loud the room is, because nothing here is listening to the room.
//
// **The microphone mark is ours.** An inline SVG of a rounded capsule, a
// cradle arc and a stand, drawn in this file from four path commands. No
// icon package is installed for the exam engine and nothing here is taken
// from any test provider's interface.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type MockTestRecorderStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "stopping"
  | "recorded";

export type MockTestSpeakingRecorderFrameProps = {
  status: MockTestRecorderStatus;
  // The status word, already chosen by the caller from its own copy file.
  statusLabel: string;
  // One short line under it saying what to do next.
  hint?: string;
  // How far through the recording window, from 0 to 1. Anything outside
  // that is clamped rather than allowed to draw a bar past its track.
  // Omit to draw no bar at all.
  progress?: number;
  // Read under the two ends of the bar, for example "0:12" and "1:30".
  elapsedLabel?: string;
  totalLabel?: string;
  // The record and stop buttons. Passed in rather than built here, so
  // nothing in this file can change how a recording starts or ends.
  children?: ReactNode;
  // Quiet line under the controls.
  note?: string;
  // Full width block under the card body, for the microphone error panel.
  footer?: ReactNode;
  className?: string;
};

export function MockTestSpeakingRecorderFrame({
  status,
  statusLabel,
  hint,
  progress,
  elapsedLabel,
  totalLabel,
  children,
  note,
  footer,
  className,
}: MockTestSpeakingRecorderFrameProps) {
  const live = status === "recording";
  const showBar = progress !== undefined;
  const clamped = Math.min(Math.max(progress ?? 0, 0), 1);
  const percent = `${(clamped * 100).toFixed(1)}%`;

  return (
    <div className={cx(playerRecorder.card, className)}>
      <span
        className={cx(playerRecorder.mic, live ? playerRecorder.micRecording : "")}
        aria-hidden="true"
      >
        <MicrophoneMark />
      </span>

      {/* Announced politely. This changes a handful of times per task
          rather than four times a second, so unlike a countdown it is
          safe to speak. */}
      <p className={playerRecorder.status} role="status" aria-live="polite">
        {statusLabel}
      </p>

      {hint ? <p className={playerRecorder.hint}>{hint}</p> : null}

      {showBar ? (
        <>
          <div className={playerRecorder.track} aria-hidden="true">
            <div
              className={live ? playerRecorder.fillRecording : playerRecorder.fill}
              style={{ width: percent }}
            />
          </div>

          {elapsedLabel || totalLabel ? (
            <div className={playerRecorder.times} aria-hidden="true">
              <span>{elapsedLabel ?? ""}</span>
              <span>{totalLabel ?? ""}</span>
            </div>
          ) : null}
        </>
      ) : null}

      {children ? (
        <div className={playerRecorder.controls}>{children}</div>
      ) : null}

      {footer ? <div className={playerRecorder.footer}>{footer}</div> : null}

      {note ? <p className={playerRecorder.note}>{note}</p> : null}
    </div>
  );
}

// The microphone mark. A rounded capsule, the cradle arc under it and a
// short stand, drawn from scratch rather than taken from an icon set.
function MicrophoneMark() {
  return (
    <svg
      className={playerRecorder.micIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <path d="M12 3.5a2.8 2.8 0 0 1 2.8 2.8v5a2.8 2.8 0 0 1-5.6 0v-5A2.8 2.8 0 0 1 12 3.5Z" />
      <path d="M6.5 11a5.5 5.5 0 0 0 11 0" />
      <path d="M12 16.5v4" />
      <path d="M9 20.5h6" />
    </svg>
  );
}
