import type { ReactNode } from "react";
import { MockTestBottomBar } from "./player/MockTestBottomBar";

// Grey navigation bar at the foot of the exam frame.
//
// **This is now a thin adapter** (EXAM-UI-02). The bar moved to
// src/components/exam/player/MockTestBottomBar.tsx, where it is compact,
// around 56 pixels tall, and pinned: the content pane above it takes every
// pixel of overflow, so Back sits in the same place on a one line
// transition screen and on a 38 question review.

export type ExamBottomBarProps = {
  showBack?: boolean;
  backLabel?: string;
  backHref?: string;
  onBack?: () => void;
  backDisabled?: boolean;
  secondaryAction?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function ExamBottomBar(props: ExamBottomBarProps) {
  return <MockTestBottomBar {...props} />;
}
