import { AppAssetImage } from "@/components/app/AppAssetImage";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { AppMetricCard } from "@/components/app/AppMetricCard";
import { AppProgressBar } from "@/components/app/AppProgressBar";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { getModuleAsset } from "@/features/assets/module-asset-map";
import { skillAssets } from "@/features/assets/asset-registry";
import { cx, text } from "@/features/design/design-tokens";
import { formatCount, formatShortDate } from "@/features/design/formatters";
import {
  dashboardCopy,
  getContinueLabel,
  getHistoryLabel,
  PRACTICE_ESTIMATE_DISCLAIMER,
} from "@/features/dashboard/dashboard-copy";
import { DASHBOARD_LEVEL_MAX } from "@/features/dashboard/dashboard-summary";
import type { DashboardModuleProgress } from "@/features/dashboard/dashboard-types";

// Speaking and writing progress side by side.
//
// Two headline metrics sit above the module cards so the learner sees
// their overall position first, then each module card carries the four
// values the ticket asks for plus its two actions.
//
// Every level shown here is an estimated practice level on the 1 to 12
// practice scale, never an official CELPIP score, so the section closes
// with the shared disclaimer.

const MODULE_SLUGS = {
  speaking: "celpip-speaking",
  writing: "celpip-writing",
} as const;

export type DashboardProgressOverviewProps = {
  speaking: DashboardModuleProgress;
  writing: DashboardModuleProgress;
  totalFeedbackReports: number;
};

// "7 of 12" for a level, or the not yet placeholder.
function formatLevel(level: number | null): string {
  if (level === null || !Number.isFinite(level)) {
    return dashboardCopy.progressNoValue;
  }
  return `${Math.round(level)} of ${DASHBOARD_LEVEL_MAX}`;
}

function ProgressValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt
        className={cx(
          "text-xs font-semibold uppercase tracking-[0.15em]",
          text.muted,
        )}
      >
        {label}
      </dt>
      <dd className={cx("mt-1 text-sm font-semibold", text.primary)}>
        {value}
      </dd>
    </div>
  );
}

function ModuleProgressCard({
  progress,
}: {
  progress: DashboardModuleProgress;
}) {
  const asset = getModuleAsset(MODULE_SLUGS[progress.moduleKey]);
  const latestDate = formatShortDate(progress.latestPracticeDate);

  return (
    <AppCard as="article" ariaLabel={progress.moduleLabel} padding="compact">
      <div className="flex items-center gap-3">
        <AppAssetImage
          src={asset.icon}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-xl object-contain"
        />
        <h3 className={cx(text.heading, "min-w-0 text-lg")}>
          {progress.moduleLabel}
        </h3>
      </div>

      <AppProgressBar
        className="mt-5"
        value={progress.bestLevel ?? 0}
        max={DASHBOARD_LEVEL_MAX}
        label={`${progress.moduleLabel} best estimated practice level`}
        showLabel={false}
        helperText={
          progress.bestLevel === null
            ? dashboardCopy.progressNoLevelHelper
            : undefined
        }
      />

      <dl className="mt-5 grid grid-cols-2 gap-4">
        <ProgressValue
          label={dashboardCopy.progressReportsLabel}
          value={String(progress.feedbackReports)}
        />
        <ProgressValue
          label={dashboardCopy.progressBestLevelLabel}
          value={formatLevel(progress.bestLevel)}
        />
        <ProgressValue
          label={dashboardCopy.progressLatestLevelLabel}
          value={formatLevel(progress.latestLevel)}
        />
        <ProgressValue
          label={dashboardCopy.progressLatestDateLabel}
          value={latestDate || dashboardCopy.progressNoValue}
        />
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <AppButtonLink href={progress.practiceHref}>
          {getContinueLabel(progress.moduleKey)}
        </AppButtonLink>
        <AppButtonLink href={progress.historyHref} variant="secondary">
          {getHistoryLabel(progress.moduleKey)}
        </AppButtonLink>
      </div>
    </AppCard>
  );
}

export function DashboardProgressOverview({
  speaking,
  writing,
  totalFeedbackReports,
}: DashboardProgressOverviewProps) {
  // The best level across both modules, so the headline metric answers
  // "where am I now" without the learner comparing two cards.
  const bestOverall =
    speaking.bestLevel === null && writing.bestLevel === null
      ? null
      : Math.max(speaking.bestLevel ?? 0, writing.bestLevel ?? 0);

  return (
    <section aria-label={dashboardCopy.progressHeading}>
      <AppSectionHeader
        title={dashboardCopy.progressHeading}
        description={dashboardCopy.progressDescription}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <AppMetricCard
          label={dashboardCopy.progressReportsLabel}
          value={totalFeedbackReports}
          helperText={formatCount(totalFeedbackReports, "report")}
          iconSrc={skillAssets.speaking}
        />
        <AppMetricCard
          label={dashboardCopy.progressBestLevelLabel}
          value={formatLevel(bestOverall)}
          helperText={
            bestOverall === null
              ? dashboardCopy.progressNoLevelHelper
              : PRACTICE_ESTIMATE_DISCLAIMER
          }
          iconSrc={skillAssets.writing}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ModuleProgressCard progress={speaking} />
        <ModuleProgressCard progress={writing} />
      </div>

      <p className={cx("mt-4 text-xs leading-5", text.muted)}>
        {PRACTICE_ESTIMATE_DISCLAIMER}
      </p>
    </section>
  );
}
