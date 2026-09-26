import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ReadingScoreSummaryCard } from "./ReadingScoreSummaryCard";
import {
  examListening,
  examScreenBody,
} from "@/features/exam-engine/exam-theme";
import { readingReviewCopy } from "@/features/exam-engine/reading-copy";
import type { ReadingScoreSummary } from "@/features/exam-engine/reading-types";

// Practice score screen for Reading Part 1 (EXAM-17).
//
// The screen a learner lands on when they finish the part, and the point
// the part stops. It carries the summary card and the three ways out:
// open the answer review, start the part again, or leave for the
// dashboard.
//
// The three actions are in the canvas rather than in the top bar, because
// this is a stopping point and a bare Next would say nothing about what
// happens after it. The bottom bar Back still works and lands on the
// question screen with every answer still selected, which is the
// prototype affordance the ticket asks for.
//
// Review answers is the primary action rather than Back to dashboard.
// The review is the thing this screen was built to lead to, and a learner
// who wants to leave can use either the secondary control here or the
// dashboard link.
//
// Back to dashboard is a link rather than a handler, so it keeps middle
// click and open in a new tab. Restart is a handler, because clearing the
// answers held on the page is the prototype's business, not the router's.
//
// The screen prints no CELPIP score, no CELPIP level and no estimated
// Reading band. The summary card carries the practice result note, and
// nothing on this screen calculates anything itself: every number arrives
// on the summary, marked on the server.
//
// No timer. Nothing is being timed on a screen with no task on it.

export type ReadingPartOneScoreScreenProps = {
  // Exam frame title, normally the full title from the content object.
  title: string;
  summary: ReadingScoreSummary;
  // Opens the answer review.
  onReviewAnswers?: () => void;
  // Clears the answers and returns to the first screen. Omit to hide the
  // control.
  onRestart?: () => void;
  // Where Back to dashboard goes.
  dashboardHref?: string;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingPartOneScoreScreen({
  title,
  summary,
  onReviewAnswers,
  onRestart,
  dashboardHref = "/dashboard",
  metaText,
  onBack,
  showBack = true,
}: ReadingPartOneScoreScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      // The review is opened from the canvas, so the top bar Next would
      // be a second control doing the same thing.
      showNext={false}
      onBack={onBack}
      showBack={showBack}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow
          heading={readingReviewCopy.scoreTitle}
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
                {readingReviewCopy.restartLabel}
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
