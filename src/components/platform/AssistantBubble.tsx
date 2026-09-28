"use client";

import { useState, type FormEvent } from "react";

export function AssistantBubble() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setNotice(null);
    const response = await fetch("/api/app/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, messagesToday: 0, studentMessagesInSession: 1 }),
    });
    const payload = (await response.json()) as {
      answer?: string | null;
      handoverMessage?: string | null;
      immigrationNotice?: string | null;
      error?: string;
    };
    if (!response.ok) {
      setReply(null);
      setNotice(payload.error ?? "Sign in to use the assistant.");
      return;
    }
    setReply(payload.answer ?? null);
    setNotice(
      [payload.handoverMessage, payload.immigrationNotice].filter(Boolean).join(" ") || null,
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)]">
      {open ? (
        <form
          onSubmit={onSubmit}
          className="mb-3 w-[min(100vw-2rem,22rem)] rounded-3xl bg-white p-4 shadow-xl ring-1 ring-ink/10"
          aria-label="AI assistant"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">AI assistant</p>
            <button type="button" className="text-sm underline" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <p className="mt-2 text-xs leading-5 text-ink/70">
            I am an AI assistant. I answer from CELPIP Decoded help articles and can pass your question to Amar.
          </p>
          <label className="mt-3 block text-sm font-medium" htmlFor="assistant-question">
            Your question
            <textarea
              id="assistant-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="mt-1 block w-full rounded-2xl border border-ink/15 px-3 py-2"
              rows={3}
            />
          </label>
          <button type="submit" className="mt-3 h-11 w-full rounded-full bg-brand text-sm font-semibold text-white">
            Ask
          </button>
          {reply ? <p className="mt-3 text-sm leading-6">{reply}</p> : null}
          {notice ? <p className="mt-2 text-sm leading-6">{notice}</p> : null}
        </form>
      ) : null}
      <button
        type="button"
        className="h-12 rounded-full bg-ink px-4 text-sm font-semibold text-cream"
        onClick={() => setOpen((value) => !value)}
      >
        AI assistant
      </button>
    </div>
  );
}
