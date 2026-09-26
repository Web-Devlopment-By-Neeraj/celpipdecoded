import { ExamInstructionScreen } from "../ExamInstructionScreen";
import type { ListeningSectionInstructionContent } from "@/features/exam-engine/listening-section-types";

// Listening section instruction text screen (EXAM-15).
//
// The first screen of the full Listening run, and screen type 1 from
// docs/product/exam-engine-screen-types.md, so it is the EXAM-02
// ExamInstructionScreen with the section content filled in rather than a
// new layout. It is the section counterpart of ListeningPartIntroScreen:
// that one opens a part, this one opens the whole section.
//
// The instruction lines and the notice come from the content object,
// which builds them from listening-section-copy.ts, so this component
// holds no wording of its own.
//
// **What the reference pass took off this screen.** It carried three
// blocks the exam frame around it already says, and together they were
// what made the first screen of the test read as a product page:
//
// - an intro card, with an uppercase eyebrow, a bold "Listening Test"
//   headline, a summary sentence and a row of counts. The window title
//   bar says which test this is, so the card was saying it a second time
//   in marketing type.
// - the section progress bar, drawing an empty track and "0 of 38
//   questions answered" before the learner has been shown a question.
// - the "Read the following information before the Listening section
//   begins" line under the heading, which is what an instructions screen
//   is for.
//
// What is left is what the reference layout has: the heading with its
// information glyph, the rules under it, and the practice caveat as a
// quiet last line. The progress bar is unchanged and still appears on
// the part transitions, where it is answering a question a learner in the
// middle of a six part run actually has.
//
// No timer. Instruction screens carry no countdown.

export type ListeningSectionInstructionScreenProps = {
  content: ListeningSectionInstructionContent;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningSectionInstructionScreen({
  content,
  metaText,
  onNext,
  onBack,
  showBack = false,
}: ListeningSectionInstructionScreenProps) {
  return (
    <ExamInstructionScreen
      title={content.title}
      heading={content.heading}
      instructions={content.instructions}
      noticeText={content.noticeText}
      metaText={metaText}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
    />
  );
}
