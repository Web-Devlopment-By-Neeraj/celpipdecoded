import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ReadingScoreSummaryCard } from "./ReadingScoreSummaryCard";
import {
  examListening,
  examScreenBody,
} from "@/features/exam-engine/exam-theme";
import {
  readingCopy,
  readingReviewCopy,
} from "@/features/exam-engine/reading-copy";
import type { ReadingScoreSummary } from "@/features/exam-engine/reading-types";

// Practice score for Mock Test 1 Reading Part 4 (EXAM-23).
//
// The screen a learner reaches when they finish the part. It shows the
// summary the server action counted, correct out of the ten questions,
// and offers the three ways out: the answer review, a restart, and the
// dashboard.
//
// Everything on it that carries a number comes from
// ReadingScoreSummaryCard, the card Reading Parts 1, 2 and 3 use,
// unchanged. The card is already part neutral: it labels the counts,
// prints the practice score, and carries both the blank note and the
// "not an official CELPIP score" note, so there is nothing about the
// earlier parts in it to strip out. This file is the frame around it.
//
// It is a separate file from ReadingPartThreeScoreScreen rather than a
// shared screen with the part name passed in, for the reason that file
// gives: the two differ by exactly two lines, the title and the restart
// label, and the Part 1, Part 2 and Part 3 screens are working and
// shipped. A shared screen would mean editing three live routes'
// components to add a fourth part, which this ticket asks us not to do.
// This is now the fourth near identical pair, which is the point
// docs/product/reading-part-3-review-score.md named as the moment to
// build buildReadingReviewCopy and fold the four into one. That is
// written up as EXAM-24 work rather than done here, because it touches
// Parts 1 to 3. Every reusable piece is already reused: the shell, the
// instruction row, the button, and the card doing all the counting.
//
// No estimated CELPIP Reading band appears, here or in the review. A band
// is a reading of the whole section and this is one part of four, so
// there is nothing honest to show yet. That waits for the full Reading
// section.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ReadingPartFourScoreScreenProps = {
  title: string;
  summary: ReadingScoreSummary;
  onReviewAnswers?: () => void;
  onRestart?: () => void;
  dashboardHref?: string;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingPartFourScoreScreen({
  title,
  summary,
  onReviewAnswers,
  onRestart,
  dashboardHref = "/dashboard",
  metaText,
  onBack,
  showBack = true,
}: ReadingPartFourScoreScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      showNext={false}
      onBack={onBack}
      showBack={showBack}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow
          heading={readingReviewCopy.partFourScoreTitle}
          text={readingReviewCopy.scoreSubtitle}
        />
        {/* The capped centre column the Listening closing screens use, so
            the card and its actions do not stretch across a full width
            canvas. */}
        <div className={examListening.mediaStack}>
          <ReadingScoreSummaryCard summary={summary} />
          <div className={examScreenBody.actions}>
            <ExamButton
              variant="primary"
              size="md"
              onClick={onReviewAnswers}
              uppercase={false}
            >
              {readingReviewCopy.reviewAnswersLabel}
            </ExamButton>
            {onRestart ? (
              <ExamButton
                variant="secondary"
                size="md"
                onClick={onRestart}
                uppercase={false}
              >
                {readingCopy.partFourRestartLabel}
              </ExamButton>
            ) : null}
            <ExamButton
              variant="secondary"
              size="md"
              href={dashboardHref}
              uppercase={false}
            >
              {readingReviewCopy.backToDashboardLabel}
            </ExamButton>
          </div>
          <p className={examScreenBody.notice}>
            {readingReviewCopy.scoreNotice}
          </p>
        </div>
      </div>
    </ExamShell>
  );
}
