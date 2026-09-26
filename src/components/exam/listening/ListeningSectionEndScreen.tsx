import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import {
  examListening,
  examScreenBody,
  examText,
} from "@/features/exam-engine/exam-theme";
import { listeningSectionCopy } from "@/features/exam-engine/listening-section-copy";
import type { ListeningSectionCopy } from "@/features/exam-engine/listening-section-copy";

// End of Listening section screen (EXAM-15).
//
// The last screen of the full run. One line saying the section is
// finished, a way back to the dashboard, and a restart that clears all 38
// answers and returns to the instruction screen.
//
// Back to dashboard is a link rather than a handler, so it keeps middle
// click and open in a new tab. Restart is a handler, because clearing the
// answers held on the page is the prototype's business, not the router's.
//
// The Reading line is a plain sentence, not a disabled control. Reading is
// not built in this ticket, there is nothing to press, and a greyed out
// button would suggest otherwise.
//
// The section counterpart of ListeningPartEndScreen. It is a separate
// component because its wording object is the section one and the restart
// it offers clears the whole section rather than one part, but the shape
// of the screen is deliberately identical so the two read as the same
// closing screen at two scales.

export type ListeningSectionEndScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  // Where Back to dashboard goes.
  dashboardHref?: string;
  // Clears all of the answers and returns to the first screen. Omit to
  // hide the control.
  onRestart?: () => void;
  // Set false to drop the "Reading section will be added later" line.
  showNextSectionPlaceholder?: boolean;
  copy?: ListeningSectionCopy;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningSectionEndScreen({
  title,
  dashboardHref = "/dashboard",
  onRestart,
  showNextSectionPlaceholder = true,
  copy = listeningSectionCopy,
  metaText,
  onBack,
  showBack = true,
}: ListeningSectionEndScreenProps) {
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

          {showNextSectionPlaceholder && copy.nextSectionPlaceholder ? (
            <p className={examText.muted}>{copy.nextSectionPlaceholder}</p>
          ) : null}

          <p className={examScreenBody.notice}>{copy.endNotice}</p>
        </div>
      </div>
    </ExamShell>
  );
}
