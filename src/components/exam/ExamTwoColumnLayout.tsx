import type { ReactNode } from "react";
import { MockTestSplitPane } from "./player/MockTestSplitPane";
import type {
  ExamPanelScroll,
  ExamPanelTone,
} from "@/features/exam-engine/exam-shell-types";

// Two column split: source material on the left, answers on the right.
//
// **This is now a thin adapter** (EXAM-UI-02). The split moved to
// src/components/exam/player/MockTestSplitPane.tsx, which added the one
// thing the brief asks for and the old layout could not do: a fill mode
// where the grid takes the height of the content pane and each column
// hands its scrollbar to its own body, so a long passage and a long
// question list scroll past each other independently and neither one can
// move the bars.
//
// Without fill the columns fall back to the fixed scroll heights, which is
// what a screen wants on an internal part route, where the frame sits in
// the dashboard content column and there is no window height to fill.

export type ExamTwoColumnLayoutProps = {
  left: ReactNode;
  right: ReactNode;
  leftLabel?: string;
  rightLabel?: string;
  leftScroll?: ExamPanelScroll;
  rightScroll?: ExamPanelScroll;
  leftTone?: ExamPanelTone;
  rightTone?: ExamPanelTone;
  // Give each column the height of the content pane and its own
  // scrollbar, from the large breakpoint up.
  fill?: boolean;
  bordered?: boolean;
  className?: string;
};

export function ExamTwoColumnLayout(props: ExamTwoColumnLayoutProps) {
  return <MockTestSplitPane {...props} />;
}
