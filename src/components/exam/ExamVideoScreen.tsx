import type { ReactNode } from "react";
import { ExamButton } from "./ExamButton";
import { ExamInstructionRow } from "./ExamInstructionRow";
import { ExamShell } from "./ExamShell";
import { ExamVideoPlayer } from "./ExamVideoPlayer";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { examScreenBody } from "@/features/exam-engine/exam-theme";

// Instructional video screen (EXAM-02).
//
// Screen type 2 in docs/product/exam-engine-screen-types.md: the complete
// test overview video, and the instructional video that follows each set
// of section instructions.
//
// The body is one line of instruction, the player in a clean bordered
// area, and an optional skip control under it, matching the reference
// layouts. The EXAM-01 shell owns the chrome, and the player replaces the
// grey ExamMediaPlaceholder in the same slot.
//
// No timer. Instructional video screens carry no countdown.
//
// Media gating belongs to the flow tickets: hold nextDisabled true while
// a clip is blocking and pass onVideoEnded to release it. That makes the
// screen a client component, which is why this component holds no state
// of its own and works in either context.

export type ExamVideoScreenProps = {
  // Top bar title, for example
  // "CELPIP Decoded practice test - Listening instructional video".
  title: string;
  // Learner facing clip name, shown on the player caption strip.
  videoTitle: string;
  // Raw public path or absolute URL.
  videoSrc: string;
  posterSrc?: string;
  durationLabel?: string;
  // Sentence above the player.
  description?: string;
  // Quiet line under the player.
  helperText?: string;
  // Small note in the top bar.
  metaText?: string;
  // Passed through to the player. Drop to none when a page holds several
  // players.
  preload?: "none" | "metadata";
  // Ask the browser to start the clip when the screen opens (EXAM-15F).
  // The full Listening route passes it for the instructional video, which
  // keeps its controls either way because it is instructional.
  autoPlayVideo?: boolean;
  // Fires when the clip finishes. Requires a client component parent.
  onVideoEnded?: () => void;

  showNext?: boolean;
  nextLabel?: string;
  nextHref?: string;
  onNext?: () => void;
  nextDisabled?: boolean;

  showBack?: boolean;
  backLabel?: string;
  backHref?: string;
  onBack?: () => void;

  // Skip control under the player. Shown when a target or a handler is
  // given.
  skipLabel?: string;
  skipHref?: string;
  onSkip?: () => void;

  secondaryAction?: ReactNode;
  // "Continue when you are ready", shown under the player.
  showContinueHint?: boolean;
  children?: ReactNode;
  className?: string;
};

export function ExamVideoScreen({
  title,
  videoTitle,
  videoSrc,
  posterSrc,
  durationLabel,
  description,
  helperText,
  metaText,
  preload,
  autoPlayVideo = false,
  onVideoEnded,
  showNext = true,
  nextLabel,
  nextHref,
  onNext,
  nextDisabled = false,
  showBack = true,
  backLabel,
  backHref,
  onBack,
  skipLabel = examCopy.skipVideoLabel,
  skipHref,
  onSkip,
  secondaryAction,
  showContinueHint = false,
  children,
  className,
}: ExamVideoScreenProps) {
  const showSkip = Boolean(skipHref || onSkip);
  const showHint = showContinueHint && showNext;

  return (
    <ExamShell
      title={title}
      metaText={metaText}
      showNext={showNext}
      nextLabel={nextLabel}
      nextHref={nextHref}
      onNext={onNext}
      nextDisabled={nextDisabled}
      showBack={showBack}
      backLabel={backLabel}
      backHref={backHref}
      onBack={onBack}
      secondaryAction={secondaryAction}
      className={className}
    >
      <div className={examScreenBody.stack}>
        {description ? (
          <ExamInstructionRow
            heading={examCopy.instructionalVideoLabel}
            text={description}
          />
        ) : null}

        <div className={examScreenBody.videoStack}>
          <ExamVideoPlayer
            src={videoSrc}
            title={videoTitle}
            poster={posterSrc}
            durationLabel={durationLabel}
            preload={preload}
            autoPlay={autoPlayVideo}
            onEnded={onVideoEnded}
          />

          {helperText ? (
            <p className={examScreenBody.hint}>{helperText}</p>
          ) : null}

          {showSkip ? (
            <div className={examScreenBody.actions}>
              <ExamButton
                variant="secondary"
                size="md"
                uppercase={false}
                href={skipHref}
                onClick={onSkip}
              >
                {skipLabel}
              </ExamButton>
            </div>
          ) : null}
        </div>

        {children}

        {showHint ? (
          <p className={examScreenBody.hint}>
            {examCopy.continueWhenReadyLabel}
          </p>
        ) : null}
      </div>
    </ExamShell>
  );
}
