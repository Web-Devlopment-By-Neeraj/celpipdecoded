import type { ReactNode } from "react";
import { cx } from "@/features/design/design-tokens";
import { MockTestInfoIcon } from "./player/MockTestInfoIcon";
import { playerInstruction } from "@/features/exam-engine/mock-test-player-theme";

// Instruction line with a circled information glyph.
//
// Used wherever a screen tells the learner what to do, for example
// "Read the following message" or "Listen to the question".
//
// The glyph moved out to MockTestInfoIcon in EXAM-UI-03. It used to be a
// span written here, which meant the mark beside a screen heading and the
// mark beside a task line were two independent copies of the same idea.
// One component means they are provably the same mark and resize
// together. It is still drawn rather than imported: no icon package is
// installed for the exam engine.
//
// The glyph sits a size down when the row has no heading, because it is
// then aligned to body copy rather than to a 17 pixel screen heading.
//
// The recipe moved to playerInstruction in the reference pass, beside the
// rules list this row introduces, so the lead line and the bullets under
// it are set in the same instruction blue at the same measure by one
// decision rather than two.
//
// Pass heading for the bold lead line, then text or children for the
// instruction body.

export type ExamInstructionRowProps = {
  heading?: string;
  text?: string;
  children?: ReactNode;
  className?: string;
};

export function ExamInstructionRow({
  heading,
  text,
  children,
  className,
}: ExamInstructionRowProps) {
  return (
    <div className={cx(playerInstruction.row, className)}>
      <MockTestInfoIcon size={heading ? "md" : "sm"} />

      <div className="min-w-0">
        {heading ? <p className={playerInstruction.rowHeading}>{heading}</p> : null}
        {text ? <p className={playerInstruction.rowText}>{text}</p> : null}
        {children ? <div className={playerInstruction.rowText}>{children}</div> : null}
      </div>
    </div>
  );
}
