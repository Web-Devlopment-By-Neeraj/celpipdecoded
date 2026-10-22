import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { can, type Entitlement } from "./entitlements";
import { DEFAULT_PRODUCTS } from "./payments";
import { addMonths } from "./time";

const MONTHLY_ATTEMPT_LIMIT = 40;

export type StripePurchaseInput = {
  userId: string;
  email?: string | null;
  productCode: string;
  providerRef: string;
  amountCents: number;
  taxCents: number;
  periodEnd?: Date | null;
};

export type FulfillmentResult =
  | { ok: true; alreadyGranted: boolean; productCode: string }
  | { ok: false; message: string };

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export async function fulfillStripePurchase(
  input: StripePurchaseInput,
): Promise<FulfillmentResult> {
  const product = DEFAULT_PRODUCTS.find(
    (item) => item.code === input.productCode && item.active,
  );
  if (!product) return { ok: false, message: "Unknown plan." };
  if (!input.userId || !input.providerRef) {
    return { ok: false, message: "Payment is missing the account or the Stripe reference." };
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();

  const { error: userError } = await supabase.from("users").upsert(
    { id: input.userId, email: input.email ?? null },
    { onConflict: "id" },
  );
  if (userError) return { ok: false, message: userError.message };

  const { error: productError } = await supabase.from("products").upsert(
    DEFAULT_PRODUCTS.map((item) => ({
      code: item.code,
      name: item.name,
      price_cents: item.priceCents,
      currency: item.currency,
      provider_price_id: item.providerPriceId,
      active: item.active,
    })),
    { onConflict: "code" },
  );
  if (productError) return { ok: false, message: productError.message };

  const { data: existing } = await supabase
    .from("purchases")
    .select("id")
    .eq("provider_ref", input.providerRef)
    .maybeSingle();

  if (existing?.id) {
    return { ok: true, alreadyGranted: true, productCode: product.code };
  }

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      user_id: input.userId,
      product_code: product.code,
      method: "card",
      provider_ref: input.providerRef,
      amount_cents: input.amountCents,
      tax_cents: input.taxCents,
      status: "paid",
    })
    .select("id")
    .single();

  if (purchaseError || !purchase) {
    return { ok: false, message: purchaseError?.message ?? "Could not save the purchase." };
  }

  const sprintEnd =
    product.code === "sprint"
      ? (input.periodEnd ?? addMonths(now, 1))
      : product.code === "course"
        ? addMonths(now, 3)
        : null;

  const entitlementRows = [
    {
      user_id: input.userId,
      product_code: product.code,
      starts_at: now.toISOString(),
      ends_at: product.code === "course" ? null : sprintEnd?.toISOString() ?? null,
      source_purchase_id: purchase.id,
    },
  ];
  if (product.code === "course" && sprintEnd) {
    entitlementRows.push({
      user_id: input.userId,
      product_code: "sprint",
      starts_at: now.toISOString(),
      ends_at: sprintEnd.toISOString(),
      source_purchase_id: purchase.id,
    });
  }

  const { error: entitlementError } = await supabase
    .from("entitlements")
    .insert(entitlementRows);
  if (entitlementError) return { ok: false, message: entitlementError.message };

  if (product.code === "sprint" || product.code === "course") {
    const { error: accountError } = await supabase.rpc("ensure_learner_usage_account", {
      p_user_id: input.userId,
    });
    if (accountError) return { ok: false, message: accountError.message };

    const periodEnd = sprintEnd ?? addMonths(now, 1);
    const { error: usageError } = await supabase
      .from("learner_usage_accounts")
      .update({
        monthly_plan_code: "sprint",
        monthly_scored_attempt_limit: MONTHLY_ATTEMPT_LIMIT,
        monthly_scored_attempts_used: 0,
        monthly_period_start: dateOnly(now),
        monthly_period_end: dateOnly(periodEnd),
        access_status: "active",
        updated_at: now.toISOString(),
      })
      .eq("user_id", input.userId);
    if (usageError) return { ok: false, message: usageError.message };
  }

  return { ok: true, alreadyGranted: false, productCode: product.code };
}

export async function userHasCourseAccess(userId: string): Promise<boolean> {
  const entitlements = await loadUserEntitlements(userId);
  return can(entitlements, "course_videos", new Date());
}

export async function loadUserEntitlements(userId: string): Promise<Entitlement[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("entitlements")
    .select("id, product_code, starts_at, ends_at, source_purchase_id, revoked_at")
    .eq("user_id", userId);

  if (error || !data) return [];

  return data.map((row) => ({
    id: String(row.id),
    userId,
    productCode: String(row.product_code),
    startsAt: new Date(String(row.starts_at)),
    endsAt: row.ends_at ? new Date(String(row.ends_at)) : null,
    sourcePurchaseId: String(row.source_purchase_id ?? ""),
    revokedAt: row.revoked_at ? new Date(String(row.revoked_at)) : null,
  }));
}
