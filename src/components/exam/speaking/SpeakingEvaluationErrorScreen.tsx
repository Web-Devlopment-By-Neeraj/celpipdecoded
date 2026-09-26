import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockEvaluationErrorCode } from "@/features/exam-engine/speaking-mock-evaluation-types";

// Shown when the Speaking review could not be completed (EXAM-28).
//
// One screen for every failure, with two things that change on it: the
// sentence, and whether Try again is offered at all.
//
// The sentence changes because the failures have different fixes. A lost
// session needs a sign-in, an exhausted API balance needs credits added,
// an oversized submission needs shorter recordings, and an unreadable
// container needs a different browser. Handing all four the same "try
// again" would send a learner round a loop that cannot close. The server
// picks the sentence and this screen prints it; nothing here matches on
// prose.
//
// Try again is withheld for exactly one code. An exhausted credit
// balance is not transient: the next press will fail the same way, and
// the wording already says what to do instead. Every other failure,
// including a provider error and a schema mismatch, is worth one more
// attempt, so the control is offered. A missing API key is offered a
// retry too, because a key can be added to a running environment between
// two presses and offering it costs nothing.
//
// What is deliberately not shown: the provider's message, the model
// name, the error code, or any part of the environment. The server logs
// those and returns our own wording, so nothing here can leak a key, a
// stack or a vendor's internal text onto a learner's screen. The code
// prop reaches this component only to decide whether to draw a button.
//
// Nothing was lost. The recordings are held in the section prototype's
// state, above this screen, so Back returns to Task 8 with every take
// still playable and Try again re-sends exactly what was sent before.
// Every failure sentence says so, because the first thing a learner
// wants to know when a review fails is whether they have to record it
// all again.
//
// Presentational only. It holds no state and makes no request.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingEvaluationErrorScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  // Our own wording for what went wrong. Never a provider message.
  // Defaults to the general failure sentence.
  message?: string;
  // Why it failed. Used only to decide whether a retry is worth
  // offering, and never printed.
  code?: SpeakingMockEvaluationErrorCode;
  onRetry?: () => void;
  // Returns to the completion screen with the recordings still held.
  onBackToRecordings?: () => void;
  dashboardHref?: string;
  copy?: SpeakingMockCopy;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function SpeakingEvaluationErrorScreen({
  title,
  message,
  code,
  onRetry,
  onBackToRecordings,
  dashboardHref = "/dashboard",
  copy = speakingMockCopy,
  metaText,
  onBack,
  showBack = true,
}: SpeakingEvaluationErrorScreenProps) {
  // The one failure a retry cannot help with.
  const retryable = code !== "credits-exhausted";

  return (
    <ExamShell
      title={title}
      metaText={metaText}
      showNext={false}
      onBack={onBack}
      showBack={showBack}
    >
      <div className={examScreenBody.stack}>
        <div aria-live="polite">
          <ExamInstructionRow
            heading={copy.reviewFailedHeading}
            text={message ?? copy.reviewFailedText}
          />
        </div>

        <div className={examScreenBody.actions}>
          {onRetry && retryable ? (
            <ExamButton
              variant="primary"
              size="md"
              onClick={onRetry}
              uppercase={false}
            >
              {copy.reviewRetryLabel}
            </ExamButton>
          ) : null}

          {onBackToRecordings ? (
            <ExamButton
              variant="secondary"
              size="md"
              onClick={onBackToRecordings}
              uppercase={false}
            >
              {copy.reviewBackToRecordingsLabel}
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

        <p className={examScreenBody.notice}>{copy.completeNotice}</p>
      </div>
    </ExamShell>
  );
}
