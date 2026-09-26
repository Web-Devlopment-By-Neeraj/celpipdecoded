import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import { writingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";

// Shown when the Writing review could not be completed (EXAM-26).
//
// One screen for every failure. A lost session, a missing API key, a
// provider timeout and a reply that did not match the schema all leave
// the learner in the same place with the same two things to do: try
// again, or go back to their writing. Splitting them into four screens
// would give a learner four ways to read a situation they cannot act on
// differently.
//
// What is deliberately not shown: the provider's message, the model name,
// the error code, or any part of the environment. The server logs those
// and returns our own wording, so nothing here can leak a key, a stack or
// a vendor's internal text onto a learner's screen. The message prop
// exists so the screen can carry a cause-specific sentence when one is
// worth showing, and it defaults to the general one.
//
// Nothing was lost. The responses are held in the section prototype's
// state, above this screen, so Back returns to Task 2 with every word
// still in the editor and Try again re-sends exactly what was sent
// before.
//
// Presentational only. It holds no state and makes no request.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingEvaluationErrorScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  // Our own wording for what went wrong. Never a provider message.
  // Defaults to the general failure sentence.
  message?: string;
  onRetry?: () => void;
  // Returns to the completion screen with the writing still held.
  onBackToResponses?: () => void;
  dashboardHref?: string;
  copy?: WritingMockCopy;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function WritingEvaluationErrorScreen({
  title,
  message,
  onRetry,
  onBackToResponses,
  dashboardHref = "/dashboard",
  copy = writingMockCopy,
  metaText,
  onBack,
  showBack = true,
}: WritingEvaluationErrorScreenProps) {
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
          {onRetry ? (
            <ExamButton
              variant="primary"
              size="md"
              onClick={onRetry}
              uppercase={false}
            >
              {copy.reviewRetryLabel}
            </ExamButton>
          ) : null}

          {onBackToResponses ? (
            <ExamButton
              variant="secondary"
              size="md"
              onClick={onBackToResponses}
              uppercase={false}
            >
              {copy.reviewBackToResponsesLabel}
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
