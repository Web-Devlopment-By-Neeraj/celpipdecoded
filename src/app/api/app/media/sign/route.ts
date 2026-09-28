import { NextResponse } from "next/server";
import { requireAppUser } from "@/features/platform/guards";
import { signMediaPath } from "@/features/platform/security";
import { defaultSettings } from "@/features/platform/settings";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAppUser(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => null)) as { path?: string } | null;
  if (!body?.path || body.path.includes("..")) {
    return NextResponse.json({ ok: false, error: "Missing file path." }, { status: 400 });
  }
  const secret = process.env.MEDIA_SIGNING_SECRET ?? "development-media-secret";
  const ttl = defaultSettings()["media.signed_url_ttl_minutes"];
  const expiresAt = new Date(Date.now() + ttl * 60 * 1000);
  return NextResponse.json({
    ok: true,
    token: signMediaPath(`${auth.user.id}/${body.path}`, expiresAt, secret),
    expiresAt: expiresAt.toISOString(),
  });
}
