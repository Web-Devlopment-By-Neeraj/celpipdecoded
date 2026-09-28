import { NextResponse } from "next/server";
import { requireAppUser } from "@/features/platform/guards";
import { parseLessonMessage, recordLessonMessages } from "@/features/platform/lessons";
import { defaultSettings } from "@/features/platform/settings";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAppUser(request);
  if (!auth.ok) return auth.response;

  const origin = new URL(defaultSettings()["mini.lesson_origin"]).origin;
  const body = await request.json().catch(() => null);
  const parsed = parseLessonMessage(body, origin, origin);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: "Ignored lesson message." }, { status: 400 });
  }

  const events = recordLessonMessages({
    messages: [parsed.message],
    userId: auth.user.id,
    sessionId: request.headers.get("x-lesson-session") ?? "session",
    maxMessages: 50,
  });

  return NextResponse.json({ ok: true, events });
}
