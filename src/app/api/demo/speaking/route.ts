import { NextResponse } from "next/server";
import { audioTooLong, buildDemoFeedback, consumeRateLimit, newClaimToken } from "@/features/public-site/demo";
import { DEFAULT_SETTINGS } from "@/features/public-site/settings";

const buckets = new Map();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = consumeRateLimit(
    buckets,
    ip,
    DEFAULT_SETTINGS.demoEvalLimitPerIpPerDay,
    Date.now(),
    86_400_000,
  );
  if (!limit.allowed) {
    return NextResponse.json({ error: "Demo limit reached." }, { status: 429 });
  }

  const form = await request.formData();
  const seconds = Number(form.get("seconds") ?? 0);
  if (audioTooLong(seconds, DEFAULT_SETTINGS.speakingTask1RecordSeconds, DEFAULT_SETTINGS.demoAudioToleranceSeconds)) {
    return NextResponse.json({ error: "Recording is too long." }, { status: 400 });
  }

  const feedback = buildDemoFeedback(seconds);
  const response = NextResponse.json({
    ...feedback,
    claimToken: newClaimToken(),
    aiUsage: { kind: "evaluation", costCents: 4, userId: null },
  });
  response.cookies.set("cd_demo_claim", "pending", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}
