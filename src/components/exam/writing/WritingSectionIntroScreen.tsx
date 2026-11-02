import { ExamInstructionScreen } from "../ExamInstructionScreen";
import { ExamInstructionCountdown } from "../timer/ExamInstructionCountdown";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingSectionContent } from "@/features/exam-engine/writing-mock-types";

// Writing section intro screen (EXAM-25).
//
// The first screen of the Writing run. Screen type 1 from
// docs/product/exam-engine-screen-types.md, so it is the EXAM-02
// ExamInstructionScreen with the section content filled in rather than a
// new layout, exactly as ReadingSectionIntroScreen is.
//
// The three detail rows are read off the content rather than written into
// the content file: the number of tasks, the sum of the two task windows,
// and the word target the two tasks share. That is the rule the Reading
// section intro follows, and it is why the card cannot claim a total the
// section does not have. The time row sums to the 53 minutes the source
// document publishes for the Writing Test, which is what makes it a check
// on the two windows rather than a fourth place to write a number down.
//
// The word target row is guidance from the prompts themselves, "about
// 150-200 words". It is shown only when both tasks share one target, so a
// section whose tasks ever differ prints no misleading single figure.
//
// No timer on this screen. The first window starts when Task 1 does.
//
// The notice under the instructions is where the caveats are said, and
// they are said here rather than in a preview label because the exam
// surface carries no label: nothing is saved, nothing is scored, and the
// AI review is the next build.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingSectionIntroScreenProps = {
  content: WritingSectionContent;
  copy?: WritingMockCopy;
  metaText?: string;
  onTimeExpire?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
};

export function WritingSectionIntroScreen({
  content,
  metaText,
  onTimeExpire,
  onNext,
  onBack,
  showBack = true,
  backHref,
  backLabel,
}: WritingSectionIntroScreenProps) {
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
