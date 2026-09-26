"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type {
  RecordedAudio,
  RecordingState,
} from "@/features/speaking/audio-utils";
import {
  practiceCopy,
  recordingCopy,
  type PracticePhase,
  type PracticeTask,
} from "@/features/speaking/practice-flow";
import { submitRecording } from "@/features/speaking/recording-upload";
import {
  getDeadline,
  getRemainingSeconds,
} from "@/features/speaking/timer-utils";
import { AudioPlaybackCard } from "./AudioPlaybackCard";
import { AudioRecorder } from "./AudioRecorder";
import { PracticeCompletionCard } from "./PracticeCompletionCard";
import { PracticeControls } from "./PracticeControls";
import { PracticePhaseCard } from "./PracticePhaseCard";
import { PracticePromptCard } from "./PracticePromptCard";
import { PracticeTimer } from "./PracticeTimer";
import { RecordingStatusCard } from "./RecordingStatusCard";
import { RecordingSuccessCard } from "./RecordingSuccessCard";
import { SubmitRecordingButton } from "./SubmitRecordingButton";
import { useAudioRecorder } from "./useAudioRecorder";

// Client shell for the timed practice flow. Owns the phase state, the
// countdown, and the recording lifecycle, and receives only safe task
// data from the server page. Recording starts together with speaking
// time: the speaking timer does not begin until the microphone is live.
export function TimedPracticeShell({ task }: { task: PracticeTask }) {
  const [phase, setPhase] = useState<PracticePhase>("intro");
  const [remaining, setRemaining] = useState(task.prepSeconds);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recording, setRecording] = useState<
    (RecordedAudio & { url: string }) | null
  >(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  // Attempt id returned by a successful upload, needed by the success
  // card so the student can generate a transcript for that attempt.
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Tracks the playback object URL so it can be revoked on re-record
  // and on unmount without an extra render.
  const playbackUrlRef = useRef<string | null>(null);

  const releasePlaybackUrl = () => {
    if (playbackUrlRef.current) {
      URL.revokeObjectURL(playbackUrlRef.current);
      playbackUrlRef.current = null;
    }
  };

  useEffect(() => releasePlaybackUrl, []);

  // Called when the recorder delivers the final audio, whether the
  // student stopped it or speaking time ran out. Receiving the audio
  // ends the speaking phase and moves into review.
  const handleRecorded = (
    blob: Blob,
    mimeType: string,
    durationSeconds: number,
  ) => {
    releasePlaybackUrl();
    const url = URL.createObjectURL(blob);
    playbackUrlRef.current = url;
    setRecording({ blob, mimeType, durationSeconds, url });
    setRecordingState("recorded");
    setRecordingError(null);
    setPhase("complete");
  };

  const handleRecordingError = (message: string) => {
    setRecordingState("error");
    setRecordingError(message);
  };

  // start and stop have stable identities, so the countdown effect can
  // depend on stopRecorder without resetting its deadline on re-render.
  const { start: startRecorder, stop: stopRecorder } = useAudioRecorder({
    onRecorded: handleRecorded,
    onError: handleRecordingError,
  });

  // Starting a timed phase resets the countdown in the same click, so
  // the countdown effect below only has to run the interval.
  const startPreparation = () => {
    setRemaining(task.prepSeconds);
    setPhase("preparation");
  };

  const skipPreparation = () => {
    setPhase("ready_to_speak");
  };

  // Starts recording first and only then starts the speaking timer, so
  // no speaking time is lost to the microphone permission prompt. On
  // failure the student stays in ready_to_speak with a retry action.
  const startSpeaking = async () => {
    if (
      recordingState === "requesting_permission" ||
      recordingState === "recording"
    ) {
      return;
    }
    setRecordingError(null);
    setRecordingState("requesting_permission");

    const started = await startRecorder();
    if (!started) {
      return;
    }

    setRecordingState("recording");
    setRemaining(task.speakingSeconds);
    setPhase("speaking");
  };

  // Runs the countdown for the two timed phases. The deadline is an
  // absolute timestamp so the timer stays accurate even when interval
  // ticks are delayed, for example on a backgrounded mobile browser.
  useEffect(() => {
    if (phase !== "preparation" && phase !== "speaking") {
      return;
    }

    const total =
      phase === "preparation" ? task.prepSeconds : task.speakingSeconds;
    const deadline = getDeadline(Date.now(), total);

    const id = window.setInterval(() => {
      const left = getRemainingSeconds(deadline, Date.now());
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(id);
        if (phase === "speaking") {
          // Speaking time is over: stop the recorder and wait for it
          // to deliver the final audio. Nothing is auto-submitted.
          stopRecorder();
          setPhase("complete");
        } else {
          setPhase("ready_to_speak");
        }
      }
    }, 250);

    return () => window.clearInterval(id);
  }, [phase, task.prepSeconds, task.speakingSeconds, stopRecorder]);

  // Re-recording clears the previous take and restarts speaking time,
  // so the new take happens under the same timed conditions. It routes
  // through ready_to_speak so a mic failure lands on the retry screen.
  const handleReRecord = () => {
    releasePlaybackUrl();
    setRecording(null);
    setRecordingState("idle");
    setRecordingError(null);
    setPhase("ready_to_speak");
    void startSpeaking();
  };

  const handleSubmit = async () => {
    if (!recording || recordingState === "uploading") {
      return;
    }
    setRecordingState("uploading");
    setRecordingError(null);

    const result = await submitRecording({
      taskId: task.id,
      moduleId: task.moduleId,
      blob: recording.blob,
      mimeType: recording.mimeType,
      durationSeconds: recording.durationSeconds,
    });

    if (result.ok) {
      setAttemptId(result.attemptId);
      setRecordingState("uploaded");
    } else {
      // Keep the recording so the student can retry the submission.
      setRecordingState("recorded");
      setRecordingError(result.message);
    }
  };

  // Timer display for phases without a running countdown: intro shows
  // the full preparation time, ready_to_speak the full speaking time.
  const timerIsRunning = phase === "preparation" || phase === "speaking";
  const showsSpeakingTime = phase === "ready_to_speak" || phase === "speaking";
  const timerLabel = showsSpeakingTime
    ? practiceCopy.speakingTimerLabel
    : practiceCopy.prepTimerLabel;
  const timerTotal = showsSpeakingTime
    ? task.speakingSeconds
    : task.prepSeconds;
  const timerSeconds = timerIsRunning ? remaining : timerTotal;

  // The recorder is still delivering audio for a brief moment after
  // speaking time ends, so the complete phase waits for it.
  const recorderIsFinishing = recordingState === "recording";

  // Mic status shown while the student is getting ready to speak, so
  // permission progress and errors are visible before the timer runs.
  const showMicStatus =
    phase === "ready_to_speak" &&
    (recordingState === "requesting_permission" || recordingState === "error");

  const renderCompletePhase = () => {
    if (recordingState === "uploaded" && attemptId) {
      return <RecordingSuccessCard taskId={task.id} attemptId={attemptId} />;
    }

    if (recorderIsFinishing) {
      return (
        <RecordingStatusCard
          state={recordingState}
          errorMessage={null}
          elapsedSeconds={0}
          finishing
        />
      );
    }

    if (recording) {
      return (
        <div className="space-y-5">
          <AudioPlaybackCard
            audioUrl={recording.url}
            durationSeconds={recording.durationSeconds}
          />
          {recordingError && (
            <p
              role="alert"
              className="rounded-2xl bg-red-50 p-4 text-center text-sm leading-6 text-red-800 ring-1 ring-red-200"
            >
              {recordingError}
            </p>
          )}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <SubmitRecordingButton
              uploading={recordingState === "uploading"}
              onSubmit={handleSubmit}
            />
            <button
              type="button"
              onClick={handleReRecord}
              disabled={recordingState === "uploading"}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-brand ring-1 ring-brand/30 transition-colors hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {recordingCopy.reRecord}
            </button>
          </div>
        </div>
      );
    }

    return <PracticeCompletionCard taskId={task.id} />;
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <nav
        aria-label="Practice navigation"
        className="flex flex-wrap items-center gap-x-5 gap-y-2"
      >
        <Link
          href={`/dashboard/speaking/tasks/${task.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          <span aria-hidden>&larr;</span>
          {practiceCopy.backToTask}
        </Link>
        <Link
          href="/dashboard/speaking"
          className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          {practiceCopy.backToTasks}
        </Link>
      </nav>

      <article className="mt-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
          {practiceCopy.screenBadge} - Task {task.taskNumber}
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {task.title}
        </h1>

        <div className="mt-6 space-y-5">
          <PracticePhaseCard phase={phase} />

          {phase === "complete" ? (
            renderCompletePhase()
          ) : (
            <>
              <PracticeTimer
                label={timerLabel}
                seconds={timerSeconds}
                totalSeconds={timerTotal}
                running={timerIsRunning}
              />
              <PracticePromptCard prompt={task.prompt} />
              {phase === "speaking" && (
                <AudioRecorder
                  recordingState={recordingState}
                  errorMessage={recordingError}
                  elapsedSeconds={Math.max(0, task.speakingSeconds - remaining)}
                  onStop={stopRecorder}
                />
              )}
              {showMicStatus && (
                <RecordingStatusCard
                  state={recordingState}
                  errorMessage={recordingError}
                  elapsedSeconds={0}
                />
              )}
              <PracticeControls
                phase={phase}
                micRequesting={recordingState === "requesting_permission"}
                micError={recordingState === "error"}
                onStartPreparation={startPreparation}
                onSkipPreparation={skipPreparation}
                onStartSpeaking={() => void startSpeaking()}
              />
            </>
          )}
        </div>
      </article>
    </div>
  );
}
