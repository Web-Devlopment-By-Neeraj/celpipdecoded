import { SpeakingCriterionScoreTable } from "./SpeakingCriterionScoreTable";
import { SpeakingRewriteCard } from "./SpeakingRewriteCard";
import { SpeakingTopMistakesCard } from "./SpeakingTopMistakesCard";
import { SpeakingTranscriptCard } from "./SpeakingTranscriptCard";
import { examSpeakingReview } from "@/features/exam-engine/exam-theme";
import {
  formatSpeakingClock,
  formatSpeakingDuration,
  speakingMockCopy,
} from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockTaskResult } from "@/features/exam-engine/speaking-mock-evaluation-types";

// One reviewed Speaking task (EXAM-28).
//
// A bordered card holding everything the review says about a single
// task, in the order a learner reads it:
//
//   1. the task name and its estimated level, in the header strip
//   2. the recording window, how long they spoke, and the status
//   3. one sentence saying why that level
//   4. the time and length check
//   5. the transcript of what they said
//   6. what worked, and what held it back
//   7. prompt points the answer never addressed, when there are any
//   8. template language to avoid, when there is any
//   9. the four criterion levels, with evidence and the next step
//  10. the top mistakes
//  11. the answer rewritten one level up
//  12. a Level 11-12 model answer
//
// The order is the argument. The level is at the top because it is what
// a learner opens the screen looking for, the justification is directly
// under it so the reading never sits alone, and the transcript comes
// before every judgement below it because those judgements all argue
// from it. The two rewrites are last because they are the longest blocks
// and nothing after them would be read.
//
// The transcript's position is the one real difference from the Writing
// card, and it is not a preference. A Writing learner already has their
// response; a Speaking learner has only a recording, so the criterion
// table has to be read against words on the same screen or it cannot be
// checked at all.
//
// A task with no reviewable recording takes a different path through the
// same card. Steps 9 to 12 have nothing behind them, so a status block
// is drawn instead of all four: criteria is empty and both rewrites are
// null on a result the server built locally, and the card branches on
// recordingStatus rather than on the emptiness of each field, so the two
// can never disagree.
//
// The three unreviewable statuses get three different blocks, never one.
// A learner who skipped a task, a learner whose recording could not be
// transcribed and a learner whose recording held almost no speech have
// not done the same thing, and the middle one did nothing wrong at all.
//
// The recording window, the measured duration and the card title are the
// server's, not the model's. A model that misremembered a window cannot
// print a wrong limit beside a learner's answer.
//
// Presentational only. It holds no state and computes nothing beyond
// which blocks to draw.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingTaskResultCardProps = {
  result: SpeakingMockTaskResult;
  copy?: SpeakingMockCopy;
};

export function SpeakingTaskResultCard({
  result,
  copy = speakingMockCopy,
}: SpeakingTaskResultCardProps) {
  const reviewed = result.recordingStatus === "recorded";

  const statusHeading =
    result.recordingStatus === "missing"
      ? copy.reviewMissingHeading
      : result.recordingStatus === "transcription_failed"
        ? copy.reviewTranscriptionFailedHeading
        : copy.reviewInsufficientHeading;

  const statusText =
    result.recordingStatus === "missing"
      ? copy.reviewMissingText
      : result.recordingStatus === "transcription_failed"
        ? copy.reviewTranscriptionFailedText
        : copy.reviewInsufficientText;

  return (
    <article className={examSpeakingReview.card}>
      <div className={examSpeakingReview.cardHeader}>
        <h3 className={examSpeakingReview.cardTitle}>{result.taskTitle}</h3>

        <p className={examSpeakingReview.cardLevel}>
          <span className={examSpeakingReview.cardLevelLabel}>
            {copy.reviewTaskLevelLabel}
          </span>
          {result.estimatedLevel}
        </p>
      </div>

      <div className={examSpeakingReview.cardBody}>
        <div className={examSpeakingReview.metaRow}>
          <span className={examSpeakingReview.metaItem}>
            <span className={examSpeakingReview.metaLabel}>
              {copy.reviewTaskLimitLabel}
            </span>
            <span className={examSpeakingReview.metaValue}>
              {formatSpeakingDuration(result.responseTimeLimitSeconds)}
            </span>
          </span>

          <span className={examSpeakingReview.metaItem}>
            <span className={examSpeakingReview.metaLabel}>
              {copy.reviewTaskDurationLabel}
            </span>
            <span className={examSpeakingReview.metaValue}>
              {result.recordedDurationSeconds > 0
                ? formatSpeakingClock(result.recordedDurationSeconds)
                : copy.completeNoLengthValue}
            </span>
          </span>

          {/* The status is a word rather than a badge, and a missing
              recording is quiet navy rather than red. A learner may have
              skipped a task, may have had no working microphone, or may
              have been reading the section rather than sitting it, and
              none of those is a failure this card has any business
              colouring red.

              It is drawn for two of the four statuses only. The header
              strip above already reads "Could not be reviewed" or
              "Insufficient response" where those apply, and repeating
              the same words two lines lower says nothing twice. */}
          {reviewed || result.recordingStatus === "missing" ? (
            <span className={examSpeakingReview.metaFlag}>
              {reviewed
                ? copy.completeRecordedValue
                : copy.completeMissingValue}
            </span>
          ) : null}
        </div>

        <p className={examSpeakingReview.sectionText}>
          {result.oneSentenceJustification}
        </p>

        <section className={examSpeakingReview.section}>
          <h4 className={examSpeakingReview.sectionTitle}>
            {copy.reviewTimeLengthHeading}
          </h4>
          <p className={examSpeakingReview.sectionText}>
            {result.timeLengthCheck}
          </p>
        </section>

        {/* The transcript is drawn for a reviewed task and for a task
            whose recording produced too little speech to review. The
            second is deliberate: a learner told their answer held almost
            no speech should be able to see the handful of words that
            were picked up, because that is what tells them whether the
            microphone failed or they stopped early. */}
        {reviewed || result.recordingStatus === "insufficient_response" ? (
          <SpeakingTranscriptCard
            transcript={result.transcript}
            note={result.transcriptConfidenceNote || undefined}
            durationSeconds={result.recordedDurationSeconds}
            copy={copy}
          />
        ) : null}

        <div className={examSpeakingReview.feedbackSplit}>
          <div className={examSpeakingReview.feedbackBlock}>
            <h4 className={examSpeakingReview.sectionTitle}>
              {copy.reviewSucceededLabel}
            </h4>
            <p className={examSpeakingReview.sectionText}>
              {result.criticalFeedback.succeeded}
            </p>
          </div>

          <div className={examSpeakingReview.feedbackBlock}>
            <h4 className={examSpeakingReview.sectionTitle}>
              {copy.reviewFellShortLabel}
            </h4>
            <p className={examSpeakingReview.sectionText}>
              {result.criticalFeedback.fellShort}
            </p>
          </div>
        </div>

        {result.missingPromptPoints.length > 0 ? (
          <section className={examSpeakingReview.section}>
            <h4 className={examSpeakingReview.sectionTitle}>
              {copy.reviewMissingPointsLabel}
            </h4>
            <ul className={examSpeakingReview.list}>
              {result.missingPromptPoints.map((point) => (
                <li key={point} className={examSpeakingReview.listItem}>
                  {point}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {result.templateLanguageWarnings.length > 0 ? (
          <section className={examSpeakingReview.section}>
            <h4 className={examSpeakingReview.sectionTitle}>
              {copy.reviewTemplateWarningsLabel}
            </h4>
            <ul className={examSpeakingReview.list}>
              {result.templateLanguageWarnings.map((warning) => (
                <li key={warning} className={examSpeakingReview.listItem}>
                  {warning}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {reviewed ? (
          <>
            <section className={examSpeakingReview.section}>
              <h4 className={examSpeakingReview.sectionTitle}>
                {copy.reviewCriteriaHeading}
              </h4>
              <SpeakingCriterionScoreTable
                criteria={result.criteria}
                caption={result.taskTitle}
                copy={copy}
              />
            </section>

            <SpeakingTopMistakesCard mistakes={result.topMistakes} copy={copy} />

            {result.nextLevelRewrite ? (
              <SpeakingRewriteCard
                heading={copy.reviewRewriteHeading}
                targetLevel={result.nextLevelRewrite.targetLevel}
                response={result.nextLevelRewrite.response}
                changeSummary={result.nextLevelRewrite.changeSummary}
                copy={copy}
              />
            ) : null}

            {result.levelElevenTwelveModel ? (
              <SpeakingRewriteCard
                heading={copy.reviewModelHeading}
                intro={copy.reviewModelIntro}
                response={result.levelElevenTwelveModel.response}
                copy={copy}
              />
            ) : null}
          </>
        ) : (
          <div className={examSpeakingReview.statusBlock}>
            <p className={examSpeakingReview.statusHeading}>{statusHeading}</p>
            <p className={examSpeakingReview.statusText}>{statusText}</p>
          </div>
        )}
      </div>
    </article>
  );
}
