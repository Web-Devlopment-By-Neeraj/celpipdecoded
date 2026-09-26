import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { emptyStateAssets } from "@/features/assets/asset-registry";
import { writingCopy } from "@/features/writing/task-copy";

// Shown on /dashboard/writing when no active writing tasks exist yet,
// for example before the seed migration has been run.
export function WritingEmptyState() {
  return (
    <AppEmptyState
      className="mt-8"
      title={writingCopy.emptyStateMessage}
      description="Please check back soon. Practice tasks are on the way."
      imageSrc={emptyStateAssets.noProgress}
      action={
        <AppButtonLink href="/dashboard">
          {writingCopy.backToDashboard}
        </AppButtonLink>
      }
    />
  );
}
