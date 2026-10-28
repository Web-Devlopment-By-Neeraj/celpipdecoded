import { ExamVideoScreen } from "./ExamVideoScreen";
import { INSTRUCTIONAL_VIDEO_PRELOAD } from "@/features/media/cloudinary-video";
import type { ExamInstructionalVideoAsset } from "@/features/exam-engine/instruction-screen-types";

export type SectionInstructionVideoScreenProps = {
  title: string;
  video: ExamInstructionalVideoAsset;
  description?: string;
  helperText?: string;
  metaText?: string;
  onNext?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  backHref?: string;
  backLabel?: string;
  showBack?: boolean;
  autoPlayVideo?: boolean;
};

export function SectionInstructionVideoScreen({
  title,
  video,
  description,
  helperText,
  metaText,
  onNext,
  onSkip,
  onBack,
  backHref,
  backLabel,
  showBack = true,
  autoPlayVideo = true,
}: SectionInstructionVideoScreenProps) {
  return (
    <ExamVideoScreen
      title={title}
      videoTitle={video.title}
      videoSrc={video.src}
      description={description ?? video.description}
      helperText={helperText}
      metaText={metaText}
      preload={INSTRUCTIONAL_VIDEO_PRELOAD}
      autoPlayVideo={autoPlayVideo}
      onNext={onNext}
      onSkip={onSkip}
      onBack={onBack}
      backHref={backHref}
      backLabel={backLabel}
      showBack={showBack}
    />
  );
}
