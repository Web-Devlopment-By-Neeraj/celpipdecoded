import { AppBadgeIcon } from "@/components/app/AppBadgeIcon";
import { AppCard } from "@/components/app/AppCard";
import { cx, text } from "@/features/design/design-tokens";
import { resultCopy } from "@/features/speaking/practice-flow";

// Badge information shown with a feedback report.
//
// The slug is the stored badge_slug from the attempt score. It only
// selects artwork, the visible wording still comes from the badge
// catalog title.
export type EarnedBadge = {
  title: string;
  description: string | null;
  slug?: string | null;
};

// Practice badge section for the result page. Shows the earned badge
// artwork, title and description, or a subtle note when no badge exists
// yet.
export function BadgeDisplayCard({ badge }: { badge: EarnedBadge | null }) {
  return (
    <AppCard as="section" ariaLabel={resultCopy.badgeHeading}>
      <h2 className={cx(text.heading, "text-xl")}>{resultCopy.badgeHeading}</h2>

      {badge ? (
        <div className="mt-4 flex items-start gap-4">
          <AppBadgeIcon slug={badge.slug} size="md" alt="" />
          <div>
            <p
              className={cx(
                "inline-flex items-center rounded-full bg-academy-navy-soft px-3 py-1.5 text-xs font-semibold",
                text.primary,
              )}
            >
              {badge.title}
            </p>
            {badge.description && (
              <p className={cx("mt-2 text-sm leading-6", text.secondary)}>
                {badge.description}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className={cx("mt-3 text-sm leading-6", text.muted)}>
          {resultCopy.badgeEmptyText}
        </p>
      )}
    </AppCard>
  );
}
