import { examScore } from "@/features/exam-engine/exam-theme";
import {
  formatListeningCountOfTotal,
  formatListeningMissingKeyCount,
  formatListeningScorePercent,
  listeningReviewCopy,
} from "@/features/exam-engine/listening-review-copy";
import type { ListeningReviewCopy } from "@/features/exam-engine/listening-review-copy";
import type { ListeningScoreSummary } from "@/features/exam-engine/listening-review-types";

// Practice score summary for a Listening part (EXAM-04).
//
// Four readings in a row, then the practice result note. It is a bordered
// strip on the exam canvas, not a dashboard card: no shadow, no artwork,
// no pill, and nothing that would look at home on a marketing page.
//
// The summary type carries correctCount and scorePercent as null when the
// answer key is incomplete, and this component renders that state instead
// of a number. So a partial key produces "Pending" in two cells plus a
// short explanation block, never a score calculated against whatever
// happened to be transcribed.
//
// The result is called a practice score everywhere, and the note under it
// says in full that it is not an official CELPIP score. No CELPIP level
// is shown anywhere.

export type ListeningScoreSummaryCardProps = {
  summary: ListeningScoreSummary;
  // Wording for the part. Every reading on this card happens to be part
  // neutral today, so the prop exists to keep one copy object flowing
  // through the whole score screen rather than two.
  copy?: ListeningReviewCopy;
};

export function ListeningScoreSummaryCard({
  summary,
  copy = listeningReviewCopy,
}: ListeningScoreSummaryCardProps) {
  const {
    totalQuestions,
    answeredCount,
    correctCount,
    scorePercent,
    hasCompleteAnswerKey,
    missingKeyCount,
  } = summary;

  return (
    <div className={examScore.card}>
      <div className={examScore.grid}>
        <div className={examScore.item}>
          <span className={examScore.label}>
            {copy.totalQuestionsLabel}
          </span>
          <span className={examScore.value}>{totalQuestions}</span>
        </div>

        <div className={examScore.item}>
          <span className={examScore.label}>
            {copy.answeredLabel}
          </span>
          <span className={examScore.value}>
            {formatListeningCountOfTotal(answeredCount, totalQuestions)}
          </span>
        </div>

        <div className={examScore.item}>
          <span className={examScore.label}>
            {copy.correctLabel}
          </span>
          {correctCount === null ? (
            <span className={examScore.pendingValue}>
              {copy.pendingValue}
            </span>
          ) : (
            <span className={examScore.value}>
              {formatListeningCountOfTotal(correctCount, totalQuestions)}
            </span>
          )}
        </div>

        <div className={examScore.item}>
          <span className={examScore.label}>
            {copy.scoreLabel}
          </span>
          {scorePercent === null ? (
            <span className={examScore.pendingValue}>
              {copy.pendingValue}
            </span>
          ) : (
            <span className={examScore.headlineValue}>
              {formatListeningScorePercent(scorePercent)}
            </span>
          )}
        </div>
      </div>

      {hasCompleteAnswerKey ? null : (
        <div className={examScore.pending}>
          <p className={examScore.pendingHeading}>
            {copy.pendingScoreHeading}
          </p>
          <p className={examScore.pendingText}>
            {copy.pendingScoreText}
          </p>
          <p className={examScore.pendingText}>
            {formatListeningMissingKeyCount(missingKeyCount, totalQuestions)}
          </p>
        </div>
      )}

      <p className={examScore.note}>
        {copy.practiceResultNote}
      </p>
    </div>
  );
}
