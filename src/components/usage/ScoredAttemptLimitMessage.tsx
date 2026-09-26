import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { cx, text } from "@/features/design/design-tokens";
import {
  DASHBOARD_HREF,
  PREVIOUS_FEEDBACK_HREF,
  REQUEST_ACCESS_HREF,
  scoredAttemptLimitCopy,
} from "@/features/usage/usage-copy";

// Shown when a learner asks for AI feedback with no scored attempts
// left, either after the API returns NO_SCORED_ATTEMPTS_REMAINING or
// ahead of a submit that would be blocked.
//
// Presentation only, no checkout. "Request access" points at the academy
// inquiry form; payment is a later ticket.

export function ScoredAttemptLimitMessage({
  previousFeedbackHref = PREVIOUS_FEEDBACK_HREF,
}: {
  // Set per module so the speaking flow links to speaking history and
  // the writing flow to writing history.
  previousFeedbackHref?: string;
}) {
  return (
    <AppCard
      as="section"
      variant="subtle"
      padding="compact"
      ariaLabel={scoredAttemptLimitCopy.title}
    >
      <p role="alert" className={cx("text-sm leading-6", text.secondary)}>
        {scoredAttemptLimitCopy.message}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <AppButtonLink href={REQUEST_ACCESS_HREF} size="sm">
          {scoredAttemptLimitCopy.requestAccess}
        </AppButtonLink>
        <AppButtonLink href={DASHBOARD_HREF} variant="secondary" size="sm">
          {scoredAttemptLimitCopy.backToDashboard}
        </AppButtonLink>
        <AppButtonLink href={previousFeedbackHref} variant="ghost" size="sm">
          {scoredAttemptLimitCopy.viewPreviousFeedback}
        </AppButtonLink>
      </div>
    </AppCard>
  );
}
