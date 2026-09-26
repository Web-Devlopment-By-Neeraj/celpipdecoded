import { examReadingScore } from "@/features/exam-engine/exam-theme";
import {
  formatReadingCountOfTotal,
  formatReadingScoreMessage,
  formatReadingScorePercent,
  readingReviewCopy,
} from "@/features/exam-engine/reading-copy";
import type { ReadingScoreSummary } from "@/features/exam-engine/reading-types";

// Practice score summary for a Reading part (EXAM-17).
//
// The percentage and the sentence saying what it means at the top, four
// counts under it, then the two notes. It is a bordered strip on the exam
// canvas, not a dashboard card: no shadow, no artwork, no pill, and
// nothing that would look at home on a marketing page.
//
// The four counts are Total questions, Answered, Left blank and Correct.
// Left blank is a reading of its own even though a blank is counted as
// incorrect in the percentage, because "you got 8 of 11" and "you left 2
// of them empty" are different facts and a learner should not have to
// subtract to find the second one. The note under the counts says which
// way the blanks were counted, in a sentence.
//
// The result is called a practice score everywhere, and the note under it
// says in full that it is not an official CELPIP score. No CELPIP level
// and no estimated Reading band is shown, here or anywhere else in this
// part: a band would need the full Reading section and this is one part
// of four.
//
// Presentational only. Every number arrives on the summary, which was
// counted on the server, and nothing here calculates anything.

// EXAM-24 added the two note overrides below, and nothing else. The four
// part score screens pass neither and are unchanged: both default to the
// readingReviewCopy lines they already printed.
//
// The full Reading section score screen passes both, because its notes
// have to say something the part notes cannot. The part note ends "No
// CELPIP Reading level is estimated from one part.", which is true on a
// part screen and would be a lie under a section score that shows an
// estimated band; the section note says what that estimate is worth
// instead. Overriding two strings is what let the section reuse this card
// whole rather than fork a second one that counts the same five readings.
export type ReadingScoreSummaryCardProps = {
  summary: ReadingScoreSummary;
  // Sentence under the readings saying the result is not an official
  // CELPIP score. Defaults to the part wording.
  practiceResultNote?: string;
  // Sentence saying how blanks were counted. Printed only when there is a
  // blank to explain. Defaults to the part wording.
  blankNote?: string;
};

export function ReadingScoreSummaryCard({
  summary,
  practiceResultNote = readingReviewCopy.practiceResultNote,
  blankNote = readingReviewCopy.blankNote,
}: ReadingScoreSummaryCardProps) {
  const {
    totalQuestions,
    answeredCount,
    correctCount,
    blankCount,
    percentage,
  } = summary;

  return (
    <div className={examReadingScore.card}>
      <div className={examReadingScore.headline}>
        <div className={examReadingScore.headlineBlock}>
          <span className={examReadingScore.label}>
            {readingReviewCopy.scoreLabel}
          </span>
          <span className={examReadingScore.headlineValue}>
            {formatReadingScorePercent(percentage)}
          </span>
        </div>

        <p className={examReadingScore.headlineMessage}>
          {formatReadingScoreMessage(correctCount, totalQuestions)}
        </p>
      </div>

      <div className={examReadingScore.grid}>
        <div className={examReadingScore.item}>
          <span className={examReadingScore.label}>
            {readingReviewCopy.totalQuestionsLabel}
          </span>
          <span className={examReadingScore.value}>{totalQuestions}</span>
        </div>

        <div className={examReadingScore.item}>
          <span className={examReadingScore.label}>
            {readingReviewCopy.answeredLabel}
          </span>
          <span className={examReadingScore.value}>
            {formatReadingCountOfTotal(answeredCount, totalQuestions)}
          </span>
        </div>

        <div className={examReadingScore.item}>
          <span className={examReadingScore.label}>
            {readingReviewCopy.blankLabel}
          </span>
          <span className={examReadingScore.value}>
            {formatReadingCountOfTotal(blankCount, totalQuestions)}
          </span>
        </div>

        <div className={examReadingScore.item}>
          <span className={examReadingScore.label}>
            {readingReviewCopy.correctLabel}
          </span>
          <span className={examReadingScore.value}>
            {formatReadingCountOfTotal(correctCount, totalQuestions)}
          </span>
        </div>
      </div>

      {/* Only printed when there is a blank to explain, so a learner who
          answered everything is not told about a rule that did not
          affect them. */}
      {blankCount > 0 ? (
        <p className={examReadingScore.note}>{blankNote}</p>
      ) : null}

      <p className={examReadingScore.note}>{practiceResultNote}</p>
    </div>
  );
}
