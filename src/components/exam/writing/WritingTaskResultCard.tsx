import { WritingCriterionScoreTable } from "./WritingCriterionScoreTable";
import { WritingRewriteCard } from "./WritingRewriteCard";
import { WritingTopMistakesCard } from "./WritingTopMistakesCard";
import { examWritingReview } from "@/features/exam-engine/exam-theme";
import {
  formatWritingWordCount,
  formatWritingWordTarget,
  writingMockCopy,
} from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockTaskResult } from "@/features/exam-engine/writing-mock-evaluation-types";

// One reviewed Writing task (EXAM-26).
//
// A bordered card holding everything the review says about a single task,
// in the order a learner reads it:
//
//   1. the task name and its estimated level, in the header strip
//   2. the word count, the target and whether the response is inside it
//   3. one sentence saying why that level
//   4. what worked, and what held it back
//   5. prompt points the response never addressed, when there are any
//   6. template language to avoid, when there is any
//   7. the four criterion levels, with evidence and the next step
//   8. the top mistakes
//   9. the response rewritten one level up
//  10. a Level 11-12 model response
//
// The order is the argument. The level is at the top because it is what a
// learner opens the screen looking for, the justification is directly
// under it so the number never sits alone, and the two rewrites are last
// because they are the longest blocks and nothing after them would be
// read.
//
// A blank task takes a different path through the same card. Steps 7, 8,
// 9 and 10 have nothing behind them, so an insufficient-response block is
// drawn instead of all four: criteria is empty and both rewrites are null
// on a result the server built locally, and the card branches on
// insufficientResponse rather than on the emptiness of each field, so the
// two can never disagree.
//
// The word count is the server's own count, not the model's. So is the
// within-range verdict and so is the card title. A model that miscounted
// cannot print a wrong number beside a learner's writing.
//
// Presentational only. It holds no state and computes nothing beyond
// which blocks to draw.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingTaskResultCardProps = {
  result: WritingMockTaskResult;
  // The task's word target, for the target reading beside the count. Omit
  // both to show the count on its own.
  targetMin?: number;
  targetMax?: number;
  copy?: WritingMockCopy;
};

export function WritingTaskResultCard({
  result,
  targetMin,
  targetMax,
  copy = writingMockCopy,
}: WritingTaskResultCardProps) {
  const showTarget = targetMin !== undefined && targetMax !== undefined;

  return (
    <article className={examWritingReview.card}>
      <div className={examWritingReview.cardHeader}>
        <h3 className={examWritingReview.cardTitle}>{result.taskTitle}</h3>

        <p className={examWritingReview.cardLevel}>
          <span className={examWritingReview.cardLevelLabel}>
            {copy.reviewTaskLevelLabel}
          </span>
          {result.estimatedLevel}
        </p>
      </div>

      <div className={examWritingReview.cardBody}>
        <div className={examWritingReview.metaRow}>
          <span className={examWritingReview.metaItem}>
            <span className={examWritingReview.metaLabel}>
              {copy.reviewTaskWordCountLabel}
            </span>
            <span className={examWritingReview.metaValue}>
              {formatWritingWordCount(result.wordCount)}
            </span>
          </span>

          {showTarget ? (
            <span className={examWritingReview.metaItem}>
              <span className={examWritingReview.metaLabel}>
                {copy.reviewTaskWordRangeLabel}
              </span>
              <span className={examWritingReview.metaValue}>
                {formatWritingWordTarget(targetMin, targetMax)}
              </span>
            </span>
          ) : null}

          <span className={examWritingReview.metaFlag}>
            {result.withinWordRange
              ? copy.reviewWithinRangeLabel
              : copy.reviewOutsideRangeLabel}
          </span>
        </div>

        <p className={examWritingReview.sectionText}>
          {result.oneSentenceJustification}
        </p>

        <div className={examWritingReview.feedbackSplit}>
          <div className={examWritingReview.feedbackBlock}>
            <h4 className={examWritingReview.sectionTitle}>
              {copy.reviewSucceededLabel}
            </h4>
            <p className={examWritingReview.sectionText}>
              {result.criticalFeedback.succeeded}
            </p>
          </div>

          <div className={examWritingReview.feedbackBlock}>
            <h4 className={examWritingReview.sectionTitle}>
              {copy.reviewFellShortLabel}
            </h4>
            <p className={examWritingReview.sectionText}>
              {result.criticalFeedback.fellShort}
            </p>
          </div>
        </div>

        {result.missingPromptPoints.length > 0 ? (
          <section className={examWritingReview.section}>
            <h4 className={examWritingReview.sectionTitle}>
              {copy.reviewMissingPointsLabel}
            </h4>
            <ul className={examWritingReview.list}>
              {result.missingPromptPoints.map((point) => (
                <li key={point} className={examWritingReview.listItem}>
                  {point}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {result.templateLanguageWarnings.length > 0 ? (
          <section className={examWritingReview.section}>
            <h4 className={examWritingReview.sectionTitle}>
              {copy.reviewTemplateWarningsLabel}
            </h4>
            <ul className={examWritingReview.list}>
              {result.templateLanguageWarnings.map((warning) => (
                <li key={warning} className={examWritingReview.listItem}>
                  {warning}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {result.insufficientResponse ? (
          <div className={examWritingReview.insufficient}>
            <p className={examWritingReview.insufficientHeading}>
              {copy.reviewInsufficientHeading}
            </p>
            <p className={examWritingReview.insufficientText}>
              {copy.reviewNoResponseSubmitted}
            </p>
          </div>
        ) : (
          <>
            <section className={examWritingReview.section}>
              <h4 className={examWritingReview.sectionTitle}>
                {copy.reviewCriteriaHeading}
              </h4>
              <WritingCriterionScoreTable
                criteria={result.criteria}
                caption={result.taskTitle}
                copy={copy}
              />
            </section>

            <WritingTopMistakesCard mistakes={result.topMistakes} copy={copy} />

            {result.nextLevelRewrite ? (
              <WritingRewriteCard
                heading={copy.reviewRewriteHeading}
                targetLevel={result.nextLevelRewrite.targetLevel}
                response={result.nextLevelRewrite.response}
                changeSummary={result.nextLevelRewrite.changeSummary}
                copy={copy}
              />
            ) : null}

            {result.levelElevenTwelveModel ? (
              <WritingRewriteCard
                heading={copy.reviewModelHeading}
                intro={copy.reviewModelIntro}
                response={result.levelElevenTwelveModel.response}
                copy={copy}
              />
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}
