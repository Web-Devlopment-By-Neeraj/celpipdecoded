// Card payments. Access changes only inside this handler, which is fed by
// a verified webhook. Replaying an event id is a no-op. A full refund
// revokes every entitlement from that purchase.

import { grantEntitlement, revokePurchase, type Entitlement, type Purchase } from "./entitlements";

export type Product = {
  code: string;
  name: string;
  priceCents: number;
  currency: "CAD";
  providerPriceId: string;
  active: boolean;
};

export const DEFAULT_PRODUCTS: Product[] = [
  { code: "sprint", name: "Test Sprint", priceCents: 4900, currency: "CAD", providerPriceId: "price_sprint", active: true },
  { code: "course", name: "Decoded Course", priceCents: 19900, currency: "CAD", providerPriceId: "price_course", active: true },
  { code: "batch", name: "Live Batch", priceCents: 9900, currency: "CAD", providerPriceId: "price_batch", active: true },
  { code: "private_1to1", name: "Private 1:1", priceCents: 4900, currency: "CAD", providerPriceId: "price_private", active: true },
];

export type StoredPurchase = Purchase & {
  providerRef: string;
  amountCents: number;
  taxCents: number;
  status: "paid" | "refunded" | "partially_refunded";
};

export type Subscription = {
  id: string;
  userId: string;
  providerSubId: string;
  status: "active" | "past_due" | "canceled";
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
};

export type PaymentState = {
  events: Set<string>;
  purchases: StoredPurchase[];
  entitlements: Entitlement[];
  subscriptions: Subscription[];
  emails: string[];
  analytics: string[];
};

export function emptyPaymentState(): PaymentState {
  return {
    events: new Set(),
    purchases: [],
    entitlements: [],
    subscriptions: [],
    emails: [],
    analytics: [],
  };
}

export type PaymentEvent = {
  id: string;
  type:
    | "checkout.completed"
    | "invoice.paid"
    | "subscription.updated"
    | "charge.refunded"
    | "invoice.payment_failed";
  userId: string;
  productCode: string;
  providerRef: string;
  amountCents: number;
  taxCents: number;
  periodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  refundCents?: number;
  fullRefund?: boolean;
};

export function checkoutMode(productCode: string): "subscription" | "payment" {
  return productCode === "sprint" ? "subscription" : "payment";
}

export function handlePaymentEvent(
  state: PaymentState,
  event: PaymentEvent,
  now: Date,
  includedSprintMonths = 3,
): PaymentState {
  if (state.events.has(event.id)) return state;
  const next: PaymentState = {
    events: new Set(state.events).add(event.id),
    purchases: [...state.purchases],
    entitlements: [...state.entitlements],
    subscriptions: state.subscriptions.map((item) => ({ ...item })),
    emails: [...state.emails],
    analytics: [...state.analytics],
  };

  if (event.type === "checkout.completed" || event.type === "invoice.paid") {
    if (next.purchases.some((purchase) => purchase.providerRef === event.providerRef)) {
      return next;
    }
    const purchase: StoredPurchase = {
      id: `pur_${event.providerRef}`,
      userId: event.userId,
      productCode: event.productCode,
      method: "card",
      providerRef: event.providerRef,
      amountCents: event.amountCents,
      taxCents: event.taxCents,
      status: "paid",
      periodEnd: event.periodEnd ?? null,
      includedSprintMonths,
    };
    next.purchases.push(purchase);
    if (event.type === "invoice.paid") {
      next.entitlements = next.entitlements.map((entitlement) =>
        entitlement.userId === event.userId && entitlement.productCode === "sprint"
          ? { ...entitlement, endsAt: event.periodEnd ?? entitlement.endsAt }
          : entitlement,
      );
      const hasSprint = next.entitlements.some(
        (entitlement) =>
          entitlement.userId === event.userId && entitlement.productCode === "sprint",
      );
      if (!hasSprint) next.entitlements.push(...grantEntitlement(purchase, now));
    } else {
      next.entitlements.push(...grantEntitlement(purchase, now));
    }
    if (event.productCode === "sprint" && event.periodEnd) {
      const existing = next.subscriptions.find(
        (subscription) => subscription.userId === event.userId,
      );
      if (existing) {
        existing.currentPeriodEnd = event.periodEnd;
        existing.status = "active";
      } else {
        next.subscriptions.push({
          id: `sub_${event.userId}`,
          userId: event.userId,
          providerSubId: `stripe_${event.userId}`,
          status: "active",
          currentPeriodEnd: event.periodEnd,
          cancelAtPeriodEnd: false,
        });
      }
    }
    next.emails.push("receipt");
    next.analytics.push(`purchase_completed:${event.productCode}:card`);
    return next;
  }

  if (event.type === "subscription.updated") {
    next.subscriptions = next.subscriptions.map((subscription) =>
      subscription.userId === event.userId
        ? {
            ...subscription,
            cancelAtPeriodEnd: Boolean(event.cancelAtPeriodEnd),
            currentPeriodEnd: event.periodEnd ?? subscription.currentPeriodEnd,
          }
        : subscription,
    );
    if (event.cancelAtPeriodEnd && event.periodEnd) {
      next.emails.push(`cancellation:${event.periodEnd.toISOString()}`);
    }
    return next;
  }

  if (event.type === "charge.refunded") {
    const purchase = next.purchases.find((item) => item.providerRef === event.providerRef);
    if (!purchase) return next;
    if (event.fullRefund) {
      purchase.status = "refunded";
      next.entitlements = revokePurchase(next.entitlements, purchase.id, now);
    } else {
      purchase.status = "partially_refunded";
    }
    return next;
  }

  if (event.type === "invoice.payment_failed") {
    next.subscriptions = next.subscriptions.map((subscription) =>
      subscription.userId === event.userId
        ? { ...subscription, status: "past_due" }
        : subscription,
    );
    next.emails.push("payment_failed");
  }

  return next;
}

export function renewalReminderDue(
  periodEnd: Date,
  now: Date,
  daysBefore: number,
): boolean {
  const ms = periodEnd.getTime() - now.getTime();
  const days = ms / (24 * 60 * 60 * 1000);
  return days <= daysBefore && days > daysBefore - 1;
}
