import { ExamInstructionScreen } from "../ExamInstructionScreen";
import {
  formatSpeakingTaskScreenTitle,
  speakingMockCopy,
} from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingTaskContent } from "@/features/exam-engine/speaking-mock-types";

// The first of the four Speaking Task 5 screens (SPEAKING-05A).
//
// It says what the task is going to ask for, in three parts, and it does
// nothing else. No clock, no cards, no microphone.
//
// Why it exists. Task 5 is the only task in the section that asks the
// learner to make a decision before they speak, and until this ticket it
// did not ask at all: the choice was made in the content file and the
// screen said so in a quiet note. Building the choice made a second
// problem visible. A learner who walks onto a choice screen with a 60
// second clock already running has to work out what is being asked while
// the window they are being asked in drains, and the reference screens
// deal with that the same way this one does, by spending a screen with no
// clock on it saying what is about to happen.
//
// That is also why it is the one Task 5 screen with no timer. A window on
// this screen would be a window on reading the rules, which is not one of
// the three windows the source gives the task.
//
// It is the shared ExamInstructionScreen with the task's own three parts
// filled in, not a layout of its own, exactly as the section intro screen
// is. The three parts come from the content, so the wording of what Task
// 5 asks for lives beside the task rather than in a component.
//
// The Next control is the player's own: square cornered and compact, the
// same control every screen in the run moves forward with (EXAM-UI-02).
// Nothing here draws a button of its own.
//
// Presentational. It holds no state.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingTaskFiveInstructionsScreenProps = {
  task: SpeakingTaskContent;
  copy?: SpeakingMockCopy;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function SpeakingTaskFiveInstructionsScreen({
  task,
  copy = speakingMockCopy,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: SpeakingTaskFiveInstructionsScreenProps) {
  const step = task.choiceStep;

  // A task with no choice step never reaches this screen: the flow
  // builder does not produce one for it. The guard is here so this
  // component is total rather than because the case is expected.
  if (!step) {
    return null;
  }

  return (
    <ExamInstructionScreen
      // The task named as well as the test, because Task 5 runs across
      // four screens and a learner three screens in should not have to
      // count back to work out which task they are on.
      title={formatSpeakingTaskScreenTitle(task.title, task.taskTitle)}
      subtitle={copy.taskFiveInstructionsSubtitle}
      instructions={step.steps}
      noticeText={copy.taskFiveInstructionsNotice}
      metaText={metaText}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
    />
  );
}
