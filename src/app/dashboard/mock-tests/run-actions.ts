"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  recordMockSectionResult,
  saveOpenMockDraft,
} from "@/features/mock-tests/mock-run-store";
import type {
  MockRunMode,
  MockRunSummary,
  MockRunTimer,
  MockSectionDraft,
} from "@/features/mock-tests/mock-run";

async function currentUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function saveMockSectionAction(input: {
  slug: string;
  mode: MockRunMode;
  section: string;
  draft: MockSectionDraft;
  timer: MockRunTimer | null;
}): Promise<{ ok: boolean }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false };

  const ok = await saveOpenMockDraft({
    userId,
    slug: input.slug,
    mode: input.mode,
    section: input.section,
    draft: input.draft,
    timer: input.timer,
  });
  return { ok };
}

export async function recordMockSectionResultAction(input: {
  slug: string;
  mode: MockRunMode;
  section: string;
  screenIndex: number;
  summary: MockRunSummary;
}): Promise<{ ok: boolean }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false };

  const ok = await recordMockSectionResult({
    userId,
    ...input,
  });
  return { ok };
}
