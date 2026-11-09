"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { PlanUpgradeButton } from "@/components/pricing/PlanUpgradeButton";
import { lessonCompleted } from "@/features/platform/video";
import {
  PLAYBACK_RATES,
  formatClock,
  formatDuration,
  formatRate,
  remainingAtRate,
} from "@/features/courses/format";
import { cx, focus } from "@/features/design/design-tokens";
import { CourseWatermark } from "./CourseWatermark";

const RATE_KEY = "celpip-course-rate";
const VOLUME_KEY = "celpip-course-volume";

export type CourseVideoPlayerProps = {
  title: string;
  src: string | null;
  unavailable: string | null;
  maxSeconds: number | null;
  initialPosition: number;
  initialDuration: number | null;
  initialCompleted: boolean;
  completeRatio: number;
  courseSlug: string;
  lessonId: string;
  userId: string;
  email: string | null;
  brand: string;
  onCompletedChange: (completed: boolean) => void;
};

function progressKey(userId: string, courseSlug: string, lessonId: string): string {
  return `celpip-course:${userId}:${courseSlug}:${lessonId}`;
}

function readLocalProgress(key: string): { positionSeconds: number; completed: boolean } | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { positionSeconds?: number; completed?: boolean };
    if (typeof parsed.positionSeconds !== "number") return null;
    return {
      positionSeconds: parsed.positionSeconds,
      completed: parsed.completed === true,
    };
  } catch {
    return null;
  }
}

export function CourseVideoPlayer({
  title,
  src,
  unavailable,
  maxSeconds,
  initialPosition,
  initialDuration,
  initialCompleted,
  completeRatio,
  courseSlug,
  lessonId,
  userId,
  email,
  brand,
  onCompletedChange,
}: CourseVideoPlayerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(initialPosition);
  const durationRef = useRef(initialDuration ?? 0);
  const completedRef = useRef(initialCompleted);
  const appliedStart = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(initialPosition);
  const [duration, setDuration] = useState(initialDuration ?? 0);
  const [buffered, setBuffered] = useState(0);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [skipLabel, setSkipLabel] = useState<string | null>(null);

  const cap = maxSeconds != null && maxSeconds > 0 ? maxSeconds : null;

  useEffect(() => {
    completedRef.current = initialCompleted;
  }, [initialCompleted]);

  useEffect(() => {
    try {
      const storedRate = Number(window.localStorage.getItem(RATE_KEY));
      if (PLAYBACK_RATES.includes(storedRate as (typeof PLAYBACK_RATES)[number])) {
        // localStorage is read after mount so the server HTML stays stable.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRate(storedRate);
      }
      const storedVolume = Number(window.localStorage.getItem(VOLUME_KEY));
      if (Number.isFinite(storedVolume) && storedVolume >= 0 && storedVolume <= 1) {
        setVolume(storedVolume);
        setMuted(storedVolume === 0);
      }
    } catch {
      // Preference storage is optional.
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    video.volume = volume;
    video.muted = muted;
  }, [rate, volume, muted]);

  useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(document.fullscreenElement === frameRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function withinCap(seconds: number): number {
    if (cap == null) return Math.max(0, seconds);
    return Math.min(Math.max(0, seconds), cap);
  }

  function remember(positionSeconds: number, completed: boolean) {
    const key = progressKey(userId, courseSlug, lessonId);
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify({ positionSeconds, completed }),
      );
    } catch {
      // Ignore a full or blocked storage quota.
    }
  }

  function publish(positionSeconds: number, completed: boolean, keepalive = false) {
    remember(positionSeconds, completed);
    void fetch("/api/courses/progress", {
      method: "POST",
      credentials: "same-origin",
      keepalive,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseSlug,
        lessonId,
        positionSeconds,
        completed,
      }),
    }).catch(() => undefined);
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!src) return;
      publish(positionRef.current, completedRef.current);
    }, 8000);
    function onHide() {
      if (document.visibilityState === "hidden") {
        publish(positionRef.current, completedRef.current, true);
      }
    }
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onHide);
      publish(positionRef.current, completedRef.current, true);
    };
    // The save loop is per lesson. Position is read from a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug, lessonId, src, userId]);

  function markCompleted(completed: boolean) {
    if (completedRef.current === completed) return;
    completedRef.current = completed;
    onCompletedChange(completed);
    publish(positionRef.current, completed);
  }

  function applyTime(seconds: number, video: HTMLVideoElement) {
    const next = withinCap(seconds);
    if (cap != null && seconds >= cap - 0.05) {
      video.pause();
      setBlocked(true);
      setPlaying(false);
      if (Math.abs(video.currentTime - next) > 0.2) video.currentTime = next;
    }
    positionRef.current = next;
    setCurrent(next);
    const length = durationRef.current;
    if (cap == null && length > 0 && lessonCompleted(next, length, completeRatio)) {
      markCompleted(true);
    }
  }

  function seekTo(seconds: number) {
    const video = videoRef.current;
    if (!video) return;
    const next = withinCap(seconds);
    video.currentTime = next;
    positionRef.current = next;
    setCurrent(next);
    if (cap != null && next >= cap - 0.25) {
      video.pause();
      setPlaying(false);
      setBlocked(true);
    } else {
      setBlocked(false);
    }
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video || !src) return;
    if (blocked) return;
    if (video.paused) {
      void video.play().catch(() => setFailed(true));
    } else {
      video.pause();
    }
  }

  function skip(delta: number) {
    const video = videoRef.current;
    if (!video) return;
    seekTo(video.currentTime + delta);
    setSkipLabel(delta < 0 ? "Back 10s" : "Forward 10s");
    window.setTimeout(() => setSkipLabel(null), 700);
  }

  async function toggleFullscreen() {
    const frame = frameRef.current;
    if (!frame) return;
    try {
      if (document.fullscreenElement === frame) {
        await document.exitFullscreen();
      } else {
        await frame.requestFullscreen();
      }
    } catch {
      const video = videoRef.current as HTMLVideoElement & {
        webkitEnterFullscreen?: () => void;
      };
      video?.webkitEnterFullscreen?.();
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === " " || event.key === "k") {
        event.preventDefault();
        togglePlay();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        skip(-10);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        skip(10);
      } else if (event.key === "f") {
        event.preventDefault();
        void toggleFullscreen();
      } else if (event.key === "m") {
        event.preventDefault();
        setMuted((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // Handlers close over the latest video element through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked, src]);

  function onSeekPointer(event: ReactPointerEvent<HTMLDivElement>) {
    const track = seekRef.current;
    const video = videoRef.current;
    const length = durationRef.current;
    if (!track || !video || length <= 0) return;
    const update = (clientX: number) => {
      const rect = track.getBoundingClientRect();
      const ratio = rect.width <= 0 ? 0 : (clientX - rect.left) / rect.width;
      seekTo(Math.min(1, Math.max(0, ratio)) * length);
    };
    update(event.clientX);
    track.setPointerCapture(event.pointerId);
    const move = (next: PointerEvent) => update(next.clientX);
    const up = (next: PointerEvent) => {
      track.releasePointerCapture(next.pointerId);
      track.removeEventListener("pointermove", move);
      track.removeEventListener("pointerup", up);
    };
    track.addEventListener("pointermove", move);
    track.addEventListener("pointerup", up);
  }

  const length = duration > 0 ? duration : initialDuration ?? 0;
  const shownCurrent = Math.min(current, length || current);
  const progress = length > 0 ? Math.min(1, shownCurrent / length) : 0;
  const remain = remainingAtRate(length, shownCurrent, rate);
  return (
    <div
      ref={frameRef}
      className="relative z-40 overflow-hidden rounded-2xl bg-black shadow-md ring-1 ring-black/20"
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="relative aspect-video bg-black">
        {src ? (
          <video
            ref={videoRef}
            className="h-full w-full bg-black object-contain"
            src={src}
            playsInline
            preload="metadata"
            disablePictureInPicture
            controlsList="nodownload noplaybackrate noremoteplayback"
            aria-label={title}
            onLoadedMetadata={(event) => {
              const video = event.currentTarget;
              const nextDuration = Number.isFinite(video.duration) ? video.duration : 0;
              durationRef.current = nextDuration;
              setDuration(nextDuration);
              setReady(true);
              if (!appliedStart.current) {
                appliedStart.current = true;
                const local = readLocalProgress(progressKey(userId, courseSlug, lessonId));
                const resume = Math.max(initialPosition, local?.positionSeconds ?? 0);
                if (local?.completed) markCompleted(true);
                if (resume > 1) seekTo(resume);
              }
            }}
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              applyTime(video.currentTime, video);
              const end = video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0;
              const total = durationRef.current;
              setBuffered(total > 0 ? Math.min(1, end / total) : 0);
            }}
            onPlay={() => {
              setPlaying(true);
              setFailed(false);
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setPlaying(false);
              if (cap == null) markCompleted(true);
            }}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/80">
            {unavailable ?? "This lesson is not available yet."}
          </div>
        )}

        <CourseWatermark
          email={email}
          brand={brand}
          tone="video"
          className="absolute inset-0 z-10"
        />

        {skipLabel ? (
          <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
            <span className="rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white">
              {skipLabel}
            </span>
          </div>
        ) : null}

        {blocked ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 p-6 text-center">
            <div className="max-w-md">
              <p className="text-lg font-semibold text-white">Preview finished</p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                The rest of this lesson opens with the Decoded Course. Your place in the preview is saved.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <PlanUpgradeButton
                  productCode="course"
                  label="Unlock the course"
                  withTopMargin={false}
                />
                <button
                  type="button"
                  onClick={() => {
                    setBlocked(false);
                    seekTo(0);
                    void videoRef.current?.play();
                  }}
                  className={cx(
                    "inline-flex h-11 items-center rounded-full bg-white/15 px-5 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/25",
                    focus.ring,
                  )}
                >
                  Replay preview
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {failed ? (
          <div className="absolute inset-x-0 top-4 z-30 mx-auto w-fit rounded-full bg-black/75 px-4 py-2 text-sm text-white">
            This lesson could not be played. Refresh and try again.
          </div>
        ) : null}

        {src && !playing && !blocked && ready ? (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Play"
            className={cx(
              "absolute left-1/2 top-1/2 z-20 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-academy-navy shadow-lg transition hover:scale-105",
              focus.ring,
            )}
          >
            <PlayIcon />
          </button>
        ) : null}

        {src ? (
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pb-3 pt-12 sm:px-4">
            <div
              ref={seekRef}
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(length)}
              aria-valuenow={Math.round(shownCurrent)}
              aria-valuetext={`${formatClock(shownCurrent)} of ${formatClock(length)}`}
              className="group/seek relative h-4 cursor-pointer"
              onPointerDown={onSeekPointer}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  skip(-10);
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  skip(10);
                }
              }}
            >
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25 group-hover/seek:h-1.5">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white/35"
                  style={{ width: `${buffered * 100}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-brand"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div
                className="absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full bg-white shadow"
                style={{ left: `calc(${progress * 100}% - 7px)` }}
              />
            </div>

            <div className="mt-1.5 flex items-center gap-1 text-white sm:gap-1.5">
              <ControlButton label={playing ? "Pause" : "Play"} onClick={togglePlay}>
                {playing ? <PauseIcon /> : <PlayIcon small />}
              </ControlButton>
              <ControlButton label="Back 10 seconds" onClick={() => skip(-10)}>
                <SkipIcon direction="back" />
              </ControlButton>
              <ControlButton label="Forward 10 seconds" onClick={() => skip(10)}>
                <SkipIcon direction="forward" />
              </ControlButton>

              <div className="group/volume flex items-center">
                <ControlButton
                  label={muted || volume === 0 ? "Unmute" : "Mute"}
                  onClick={() => setMuted((value) => !value)}
                >
                  <VolumeIcon muted={muted || volume === 0} />
                </ControlButton>
                <input
                  aria-label="Volume"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setVolume(next);
                    setMuted(next === 0);
                    try {
                      window.localStorage.setItem(VOLUME_KEY, String(next));
                    } catch {
                      // Ignore.
                    }
                  }}
                  className="hidden h-1 w-20 cursor-pointer accent-brand sm:block"
                />
              </div>

              <p className="ml-1 min-w-0 truncate text-xs font-medium tabular-nums text-white/90">
                {formatClock(shownCurrent)}
                <span className="text-white/55"> / {formatClock(length)}</span>
              </p>

              <div className="ml-auto flex items-center gap-1">
                {length > 0 ? (
                  <p className="mr-1 hidden items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white/90 sm:flex">
                    <span>{formatDuration(length - shownCurrent) ?? formatClock(length - shownCurrent)}</span>
                    {rate !== 1 ? (
                      <span className="text-brand-mint">
                        {formatDuration(remain) ?? formatClock(remain)} at {formatRate(rate)}
                      </span>
                    ) : null}
                  </p>
                ) : null}

                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={speedOpen}
                    aria-haspopup="menu"
                    onClick={() => setSpeedOpen((open) => !open)}
                    className={cx(
                      "inline-flex h-9 items-center rounded-full bg-white/10 px-3 text-xs font-bold tabular-nums text-white hover:bg-white/20",
                      focus.ring,
                    )}
                  >
                    {formatRate(rate)}
                  </button>
                  {speedOpen ? (
                    <div
                      role="menu"
                      className="absolute bottom-11 right-0 w-36 overflow-hidden rounded-xl bg-[#14181f] py-1 text-sm shadow-lg ring-1 ring-white/10"
                    >
                      {PLAYBACK_RATES.map((value) => (
                        <button
                          key={value}
                          type="button"
                          role="menuitemradio"
                          aria-checked={value === rate}
                          onClick={() => {
                            setRate(value);
                            setSpeedOpen(false);
                            try {
                              window.localStorage.setItem(RATE_KEY, String(value));
                            } catch {
                              // Ignore.
                            }
                          }}
                          className={cx(
                            "flex w-full items-center justify-between px-3 py-2 text-left text-white hover:bg-white/10",
                            value === rate ? "font-semibold" : "font-medium text-white/80",
                          )}
                        >
                          {formatRate(value)}
                          {value === rate ? <span aria-hidden>✓</span> : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <ControlButton
                  label={fullscreen ? "Exit full screen" : "Full screen"}
                  onClick={() => void toggleFullscreen()}
                >
                  <FullscreenIcon exit={fullscreen} />
                </ControlButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {src ? (
        <p className="border-t border-white/10 bg-black px-4 py-2 text-[11px] text-white/50">
          {brand}. For your account only. Do not copy or share this lesson.
          {fullscreen ? "" : " Space plays, arrows skip 10 seconds."}
        </p>
      ) : null}
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        "grid size-9 place-items-center rounded-full text-white hover:bg-white/15",
        focus.ring,
      )}
    >
      {children}
    </button>
  );
}

function PlayIcon({ small = false }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={small ? "size-4" : "ml-0.5 size-7"} aria-hidden="true">
      <path fill="currentColor" d="M8 5.5v13l11-6.5-11-6.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="currentColor" d="M6.5 5h3.5v14H6.5V5zm7.5 0H18v14h-4V5z" />
    </svg>
  );
}

function SkipIcon({ direction }: { direction: "back" | "forward" }) {
  const flip = direction === "back";
  return (
    <svg viewBox="0 0 24 24" className={cx("size-5", flip && "-scale-x-100")} aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M14.5 7.5 19 12l-4.5 4.5"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M19 12H8.5a5 5 0 1 0 0 5"
      />
      <text x="7.2" y="13.2" fill="currentColor" fontSize="6.5" fontWeight="700">
        10
      </text>
    </svg>
  );
}

function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="currentColor" d="M4 9h3.2L11 5.8v12.4L7.2 15H4V9z" />
      {muted ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          d="m15 10 5 5m0-5-5 5"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          d="M15.5 9.5a3.5 3.5 0 0 1 0 5M17.8 7.2a6.5 6.5 0 0 1 0 9.6"
        />
      )}
    </svg>
  );
}

function FullscreenIcon({ exit }: { exit: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      {exit ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          d="M9 4.5v4.5H4.5M15 4.5v4.5h4.5M9 19.5V15H4.5M15 19.5V15h4.5"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          d="M4.5 9V4.5H9M15 4.5h4.5V9M4.5 15v4.5H9M19.5 15v4.5H15"
        />
      )}
    </svg>
  );
}
