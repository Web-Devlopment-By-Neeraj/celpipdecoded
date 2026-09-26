import { ExamButton } from "../ExamButton";
import { cx } from "@/features/design/design-tokens";
import { examSpeakingReview } from "@/features/exam-engine/exam-theme";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";

// Submit for AI Review control (EXAM-28).
//
// The one control in the whole Speaking section that sends anything
// anywhere, so it is the one control that has to say so before it is
// pressed. EXAM-27 was a section where nothing left the browser at all,
// and this button is the moment that stops being true, which is why the
// hint under it is not decoration.
//
// The hint names what leaves the page and what does not: the recordings
// go for transcription and review, they are not saved, they are not kept
// after the review comes back, and no attempt history is written. That
// is a stronger claim than the Writing button makes, and it needs to be:
// a learner is about to send a recording of their own voice.
//
// It is never disabled for being empty. A learner who recorded nothing
// can still press it, and what they get back is a structured no-response
// result built without any provider call at all: no invented level, and
// a sentence saying nothing was submitted. Greying the button out
// instead would leave them on a screen with a dead control and no
// explanation, and the empty case is a real case worth reporting rather
// than an error to be prevented. The hint changes wording when nothing
// was recorded so the outcome is not a surprise.
//
// It is disabled only while a review is in flight, which is the one
// state where a second press would buy a second transcription of eight
// recordings and nothing else.
//
// Presentational apart from the handler it is given. It holds no state
// and makes no request: the screen above it owns the request.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingAiReviewButtonProps = {
  onSubmit: () => void;
  // True while a review is in flight.
  pending?: boolean;
  // True when no task has a recording, which changes the hint under the
  // button and nothing else.
  noRecordings?: boolean;
  copy?: SpeakingMockCopy;
  className?: string;
};

export function SpeakingAiReviewButton({
  onSubmit,
  pending = false,
  noRecordings = false,
  copy = speakingMockCopy,
  className,
}: SpeakingAiReviewButtonProps) {
  return (
    <div className={cx(examSpeakingReview.submitStack, className)}>
      <div>
        <ExamButton
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={pending}
          uppercase={false}
        >
          {pending ? copy.reviewSubmitPendingLabel : copy.reviewSubmitLabel}
        </ExamButton>
      </div>

      <p className={examSpeakingReview.submitHint}>
        {noRecordings ? copy.reviewEmptyHint : copy.reviewSubmitHint}
      </p>
    </div>
  );
}
