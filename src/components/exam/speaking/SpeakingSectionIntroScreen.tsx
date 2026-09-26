import { ExamInstructionScreen } from "../ExamInstructionScreen";
import { ExamSectionIntroCard } from "../ExamSectionIntroCard";
import {
  formatSpeakingDuration,
  speakingMockCopy,
} from "@/features/exam-engine/speaking-mock-copy";
import {
  sumSpeakingPrepSeconds,
  sumSpeakingResponseSeconds,
} from "@/features/exam-engine/speaking-mock-timing";
import type { ExamSectionIntroDetail } from "@/features/exam-engine/instruction-screen-types";
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
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function SpeakingSectionIntroScreen({
  content,
  copy = speakingMockCopy,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: SpeakingSectionIntroScreenProps) {
  const screen = content.instructionScreen;

  const introDetails: ExamSectionIntroDetail[] = screen.introDetails ?? [
    { label: copy.introTasksLabel, value: String(content.tasks.length) },
    {
      label: copy.introPrepLabel,
      value: formatSpeakingDuration(sumSpeakingPrepSeconds(content)),
    },
    {
      label: copy.introSpeakingLabel,
      value: formatSpeakingDuration(sumSpeakingResponseSeconds(content)),
    },
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
        // No practice eyebrow above the section name. The window this
        // screen sits in is the practice test, and a screen inside it
        // saying so in small caps is a product label on an exam. The
        // Listening part intro dropped the same eyebrow in the
        // reference pass, so the two sections open the same way.
        <ExamSectionIntroCard
          title={screen.introTitle}
          summary={screen.introSummary}
          details={introDetails}
        />
      }
    />
  );
}
