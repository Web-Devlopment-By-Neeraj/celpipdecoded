import { cx } from "@/features/design/design-tokens";
import { examWritingReview } from "@/features/exam-engine/exam-theme";
import { writingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";

// Practice-only disclaimer for the Writing review (EXAM-26).
//
// The one sentence on the result screen that has to be there. Everything
// above it is a level, a criterion table and two rewrites, all of which
// read like a score report, and this is what says plainly that it is not
// one.
//
// It is a component rather than a line of copy inlined on the result
// screen for two reasons. It appears in three places, on the result
// screen, on the processing screen and beside the submit button, and a
// sentence that has to say the same thing in three places should have one
// definition. And a disclaimer that is a component is a disclaimer that
// can be found: a reviewer checking that the wording is right has one
// file to open.
//
// text defaults to the fixed copy sentence rather than to whatever the
// model returned. The server already replaces the model's disclaimer with
// this sentence, so the two agree, but the default here means a screen
// that forgets to pass one still shows the right words rather than none.
//
// Presentational only. It holds no state.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingPracticeDisclaimerProps = {
  // The disclaimer sentence. Defaults to the fixed practice estimate
  // wording.
  text?: string;
  copy?: WritingMockCopy;
  className?: string;
};

export function WritingPracticeDisclaimer({
  text,
  copy = writingMockCopy,
  className,
}: WritingPracticeDisclaimerProps) {
  return (
    <div className={cx(examWritingReview.disclaimer, className)}>
      <p className={examWritingReview.disclaimerLabel}>
        {copy.reviewPracticeDisclaimerLabel}
      </p>
      <p className={examWritingReview.disclaimerText}>
        {text ?? copy.reviewPracticeDisclaimer}
      </p>
    </div>
  );
}
