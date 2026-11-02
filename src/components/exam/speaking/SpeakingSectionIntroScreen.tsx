import { ExamInstructionScreen } from "../ExamInstructionScreen";
import { ExamInstructionCountdown } from "../timer/ExamInstructionCountdown";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingSectionContent } from "@/features/exam-engine/speaking-mock-types";

// Speaking section intro screen (EXAM-27).
//
// The first screen of the Speaking run. Screen type 1 from
// docs/product/exam-engine-screen-types.md, so it is the EXAM-02
// ExamInstructionScreen with the section content filled in rather than a
// new layout, exactly as the Reading and Writing section intros are.
//
// The three detail rows are read off the content rather than written into
// the content file: the number of tasks, the sum of the eight preparation
// windows and the sum of the eight recording windows. That is the rule
// the Reading and Writing section intros follow, and it is why the card
// cannot claim a total the section does not have.
//
// The two sums are worth showing separately rather than as one total,
// because they are the two halves of what a Speaking section actually
// asks of a learner: five minutes of planning and nine minutes of
// talking. Together they are 14 minutes, inside the 15 minutes the source
// document publishes for the Speaking Test, with the difference being the
// time spent reading prompts and moving between screens. See
// speaking-mock-timing.ts for where every one of those figures came from.
//
// No timer on this screen. The first preparation window starts when Task
// 1 does.
//
// The notice under the instructions is where the caveats are said, and
// they are said here rather than in a preview label because the exam
// surface carries no label: nothing is saved, nothing is uploaded,
// nothing is scored, and the AI review is the next build.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingSectionIntroScreenProps = {
  content: SpeakingSectionContent;
  copy?: SpeakingMockCopy;
  metaText?: string;
  onTimeExpire?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
};

export function SpeakingSectionIntroScreen({
  content,
  metaText,
  onTimeExpire,
  onNext,
  onBack,
  showBack = true,
  backHref,
  backLabel,
}: SpeakingSectionIntroScreenProps) {
  const screen = content.instructionScreen;

  return (
    <ExamInstructionScreen
      title={screen.title}
      subtitle={screen.subtitle}
      instructions={screen.instructions}
      noticeText={screen.noticeText}
      metaText={metaText}
      timerSlot={
        onTimeExpire ? (
          <ExamInstructionCountdown
            screenKey={`${screen.title}-instructions`}
            onExpire={onTimeExpire}
          />
        ) : undefined
      }
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
      backHref={backHref}
      backLabel={backLabel}
    />
  );
}
