import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { WritingAiReviewButton } from "./WritingAiReviewButton";
import {
  examReview,
  examScreenBody,
  examWriting,
  examWritingReview,
} from "@/features/exam-engine/exam-theme";
import {
  formatWritingWordCount,
  writingMockCopy,
} from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingTaskSummary } from "@/features/exam-engine/writing-mock-types";

// Writing section completion screen (EXAM-25, extended by EXAM-26).
//
// The end of the writing, and the point where the review is offered. It
// says the section is finished, reports what was typed for each task, and
// offers three things: the AI review, a restart, and a way back to the
// dashboard.
//
// What it reports on its own is word counts and, for the survey task, the
// position that was chosen. That is everything the screen knows before a
// review has been asked for. It still shows no level and no band of its
// own: the estimate belongs to the result screen, after a review has
// actually happened, and a number on this screen would be a number
// nothing produced.
//
// EXAM-25 ended this screen with a plain sentence saying the review was
// the next build, on the rule ListeningPartCompleteScreen set: a greyed
// out control says "press this in a moment", and there was nothing behind
// it. There is something behind it now, so the sentence is gone and the
// control is real. The rule is unchanged and this is what it always
// pointed at.
//
// The review is offered rather than forced. A learner can read their two
// word counts and leave without pressing it, which is why every control
// this screen had is still on it.
//
// Return to dashboard is a link so it keeps middle click and open in a
// new tab. Restart is a handler, because clearing the writing held on the
// page is the prototype's business and not the router's.
//
// No timer. Nothing is being timed on a screen with no task on it.
//
// Presentational only. It holds no state.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingSectionCompleteScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  // One row per task, in task order.
  tasks: WritingTaskSummary[];
  // Where Return to dashboard goes.
  dashboardHref?: string;
  // Clears the writing and returns to the first screen. Omit to hide the
  // control.
  onRestart?: () => void;
  // Sends both responses for AI review. Omit to hide the review block
  // entirely, which is what a caller with no server action wants.
  onRequestReview?: () => void;
  // True while a review is in flight, which disables the submit button
  // and puts it into its pending wording.
  //
  // WritingSectionPrototype does not pass it: it draws a separate
  // processing screen in place of this one while a review runs, so this
  // screen is never on the page in that state. It is here for a caller
  // that would rather keep the learner on the completion screen and show
  // the wait on the button.
  reviewPending?: boolean;
  copy?: WritingMockCopy;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function WritingSectionCompleteScreen({
  title,
  tasks,
  dashboardHref = "/dashboard",
  onRestart,
  onRequestReview,
  reviewPending = false,
  copy = writingMockCopy,
  metaText,
  onBack,
  showBack = true,
}: WritingSectionCompleteScreenProps) {
  // The choice column is drawn only when a task in the section offers a
  // choice, so a section of plain writing tasks gets a two column table
  // rather than a column of dashes.
  const showChoiceColumn = tasks.some(
    (task) => task.choiceLabel !== undefined || task.choiceText !== undefined,
  );

  // Whether there is any writing at all to review. It changes the hint
  // under the submit button and nothing else: the button stays live, and
  // an empty section still returns a structured no-response result rather
  // than a dead control with no explanation beside it.
  const bothResponsesEmpty = tasks.every((task) => task.wordCount === 0);

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

        <div className={examWriting.completeStack}>
          <p className={examWriting.completeHeading}>
            {copy.completeTasksHeading}
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
                    {copy.completeWordsColumn}
                  </th>
                  {showChoiceColumn ? (
                    <th scope="col" className={examReview.headCell}>
                      {copy.completeChoiceColumn}
                    </th>
                  ) : null}
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

                    <td className={examReview.numberCell}>
                      {formatWritingWordCount(task.wordCount)}
                    </td>

                    {showChoiceColumn ? (
                      task.choiceLabel ? (
                        <td className={examReview.cell}>
                          {task.choiceLabel}
                          {task.choiceText ? (
                            <span className={examReview.statement}>
                              {task.choiceText}
                            </span>
                          ) : null}
                        </td>
                      ) : (
                        <td className={examReview.emptyCell}>
                          {copy.completeNoChoiceValue}
                        </td>
                      )
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {onRequestReview ? (
            <section className={examWritingReview.section}>
              <h3 className={examWriting.completeHeading}>
                {copy.reviewHeading}
              </h3>

              <p className={examWritingReview.sectionText}>
                {copy.reviewIntro}
              </p>

              <WritingAiReviewButton
                onSubmit={onRequestReview}
                pending={reviewPending}
                bothResponsesEmpty={bothResponsesEmpty}
                copy={copy}
              />
            </section>
          ) : null}

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
