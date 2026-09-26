import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { emptyStateAssets } from "@/features/assets/asset-registry";
import { speakingCopy } from "@/features/speaking/task-copy";

// Shown on /dashboard/speaking when no active speaking tasks exist yet,
// for example before the seed migration has been run.
export function SpeakingEmptyState() {
  return (
    <AppEmptyState
      className="mt-8"
      title={speakingCopy.emptyStateMessage}
      description="Please check back soon. Practice tasks are on the way."
      imageSrc={emptyStateAssets.noProgress}
      action={
        <AppButtonLink href="/dashboard">
          {speakingCopy.backToDashboard}
        </AppButtonLink>
      }
    />
  );
}
