"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import type { AssistantChatMessage } from "@/features/platform/assistant-conversation";
import {
  getAudioFileExtension,
  pickRecordingMimeType,
} from "@/features/speaking/audio-utils";

const SUGGESTED_QUESTIONS = [
  "What should I practice first?",
  "How does a practice estimate work?",
  "How do I book a live class?",
  "How do I reset my password?",
];

const STORAGE_KEY = "celpip-assistant-chat";
const CHAT_EVENT = "celpip-assistant-chat-change";
const COUNT_PREFIX = "celpip-assistant-count-";
const EMPTY_CHAT: AssistantChatMessage[] = [];

function todayKey(): string {
  return `${COUNT_PREFIX}${new Date().toISOString().slice(0, 10)}`;
}

function parseChat(raw: string | null): AssistantChatMessage[] {
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return EMPTY_CHAT;
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const role = (item as { role?: unknown }).role;
      const content = (item as { content?: unknown }).content;
      if ((role !== "user" && role !== "assistant") || typeof content !== "string") return [];
      const text = content.trim();
      return text ? [{ role, content: text }] : [];
    });
  } catch {
    return EMPTY_CHAT;
  }
}

let cachedRaw: string | null = null;
let cachedMessages: AssistantChatMessage[] = EMPTY_CHAT;

function subscribeToChat(onStoreChange: () => void) {
  window.addEventListener(CHAT_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHAT_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readChat(): AssistantChatMessage[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedMessages;
  cachedRaw = raw;
  cachedMessages = parseChat(raw);
  return cachedMessages;
}

function saveChat(next: AssistantChatMessage[]) {
  const trimmed = next.slice(-40);
  const raw = JSON.stringify(trimmed);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedMessages = trimmed;
  window.dispatchEvent(new Event(CHAT_EVENT));
}

function messagesToday(): number {
  const value = Number(window.localStorage.getItem(todayKey()) ?? "0");
  return Number.isFinite(value) ? value : 0;
}

type SpeechResult = { isFinal: boolean; 0?: { transcript?: string } };

type BrowserRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<SpeechResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function recognitionConstructor(): (new () => BrowserRecognition) | null {
  if (typeof window === "undefined") return null;
  const host = window as Window & {
    SpeechRecognition?: new () => BrowserRecognition;
    webkitSpeechRecognition?: new () => BrowserRecognition;
  };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

export function AssistantBubble() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const draftRef = useRef("");
  const messages = useSyncExternalStore(subscribeToChat, readChat, () => EMPTY_CHAT);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"idle" | "thinking" | "listening" | "speaking">("idle");
  const [speakReplies, setSpeakReplies] = useState(true);
  const threadRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<BrowserRecognition | null>(null);
  const keepListeningRef = useRef(false);
  const heardSpeechRef = useRef(false);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages, open]);

  function remember(next: AssistantChatMessage[]) {
    saveChat(next);
  }

  function stopAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audioRef.current = null;
  }

  async function speak(text: string) {
    stopAudio();
    window.speechSynthesis?.cancel();
    const synth = window.speechSynthesis;
    if (synth) {
      setBusy("speaking");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-CA";
      utterance.rate = 1;
      utterance.onend = () => setBusy("idle");
      utterance.onerror = () => setBusy("idle");
      synth.speak(utterance);
      return;
    }
    setBusy("speaking");
    try {
      const response = await fetch("/api/app/assistant/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setNotice(payload?.error ?? "I could not speak that reply.");
        setBusy("idle");
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
        setBusy("idle");
      };
      await audio.play();
    } catch {
      setNotice("I could not speak that reply.");
      setBusy("idle");
    }
  }

  function setMessage(text: string) {
    draftRef.current = text;
    setDraft(text);
  }

  async function send(text: string) {
    const content = text.trim();
    if (busy === "thinking") return;
    if (!content) {
      setNotice("Type a message, tap a question, or use Talk first.");
      return;
    }
    stopAudio();
    setNotice(null);
    setMessage("");
    const next = [...messages, { role: "user" as const, content }];
    remember(next);
    const count = messagesToday() + 1;
    setBusy("thinking");

    try {
      const response = await fetch("/api/app/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-16),
          messagesToday: count,
        }),
      });
      const payload = (await response.json()) as {
        answer?: string | null;
        immigrationNotice?: string | null;
        error?: string;
      };
      if (!response.ok || !payload.answer) {
        setNotice(payload.error ?? "Sign in to talk with Alex.");
        setBusy("idle");
        return;
      }
      window.localStorage.setItem(todayKey(), String(count));
      const withReply = [...next, { role: "assistant" as const, content: payload.answer }];
      remember(withReply);
      if (payload.immigrationNotice && !payload.answer.includes(payload.immigrationNotice)) {
        setNotice(payload.immigrationNotice);
      }
      if (speakReplies) {
        await speak(payload.answer);
      } else {
        setBusy("idle");
      }
    } catch {
      setNotice("I could not answer just now. Please try again.");
      setBusy("idle");
    }
  }

  function stopListening() {
    keepListeningRef.current = false;
    const recognition = recognitionRef.current;
    const recorder = recorderRef.current;
    recognitionRef.current = null;
    recognition?.stop();
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return;
    }
    setBusy("idle");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy === "listening") stopListening();
    await send(draftRef.current);
  }

  function startRecognition() {
    const Ctor = recognitionConstructor();
    if (!Ctor) return false;
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let spoken = "";
      for (let index = 0; index < event.results.length; index += 1) {
        spoken += ` ${event.results[index]?.[0]?.transcript ?? ""}`;
      }
      const text = spoken.replace(/\s+/g, " ").trim();
      if (text) heardSpeechRef.current = true;
      setMessage(text);
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setNotice("Allow the microphone, then try again.");
        setBusy("idle");
        return;
      }
      if (event.error === "no-speech" || event.error === "aborted") return;
      recognitionRef.current = null;
      if (!recorderRef.current) void startRecorder();
    };
    recognition.onend = () => {
      if (!keepListeningRef.current || recognitionRef.current !== recognition) return;
      window.setTimeout(() => {
        if (!keepListeningRef.current || recognitionRef.current !== recognition) return;
        try {
          recognition.start();
        } catch {
          recognitionRef.current = null;
        }
      }, 200);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      return false;
    }
    setBusy("listening");
    return true;
  }

  async function startRecorder() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickRecordingMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        recorderRef.current = null;
        if (heardSpeechRef.current && draftRef.current.trim()) {
          setBusy("idle");
          return;
        }
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunks, { type });
        void transcribe(blob, type);
      };
      recorderRef.current = recorder;
      recorder.start(250);
      setBusy("listening");
      return true;
    } catch {
      return false;
    }
  }

  async function toggleMic() {
    if (busy === "listening") {
      stopListening();
      return;
    }
    if (busy === "thinking") return;
    setNotice(null);
    stopAudio();
    window.speechSynthesis?.cancel();
    heardSpeechRef.current = false;
    keepListeningRef.current = true;
    const recording = await startRecorder();
    const recognizing = startRecognition();
    if (!recording && !recognizing) {
      keepListeningRef.current = false;
      setNotice("Allow the microphone, then try again.");
      setBusy("idle");
    }
  }

  async function transcribe(blob: Blob, mimeType: string) {
    setBusy("thinking");
    try {
      const form = new FormData();
      form.append("audio", blob, `speech.${getAudioFileExtension(mimeType)}`);
      const response = await fetch("/api/app/assistant/transcribe", {
        method: "POST",
        body: form,
      });
      const payload = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || !payload.text) {
        setNotice(payload.error ?? "I could not hear that.");
        setBusy("idle");
        return;
      }
      setMessage(payload.text);
      setBusy("idle");
    } catch {
      setNotice("I could not hear that. Please try again.");
      setBusy("idle");
    }
  }

  const status =
    busy === "listening"
      ? "Listening"
      : busy === "thinking"
        ? "Thinking"
        : busy === "speaking"
          ? "Speaking"
          : null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)]">
      {open ? (
        <section
          className="mb-3 flex h-[min(36rem,78vh)] w-[min(100vw-2rem,24rem)] flex-col rounded-3xl bg-white p-4 shadow-xl ring-1 ring-ink/10"
          aria-label="Alex, practice coach"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Alex</p>
              <p className="text-xs text-ink/60">Practice coach. Type or talk.</p>
            </div>
            <button type="button" className="text-sm underline" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>

          <div ref={threadRef} className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <p className="text-sm leading-6 text-ink/70">
                Ask me anything about practice, or just talk. I will answer in the chat and say it out loud.
              </p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "user"
                      ? "ml-8 rounded-2xl bg-brand/10 px-3 py-2 text-sm leading-6"
                      : "mr-8 rounded-2xl bg-cream px-3 py-2 text-sm leading-6"
                  }
                >
                  <p>{message.content}</p>
                  {message.role === "assistant" ? (
                    <button
                      type="button"
                      className="mt-1 text-xs font-semibold underline"
                      onClick={() => void speak(message.content)}
                    >
                      Hear it
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>

          {status ? <p className="mt-2 text-xs font-medium text-ink/60">{status}</p> : null}
          {notice ? <p className="mt-2 text-sm leading-6 text-ink/80">{notice}</p> : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                className="rounded-full bg-cream px-3 py-1 text-left text-xs font-medium text-ink ring-1 ring-ink/10"
                onClick={() => {
                  if (busy === "listening") stopListening();
                  void send(question);
                }}
              >
                {question}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-3 flex items-end gap-2">
            <label className="sr-only" htmlFor="assistant-question">
              Your message
            </label>
            <textarea
              id="assistant-question"
              value={draft}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(draft);
                }
              }}
              rows={2}
              placeholder={busy === "listening" ? "Listening... words appear here" : "Type a message"}
              className="block min-w-0 flex-1 resize-none rounded-2xl border border-ink/15 px-3 py-2 text-sm"
            />
            <button
              type="button"
              className="h-11 rounded-full border border-ink/15 px-3 text-sm font-semibold"
              onClick={() => void toggleMic()}
              aria-pressed={busy === "listening"}
            >
              {busy === "listening" ? "Stop" : "Talk"}
            </button>
            <button
              type="submit"
              className="h-11 rounded-full bg-brand px-4 text-sm font-semibold text-white"
              disabled={busy === "thinking"}
            >
              Send
            </button>
          </form>
          <label className="mt-2 flex items-center gap-2 text-xs text-ink/70">
            <input
              type="checkbox"
              checked={speakReplies}
              onChange={(event) => setSpeakReplies(event.target.checked)}
            />
            Speak replies
          </label>
        </section>
      ) : null}
      <button
        type="button"
        data-tour="assistant"
        className="h-12 rounded-full bg-ink px-4 text-sm font-semibold text-cream"
        onClick={() => setOpen((value) => !value)}
      >
        AI assistant
      </button>
    </div>
  );
}
