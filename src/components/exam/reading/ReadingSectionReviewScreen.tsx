import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ReadingReviewQuestionCard } from "./ReadingReviewQuestionCard";
import {
  MockTestReviewPanel,
  MockTestReviewStack,
} from "../player/MockTestReviewPanel";
import {
  examReadingReview,
  examScreenBody,
  examText,
} from "@/features/exam-engine/exam-theme";
import {
  formatReadingSectionGroupCount,
  readingSectionCopy,
} from "@/features/exam-engine/reading-copy";
import type { ReadingSectionCopy } from "@/features/exam-engine/reading-copy";
import type { ReadingSectionPartResult } from "@/features/exam-engine/reading-section-types";

// Full Reading answer review screen (EXAM-24).
//
// Every question in the Reading section, grouped by part, each with the
// option the learner chose, the correct option, and a Correct, Incorrect
// or Blank status. It is opened from the practice score rather than shown
// before it, which is the order the four Reading part flows already use:
// the section is answered on four screens, so a learner arriving at the
// end wants the result first and the question by question account second.
//
// A group is a bordered panel over a list of cards: a tinted header strip
// carrying the part label and the CELPIP part name, the part's question
// count on the right of it, and the cards in the body. The chrome is the
// shared player review panel (EXAM-UI-02), so the Reading groups and the
// Listening groups read as the same kind of object, and the rows inside
// are the EXAM-17 ReadingReviewQuestionCard, unchanged. That card is already part neutral: it prints "No answer
// selected" for a blank while still showing the correct answer, and it
// prints an explanation only when the row carries one.
//
// No explanations appear anywhere in this review. Mock Test 1 publishes
// none for Reading, so every row carries null, and nothing here invents
// one. There is no AI written explanation in this flow.
//
// No estimated band and no CELPIP level appears on this screen. The band
// is a reading of the score and it lives on the score screen, which is
// one Back away.
//
// The score summary is deliberately not repeated at the top, unlike the
// four part review screens. The section score is the screen immediately
// behind this one rather than a screen the learner may have left several
// steps ago, and repeating five readings above 38 cards would push the
// first question below the fold.
//
// Presentational only. The results arrive already marked, from the
// server, where the answer keys live.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ReadingSectionReviewScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  parts: ReadingSectionPartResult[];
  copy?: ReadingSectionCopy;
  metaText?: string;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingSectionReviewScreen({
  title,
  parts,
  copy = readingSectionCopy,
  metaText,
  onBack,
  showBack = true,
}: ReadingSectionReviewScreenProps) {
  const hasRows = parts.some((part) => part.rows.length > 0);

  return (
    <ExamShell
      title={title}
      metaText={metaText}
      showNext={false}
      onBack={onBack}
      showBack={showBack}
      backLabel={copy.backToScoreLabel}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow
          heading={copy.reviewTitle}
          text={copy.reviewSubtitle}
        />

        {/* One shared player review panel per part (EXAM-UI-02). The four
            parts used to run into one another as a single unbroken column
            of 38 question cards under four heading rules, which is the
            longest screen in the Reading test and the one where losing
            your place costs the most. A bordered box with a tinted header
            strip per part gives a reader somewhere to stop. */}
        {hasRows ? (
          <MockTestReviewStack>
            {parts.map((part) => (
              <MockTestReviewPanel
                key={part.partId}
                title={`${part.partLabel} - ${part.partTitle}`}
                meta={formatReadingSectionGroupCount(part.rows.length)}
              >
                <ol className={examReadingReview.list}>
                  {part.rows.map((row) => (
                    <ReadingReviewQuestionCard key={row.questionId} row={row} />
                  ))}
                </ol>
              </MockTestReviewPanel>
            ))}
          </MockTestReviewStack>
        ) : (
          <p className={examText.muted}>{copy.reviewEmptyText}</p>
        )}

        <p className={examScreenBody.notice}>{copy.reviewNotice}</p>
      </div>
    </ExamShell>
  );
}
