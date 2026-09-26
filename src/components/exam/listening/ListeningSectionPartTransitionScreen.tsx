import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ListeningSectionProgressBar } from "./ListeningSectionProgressBar";
import { examListening, examScreenBody } from "@/features/exam-engine/exam-theme";
import {
  formatListeningSectionTransition,
  listeningSectionCopy,
} from "@/features/exam-engine/listening-section-copy";
import type { ListeningSectionCopy } from "@/features/exam-engine/listening-section-copy";

// Part transition screen inside the full Listening section (EXAM-15).
//
// The doorway between two parts. One line saying which part just finished
// and which one is next, the progress bar, and Next.
//
// It shows no score, no correct count and nothing at all about how the
// part that just closed went. That is the whole reason this screen exists
// rather than the part level closing screens: in the full section run a
// part hands straight over to the next one, and the only result a learner
// sees is the one at the end. The copy file records the same rule so a
// later edit does not quietly add a count here.
//
// Modelled on ListeningSectionBreakScreen, which does the same job between
// two conversation sections inside Part 1. It is a separate component
// because the wording, the progress bar and the position in the flow are
// all different, and because widening the break screen would put section
// level props on a screen that belongs to a part.

export type ListeningSectionPartTransitionScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  // The part that just finished, for example "Listening Part 2".
  completedPartLabel: string;
  // The part that is starting, for example "Listening Part 3".
  nextPartLabel: string;
  // Position of the part that is starting, counting from 1.
  nextPartNumber: number;
  totalParts: number;
  totalQuestions: number;
  answeredCount: number;
  copy?: ListeningSectionCopy;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningSectionPartTransitionScreen({
  title,
  completedPartLabel,
  nextPartLabel,
  nextPartNumber,
  totalParts,
  totalQuestions,
  answeredCount,
  copy = listeningSectionCopy,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ListeningSectionPartTransitionScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow
          heading={copy.transitionHeading}
          text={formatListeningSectionTransition(
            completedPartLabel,
            nextPartLabel,
          )}
        />

        <div className={examListening.mediaStack}>
          <ListeningSectionProgressBar
            // The bar shows the part about to start, so it moves forward
            // as the learner steps through the doorway rather than a
            // screen later.
            currentPart={nextPartNumber}
            totalParts={totalParts}
            answeredCount={answeredCount}
            totalQuestions={totalQuestions}
            copy={copy}
          />

          <p className={examScreenBody.hint}>{copy.transitionHint}</p>
        </div>
      </div>
    </ExamShell>
  );
}
