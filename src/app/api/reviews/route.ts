import { NextResponse } from "next/server";
import { reviewIsSpamTrap, validateReview, type ReviewInput } from "@/features/public-site/review";
import { DEFAULT_SETTINGS } from "@/features/public-site/settings";
import { consumeRateLimit } from "@/features/public-site/demo";

const buckets = new Map();

export async function POST(request: Request) {
  const body = (await request.json()) as ReviewInput;
  if (reviewIsSpamTrap(body.trap ?? "")) {
    return NextResponse.json({ ok: true, stored: false });
  }
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = consumeRateLimit(buckets, ip, DEFAULT_SETTINGS.reviewRateLimitPerIpHour, Date.now(), 3_600_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many reviews from this network. Try again later." }, { status: 429 });
  }
  const errors = validateReview({
    ...body,
    minChars: DEFAULT_SETTINGS.reviewBodyMinChars,
    maxChars: DEFAULT_SETTINGS.reviewBodyMaxChars,
    today: new Date().toISOString().slice(0, 10),
  });
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }
  return NextResponse.json({ ok: true, stored: true, status: "submitted" });
}
