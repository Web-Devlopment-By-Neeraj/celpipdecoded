import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ASSISTANT_VOICE_INSTRUCTIONS,
  speakableText,
} from "@/features/platform/assistant-conversation";
import { requireAppUser } from "@/features/platform/guards";
import { createRateLimiter } from "@/features/platform/security";
import { defaultSettings } from "@/features/platform/settings";

export const runtime = "nodejs";

const limiter = createRateLimiter(() => Date.now());

export async function POST(request: Request) {
  const auth = await requireAppUser(request);
  if (!auth.ok) return auth.response;

  const settings = defaultSettings();
  const burst = limiter.hit(
    `assistant-speech:${auth.user.id}`,
    settings["rate.assistant_burst_per_minute"],
    60 * 1000,
  );
  if (!burst.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please wait 1 minutes and try again." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as { text?: string } | null;
  const text = speakableText(typeof body?.text === "string" ? body.text : "");
  if (!text) {
    return NextResponse.json({ ok: false, error: "Nothing to say." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "The assistant needs an OpenAI key on the server." },
      { status: 503 },
    );
  }

  try {
    const openai = new OpenAI({ apiKey });
    const speech = await openai.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: "marin",
      input: text,
      instructions: ASSISTANT_VOICE_INSTRUCTIONS,
      response_format: "mp3",
      speed: 0.96,
    });
    const bytes = new Uint8Array(await speech.arrayBuffer());
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Assistant speech failed:", err);
    return NextResponse.json(
      { ok: false, error: "I could not speak that reply. Please try again." },
      { status: 502 },
    );
  }
}
