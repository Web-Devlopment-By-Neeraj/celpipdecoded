import { WritingTopMistakesCard } from "./WritingTopMistakesCard";
import { examWritingReview } from "@/features/exam-engine/exam-theme";
import { writingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockMistake } from "@/features/exam-engine/writing-mock-evaluation-types";

// A rewritten Writing response (EXAM-26).
//
// Used twice on every task card, for the two rewrites that answer
// different questions:
//
// - the next-level rewrite, which is the learner's own response with the
//   named weaknesses fixed, one level up, so the improvement is a step
//   they can see themselves taking
// - the Level 11-12 model response, which is a fresh answer to the same
//   prompt at the top of the scale, so the distance is visible rather
//   than guessed at
//
// One component for both, because they are the same object on the page: a
// heading, an optional target level, an optional intro line, and a block
// of prose. The difference between them is what is passed in, and a
// second component that differed only in its heading would be a second
// place to fix a spacing bug.
//
// The prose is rendered with whitespace-pre-line, so the paragraph breaks
// in the rewrite survive into the page. That is not only a readability
// choice: paragraphing is one of the things both task checklists mark, so
// a rewrite that demonstrates good paragraphing has to be allowed to show
// it.
//
// It is plain text, not HTML and not markdown. Nothing from the model is
// interpreted as markup anywhere on this screen, which is what makes a
// rewrite safe to render whatever comes back in it. There is deliberately
// no marked-up inline diff of the learner's response against the rewrite:
// see the note in docs/product/writing-mock-ai-review-score.md.
//
// Presentational only. It holds no state.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingRewriteCardProps = {
  heading: string;
  // The level this rewrite is written at, shown at the end of the header
  // strip. Omit to show none.
  targetLevel?: string;
  // Quiet line under the header, for a block that needs one.
  intro?: string;
  // The rewritten response.
  response: string;
  // The changes made, shown under the prose. Omit or pass an empty array
  // to show none.
  changeSummary?: WritingMockMistake[];
  copy?: WritingMockCopy;
};

export function WritingRewriteCard({
  heading,
  targetLevel,
  intro,
  response,
  changeSummary,
  copy = writingMockCopy,
}: WritingRewriteCardProps) {
  return (
    <section className={examWritingReview.rewrite}>
      <div className={examWritingReview.rewriteHeader}>
        <h4 className={examWritingReview.rewriteTitle}>{heading}</h4>

        {targetLevel ? (
          <p className={examWritingReview.rewriteTarget}>
            {copy.reviewRewriteTargetLabel} {targetLevel}
          </p>
        ) : null}
      </div>

      {intro ? <p className={examWritingReview.rewriteIntro}>{intro}</p> : null}

      <p className={examWritingReview.rewriteBody}>{response}</p>

      {changeSummary && changeSummary.length > 0 ? (
        <WritingTopMistakesCard
          mistakes={changeSummary}
          heading={copy.reviewRewriteChangesHeading}
          emptyText={null}
          copy={copy}
        />
      ) : null}
    </section>
  );
}
