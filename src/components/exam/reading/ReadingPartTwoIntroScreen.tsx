import { ReadingPartIntroScreen } from "./ReadingPartIntroScreen";
import { readingCopy } from "@/features/exam-engine/reading-copy";
import type { ReadingPartContent } from "@/features/exam-engine/reading-types";

// Part intro screen for Reading Part 2 (EXAM-18).
//
// Screen type 1 from docs/product/exam-engine-screen-types.md. It is the
// shared ReadingPartIntroScreen with the Part 2 format label filled in,
// not a second intro screen: the part name, the bullets, the summary, the
// question count and the time all come from the content object, and the
// one thing Part 2 says differently is what the learner is given.
//
// Part 1 says "Message, response and drop-down questions". Part 2 is a
// brochure and an email, so it says so. That is a one word difference in
// practice, which is exactly why this is a thin named wrapper rather than
// a copy of the screen: the wrapper gives the route and the prototype a
// Part 2 component to reach for, as the ticket asks, without a second
// implementation of a layout that is already right.
//
// No timer. The part intro screen carries no countdown: the window starts
// when the diagram does.

export type ReadingPartTwoIntroScreenProps = {
  content: ReadingPartContent;
  questionCount: number;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingPartTwoIntroScreen({
  content,
  questionCount,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ReadingPartTwoIntroScreenProps) {
  return (
    <ReadingPartIntroScreen
      content={content}
      questionCount={questionCount}
      formatLabel={readingCopy.partTwoIntroFormatLabel}
      metaText={metaText}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
    />
  );
}
