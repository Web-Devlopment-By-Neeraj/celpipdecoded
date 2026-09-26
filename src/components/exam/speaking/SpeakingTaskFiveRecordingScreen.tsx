"use client";

import { useState } from "react";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ExamTwoColumnLayout } from "../ExamTwoColumnLayout";
import { SpeakingAudioPreview } from "./SpeakingAudioPreview";
import { SpeakingOptionCardBlock } from "./SpeakingVisualPrompt";
import { SpeakingRecorder } from "./SpeakingRecorder";
import { SpeakingRecordingTimer } from "./SpeakingRecordingTimer";
import {
  examSpeaking,
  examSpeakingTaskFive,
} from "@/features/exam-engine/exam-theme";
import { playerTimerCard } from "@/features/exam-engine/mock-test-player-theme";
import {
  formatSpeakingTaskScreenTitle,
  speakingMockCopy,
} from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockRecording } from "./useSpeakingMockRecorder";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type {
  SpeakingOptionCard,
  SpeakingRecordingErrorKind,
  SpeakingRecordingStatus,
  SpeakingResponse,
  SpeakingTaskContent,
} from "@/features/exam-engine/speaking-mock-types";

// The last of the four Speaking Task 5 screens (SPEAKING-05A).
//
// The same split every other Speaking task screen has, and the same
// recorder, the same recording clock and the same playback: the two camps
// and the persuade instruction on the left, the controls on the right.
// This is where the microphone finally opens.
//
// What it is not is a second SpeakingTaskScreen. It differs from that
// screen in exactly two ways, and both of them are consequences of Task 5
// having had three screens before this one:
//
// - there is no preparation clock on it. The preparation window ran on
//   the screen before, so a second one here would be a second planning
//   window the source does not give
// - the cards are the chosen camp and the sister's camp rather than
//   whatever the content file printed. The prompt panel draws a task's
//   visuals, which are fixed; this screen draws the choice, which is not
//
// Everything else is the shared components, including the take state
// machine below, which is SpeakingTaskScreen's own and is kept identical
// on purpose: a re-record here has to behave exactly as a re-record on
// Task 3 does, or the section has two recorders.
//
// What happens when the recording window closes
// ---------------------------------------------
//
// The reading turns red and reads "Time is up" and the section raises its
// shared message. The recorder is not stopped, the audio already captured
// is not discarded, no screen advances to Task 6, and nothing is
// submitted. The learner finishes their sentence, presses Stop recording,
// plays it back if they want to, and presses Next when they are ready.
// That is TIMER-01, unchanged, and this screen adds nothing to it.
//
// Next is not gated on a recording, which is the rule every screen in the
// engine follows. A learner whose microphone does not work can still
// leave, and Task 5 is reported as missing on the completion screen like
// any other unrecorded task.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingTaskFiveRecordingScreenProps = {
  task: SpeakingTaskContent;
  // The camp the learner is arguing for.
  chosenOption?: SpeakingOptionCard;
  // The recording held for this task, which may be the empty response.
  response: SpeakingResponse;
  // Fired with a finished take. The screen above turns it into a
  // response, which is where the object URL is made.
  onRecorded: (recording: SpeakingMockRecording) => void;
  // Fired once when the recording window reaches zero (TIMER-01). The
  // recorder is not touched.
  onTimeExpire?: () => void;
  copy?: SpeakingMockCopy;
  metaText?: string;
  nextLabel?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function SpeakingTaskFiveRecordingScreen({
  task,
  chosenOption,
  response,
  onRecorded,
  onTimeExpire,
  copy = speakingMockCopy,
  metaText,
  nextLabel,
  onNext,
  onBack,
  showBack = true,
}: SpeakingTaskFiveRecordingScreenProps) {
  // The take in progress, and nothing about the recording that results.
  // The same three values SpeakingTaskScreen holds, for the same reasons
  // its own note gives: all three are lost when the learner leaves, and
  // the finished recording lives one level up so that it is not.
  const [status, setStatus] = useState<SpeakingRecordingStatus>("idle");
  const [errorKind, setErrorKind] = useState<SpeakingRecordingErrorKind | null>(
    null,
  );
  const [takeKey, setTakeKey] = useState<string | null>(null);
  // How many takes have been started on this screen. It exists only to
  // make each take's window key different from the last, so a re-record
  // opens a new window rather than resuming the old one.
  const [takeCount, setTakeCount] = useState(0);

  const step = task.choiceStep;

  const hasRecording = response.audioUrl !== null && response.audioBlob !== null;

  const handleRequestStart = () => {
    // The permission prompt is opening. The previous failure goes now
    // rather than when the new take succeeds.
    setErrorKind(null);
    setStatus("requesting");
  };

  const handleRecordingStarted = () => {
    const nextTake = takeCount + 1;

    setTakeCount(nextTake);
    setStatus("recording");
    // Opening the window is a change of key, which remounts the recording
    // clock. See SpeakingRecordingTimer.
    setTakeKey(`${task.taskId}-take-${nextTake}`);
  };

  const handleRecordingStopping = () => {
    setStatus("stopping");
    // The window closes with the take. The clock returns to its idle
    // reading rather than counting down behind a stopped recorder.
    setTakeKey(null);
  };

  const handleRecorded = (recording: SpeakingMockRecording) => {
    setStatus("idle");
    setTakeKey(null);
    onRecorded(recording);
  };

  const handleRecordingError = (kind: SpeakingRecordingErrorKind) => {
    setStatus("idle");
    setTakeKey(null);
    setErrorKind(kind);
  };

  // A task with no choice step never reaches this screen: the flow
  // builder gives it the ordinary task screen instead.
  if (!step) {
    return null;
  }

  return (
    <ExamShell
      title={formatSpeakingTaskScreenTitle(task.title, task.taskTitle)}
      metaText={metaText}
      nextLabel={nextLabel}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
      // The split manages its own edges and fills the canvas.
      padded={false}
      // The split pane gives each column its own scrollbar, so the
      // content pane takes none of its own (EXAM-UI-02).
      scrollContent={false}
    >
      <ExamTwoColumnLayout
        rightLabel={copy.recordColumnLabel}
        // Fixed heights, used only below the large breakpoint.
        leftScroll="none"
        rightScroll="none"
        // Above that, each column takes the height of the content pane and
        // its own scrollbar. The two cards can scroll without the
        // recorder, the clock or the preview player moving, which is what
        // matters when the screen is being spoken to rather than read.
        fill
        bordered={false}
        left={
          <div className={examSpeaking.prompt}>
            {/* The source's own persuade instruction, the same sentence
                the preparation screen carried. */}
            <ExamInstructionRow className={examSpeaking.instructionRow}>
              <span className={examSpeakingTaskFive.promptInstruction}>
                {task.promptInstruction}
              </span>
            </ExamInstructionRow>

            <p className={examSpeakingTaskFive.promptParagraph}>
              {copy.recordingScreenHint}
            </p>

            <p className={examSpeaking.promptLabel}>
              {step.comparisonCaption ?? copy.optionCardsHeading}
            </p>

            {/* The sister's camp and the learner's, in the order the
                source prints them. The same two cards the preparation
                screen showed, so nothing moves under the learner between
                planning and speaking. */}
            <div className={examSpeaking.cardGrid}>
              <SpeakingOptionCardBlock
                card={step.comparison}
                className="h-full"
              />

              {chosenOption ? (
                <SpeakingOptionCardBlock
                  card={chosenOption}
                  label={step.chosenLabel}
                  className="h-full"
                />
              ) : null}
            </div>
          </div>
        }
        right={
          <div className={examSpeaking.answerColumn}>
            {/* One clock rather than the usual pair. The preparation
                window ran on the screen before this one and is over. */}
            <div className={playerTimerCard.row}>
              <SpeakingRecordingTimer
                timer={task.responseTimer}
                runKey={takeKey}
                // The window running out says so and stops there. The take
                // is not stopped, the audio already captured is kept, and
                // Stop recording stays the learner's to press (TIMER-01).
                onExpire={onTimeExpire}
                copy={copy}
              />
            </div>

            <SpeakingRecorder
              taskLabel={task.taskLabel}
              status={status}
              errorKind={errorKind}
              hasRecording={hasRecording}
              onRequestStart={handleRequestStart}
              onRecordingStarted={handleRecordingStarted}
              onRecordingStopping={handleRecordingStopping}
              onRecorded={handleRecorded}
              onRecordingError={handleRecordingError}
              copy={copy}
            />

            <SpeakingAudioPreview
              response={response}
              taskLabel={task.taskLabel}
              copy={copy}
            />
          </div>
        }
      />
    </ExamShell>
  );
}
