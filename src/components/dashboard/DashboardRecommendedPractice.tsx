import { AppAssetImage } from "@/components/app/AppAssetImage";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { getModuleAsset } from "@/features/assets/module-asset-map";
import { cx, text } from "@/features/design/design-tokens";
import { dashboardCopy } from "@/features/dashboard/dashboard-copy";
import type { DashboardRecommendation } from "@/features/dashboard/dashboard-types";

// The next recommended practice, as the card a learner should act on.
//
// Presentation only. The recommendation is decided by
// dashboard-recommendations.ts from stored attempts and scores, never by
// an AI call, so this card just renders what it is given.

// The recommendation carries a module key, the module icon comes from
// the asset map by slug.
const MODULE_SLUGS = {
  speaking: "celpip-speaking",
  writing: "celpip-writing",
} as const;

export type DashboardRecommendedPracticeProps = {
  recommendation: DashboardRecommendation;
};

export function DashboardRecommendedPractice({
  recommendation,
}: DashboardRecommendedPracticeProps) {
  const asset = getModuleAsset(MODULE_SLUGS[recommendation.moduleKey]);

  return (
    <AppCard
      as="section"
      variant="highlighted"
      ariaLabel={dashboardCopy.recommendedHeading}
      padding="compact"
    >
      <AppSectionHeader
        eyebrow={dashboardCopy.recommendedEyebrow}
        title={dashboardCopy.recommendedHeading}
      />

      <div className="mt-5 flex items-start gap-4">
        <AppAssetImage
          src={asset.icon}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-xl object-contain"
        />

        <div className="min-w-0">
          <h3 className={cx(text.heading, "text-lg")}>
            {recommendation.title}
          </h3>
          <p className={cx("mt-2 text-sm leading-6", text.secondary)}>
            {recommendation.reason}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <AppButtonLink href={recommendation.href}>
          {recommendation.ctaLabel}
        </AppButtonLink>
        <AppButtonLink href={recommendation.secondaryHref} variant="ghost">
          {recommendation.secondaryLabel}
        </AppButtonLink>
      </div>

      <p className={cx("mt-4 text-xs leading-5", text.muted)}>
        {dashboardCopy.recommendedDescription}
      </p>
    </AppCard>
  );
}
