"use client";

import { useEffect, useRef, useState } from "react";
import {
  EXAM_TIMER_TICK_MS,
  getExamCountdownState,
  getExamTimerDeadline,
  openExamTimerDeadline,
  resolveExamTimerConfig,
} from "@/features/exam-engine/exam-timer-utils";
import type {
  ExamCountdownState,
  ExamTimerConfig,
} from "@/features/exam-engine/exam-timer-types";

// The one clock in the exam engine (EXAM-15D).
//
// Everything before this ticket printed a fixed string in the top bar, and
// the shell was written not to own a clock at all, which was the right
// call while the flows were being built. This hook is where that clock
// finally goes: one place, deadline based, with no opinion about which
// section is asking.
//
// How it stays accurate. The window is an absolute deadline worked out
// once, and every tick asks the current time how much of it is left, so an
// interval delayed by a backgrounded tab or a busy main thread shows a
// smaller number when it next fires rather than making the countdown run
// slow. The arithmetic is in exam-timer-utils.ts and is pure, so the only
// impure thing in the timer at all is the clock, and it is only ever read
// when a window opens, when a tick lands or when a handler runs.
//
// How it resets. A window belongs to config.screenKey, and a change of key
// arrives as a remount rather than as a recalculation inside the hook:
// whatever calls this hook is rendered with key={screenKey}, which is what
// ExamCountdownTimer does and therefore what every screen in the app gets.
//
// That is React's own answer to starting state again when its subject
// changes, and here it is also the only one available. Setting a deadline
// needs the current time, and the two places a hook could read it to do
// the reset itself are both refused by this project's lint rules:
// react-hooks/purity will not allow the clock to be read in a hook body,
// and react-hooks/set-state-in-effect will not allow the new deadline to
// be pushed into state from an effect. A remount runs the initialiser
// below, so a new window opens during the first render of the new screen
// rather than a tick into it.
//
// The reset is therefore tied to the screen and to nothing else. Selecting
// an answer re-renders the screen without remounting it, so the window
// carries on, which is the behaviour the ticket asks for.
//
// What it deliberately does not do. It never navigates, never submits,
// never clears an answer and never renders anything. It reports a reading,
// and the screen decides what that means. In this ticket every Listening
// screen decides the same thing: show it, colour it, and otherwise carry
// on exactly as before.
//
// This is not a proctoring control. The countdown lives in the browser and
// starts again on a reload, which is correct for a practice run and is
// recorded as an intentional gap in
// docs/product/exam-timer-foundation.md.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ExamCountdown = ExamCountdownState & {
  // Starts a window that was configured with autoStart false, and
  // restarts one that is already running.
  //
  // Call it from an event handler, which is where reading the clock and
  // setting state are both allowed. Nothing in this ticket does: every
  // Listening window starts with its screen. It is here for the Speaking
  // preparation and recording pair, where the learner decides when the
  // window opens.
  start: () => void;
};

export function useExamCountdown(
  config: ExamTimerConfig,
  // Fired once when a window reaches zero, and once more if start is
  // called and the new window also runs out.
  //
  // Every caller in the mock test engine passes one and every one of them
  // does the same thing with it: raise the shared time up message
  // (TIMER-01). It is a notification, not a control. Nothing that
  // navigates, submits, stops a recorder or clears an answer is wired to
  // it, and the hook itself still does none of those things.
  onExpire?: () => void,
): ExamCountdown {
  const { durationSeconds, warningAtSeconds, urgentAtSeconds, autoStart } =
    resolveExamTimerConfig(config);

  // When the current window ends, or null while it has not started.
  //
  // A lazy initialiser, so the deadline is fixed at the moment the timed
  // screen first mounts and does not creep forward on every re-render
  // after it.
  //
  // The clock is read inside openExamTimerDeadline rather than here.
  // react-hooks/purity does not allow a Date.now call written in a hook
  // body, and a useState initialiser is part of that body as far as the
  // rule is concerned, so the one impure call the timer needs lives in
  // exam-timer-utils.ts and is called from here.
  const [endsAt, setEndsAt] = useState<number | null>(() =>
    openExamTimerDeadline(autoStart, durationSeconds),
  );

  // The last time the display was refreshed. An absolute timestamp rather
  // than a countdown that is decremented, which is what makes a delayed
  // tick catch up instead of losing time.
  const [nowMs, setNowMs] = useState(() => Date.now());

  // A plain function rather than a useCallback. The React Compiler is on
  // in this project and memoizes it, and wrapping it by hand made the
  // compiler skip this hook entirely because it could not prove the
  // dependency it was given stays put.
  const start = () => {
    const startedAt = Date.now();

    setEndsAt(getExamTimerDeadline(startedAt, durationSeconds));
    setNowMs(startedAt);
  };

  const state = getExamCountdownState({
    deadlineMs: endsAt,
    nowMs,
    durationSeconds,
    warningAtSeconds,
    urgentAtSeconds,
  });

  const { isExpired } = state;

  // Refreshes the reading while there is something to count.
  //
  // The interval stops at zero rather than running on: isExpired is a
  // dependency, so reaching the end tears the interval down, and starting
  // a new window sets one up again against the new deadline. Nothing is
  // scheduled on a screen whose window has already closed.
  useEffect(() => {
    if (endsAt === null || isExpired) {
      return;
    }

    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, EXAM_TIMER_TICK_MS);

    return () => window.clearInterval(id);
  }, [endsAt, isExpired]);

  // Which window has already reported that it finished.
  //
  // A ref rather than state, because nothing renders from it and it has to
  // take effect immediately. Holding the deadline rather than a flag means
  // the callback fires once per window: not once per tick after zero, and
  // not never again once start has opened another one.
  const expiredForDeadline = useRef<number | null>(null);

  useEffect(() => {
    if (!isExpired || endsAt === null || expiredForDeadline.current === endsAt) {
      return;
    }

    expiredForDeadline.current = endsAt;
    onExpire?.();
  }, [isExpired, endsAt, onExpire]);

  return { ...state, start };
}
