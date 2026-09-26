import { MockTestTimerBadge } from "./player/MockTestTimerBadge";
import type { ExamTimerState } from "@/features/exam-engine/exam-shell-types";

// One timer reading in the exam top bar.
//
// **This is now a thin adapter** (EXAM-UI-02). The reading moved to
// src/components/exam/player/MockTestTimerBadge.tsx, where it is drawn as
// a small bordered badge rather than as a loose line of text in the bar.
// It still owns no clock, and it still changes nothing but colour between
// states, so a countdown cannot reflow the bar around it.

export type ExamTimerDisplayProps = {
  label?: string;
  value: string;
  state?: ExamTimerState;
  live?: "polite" | "off";
  className?: string;
};

export function ExamTimerDisplay(props: ExamTimerDisplayProps) {
  return <MockTestTimerBadge {...props} />;
}
