import { ExamButton } from "../ExamButton";
import { cx } from "@/features/design/design-tokens";
import { examWritingReview } from "@/features/exam-engine/exam-theme";
import { writingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";

// Submit for AI Review control (EXAM-26).
//
// The one control on the completion screen that sends anything anywhere,
// so it is the one control that has to say so before it is pressed. The
// hint under it names what leaves the page and what does not: the two
// responses go for review, nothing is saved, and no attempt history is
// kept.
//
// It is never disabled for being empty. A learner who wrote nothing can
// still press it, and what they get back is a structured no-response
// result built without an AI call: word counts of 0, no invented level,
// and a sentence saying nothing was submitted. Greying the button out
// instead would leave them on a screen with a dead control and no
// explanation, and the empty case is a real case worth reporting rather
// than an error to be prevented. The hint changes wording when both
// responses are empty so the outcome is not a surprise.
//
// It is disabled only while a review is in flight, which is the one state
// where a second press would buy a second call and nothing else.
//
// Presentational apart from the handler it is given. It holds no state
// and makes no request: the screen above it owns the request.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingAiReviewButtonProps = {
  onSubmit: () => void;
  // True while a review is in flight.
  pending?: boolean;
  // True when neither task has any writing in it, which changes the hint
  // under the button and nothing else.
  bothResponsesEmpty?: boolean;
  copy?: WritingMockCopy;
  className?: string;
};

export function WritingAiReviewButton({
  onSubmit,
  pending = false,
  bothResponsesEmpty = false,
  copy = writingMockCopy,
  className,
}: WritingAiReviewButtonProps) {
  return (
    <div className={cx(examWritingReview.submitStack, className)}>
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

      <p className={examWritingReview.submitHint}>
        {bothResponsesEmpty ? copy.reviewEmptyHint : copy.reviewSubmitHint}
      </p>
    </div>
  );
}
