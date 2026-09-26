import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { SpeakingAiReviewButton } from "./SpeakingAiReviewButton";
import { cx } from "@/features/design/design-tokens";
import {
  examReview,
  examScreenBody,
  examSpeaking,
} from "@/features/exam-engine/exam-theme";
import {
  formatSpeakingClock,
  formatSpeakingMissingCount,
  formatSpeakingRecordedCount,
  speakingMockCopy,
} from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingTaskSummary } from "@/features/exam-engine/speaking-mock-types";

// Speaking section completion screen (EXAM-27, extended by EXAM-28).
//
// The end of the run. It says the section is finished, reports which of
// the eight tasks were recorded and how long each take was, offers the
// AI review, and offers a restart and a way back to the dashboard.
//
// What it reports about the run is recorded or missing, and a length.
// That is everything this screen honestly knows before a review: there
// is no transcript, no score, no band and no criterion level on it,
// because none of those exist until the learner asks for them.
//
// EXAM-27 shipped this screen with a sentence saying the review was the
// next build, and no control. EXAM-28 replaces the sentence with the
// control, which is the rule ListeningPartCompleteScreen set: a greyed
// out button saying "press this in a moment" is worse than a sentence,
// and a working button is better than either. The screen keeps every
// control it had and gains one, so a learner who does not want a review
// can finish and leave exactly as before.
//
// Both counts are reported, recorded and not recorded, which is what the
// ticket asks for. They answer different questions: one says how much of
// the section is about to be reviewed, the other says how much will come
// back as a gap. A learner about to press Submit for AI Review should
// see both before they press it. The missing line is left out entirely
// when nothing is missing, rather than printed as a zero.
//
// A missing recording is reported plainly and is not styled as an error.
// A learner may have skipped a task, may have been reading the section
// rather than sitting it, or may have no working microphone. None of
// those is a failure this screen has any business colouring red.
//
// Return to dashboard is a link so it keeps middle click and open in a
// new tab. Restart is a handler, because throwing away the recordings
// held on the page, and revoking their object URLs, is the prototype's
// business and not the router's.
//
// No timer. Nothing is being timed on a screen with no task on it.
//
// Presentational only. It holds no state.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingSectionCompleteScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  // One row per task, in task order.
  tasks: SpeakingTaskSummary[];
  // Where Return to dashboard goes.
  dashboardHref?: string;
  // Clears the recordings and returns to the first screen. Omit to hide
  // the control.
  onRestart?: () => void;
  // Sends the recordings for AI review. Omit to run the section with no
  // review at all, which leaves this screen as EXAM-27 shipped it apart
  // from the missing count.
  onRequestReview?: () => void;
  // True while a review is in flight. The section prototype normally
  // draws the processing screen in place of this one, so this is here
  // for a caller that chooses to keep the screen up instead.
  reviewPending?: boolean;
  copy?: SpeakingMockCopy;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function SpeakingSectionCompleteScreen({
  title,
  tasks,
  dashboardHref = "/dashboard",
  onRestart,
  onRequestReview,
  reviewPending = false,
  copy = speakingMockCopy,
  metaText,
  onBack,
  showBack = true,
}: SpeakingSectionCompleteScreenProps) {
  const recordedCount = tasks.filter((task) => task.recorded).length;
  const missingCount = tasks.length - recordedCount;
  const missingText = formatSpeakingMissingCount(missingCount, tasks.length);

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
        <ExamInstructionRow
          heading={copy.completeHeading}
          text={copy.completeMessage}
        />

        <div className={examSpeaking.completeStack}>
          <p className={examSpeaking.completeHeading}>
            {copy.completeTasksHeading}
          </p>

          <p className={examSpeaking.completeCount}>
            {formatSpeakingRecordedCount(recordedCount, tasks.length)}
            {missingText ? " - " + missingText : ""}
          </p>

          <div className={examReview.wrap}>
            <table className={examReview.table}>
              <caption className={examReview.caption}>
                {copy.completeTasksHeading}
              </caption>

              <thead>
                <tr className={examReview.headRow}>
                  <th scope="col" className={examReview.headCell}>
                    {copy.completeTaskColumn}
                  </th>
                  <th scope="col" className={examReview.headCell}>
                    {copy.completeStatusColumn}
                  </th>
                  <th scope="col" className={examReview.headCell}>
                    {copy.completeLengthColumn}
                  </th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task) => (
                  <tr key={task.taskId} className={examReview.row}>
                    <th scope="row" className={examReview.cell}>
                      {task.taskLabel}
                      <span className={examReview.statement}>
                        {task.taskTitle}
                      </span>
                    </th>

                    <td
                      className={cx(
                        examReview.statusCell,
                        task.recorded
                          ? "text-academy-navy"
                          : "text-academy-navy/55",
                      )}
                    >
                      {task.recorded
                        ? copy.completeRecordedValue
                        : copy.completeMissingValue}
                    </td>

                    {task.recorded ? (
                      <td className={examReview.numberCell}>
                        {formatSpeakingClock(task.durationSeconds)}
                      </td>
                    ) : (
                      <td className={examReview.emptyCell}>
                        {copy.completeNoLengthValue}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* The review block. Drawn only where a handler was passed, so
              a run with no server behind it shows no control that cannot
              work, and says the "what comes next" sentence on its own in
              that case. */}
          <section>
            <h3 className={examSpeaking.completeHeading}>
              {onRequestReview
                ? copy.reviewHeading
                : copy.completeNextStepHeading}
            </h3>

            <p className={cx("mt-1.5", examSpeaking.completeCount)}>
              {onRequestReview ? copy.reviewIntro : copy.completeNextStepText}
            </p>

            {onRequestReview ? (
              <SpeakingAiReviewButton
                className="mt-3"
                onSubmit={onRequestReview}
                pending={reviewPending}
                noRecordings={recordedCount === 0}
                copy={copy}
              />
            ) : null}
          </section>

          <div className={examScreenBody.actions}>
            <ExamButton
              variant="secondary"
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

          <p className={examScreenBody.notice}>{copy.completeNotice}</p>
        </div>
      </div>
    </ExamShell>
  );
}
