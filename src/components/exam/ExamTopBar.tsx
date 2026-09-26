import type { ReactNode } from "react";
import { MockTestTopBar } from "./player/MockTestTopBar";
import type { ExamTimerReading } from "@/features/exam-engine/exam-shell-types";

// Grey title bar at the top of the exam frame.
//
// **This is now a thin adapter** (EXAM-UI-02). The bar moved to
// src/components/exam/player/MockTestTopBar.tsx, where it is compact,
// around 48 pixels tall, refuses to shrink so the Next control stays
// reachable on a short window, and carries no logo or product name inside
// the exam frame.

export type ExamTopBarProps = {
  title: string;
  timers?: ExamTimerReading[];
  timerSlot?: ReactNode;
  metaText?: string;
  showNext?: boolean;
  nextLabel?: string;
  nextHref?: string;
  onNext?: () => void;
  nextDisabled?: boolean;
  children?: ReactNode;
  className?: string;
};

export function ExamTopBar(props: ExamTopBarProps) {
  return <MockTestTopBar {...props} />;
}
