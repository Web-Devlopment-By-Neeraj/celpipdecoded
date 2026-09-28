import { NextResponse } from "next/server";
import { requireAppUser } from "@/features/platform/guards";
import { checkoutMode, DEFAULT_PRODUCTS } from "@/features/platform/payments";
import { createRateLimiter } from "@/features/platform/security";
import { defaultSettings } from "@/features/platform/settings";

export const runtime = "nodejs";

const limiter = createRateLimiter(() => Date.now());

export async function POST(request: Request) {
  const auth = await requireAppUser(request);
  if (!auth.ok) return auth.response;

  const settings = defaultSettings();
  const decision = limiter.hit(
    `checkout:${auth.user.id}`,
    settings["rate.checkout_per_hour"],
    60 * 60 * 1000,
  );
  if (!decision.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please wait 60 minutes and try again." },
      { status: 429, headers: { "Retry-After": String(decision.retryAfterSeconds) } },
    );
  }

  const body = (await request.json().catch(() => null)) as { productCode?: string } | null;
  const product = DEFAULT_PRODUCTS.find((item) => item.code === body?.productCode && item.active);
  if (!product) {
    return NextResponse.json({ ok: false, error: "Unknown plan." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    mode: checkoutMode(product.code),
    currency: product.currency,
    amountCents: product.priceCents,
    productCode: product.code,
    clientReferenceId: auth.user.id,
    analytics: { name: "checkout_started", plan: product.code },
    message: process.env.STRIPE_SECRET_KEY
      ? "Checkout session is ready to be created with the configured provider."
      : "Card checkout needs STRIPE_SECRET_KEY in the server environment. No card details are collected here.",
  });
}
