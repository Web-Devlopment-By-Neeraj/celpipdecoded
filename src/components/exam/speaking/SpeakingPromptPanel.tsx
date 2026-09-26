import { ExamInstructionRow } from "../ExamInstructionRow";
import { SpeakingVisualPrompt } from "./SpeakingVisualPrompt";
import { examSpeaking } from "@/features/exam-engine/exam-theme";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingTaskContent } from "@/features/exam-engine/speaking-mock-types";

// The task as the source prints it (EXAM-27).
//
// Everything the learner is asked to do, in the order the source prints
// it: the situation paragraph where a task has one, the instruction
// sentence, any further paragraphs under it, the either or pair on the
// one task that has one, and then the pictures.
//
// All of it comes from the content object, so this component carries no
// Mock Test 1 wording of its own. The eight tasks differ a great deal
// from each other, and none of those differences is special cased here:
//
// - Tasks 1 and 2 print one sentence and nothing else
// - Task 3 and Task 4 print a sentence and a picture
// - Task 5 prints a situation, an instruction and two rows of option
//   cards
// - Task 6 prints a situation as its instruction, then "Choose ONE:" and
//   an either or pair
// - Task 7 prints an instruction and its question on a separate line
// - Task 8 prints a sentence and a picture
//
// Every one of those is an empty or filled field on the same content
// type, so an absent field renders nothing rather than a branch.
//
// The either or pair is not a control. The source asks the learner to
// pick one in their head and speak, so nothing here is selectable,
// nothing is stored, and nothing is gated on it. That is why it is not
// modelled as the Writing radio group: a radio group would promise a
// choice this task does not record.
//
// promptNote is the one line on this panel that is ours rather than the
// source's, and only Task 5 has one. It says where this screen departs
// from the source screens, which is better than silently rearranging the
// source and better than printing source wording that describes a step
// this prototype does not build.
//
// Presentational only. It holds no state.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingPromptPanelProps = {
  task: SpeakingTaskContent;
  copy?: SpeakingMockCopy;
};

export function SpeakingPromptPanel({
  task,
  copy = speakingMockCopy,
}: SpeakingPromptPanelProps) {
  const situationParagraphs = task.situationParagraphs ?? [];
  const promptParagraphs = task.promptParagraphs ?? [];
  const alternatives = task.alternatives ?? [];

  return (
    <div className={examSpeaking.prompt}>
      {situationParagraphs.map((paragraph, index) => (
        <p
          // Paragraphs have no ids of their own and never reorder, so the
          // index is the stable key here. Same rule the Writing situation
          // and the Reading passage follow.
          key={`${task.taskId}-situation-${index}`}
          className={examSpeaking.situationParagraph}
        >
          {paragraph}
        </p>
      ))}

      {/* The instruction the task actually sets, marked with the shared
          information glyph and ruled off from what follows it
          (EXAM-UI-03). It keeps its place after the situation, because on
          Task 5 the situation is what the instruction refers to and
          reading them the other way round would not make sense.

          The small caps "Read the task" label that used to head this
          column is gone with it: the split pane already names the column,
          and two stacked labels above one sentence is the dashboard look
          the brief asked the player to drop. */}
      <ExamInstructionRow className={examSpeaking.instructionRow}>
        <span className={examSpeaking.promptInstruction}>
          {task.promptInstruction}
        </span>
      </ExamInstructionRow>

      {promptParagraphs.map((paragraph, index) => (
        <p
          key={`${task.taskId}-prompt-${index}`}
          className={examSpeaking.promptParagraph}
        >
          {paragraph}
        </p>
      ))}

      {alternatives.length > 0 ? (
        <div className={examSpeaking.alternativeList}>
          {task.alternativesLead ? (
            <p className={examSpeaking.alternativeLead}>
              {task.alternativesLead}
            </p>
          ) : null}

          {alternatives.map((alternative) => (
            <div
              // The connector is unique within a pair, "EITHER" and "OR",
              // and the pair never reorders.
              key={`${task.taskId}-${alternative.connector}`}
              className={examSpeaking.alternativeRow}
            >
              <p className={examSpeaking.alternativeConnector}>
                {alternative.connector}
              </p>
              <p className={examSpeaking.alternativeText}>{alternative.text}</p>
            </div>
          ))}
        </div>
      ) : null}

      {task.promptNote ? (
        <p className={examSpeaking.promptNote}>{task.promptNote}</p>
      ) : null}

      {task.visuals.map((visual) => (
        <SpeakingVisualPrompt key={visual.id} visual={visual} copy={copy} />
      ))}
    </div>
  );
}
