import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppModuleCard } from "@/components/app/AppModuleCard";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { emptyStateAssets } from "@/features/assets/asset-registry";
import { formatCount } from "@/features/design/formatters";
import { toneFromModuleStatus } from "@/features/design/status-styles";
import {
  DASHBOARD_MODULE_ROUTES,
  dashboardCopy,
} from "@/features/dashboard/dashboard-copy";
import type { DashboardModuleKey } from "@/features/dashboard/dashboard-types";

// Module cards for Speaking, Writing, Reading and Listening.
//
// Availability follows the route map rather than the catalog status
// alone, because a module the learner can already practise should not
// read as coming soon if its row was seeded before the module shipped.
// Reading and listening have no route, so they stay coming soon.
//
// Live classes is not rendered here. Live package work comes later in
// LIVE-01, so this ticket builds no live class card, form or pricing.

export type DashboardModuleGridModule = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
};

export type DashboardModuleGridProps = {
  modules: DashboardModuleGridModule[];
  // Completed feedback reports per module, shown as the card metric.
  reportCounts: Record<DashboardModuleKey, number>;
};

// The metric line for a module card, only where the learner has reports.
function getMetric(
  slug: string,
  reportCounts: Record<DashboardModuleKey, number>,
): string | undefined {
  const count =
    slug === "celpip-speaking"
      ? reportCounts.speaking
      : slug === "celpip-writing"
        ? reportCounts.writing
        : 0;

  return count > 0 ? formatCount(count, "feedback report") : undefined;
}

export function DashboardModuleGrid({
  modules,
  reportCounts,
}: DashboardModuleGridProps) {
  return (
    <section aria-label={dashboardCopy.modulesHeading}>
      <AppSectionHeader
        title={dashboardCopy.modulesHeading}
        description={dashboardCopy.modulesDescription}
      />

      {modules.length === 0 ? (
        <div className="mt-5">
          <AppEmptyState
            title={dashboardCopy.modulesEmptyTitle}
            description={dashboardCopy.modulesEmptyText}
            imageSrc={emptyStateAssets.noProgress}
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => {
            const href = DASHBOARD_MODULE_ROUTES[module.slug];
            const isAvailable = Boolean(href);

            return (
              <AppModuleCard
                key={module.id}
                slug={module.slug}
                title={module.title}
                description={module.description}
                href={href}
                statusLabel={
                  isAvailable
                    ? dashboardCopy.modulesActiveLabel
                    : dashboardCopy.modulesComingSoonLabel
                }
                statusTone={toneFromModuleStatus(
                  isAvailable ? "active" : module.status,
                  isAvailable,
                )}
                unavailableLabel={dashboardCopy.modulesComingSoonLabel}
                metric={getMetric(module.slug, reportCounts)}
                ctaLabel={dashboardCopy.modulesOpenLabel}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
