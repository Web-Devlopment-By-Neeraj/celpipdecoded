import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { WritingPracticeDisclaimer } from "./WritingPracticeDisclaimer";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import { writingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";

// Shown while the Writing review is in flight (EXAM-26).
//
// A full screen rather than a spinner on the completion screen, because
// the wait is a model call rather than a page load and the completion
// screen's controls should not be pressable while it happens. Restarting
// the section under a request that is about to land is how a learner ends
// up looking at a review of writing they have already cleared.
//
// There is no progress bar and no percentage. Nothing here knows how far
// through the call is, and a bar that fills at a made up rate is a lie
// told slowly. It says instead how long this usually takes and that the
// writing is still here, which are the two things a waiting learner
// actually wants to know.
//
// Back stays available. A learner is never trapped on this screen: going
// back returns them to Task 2 with every word still in the editor, and
// the reply, if it arrives, lands on state that the section prototype
// still holds.
//
// The practice disclaimer is on this screen as well as on the result, so
// the framing arrives before the level does rather than after it.
//
// Presentational only. It holds no state and makes no request.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingEvaluationProcessingScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  copy?: WritingMockCopy;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function WritingEvaluationProcessingScreen({
  title,
  copy = writingMockCopy,
  metaText,
  onBack,
  showBack = true,
}: WritingEvaluationProcessingScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      showNext={false}
      onBack={onBack}
      showBack={showBack}
    >
      <div className={examScreenBody.stack}>
        {/* aria-live so a screen reader user is told the review has
            started, rather than landing on a screen that appears to have
            nothing on it. Polite, so it waits for a pause. */}
        <div aria-live="polite">
          <ExamInstructionRow
            heading={copy.reviewProcessingHeading}
            text={copy.reviewProcessingText}
          />
        </div>

        <WritingPracticeDisclaimer copy={copy} />

        <p className={examScreenBody.notice}>{copy.reviewProcessingNotice}</p>
      </div>
    </ExamShell>
  );
}
