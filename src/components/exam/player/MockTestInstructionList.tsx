import { cx } from "@/features/design/design-tokens";
import { playerInstruction } from "@/features/exam-engine/mock-test-player-theme";
import type { ExamInstruction } from "@/features/exam-engine/instruction-screen-types";

// The numbered or bulleted rules on an instructions screen (EXAM-UI-02).
//
// Instruction copy sits at the same 15 pixels as the rest of the exam
// body (EXAM-UI-03). EXAM-UI-02 ran it a step larger, at 16, on the
// reasoning that instructions are read as prose rather than scanned. In
// the window that reasoning stopped holding: a set of six Listening
// instructions at 16 pixels with 8 pixels of padding a row reads as an
// article rather than as the rules strip above a test, which is what the
// QA pass reported. Readable, not oversized, is the whole brief here.
//
// The rows are separated by a hairline rather than by white space, which
// is what keeps a full set of Listening instructions on one screen
// instead of pushing the Next control below the fold. The rule is solid
// rather than dotted since EXAM-UI-03: at this row height a dotted rule
// read as texture rather than as a divider.
//
// An item is either a plain string or a heading and a body, and a heading
// is drawn inline in exam blue at the head of its own rule rather than as
// a line of its own, so a set of six instructions is six rows.

export type MockTestInstructionListProps = {
  items: ExamInstruction[];
  className?: string;
};

export function MockTestInstructionList({
  items,
  className,
}: MockTestInstructionListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={cx(playerInstruction.list, className)}>
      {items.map((item) => {
        const heading = typeof item === "string" ? undefined : item.heading;
        const body = typeof item === "string" ? item : item.text;

        return (
          <li key={body} className={playerInstruction.item}>
            <span className={playerInstruction.marker} aria-hidden="true" />

            <span className={playerInstruction.text}>
              {heading ? (
                <span className={cx(playerInstruction.heading, "mr-1")}>
                  {heading}
                </span>
              ) : null}
              {body}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
