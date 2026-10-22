import { NextResponse } from "next/server";
import { fulfillStripePurchase } from "@/features/platform/fulfill-stripe-purchase";
import { verifyStripeSignature } from "@/features/platform/security";

export const runtime = "nodejs";

type StripeEvent = {
  id?: string;
  type?: string;
  data?: {
    object?: {
      id?: string;
      object?: string;
      payment_status?: string;
      amount_total?: number;
      amount_paid?: number;
      billing_reason?: string;
      metadata?: { user_id?: string; product_code?: string };
      total_details?: { amount_tax?: number };
      parent?: { subscription_details?: { metadata?: { user_id?: string; product_code?: string } } };
      subscription_details?: { metadata?: { user_id?: string; product_code?: string } };
    };
  };
};

function readPurchase(event: StripeEvent): {
  userId: string;
  productCode: string;
  providerRef: string;
  amountCents: number;
  taxCents: number;
} | null {
  const object = event.data?.object;
  if (!object) return null;
  const metadata =
    object.metadata ??
    object.subscription_details?.metadata ??
    object.parent?.subscription_details?.metadata;
  const userId = metadata?.user_id ?? "";
  const productCode = metadata?.product_code ?? "";
  if (!userId || !productCode) return null;
  return {
    userId,
    productCode,
    providerRef: object.id ?? event.id ?? "",
    amountCents: object.amount_total ?? object.amount_paid ?? 0,
    taxCents: object.total_details?.amount_tax ?? 0,
  };
}

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

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  if (event.type === "invoice.paid" && event.data?.object?.billing_reason === "subscription_create") {
    return NextResponse.json({ ok: true, ignored: "subscription_create" });
  }

  if (event.type !== "checkout.session.completed" && event.type !== "invoice.paid") {
    return NextResponse.json({ ok: true, ignored: event.type ?? "unknown" });
  }

  if (event.type === "checkout.session.completed" && event.data?.object?.payment_status !== "paid") {
    return NextResponse.json({ ok: true, ignored: "unpaid" });
  }

  const purchase = readPurchase(event);
  if (!purchase) {
    return NextResponse.json({ ok: false, error: "Payment metadata is missing." }, { status: 400 });
  }

  const result = await fulfillStripePurchase(purchase);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    productCode: result.productCode,
    alreadyGranted: result.alreadyGranted,
  });
}
