import { ExamInstructionRow } from "../ExamInstructionRow";
import { examWriting } from "@/features/exam-engine/exam-theme";
import type { WritingTaskContent } from "@/features/exam-engine/writing-mock-types";

// The left half of a Writing task screen (EXAM-UI-04).
//
// The situation to read: the source's own lead line, the bold heading
// where the source prints one, and the paragraphs under it. Nothing else
// is ever in this column.
//
// It was extracted here because Task 2 now has two screens rather than
// one. The choice screen and the editor screen show the same situation,
// and the learner reads it on the first and refers back to it on the
// second, so the two columns have to be the same column rather than two
// copies that could drift apart. WritingTaskScreen, which draws Task 1
// and any task with no positions to choose between, renders the same
// component, so all three screens in the section open their left half
// identically.
//
// Presentational, stateless, and it reads nothing but the task it is
// given.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingSituationPanelProps = {
  task: WritingTaskContent;
};

export function WritingSituationPanel({ task }: WritingSituationPanelProps) {
  return (
    <div className={examWriting.situation}>
      {/* The information glyph and the rule under it are the same opening
          both columns use (EXAM-UI-03), so the two halves of the screen
          read as two halves rather than as a heading and its body. */}
      <ExamInstructionRow className={examWriting.instructionRow}>
        <span className={examWriting.situationInstruction}>
          {task.situationInstruction}
        </span>
      </ExamInstructionRow>

      {task.situationHeading ? (
        <p className={examWriting.situationHeading}>{task.situationHeading}</p>
      ) : null}

      {task.situationParagraphs.map((paragraph, index) => (
        <p
          // Paragraphs have no ids of their own and never reorder, so the
          // index is the stable key here. Same rule the Reading passage
          // follows.
          key={`${task.taskId}-situation-${index}`}
          className={examWriting.situationParagraph}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
