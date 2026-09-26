import { ExamProgressIndicator } from "../ExamProgressIndicator";
import { examProgress, examText } from "@/features/exam-engine/exam-theme";
import {
  formatListeningSectionAnswered,
  formatListeningSectionPartPosition,
  listeningSectionCopy,
} from "@/features/exam-engine/listening-section-copy";
import type { ListeningSectionCopy } from "@/features/exam-engine/listening-section-copy";

// Position inside the full Listening section (EXAM-15).
//
// Six parts is long enough that "which part am I in" stops being obvious,
// so the section owned screens carry this: the part position as a line of
// text, a quiet bar behind it, and the answered count out of 38 under it.
//
// It is the EXAM-01 ExamProgressIndicator with section wording, not a new
// bar. The exam surface stays restrained, so there is no percentage figure
// and no badge.
//
// currentPart is a position, not an index. Zero is the state before Part 1
// starts, which is what the instruction and the video screens are in, and
// it draws an empty bar rather than a first segment the learner has not
// reached. The review, score and end screens pass the total, which fills
// it.
//
// It shows no score anywhere. The answered count says how much of the
// section has been attempted, which is true at every point in the run and
// gives nothing away about how it went.

export type ListeningSectionProgressBarProps = {
  // Which part the learner is in, counting from 1. Zero before Part 1.
  currentPart: number;
  totalParts: number;
  // How many of the section's questions have an answer.
  answeredCount: number;
  totalQuestions: number;
  // Overrides the part position line, for a screen that is not inside a
  // part.
  label?: string;
  copy?: ListeningSectionCopy;
};

export function ListeningSectionProgressBar({
  currentPart,
  totalParts,
  answeredCount,
  totalQuestions,
  label,
  copy = listeningSectionCopy,
}: ListeningSectionProgressBarProps) {
  const positionLabel =
    label ??
    (currentPart > 0
      ? formatListeningSectionPartPosition(currentPart, totalParts)
      : copy.progressLabel);

  return (
    <div className={examProgress.wrap}>
      <ExamProgressIndicator
        current={currentPart}
        total={totalParts}
        label={positionLabel}
      />

      <p className={examText.muted}>
        {formatListeningSectionAnswered(answeredCount, totalQuestions)}
      </p>
    </div>
  );
}
