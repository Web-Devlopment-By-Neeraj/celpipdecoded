import { ExamInstructionScreen } from "../ExamInstructionScreen";
import { ExamSectionIntroCard } from "../ExamSectionIntroCard";
import { examCopy } from "@/features/exam-engine/exam-copy";
import {
  formatReadingSectionMinutes,
  readingSectionCopy,
} from "@/features/exam-engine/reading-copy";
import {
  countReadingSectionQuestions,
  sumReadingSectionSeconds,
} from "@/features/exam-engine/reading-section-flow";
import type { ReadingSectionCopy } from "@/features/exam-engine/reading-copy";
import type { ExamSectionIntroDetail } from "@/features/exam-engine/instruction-screen-types";
import type { ReadingSectionContent } from "@/features/exam-engine/reading-section-types";

// Reading section intro screen (EXAM-24).
//
// The first screen of the full Reading run. Screen type 1 from
// docs/product/exam-engine-screen-types.md, so it is the EXAM-02
// ExamInstructionScreen with the section content filled in rather than a
// new layout, exactly as ReadingPartIntroScreen and
// ListeningSectionInstructionScreen are.
//
// It is a separate component from ReadingPartIntroScreen because the two
// read different content types and state different facts: a part states
// its own name, its question count and its own window, and the section
// states how many parts there are, how many questions there are in total,
// and how much reading time the four parts add up to.
//
// The three detail rows are counted off the content rather than written
// into the content file, which is the rule this ticket asks for: a part
// gaining a question moves the number on this card and the number the
// score is out of together, and neither can go stale against a hardcoded
// 38. A content file that wants to override them can still pass
// introDetails.
//
// The reading time row is the sum of the four part windows and is a plan
// for the section, not a reading of anything. There is no section
// countdown in this ticket: the timers belong to the parts, exactly as
// they do on the four part routes. See the timer note in
// docs/product/full-reading-section-flow-band-score.md.
//
// No timer on this screen at all. The first window starts when Part 1's
// passage does.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ReadingSectionIntroScreenProps = {
  content: ReadingSectionContent;
  copy?: ReadingSectionCopy;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingSectionIntroScreen({
  content,
  copy = readingSectionCopy,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ReadingSectionIntroScreenProps) {
  const screen = content.instructionScreen;

  const introDetails: ExamSectionIntroDetail[] = screen.introDetails ?? [
    { label: copy.introPartsLabel, value: String(content.parts.length) },
    {
      label: copy.introQuestionsLabel,
      value: String(countReadingSectionQuestions(content)),
    },
    {
      label: copy.introTimeLabel,
      value: formatReadingSectionMinutes(sumReadingSectionSeconds(content)),
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
