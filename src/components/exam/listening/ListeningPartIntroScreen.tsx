import { ExamInstructionScreen } from "../ExamInstructionScreen";
import { ExamSectionIntroCard } from "../ExamSectionIntroCard";
import { listeningCopy } from "@/features/exam-engine/listening-copy";
import type {
  ExamInstruction,
  ExamSectionIntroDetail,
} from "@/features/exam-engine/instruction-screen-types";
import type { ListeningScenario } from "@/features/exam-engine/listening-types";

// Part intro screen for a Listening part (EXAM-03).
//
// Screen type 1 from docs/product/exam-engine-screen-types.md, so it is
// the EXAM-02 ExamInstructionScreen with the part content filled in
// rather than a new layout. The part name, the bullets and the counts all
// come from the content object, so this component holds no Mock Test 1
// text of its own.
//
// The intro card carries the facts a learner wants before they start: how
// many questions there are, how the part is delivered, and, for a part
// built from conversation sections, how many of those there are.
//
// EXAM-09 narrowed the content prop. It used to be ListeningPartContent,
// which meant a part had to have a sections array to have an intro
// screen. Listening Part 4 is a dropdown part and has one clip and no
// sections, so the prop is now the header fields this screen actually
// reads, which both content shapes satisfy. The section count moved out
// to its own prop for the same reason: a part that has no sections omits
// it and the row disappears rather than reading "Sections 1".
//
// No timer. The part intro screen carries no countdown.

// The part header fields this screen reads.
//
// Deliberately structural rather than a Pick of one content type, so
// ListeningPartContent and ListeningDropdownPartContent both satisfy it
// without either importing the other.
export type ListeningPartIntroContent = {
  title: string;
  partTitle: string;
  subtitle?: string;
  instructions: ExamInstruction[];
  scenario: ListeningScenario;
};

export type ListeningPartIntroScreenProps = {
  content: ListeningPartIntroContent;
  questionCount: number;
  // How many conversation sections the part has. Omit for a part that is
  // not built from sections, and the row is left out.
  sectionCount?: number;
  // What the learner will be given, for example "News audio and dropdown
  // questions".
  formatLabel?: string;
  // Replaces the whole detail list, for a part whose facts are not the
  // usual three.
  details?: ExamSectionIntroDetail[];
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningPartIntroScreen({
  content,
  questionCount,
  sectionCount,
  formatLabel = "Audio and questions",
  details,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ListeningPartIntroScreenProps) {
  const introDetails: ExamSectionIntroDetail[] = details ?? [
    ...(sectionCount === undefined
      ? []
      : [{ label: "Sections", value: String(sectionCount) }]),
    { label: "Questions", value: String(questionCount) },
    { label: "Format", value: formatLabel },
  ];

  return (
    <ExamInstructionScreen
      title={content.title}
      subtitle={content.subtitle ?? listeningCopy.partIntroSubtitle}
      instructions={content.instructions}
      noticeText={listeningCopy.partIntroNotice}
      metaText={metaText}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
      intro={
        // No practice eyebrow above the part name. The window this screen
        // sits in is the practice test, and a screen inside it saying so
        // in small caps is a product label on an exam (reference pass).
        <ExamSectionIntroCard
          title={content.partTitle}
          summary={content.scenario.text}
          details={introDetails}
        />
      }
    />
  );
}
