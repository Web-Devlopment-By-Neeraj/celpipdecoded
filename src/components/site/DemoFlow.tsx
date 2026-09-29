"use client";

import { useEffect, useRef, useState } from "react";
import { SignUpPrompt } from "./SignUpPrompt";
import type { DemoFeedback } from "@/features/public-site/demo";

type Phase =
  | "permission"
  | "denied"
  | "unsupported"
  | "preparing"
  | "recording"
  | "review"
  | "uploading"
  | "marking"
  | "feedback"
  | "error"
  | "limited";

export function DemoFlow({
  prepSeconds,
  recordSeconds,
  prompt,
}: {
  prepSeconds: number;
  recordSeconds: number;
  prompt: string;
}) {
  const [phase, setPhase] = useState<Phase>(
    typeof MediaRecorder === "undefined" ? "unsupported" : "permission",
  );
  const [secondsLeft, setSecondsLeft] = useState(prepSeconds);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [feedback, setFeedback] = useState<DemoFeedback | null>(null);
  const [message, setMessage] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (typeof MediaRecorder === "undefined") return;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        setPhase("preparing");
        setSecondsLeft(prepSeconds);
      })
      .catch(() => {
        if (!cancelled) setPhase("denied");
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [prepSeconds]);

  useEffect(() => {
    if (phase !== "preparing" && phase !== "recording") return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          if (phase === "preparing") {
            beginRecording();
          } else {
            stopRecording();
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
    // beginRecording is stable enough for this countdown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function beginRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      setBlob(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
      setPhase("review");
    };
    recorder.start();
    setPhase("recording");
    setSecondsLeft(recordSeconds);
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }

  async function submit(attempt = 0) {
    if (!blob) return;
    setPhase("uploading");
    const body = new FormData();
    body.set("audio", blob, "demo.webm");
    body.set("seconds", String(recordSeconds - secondsLeft));
    try {
      const response = await fetch("/api/demo/speaking", { method: "POST", body });
      if (response.status === 429) {
        setPhase("limited");
        return;
      }
      if (!response.ok) throw new Error("upload failed");
      setPhase("marking");
      const payload = (await response.json()) as DemoFeedback;
      setFeedback(payload);
      setPhase("feedback");
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "evaluation_submitted", props: { source: "hero_demo" } }),
      });
    } catch {
      if (attempt < 2) {
        setMessage("Connection dropped. Retrying the same recording.");
        window.setTimeout(() => submit(attempt + 1), 800);
        return;
      }
      setMessage("Upload failed. Your recording is still here.");
      setPhase("error");
    }
  }

  return (
    <div className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-ink/10">
      <p className="text-base leading-7">{prompt}</p>
      {phase === "denied" ? (
        <p className="mt-4 text-base">Allow the microphone in your browser settings, then press Start again.</p>
      ) : null}
      {phase === "unsupported" ? (
        <p className="mt-4 text-base">This browser cannot record. Use Chrome or Safari on your phone.</p>
      ) : null}
      {phase === "preparing" || phase === "recording" ? (
        <p className="mt-4 font-serif text-5xl tabular-nums" aria-live="polite">
          {secondsLeft}s
        </p>
      ) : null}
      {phase === "recording" ? (
        <button type="button" className="mt-4 min-h-11 rounded-full bg-ink px-4 text-sm font-semibold text-cream" onClick={stopRecording}>
          Stop and review
        </button>
      ) : null}
      {phase === "review" || phase === "error" ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {blob ? <audio controls src={URL.createObjectURL(blob)} className="w-full" /> : null}
          <button type="button" className="min-h-11 rounded-full px-4 text-sm font-semibold ring-1 ring-ink/15" onClick={beginRecording}>
            Record again
          </button>
          <button type="button" className="min-h-11 rounded-full bg-brand px-4 text-sm font-semibold text-white" onClick={() => submit(0)}>
            Submit
          </button>
          {message ? <p className="w-full text-sm">{message}</p> : null}
        </div>
      ) : null}
      {phase === "uploading" || phase === "marking" ? <p className="mt-4 text-base">Marking your practice answer.</p> : null}
      {phase === "limited" ? (
        <div className="mt-4">
          <p>The demo limit for today has been reached. Sign up to continue with your free evaluations.</p>
          <SignUpPrompt context="hero_demo" presentation="inline" items={["Speaking Task 1 recording"]} />
        </div>
      ) : null}
      {phase === "feedback" && feedback ? (
        <div className="mt-4 space-y-4">
          {feedback.unlocked.map((point) => (
            <article key={point.name} className="rounded-2xl bg-cream p-4">
              <h3 className="font-semibold">{point.name}</h3>
              <p className="mt-1 text-sm leading-6">{point.body}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide">Practice estimate</p>
            </article>
          ))}
          <ul className="space-y-2 text-sm">
            {feedback.locked.map((name) => (
              <li key={name}>🔒 {name}</li>
            ))}
          </ul>
          <SignUpPrompt context="hero_demo" presentation="inline" items={["Speaking Task 1 recording", "Locked feedback"]} />
        </div>
      ) : null}
    </div>
  );
}
