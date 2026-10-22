import { DEFAULT_PRODUCTS } from "./payments";

export type PaidCheckoutSession = {
  id: string;
  userId: string;
  productCode: string;
  amountCents: number;
  taxCents: number;
  paid: boolean;
};

type StripeSessionPayload = {
  id?: string;
  payment_status?: string;
  status?: string;
  amount_total?: number;
  client_reference_id?: string;
  metadata?: { user_id?: string; product_code?: string };
  total_details?: { amount_tax?: number };
  error?: { message?: string };
};

export async function retrievePaidCheckoutSession(
  sessionId: string,
): Promise<PaidCheckoutSession | { error: string }> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return { error: "Stripe is not configured." };
  if (!sessionId.startsWith("cs_")) return { error: "Unknown checkout session." };

  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );
  const payload = (await response.json()) as StripeSessionPayload;
  if (!response.ok) {
    return { error: payload.error?.message ?? "Stripe could not confirm the payment." };
  }

  const productCode = payload.metadata?.product_code ?? "";
  const known = DEFAULT_PRODUCTS.some((item) => item.code === productCode);
  if (!known) return { error: "The payment is not for a known plan." };

  return {
    id: payload.id ?? sessionId,
    userId: payload.metadata?.user_id || payload.client_reference_id || "",
    productCode,
    amountCents: payload.amount_total ?? 0,
    taxCents: payload.total_details?.amount_tax ?? 0,
    paid: payload.payment_status === "paid" || payload.status === "complete",
  };
}
