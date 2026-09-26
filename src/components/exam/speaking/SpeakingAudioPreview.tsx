import { examSpeaking } from "@/features/exam-engine/exam-theme";
import {
  formatSpeakingClock,
  formatSpeakingRecordedAt,
  speakingMockCopy,
} from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingResponse } from "@/features/exam-engine/speaking-mock-types";

// Local playback of the take a learner just made (EXAM-27).
//
// A native audio element pointed at a blob: URL, which is the whole
// mechanism. The URL was made by the section prototype with
// URL.createObjectURL when the recording arrived, it resolves inside this
// document and nowhere else, and it is revoked when the take is replaced
// or the run is thrown away.
//
// Nothing is uploaded to make this play. There is no fetch, no signed
// URL, no storage bucket and no server round trip: the audio is already
// in the tab, and the element plays it out of memory. That is the single
// most important property of this screen and it is why the preview is a
// plain element rather than a wrapper over the standalone Speaking
// Practice playback card, which plays audio that has been saved.
//
// The element is the browser's own control bar rather than a custom
// transport, for the reason the Listening audio player already settled: a
// hand built play button has to reimplement scrubbing, keyboard control
// and the current time readout, and the native one is better at all
// three and is already familiar.
//
// controlsList="nodownload" asks the browser to leave the download item
// out of its overflow menu. It is a request rather than a guarantee, and
// it is here for tidiness rather than for protection: a determined reader
// can always save audio their own browser is holding. Nothing about the
// prototype depends on it.
//
// Presentational only. It holds no state, creates no object URL and
// revokes none, which keeps every URL in the one place that can pair it
// with the blob it came from.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingAudioPreviewProps = {
  // The recording for this task, which may be the empty response.
  response: SpeakingResponse;
  // Used to name the player for assistive technology, for example
  // "Speaking Task 3".
  taskLabel: string;
  copy?: SpeakingMockCopy;
};

export function SpeakingAudioPreview({
  response,
  taskLabel,
  copy = speakingMockCopy,
}: SpeakingAudioPreviewProps) {
  if (!response.audioUrl) {
    return (
      <div className={examSpeaking.preview}>
        <p className={examSpeaking.previewLabel}>{copy.previewHeading}</p>
        <p className={examSpeaking.previewEmpty}>{copy.previewEmptyText}</p>
      </div>
    );
  }

  const recordedAt = formatSpeakingRecordedAt(response.recordedAt);

  return (
    <div className={examSpeaking.preview}>
      <p className={examSpeaking.previewLabel}>{copy.previewHeading}</p>

      {/* No caption track. This is the learner's own voice, recorded
          seconds ago in this tab, and there is no transcript to caption
          it with: transcription is not built in this ticket, which is the
          point of the ticket. EXAM-28 adds the transcript, and a track
          here is one of the things it could then do. */}
      <audio
        // Keyed on the URL, so recording again swaps the source rather
        // than leaving the element pointed at a URL that has been
        // revoked.
        key={response.audioUrl}
        src={response.audioUrl}
        controls
        preload="metadata"
        controlsList="nodownload"
        aria-label={`${copy.previewHeading}: ${taskLabel}`}
        className={examSpeaking.previewPlayer}
      >
        {copy.previewUnsupportedText}
      </audio>

      <div className={examSpeaking.previewMetaRow}>
        <span>
          <span className={examSpeaking.previewMetaLabel}>
            {copy.previewLengthLabel}
          </span>{" "}
          <span className={examSpeaking.previewMetaValue}>
            {formatSpeakingClock(response.durationSeconds)}
          </span>
        </span>

        {recordedAt ? (
          <span>
            <span className={examSpeaking.previewMetaLabel}>
              {copy.previewRecordedAtLabel}
            </span>{" "}
            <span className={examSpeaking.previewMetaValue}>{recordedAt}</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
