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

// Answer review for Mock Test 1 Reading Part 2 (EXAM-19).
//
// All 8 questions in the part, in order, each with the option the learner
// chose, the correct option, and a Correct, Incorrect or Blank status. The
// score summary is repeated at the top so the list has its total beside
// it and the learner does not have to go back for it.
//
// Every row is a ReadingReviewQuestionCard, the card Reading Part 1 uses,
// unchanged. It is already part neutral, it prints "No answer selected"
// for a blank while still showing the correct answer, and it prints an
// explanation only when the row carries one. Reading Part 2's source
// document prints no explanations, so no row here carries one and none is
// invented. There are no AI written explanations anywhere in this flow.
//
// A separate file from ReadingPartOneReviewScreen for the reason given in
// ReadingPartTwoScoreScreen: the two differ by their title alone, and
// sharing one screen would mean editing the working Part 1 route.
//
// No estimated CELPIP Reading band, and no official score wording. The
// result is a CELPIP Decoded practice score throughout.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ReadingPartTwoReviewScreenProps = {
  title: string;
  rows: ReadingReviewRow[];
  summary?: ReadingScoreSummary;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingPartTwoReviewScreen({
  title,
  rows,
  summary,
  metaText,
  onBack,
  showBack = true,
}: ReadingPartTwoReviewScreenProps) {
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
          heading={readingReviewCopy.partTwoReviewTitle}
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
