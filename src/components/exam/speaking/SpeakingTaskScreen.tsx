"use client";

import { useState } from "react";
import { ExamShell } from "../ExamShell";
import { ExamTwoColumnLayout } from "../ExamTwoColumnLayout";
import { SpeakingAudioPreview } from "./SpeakingAudioPreview";
import { SpeakingPrepTimer } from "./SpeakingPrepTimer";
import { SpeakingPromptPanel } from "./SpeakingPromptPanel";
import { SpeakingRecorder } from "./SpeakingRecorder";
import { SpeakingRecordingTimer } from "./SpeakingRecordingTimer";
import { examSpeaking } from "@/features/exam-engine/exam-theme";
import { playerTimerCard } from "@/features/exam-engine/mock-test-player-theme";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockRecording } from "./useSpeakingMockRecorder";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type {
  SpeakingRecordingErrorKind,
  SpeakingRecordingStatus,
  SpeakingResponse,
  SpeakingTaskContent,
} from "@/features/exam-engine/speaking-mock-types";

// The working screen for one Speaking task (EXAM-27).
//
// The prompt and its pictures on the left, and on the right the two
// clocks, the recorder and the playback of whatever was recorded. All
// eight Mock Test 1 tasks use this one screen, which is why there is no
// SpeakingTaskThreeScreen and no SpeakingTaskFiveScreen: the eight differ
// only in what their content object holds, and every one of those
// differences is already expressed there as an empty list or an unset
// field.
//
// The split is the shared ExamTwoColumnLayout, with the same division of
// scrolling the Writing task screen chose and for a related reason. The
// prompt column scrolls on its own, because Task 5 is a long situation
// and four option cards and would otherwise push the recorder off the
// screen. The answer column does not, because the Stop recording button
// must never be somewhere a learner has to scroll to find while a clock
// is running.
//
// What this screen owns, and why it is not more
// ---------------------------------------------
//
// Three pieces of state, all of them about the take in progress rather
// than about the recording that results:
//
// - status, which is what the recorder is doing right now
// - errorKind, which is why the last attempt failed, if it did
// - takeKey, which opens the recording window and is null when nothing is
//   recording
//
// All three are deliberately local, and all three are deliberately lost
// when the learner leaves the screen. A take in progress is not something
// to resume from another task: leaving unmounts the recorder, which stops
// the MediaRecorder and releases the microphone, so the honest thing for
// the screen to remember about it is nothing.
//
// The finished recording is the opposite, and lives one level up in
// SpeakingSectionPrototype. That is what makes it survive navigation: the
// prototype stays mounted for the whole section, so walking to the next
// task and back rebuilds this screen and leaves the audio exactly where
// it was.
//
// The preparation window ends when recording starts, whether or not it
// had run out, because at that point the learner is speaking rather than
// preparing. The recording window opens on the same event and closes when
// the take does. Neither clock does anything at zero except change its
// own reading.
//
// Next is never gated on a recording. A learner may leave a task with
// nothing recorded and still move on, which is the same rule every
// Reading and Writing screen in the engine follows: a screen that holds
// Next until an answer exists traps a learner whose microphone does not
// work.
//
// A client component, because pressing Start recording is an event
// handler and because the two clocks tick.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingTaskScreenProps = {
  task: SpeakingTaskContent;
  // The recording held for this task, which may be the empty response.
  response: SpeakingResponse;
  // Fired with a finished take. The screen above turns it into a
  // response, which is where the object URL is made.
  onRecorded: (recording: SpeakingMockRecording) => void;
  // What the countdowns key on. Pass the flow screen id, so the
  // preparation window belongs to the screen and nothing that happens on
  // it starts a new one.
  timerScreenKey?: string;
  // Fired once when either countdown on this screen reaches zero
  // (TIMER-01). The section above raises the shared time up message with
  // it. Neither window stops the recorder, advances the task or clears a
  // take, before or after it fires.
  onTimeExpire?: () => void;
  copy?: SpeakingMockCopy;
  metaText?: string;
  nextLabel?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function SpeakingTaskScreen({
  task,
  response,
  onRecorded,
  timerScreenKey,
  onTimeExpire,
  copy = speakingMockCopy,
  metaText,
  nextLabel,
  onNext,
  onBack,
  showBack = true,
}: SpeakingTaskScreenProps) {
  const [status, setStatus] = useState<SpeakingRecordingStatus>("idle");
  const [errorKind, setErrorKind] = useState<SpeakingRecordingErrorKind | null>(
    null,
  );
  const [takeKey, setTakeKey] = useState<string | null>(null);
  // How many takes have been started on this screen. It only exists to
  // make each take's window key different from the last one, so a
  // re-record opens a new window rather than resuming the old one.
  const [takeCount, setTakeCount] = useState(0);

  const hasRecording = response.audioUrl !== null && response.audioBlob !== null;

  const handleRequestStart = () => {
    // The permission prompt is opening. The previous failure goes now
    // rather than when the new take succeeds, so a learner who has fixed
    // a browser setting is not still reading the old message while the
    // prompt is open.
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

  // Preparation is over once a take has been started, and it stays over
  // for the rest of the visit to this screen. It does not come back for a
  // re-record: the learner has already had their planning window, and
  // restarting it would be a second preparation the source does not give.
  const preparationActive = takeCount === 0 && status === "idle";

  return (
    <ExamShell
      title={task.title}
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
        // No label over the prompt column (EXAM-UI-03). It opens with the
        // task itself, marked with the information glyph, so a small caps
        // YOUR TASK above that said the same thing twice. The answer
        // column keeps its label: it opens with two clock cards rather
        // than with a sentence, so the label is the only thing naming it.
        rightLabel={copy.recordColumnLabel}
        // Fixed heights, used only below the large breakpoint and on the
        // internal part routes, where there is no window height to fill.
        leftScroll="none"
        rightScroll="none"
        // Above that, each column takes the height of the content pane and
        // its own scrollbar (EXAM-UI-02). A task with a tall picture can
        // scroll its prompt without the recorder, the two clocks or the
        // preview player moving, which is what matters when the screen is
        // being spoken to rather than read. Stop recording is never below
        // the fold while a clock is running.
        fill
        bordered={false}
        left={<SpeakingPromptPanel task={task} copy={copy} />}
        right={
          <div className={examSpeaking.answerColumn}>
            <div className={playerTimerCard.row}>
              <SpeakingPrepTimer
                // The flow screen id, so the window belongs to the screen
                // and a re-render does not restart it.
                screenKey={`${timerScreenKey ?? task.taskId}-prep`}
                timer={task.prepTimer}
                active={preparationActive}
                // Preparation running out says so and stops there. The
                // learner presses Start recording when they are ready,
                // exactly as before (TIMER-01).
                onExpire={onTimeExpire}
                copy={copy}
              />

              <SpeakingRecordingTimer
                timer={task.responseTimer}
                runKey={takeKey}
                // The recording window running out says so and stops
                // there. The take is not stopped, the audio already
                // captured is kept, and Stop recording stays the
                // learner's to press (TIMER-01).
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
