import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ListeningScoreSummaryCard } from "./ListeningScoreSummaryCard";
import { examListening, examScreenBody } from "@/features/exam-engine/exam-theme";
import { listeningReviewCopy } from "@/features/exam-engine/listening-review-copy";
import type { ListeningReviewCopy } from "@/features/exam-engine/listening-review-copy";
import type { ListeningScoreSummary } from "@/features/exam-engine/listening-review-types";

// Practice score screen for a Listening part (EXAM-04).
//
// It shows the summary card and the two ways out: end the part, or go
// back to the answer review. Both are in the canvas rather than in the
// top bar, because this screen is a stopping point and Next would say
// nothing about what happens after it. The bottom bar Back still works,
// and lands on the review screen.
//
// The screen prints no CELPIP score and no CELPIP level. The summary card
// carries the practice result note, and when the answer key is incomplete
// it shows the pending state instead of a number. Nothing on this screen
// calculates anything itself.

export type ListeningScoreScreenProps = {
  // Exam frame title, normally the part title from the content object.
  title: string;
  summary: ListeningScoreSummary;
  // Wording for the part. Defaults to Listening Part 1.
  copy?: ListeningReviewCopy;
  onEndPart?: () => void;
  onReviewAnswers?: () => void;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningScoreScreen({
  title,
  summary,
  copy = listeningReviewCopy,
  onEndPart,
  onReviewAnswers,
  metaText,
  onBack,
  showBack = true,
}: ListeningScoreScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      showNext={false}
      onBack={onBack}
      showBack={showBack}
      backLabel={copy.reviewAnswersLabel}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow heading={copy.scoreTitle} text={copy.scoreSubtitle} />

        <div className={examListening.mediaStack}>
          <ListeningScoreSummaryCard summary={summary} copy={copy} />

          <div className={examScreenBody.actions}>
            <ExamButton variant="primary" size="md" onClick={onEndPart}>
              {copy.endPartLabel}
            </ExamButton>

            <ExamButton
              variant="secondary"
              size="md"
              onClick={onReviewAnswers}
              uppercase={false}
            >
              {copy.reviewAnswersLabel}
            </ExamButton>
          </div>
        </div>
      </div>
    </ExamShell>
  );
}
