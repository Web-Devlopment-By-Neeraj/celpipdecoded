// Learner facing wording for the practice test engine shell (EXAM-01).
//
// All exam chrome copy lives here so the frame, the timers, and the
// placeholders say the same thing everywhere. Wording follows the rules
// in docs/product/exam-engine-reference-audit.md section 9: this is
// CELPIP Decoded practice software, never the official CELPIP test.
//
// Strings and pure helpers only, no side effects, so this file is safe to
// import from a client component.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { PRACTICE_ESTIMATE_DISCLAIMER } from "@/features/dashboard/dashboard-copy";
import type { ExamMediaKind } from "./exam-shell-types";

export const examCopy = {
  // Approved product wording. Screen titles are built from these, never
  // from official test wording.
  engineName: "CELPIP Decoded practice test engine",
  practiceLabel: "CELPIP-style practice",
  practiceTestName: "CELPIP Decoded practice test",

  // Frame controls.
  nextLabel: "Next",
  backLabel: "Back",
  nextAriaLabel: "Go to the next screen",
  backAriaLabel: "Go back to the previous screen",

  // Timer labels used in the top bar.
  timeRemainingLabel: "Time remaining",
  preparationLabel: "Preparation",
  recordingLabel: "Recording",
  timeExpiredValue: "Time is up",

  // Shown once, in a small toast, when a mock test window reaches zero
  // (TIMER-01).
  //
  // The reading in the bar says "Time is up" and stops there, which is
  // true but silent about the thing a learner most needs to know at that
  // moment: nothing has been taken away and nothing has moved. So the
  // toast says it in a sentence. It is a message, not a decision: there
  // is no button on it, it clears itself after a few seconds, and the
  // screen behind it is exactly as it was.
  timeUpToastText: "Time is up. You can continue when you are ready.",

  // Instruction row.
  infoIconLabel: "Information",
  instructionsHeading: "Instructions:",

  // Dropdown completion questions (EXAM-UI-03). Defaults for the shared
  // player control. A section with its own wording, such as Listening,
  // passes its own and these are never read.
  selectAnswerLabel: "Select answer",
  dropdownBlankLabel: "blank",
  // Accessible name for a question that prints no sentence of its own,
  // which on the Reading side is a numbered blank inside a reply. A
  // screen reader gets "Question 7" rather than a bare number
  // (EXAM-UI-05).
  questionNumberLabel: "Question",

  // Audio visual card (EXAM-UI-03). The status word under the speaker
  // mark, and the line saying the bar is a practice aid.
  //
  // The note is deliberate and it is ours. A practice simulator that
  // shows a scrub bar has to say that the real thing does not, because a
  // learner who practises with one will expect one. No official wording
  // is reproduced to say it.
  audioReadyLabel: "Ready to play",
  audioPlayingLabel: "Playing...",
  audioPausedLabel: "Paused",
  audioEndedLabel: "Finished",
  audioPlaybarNote: "This playbar will not appear in the official test.",

  // Media placeholder. A fixed duration on an inert transport strip, so
  // the grey audio and video boxes look like the real thing without any
  // player behind them.
  mediaPlaceholderTime: "0:00",

  // Instruction and instructional video screens (EXAM-02).
  instructionalVideoLabel: "Instructional video",
  continueWhenReadyLabel: "Continue when you are ready",
  skipVideoLabel: "Skip video",
  // Accessible name for the player, so a screen reader announces the clip
  // rather than an unlabelled media element.
  videoPlayerLabel: "Instructional video player",
  // Shown in the player area when the clip cannot load, for example a
  // missing file or a dropped connection.
  videoFallbackHeading: "This video cannot be played right now",
  videoFallbackText:
    "Check your connection and reload the page to try again. You can continue when you are ready.",
  // Shown by a browser that cannot play video at all.
  videoUnsupportedText:
    "Your browser cannot play this instructional video. You can continue when you are ready.",
  // Shown under the stage when the browser blocked the clip from starting
  // on its own (EXAM-15F). Browser autoplay policies can refuse a clip
  // with sound even after a click elsewhere on the page, so the screen
  // says what to do rather than sitting on a still frame.
  videoAutoplayBlockedText:
    "This video did not start on its own. Press play to begin.",

  // Internal preview routes. This wording marks the previews as staff
  // facing pages, so nobody mistakes one for a practice test.
  previewBadge: "Internal preview",
  previewTitle: "Practice test shell preview",
  previewSummary:
    "Internal preview of the practice test screen shell. Layout only, with placeholder text in every sample. No practice test content, no official screenshot, and no CELPIP branding appears here.",
  instructionPreviewTitle: "Practice test instruction screens preview",
  instructionPreviewSummary:
    "Internal preview of the instruction and instructional video screens. Layout only, with placeholder instruction text. The instructional videos are the real licensed clips, and no practice test content, official screenshot, or CELPIP branding appears here.",

  // The one estimate disclaimer used across the app. Reused, not
  // rewritten, so the exam engine and the dashboard cannot drift.
  practiceEstimateDisclaimer: PRACTICE_ESTIMATE_DISCLAIMER,
} as const;

// Default label and helper text per placeholder media kind. A screen can
// override either one.
export const examMediaCopy: Record<
  ExamMediaKind,
  { label: string; helper: string }
> = {
  audio: {
    label: "Audio clip",
    helper:
      "Audio placeholder. The practice test player is added in a later ticket.",
  },
  video: {
    label: "Video clip",
    helper:
      "Video placeholder. The practice test player is added in a later ticket.",
  },
  image: {
    label: "Image",
    helper:
      "Image placeholder. Practice test images are added in a later ticket.",
  },
};

// Question position line, for example Question 3 of 8.
export function formatExamProgress(current: number, total: number): string {
  return `Question ${current} of ${total}`;
}

// Timer reading, for example Time remaining: 9 minutes.
export function formatExamTimerReading(label: string, value: string): string {
  return `${label}: ${value}`;
}
