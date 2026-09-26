import Link from "next/link";
import { AppBadgeIcon } from "@/components/app/AppBadgeIcon";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { emptyStateAssets } from "@/features/assets/asset-registry";
import { cx, focus, text } from "@/features/design/design-tokens";
import { formatShortDate } from "@/features/design/formatters";
import {
  dashboardCopy,
  dashboardRoutes,
  MODULE_SHORT_LABELS,
  PRACTICE_ESTIMATE_DISCLAIMER,
} from "@/features/dashboard/dashboard-copy";
import { DASHBOARD_LEVEL_MAX } from "@/features/dashboard/dashboard-summary";
import type { DashboardFeedbackItem } from "@/features/dashboard/dashboard-types";

// The latest completed speaking and writing feedback reports.
//
// Presentation only. Each row links to the saved report in its own
// module, so the dashboard never re-renders a feedback report itself.
// Rows are already trimmed and sorted by dashboard-summary.ts.

export type DashboardRecentFeedbackProps = {
  items: DashboardFeedbackItem[];
};

function FeedbackRow({ item }: { item: DashboardFeedbackItem }) {
  const submitted = formatShortDate(item.submittedAt);

  return (
    <li className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {item.badgeSlug ? (
          <AppBadgeIcon
            slug={item.badgeSlug}
            size="sm"
            alt=""
            className="h-10 w-10"
          />
        ) : null}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <AppStatusBadge tone="info">
              {MODULE_SHORT_LABELS[item.moduleKey]}
            </AppStatusBadge>
            {item.badgeLabel ? (
              <AppStatusBadge tone="success">{item.badgeLabel}</AppStatusBadge>
            ) : null}
          </div>

          <p className={cx("mt-2 truncate text-sm font-semibold", text.primary)}>
            {item.taskTitle}
          </p>

          <p className={cx("mt-1 text-xs leading-5", text.muted)}>
            {item.taskTypeLabel}
            {submitted
              ? ` | ${dashboardCopy.recentSubmittedLabel} ${submitted}`
              : ""}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
        <div className="sm:text-right">
          <p
            className={cx(
              "text-xs font-semibold uppercase tracking-[0.15em]",
              text.muted,
            )}
          >
            {dashboardCopy.recentLevelLabel}
          </p>
          <p className={cx("mt-1 text-sm font-semibold", text.primary)}>
            {item.estimatedLevel === null
              ? dashboardCopy.progressNoValue
              : `${Math.round(item.estimatedLevel)} of ${DASHBOARD_LEVEL_MAX}`}
          </p>
        </div>

        <Link
          href={item.href}
          className={cx(
            "rounded-full text-sm font-semibold underline underline-offset-4",
            text.accent,
            focus.ring,
          )}
        >
          {dashboardCopy.recentViewFeedback}
        </Link>
      </div>
    </li>
  );
}

export function DashboardRecentFeedback({
  items,
}: DashboardRecentFeedbackProps) {
  return (
    <section aria-label={dashboardCopy.recentHeading}>
      <AppSectionHeader
        title={dashboardCopy.recentHeading}
        description={dashboardCopy.recentDescription}
      />

      {items.length === 0 ? (
        <div className="mt-5">
          <AppEmptyState
            title={dashboardCopy.recentEmptyTitle}
            description={dashboardCopy.recentEmptyText}
            imageSrc={emptyStateAssets.noFeedback}
            action={
              <AppButtonLink href={dashboardRoutes.speaking}>
                {dashboardCopy.recentEmptyAction}
              </AppButtonLink>
            }
          />
        </div>
      ) : (
        <AppCard className="mt-5" padding="compact">
          <ul className="divide-y divide-academy-line">
            {items.map((item) => (
              <FeedbackRow key={item.attemptId} item={item} />
            ))}
          </ul>

          <p className={cx("mt-4 text-xs leading-5", text.muted)}>
            {PRACTICE_ESTIMATE_DISCLAIMER}
          </p>
        </AppCard>
      )}
    </section>
  );
}
