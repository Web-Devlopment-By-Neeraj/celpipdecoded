import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { WritingPracticeDisclaimer } from "./WritingPracticeDisclaimer";
import { WritingTaskResultCard } from "./WritingTaskResultCard";
import {
  examBandCard,
  examScreenBody,
  examWritingReview,
} from "@/features/exam-engine/exam-theme";
import { writingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockEvaluation } from "@/features/exam-engine/writing-mock-evaluation-types";
import type { WritingTaskContent } from "@/features/exam-engine/writing-mock-types";

// Writing practice result screen (EXAM-26).
//
// The last screen of the run, and the first one in this section that
// carries a level. It shows, in order:
//
// - the overall estimated Writing level, with the sentence saying why
// - the practice-only disclaimer
// - one result card per task, in the section's own task order
// - a restart and a way back to the dashboard
//
// The overall estimate uses the same bordered strip the Listening band
// card uses, on purpose. It is one more reading on a practice result
// screen, not a certificate, so there is no seal, no ribbon, no coloured
// band and nothing that could be mistaken for an official score report.
// The disclaimer sits directly under it rather than at the foot of the
// screen, because it is what stops the reading above being taken for an
// official result and it has to be read with it.
//
// The estimate is a string rather than a number, which is what lets it
// say "Insufficient response" for a section where nothing was written. A
// numeric scale would have to put a 1 there, and a 1 is a level a learner
// earned rather than a statement that there was nothing to mark.
//
// The task cards are matched to the section content by task id rather
// than by position, so a review that came back in a different order still
// draws the right word target beside the right task.
//
// Presentational only. Every level, sentence and rewrite on this screen
// arrives already produced and validated by the server, and nothing here
// scores anything or calls anything.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingSectionResultScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  evaluation: WritingMockEvaluation;
  // The section's tasks, for the word targets beside each count. Matched
  // to the results by task id.
  tasks: WritingTaskContent[];
  // Clears the writing and the review and returns to the first screen.
  // Omit to hide the control.
  onRestart?: () => void;
  dashboardHref?: string;
  copy?: WritingMockCopy;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function WritingSectionResultScreen({
  title,
  evaluation,
  tasks,
  onRestart,
  dashboardHref = "/dashboard",
  copy = writingMockCopy,
  metaText,
  onBack,
  showBack = true,
}: WritingSectionResultScreenProps) {
  const taskById = new Map(tasks.map((task) => [task.taskId, task]));

  return (
    <ExamShell
      title={title}
      metaText={metaText}
      showNext={false}
      onBack={onBack}
      showBack={showBack}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow
          heading={copy.reviewResultHeading}
          text={copy.reviewResultSubtitle}
        />

        <div className={examWritingReview.stack}>
          <div className={examBandCard.card}>
            <p className={examBandCard.label}>{copy.reviewOverallLabel}</p>
            <p className={examBandCard.value}>
              {evaluation.overallEstimatedLevel}
            </p>
            <p className={examBandCard.basis}>
              {evaluation.overallJustification}
            </p>
          </div>

          <WritingPracticeDisclaimer
            text={evaluation.practiceDisclaimer}
            copy={copy}
          />

          <div className={examWritingReview.cardList}>
            {evaluation.taskResults.map((result) => {
              const task = taskById.get(result.taskId);

              return (
                <WritingTaskResultCard
                  key={result.taskId}
                  result={result}
                  targetMin={task?.wordTarget.min}
                  targetMax={task?.wordTarget.max}
                  copy={copy}
                />
              );
            })}
          </div>

          <div className={examScreenBody.actions}>
            <ExamButton
              variant="primary"
              size="md"
              href={dashboardHref}
              uppercase={false}
            >
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

          <p className={examScreenBody.notice}>{copy.reviewResultNotice}</p>
        </div>
      </div>
    </ExamShell>
  );
}
