import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { emptyStateAssets } from "@/features/assets/asset-registry";
import { writingHistoryCopy } from "@/features/writing/writing-attempt-history";

// Shown on the writing history page when the user has no writing
// attempts yet. The button returns to the writing task library, where
// the first practice response starts.
export function WritingEmptyAttemptsState() {
  return (
    <AppEmptyState
      title={writingHistoryCopy.emptyHeading}
      description={writingHistoryCopy.emptyText}
      imageSrc={emptyStateAssets.writingHistory}
      action={
        <AppButtonLink href="/dashboard/writing">
          {writingHistoryCopy.emptyButton}
        </AppButtonLink>
      }
    />
  );
}
