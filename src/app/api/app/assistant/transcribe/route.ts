import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { requireAppUser } from "@/features/platform/guards";
import { createRateLimiter } from "@/features/platform/security";
import { defaultSettings } from "@/features/platform/settings";

export const runtime = "nodejs";

const limiter = createRateLimiter(() => Date.now());

export async function POST(request: Request) {
  const auth = await requireAppUser(request, { allowUnconfirmed: true });
  if (!auth.ok) return auth.response;

  const settings = defaultSettings();
  const burst = limiter.hit(
    `assistant-listen:${auth.user.id}`,
    settings["rate.assistant_burst_per_minute"],
    60 * 1000,
  );
  if (!burst.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please wait 1 minutes and try again." },
      { status: 429 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "The assistant needs an OpenAI key on the server." },
      { status: 503 },
    );
  }

  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ ok: false, error: "I did not hear anything." }, { status: 400 });
  }

  const preferred = process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe";
  const models = preferred === "whisper-1" ? [preferred] : [preferred, "whisper-1"];
  const bytes = Buffer.from(await audio.arrayBuffer());
  const filename = audio.name || "speech.webm";

  let lastError: unknown = null;
  const openai = new OpenAI({ apiKey });
  for (const model of models) {
    try {
      const result = await openai.audio.transcriptions.create({
        file: await toFile(bytes, filename),
        model,
        language: "en",
      });
      const text = result.text?.trim() ?? "";
      if (text) return NextResponse.json({ ok: true, text });
      lastError = new Error("empty transcript");
    } catch (err) {
      lastError = err;
    }
  }

  console.error("Assistant transcription failed:", lastError);
  return NextResponse.json(
    { ok: false, error: "I could not hear that. Please try again." },
    { status: 502 },
  );
}
