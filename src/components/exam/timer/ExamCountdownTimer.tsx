"use client";

import { Fragment } from "react";
import { ExamTimerDisplay } from "../ExamTimerDisplay";
import { ExamTimerStatusText } from "./ExamTimerStatusText";
import { useExamCountdown } from "./useExamCountdown";
import { examCopy } from "@/features/exam-engine/exam-copy";
import {
  EXAM_QUESTION_TIMER_SECONDS,
  examTimerStatusTones,
  formatExamClock,
} from "@/features/exam-engine/exam-timer-utils";

// A live countdown in the exam top bar (EXAM-15D).
//
// The whole timer in one place: it runs the clock, formats the reading,
// picks the tone, and adds the single screen reader announcement. A screen
// hands it a screen key and a duration and is finished with the subject.
//
// It draws exactly what the fixed reading drew before it, in the same slot
// and at the same size, so the top bar does not change shape when a screen
// gains a timer. Three things keep it from moving as it counts:
//
// - the reading is zero padded, so 00:30 and 00:09 are the same width
// - the top bar already sets tabular figures, so the digits do not jiggle
// - only the colour changes at the thresholds, never the size or the
//   spacing
//
// "Time is up" replaces the whole reading, label included. It is shorter
// than the reading it replaces, so the bar can only get roomier at the end
// of a window, never tighter.
//
// What it does not do, because two tickets are explicit about it: no
// submitting, no advancing, no clearing of answers, no dialog, no sound,
// no flashing. Reaching zero changes the words in the bar and tells the
// caller. Everything else on the screen carries on as it was, and the
// learner's selection is untouched.
//
// TIMER-01 is where that became true everywhere. The full Listening run
// used to hand goNext to this component's onExpire, so a closing window
// moved the test on by itself. It no longer does, and no caller in the
// engine does anything at zero except raise a message that clears itself.

export type ExamCountdownTimerProps = {
  // Which timed screen this window belongs to. A new value starts a new
  // countdown, and nothing else does. See useExamCountdown.
  screenKey: string;
  // How long the window runs. Defaults to the standard question window.
  durationSeconds?: number;
  warningAtSeconds?: number;
  urgentAtSeconds?: number;
  autoStart?: boolean;
  // Label in front of the reading. Dropped once the window has closed,
  // because "Time remaining: Time is up" is not a sentence.
  label?: string;
  // Fired once when the window reaches zero. Every mock test section
  // passes one and every one of them does the same thing with it: raise
  // the shared time up message (TIMER-01). Nothing that navigates,
  // submits or clears an answer belongs here.
  onExpire?: () => void;
  className?: string;
};

// Resetting is a remount, and this is where it happens.
//
// Keying the inner component on the screen key is what starts a new window
// when the learner reaches a new timed screen, and it is why nothing else
// can: a re-render caused by choosing an option, by a parent's state
// changing or by anything else keeps the same key and therefore the same
// mounted window. useExamCountdown explains why the reset is a key rather
// than a recalculation inside the hook.
export function ExamCountdownTimer(props: ExamCountdownTimerProps) {
  return <ExamCountdownTimerWindow key={props.screenKey} {...props} />;
}

function ExamCountdownTimerWindow({
  screenKey,
  durationSeconds = EXAM_QUESTION_TIMER_SECONDS,
  warningAtSeconds,
  urgentAtSeconds,
  autoStart,
  label = examCopy.timeRemainingLabel,
  onExpire,
  className,
}: ExamCountdownTimerProps) {
  const countdown = useExamCountdown(
    {
      screenKey,
      durationSeconds,
      warningAtSeconds,
      urgentAtSeconds,
      autoStart,
      label,
    },
    onExpire,
  );

  return (
    <Fragment>
      <ExamTimerDisplay
        label={countdown.isExpired ? undefined : label}
        value={
          countdown.isExpired
            ? examCopy.timeExpiredValue
            : formatExamClock(countdown.remainingSeconds)
        }
        state={examTimerStatusTones[countdown.status]}
        // Silent on purpose. The announcement lives in the region below,
        // which speaks once instead of once a tick.
        live="off"
        className={className}
      />

      <ExamTimerStatusText
        status={countdown.status}
        expiredText={examCopy.timeExpiredValue}
      />
    </Fragment>
  );
}
