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

// Answer review for Mock Test 1 Reading Part 4 (EXAM-23).
//
// All 10 questions in the part, in order, each with the option the
// learner chose, the correct option, and a Correct, Incorrect or Blank
// status. The score summary is repeated at the top so the list has its
// total beside it and the learner does not have to go back for it.
//
// Every row is a ReadingReviewQuestionCard, the card Reading Parts 1, 2
// and 3 use, unchanged. It is already part neutral, it prints "No answer
// selected" for a blank while still showing the correct answer, and it
// prints an explanation only when the row carries one. Reading Part 4's
// source document prints no explanations, so no row here carries one and
// none is invented. There are no AI written explanations anywhere in this
// flow.
//
// The card needs nothing new for this part, even though Part 4 is the
// first Reading part whose two panels are answered differently from each
// other. Questions 1 to 5 are sentence stems, so the header prints the
// stem with dots where the blank falls, which is what
// formatReadingQuestionText already does for the Part 1 stems. Questions
// 6 to 10 are numbered blanks inside the reader comment and print no stem
// of their own, so the header prints the line the marking action passes
// in, "Blank in the reader comment.", rather than a sentence invented
// from the surrounding text. Both shapes were already handled; only the
// wording for the second one is new, and it is copy rather than logic.
//
// A separate file from ReadingPartThreeReviewScreen for the reason given
// in ReadingPartFourScoreScreen: the two differ by their title alone, and
// sharing one screen would mean editing three working routes.
//
// No estimated CELPIP Reading band, and no official score wording. The
// result is a CELPIP Decoded practice score throughout.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ReadingPartFourReviewScreenProps = {
  title: string;
  rows: ReadingReviewRow[];
  summary?: ReadingScoreSummary;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingPartFourReviewScreen({
  title,
  rows,
  summary,
  metaText,
  onBack,
  showBack = true,
}: ReadingPartFourReviewScreenProps) {
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
          heading={readingReviewCopy.partFourReviewTitle}
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
