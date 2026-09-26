import { cx } from "@/features/design/design-tokens";
import {
  playerTimer,
  playerTimerStates,
} from "@/features/exam-engine/mock-test-player-theme";
import type { ExamTimerState } from "@/features/exam-engine/exam-shell-types";

// One timer reading in the player top bar (EXAM-UI-02).
//
// A small bordered badge rather than the loose line of text the old bar
// carried. The brief asks for a timer that is prominent but not huge, and
// a badge reads at a glance without needing a size that would set the
// height of the bar around it.
//
// State is carried by colour and by the border, never by size or weight on
// the value, so a reading moving from normal to urgent cannot reflow the
// bar or push the Next control. There is no flashing and no animation: a
// blinking clock in a test window is a distraction rather than a warning.
//
// This component owns no clock. It is handed a formatted value and a tone,
// exactly as ExamTimerDisplay was, so every existing caller including the
// live countdown keeps working unchanged.

export type MockTestTimerBadgeProps = {
  label?: string;
  value: string;
  state?: ExamTimerState;
  // Off for a fixed reading, so a screen with a static label does not
  // announce itself on every render.
  live?: "polite" | "off";
  className?: string;
};

export function MockTestTimerBadge({
  label,
  value,
  state = "normal",
  live = "polite",
  className,
}: MockTestTimerBadgeProps) {
  return (
    <span
      role="status"
      aria-live={live}
      className={cx(playerTimer.base, playerTimerStates[state], className)}
    >
      {label ? <span className={playerTimer.label}>{label}</span> : null}
      <span className={playerTimer.value}>{value}</span>
    </span>
  );
}
