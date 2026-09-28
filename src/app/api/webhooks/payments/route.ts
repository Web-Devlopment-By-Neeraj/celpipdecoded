import { NextResponse } from "next/server";
import { emptyPaymentState, handlePaymentEvent } from "@/features/platform/payments";
import { verifyStripeSignature } from "@/features/platform/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Webhook secret is not configured." }, { status: 500 });
  }
  const valid = verifyStripeSignature(
    rawBody,
    request.headers.get("stripe-signature"),
    secret,
    new Date(),
  );
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid signature." }, { status: 400 });
  }

  let event: {
    id?: string;
    data?: { object?: { metadata?: { user_id?: string; product_code?: string }; id?: string; amount_total?: number; tax?: number } };
  };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  const state = handlePaymentEvent(emptyPaymentState(), {
    id: event.id ?? "missing",
    type: "checkout.completed",
    userId: event.data?.object?.metadata?.user_id ?? "",
    productCode: event.data?.object?.metadata?.product_code ?? "course",
    providerRef: event.data?.object?.id ?? event.id ?? "missing",
    amountCents: event.data?.object?.amount_total ?? 0,
    taxCents: event.data?.object?.tax ?? 0,
  }, new Date());

  return NextResponse.json({ ok: true, purchases: state.purchases.length });
}
