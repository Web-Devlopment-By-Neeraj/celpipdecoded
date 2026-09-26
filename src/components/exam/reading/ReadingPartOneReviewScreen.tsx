import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ReadingReviewQuestionCard } from "./ReadingReviewQuestionCard";
import { ReadingScoreSummaryCard } from "./ReadingScoreSummaryCard";
import {
  examReadingReview,
  examScreenBody,
  examText,
} from "@/features/exam-engine/exam-theme";
import { readingReviewCopy } from "@/features/exam-engine/reading-copy";
import type {
  ReadingReviewRow,
  ReadingScoreSummary,
} from "@/features/exam-engine/reading-types";

// Answer review screen for Reading Part 1 (EXAM-17).
//
// Opened from the score screen, and the last screen in the part. It lists
// every question with the option the learner chose, the correct option,
// and a status word.
//
// The summary card is repeated at the top rather than being left behind
// on the score screen, because the review is a long scroll and the result
// it explains should be visible at the head of it. It is the same
// component, so the two screens cannot disagree about a number.
//
// Back goes to the score screen rather than out of the part, and the
// score screen's own Back goes to the questions, so the whole sequence
// stays walkable during review. That is prototype behaviour, kept for the
// same reason Back is enabled on every EXAM-16 screen.
//
// The list is a plain ordered list of cards inside the exam canvas, which
// is the one scrolling region on the screen. The two bars stay put and
// nothing scrolls sideways.
//
// What is deliberately not here:
//
// - No AI explanations and no invented ones. A card prints an explanation
//   only when the source document gives one, and Mock Test 1 publishes
//   none for Reading.
// - No estimated CELPIP Reading band, and no CELPIP level. One part is
//   not a section.
// - No answer key beyond the correct answers for the questions the
//   learner has now finished, which is the point at which showing them is
//   fair.
//
// No state of its own, and no marking of its own. The rows arrive already
// built by the server action, from where the answer key lives.
//
// No timer. Nothing is being timed on a screen with no task on it.

export type ReadingPartOneReviewScreenProps = {
  // Exam frame title, normally the full title from the content object.
  title: string;
  rows: ReadingReviewRow[];
  // Repeated at the head of the review. Omit to drop the card.
  summary?: ReadingScoreSummary;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingPartOneReviewScreen({
  title,
  rows,
  summary,
  metaText,
  onBack,
  showBack = true,
}: ReadingPartOneReviewScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      // The last screen in the part, so there is nowhere for Next to go.
      showNext={false}
      onBack={onBack}
      showBack={showBack}
      backLabel={readingReviewCopy.backToScoreLabel}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow
          heading={readingReviewCopy.reviewTitle}
          text={readingReviewCopy.reviewSubtitle}
        />

        {summary ? <ReadingScoreSummaryCard summary={summary} /> : null}

        {rows.length > 0 ? (
          <ol className={examReadingReview.list}>
            {rows.map((row) => (
              <ReadingReviewQuestionCard key={row.questionId} row={row} />
            ))}
          </ol>
        ) : (
          <p className={examText.muted}>{readingReviewCopy.reviewEmptyText}</p>
        )}

        <p className={examScreenBody.notice}>
          {readingReviewCopy.reviewNotice}
        </p>
      </div>
    </ExamShell>
  );
}
