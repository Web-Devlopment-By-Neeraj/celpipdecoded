import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ListeningAudioPlayer } from "./ListeningAudioPlayer";
import { examListening, examScreenBody } from "@/features/exam-engine/exam-theme";
import { listeningCopy } from "@/features/exam-engine/listening-copy";

// Audio screen for a Listening part (EXAM-03, widened by EXAM-09).
//
// Screen type 4 from docs/product/exam-engine-screen-types.md: one clip,
// nothing else on the screen to read while it plays. The instruction row
// sits above the player and the section label goes in the top bar, so the
// canvas stays quiet.
//
// EXAM-09 made the instruction and the hint props rather than fixed
// strings. The screen used to say "Listen to the conversation" always,
// which is wrong for Listening Part 4, where the clip is a news item and
// the source document says "Listen to the following news item." The
// defaults are the conversation wording, so Parts 1 to 3 pass nothing and
// read as before.
//
// No timer. The ticket hides the timer on the audio screens, because in
// this prototype nothing is counting down and the clip can be replayed.
//
// The clip can be asked to start on its own (EXAM-15F). The full Listening
// route passes autoPlayMedia, because the official test plays a clip when
// its screen opens rather than waiting to be asked, and the internal part
// routes pass nothing and behave as they always did. It is an attempt: a
// browser that refuses autoplay leaves the controls where they are and the
// player prints a short line saying to press play.
//
// The prototype does not gate Next on the clip finishing. When that
// arrives, pass onAudioEnded and hold nextDisabled until it fires. The
// prop is here already so that change does not need a new component.

export type ListeningAudioScreenProps = {
  title: string;
  audioSrc: string;
  // Learner facing clip name, for example "Conversation audio".
  audioTitle?: string;
  durationLabel?: string;
  // Section position, for example "Section 2 of 3". Doubles as the bold
  // lead line on the instruction row.
  sectionLabel?: string;
  // What the learner is being asked to do, for example "Listen to the
  // following news item."
  instructionText?: string;
  // Quiet line under the player. Empty by default since the reference
  // pass: the clip starts on its own on the full Listening route, so a
  // line telling a learner to press play was describing a screen they
  // were not on, and the reference layout ends this screen at the
  // practice playbar note.
  hintText?: string;
  // Ask the browser to start the clip when the screen opens.
  autoPlayMedia?: boolean;
  metaText?: string;
  onAudioEnded?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  nextDisabled?: boolean;
};

export function ListeningAudioScreen({
  title,
  audioSrc,
  audioTitle = listeningCopy.conversationPlayerTitle,
  durationLabel,
  sectionLabel,
  instructionText = listeningCopy.conversationInstruction,
  hintText,
  autoPlayMedia = false,
  metaText,
  onAudioEnded,
  onNext,
  onBack,
  showBack = true,
  nextDisabled = false,
}: ListeningAudioScreenProps) {
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
        <ExamInstructionRow heading={sectionLabel} text={instructionText} />

        <div className={examListening.mediaStack}>
          <ListeningAudioPlayer
            src={audioSrc}
            title={audioTitle}
            durationLabel={durationLabel}
            autoPlay={autoPlayMedia}
            onEnded={onAudioEnded}
          />

          {hintText ? (
            <p className={examScreenBody.hint}>{hintText}</p>
          ) : null}
        </div>
      </div>
    </ExamShell>
  );
}
