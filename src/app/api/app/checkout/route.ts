import { NextResponse } from "next/server";
import { extendHoldForCheckout } from "@/features/booking/booking-store";
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

  const body = (await request.json().catch(() => null)) as {
    productCode?: string;
    offer?: string;
    bookingId?: string;
  } | null;
  const product = DEFAULT_PRODUCTS.find((item) => item.code === body?.productCode && item.active);
  if (!product) {
    return NextResponse.json({ ok: false, error: "Unknown plan." }, { status: 400 });
  }

  const bookingId = body?.bookingId?.trim() ?? "";
  if (product.code === "private_1to1" && !auth.user.email) {
    return NextResponse.json(
      { ok: false, error: "Confirm your email before paying for a 1:1." },
      { status: 400 },
    );
  }
  if (product.code === "private_1to1" && !bookingId) {
    return NextResponse.json(
      { ok: false, error: "Choose a time before paying for a 1:1." },
      { status: 400 },
    );
  }
  if (product.code === "private_1to1") {
    const held = await extendHoldForCheckout(auth.user.id, bookingId, "pending");
    if (!held.ok) {
      return NextResponse.json({ ok: false, error: held.error }, { status: 409 });
    }
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Card checkout needs STRIPE_SECRET_KEY in the server environment. No card details are collected here.",
      },
      { status: 503 },
    );
  }

  const mode = checkoutMode(product.code);
  const offer = body?.offer === "leave15" ? "leave15" : null;
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  if (offer) {
    await fetch("https://api.stripe.com/v1/coupons", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        id: "leave15",
        percent_off: "15",
        duration: "once",
        name: "Leave offer 15%",
      }),
    });
  }

  const params = new URLSearchParams();
  params.set("mode", mode);
  params.set("success_url", `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
  params.set(
    "cancel_url",
    product.code === "private_1to1" ? `${origin}/dashboard/live-classes` : `${origin}/pricing`,
  );
  params.set("client_reference_id", auth.user.id);
  params.set("metadata[user_id]", auth.user.id);
  params.set("metadata[product_code]", product.code);
  if (bookingId) params.set("metadata[booking_id]", bookingId);
  if (auth.user.email) params.set("customer_email", auth.user.email);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", product.currency.toLowerCase());
  params.set("line_items[0][price_data][unit_amount]", String(product.priceCents));
  params.set("line_items[0][price_data][product_data][name]", product.name);
  if (mode === "subscription") {
    params.set("line_items[0][price_data][recurring][interval]", "month");
    params.set("subscription_data[metadata][user_id]", auth.user.id);
    params.set("subscription_data[metadata][product_code]", product.code);
  }
  if (offer) params.set("discounts[0][coupon]", offer);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const session = (await stripeResponse.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };
  if (!stripeResponse.ok || !session.url || !session.id) {
    return NextResponse.json(
      { ok: false, error: session.error?.message ?? "Stripe could not start checkout." },
      { status: 502 },
    );
  }

  if (product.code === "private_1to1") {
    await extendHoldForCheckout(auth.user.id, bookingId, session.id);
  }

  return NextResponse.json({
    ok: true,
    url: session.url,
    mode,
    currency: product.currency,
    amountCents: product.priceCents,
    productCode: product.code,
    clientReferenceId: auth.user.id,
    analytics: { name: "checkout_started", plan: product.code },
  });
}
