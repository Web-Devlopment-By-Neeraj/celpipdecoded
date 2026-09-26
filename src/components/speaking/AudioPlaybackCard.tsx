import { recordingCopy } from "@/features/speaking/practice-flow";
import { formatSeconds } from "@/features/speaking/task-utils";

// Playback for the finished recording so the student can review it
// before submitting. The audio source is a local object URL, so nothing
// leaves the browser until the student submits.
export function AudioPlaybackCard({
  audioUrl,
  durationSeconds,
}: {
  audioUrl: string;
  durationSeconds: number;
}) {
  return (
    <section
      aria-label={recordingCopy.playbackHeading}
      className="rounded-3xl bg-white p-5 ring-1 ring-ink/5 sm:p-6"
    >
      <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
        {recordingCopy.playbackHeading}
      </h2>
      <p className="mt-1 text-sm leading-6 text-ink/60">
        {recordingCopy.playbackNote}
      </p>
      <audio
        controls
        preload="metadata"
        src={audioUrl}
        className="mt-4 w-full max-w-full"
      >
        Your browser cannot play this recording.
      </audio>
      <p className="mt-3 text-xs leading-5 text-ink/50">
        {recordingCopy.recordedLengthLabel}: {formatSeconds(durationSeconds)}.{" "}
        {recordingCopy.privacyNote}
      </p>
    </section>
  );
}
