import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ASSISTANT_SYSTEM_PROMPT,
  assistantModels,
  createAssistantReply,
  recentAssistantMessages,
  speakableText,
} from "@/features/platform/assistant-conversation";
import {
  ASSISTANT_CAP_MESSAGE,
  IMMIGRATION_NOTICE,
  classifyQuestion,
} from "@/features/platform/assistant";
import { requireAppUser } from "@/features/platform/guards";
import { createRateLimiter } from "@/features/platform/security";
import { defaultSettings } from "@/features/platform/settings";

export const runtime = "nodejs";

const limiter = createRateLimiter(() => Date.now());

export async function POST(request: Request) {
  const auth = await requireAppUser(request, { allowUnconfirmed: true });
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
    messages?: unknown;
    messagesToday?: number;
  } | null;

  const history = recentAssistantMessages(body?.messages);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  const messages =
    history.length > 0
      ? history
      : question
        ? [{ role: "user" as const, content: question.slice(0, 2000) }]
        : [];

  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json({ ok: false, error: "Type or say a message first." }, { status: 400 });
  }

  const messagesToday = Math.max(
    body?.messagesToday ?? 0,
    messages.filter((message) => message.role === "user").length,
  );
  if (messagesToday > settings["assistant.daily_cap"]) {
    return NextResponse.json({ ok: false, error: ASSISTANT_CAP_MESSAGE }, { status: 429 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "The assistant needs an OpenAI key on the server." },
      { status: 503 },
    );
  }

  const models = assistantModels(
    process.env.OPENAI_ASSISTANT_MODEL || process.env.OPENAI_WRITING_MODEL,
  );
  const lastUser = messages.filter((message) => message.role === "user").at(-1)?.content ?? "";
  const category = classifyQuestion(lastUser);

  try {
    const openai = new OpenAI({ apiKey });
    let answer = await createAssistantReply(models, async (model) => {
      const completion = await openai.chat.completions.create({
        model,
        messages: [{ role: "system", content: ASSISTANT_SYSTEM_PROMPT }, ...messages],
      });
      return completion.choices[0]?.message?.content ?? "";
    });
    if (category === "immigration" && !answer.toLowerCase().includes("licensed")) {
      answer = speakableText(`${answer} ${IMMIGRATION_NOTICE}`);
    }

    return NextResponse.json({
      ok: true,
      answer,
      handover: false,
      handoverMessage: null,
      immigrationNotice: category === "immigration" ? IMMIGRATION_NOTICE : null,
      usedEntryIds: [],
      analytics: null,
    });
  } catch (err) {
    console.error("Assistant reply failed:", err);
    const detail = err instanceof Error ? err.message : "";
    const outOfCredit = /credit balance is too low|no credits remaining|insufficient_quota|billing/i.test(
      detail,
    );
    return NextResponse.json(
      {
        ok: false,
        error: outOfCredit
          ? "The assistant is out of OpenAI credits. Add credits, then try again."
          : "I could not answer just now. Please try again.",
      },
      { status: 502 },
    );
  }
}
