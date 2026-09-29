import { NextResponse } from "next/server";
import { buildAnalyticsEvent, type AnalyticsEventName } from "@/features/public-site/analytics";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const event = buildAnalyticsEvent(body.name as AnalyticsEventName, body.props ?? {});
  return NextResponse.json({ ok: true, event });
}
