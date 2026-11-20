"use client";

import { useEffect, useRef, useState } from "react";
import { saveMockSectionAction } from "@/app/dashboard/mock-tests/run-actions";
import { readExamTimerSample } from "@/features/exam-engine/exam-timer-resume";
import type { MockRunMode, MockSectionDraft } from "./mock-run";
import { mockSlugFromHub } from "./mock-run";
import type { MockTestPlayerContext } from "./mock-test-flow";

// Answers and the current screen for one section, kept in this browser.
//
// A closed tab can reopen the same section and find the answers again.
// This is not an account history: another browser, or speaking audio,
// is not covered here. A full disk or a blocked store must not stop
// the test, so every read and write fails quietly.

const DRAFT_PREFIX = "celpip-mock-draft:";

export function mockDraftStorageKey(
  context: MockTestPlayerContext | undefined,
  section: string,
): string {
  const hub = context?.hubPath ?? "/dashboard/mock-tests/mock-test-1";
  const flow = context?.flow ?? "section";
  return `${DRAFT_PREFIX}${hub}:${section}:${flow}`;
}

export function readMockDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeMockDraft(key: string, value: unknown): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked. The test still runs.
  }
}

export function mockRunIdentity(
  context: MockTestPlayerContext | undefined,
  section: string,
): { slug: string; mode: MockRunMode; section: string } {
  return {
    slug: mockSlugFromHub(context?.hubPath),
    mode: context?.flow ?? "section",
    section,
  };
}

export function useMockSectionDraft<T>(
  key: string,
  value: T,
  restore: (saved: T) => void,
  options?: {
    serverDraft?: T | null;
    run?: { slug: string; mode: MockRunMode; section: string } | null;
  },
): string | null {
  const [status, setStatus] = useState<string | null>(null);
  const restoreRef = useRef(restore);
  const skipFirstWrite = useRef(true);
  const serverDraft = options?.serverDraft ?? null;
  const run = options?.run ?? null;
  const serialized = JSON.stringify(value);

  useEffect(() => {
    restoreRef.current = restore;

    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      if (!serverDraft) {
        const saved = readMockDraft<T>(key);
        if (saved) {
          restoreRef.current(saved);
          return;
        }
      }
    }

    writeMockDraft(key, value);

    if (!run) return;

    const timer = window.setTimeout(() => {
      setStatus("Saving…");
      const draft = value as MockSectionDraft;
      const clock = readExamTimerSample();
      void saveMockSectionAction({
        slug: run.slug,
        mode: run.mode,
        section: run.section,
        draft: {
          screenIndex: draft.screenIndex ?? 0,
          answers: draft.answers,
          responses: draft.responses,
          choices: draft.choices,
        },
        timer: clock,
      }).then((result) => {
        setStatus(result.ok ? "Answers saved" : null);
      });
    }, 1000);

    return () => window.clearTimeout(timer);
    // serialized is the change signal. value matches it on that render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, serialized, serverDraft, run?.slug, run?.mode, run?.section]);

  return status;
}
