import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import {
  examListening,
  examScreenBody,
  examText,
} from "@/features/exam-engine/exam-theme";
import { readingCopy } from "@/features/exam-engine/reading-copy";

// Completion screen for a Reading part whose review and score are not
// built yet (EXAM-16).
//
// The Reading counterpart of ListeningPartCompleteScreen, and it says the
// same three things: the part is finished, this many questions were
// answered, and the review is coming. EXAM-17 replaces it with an answer
// review, a practice score and an end of part screen, the way EXAM-04 and
// EXAM-14 did for Listening.
//
// It is a separate component rather than the Listening one reused,
// because the Listening one reads listeningCopy for three of its strings
// and this one reads readingCopy. Sharing it would mean passing a copy
// object into a component that currently just knows its own wording, and
// EXAM-17 is where a shared closing screen should be considered, with two
// real callers to design against rather than one.
//
// The pending review line is a plain sentence rather than a disabled
// button, following the rule ListeningPartCompleteScreen sets out: a
// greyed out control says "press this in a moment", and there is nothing
// behind it.
//
// Back to dashboard is a link rather than a handler, so it keeps middle
// click and open in a new tab. Restart is a handler, because clearing the
// answers held on the page is the prototype's business, not the router's.
//
// No timer. Nothing is being timed on a screen with no task on it.

export type ReadingPartCompleteScreenProps = {
  // Exam frame title, normally the full title from the content object.
  title: string;
  // Headline, for example "Reading Part 1 complete".
  heading: string;
  // Line under it, for example "You answered 9 of 11 questions."
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

export function ReadingPartCompleteScreen({
  title,
  heading,
  message,
  dashboardHref = "/dashboard",
  onRestart,
  restartLabel = readingCopy.partCompleteRestartLabel,
  pendingText = readingCopy.partCompletePendingReview,
  metaText,
  onBack,
  showBack = true,
}: ReadingPartCompleteScreenProps) {
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

        {/* The capped centre column the Listening closing screens use, so
            the two actions do not stretch across a full width canvas. */}
        <div className={examListening.mediaStack}>
          <div className={examScreenBody.actions}>
            <ExamButton variant="primary" size="md" href={dashboardHref}>
              {readingCopy.partCompleteBackToDashboardLabel}
            </ExamButton>

            {onRestart ? (
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
            {readingCopy.partCompleteNotice}
          </p>
        </div>
      </div>
    </ExamShell>
  );
}
