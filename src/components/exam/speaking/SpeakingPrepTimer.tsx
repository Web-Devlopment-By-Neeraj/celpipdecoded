"use client";

import { useExamCountdown } from "../timer/useExamCountdown";
import { cx } from "@/features/design/design-tokens";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { examSpeakingTimerStates } from "@/features/exam-engine/exam-theme";
import { playerTimerCard } from "@/features/exam-engine/mock-test-player-theme";
import {
  examCountdownProgressWidth,
  examTimerStatusTones,
  formatExamClock,
} from "@/features/exam-engine/exam-timer-utils";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingTaskTimer } from "@/features/exam-engine/speaking-mock-types";

// The preparation countdown on a Speaking task screen (EXAM-27).
//
// Why this is a card in the canvas rather than a reading in the top bar
// ---------------------------------------------------------------------
//
// Every other section puts its clock in the thin top bar strip, because
// in Listening, Reading and Writing the clock is a constraint on work the
// learner is already doing. In Speaking the clock is the instruction:
// there is a window to plan in and then a window to speak in, and the
// change from one to the other is the whole structure of the task. The
// source screens agree, and they are the reference this engine is built
// against: the Mock Test 1 Task 3, Task 4 and Task 8 prompt images all
// show a large "Preparation Time" panel sitting beside the picture, not a
// line of small text above it.
//
// So the two Speaking clocks are cards in the answer column, at a size a
// speaker can read at a glance, and the top bar carries no timer on a
// Speaking task screen. There is one clock per window and it is drawn
// once, which is the other half of the reason: two components counting
// the same window would open two deadlines and fire two expiry callbacks.
//
// It still owns no arithmetic. useExamCountdown is the one clock in the
// engine and this is a caller of it, exactly as ExamCountdownTimer in the
// top bar is. Its own note says it was written for this pair.
//
// Resetting is a remount, which is why the exported component wraps an
// inner one keyed on screenKey. That is the pattern ExamCountdownTimer
// established and the reason useExamCountdown gives for it: the project's
// lint rules refuse both a clock read in a hook body and a state push
// from an effect, so a new window has to arrive as a new mount.
//
// What happens at zero: the reading becomes "Time is up" and a quiet line
// underneath says that nothing stops and nothing is deleted. Nothing else
// happens. No recording starts, no screen advances and nothing is
// submitted, which is what the ticket asks a prototype timer to do.
//
// TIMER-01 added onExpire, and it is worth being clear about what it is
// for. It is a notification, not a control: the section prototype passes a
// handler that raises the shared time up message and does nothing else.
// The preparation window closing still starts no recording and moves no
// screen, and this component would not know how to do either.
//
// The preparation window ends early when recording starts, because at
// that point the learner is speaking rather than preparing. The card then
// reads "Complete" and stops counting: the inner component is unmounted,
// so no interval is left running behind a card nobody is reading.
//
// SPEAKING-05A gave it a second caller and one pair of optional props.
// The Task 5 choice window is the same card doing the same thing over the
// same 60 seconds, and the only difference is what the two lines on it
// say, so it passes label and note rather than being a second component
// with its own copy of the mount-to-reset rule and its own live region.
// Both props default to the preparation wording, so every existing caller
// is untouched.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingPrepTimerProps = {
  // Which window this is. Pass the flow screen id, so the window belongs
  // to the screen and nothing that happens on it starts a new one.
  screenKey: string;
  timer: SpeakingTaskTimer;
  // False once recording has started, which ends the preparation window
  // whether or not it had run out.
  active: boolean;
  // Fired once when the window reaches zero (TIMER-01). The section
  // prototype uses it to raise the time up message. Nothing about this
  // card changes because of it.
  onExpire?: () => void;
  // What the card calls this window. Defaults to "Preparation"
  // (SPEAKING-05A). The Task 5 choice screen passes "Choice time",
  // because the learner is choosing on it rather than planning.
  label?: string;
  // The quiet line under the reading, while the window is still running.
  // Defaults to the preparation one. Once the window closes both callers
  // show the same expired note, because a closed window means the same
  // thing on both screens.
  note?: string;
  copy?: SpeakingMockCopy;
};

export function SpeakingPrepTimer(props: SpeakingPrepTimerProps) {
  const copy = props.copy ?? speakingMockCopy;
  const label = props.label ?? copy.prepTimerLabel;

  // Preparation is over. A static card, and no clock mounted behind it.
  if (!props.active) {
    return (
      <div className={playerTimerCard.card}>
        <p className={playerTimerCard.label}>{label}</p>

        <p
          className={cx(
            playerTimerCard.value,
            examSpeakingTimerStates.muted,
          )}
        >
          {copy.prepTimerDoneValue}
        </p>

        <p className={playerTimerCard.note}>{copy.prepTimerDoneNote}</p>
      </div>
    );
  }

  return <SpeakingPrepTimerWindow key={props.screenKey} {...props} />;
}

function SpeakingPrepTimerWindow({
  screenKey,
  timer,
  onExpire,
  label: labelOverride,
  note: noteOverride,
  copy = speakingMockCopy,
}: SpeakingPrepTimerProps) {
  const label = labelOverride ?? copy.prepTimerLabel;
  const note = noteOverride ?? copy.prepTimerNote;

  // Reaching zero changes the words on the card and tells the caller, and
  // does nothing else, which is the rule every other timed screen in the
  // engine already follows.
  const countdown = useExamCountdown(
    {
      screenKey,
      durationSeconds: timer.seconds,
      warningAtSeconds: timer.warningAtSeconds,
      urgentAtSeconds: timer.urgentAtSeconds,
      // The preparation window opens with the screen, which is what the
      // source screens do.
      autoStart: true,
      label,
    },
    onExpire,
  );

  const tone = examTimerStatusTones[countdown.status];

  return (
    <div className={playerTimerCard.card}>
      <p className={playerTimerCard.label}>{label}</p>

      <p
        // Silent on purpose. A reading that refreshes four times a second
        // cannot also be a polite live region, which is the rule
        // ExamTimerDisplay and ExamTimerStatusText settled. The one
        // announcement worth making is in the region below.
        role="status"
        aria-live="off"
        className={cx(playerTimerCard.value, examSpeakingTimerStates[tone])}
      >
        {countdown.isExpired
          ? examCopy.timeExpiredValue
          : formatExamClock(countdown.remainingSeconds)}
      </p>

      <p className={playerTimerCard.note}>
        {countdown.isExpired ? copy.timerExpiredNote : note}
      </p>

      {/* The window draining, drawn from the reading this card already
          has rather than from a clock of its own (EXAM-UI-03). Decorative:
          the seconds above it are the accessible reading. */}
      <div className={playerTimerCard.track} aria-hidden="true">
        <div
          className={playerTimerCard.fill}
          style={{ width: examCountdownProgressWidth(countdown) }}
        />
      </div>

      {/* The spoken half. Empty until the window closes, and in the
          document from the start so the change is announced when it
          happens. */}
      <span role="status" aria-live="polite" className="sr-only">
        {countdown.isExpired ? `${label}: ${examCopy.timeExpiredValue}` : ""}
      </span>
    </div>
  );
}
