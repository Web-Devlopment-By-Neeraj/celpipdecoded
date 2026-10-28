import type { UsageAccessSummary } from "@/features/usage/access-types";
import {
  SPEAKING_MODULE_SLUG,
  WRITING_MODULE_SLUG,
} from "@/features/usage/ai-usage-types";

/** Free + shared paid/monthly attempts available for one module's AI feedback. */
export function remainingScoredAttemptsForModule(
  summary: UsageAccessSummary,
  moduleSlug: string,
): number {
  if (summary.accessStatus !== "active") {
    return 0;
  }

  let freeForModule = 0;
  if (moduleSlug === SPEAKING_MODULE_SLUG) {
    freeForModule = summary.freeSpeakingRemaining;
  } else if (moduleSlug === WRITING_MODULE_SLUG) {
    freeForModule = summary.freeWritingRemaining;
  } else {
    freeForModule = summary.freeAttemptsRemaining;
  }

  return (
    freeForModule +
    summary.monthlyAttemptsRemaining +
    summary.paidAttemptsRemaining
  );
}
