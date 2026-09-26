"use client";

import { useState } from "react";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ExamTwoColumnLayout } from "../ExamTwoColumnLayout";
import { ExamCountdownTimer } from "../timer/ExamCountdownTimer";
import { WritingSituationPanel } from "./WritingSituationPanel";
import { WritingTaskOptionChoice } from "./WritingTaskOptionChoice";
import { examWriting } from "@/features/exam-engine/exam-theme";
import {
  formatWritingTaskScreenTitle,
  writingMockCopy,
} from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingTaskContent } from "@/features/exam-engine/writing-mock-types";

// The Writing Task 2 choice screen (EXAM-UI-04).
//
// The step between the Task 1 to Task 2 transition and the Task 2 editor.
// The survey is on the left, and on the right the prompt instruction and
// the two positions, and nothing else. There is no response box on this
// screen, which is the whole point of it: a learner is asked to decide
// what they think before they are handed somewhere to argue it.
//
// Why it exists. Until this ticket the choice was a small radio group
// stacked above an editor that was already open and already focusable, on
// a screen whose obvious next move was to start typing. The one decision
// the task turns on was the easiest thing on the screen to walk past, and
// a response written without a position taken is a response the reviewer
// has nothing to judge against. Separating the two makes the decision the
// screen rather than a strip on it.
//
// Why it gates. This is the only screen in the Writing section that will
// not move forward on demand, and the exception is narrow and deliberate.
// Everything else in the section is ungated on purpose: an empty response
// is allowed, a short one is allowed, and the completion screen reports
// what was typed without complaint. A position is different. It is not
// work, it is the question, it takes one click, and the screen after it
// is built around the answer. So Next holds, and the screen says why
// rather than leaving a control that looks live and does nothing.
//
// The gate is a message, not a disabled button. A greyed out Next on a
// screen with two radio buttons on it makes a learner guess what is
// missing; a Next that answers is a control that tells them. The message
// appears the first time Next is pressed with nothing chosen and clears
// the moment a position is chosen, so it is never on screen next to a
// choice that satisfies it.
//
// The timer. Task 2 carries one window and this screen shows it, keyed to
// the task rather than to the screen, so the reading a learner sees here
// is the reading they see on the editor. It does open a fresh window,
// because every screen change in this section remounts the frame, and
// that is the behaviour the whole prototype already has: nothing is
// enforced, no expiry handler is passed, and moving back and forward has
// always restarted a Writing window. Recorded in
// docs/brand/writing-task-2-choice-screen-polish.md rather than papered
// over.
//
// It holds one piece of state, whether Next has been pressed with nothing
// chosen, and that is all. The position itself belongs to the section
// prototype above it, so choosing here and arriving at the editor is one
// value read twice rather than two values kept in step.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingTaskTwoChoiceScreenProps = {
  task: WritingTaskContent;
  // The chosen position, or undefined while none has been chosen.
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
  // What the countdown resets on. Pass the task id, so the choice screen
  // and the editor after it read the same window rather than two.
  timerScreenKey?: string;
  copy?: WritingMockCopy;
  metaText?: string;
  // Called only once a position has been chosen.
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function WritingTaskTwoChoiceScreen({
  task,
  selectedOptionId,
  onSelectOption,
  timerScreenKey,
  copy = writingMockCopy,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: WritingTaskTwoChoiceScreenProps) {
  const [showRequiredMessage, setShowRequiredMessage] = useState(false);

  const handleSelect = (optionId: string) => {
    onSelectOption(optionId);
    // The message answered a question that has now been answered.
    setShowRequiredMessage(false);
  };

  const handleNext = () => {
    if (!selectedOptionId) {
      setShowRequiredMessage(true);
      return;
    }

    onNext?.();
  };

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
        />
      }
      metaText={metaText}
      nextLabel={copy.choiceScreenNextLabel}
      onNext={handleNext}
      onBack={onBack}
      showBack={showBack}
      // The split manages its own edges and fills the canvas.
      padded={false}
      // Each column takes its own scrollbar, so the content pane takes
      // none of its own (EXAM-UI-02).
      scrollContent={false}
    >
      <ExamTwoColumnLayout
        // No column labels (EXAM-UI-03). Each half opens with its own
        // instruction line instead.
        leftScroll="tall"
        rightScroll="none"
        fill
        bordered={false}
        left={<WritingSituationPanel task={task} />}
        right={
          <div className={examWriting.taskColumn}>
            <div className={examWriting.prompt}>
              {/* The same instruction sentence the editor screen carries,
                  because it is the same task. A learner reads it here to
                  decide and re-reads it there to write. */}
              <ExamInstructionRow className={examWriting.instructionRow}>
                <span className={examWriting.promptInstruction}>
                  {task.promptInstruction}
                </span>
              </ExamInstructionRow>

              {task.promptRequirements.length > 0 ? (
                <ul className={examWriting.requirementList}>
                  {task.promptRequirements.map((requirement) => (
                    // The requirement text is the key. The lines are
                    // distinct sentences from the source and never
                    // reorder.
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

            <WritingTaskOptionChoice
              task={task}
              selectedOptionId={selectedOptionId}
              onSelectOption={handleSelect}
              groupScope="choice-screen"
              hint={copy.choiceScreenHint}
              errorText={
                showRequiredMessage ? copy.choiceRequiredMessage : undefined
              }
              copy={copy}
            />
          </div>
        }
      />
    </ExamShell>
  );
}
