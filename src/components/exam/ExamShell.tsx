import type { ReactNode } from "react";
import { MockTestPlayerShell } from "./player/MockTestPlayerShell";
import type {
  ExamTimerReading,
  ExamTimerState,
} from "@/features/exam-engine/exam-shell-types";

// The frame every practice test screen sits inside.
//
// **This is now a thin adapter** (EXAM-UI-02). The frame itself moved to
// src/components/exam/player/MockTestPlayerShell.tsx, which is where the
// compact exam window, the two bars and the scrolling content pane are
// built. Roughly sixty screen components across Listening, Reading,
// Writing and Speaking render an ExamShell, so keeping this name and this
// prop list means the redesign lands on all four sections at once without
// a single screen having to be rewritten for it, and without a chance of
// half of them being missed.
//
// Everything the shell used to document about itself still holds and is
// documented on MockTestPlayerShell:
//
// - it owns no clock, it is handed a formatted value or a live component
// - timers wins over the single timerValue reading
// - navigation takes either an href or a handler
//
// One prop is new. scrollContent tells the shell whether the content pane
// should take the scrollbar, and a split screen sets it false so its two
// columns can each take one of their own instead.

export type ExamShellProps = {
  title: string;

  // Single timer reading.
  timerLabel?: string;
  timerValue?: string;
  timerState?: ExamTimerState;
  // Two or more readings, for example the Speaking pair. Overrides the
  // single reading props above.
  timers?: ExamTimerReading[];
  // A live timer component, normally ExamCountdownTimer. Rendered in the
  // top bar beside any fixed readings.
  timerSlot?: ReactNode;
  // Small note in the top bar beside the timers.
  metaText?: string;

  showNext?: boolean;
  nextLabel?: string;
  nextHref?: string;
  onNext?: () => void;
  nextDisabled?: boolean;

  showBack?: boolean;
  backLabel?: string;
  backHref?: string;
  onBack?: () => void;
  backDisabled?: boolean;

  // Optional action on the right of the bottom bar, opposite Back.
  secondaryAction?: ReactNode;
  // Extra content in the bottom bar, beside the secondary action.
  bottomContent?: ReactNode;
  // Hide the bottom bar entirely, for a screen with no controls at all.
  showBottomBar?: boolean;

  // Screen body.
  children: ReactNode;
  // Set false when the body manages its own edges.
  padded?: boolean;
  // Set false when the body scrolls its own regions, for example a split
  // screen whose two columns each take a scrollbar.
  scrollContent?: boolean;
  className?: string;
};

export function ExamShell(props: ExamShellProps) {
  return <MockTestPlayerShell {...props} />;
}
