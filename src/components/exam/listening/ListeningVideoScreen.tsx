import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ExamVideoPlayer } from "../ExamVideoPlayer";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import { listeningCopy } from "@/features/exam-engine/listening-copy";

// Video screen for a Listening part (EXAM-11).
//
// Screen type 5 from docs/product/exam-engine-screen-types.md: one video,
// nothing else on the screen to read while it plays. The instruction row
// sits above the player and the part title goes in the top bar, so the
// canvas stays quiet. The same shape as ListeningAudioScreen, with a
// picture instead of a control bar.
//
// The player is the EXAM-02 ExamVideoPlayer, not a new one. It already
// puts the clip in a clean bordered area with a caption strip, already
// draws controls with no autoplay and preload metadata, and already
// carries two layers of fallback text, one for a clip that fails to load
// and one for a browser that cannot play video at all. The only thing
// this screen overrides is the wording that names the clip an
// instructional video, which this one is not.
//
// Not a client component. It holds no state and passes handlers through,
// so it renders in either context. onVideoEnded and nextDisabled are the
// gate for one time playback, which is not built yet: nothing here forces
// the video to finish before Next, and nothing stops it being replayed.
// The props are in place so that arrives as a wiring change rather than a
// rewrite.
//
// No timer. The video screen carries no countdown, the same way the audio
// screens do not.
//
// The clip can be asked to start on its own (EXAM-15F). The full Listening
// route passes autoPlayMedia and the internal part route does not, and a
// browser that refuses autoplay leaves the controls where they are and the
// player prints a short line saying to press play.

export type ListeningVideoScreenProps = {
  title: string;
  videoSrc: string;
  // Learner facing clip name, for example "Discussion video".
  videoTitle?: string;
  durationLabel?: string;
  posterSrc?: string;
  // What the learner is being asked to do, for example "Watch the
  // discussion."
  instructionText?: string;
  // Quiet line under the player.
  hintText?: string;
  // Ask the browser to start the clip when the screen opens.
  autoPlayMedia?: boolean;
  metaText?: string;
  onVideoEnded?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  nextDisabled?: boolean;
};

export function ListeningVideoScreen({
  title,
  videoSrc,
  videoTitle = listeningCopy.discussionVideoTitle,
  durationLabel,
  posterSrc,
  instructionText = listeningCopy.discussionInstruction,
  hintText = listeningCopy.discussionVideoHint,
  autoPlayMedia = false,
  metaText,
  onVideoEnded,
  onNext,
  onBack,
  showBack = true,
  nextDisabled = false,
}: ListeningVideoScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
      nextDisabled={nextDisabled}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow text={instructionText} />

        <div className={examScreenBody.videoStack}>
          <ExamVideoPlayer
            src={videoSrc}
            title={videoTitle}
            poster={posterSrc}
            durationLabel={durationLabel}
            preload="metadata"
            autoPlay={autoPlayMedia}
            playerLabel={listeningCopy.discussionVideoPlayerLabel}
            unsupportedText={listeningCopy.discussionVideoUnsupportedText}
            onEnded={onVideoEnded}
          />

          {hintText ? (
            <p className={examScreenBody.hint}>{hintText}</p>
          ) : null}
        </div>
      </div>
    </ExamShell>
  );
}
