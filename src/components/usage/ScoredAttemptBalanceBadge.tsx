import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import type { UsageAccessSummary } from "@/features/usage/access-types";
import {
  describeRemainingAttempts,
  usageAccessCopy,
} from "@/features/usage/usage-copy";
import type { StatusToneName } from "@/features/design/status-styles";

// One small pill with the learner's remaining AI feedback access.
//
// Used on the speaking and writing module pages, where a full card would
// compete with the progress summary that already sits there. Presentation
// only: the summary is read on the server and passed in.

function toneForSummary(summary: UsageAccessSummary): StatusToneName {
  if (summary.accessStatus !== "active" || summary.totalAttemptsRemaining <= 0) {
    return "error";
  }

  return summary.totalAttemptsRemaining === 1 ? "warning" : "success";
}

export function ScoredAttemptBalanceBadge({
  summary,
}: {
  summary: UsageAccessSummary;
}) {
  return (
    <AppStatusBadge tone={toneForSummary(summary)} withDot>
      {usageAccessCopy.badgeLabel}: {describeRemainingAttempts(summary)}
    </AppStatusBadge>
  );
}
