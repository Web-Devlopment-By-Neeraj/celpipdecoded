"use client";

import { useEffect, useRef } from "react";

let audioContext: AudioContext | null = null;

function sharedAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Context = window.AudioContext;
  if (!Context) return null;
  if (!audioContext) audioContext = new Context();
  return audioContext;
}

// Call from a click (Start, Talk, and so on) so a later beep is allowed.
export function armTimeUpSound() {
  const context = sharedAudioContext();
  if (context?.state === "suspended") void context.resume();
}

export function playTimeUpSound() {
  const context = sharedAudioContext();
  if (!context) return;
  if (context.state === "suspended") void context.resume();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.06;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.28);
}

export function TimeUpDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    playTimeUpSound();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/40 px-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="time-up-title"
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-ink shadow-xl"
      >
        <h2 id="time-up-title" className="font-serif text-2xl font-semibold">
          Time is up
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          The timer has stopped. You can keep going and submit when you are ready.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
