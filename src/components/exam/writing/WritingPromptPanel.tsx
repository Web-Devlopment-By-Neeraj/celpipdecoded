import { ExamInstructionRow } from "../ExamInstructionRow";
import { WritingTaskOptionChoice } from "./WritingTaskOptionChoice";
import { examWriting } from "@/features/exam-engine/exam-theme";
import { writingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingTaskContent } from "@/features/exam-engine/writing-mock-types";

// The prompt above the editor, and the positions where a task has them
// (EXAM-25).
//
// Everything the learner is asked to do, in the order the source prints
// it: the instruction sentence, the requirement bullets under it, and on
// a task that offers positions the positions themselves.
//
// All of it comes from the content object, so this component carries no
// Mock Test 1 wording of its own. Task 1 prints three bullets and no
// choice, because that is what the source image shows. That is not
// special-cased here: an empty requirement list renders nothing and an
// unset options list renders nothing.
//
// What EXAM-UI-04 changed. Mock Test 1 Task 2 no longer reaches this
// panel at all: a task with positions to choose between now gets its own
// choice screen and its own editor screen, in
// WritingTaskTwoChoiceScreen.tsx and WritingTaskTwoEditorScreen.tsx, and
// the section prototype routes it there. The rows are still drawn here,
// through the same shared WritingTaskOptionChoice both of those screens
// use, so this panel stays correct for any task it is given rather than
// quietly dropping a choice it was handed. In Mock Test 1 that branch is
// unreached.
//
// Presentational only. It holds no state: the chosen option id is owned
// by the prototype and passed down, so a choice survives leaving the task
// and coming back.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingPromptPanelProps = {
  task: WritingTaskContent;
  // The chosen position, or undefined while none has been chosen.
  selectedOptionId?: string;
  // Omit on a task with no positions to choose between.
  onSelectOption?: (optionId: string) => void;
  copy?: WritingMockCopy;
};

export function WritingPromptPanel({
  task,
  selectedOptionId,
  onSelectOption,
  copy = writingMockCopy,
}: WritingPromptPanelProps) {
  return (
    <div className={examWriting.prompt}>
      {/* Marked with the shared information glyph and ruled off from the
          requirements under it (EXAM-UI-03), the way every other task
          line in the player is. */}
      <ExamInstructionRow className={examWriting.instructionRow}>
        <span className={examWriting.promptInstruction}>
          {task.promptInstruction}
        </span>
      </ExamInstructionRow>

      {task.promptRequirements.length > 0 ? (
        <ul className={examWriting.requirementList}>
          {task.promptRequirements.map((requirement) => (
            // The requirement text is the key. The three lines are
            // distinct sentences from the source and never reorder.
            <li key={requirement} className={examWriting.requirementItem}>
              {requirement}
            </li>
          ))}
        </ul>
      ) : null}

      <WritingTaskOptionChoice
        task={task}
        selectedOptionId={selectedOptionId}
        onSelectOption={onSelectOption}
        groupScope="prompt-panel"
        hint={copy.choiceHint}
        copy={copy}
      />
    </div>
  );
}
