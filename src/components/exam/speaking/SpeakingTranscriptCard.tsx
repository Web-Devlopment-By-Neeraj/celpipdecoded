import { examSpeakingReview } from "@/features/exam-engine/exam-theme";
import {
  formatSpeakingClock,
  speakingMockCopy,
} from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";

// The transcript of one Speaking answer (EXAM-28).
//
// The block on the result screen that has no Writing counterpart, and
// the reason it exists is simple: a Writing response is already on the
// screen the learner typed it into, and a spoken answer is not visible
// anywhere until something writes it down. Without this card a learner
// would read four criterion levels and two rewrites of an answer they
// cannot see, and would have no way to check any of it.
//
// It sits directly under the level and the length check on the task
// card, above the criterion table, because everything below it argues
// from it. A learner who disagrees with a Listenability level should be
// able to look at the words the level was drawn from without scrolling
// past the argument first.
//
// The transcript is printed as it arrived. Fillers, repetitions, false
// starts and self-corrections are all left in, and that is the point
// rather than an oversight: they are the evidence Listenability is
// judged on, and a tidied transcript would be a transcript of a better
// answer than the one that was given. The note under it says so, so a
// learner reading "um, I think, I mean I think" back does not take it
// for a transcription fault.
//
// The same note says the other half of the truth: an automatic
// transcription gets individual words wrong, so this is a close record
// and not an exact one. Both halves are needed. Without the first a
// learner blames the transcriber for their own hesitation; without the
// second they blame themselves for the transcriber's mistakes.
//
// whitespace-pre-line, so any line breaks in the transcription survive.
// Plain text, never HTML and never markdown, so nothing that comes back
// in a transcript can be interpreted as markup.
//
// The duration is shown in the header rather than only on the card above
// it, because a transcript is read against how long it took to say. Four
// sentences in 25 seconds and four sentences in 85 seconds are different
// answers.
//
// Presentational only. It holds no state.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingTranscriptCardProps = {
  // What the transcription model wrote down. An empty string draws the
  // empty sentence instead, which is what a task with no recording
  // carries.
  transcript: string;
  // What this transcript can and cannot be relied on for. Fixed wording
  // set by the server; falls back to the copy sentence.
  note?: string;
  // How long the recording ran, in seconds. Omit to show no duration.
  durationSeconds?: number;
  copy?: SpeakingMockCopy;
};

export function SpeakingTranscriptCard({
  transcript,
  note,
  durationSeconds,
  copy = speakingMockCopy,
}: SpeakingTranscriptCardProps) {
  const hasTranscript = transcript.trim().length > 0;

  return (
    <section className={examSpeakingReview.transcript}>
      <div className={examSpeakingReview.transcriptHeader}>
        <h4 className={examSpeakingReview.transcriptTitle}>
          {copy.reviewTranscriptHeading}
        </h4>

        {durationSeconds !== undefined && durationSeconds > 0 ? (
          <p className={examSpeakingReview.transcriptDuration}>
            {formatSpeakingClock(durationSeconds)}
          </p>
        ) : null}
      </div>

      {hasTranscript ? (
        <p className={examSpeakingReview.transcriptBody}>{transcript}</p>
      ) : (
        <p className={examSpeakingReview.transcriptEmpty}>
          {copy.reviewTranscriptEmptyText}
        </p>
      )}

      {hasTranscript ? (
        <p className={examSpeakingReview.transcriptNote}>
          {note ?? copy.reviewTranscriptConfidenceNote}
        </p>
      ) : null}
    </section>
  );
}
