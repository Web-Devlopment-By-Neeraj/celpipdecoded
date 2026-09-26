import { ExamInstructionScreen } from "../ExamInstructionScreen";
import { ExamSectionIntroCard } from "../ExamSectionIntroCard";
import { examCopy } from "@/features/exam-engine/exam-copy";
import {
  formatWritingMinutes,
  formatWritingWordTarget,
  writingMockCopy,
} from "@/features/exam-engine/writing-mock-copy";
import { sumWritingSectionSeconds } from "@/features/exam-engine/writing-mock-flow";
import type { ExamSectionIntroDetail } from "@/features/exam-engine/instruction-screen-types";
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
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

// The shared word target, when every task has the same one. Undefined
// when the tasks disagree or when there are no tasks, so nothing is
// printed rather than one task's target being shown as the section's.
function sharedWordTarget(
  content: WritingSectionContent,
): { min: number; max: number } | undefined {
  const [first] = content.tasks;

  if (!first) {
    return undefined;
  }

  const shared = content.tasks.every(
    (task) =>
      task.wordTarget.min === first.wordTarget.min &&
      task.wordTarget.max === first.wordTarget.max,
  );

  return shared ? first.wordTarget : undefined;
}

export function WritingSectionIntroScreen({
  content,
  copy = writingMockCopy,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: WritingSectionIntroScreenProps) {
  const screen = content.instructionScreen;
  const wordTarget = sharedWordTarget(content);

  const introDetails: ExamSectionIntroDetail[] = screen.introDetails ?? [
    { label: copy.introTasksLabel, value: String(content.tasks.length) },
    {
      label: copy.introTimeLabel,
      value: formatWritingMinutes(sumWritingSectionSeconds(content)),
    },
    ...(wordTarget
      ? [
          {
            label: copy.introWordsLabel,
            value: formatWritingWordTarget(wordTarget.min, wordTarget.max),
          },
        ]
      : []),
  ];

  return (
    <ExamInstructionScreen
      title={screen.title}
      subtitle={screen.subtitle}
      instructions={screen.instructions}
      noticeText={screen.noticeText}
      metaText={metaText}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
      intro={
        <ExamSectionIntroCard
          label={examCopy.practiceLabel}
          title={screen.introTitle}
          summary={screen.introSummary}
          details={introDetails}
        />
      }
    />
  );
}
