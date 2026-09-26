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

// Practice score for Mock Test 1 Reading Part 2 (EXAM-19).
//
// The screen a learner reaches when they finish the part. It shows the
// summary the server action counted, and offers the three ways out: the
// answer review, a restart, and the dashboard.
//
// Everything on it that carries a number comes from ReadingScoreSummaryCard,
// the card Reading Part 1 uses, unchanged. The card is already part
// neutral: it labels the counts, prints the practice score, and carries
// both the blank note and the "not an official CELPIP score" note, so
// there is nothing about Part 1 in it to strip out. This file is the
// frame around it.
//
// It is a separate file from ReadingPartOneScoreScreen rather than a
// shared screen with the part name passed in, because the two differ by
// exactly one line, the title, and the Part 1 screen is working and
// shipped. A shared screen would mean editing the Part 1 route's
// component to add Part 2, which the ticket asks us not to do without
// reason. Every reusable piece here already is reused: the shell, the
// instruction row, the button, and the card doing all the counting.
//
// No estimated CELPIP Reading band appears, here or in the review. A band
// is a reading of the whole section and this is one part of four, so
// there is nothing honest to show yet. That waits for the full Reading
// section.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ReadingPartTwoScoreScreenProps = {
  title: string;
  summary: ReadingScoreSummary;
  onReviewAnswers?: () => void;
  onRestart?: () => void;
  dashboardHref?: string;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingPartTwoScoreScreen({
  title,
  summary,
  onReviewAnswers,
  onRestart,
  dashboardHref = "/dashboard",
  metaText,
  onBack,
  showBack = true,
}: ReadingPartTwoScoreScreenProps) {
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
          heading={readingReviewCopy.partTwoScoreTitle}
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
                {readingCopy.partTwoRestartLabel}
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
