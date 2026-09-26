import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import {
  examListening,
  examScreenBody,
  examText,
} from "@/features/exam-engine/exam-theme";
import { listeningCopy } from "@/features/exam-engine/listening-copy";

// Completion screen for a Listening part whose review and score are not
// built yet (EXAM-05).
//
// Listening Part 1 does not use this. It has a real answer review, a
// practice score and an end of part screen, which is what
// ListeningPartEndScreen closes. This screen is the smaller thing a part
// needs before those exist: it states the part is finished, says how many
// questions were answered, and names what is coming.
//
// The pending review line is a plain sentence rather than a disabled
// button, following the same rule ListeningPartEndScreen sets out. A
// greyed out control says "press this in a moment", and there is nothing
// behind it. The ticket allows either, and a sentence is the honest one.
//
// Back to dashboard is a link rather than a handler, so it keeps middle
// click and open in a new tab. Restart is a handler, because clearing the
// answers held on the page is the prototype's business, not the router's.
//
// No timer. Nothing is being timed on a screen with no task on it.

export type ListeningPartCompleteScreenProps = {
  // Exam frame title, normally the full title from the content object.
  title: string;
  // Headline, for example "Listening Part 2 complete".
  heading: string;
  // Line under it, for example "You answered 5 of 5 questions."
  message: string;
  // Where Back to dashboard goes.
  dashboardHref?: string;
  // Clears the answers and returns to the first screen. Omit to hide the
  // control.
  onRestart?: () => void;
  restartLabel?: string;
  // Sentence about the review that does not exist yet. Omit to drop it.
  pendingText?: string;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningPartCompleteScreen({
  title,
  heading,
  message,
  dashboardHref = "/dashboard",
  onRestart,
  restartLabel,
  pendingText = listeningCopy.partCompletePendingReview,
  metaText,
  onBack,
  showBack = true,
}: ListeningPartCompleteScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      // The last screen in the flow, so there is nowhere for Next to go.
      showNext={false}
      onBack={onBack}
      showBack={showBack}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow heading={heading} text={message} />

        <div className={examListening.mediaStack}>
          <div className={examScreenBody.actions}>
            <ExamButton variant="primary" size="md" href={dashboardHref}>
              {listeningCopy.partCompleteBackToDashboardLabel}
            </ExamButton>

            {onRestart && restartLabel ? (
              <ExamButton
                variant="secondary"
                size="md"
                onClick={onRestart}
                uppercase={false}
              >
                {restartLabel}
              </ExamButton>
            ) : null}
          </div>

          {pendingText ? (
            <p className={examText.muted}>{pendingText}</p>
          ) : null}

          <p className={examScreenBody.notice}>
            {listeningCopy.partCompleteNotice}
          </p>
        </div>
      </div>
    </ExamShell>
  );
}
