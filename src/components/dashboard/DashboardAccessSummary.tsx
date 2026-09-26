import { AppCard } from "@/components/app/AppCard";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { UsageAccessCard } from "@/components/usage/UsageAccessCard";
import { cx, text } from "@/features/design/design-tokens";
import { dashboardCopy } from "@/features/dashboard/dashboard-copy";
import type { UsageAccessSummary } from "@/features/usage/access-types";
import { usageAccessCopy } from "@/features/usage/usage-copy";

// AI feedback access on the dashboard.
//
// Read only. The summary is loaded on the server with the service role
// and passed in as a plain object, so no Supabase key and no admin
// helper reaches the browser. There is no control here that can change a
// balance, and this ticket adds no checkout.
//
// When the summary could not be read, for example because USAGE-01 is
// not configured on this environment, the card falls back to a safe
// placeholder rather than showing a zero balance the learner cannot act
// on.

export type DashboardAccessSummaryProps = {
  summary: UsageAccessSummary | null;
};

export function DashboardAccessSummary({
  summary,
}: DashboardAccessSummaryProps) {
  if (summary) {
    return <UsageAccessCard summary={summary} />;
  }

  return (
    <AppCard
      as="section"
      ariaLabel={dashboardCopy.accessPlaceholderTitle}
      padding="compact"
    >
      <AppSectionHeader
        eyebrow={usageAccessCopy.cardEyebrow}
        title={dashboardCopy.accessPlaceholderTitle}
      />
      <p className={cx("mt-4 text-sm leading-6", text.secondary)}>
        {dashboardCopy.accessPlaceholderText}
      </p>
    </AppCard>
  );
}
