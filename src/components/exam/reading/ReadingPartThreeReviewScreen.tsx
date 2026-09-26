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

// Answer review for Mock Test 1 Reading Part 3 (EXAM-21).
//
// All 9 statements in the part, in order, each with the paragraph the
// learner chose, the correct paragraph, and a Correct, Incorrect or Blank
// status. The score summary is repeated at the top so the list has its
// total beside it and the learner does not have to go back for it.
//
// Every row is a ReadingReviewQuestionCard, the card Reading Parts 1 and
// 2 use, unchanged. It is already part neutral, it prints "No answer
// selected" for a blank while still showing the correct answer, and it
// prints an explanation only when the row carries one. Reading Part 3's
// source document prints no explanations, so no row here carries one and
// none is invented. There are no AI written explanations anywhere in this
// flow.
//
// The card needs nothing new for this part even though Part 3 answers
// differently from the two before it. Its questions are whole statements
// rather than sentence stems, so the header prints the statement as it
// stands, and its answers are the single letters A to E, which is exactly
// what the learner picked on the question screen. A learner reading
// "Your answer: C, Correct answer: D" is reading the same two letters
// they chose between, so nothing has to be reworded to make the row
// legible.
//
// A separate file from ReadingPartTwoReviewScreen for the reason given in
// ReadingPartThreeScoreScreen: the two differ by their title alone, and
// sharing one screen would mean editing two working routes.
//
// No estimated CELPIP Reading band, and no official score wording. The
// result is a CELPIP Decoded practice score throughout.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ReadingPartThreeReviewScreenProps = {
  title: string;
  rows: ReadingReviewRow[];
  summary?: ReadingScoreSummary;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingPartThreeReviewScreen({
  title,
  rows,
  summary,
  metaText,
  onBack,
  showBack = true,
}: ReadingPartThreeReviewScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      showNext={false}
      onBack={onBack}
      showBack={showBack}
      backLabel={readingReviewCopy.backToScoreLabel}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow
          heading={readingReviewCopy.partThreeReviewTitle}
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
        <p className={examScreenBody.notice}>{readingReviewCopy.reviewNotice}</p>
      </div>
    </ExamShell>
  );
}
