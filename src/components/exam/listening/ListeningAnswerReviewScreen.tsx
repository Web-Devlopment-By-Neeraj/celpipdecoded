import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamPanel } from "../ExamPanel";
import { ExamShell } from "../ExamShell";
import { ListeningAnswerReviewTable } from "./ListeningAnswerReviewTable";
import { examReview, examScreenBody } from "@/features/exam-engine/exam-theme";
import { SHOW_EXAM_ANSWER_KEY_REFERENCE } from "@/features/exam-engine/exam-debug";
import { listeningReviewCopy } from "@/features/exam-engine/listening-review-copy";
import type { ListeningReviewCopy } from "@/features/exam-engine/listening-review-copy";
import type { ListeningReviewRow } from "@/features/exam-engine/listening-review-types";

// Answer review screen for a Listening part (EXAM-04).
//
// The first screen after the last question. It lists every question in
// the part with the option the learner chose, the correct option when one
// is known, and a status word, then sends them on to the score screen
// with Next.
//
// Back goes to the last question rather than out of the part. That is
// prototype behaviour, kept for the same reason Back is enabled on every
// EXAM-03 screen: the sequence has to be walkable during review.
//
// **The answer key reference panel is off by default** (EXAM-UI-03). It
// opens the published answer and explanation sheet for the whole part,
// which is the source a reviewer checks a transcribed key against and is
// a staff control, not a learner one. It used to render on every part
// level review, and those routes are reachable from a typed URL by anyone
// signed in, so a learner who wandered onto one was offered the answers
// to a part they had just sat.
//
// It now renders only when showAnswerKeyReference is true, and that
// defaults to SHOW_EXAM_ANSWER_KEY_REFERENCE, which is off unless
// NEXT_PUBLIC_SHOW_EXAM_ANSWER_KEY is set to "true". A normal local run
// and every deployment therefore hide it with nothing configured. The
// caller can still force it on for a staff screen by passing the prop.
//
// This changes what is offered, not what is protected. The keys were
// never on the page: every route strips its key on the server before the
// content crosses to the browser, and marking runs in a server action
// beside the key. See src/features/exam-engine/exam-debug.ts.
//
// When it does render it is still collapsed behind a disclosure, so it
// cannot put the sheet on screen unasked. The image is referenced from
// Cloudinary and never downloaded, and it is a plain img rather than
// next/image for the reason recorded in ListeningScenarioScreen.
//
// No state of its own. The rows arrive already built, from wherever the
// answer key happens to live: Part 1 builds them in the browser, Part 2
// builds them on the server and sends the finished rows down.

export type ListeningAnswerReviewScreenProps = {
  // Exam frame title, normally the part title from the content object.
  title: string;
  rows: ListeningReviewRow[];
  // Answer and explanation sheet, when the source publishes one. Shown
  // only when showAnswerKeyReference is true.
  explanationImageUrl?: string;
  explanationImageAlt?: string;
  // Whether the answer key reference panel is offered at all. Defaults to
  // the development flag, which is off, so a learner never sees it.
  showAnswerKeyReference?: boolean;
  // Wording for the part. Defaults to Listening Part 1.
  copy?: ListeningReviewCopy;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningAnswerReviewScreen({
  title,
  rows,
  explanationImageUrl,
  explanationImageAlt,
  showAnswerKeyReference = SHOW_EXAM_ANSWER_KEY_REFERENCE,
  copy = listeningReviewCopy,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ListeningAnswerReviewScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      nextLabel={copy.viewScoreLabel}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
      backLabel={copy.backToQuestionsLabel}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow
          heading={copy.reviewTitle}
          text={copy.reviewSubtitle}
        />

        <ListeningAnswerReviewTable rows={rows} copy={copy} />

        {showAnswerKeyReference && explanationImageUrl ? (
          <ExamPanel title={copy.explanationPanelTitle} tone="muted">
            <div className={examReview.referenceStack}>
              <p>{copy.explanationPanelIntro}</p>

              <details>
                <summary className={examReview.referenceToggle}>
                  {copy.explanationToggleLabel}
                </summary>

                <figure className={examReview.referenceFigure}>
                  {/* eslint-disable-next-line @next/next/no-img-element --
                      remote Cloudinary asset, referenced and never
                      downloaded. See ListeningScenarioScreen. */}
                  <img
                    src={explanationImageUrl}
                    alt={explanationImageAlt ?? copy.explanationImageCaption}
                    className={examReview.referenceImage}
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className={examReview.referenceCaption}>
                    {copy.explanationImageCaption}
                  </figcaption>
                </figure>
              </details>
            </div>
          </ExamPanel>
        ) : null}

        <p className={examScreenBody.notice}>{copy.reviewNotice}</p>
      </div>
    </ExamShell>
  );
}
