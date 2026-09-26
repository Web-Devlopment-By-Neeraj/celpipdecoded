import { AppBadgeIcon } from "@/components/app/AppBadgeIcon";
import { AppCard } from "@/components/app/AppCard";
import { cx, text } from "@/features/design/design-tokens";
import { writingResultCopy } from "@/features/writing/task-copy";

// Badge information shown with a writing feedback report.
//
// The slug is the stored badge_slug from the attempt score. It only
// selects artwork, the visible wording still uses the communicator
// labels from writing-level-badges.
export type EarnedWritingBadge = {
  title: string;
  description: string | null;
  slug?: string | null;
};

// Practice badge section for the writing result page. Shows the earned
// badge artwork, title and description, or a subtle note when no badge
// exists yet for the attempt.
export function WritingBadgeDisplayCard({
  badge,
}: {
  badge: EarnedWritingBadge | null;
}) {
  return (
    <AppCard as="section" ariaLabel={writingResultCopy.badgeHeading}>
      <h2 className={cx(text.heading, "text-xl")}>
        {writingResultCopy.badgeHeading}
      </h2>

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
          {writingResultCopy.badgeEmptyText}
        </p>
      )}
    </AppCard>
  );
}
