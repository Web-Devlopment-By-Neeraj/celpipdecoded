import { ReadingPartIntroScreen } from "./ReadingPartIntroScreen";
import { readingCopy } from "@/features/exam-engine/reading-copy";
import type { ReadingPartContent } from "@/features/exam-engine/reading-types";

// Part intro screen for Reading Part 4 (EXAM-22).
//
// Screen type 1 from docs/product/exam-engine-screen-types.md. It is the
// shared ReadingPartIntroScreen with the Part 4 format label filled in,
// not a fourth intro screen: the part name, the bullets, the summary, the
// question count and the time all come from the content object, and the
// one thing Part 4 says differently is what the learner is given.
//
// Part 1 says "Message, response and drop-down questions", Part 2 says
// "Diagram, email and drop-down questions" and Part 3 says "Labelled
// paragraphs and paragraph matching". Part 4 is an article with a reader
// comment under it, so it says so. That is a one line difference in
// practice, which is exactly why this is a thin named wrapper rather than
// a copy of the screen: the wrapper gives the route and the prototype a
// Part 4 component to reach for, as the ticket asks, without a second
// implementation of a layout that is already right.
//
// It is the same wrapper ReadingPartTwoIntroScreen and
// ReadingPartThreeIntroScreen are, for the same reason, and the three are
// deliberately not folded into one component taking a label prop. The
// label is the only thing a part chooses today, but the intro card is
// where a part states its own facts, and the next part that needs a
// fourth detail row should be able to pass details without every other
// part's wrapper acquiring the option.
//
// No timer. The part intro screen carries no countdown: the window starts
// when the article does.

export type ReadingPartFourIntroScreenProps = {
  content: ReadingPartContent;
  questionCount: number;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingPartFourIntroScreen({
  content,
  questionCount,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ReadingPartFourIntroScreenProps) {
  return (
    <ReadingPartIntroScreen
      content={content}
      questionCount={questionCount}
      formatLabel={readingCopy.partFourIntroFormatLabel}
      metaText={metaText}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
    />
  );
}
