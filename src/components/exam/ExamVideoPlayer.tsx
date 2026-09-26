"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/features/design/design-tokens";
import { examVideo } from "@/features/exam-engine/exam-theme";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { resolveExamMediaSrc } from "@/features/exam-engine/instructional-video-assets";

// Native video player for the instructional video screens (EXAM-02).
//
// Native on purpose. The browser control set is keyboard reachable and
// screen reader aware, and it costs no dependency. No player library was
// installed for the exam engine, and none should be.
//
// Behaviour:
//
// - controls always on, including on an instructional video, which is the
//   one clip a learner has a real reason to pause and replay
// - autoplay off by default. The full Listening route asks for it and the
//   internal preview routes do not, so nothing on a development route
//   starts playing at a person unasked
// - preload metadata by default, so the control bar shows a real duration
//   without pulling the whole clip down
// - responsive: a fixed aspect stage with the element filling it, so the
//   box keeps its shape at any width and never forces a sideways scroll
// - fallback text in two layers: the message below replaces the stage
//   when the clip fails to load, and the text inside the video element
//   covers a browser that cannot play video at all
//
// Autoplay is an attempt and never a promise (EXAM-15F). Browser autoplay
// policies refuse a clip with sound unless the page has earned enough of a
// user gesture, and what counts differs between browsers and can be turned
// off by the person using one. So the effect calls play(), and if the
// promise it returns rejects, a short line appears under the stage telling
// the learner to press play. Nothing is muted to get around the policy: a
// muted Listening video is no use to anybody.
//
// The play attempt is in an effect because it belongs to the clip
// appearing, not to any handler, and an exam screen is only ever reached
// by pressing Next, which is the gesture the policy is looking for. The
// blocked flag is set from the rejection rather than in the effect body,
// so no state is written during the effect itself.
//
// This is the only exam component that holds state, which is why it is
// the only one marked "use client". The error flag is set from the media
// error handler, never from an effect.
//
// onEnded is here for the flow tickets, which gate the shell Next control
// until a blocking clip finishes. Passing it from a server component is
// not possible, so a screen that needs it must be a client component.

export type ExamVideoPlayerProps = {
  // Raw public path or absolute URL. Encoded for the browser here, so a
  // file name containing spaces still loads.
  src: string;
  // Learner facing clip name. Used for the accessible label and, unless
  // captionText overrides it, the caption strip.
  title: string;
  poster?: string;
  // Running time as text, shown on the right of the caption strip.
  durationLabel?: string;
  // Overrides the caption strip text.
  captionText?: string;
  showCaption?: boolean;
  // metadata is the default. Drop to none on a page holding several
  // players, so one screen does not open several media connections.
  preload?: "none" | "metadata";
  // Ask the browser to start the clip when the player appears. It can
  // refuse, in which case the notice under the stage says so.
  autoPlay?: boolean;
  onEnded?: () => void;
  // Overrides the message shown when the clip cannot load.
  fallbackText?: string;
  // Accessible name for the element, before the clip title is appended.
  // Defaults to the instructional video wording, which is what EXAM-02
  // built this player for. EXAM-11 made it a prop so the Listening Part 5
  // discussion video is not announced as an instructional video, which it
  // is not: it is practice test material.
  playerLabel?: string;
  // Overrides the text a browser that cannot play video at all shows, for
  // the same reason.
  unsupportedText?: string;
  className?: string;
};

export function ExamVideoPlayer({
  src,
  title,
  poster,
  durationLabel,
  captionText,
  showCaption = true,
  preload = "metadata",
  autoPlay = false,
  onEnded,
  fallbackText,
  playerLabel = examCopy.videoPlayerLabel,
  unsupportedText = examCopy.videoUnsupportedText,
  className,
}: ExamVideoPlayerProps) {
  const [hasError, setHasError] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!autoPlay) {
      return;
    }

    const element = videoRef.current;

    if (!element) {
      return;
    }

    // play() resolves when the browser agreed to start and rejects when it
    // refused. Older browsers return undefined instead of a promise, which
    // is the case the optional call covers.
    void element.play()?.catch(() => {
      setAutoplayBlocked(true);
    });
  }, [autoPlay, src]);

  const caption = captionText ?? title;

  return (
    <div className={cx(examVideo.wrap, className)}>
      {hasError ? (
        <div className={examVideo.fallback} role="status">
          <p className={examVideo.fallbackTitle}>
            {examCopy.videoFallbackHeading}
          </p>
          <p className={examVideo.fallbackText}>
            {fallbackText ?? examCopy.videoFallbackText}
          </p>
        </div>
      ) : (
        <div className={examVideo.stage}>
          {/* src sits on the element rather than on a source child, so a
              failed load fires onError here and the fallback can show.
              A source child only fires on itself. */}
          <video
            ref={videoRef}
            className={examVideo.element}
            src={resolveExamMediaSrc(src)}
            poster={poster ? resolveExamMediaSrc(poster) : undefined}
            controls
            preload={preload}
            playsInline
            aria-label={`${playerLabel}: ${title}`}
            onError={() => setHasError(true)}
            onEnded={onEnded}
          >
            {unsupportedText}
          </video>
        </div>
      )}

      {showCaption ? (
        <div className={examVideo.caption}>
          <p className={examVideo.captionTitle}>{caption}</p>
          {durationLabel ? (
            <p className={examVideo.captionMeta}>{durationLabel}</p>
          ) : null}
        </div>
      ) : null}

      {autoplayBlocked && !hasError ? (
        <p className={examVideo.autoplayNotice} role="status">
          {examCopy.videoAutoplayBlockedText}
        </p>
      ) : null}
    </div>
  );
}
