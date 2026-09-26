import { SpeakingTopMistakesCard } from "./SpeakingTopMistakesCard";
import { examSpeakingReview } from "@/features/exam-engine/exam-theme";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockMistake } from "@/features/exam-engine/speaking-mock-evaluation-types";

// A rewritten Speaking answer (EXAM-28).
//
// Used twice on every reviewed task card, for the two rewrites that
// answer different questions:
//
// - the next-level rewrite, which is the learner's own answer with the
//   named weaknesses fixed, one level up, so the improvement is a step
//   they can see themselves taking
// - the Level 11-12 model answer, which is a fresh response to the same
//   prompt at the top of the scale, so the distance is visible rather
//   than guessed at
//
// One component for both, because they are the same object on the page:
// a heading, an optional target level, an optional intro line, and a
// block of prose. The difference between them is what is passed in, and
// a second component that differed only in its heading would be a second
// place to fix a spacing bug.
//
// Both blocks are speech written down, not writing. The prompt asks for
// them without greetings, sign-offs or headings, and asks for them to be
// sayable inside the task's recording window, so what a learner reads
// here is something they could practise out loud rather than an essay
// they could never deliver in sixty seconds.
//
// The prose is rendered with whitespace-pre-line, so any breaks the
// model produced survive into the page. It is plain text, not HTML and
// not markdown. Nothing from the model is interpreted as markup anywhere
// on this screen, which is what makes a rewrite safe to render whatever
// comes back in it.
//
// Presentational only. It holds no state.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingRewriteCardProps = {
  heading: string;
  // The level this rewrite is written at, shown at the end of the header
  // strip. Omit to show none.
  targetLevel?: string;
  // Quiet line under the header, for a block that needs one.
  intro?: string;
  // The rewritten answer.
  response: string;
  // The changes made, shown under the prose. Omit or pass an empty array
  // to show none.
  changeSummary?: SpeakingMockMistake[];
  copy?: SpeakingMockCopy;
};

export function SpeakingRewriteCard({
  heading,
  targetLevel,
  intro,
  response,
  changeSummary,
  copy = speakingMockCopy,
}: SpeakingRewriteCardProps) {
  return (
    <section className={examSpeakingReview.rewrite}>
      <div className={examSpeakingReview.rewriteHeader}>
        <h4 className={examSpeakingReview.rewriteTitle}>{heading}</h4>

        {targetLevel ? (
          <p className={examSpeakingReview.rewriteTarget}>
            {copy.reviewRewriteTargetLabel} {targetLevel}
          </p>
        ) : null}
      </div>

      {intro ? (
        <p className={examSpeakingReview.rewriteIntro}>{intro}</p>
      ) : null}

      <p className={examSpeakingReview.rewriteBody}>{response}</p>

      {changeSummary && changeSummary.length > 0 ? (
        <SpeakingTopMistakesCard
          mistakes={changeSummary}
          heading={copy.reviewRewriteChangesHeading}
          emptyText={null}
          copy={copy}
        />
      ) : null}
    </section>
  );
}
