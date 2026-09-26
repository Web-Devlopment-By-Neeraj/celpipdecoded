// Types for the reusable exam countdown timer (EXAM-15D).
//
// This file holds types only, no runtime values, so it can be imported
// from a server component or a client component without pulling any
// behaviour along with it. Same rule the EXAM-01 shell types follow.
//
// The timer foundation is deliberately generic. Listening is the first
// caller and the only one wired up in this ticket, but nothing here names
// Listening, a question, or a part, so the Reading section timer, the
// Writing task timer and the Speaking preparation and recording pair can
// all be built on it later without a second clock appearing in the
// codebase.
//
// Two names that are easy to confuse, and are separate on purpose:
//
// - ExamTimerState in exam-shell-types.ts is a display tone. It says how a
//   reading in the top bar should look, and it existed before this ticket.
// - ExamCountdownState below is a live reading. It says how much time is
//   left and which phase the window is in.
//
// The bridge between them is examTimerStatusTones in exam-timer-utils.ts.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Which phase a timed window is in.
//
// - idle: configured but not started, for example a timer waiting on a
//   learner pressing Start. Nothing counts down.
// - running: counting down, with more than the warning threshold left
// - warning: inside the warning threshold, the window is closing
// - urgent: inside the urgent threshold, the window is about to close
// - expired: the window has run out
//
// warning and urgent are separate phases rather than two flags on one
// running phase, so a screen can switch on the status alone and cannot
// draw a combination that does not exist.
export type ExamTimerStatus =
  | "idle"
  | "running"
  | "warning"
  | "urgent"
  | "expired";

// What a screen declares about one timed window.
//
// Plain data, so a flow file, a content file or a screen component can all
// produce one. The callback that fires at zero is not in here: it is a
// function rather than data, and it is passed to useExamCountdown
// separately so a config object stays serializable.
export type ExamTimerConfig = {
  // How long the window runs. Clamped to a whole non-negative number of
  // seconds by the utils, so a bad value produces an expired timer rather
  // than a broken one.
  durationSeconds: number;

  // Seconds remaining at which the reading turns to the warning tone.
  // Defaults to EXAM_TIMER_WARNING_SECONDS.
  warningAtSeconds?: number;

  // Seconds remaining at which the reading turns to the urgent tone.
  // Defaults to EXAM_TIMER_URGENT_SECONDS.
  urgentAtSeconds?: number;

  // Whether the window starts as soon as the screen appears. Defaults to
  // true, which is what every Listening question screen wants. A Speaking
  // recording window will want false, so the clock waits for the learner.
  autoStart?: boolean;

  // Label in front of the reading, for example "Time remaining". Read by
  // the component rather than by the hook, and carried here so one config
  // object fully describes a timer.
  label?: string;

  // Which timed screen this window belongs to.
  //
  // The one input that decides when the countdown restarts. A new value
  // starts a new window, and any other change, including a learner picking
  // an answer and the re-render that follows it, leaves the running window
  // alone. Use something stable and unique to the screen: a flow screen
  // id, or a part id joined to a question id.
  screenKey: string;
};

// A live reading from a timed window.
//
// remainingSeconds is what the top bar prints, status is what colours it,
// and the three booleans are the same information in the form a screen
// usually wants to branch on. They are derived from status rather than
// tracked separately, so they cannot disagree with it.
export type ExamCountdownState = {
  status: ExamTimerStatus;
  // The configured length of the window, after clamping.
  durationSeconds: number;
  // Whole seconds left, never below zero and never above durationSeconds.
  remainingSeconds: number;
  // Whole seconds used so far, which is durationSeconds minus
  // remainingSeconds.
  elapsedSeconds: number;
  isWarning: boolean;
  isUrgent: boolean;
  isExpired: boolean;
};
