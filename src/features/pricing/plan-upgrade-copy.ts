import { formatCad } from "@/features/platform/pack-surface";
import { DEFAULT_PRODUCTS } from "@/features/platform/payments";

export type PlanUpgradeContent = {
  productCode: string;
  name: string;
  priceLabel: string;
  billingNote: string;
  headline: string;
  intro: string;
  benefits: string[];
};

const BILLING_NOTES: Record<string, string> = {
  sprint: "Billed monthly in CAD. Cancel anytime in your account.",
  course: "One-time payment in CAD. Course access does not expire.",
  batch: "One-time reservation in CAD. You are charged when the batch is confirmed.",
  private_1to1: "One-time payment in CAD after you choose a time. The time is yours when the payment is confirmed.",
};

const BENEFITS: Record<string, string[]> = {
  sprint: [
    "Up to 40 AI feedback reports each billing period",
    "Full mock test access beyond the free Mock Test 1",
    "Speaking and writing attempt history on your dashboard",
    "Timed practice stays free even when AI reports run out",
  ],
  course: [
    "Full course video playback in English and Hindi",
    "Three months of Test Sprint benefits included (AI reports and mocks)",
    "Locked lessons open on your account after payment confirms",
    "Preview stays available for visitors who have not purchased yet",
  ],
  batch: [
    "Reserve a seat in a live batch schedule",
    "Card is not charged until the batch meets its minimum size",
    "Move or cancel with Amar when plans change",
  ],
  private_1to1: [
    "The session is with Amar only",
    "Choose an open time, then pay",
    "If that time is taken, you pick another one. No second charge",
  ],
};

const INTROS: Record<string, string> = {
  sprint:
    "Test Sprint adds scored AI feedback and mock test access on top of free practice.",
  course:
    "Decoded Course unlocks the video library and includes a three-month practice boost.",
  batch: "Live Batch holds your place in scheduled group classes.",
  private_1to1: "One focused session with Amar.",
};

const HEADLINES: Record<string, string> = {
  private_1to1: "Do 1:1 with Amar",
};

export const PRICING_PLAN_ORDER = [
  "sprint",
  "course",
  "batch",
  "private_1to1",
] as const;

const PRICE_PERIODS: Record<string, string> = {
  sprint: "per month",
  course: "one-time",
  batch: "one-time",
  private_1to1: "one-time",
};

const PLAN_BADGES: Partial<Record<string, string>> = {
  sprint: "AI practice",
  course: "Best value",
};

export type PlanPricingCardMeta = {
  pricePeriod: string;
  badge?: string;
  featured: boolean;
};

export function getPlanPricingCardMeta(productCode: string): PlanPricingCardMeta {
  return {
    pricePeriod: PRICE_PERIODS[productCode] ?? "CAD",
    badge: PLAN_BADGES[productCode],
    featured: productCode === "course",
  };
}

export function getPlanUpgradeContent(productCode: string): PlanUpgradeContent | null {
  const product = DEFAULT_PRODUCTS.find(
    (item) => item.code === productCode && item.active,
  );
  if (!product) return null;

  const benefits = BENEFITS[product.code] ?? [
    "Access tied to this plan after payment confirms",
  ];

  return {
    productCode: product.code,
    name: product.name,
    priceLabel: formatCad(product.priceCents),
    billingNote: BILLING_NOTES[product.code] ?? "Price in CAD.",
    headline: HEADLINES[product.code] ?? `Unlock ${product.name}`,
    intro: INTROS[product.code] ?? "This plan unlocks the features listed below.",
    benefits,
  };
}
