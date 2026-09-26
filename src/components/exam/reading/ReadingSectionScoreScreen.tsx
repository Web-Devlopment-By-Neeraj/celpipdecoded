import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ReadingEstimatedBandCard } from "./ReadingEstimatedBandCard";
import { ReadingPartBreakdownCard } from "./ReadingPartBreakdownCard";
import { ReadingScoreSummaryCard } from "./ReadingScoreSummaryCard";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import { readingSectionCopy } from "@/features/exam-engine/reading-copy";
import type { ReadingSectionCopy } from "@/features/exam-engine/reading-copy";
import type { ReadingScoreSummary } from "@/features/exam-engine/reading-types";
import type {
  ReadingBandEstimate,
  ReadingSectionPartResult,
} from "@/features/exam-engine/reading-section-types";

// Full Reading practice score screen (EXAM-24).
//
// The only score in the whole run, and the screen a learner reaches when
// they finish Part 4. It shows, in order:
//
// - the five section readings, correct out of the whole Reading section,
//   the percentage, the answered count and the blank count
// - the estimated CELPIP Reading band, when the local scoring chart
//   covers the attempt
// - the part breakdown, four rows with their own denominators
// - the three ways out: the answer review, a restart, and the dashboard
//
// The controls are in the canvas rather than in the top bar, because this
// screen is a stopping point and a bare Next would say nothing about what
// happens after it. Review answers is what moves the flow forward onto
// the review.
//
// The five headline readings are the EXAM-17 ReadingScoreSummaryCard, not
// a copy of it. Every reading on that card is part neutral and counts the
// same way for a section, so the only thing the section passes is its own
// two notes: the part note ends by saying no CELPIP level is estimated
// from one part, which would be a lie under the band card below it.
//
// The band card appears conditionally. estimateReadingBand returns null
// unless the project's own Reading score chart covers the attempt, which
// means a section of exactly 38 questions, so a section that is not out
// of 38 shows this screen with no band on it rather than a card with a
// guess in it. Nothing is estimated from a chart the project does not
// have. See reading-band-score.ts.
//
// The screen prints no official CELPIP score and no official CELPIP
// level. The summary card carries the practice result note, the band card
// carries the practice estimate note, and the notice under the actions
// says nothing was saved.
//
// Presentational only. Every number arrives marked from the server, and
// nothing on this screen marks an answer or estimates a band.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ReadingSectionScoreScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  summary: ReadingScoreSummary;
  parts: ReadingSectionPartResult[];
  // null whenever the local scoring chart does not cover the attempt, in
  // which case the band card is left out entirely rather than shown
  // empty.
  estimatedBand: ReadingBandEstimate | null;
  copy?: ReadingSectionCopy;
  onReviewAnswers?: () => void;
  onRestart?: () => void;
  dashboardHref?: string;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingSectionScoreScreen({
  title,
  summary,
  parts,
  estimatedBand,
  copy = readingSectionCopy,
  onReviewAnswers,
  onRestart,
  dashboardHref = "/dashboard",
  metaText,
  onBack,
  showBack = true,
}: ReadingSectionScoreScreenProps) {
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
          heading={copy.scoreTitle}
          text={copy.scoreSubtitle}
        />

        <ReadingScoreSummaryCard
          summary={summary}
          practiceResultNote={copy.practiceResultNote}
          blankNote={copy.blankNote}
        />

        {estimatedBand ? (
          <ReadingEstimatedBandCard estimate={estimatedBand} copy={copy} />
        ) : null}

        <ReadingPartBreakdownCard parts={parts} copy={copy} />

        <div className={examScreenBody.actions}>
          <ExamButton
            variant="primary"
            size="md"
            onClick={onReviewAnswers}
            uppercase={false}
          >
            {copy.reviewAnswersLabel}
          </ExamButton>

          {onRestart ? (
            <ExamButton
              variant="secondary"
              size="md"
              onClick={onRestart}
              uppercase={false}
            >
              {copy.restartLabel}
            </ExamButton>
          ) : null}

          <ExamButton
            variant="secondary"
            size="md"
            href={dashboardHref}
            uppercase={false}
          >
            {copy.backToDashboardLabel}
          </ExamButton>
        </div>

        <p className={examScreenBody.notice}>{copy.scoreNotice}</p>
      </div>
    </ExamShell>
  );
}
