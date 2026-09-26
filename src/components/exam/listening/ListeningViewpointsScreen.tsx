import { ListeningAudioScreen } from "./ListeningAudioScreen";
import { listeningCopy } from "@/features/exam-engine/listening-copy";
import type { ListeningViewpointsMedia } from "@/features/exam-engine/listening-viewpoints-types";

// Media screen for a viewpoints Listening part (EXAM-13).
//
// Screen type 4 from docs/product/exam-engine-screen-types.md: one clip,
// nothing else on the screen to read while it plays. Part 6's report is an
// mp3, so this is the audio screen rather than a video screen, and the
// player, the fallback and the shell all come from ListeningAudioScreen
// unchanged. EXAM-09 already made that screen's instruction and hint into
// props for exactly this case, so no shared component needed editing for
// this part.
//
// This wrapper exists for two reasons rather than the prototype calling
// ListeningAudioScreen directly:
//
// - It takes ListeningViewpointsMedia, so the prototype hands over one
//   object instead of unpacking url, title and durationLabel at the call
//   site, and a later field on that type reaches the screen without
//   touching the prototype.
// - It carries the viewpoints defaults, the report instruction, the report
//   player title and the report hint, in one place. A viewpoints part
//   whose content object says nothing about its media wording still reads
//   correctly.
//
// A server component. Nothing here is interactive: the only stateful piece
// on the screen is the player, which is a client component of its own.
//
// Media behaviour is the shared player's, and all of it is what the ticket
// asks for: controls visible, no autoplay, preload metadata, and fallback
// text when the clip cannot load. Deliberately not built yet, and recorded
// as known gaps in docs/product/listening-part-6-prototype.md: one time
// playback, and gating Next on the clip finishing. onAudioEnded is passed
// straight through so the ticket that adds the gate has somewhere to hook
// into.

export type ListeningViewpointsScreenProps = {
  title: string;
  media: ListeningViewpointsMedia;
  // What the learner is being asked to do, for example "Listen to the
  // following report."
  instructionText?: string;
  // Quiet line under the player.
  hintText?: string;
  // Ask the browser to start the clip when the screen opens (EXAM-15F).
  // Passed straight through to ListeningAudioScreen, so Part 6 behaves the
  // way every other Listening media screen does.
  autoPlayMedia?: boolean;
  metaText?: string;
  onAudioEnded?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  nextDisabled?: boolean;
};

export function ListeningViewpointsScreen({
  title,
  media,
  instructionText = listeningCopy.reportInstruction,
  hintText = listeningCopy.reportHint,
  autoPlayMedia = false,
  metaText,
  onAudioEnded,
  onNext,
  onBack,
  showBack = true,
  nextDisabled = false,
}: ListeningViewpointsScreenProps) {
  return (
    <ListeningAudioScreen
      title={title}
      audioSrc={media.url}
      audioTitle={media.title || listeningCopy.reportPlayerTitle}
      durationLabel={media.durationLabel}
      instructionText={instructionText}
      hintText={hintText}
      autoPlayMedia={autoPlayMedia}
      metaText={metaText}
      onAudioEnded={onAudioEnded}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
      nextDisabled={nextDisabled}
    />
  );
}
