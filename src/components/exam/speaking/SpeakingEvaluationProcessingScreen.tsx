import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { SpeakingPracticeDisclaimer } from "./SpeakingPracticeDisclaimer";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";

// Shown while the Speaking review is in flight (EXAM-28).
//
// A full screen rather than a spinner on the completion screen, because
// the wait is a transcription of up to eight recordings followed by a
// model call, and the completion screen's controls should not be
// pressable while it happens. Restarting the section under a request
// that is about to land is how a learner ends up looking at a review of
// recordings they have already cleared, and on Speaking that restart
// also revokes the object URLs the review is about to be shown beside.
//
// There is no progress bar and no percentage, and no count of how many
// tasks have been transcribed so far. Nothing on this screen knows any
// of that: the transcriptions run together on the server inside one
// request, and a bar that fills at a made up rate is a lie told slowly.
// It says instead that this takes longer than a written review, that the
// recordings are still here, and roughly how long to expect, which are
// the three things a waiting learner actually wants to know.
//
// Back stays available. A learner is never trapped on this screen: going
// back returns them to Task 8 with every recording still playable, and
// the reply, if it arrives, lands on state that the section prototype
// still holds.
//
// The practice disclaimer is on this screen as well as on the result, so
// the framing arrives before the level does rather than after it. The
// audio assessment note is not, because there is no result yet for it to
// describe and a note about how a review was made reads oddly before one
// exists.
//
// Presentational only. It holds no state and makes no request.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingEvaluationProcessingScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  copy?: SpeakingMockCopy;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function SpeakingEvaluationProcessingScreen({
  title,
  copy = speakingMockCopy,
  metaText,
  onBack,
  showBack = true,
}: SpeakingEvaluationProcessingScreenProps) {
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

        <SpeakingPracticeDisclaimer copy={copy} />

        <p className={examScreenBody.notice}>{copy.reviewProcessingNotice}</p>
      </div>
    </ExamShell>
  );
}
