import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import {
  formatReadingSectionTransition,
  readingSectionCopy,
} from "@/features/exam-engine/reading-copy";
import type { ReadingSectionCopy } from "@/features/exam-engine/reading-copy";

// Part transition screen inside the full Reading section (EXAM-24).
//
// The doorway between two parts. One line saying which part just finished
// and which one is next, a quiet hint, and Next. Three of them appear in
// the run: after Part 1, after Part 2 and after Part 3.
//
// It shows no score, no correct count and nothing at all about how the
// part that just closed went. That is the whole reason this screen exists
// rather than the part level score and review screens: in the full
// section run a part hands straight over to the next one, and the only
// result a learner sees is the one at the end. reading-copy.ts records
// the same rule beside the wording so a later edit does not quietly add a
// count here.
//
// The Reading counterpart of ListeningSectionPartTransitionScreen, minus
// its progress bar. The Listening bar counts screens through a 61 screen
// run where a learner can lose their place; a Reading run is 14 screens
// and the top bar meta line already says which part of four they are on,
// so a bar here would be chrome rather than information.
//
// Presentational only. It holds no state and reads no content object.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ReadingSectionTransitionScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  // The part that just finished, for example "Reading Part 2".
  completedPartLabel: string;
  // The part that is starting, for example "Reading Part 3".
  nextPartLabel: string;
  copy?: ReadingSectionCopy;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingSectionTransitionScreen({
  title,
  completedPartLabel,
  nextPartLabel,
  copy = readingSectionCopy,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ReadingSectionTransitionScreenProps) {
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
          text={formatReadingSectionTransition(
            completedPartLabel,
            nextPartLabel,
          )}
        />

        <p className={examScreenBody.hint}>{copy.transitionHint}</p>
      </div>
    </ExamShell>
  );
}
