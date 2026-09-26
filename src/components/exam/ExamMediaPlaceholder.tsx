import { cx } from "@/features/design/design-tokens";
import { examMedia } from "@/features/exam-engine/exam-theme";
import { examCopy, examMediaCopy } from "@/features/exam-engine/exam-copy";
import type { ExamMediaKind } from "@/features/exam-engine/exam-shell-types";

// Reserved area for audio, video, or an image.
//
// A flat grey box with a solid rule and a small inert transport strip,
// which is how an audio or video area reads in test software. The earlier
// dashed outline read as an empty upload target, so it was dropped.
//
// This is a placeholder only. No player, no clip, no seek control, and
// no timing. EXAM-02 drops a video player into this area and EXAM-03
// drops the listening audio panel into it, which is why the area exists
// now: so the surrounding layouts can be built and reviewed before any
// media work starts.
//
// The glyphs are small inline shapes rather than an icon package, so the
// exam engine adds no dependency.

export type ExamMediaPlaceholderProps = {
  kind: ExamMediaKind;
  label?: string;
  helperText?: string;
  // Shows the static, non seekable transport strip, matching the audio
  // and video boxes in the reference layouts.
  showTrack?: boolean;
  // Placeholder duration on the transport strip. Nothing counts.
  timeText?: string;
  className?: string;
};

function MediaGlyph({ kind }: { kind: ExamMediaKind }) {
  if (kind === "image") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={examMedia.glyph}
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="M4 17l4.5-5 3.5 3.5 3-2.5L20 17" />
      </svg>
    );
  }

  if (kind === "video") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={examMedia.glyph}
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={examMedia.glyph}
    >
      <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
      <path d="M16 9.5a4 4 0 010 5" />
      <path d="M18.5 7.5a7 7 0 010 9" />
    </svg>
  );
}

// Inert transport strip. It looks like the control row under a clip and
// does nothing: the play glyph is not a button, and the track is not
// seekable. A real player replaces the whole box in a later ticket.
function MediaTransport({ timeText }: { timeText: string }) {
  return (
    <div className={examMedia.transport} aria-hidden="true">
      <span className={examMedia.transportButton}>
        <svg viewBox="0 0 12 12" width="7" height="7" fill="currentColor">
          <path d="M4 2.5l5 3.5-5 3.5z" />
        </svg>
      </span>
      <div className={examMedia.track}>
        <div className={examMedia.trackFill} />
      </div>
      <span className={examMedia.time}>{timeText}</span>
    </div>
  );
}

export function ExamMediaPlaceholder({
  kind,
  label,
  helperText,
  showTrack = kind !== "image",
  timeText = examCopy.mediaPlaceholderTime,
  className,
}: ExamMediaPlaceholderProps) {
  const defaults = examMediaCopy[kind];

  return (
    <div
      className={cx(
        examMedia.base,
        kind === "video" ? examMedia.video : "",
        className,
      )}
    >
      <MediaGlyph kind={kind} />

      <p className={examMedia.label}>{label ?? defaults.label}</p>
      <p className={examMedia.helper}>{helperText ?? defaults.helper}</p>

      {showTrack ? <MediaTransport timeText={timeText} /> : null}
    </div>
  );
}
