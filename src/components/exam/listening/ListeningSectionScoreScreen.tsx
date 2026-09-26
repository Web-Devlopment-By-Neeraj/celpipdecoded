import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ListeningEstimatedBandCard } from "./ListeningEstimatedBandCard";
import { ListeningScoreSummaryCard } from "./ListeningScoreSummaryCard";
import { ListeningSectionScoreBreakdown } from "./ListeningSectionScoreBreakdown";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import { estimateListeningBand } from "@/features/exam-engine/listening-band-score";
import { buildListeningReviewCopy } from "@/features/exam-engine/listening-review-copy";
import type { ListeningReviewCopy } from "@/features/exam-engine/listening-review-copy";
import type { ListeningScoreSummary } from "@/features/exam-engine/listening-review-types";
import { listeningSectionCopy } from "@/features/exam-engine/listening-section-copy";
import type { ListeningSectionCopy } from "@/features/exam-engine/listening-section-copy";
import type { ListeningSectionPartResult } from "@/features/exam-engine/listening-section-types";

// Full Listening practice score screen (EXAM-15).
//
// The only score in the whole run. It shows the four section readings,
// then the part breakdown, then the two ways out: end the section, or go
// back to the answer review. Both controls are in the canvas rather than
// in the top bar, because this screen is a stopping point and Next would
// say nothing about what happens after it. The bottom bar Back still
// works, and lands on the review screen.
//
// The screen prints no official CELPIP score. The summary card carries the
// practice result note, and when part of the answer key is incomplete it
// shows the pending state instead of a number. The counts themselves arrive
// marked from the server; nothing on this screen marks an answer.
//
// EXAM-15C added the estimated band card between the summary and the
// breakdown, and it appears conditionally. estimateListeningBand returns
// null unless the project's own Listening score chart covers the attempt,
// which means a complete answer key and a section of 38 questions, so a
// section that is short a key or is not out of 38 shows the same screen
// this ticket found, with no band on it. Nothing is estimated from a chart
// the project does not have. See listening-band-score.ts.
//
// The four headline readings are the EXAM-04 ListeningScoreSummaryCard,
// not a copy of it. That card takes part wording, and every reading on it
// happens to be part neutral, so the section wording is poured into a part
// copy object below. Only the strings the card actually reads are
// overridden, and the pending explanation is the one string that had to
// be: a section that is short a key is short it in one part out of six,
// which the part sentence does not say.

export type ListeningSectionScoreScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  summary: ListeningScoreSummary;
  parts: ListeningSectionPartResult[];
  copy?: ListeningSectionCopy;
  onEndSection?: () => void;
  onReviewAnswers?: () => void;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningSectionScoreScreen({
  title,
  summary,
  parts,
  copy = listeningSectionCopy,
  onEndSection,
  onReviewAnswers,
  metaText,
  onBack,
  showBack = true,
}: ListeningSectionScoreScreenProps) {
  // null whenever the project criteria do not support an estimate, and the
  // card is left out entirely in that case rather than shown empty.
  const bandEstimate = estimateListeningBand(summary);

  const cardCopy: ListeningReviewCopy = {
    ...buildListeningReviewCopy({ partLabel: copy.sectionName }),
    totalQuestionsLabel: copy.totalQuestionsLabel,
    answeredLabel: copy.answeredLabel,
    correctLabel: copy.correctLabel,
    scoreLabel: copy.scoreLabel,
    pendingValue: copy.pendingValue,
    pendingScoreHeading: copy.pendingScoreHeading,
    pendingScoreText: copy.pendingScoreText,
    practiceResultNote: copy.practiceResultNote,
  };

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

        <ListeningScoreSummaryCard summary={summary} copy={cardCopy} />

        {bandEstimate ? (
          <ListeningEstimatedBandCard estimate={bandEstimate} copy={copy} />
        ) : null}

        <ListeningSectionScoreBreakdown parts={parts} copy={copy} />

        <div className={examScreenBody.actions}>
          <ExamButton variant="primary" size="md" onClick={onEndSection}>
            {copy.endSectionLabel}
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
    </ExamShell>
  );
}
