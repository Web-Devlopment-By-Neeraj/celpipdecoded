import type { ReactNode } from "react";
import { MockTestQuestionPanel } from "./player/MockTestQuestionPanel";
import type {
  ExamPanelScroll,
  ExamPanelTone,
} from "@/features/exam-engine/exam-shell-types";

// Panel used for question sets, passages and answer areas.
//
// **This is now a thin adapter** (EXAM-UI-02). The panel moved to
// src/components/exam/player/MockTestQuestionPanel.tsx, where it is drawn
// in the neutral player palette and where a scrolling panel keeps its own
// scrollbar, so a long question list inside a short column cannot push the
// page sideways or move the bars.

export type ExamPanelProps = {
  title?: string;
  tone?: ExamPanelTone;
  scroll?: ExamPanelScroll;
  footer?: ReactNode;
  padded?: boolean;
  children: ReactNode;
  className?: string;
};

export function ExamPanel(props: ExamPanelProps) {
  return <MockTestQuestionPanel {...props} />;
}
