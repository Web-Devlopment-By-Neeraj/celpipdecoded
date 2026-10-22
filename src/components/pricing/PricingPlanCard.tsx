"use client";

import { PlanUpgradeButton } from "@/components/pricing/PlanUpgradeButton";
import { DEFAULT_PRODUCTS } from "@/features/platform/payments";
import {
  getPlanPricingCardMeta,
  getPlanUpgradeContent,
  PRICING_PLAN_ORDER,
} from "@/features/pricing/plan-upgrade-copy";

export function PricingPlanCard({
  productCode,
  offer,
}: {
  productCode: string;
  offer?: string;
}) {
  const content = getPlanUpgradeContent(productCode);
  if (!content) return null;

  const { pricePeriod, badge, featured } = getPlanPricingCardMeta(productCode);

  return (
    <article
      className={`relative flex h-full flex-col rounded-3xl p-6 sm:p-8 ${
        featured
          ? "bg-white shadow-lg ring-2 ring-brand"
          : "bg-white shadow-sm ring-1 ring-ink/10"
      }`}
    >
      {badge ? (
        <span
          className={`absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-semibold ${
            featured
              ? "bg-brand text-white"
              : "bg-brand/10 text-brand"
          }`}
        >
          {badge}
        </span>
      ) : null}

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
        {content.name}
      </p>

      <p className="mt-4 pr-24">
        <span className="font-serif text-4xl font-semibold tracking-tight">
          {content.priceLabel}
        </span>
        <span className="ml-2 text-sm font-medium text-ink/55">
          {pricePeriod}
        </span>
      </p>

      <p className="mt-3 text-sm leading-6 text-ink/70">{content.intro}</p>

      <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-sm leading-6 text-ink/85">
        {content.benefits.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span
              aria-hidden
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs leading-5 text-ink/50">{content.billingNote}</p>

      <div className="mt-6 pt-2">
        <PlanUpgradeButton
          productCode={productCode}
          offer={offer}
          withTopMargin={false}
          label="Choose this plan"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        />
      </div>
    </article>
  );
}

export function PricingPlansGrid({ offer }: { offer?: string }) {
  const active = new Set(
    DEFAULT_PRODUCTS.filter((p) => p.active).map((p) => p.code),
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {PRICING_PLAN_ORDER.filter((code) => active.has(code)).map((code) => (
        <PricingPlanCard key={code} productCode={code} offer={offer} />
      ))}
    </div>
  );
}
