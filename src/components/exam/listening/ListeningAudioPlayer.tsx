"use client";

import { useEffect, useRef, useState } from "react";
import {
  MockTestAudioVisual,
  type MockTestAudioStatus,
} from "../player/MockTestAudioVisual";
import { playerAudioVisual } from "@/features/exam-engine/mock-test-player-theme";
import { listeningCopy } from "@/features/exam-engine/listening-copy";
import { resolveExamMediaSrc } from "@/features/exam-engine/instructional-video-assets";

// Native audio player for the Listening screens (EXAM-03, re-skinned by
// EXAM-UI-03).
//
// Native on purpose, for the same reasons as ExamVideoPlayer: the browser
// control set is keyboard reachable and screen reader aware, and it costs
// no dependency. No player library was installed for the exam engine, and
// none should be.
//
// Behaviour:
//
// - controls always on, so a learner can always start, pause and scrub
// - autoplay off by default. The full Listening route asks for it and the
//   internal part routes do not, so nothing on a development route starts
//   playing at a person unasked
// - preload metadata by default, so the control bar shows a real duration
//   without pulling the whole clip down
// - fallback text in two layers: the message below replaces the card body
//   when the clip fails to load, and the text inside the audio element
//   covers a browser that cannot play audio at all
//
// **What EXAM-UI-03 changed, and what it did not.** The clip now plays
// inside MockTestAudioVisual, which draws a speaker mark, a status word,
// a progress bar and the practice playbar note around the same native
// control that was always there. Nothing about playback moved: this
// component still calls play() in exactly one place, for the autoplay
// attempt EXAM-15F added, and it calls pause() and seek nowhere at all.
// The bar is driven from the element's own timeupdate event and drives
// nothing back, so it can lag the clip but it cannot disagree with it,
// and taking the visual away again would leave a working player.
//
// The three pieces of state added for it are written from media events
// rather than from an effect, which is the rule the error flag already
// followed and what the project's lint rule against setState in effects
// wants.
//
// Autoplay is an attempt and never a promise (EXAM-15F). Browser autoplay
// policies refuse a clip with sound unless the page has earned enough of a
// user gesture, and what counts differs between browsers and can be turned
// off by the person using one. So the effect calls play(), and if the
// promise it returns rejects, a short line appears under the controls
// telling the learner to press play. Nothing is muted to get around the
// policy: a muted Listening clip is worse than one that waits for a click.
//
// The play attempt is in an effect because it belongs to the clip
// appearing, not to any handler, and the screen is only ever reached by
// pressing Next, which is the gesture the policy is looking for. The
// blocked flag is set from the rejection rather than in the effect body,
// so no state is written during the effect itself.
//
// Deliberately not built yet: one time playback, and gating Next on the
// clip finishing. Both are official-style behaviours and both are listed
// as known gaps in docs/product/listening-part-1-prototype.md. onEnded is
// here so the ticket that adds the gate has somewhere to hook into
// without reworking the player.

export type ListeningAudioPlayerProps = {
  // Absolute URL, normally a Cloudinary link. Local paths work too and
  // are made URL safe by resolveExamMediaSrc.
  src: string;
  // Learner facing clip name, used for the accessible label and, unless
  // captionText overrides it, the line under the status word.
  title: string;
  // Running time as text. Shown beside the clip name when one is given.
  durationLabel?: string;
  captionText?: string;
  // Whether the clip name is printed in the card. Off by default since
  // the reference pass: the screen title bar already names the part and
  // the section, so a caption under the bar was the third place on one
  // screen saying which clip is playing.
  showCaption?: boolean;
  // Whether the practice playbar note is printed under the card. The
  // Parts 1 to 3 question screens turn it off: the note earns its place
  // on a clip screen and is noise repeated under 38 question clips.
  showPlaybarNote?: boolean;
  // metadata is the default. Drop to none on a screen holding several
  // players, so one screen does not open several media connections.
  preload?: "none" | "metadata";
  // Ask the browser to start the clip when the player appears. It can
  // refuse, in which case the notice under the controls says so.
  autoPlay?: boolean;
  onEnded?: () => void;
  fallbackText?: string;
  className?: string;
};

export function ListeningAudioPlayer({
  src,
  title,
  durationLabel,
  captionText,
  showCaption = false,
  showPlaybarNote = true,
  preload = "metadata",
  autoPlay = false,
  onEnded,
  fallbackText,
  className,
}: ListeningAudioPlayerProps) {
  const [hasError, setHasError] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [status, setStatus] = useState<MockTestAudioStatus>("idle");
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState<number | undefined>(
    undefined,
  );
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!autoPlay) {
      return;
    }

    const element = audioRef.current;

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

  // Only a duration the browser has actually worked out drives the bar. A
  // stream reports Infinity and a clip whose metadata has not landed
  // reports NaN, and neither is a length to divide by.
  const hasDuration =
    durationSeconds !== undefined &&
    Number.isFinite(durationSeconds) &&
    durationSeconds > 0;
  const progress = hasDuration ? currentSeconds / durationSeconds : 0;

  const captionLine = showCaption
    ? durationLabel
      ? `${caption} - ${durationLabel}`
      : caption
    : undefined;

  return (
    <MockTestAudioVisual
      className={className}
      status={status}
      progress={progress}
      title={captionLine}
      showNote={showPlaybarNote}
      hasError={hasError}
      fallbackHeading={listeningCopy.audioFallbackHeading}
      fallbackText={fallbackText ?? listeningCopy.audioFallbackText}
      noticeText={
        autoplayBlocked && !hasError
          ? listeningCopy.audioAutoplayBlockedText
          : undefined
      }
    >
      {hasError ? null : (
        // src sits on the element rather than on a source child, so a
        // failed load fires onError here and the fallback can show. A
        // source child only fires on itself.
        <audio
          ref={audioRef}
          className={playerAudioVisual.element}
          src={resolveExamMediaSrc(src)}
          controls
          preload={preload}
          aria-label={`${listeningCopy.audioPlayerLabel}: ${title}`}
          onError={() => setHasError(true)}
          onLoadedMetadata={(event) =>
            setDurationSeconds(event.currentTarget.duration)
          }
          onTimeUpdate={(event) =>
            setCurrentSeconds(event.currentTarget.currentTime)
          }
          onPlay={() => setStatus("playing")}
          onPause={(event) =>
            setStatus(event.currentTarget.ended ? "ended" : "paused")
          }
          onEnded={() => {
            setStatus("ended");
            onEnded?.();
          }}
        >
          {listeningCopy.audioUnsupportedText}
        </audio>
      )}
    </MockTestAudioVisual>
  );
}
