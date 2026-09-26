import { MockTestInstructionList } from "./player/MockTestInstructionList";
import type { ExamInstruction } from "@/features/exam-engine/instruction-screen-types";

// The rules on an instructions screen.
//
// **This is now a thin adapter** (EXAM-UI-02). The list moved to
// src/components/exam/player/MockTestInstructionList.tsx, where it is set
// at body size with a small blue marker per rule and a hairline between
// them. That is what keeps a full set of Listening instructions on one
// screen instead of pushing the Next control below the fold.

export type ExamInstructionListProps = {
  items: ExamInstruction[];
  className?: string;
};

export function ExamInstructionList(props: ExamInstructionListProps) {
  return <MockTestInstructionList {...props} />;
}
