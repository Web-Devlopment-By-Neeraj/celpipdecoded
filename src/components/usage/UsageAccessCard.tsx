import { AppCard } from "@/components/app/AppCard";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { cx, text } from "@/features/design/design-tokens";
import type { UsageAccessSummary } from "@/features/usage/access-types";
import {
  formatAttemptCount,
  usageAccessCopy,
} from "@/features/usage/usage-copy";
import { ScoredAttemptBalanceBadge } from "./ScoredAttemptBalanceBadge";

// The learner's AI feedback access, as a small card for the dashboard.
//
// Presentation only. The summary is read on the server with the service
// role and passed in, so no key and no direct table access reaches the
// browser. Deliberately compact: this ticket adds access information to
// the dashboard, it does not redesign it.

type AccessLine = {
  label: string;
  remaining: number;
  note?: string;
};

function buildLines(summary: UsageAccessSummary): AccessLine[] {
  const lines: AccessLine[] = [
    {
      label: usageAccessCopy.freeLabel,
      remaining: summary.freeAttemptsRemaining,
      note: `${summary.freeAttemptsUsed} of ${formatAttemptCount(summary.freeAttemptsTotal)} used`,
    },
  ];

  if (summary.planCode) {
    lines.push({
      label: usageAccessCopy.monthlyLabel,
      remaining: summary.monthlyAttemptsRemaining,
      note:
        summary.monthlyPeriodStart && summary.monthlyPeriodEnd
          ? `Period ${summary.monthlyPeriodStart} to ${summary.monthlyPeriodEnd}`
          : summary.planCode,
    });
  }

  if (summary.paidAttemptsRemaining > 0) {
    lines.push({
      label: usageAccessCopy.paidLabel,
      remaining: summary.paidAttemptsRemaining,
    });
  }

  return lines;
}

export function UsageAccessCard({ summary }: { summary: UsageAccessSummary }) {
  const suspended = summary.accessStatus !== "active";
  const lines = buildLines(summary);

  return (
    <AppCard
      as="section"
      ariaLabel={usageAccessCopy.cardTitle}
      padding="compact"
    >
      <AppSectionHeader
        eyebrow={usageAccessCopy.cardEyebrow}
        title={suspended ? usageAccessCopy.suspendedTitle : usageAccessCopy.cardTitle}
        action={<ScoredAttemptBalanceBadge summary={summary} />}
      />

      {suspended ? (
        <p className={cx("mt-4 text-sm leading-6", text.secondary)}>
          {usageAccessCopy.suspendedText}
        </p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {lines.map((line) => (
              <div key={line.label}>
                <dt
                  className={cx(
                    "text-xs font-semibold uppercase tracking-[0.15em]",
                    text.muted,
                  )}
                >
                  {line.label}
                </dt>
                <dd className={cx("mt-1 text-sm font-semibold", text.primary)}>
                  {formatAttemptCount(line.remaining)}{" "}
                  {usageAccessCopy.remainingSuffix}
                </dd>
                {line.note ? (
                  <p className={cx("mt-1 text-xs leading-5", text.muted)}>
                    {line.note}
                  </p>
                ) : null}
              </div>
            ))}
          </dl>

          <p className={cx("mt-4 text-xs leading-5", text.muted)}>
            {summary.totalAttemptsRemaining > 0
              ? usageAccessCopy.helperWithAccess
              : usageAccessCopy.helperWithoutAccess}
          </p>
        </>
      )}
    </AppCard>
  );
}
