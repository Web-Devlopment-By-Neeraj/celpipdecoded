import { NextResponse } from "next/server";
import {
  ASSISTANT_CAP_MESSAGE,
  HANDOVER_MESSAGE,
  IMMIGRATION_NOTICE,
  respondToStudent,
} from "@/features/platform/assistant";
import { requireAppUser } from "@/features/platform/guards";
import { createRateLimiter } from "@/features/platform/security";
import { defaultSettings } from "@/features/platform/settings";

export const runtime = "nodejs";

const limiter = createRateLimiter(() => Date.now());

const STARTER_KB = [
  {
    id: "kb-cancel",
    question: "How do I cancel Test Sprint?",
    answer: "Open account settings, choose Cancel Test Sprint, then confirm. Access stays on until the end of the paid month.",
    active: true,
  },
  {
    id: "kb-estimate",
    question: "Is the level an official result?",
    answer: "No. Every level on CELPIP Decoded is a practice estimate. It is not an official result.",
    active: true,
  },
];

export async function POST(request: Request) {
  const auth = await requireAppUser(request);
  if (!auth.ok) return auth.response;

  const settings = defaultSettings();
  if (!settings["assistant.enabled"]) {
    return NextResponse.json({ ok: false, error: "The assistant is turned off." }, { status: 403 });
  }

  const burst = limiter.hit(
    `assistant:${auth.user.id}`,
    settings["rate.assistant_burst_per_minute"],
    60 * 1000,
  );
  if (!burst.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please wait 1 minutes and try again." },
      { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    question?: string;
    messagesToday?: number;
    studentMessagesInSession?: number;
  } | null;

  const messagesToday = body?.messagesToday ?? 0;
  if (messagesToday >= settings["assistant.daily_cap"]) {
    return NextResponse.json({ ok: false, error: ASSISTANT_CAP_MESSAGE }, { status: 429 });
  }

  const turn = respondToStudent({
    question: body?.question ?? "",
    entries: STARTER_KB,
    studentMessagesInSession: body?.studentMessagesInSession ?? 1,
    unresolvedLimit: settings["assistant.unresolved_limit"],
    topK: settings["assistant.top_k"],
    minSimilarity: settings["assistant.min_similarity"],
    resolved: false,
  });

  return NextResponse.json({
    ok: true,
    answer: turn.answer,
    handover: turn.handover,
    handoverMessage: turn.handover ? HANDOVER_MESSAGE : null,
    immigrationNotice: turn.category === "immigration" ? IMMIGRATION_NOTICE : null,
    usedEntryIds: turn.usedEntryIds,
    analytics: turn.handover
      ? { name: "assistant_handover", reason: turn.handoverReason, category: turn.category }
      : null,
  });
}
