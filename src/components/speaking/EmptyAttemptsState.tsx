import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { emptyStateAssets } from "@/features/assets/asset-registry";
import { historyCopy } from "@/features/speaking/attempt-history";

// Shown on the attempt history page when the user has no attempts yet.
// Copy and destination are unchanged, the panel now comes from the
// shared empty state and shows the optimized speaking history artwork.
export function EmptyAttemptsState() {
  return (
    <AppEmptyState
      title={historyCopy.emptyHeading}
      description={historyCopy.emptyText}
      imageSrc={emptyStateAssets.speakingHistory}
      action={
        <AppButtonLink href="/dashboard/speaking">
          {historyCopy.emptyButton}
        </AppButtonLink>
      }
    />
  );
}
