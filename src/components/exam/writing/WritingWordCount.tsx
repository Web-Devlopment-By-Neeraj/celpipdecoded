import { cx } from "@/features/design/design-tokens";
import { examWriting } from "@/features/exam-engine/exam-theme";
import {
  formatWritingWordCount,
  formatWritingWordTarget,
  writingMockCopy,
} from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";

// Live word count under the writing editor (EXAM-25).
//
// One row: the count, and the target beside it. It is deliberately small,
// because a word count is a reading a writer glances at, not a control
// and not a verdict.
//
// It computes nothing. The count is passed in already worked out by
// countWritingWords, which is the one word count helper in the app, so
// the number here and the number the completion screen prints come from
// the same function and cannot disagree.
//
// It never blocks and never warns. A count outside the target is drawn
// exactly like a count inside it: the target is guidance from the source
// prompt, "about 150-200 words", and colouring a short response red would
// turn guidance into a rule the source does not set. Nothing in this
// prototype gates on the count at all.
//
// Zero is a normal reading, not an error state. An empty editor says
// "0 words", which is what countWritingWords returns for an empty string
// and for a string of nothing but spaces and newlines.
//
// Presentational only. It holds no state.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingWordCountProps = {
  wordCount: number;
  // The task's word target, for example 150 and 200. Omit both to show
  // the count on its own.
  targetMin?: number;
  targetMax?: number;
  copy?: WritingMockCopy;
  className?: string;
};

export function WritingWordCount({
  wordCount,
  targetMin,
  targetMax,
  copy = writingMockCopy,
  className,
}: WritingWordCountProps) {
  const showTarget = targetMin !== undefined && targetMax !== undefined;

  return (
    <p className={cx(examWriting.countRow, className)}>
      <span className={examWriting.countLabel}>{copy.wordCountLabel}</span>

      {/* aria-live so a screen reader user hears the count settle after
          they stop typing, rather than having to go looking for it. It is
          polite, so it never interrupts the typing itself. */}
      <span className={examWriting.countValue} aria-live="polite">
        {formatWritingWordCount(wordCount)}
      </span>

      {showTarget ? (
        <span className={examWriting.countTarget}>
          {copy.wordTargetLabel} {formatWritingWordTarget(targetMin, targetMax)}
        </span>
      ) : null}
    </p>
  );
}
