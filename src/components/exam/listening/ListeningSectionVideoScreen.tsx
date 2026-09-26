import { ExamVideoScreen } from "../ExamVideoScreen";
import { ListeningSectionProgressBar } from "./ListeningSectionProgressBar";
import { listeningSectionCopy } from "@/features/exam-engine/listening-section-copy";
import type { ListeningSectionCopy } from "@/features/exam-engine/listening-section-copy";
import type { ListeningSectionVideoContent } from "@/features/exam-engine/listening-section-types";

// Listening section instructional video screen (EXAM-15).
//
// The second screen of the full Listening run, and screen type 2 from
// docs/product/exam-engine-screen-types.md, so it is the EXAM-02
// ExamVideoScreen with the section clip filled in rather than a new
// layout.
//
// The clip comes from the EXAM-02 registry by way of the section content
// object, never from a path typed here, so this plays the same Listening
// walkthrough the instruction preview plays. A missing file is handled by
// ExamVideoPlayer, which swaps the stage for a safe fallback message
// instead of showing a broken element.
//
// The skip control is offered, because nothing here is gated on the clip
// finishing and a learner walking the flow for the third time should not
// have to sit through it. Skipping goes to the same place Next does, which
// is the first screen of Part 1.
//
// No timer. Instructional video screens carry no countdown.
//
// The clip attempts to start on its own (EXAM-15F), because the learner
// reached this screen by pressing Next and a walkthrough that waits to be
// pressed a second time is friction rather than instruction. It keeps its
// controls, because it is instructional and a learner may well want to
// pause it or watch a step again, and the skip control under it is
// unchanged. A browser that refuses autoplay shows the poster frame and a
// short line saying to press play.

export type ListeningSectionVideoScreenProps = {
  content: ListeningSectionVideoContent;
  totalParts: number;
  totalQuestions: number;
  answeredCount: number;
  copy?: ListeningSectionCopy;
  metaText?: string;
  onNext?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningSectionVideoScreen({
  content,
  totalParts,
  totalQuestions,
  answeredCount,
  copy = listeningSectionCopy,
  metaText,
  onNext,
  onSkip,
  onBack,
  showBack = true,
}: ListeningSectionVideoScreenProps) {
  return (
    <ExamVideoScreen
      title={content.title}
      videoTitle={content.video.title}
      videoSrc={content.video.src}
      posterSrc={content.video.poster}
      durationLabel={content.video.durationLabel}
      autoPlayVideo
      description={content.description}
      helperText={content.helperText}
      metaText={metaText}
      onNext={onNext}
      onSkip={onSkip}
      onBack={onBack}
      showBack={showBack}
    >
      <ListeningSectionProgressBar
        currentPart={0}
        totalParts={totalParts}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        copy={copy}
      />
    </ExamVideoScreen>
  );
}
