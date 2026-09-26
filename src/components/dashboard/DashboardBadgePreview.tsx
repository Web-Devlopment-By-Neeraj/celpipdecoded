import { AppBadgeIcon } from "@/components/app/AppBadgeIcon";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { emptyStateAssets } from "@/features/assets/asset-registry";
import { cx, text } from "@/features/design/design-tokens";
import { formatShortDate } from "@/features/design/formatters";
import {
  dashboardCopy,
  dashboardRoutes,
} from "@/features/dashboard/dashboard-copy";
import type { DashboardBadgeItem } from "@/features/dashboard/dashboard-types";

// Practice badges the learner has earned, as a small preview.
//
// Artwork comes from AppBadgeIcon, which resolves the stored badge slug
// through badge-asset-map.ts and falls back to a generic badge for an
// unmapped slug, so an unknown slug never renders a broken image.
//
// This is a preview only. A full badge collection page is a later
// ticket, so there is no link to one here.

export type DashboardBadgePreviewProps = {
  badges: DashboardBadgeItem[];
};

export function DashboardBadgePreview({ badges }: DashboardBadgePreviewProps) {
  return (
    <section aria-label={dashboardCopy.badgesHeading}>
      <AppSectionHeader
        title={dashboardCopy.badgesHeading}
        description={dashboardCopy.badgesDescription}
      />

      {badges.length === 0 ? (
        <div className="mt-5">
          <AppEmptyState
            title={dashboardCopy.badgesEmptyTitle}
            description={dashboardCopy.badgesEmptyText}
            imageSrc={emptyStateAssets.noBadges}
            action={
              <AppButtonLink href={dashboardRoutes.writing}>
                {dashboardCopy.badgesEmptyAction}
              </AppButtonLink>
            }
          />
        </div>
      ) : (
        <AppCard className="mt-5" padding="compact">
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {badges.map((badge) => {
              const earned = formatShortDate(badge.earnedAt);

              return (
                <li key={badge.id} className="flex flex-col items-center text-center">
                  <AppBadgeIcon
                    slug={badge.slug}
                    size="md"
                    alt=""
                    className="h-16 w-16"
                  />
                  <p
                    className={cx("mt-3 text-sm font-semibold", text.primary)}
                  >
                    {badge.title}
                  </p>
                  {earned ? (
                    <p className={cx("mt-1 text-xs leading-5", text.muted)}>
                      {dashboardCopy.badgesEarnedLabel} {earned}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </AppCard>
      )}
    </section>
  );
}
