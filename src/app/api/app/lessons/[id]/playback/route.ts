import { NextResponse } from "next/server";
import { requireAppUser } from "@/features/platform/guards";
import { can } from "@/features/platform/entitlements";
import { authorizePlayback, DEFAULT_LANGUAGES } from "@/features/platform/video";
import { defaultSettings } from "@/features/platform/settings";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const auth = await requireAppUser(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang") ?? "en";
  const settings = defaultSettings();
  const language = DEFAULT_LANGUAGES.find((item) => item.code === lang);
  const grant = authorizePlayback({
    hasCourse: can([], "course_videos", new Date()),
    isFreeLesson: id.endsWith("-free"),
    language,
    video: language?.status === "live"
      ? { lessonId: id, lang, videoId: `${id}-${lang}`, durationSec: 600, published: true }
      : undefined,
    previewSeconds: settings["video.preview_seconds"],
    ttlMinutes: settings["video.token_ttl_minutes"],
    now: new Date(),
  });

  if (!grant.ok) {
    return NextResponse.json({ ok: false, error: grant.reason }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    lessonId: id,
    mode: grant.mode,
    maxSeconds: grant.maxSeconds,
    expiresAt: grant.expiresAt.toISOString(),
  });
}
