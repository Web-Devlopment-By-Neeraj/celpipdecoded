import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { SpeakingPracticeDisclaimer } from "./SpeakingPracticeDisclaimer";
import { SpeakingTaskResultCard } from "./SpeakingTaskResultCard";
import {
  examBandCard,
  examScreenBody,
  examSpeakingReview,
} from "@/features/exam-engine/exam-theme";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockEvaluation } from "@/features/exam-engine/speaking-mock-evaluation-types";

// Speaking practice result screen (EXAM-28).
//
// The last screen of the run, and the first one in this section that
// carries a level. It shows, in order:
//
// - the overall estimated Speaking level, with the sentence saying why
// - the practice-only disclaimer
// - the audio assessment note, saying what the review was made from
// - one result card per task, in the section's own task order
// - a restart and a way back to the dashboard
//
// The overall estimate uses the same bordered strip the Listening band
// card uses, on purpose. It is one more reading on a practice result
// screen, not a certificate, so there is no seal, no ribbon, no coloured
// band and nothing that could be mistaken for an official score report.
//
// The two notes sit directly under it rather than at the foot of the
// screen, because they are what stop the reading above being taken for
// something it is not, and they have to be read with it. The disclaimer
// says this is not an official CELPIP score. The audio note says the
// review was written from transcriptions of the recordings rather than
// from the recordings themselves, and that pronunciation, rhythm and
// intonation were not judged directly. A learner who reads a
// Listenability level without that second sentence would reasonably
// assume something was listened to.
//
// The estimate is a string rather than a number, which is what lets it
// say "No recording submitted" for a section where nothing was recorded.
// A numeric scale would have to put a 1 there, and a 1 is a level a
// learner earned rather than a statement that there was nothing to mark.
//
// Every card is drawn, including the tasks with nothing on them. Eight
// tasks were offered and eight are reported, so a learner can see at a
// glance which three they skipped rather than counting the cards that
// are present.
//
// Presentational only. Every level, transcript, sentence and rewrite on
// this screen arrives already produced and validated by the server, and
// nothing here scores anything or calls anything.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingSectionResultScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  evaluation: SpeakingMockEvaluation;
  // Clears the recordings and the review and returns to the first
  // screen. Omit to hide the control.
  onRestart?: () => void;
  dashboardHref?: string;
  copy?: SpeakingMockCopy;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function SpeakingSectionResultScreen({
  title,
  evaluation,
  onRestart,
  dashboardHref = "/dashboard",
  copy = speakingMockCopy,
  metaText,
  onBack,
  showBack = true,
}: SpeakingSectionResultScreenProps) {
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
          heading={copy.reviewResultHeading}
          text={copy.reviewResultSubtitle}
        />

        <div className={examSpeakingReview.stack}>
          <div className={examBandCard.card}>
            <p className={examBandCard.label}>{copy.reviewOverallLabel}</p>
            <p className={examBandCard.value}>
              {evaluation.overallEstimatedLevel}
            </p>
            <p className={examBandCard.basis}>
              {evaluation.overallJustification}
            </p>
          </div>

          <SpeakingPracticeDisclaimer
            text={evaluation.practiceDisclaimer}
            audioNote={evaluation.audioAssessmentNote}
            copy={copy}
          />

          <div className={examSpeakingReview.cardList}>
            {evaluation.taskResults.map((result) => (
              <SpeakingTaskResultCard
                key={result.taskId}
                result={result}
                copy={copy}
              />
            ))}
          </div>

          <div className={examScreenBody.actions}>
            <ExamButton
              variant="primary"
              size="md"
              href={dashboardHref}
              uppercase={false}
            >
              {copy.backToDashboardLabel}
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
          </div>

          <p className={examScreenBody.notice}>{copy.reviewResultNotice}</p>
        </div>
      </div>
    </ExamShell>
  );
}
