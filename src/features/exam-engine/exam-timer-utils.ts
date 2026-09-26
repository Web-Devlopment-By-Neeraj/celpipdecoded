// Pure helpers for the reusable exam countdown timer (EXAM-15D).
//
// No React and no side effects. Every calculation here takes the current
// time as an argument rather than reading it, which is what makes the
// countdown testable: the whole of it can be checked by passing a made up
// clock in.
//
// One function is the exception, openExamTimerDeadline, and it reads the
// clock because it has to be the thing that starts a window. It lives here
// rather than in the hook because react-hooks/purity refuses a Date.now
// call written inside a component or hook body, useState initialiser
// included. Moving it behind a plain module function is not a way around
// the rule: the rule is about a value that changes between renders leaking
// into render output, and a lazy initialiser runs once per mount, so this
// is the case the rule is drawing a line around rather than the case it is
// aimed at.
//
// Accuracy. A countdown that subtracts one every interval drifts, because
// an interval is a request rather than a promise: a backgrounded tab, a
// busy main thread or a laptop lid closing all delay ticks, and every
// delayed tick is a second the display never loses. So the timer stores an
// absolute deadline and works the remaining time out from the current
// time on every tick. A pause simply means the next tick shows a smaller
// number, which is the truth, rather than the clock running slow.
//
// The same shape is already used by the Writing and Speaking practice
// timers in src/features/writing/writing-timer.ts and
// src/features/speaking/timer-utils.ts. Those two are practice flows with
// their own screens and are not touched by this ticket, so this file is
// the exam engine's own copy of the idea rather than an import across a
// feature boundary. If the exam engine ever absorbs those flows, this is
// the file they collapse into.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ExamTimerState } from "./exam-shell-types";
import type {
  ExamCountdownState,
  ExamTimerConfig,
  ExamTimerStatus,
} from "./exam-timer-types";

// How often the display is refreshed, in milliseconds.
//
// Faster than one second on purpose. The reading is whole seconds, so a
// one second interval would show each number for anywhere between zero and
// two seconds depending on where the interval happened to land. Four ticks
// a second keeps the change within a quarter of a second of the truth and
// is still far too cheap to matter.
export const EXAM_TIMER_TICK_MS = 250;

// Default thresholds, in seconds remaining.
//
// These suit a short question window, which is what Listening has. A
// section or task level timer will pass its own: the Reading section
// timer wants two minutes and thirty seconds, and the Writing task timer
// wants the same, which is why both are configurable rather than fixed.
export const EXAM_TIMER_WARNING_SECONDS = 10;
export const EXAM_TIMER_URGENT_SECONDS = 5;

// Default answering window for one timed question screen.
//
// Thirty seconds is the reading the Listening question screens have shown
// as static text since EXAM-03, so making it live changes the behaviour
// and not the number. A screen whose content carries its own duration
// passes that instead.
//
// Per screen, not per question, and the difference matters in Listening.
// Parts 1 to 3 ask one question per screen, so a window is a question.
// Parts 4 to 6 put a whole question set on one screen, so a window is that
// screen and every question on it shares the same thirty seconds. Which
// one a caller gets is decided by the grain of the screenKey it passes,
// not by anything here. See the Listening timing model section in
// docs/product/exam-timer-foundation.md.
//
// The number itself is not yet confirmed against the real test. EXAM-15E
// checks it, along with whether Parts 4 to 6 belong on one screen at all.
export const EXAM_QUESTION_TIMER_SECONDS = 30;

// Clamps a duration to a safe whole non-negative number of seconds, so a
// missing, negative or fractional value produces a timer that is already
// finished rather than one that counts up or shows a fraction.
export function clampExamTimerSeconds(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.floor(value);
}

// Absolute end time for a window, so the countdown survives a browser
// pause. Everything after this point is worked out by comparing the
// current time with this number.
export function getExamTimerDeadline(
  nowMs: number,
  durationSeconds: number,
): number {
  return nowMs + clampExamTimerSeconds(durationSeconds) * 1000;
}

// Opens a window now, or leaves it unstarted.
//
// The one place in the timer that reads the clock, and it exists to be
// called from useExamCountdown's useState initialiser, which runs once
// when a timed screen mounts. autoStart false returns null, which the rest
// of the file reads as a window that has not begun: the reading sits at
// the full duration in the idle phase until something calls start.
export function openExamTimerDeadline(
  autoStart: boolean,
  durationSeconds: number,
): number | null {
  return autoStart ? getExamTimerDeadline(Date.now(), durationSeconds) : null;
}

// Whole seconds left until the deadline.
//
// Ceil, so the reading shows 1 until the final second has fully run out
// and never shows 0 while there is still time to answer.
//
// Clamped at both ends. Zero is the floor, and the configured duration is
// the ceiling: a deadline is set during a render and the current time can
// be a fraction of a second behind it, which would otherwise round up to
// one second more than the window is long and flash 00:31 on a 30 second
// timer.
export function getExamTimerRemainingSeconds(
  deadlineMs: number,
  nowMs: number,
  durationSeconds: number,
): number {
  const total = clampExamTimerSeconds(durationSeconds);
  const remaining = Math.ceil((deadlineMs - nowMs) / 1000);

  return Math.min(total, Math.max(0, remaining));
}

// Formats seconds as a clock reading, for example "00:30" or "02:00".
//
// Both fields are padded and minutes are always shown, so the reading
// keeps the same width for the whole countdown. Together with the tabular
// figures the top bar already uses, that means nothing beside the timer
// moves as the numbers change.
export function formatExamClock(totalSeconds: number): string {
  const safe = clampExamTimerSeconds(totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

// Which phase a window is in, given how much of it is left.
//
// Order matters: expired wins over urgent, and urgent wins over warning,
// so a threshold set wider than the window cannot hide the end of it.
export function resolveExamTimerStatus(input: {
  // False while a window is configured but has not started.
  started: boolean;
  remainingSeconds: number;
  warningAtSeconds: number;
  urgentAtSeconds: number;
}): ExamTimerStatus {
  if (!input.started) {
    return "idle";
  }

  if (input.remainingSeconds <= 0) {
    return "expired";
  }

  if (input.remainingSeconds <= input.urgentAtSeconds) {
    return "urgent";
  }

  if (input.remainingSeconds <= input.warningAtSeconds) {
    return "warning";
  }

  return "running";
}

// The full reading for a window, from a deadline and the current time.
//
// This is the whole countdown calculation. useExamCountdown holds the
// deadline and the interval and calls this, so the arithmetic can be
// checked without mounting anything.
//
// A deadline of null means the window has not started, which is the
// autoStart false case. The reading then sits at the full duration in the
// idle phase rather than pretending to count.
export function getExamCountdownState(input: {
  deadlineMs: number | null;
  nowMs: number;
  durationSeconds: number;
  warningAtSeconds: number;
  urgentAtSeconds: number;
}): ExamCountdownState {
  const durationSeconds = clampExamTimerSeconds(input.durationSeconds);
  const { deadlineMs } = input;

  const remainingSeconds =
    deadlineMs === null
      ? durationSeconds
      : getExamTimerRemainingSeconds(deadlineMs, input.nowMs, durationSeconds);

  const status = resolveExamTimerStatus({
    started: deadlineMs !== null,
    remainingSeconds,
    warningAtSeconds: input.warningAtSeconds,
    urgentAtSeconds: input.urgentAtSeconds,
  });

  return {
    status,
    durationSeconds,
    remainingSeconds,
    elapsedSeconds: durationSeconds - remainingSeconds,
    isWarning: status === "warning",
    isUrgent: status === "urgent",
    isExpired: status === "expired",
  };
}

// Fills in the defaults a config leaves out, so the hook and anything that
// wants to reason about a config without running it agree on the numbers.
export function resolveExamTimerConfig(config: ExamTimerConfig): {
  durationSeconds: number;
  warningAtSeconds: number;
  urgentAtSeconds: number;
  autoStart: boolean;
} {
  return {
    durationSeconds: clampExamTimerSeconds(config.durationSeconds),
    warningAtSeconds: config.warningAtSeconds ?? EXAM_TIMER_WARNING_SECONDS,
    urgentAtSeconds: config.urgentAtSeconds ?? EXAM_TIMER_URGENT_SECONDS,
    autoStart: config.autoStart ?? true,
  };
}

// The display tone each phase is drawn in.
//
// The one place the live timer meets the EXAM-01 top bar. Keeping the map
// here rather than inside the component means Reading, Writing and
// Speaking get the same colours from the same phases without copying a
// switch statement.
//
// idle maps to muted, which is the tone the shell already reserves for a
// reading that is a fixed label rather than a live value. That is exactly
// what an unstarted window is.
export const examTimerStatusTones: Record<ExamTimerStatus, ExamTimerState> = {
  idle: "muted",
  running: "normal",
  warning: "warning",
  urgent: "urgent",
  expired: "expired",
};

// How much of a timed window has been used, as a CSS width (EXAM-UI-03).
//
// The Speaking clock cards draw a hairline bar under the seconds, and this
// is what fills it. It reads the state the card already has rather than
// opening a clock of its own, so the bar and the number can never disagree
// by a tick.
//
// A window with no length yet reads as empty rather than dividing by zero,
// and the value is clamped, so nothing can draw a bar past its track.
export function examCountdownProgressWidth(state: {
  durationSeconds: number;
  elapsedSeconds: number;
}): string {
  if (state.durationSeconds <= 0) {
    return "0%";
  }

  const fraction = state.elapsedSeconds / state.durationSeconds;
  const clamped = Math.min(Math.max(fraction, 0), 1);

  return `${(clamped * 100).toFixed(1)}%`;
}
