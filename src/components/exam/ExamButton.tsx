import type { ReactNode } from "react";
import { MockTestButton } from "./player/MockTestButton";
import type {
  ExamButtonSize,
  ExamButtonVariant,
} from "@/features/exam-engine/exam-shell-types";

// Exam chrome button.
//
// **This is now a thin adapter** (EXAM-UI-02). The button moved to
// src/components/exam/player/MockTestButton.tsx, where it is drawn in the
// neutral player blue rather than the brand teal, and where the three
// sizes were raised a step: the old chrome buttons were 24 and 28 pixels
// tall and read as toolbar affordances rather than as the two controls a
// learner uses on every screen of the test.

export type ExamButtonProps = {
  variant?: ExamButtonVariant;
  size?: ExamButtonSize;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  uppercase?: boolean;
  fullWidth?: boolean;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
};

export function ExamButton(props: ExamButtonProps) {
  return <MockTestButton {...props} />;
}
