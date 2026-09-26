import { ReadingPartIntroScreen } from "./ReadingPartIntroScreen";
import { readingCopy } from "@/features/exam-engine/reading-copy";
import type { ReadingPartContent } from "@/features/exam-engine/reading-types";

// Part intro screen for Reading Part 3 (EXAM-20).
//
// Screen type 1 from docs/product/exam-engine-screen-types.md. It is the
// shared ReadingPartIntroScreen with the Part 3 format label filled in,
// not a third intro screen: the part name, the bullets, the summary, the
// question count and the time all come from the content object, and the
// one thing Part 3 says differently is what the learner is given.
//
// Part 1 says "Message, response and drop-down questions" and Part 2 says
// "Diagram, email and drop-down questions". Part 3 is lettered paragraphs
// matched against statements, so it says so. That is a one line
// difference in practice, which is exactly why this is a thin named
// wrapper rather than a copy of the screen: the wrapper gives the route
// and the prototype a Part 3 component to reach for, as the ticket asks,
// without a second implementation of a layout that is already right.
//
// It is the same wrapper ReadingPartTwoIntroScreen is, for the same
// reason, and the two are deliberately not folded into one component
// taking a label prop. The label is the only thing a part chooses today,
// but the intro card is where a part states its own facts, and the next
// part that needs a fourth detail row should be able to pass details
// without every other part's wrapper acquiring the option.
//
// No timer. The part intro screen carries no countdown: the window starts
// when the paragraphs do.

export type ReadingPartThreeIntroScreenProps = {
  content: ReadingPartContent;
  questionCount: number;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingPartThreeIntroScreen({
  content,
  questionCount,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ReadingPartThreeIntroScreenProps) {
  return (
    <ReadingPartIntroScreen
      content={content}
      questionCount={questionCount}
      formatLabel={readingCopy.partThreeIntroFormatLabel}
      metaText={metaText}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
    />
  );
}
