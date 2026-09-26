import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { examListening, examScreenBody, examText } from "@/features/exam-engine/exam-theme";
import { listeningReviewCopy } from "@/features/exam-engine/listening-review-copy";
import type { ListeningReviewCopy } from "@/features/exam-engine/listening-review-copy";

// End of part screen for a Listening part (EXAM-04).
//
// The last screen of the prototype run. One line saying the part is
// finished, a way back to the dashboard, and an optional restart.
//
// Back to dashboard is a link rather than a handler, so it keeps middle
// click and open in a new tab. Restart is a handler, because clearing the
// answers held on the page is the prototype's business, not the router's.
//
// The next part line is a plain sentence, not a disabled control. There
// is nothing to press yet, and a greyed out button would suggest
// otherwise. It is skipped when the copy carries no next part.

export type ListeningPartEndScreenProps = {
  // Exam frame title, normally the part title from the content object.
  title: string;
  // Where Back to dashboard goes.
  dashboardHref?: string;
  // Clears the answers and returns to the first screen. Omit to hide the
  // control.
  onRestart?: () => void;
  // Set false to drop the "... will be added in the next ticket" line.
  showNextPartPlaceholder?: boolean;
  // Wording for the part. Defaults to Listening Part 1.
  copy?: ListeningReviewCopy;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningPartEndScreen({
  title,
  dashboardHref = "/dashboard",
  onRestart,
  showNextPartPlaceholder = true,
  copy = listeningReviewCopy,
  metaText,
  onBack,
  showBack = true,
}: ListeningPartEndScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      showNext={false}
      onBack={onBack}
      showBack={showBack}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow heading={copy.endTitle} text={copy.endMessage} />

        <div className={examListening.mediaStack}>
          <div className={examScreenBody.actions}>
            <ExamButton variant="primary" size="md" href={dashboardHref}>
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

          {showNextPartPlaceholder && copy.nextPartPlaceholder ? (
            <p className={examText.muted}>{copy.nextPartPlaceholder}</p>
          ) : null}

          <p className={examScreenBody.notice}>{copy.endNotice}</p>
        </div>
      </div>
    </ExamShell>
  );
}
