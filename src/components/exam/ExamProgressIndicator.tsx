import { cx } from "@/features/design/design-tokens";
import { examProgress } from "@/features/exam-engine/exam-theme";
import { formatExamProgress } from "@/features/exam-engine/exam-copy";

// Position inside a part, for example Question 3 of 8.
//
// The label is the important part, the bar is a quiet supporting hint.
// The exam surface stays restrained, so there is no percentage figure and
// no badge.

export type ExamProgressIndicatorProps = {
  current: number;
  total: number;
  // Overrides the default "Question N of M" wording.
  label?: string;
  showBar?: boolean;
  className?: string;
};

export function ExamProgressIndicator({
  current,
  total,
  label,
  showBar = true,
  className,
}: ExamProgressIndicatorProps) {
  const safeTotal = total > 0 ? total : 1;
  const safeCurrent = Math.min(Math.max(current, 0), safeTotal);
  const percent = Math.round((safeCurrent / safeTotal) * 100);

  return (
    <div className={cx(examProgress.wrap, className)}>
      <p className={examProgress.label}>
        {label ?? formatExamProgress(safeCurrent, safeTotal)}
      </p>

      {showBar ? (
        <div
          className={examProgress.track}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={safeTotal}
          aria-valuenow={safeCurrent}
          aria-label={label ?? formatExamProgress(safeCurrent, safeTotal)}
        >
          <div className={examProgress.fill} style={{ width: `${percent}%` }} />
        </div>
      ) : null}
    </div>
  );
}
