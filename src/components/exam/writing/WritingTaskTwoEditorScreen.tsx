import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ExamTwoColumnLayout } from "../ExamTwoColumnLayout";
import { ExamCountdownTimer } from "../timer/ExamCountdownTimer";
import { WritingResponseEditor } from "./WritingResponseEditor";
import { WritingSituationPanel } from "./WritingSituationPanel";
import { WritingTaskOptionChoice } from "./WritingTaskOptionChoice";
import { examWriting } from "@/features/exam-engine/exam-theme";
import {
  formatWritingTaskScreenTitle,
  writingMockCopy,
} from "@/features/exam-engine/writing-mock-copy";
import { getWritingChosenOption } from "@/features/exam-engine/writing-mock-flow";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type {
  WritingChoiceMap,
  WritingTaskContent,
} from "@/features/exam-engine/writing-mock-types";

// The Writing Task 2 editor screen (EXAM-UI-04).
//
// The screen after the choice screen. The survey is still on the left,
// and on the right the prompt instruction, the two positions with the
// chosen one held, a line restating what is being argued, and the
// response box.
//
// **The editor itself is unchanged.** This screen renders the same
// WritingResponseEditor Task 1 renders, with the same frame, the same
// label strip, the same live word count and the same target, because the
// editor was not what the ticket found wanting. What changed is only what
// sits above it.
//
// **The positions stay live here.** The reference screens keep them, and
// so does this: a writer who gets three sentences in and realises they
// have more to say about the other side should not have to walk back a
// screen to say so, and changing a position has never touched a response.
// The choice screen is where the decision is asked for, not where it is
// locked.
//
// **The chosen position is restated in its own line above the box.** The
// radio rows say which one is selected, but a radio dot is a small thing
// to carry the one fact the whole response has to be consistent with, and
// on a long screen the rows can be scrolled past. The line is a reading
// rather than a control, and it says nothing at all when nothing has been
// chosen, which is a state this screen can be reached in by pressing Back
// from the completion screen after a restart.
//
// The timer is keyed to the task rather than to the screen, so the choice
// screen and this one read one Task 2 window rather than two. See the
// note in WritingTaskTwoChoiceScreen about what a screen change still
// does to it.
//
// Presentational, so no "use client" of its own: it is rendered by the
// section prototype, which is the client component, and
// ExamCountdownTimer carries its own.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingTaskTwoEditorScreenProps = {
  task: WritingTaskContent;
  response: string;
  onChangeResponse: (text: string) => void;
  // The whole choice map rather than one id, so the screen can look the
  // chosen option up and restate it rather than being handed a label to
  // print.
  choices: WritingChoiceMap;
  onSelectOption: (optionId: string) => void;
  // What the countdown resets on. Pass the task id, so this screen and
  // the choice screen before it read the same window.
  timerScreenKey?: string;
  // Fired once when the window reaches zero (TIMER-01). A notification
  // and nothing more: the section run uses it to raise the shared time up
  // message, and the response text, the chosen position and Finish Writing
  // are all untouched.
  onTimeExpire?: () => void;
  copy?: WritingMockCopy;
  metaText?: string;
  nextLabel?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function WritingTaskTwoEditorScreen({
  task,
  response,
  onChangeResponse,
  choices,
  onSelectOption,
  timerScreenKey,
  onTimeExpire,
  copy = writingMockCopy,
  metaText,
  nextLabel,
  onNext,
  onBack,
  showBack = true,
}: WritingTaskTwoEditorScreenProps) {
  const chosenOption = getWritingChosenOption(task, choices);

  return (
    <ExamShell
      title={formatWritingTaskScreenTitle(task.title, task.taskTitle)}
      timerSlot={
        <ExamCountdownTimer
          screenKey={timerScreenKey ?? task.taskId}
          durationSeconds={task.timer.seconds}
          warningAtSeconds={task.timer.warningAtSeconds}
          urgentAtSeconds={task.timer.urgentAtSeconds}
          label={copy.taskTimerLabel}
          onExpire={onTimeExpire}
        />
      }
      metaText={metaText}
      nextLabel={nextLabel}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
      padded={false}
      scrollContent={false}
    >
      <ExamTwoColumnLayout
        leftScroll="tall"
        rightScroll="none"
        fill
        bordered={false}
        left={<WritingSituationPanel task={task} />}
        right={
          <div className={examWriting.taskColumn}>
            <div className={examWriting.prompt}>
              <ExamInstructionRow className={examWriting.instructionRow}>
                <span className={examWriting.promptInstruction}>
                  {task.promptInstruction}
                </span>
              </ExamInstructionRow>

              {task.promptRequirements.length > 0 ? (
                <ul className={examWriting.requirementList}>
                  {task.promptRequirements.map((requirement) => (
                    <li
                      key={requirement}
                      className={examWriting.requirementItem}
                    >
                      {requirement}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* No hint under the rows here. The choice screen has already
                said that a position can be changed and that the writing
                is kept, and the line under the editor is the one a writer
                needs on this screen. */}
            <WritingTaskOptionChoice
              task={task}
              selectedOptionId={chosenOption?.id}
              onSelectOption={onSelectOption}
              groupScope="editor-screen"
              copy={copy}
            />

            {chosenOption ? (
              <div className={examWriting.chosenNote}>
                <span className={examWriting.chosenNoteLabel}>
                  {copy.chosenOptionLabel}
                </span>
                <span className={examWriting.chosenNoteText}>
                  <span className={examWriting.chosenNoteOption}>
                    {chosenOption.label}:
                  </span>{" "}
                  {chosenOption.text}
                </span>
              </div>
            ) : null}

            <WritingResponseEditor
              editorId={`${task.taskId}-response`}
              value={response}
              onChange={onChangeResponse}
              placeholder={task.editorPlaceholder}
              targetMin={task.wordTarget.min}
              targetMax={task.wordTarget.max}
              copy={copy}
            />
          </div>
        }
      />
    </ExamShell>
  );
}
