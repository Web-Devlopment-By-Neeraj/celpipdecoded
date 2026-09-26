import { AppAssetImage } from "@/components/app/AppAssetImage";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { dashboardAssets } from "@/features/assets/asset-registry";
import { brandCopy } from "@/features/brand/brand-copy";
import { cx, text } from "@/features/design/design-tokens";
import {
  dashboardCopy,
  dashboardRoutes,
  getGreetingName,
  PROGRAM_NAME,
} from "@/features/dashboard/dashboard-copy";

// Welcome hero at the top of the learner dashboard.
//
// Presentation only. The greeting name is derived from the signed in
// email by the copy helper, which returns an empty string for anything
// that is not plainly a name, so a role address is never shown back.
//
// The primary action points at the recommended module rather than a
// fixed route, so the first thing a learner can click is the same thing
// the recommendation card suggests.

export type DashboardHeroProps = {
  userEmail: string | null;
  // True once the learner has any saved practice, which switches the
  // greeting and the supporting message.
  hasPractice: boolean;
  continueHref: string;
  continueLabel: string;
};

export function DashboardHero({
  userEmail,
  hasPractice,
  continueHref,
  continueLabel,
}: DashboardHeroProps) {
  const name = getGreetingName(userEmail);
  const greeting = hasPractice
    ? dashboardCopy.heroGreetingReturning
    : dashboardCopy.heroGreetingNew;

  return (
    <AppCard as="section" ariaLabel={dashboardCopy.pageTitle}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className={text.eyebrow}>{PROGRAM_NAME}</p>

          <h1 className={cx(text.heading, "mt-2 text-2xl sm:text-3xl")}>
            {name ? `${greeting}, ${name}` : greeting}
          </h1>

          <p className={cx("mt-3 max-w-xl text-sm leading-6", text.secondary)}>
            {hasPractice
              ? dashboardCopy.heroMessageReturning
              : dashboardCopy.heroMessageNew}
          </p>

          <p
            className={cx(
              "mt-4 inline-flex items-center gap-2 rounded-full bg-academy-blue-soft px-3 py-1 text-xs font-semibold",
              text.accent,
            )}
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
            {brandCopy.communityName}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AppButtonLink href={continueHref} size="lg">
              {continueLabel || dashboardCopy.heroPrimaryAction}
            </AppButtonLink>
            <AppButtonLink
              href={dashboardRoutes.speakingHistory}
              variant="secondary"
              size="lg"
            >
              {dashboardCopy.heroSecondaryAction}
            </AppButtonLink>
          </div>
        </div>

        {/* The single above the fold image on this page, so it is the
            only one that preloads. */}
        <AppAssetImage
          src={dashboardAssets.studyHero}
          alt={dashboardCopy.heroImageAlt}
          width={320}
          height={320}
          priority
          sizes="(min-width: 640px) 240px, 160px"
          className="mx-auto h-40 w-40 shrink-0 object-contain sm:mx-0 sm:h-56 sm:w-56"
        />
      </div>
    </AppCard>
  );
}
