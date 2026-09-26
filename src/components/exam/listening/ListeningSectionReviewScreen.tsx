import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ListeningSectionProgressBar } from "./ListeningSectionProgressBar";
import { ListeningSectionReviewTable } from "./ListeningSectionReviewTable";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import { listeningSectionCopy } from "@/features/exam-engine/listening-section-copy";
import type { ListeningSectionCopy } from "@/features/exam-engine/listening-section-copy";
import type { ListeningSectionPartResult } from "@/features/exam-engine/listening-section-types";

// Full Listening answer review screen (EXAM-15).
//
// The first screen after Part 6, and the first result a learner sees in
// the whole run. It lists all 38 questions grouped by part, each with the
// option they chose, the correct option, and a status word, then sends
// them on to the practice score with Next.
//
// Back goes to the last question screen of Part 6 rather than out of the
// section, so the sequence stays walkable during review with every answer
// still selected. That is prototype behaviour, kept for the same reason
// Back is enabled on every screen in the flow.
//
// The section counterpart of ListeningAnswerReviewScreen. It is a separate
// component rather than a widened version of that one because the body is
// six grouped tables instead of one, and because the wording, the Next
// label and the progress bar all belong to the section. The tables
// themselves are the same component.
//
// The answer and explanation sheets are deliberately not offered here. A
// part level review shows one part's sheet behind a disclosure; six
// disclosures at the end of a full run is a different screen, and it is
// recorded as a follow up in
// docs/product/full-listening-section-flow.md rather than guessed at.
//
// No state of its own. The results arrive already marked, from the server,
// where the answer keys live.

export type ListeningSectionReviewScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  parts: ListeningSectionPartResult[];
  totalParts: number;
  totalQuestions: number;
  answeredCount: number;
  copy?: ListeningSectionCopy;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningSectionReviewScreen({
  title,
  parts,
  totalParts,
  totalQuestions,
  answeredCount,
  copy = listeningSectionCopy,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ListeningSectionReviewScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      nextLabel={copy.viewScoreLabel}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
      backLabel={copy.backLabel}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow
          heading={copy.reviewTitle}
          text={copy.reviewSubtitle}
        />

        <ListeningSectionProgressBar
          currentPart={totalParts}
          totalParts={totalParts}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          copy={copy}
        />

        <ListeningSectionReviewTable parts={parts} />

        <p className={examScreenBody.notice}>{copy.reviewNotice}</p>
      </div>
    </ExamShell>
  );
}
