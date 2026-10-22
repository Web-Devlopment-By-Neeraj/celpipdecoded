import { NextResponse } from "next/server";
import { fulfillStripePurchase } from "@/features/platform/fulfill-stripe-purchase";
import { requireAppUser } from "@/features/platform/guards";
import { retrievePaidCheckoutSession } from "@/features/platform/stripe-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAppUser(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { sessionId?: string } | null;
  const sessionId = body?.sessionId?.trim() ?? "";
  const session = await retrievePaidCheckoutSession(sessionId);
  if ("error" in session) {
    return NextResponse.json({ ok: false, error: session.error }, { status: 400 });
  }
  if (session.userId !== auth.user.id) {
    return NextResponse.json({ ok: false, error: "This payment belongs to another account." }, { status: 403 });
  }
  if (!session.paid) {
    return NextResponse.json({ ok: false, error: "Stripe has not marked this payment as paid yet." }, { status: 409 });
  }

  const result = await fulfillStripePurchase({
    userId: auth.user.id,
    email: auth.user.email,
    productCode: session.productCode,
    providerRef: session.id,
    amountCents: session.amountCents,
    taxCents: session.taxCents,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    productCode: result.productCode,
    alreadyGranted: result.alreadyGranted,
  });
}
