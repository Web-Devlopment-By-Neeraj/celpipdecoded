import { cx } from "@/features/design/design-tokens";
import { examSpeakingReview } from "@/features/exam-engine/exam-theme";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";

// Practice-only disclaimer for the Speaking review (EXAM-28).
//
// Two sentences that have to be there, not one, and the second is what
// makes this component different from its Writing counterpart.
//
// The first is the practice estimate sentence: everything above it on
// the result screen is a level, a criterion table and two rewrites, all
// of which read like a score report, and this says plainly that it is
// not one.
//
// The second is the audio assessment note. The recordings were
// transcribed and the scoring model was given the transcripts, the task
// prompts, the recording windows and the measured durations. It was not
// given the audio. So a learner reading a Listenability level has to be
// told what that level was drawn from, and that pronunciation, rhythm
// and intonation were not judged directly. Leaving it out would let a
// learner take a transcript-based reading for a delivery assessment,
// which is exactly the overclaim the ticket forbids.
//
// The note is optional on this component rather than required, because
// the processing screen shows the disclaimer before there is any result
// and has nothing to say about audio yet. On the result screen both are
// shown.
//
// It is a component rather than a line of copy inlined on the result
// screen for two reasons. It appears in three places, on the result
// screen, on the processing screen and beside the submit button, and a
// sentence that has to say the same thing in three places should have
// one definition. And a disclaimer that is a component is a disclaimer
// that can be found: a reviewer checking that the wording is right has
// one file to open.
//
// Both texts default to the fixed copy sentences rather than to whatever
// the model returned. The server already replaces the model's disclaimer
// and its audio note with these, so the two agree, but the defaults here
// mean a screen that forgets to pass one still shows the right words
// rather than none.
//
// Presentational only. It holds no state.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingPracticeDisclaimerProps = {
  // The disclaimer sentence. Defaults to the fixed practice estimate
  // wording.
  text?: string;
  // The audio assessment note. Pass it to show the second block, which
  // the result screen does. Omit it where there is no result to describe
  // yet, which is what the processing screen does. Pass null to suppress
  // it explicitly.
  audioNote?: string | null;
  copy?: SpeakingMockCopy;
  className?: string;
};

export function SpeakingPracticeDisclaimer({
  text,
  audioNote,
  copy = speakingMockCopy,
  className,
}: SpeakingPracticeDisclaimerProps) {
  return (
    <div className={cx("flex min-w-0 flex-col gap-2", className)}>
      <div className={examSpeakingReview.disclaimer}>
        <p className={examSpeakingReview.disclaimerLabel}>
          {copy.reviewPracticeDisclaimerLabel}
        </p>
        <p className={examSpeakingReview.disclaimerText}>
          {text ?? copy.reviewPracticeDisclaimer}
        </p>
      </div>

      {audioNote === undefined || audioNote === null ? null : (
        <div className={examSpeakingReview.audioNote}>
          <p className={examSpeakingReview.audioNoteLabel}>
            {copy.reviewAudioAssessmentNoteLabel}
          </p>
          <p className={examSpeakingReview.audioNoteText}>{audioNote}</p>
        </div>
      )}
    </div>
  );
}
