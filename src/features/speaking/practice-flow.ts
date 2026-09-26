// Phase model and copy for the timed speaking practice flow.
// The flow is a simple forward-only state machine:
// intro -> preparation -> ready_to_speak -> speaking -> complete

export const PRACTICE_PHASES = [
  "intro",
  "preparation",
  "ready_to_speak",
  "speaking",
  "complete",
] as const;

export type PracticePhase = (typeof PRACTICE_PHASES)[number];

// Safe task data passed from the server page into the client timer shell.
// This is the only task shape client components should receive.
export type PracticeTask = {
  id: string;
  moduleId: string;
  title: string;
  prompt: string;
  taskType: string;
  taskNumber: number;
  prepSeconds: number;
  speakingSeconds: number;
  scoringFocus: string[];
};

// Fallback timings used only if a task row is missing its details.
// Seeded tasks always have speaking_task_details, so these are a guard.
export const DEFAULT_PREP_SECONDS = 30;
export const DEFAULT_SPEAKING_SECONDS = 60;

// Student facing copy for the practice screen, kept in one place so
// wording can be edited without touching components.
export const practiceCopy = {
  screenBadge: "Timed practice",
  startPreparation: "Start preparation",
  skipPreparation: "Skip preparation",
  startSpeaking: "Start speaking time",
  backToTask: "Back to task",
  practiceAnotherTask: "Practice another task",
  backToTasks: "Back to speaking tasks",
  completionHeading: "Timed practice complete",
  completionText:
    "This session ended without a saved recording. Run the timed practice again and record your answer during speaking time to save a response.",
  prepTimerLabel: "Preparation time",
  speakingTimerLabel: "Speaking time",
  preparationWaitNote:
    "Speaking time will unlock when preparation time ends.",
  introRecordingNote:
    "Recording starts automatically when your speaking time begins. Your recording stays private in your practice account.",
  readyToSpeakNote:
    "Your microphone turns on and recording starts automatically when speaking time begins.",
} as const;

// Student facing copy for the recording and upload flow.
export const recordingCopy = {
  sectionLabel: "Record your speaking answer",
  privacyNote: "Your recording stays private in your practice account.",
  stopRecording: "Stop recording",
  tryRecordingAgain: "Try again",
  reRecord: "Re-record answer",
  submitRecording: "Submit recording",
  submitting: "Saving your recording",
  playbackHeading: "Review your recording",
  playbackNote:
    "Listen to your answer. You can re-record before you submit.",
  recordedLengthLabel: "Recorded length",
  successHeading: "Recording saved",
  successText:
    "Your speaking response has been saved. Submit it for feedback to receive AI-supported practice feedback with an estimated practice level.",
  statusIdle: "Recording starts automatically when speaking time begins.",
  statusRequesting:
    "Waiting for microphone access. Please allow microphone use in your browser.",
  statusRecording: "Recording in progress",
  statusFinishing: "Finishing your recording.",
  statusRecorded: "Recording complete. Review your answer below.",
  statusUploading: "Saving your recording. Please keep this page open.",
  statusUploaded: "Recording saved.",
  errors: {
    notSupported:
      "Audio recording is not available in this browser. Please open this page in an up to date browser such as Chrome or Safari.",
    permissionDenied:
      "Microphone access was blocked. Please allow microphone access in your browser settings and try again.",
    recordingFailed:
      "We could not complete your recording. Please try again.",
    uploadFailed:
      "We could not upload your recording. Please check your connection and try again.",
    attemptSaveFailed:
      "We could not save your practice attempt. Please try again.",
    sessionExpired:
      "Your session has ended. Please sign in again to submit your recording.",
  },
} as const;

// Student facing copy for the transcription step. Server code reuses
// the error messages so the API and the UI always say the same thing.
export const transcriptCopy = {
  generate: "Generate transcript",
  generating: "Preparing your transcript",
  generatingNote:
    "This usually takes a few seconds. Please keep this page open.",
  readyHeading: "Transcript ready",
  readyText:
    "Your transcript is ready. AI-supported feedback will be added in the next step.",
  transcriptLabel: "Your transcript",
  tryAgain: "Try again",
  errors: {
    invalidRequest:
      "We could not read that request. Please refresh the page and try again.",
    sessionExpired:
      "Your session has ended. Please sign in again to generate your transcript.",
    requestFailed:
      "We could not generate your transcript. Please try again.",
    attemptNotFound:
      "We could not find this practice attempt. Please record a new answer.",
    attemptNotOwned:
      "This practice attempt does not belong to your account.",
    audioMissing:
      "This attempt does not have a saved recording, so it cannot be transcribed. Please record a new answer.",
    audioDownloadFailed:
      "We could not load your saved recording. Please try again.",
    notConfigured:
      "Transcription is not available right now. Please try again later.",
    transcriptionFailed:
      "We could not transcribe your recording. Please try again.",
    transcriptSaveFailed:
      "We could not save your transcript. Please try again.",
  },
} as const;

// Student facing copy for the AI feedback step. Server code reuses the
// error messages so the API and the UI always say the same thing.
export const feedbackCopy = {
  submit: "Submit for feedback",
  working: "Preparing your feedback",
  tryAgain: "Try again",
  processingHeading: "Preparing your speaking feedback",
  processingText:
    "We are reviewing your recorded answer and preparing detailed practice feedback. This can take up to a minute. Please keep this page open.",
  errors: {
    invalidRequest:
      "We could not read that request. Please refresh the page and try again.",
    sessionExpired:
      "Your session has ended. Please sign in again to get your feedback.",
    requestFailed:
      "We could not prepare your feedback. Please try again.",
    attemptNotFound:
      "We could not find this practice attempt. Please record a new answer.",
    attemptNotOwned:
      "This practice attempt does not belong to your account.",
    audioMissing:
      "This attempt does not have a saved recording, so it cannot be reviewed. Please record a new answer.",
    taskMissing:
      "We could not load the task for this attempt. Please try again.",
    notConfigured:
      "Feedback is not available right now. Please try again later.",
    scoringFailed:
      "We could not prepare feedback for this answer. Please try again.",
    scoreSaveFailed:
      "We could not save your feedback. Please try again.",
  },
} as const;

// Student facing copy for the attempt result page.
export const resultCopy = {
  pageBadge: "Practice feedback",
  pageHeading: "Your speaking feedback",
  readyText: "Your practice feedback is ready.",
  levelHeading: "Estimated practice level",
  levelScale: "out of 12",
  practiceEstimateNote:
    "This estimated level is a CELPIP Decoded practice guide. It is not an official CELPIP score.",
  skillBreakdownHeading: "Skill breakdown",
  skillScoreScale: "/ 12",
  improvementLabel: "Try this next",
  strengthsHeading: "What you did well",
  improvementsHeading: "What to improve next",
  nextStepsHeading: "Your next steps",
  badgeHeading: "Practice badge",
  badgeEmptyText: "Complete feedback to earn a practice badge.",
  transcriptHeading: "Transcript of your answer",
  transcriptNote:
    "This transcript is generated from your recording and may not be perfect. It is used to support your practice feedback.",
  actionsLabel: "Continue practicing",
  practiceAnotherTask: "Practice another task",
  backToTasks: "Back to speaking tasks",
  tryTaskAgain: "Try this task again",
  notReadyHeading: "Your feedback is not ready yet",
  notReadyText:
    "This attempt does not have feedback yet. Return to your recording and choose Submit for feedback, or start a new practice session.",
  failedHeading: "We could not prepare this feedback",
  failedText:
    "Something went wrong while preparing feedback for this attempt. Please return to your recording and submit it again, or start a new practice session.",
} as const;

// Label and next-step hint shown for each phase.
export type PracticePhaseInfo = {
  label: string;
  hint: string;
};

export const practicePhaseInfo: Record<PracticePhase, PracticePhaseInfo> = {
  intro: {
    label: "Get ready",
    hint: "Read the practice prompt, then start your preparation time.",
  },
  preparation: {
    label: "Preparation time",
    hint: "Plan your answer. The next step starts when the timer ends.",
  },
  ready_to_speak: {
    label: "Ready to speak",
    hint: "Recording starts automatically when you start your speaking time.",
  },
  speaking: {
    label: "Speaking time",
    hint: "Speak your answer out loud. Recording stops when the timer ends, or you can stop early.",
  },
  complete: {
    label: "Practice complete",
    hint: "You finished the timed flow for this task.",
  },
};

// Step position for the phase indicator, for example "Step 2 of 4".
// intro and preparation share a step because intro is just the gate
// that starts preparation.
const PHASE_STEPS: Record<PracticePhase, number> = {
  intro: 1,
  preparation: 2,
  ready_to_speak: 3,
  speaking: 4,
  complete: 4,
};

export const PRACTICE_STEP_COUNT = 4;

export function getPhaseStep(phase: PracticePhase): number {
  return PHASE_STEPS[phase];
}

// The phase that follows a finished countdown or a user action.
export function getNextPhase(phase: PracticePhase): PracticePhase | null {
  const index = PRACTICE_PHASES.indexOf(phase);
  if (index < 0 || index >= PRACTICE_PHASES.length - 1) {
    return null;
  }
  return PRACTICE_PHASES[index + 1];
}
