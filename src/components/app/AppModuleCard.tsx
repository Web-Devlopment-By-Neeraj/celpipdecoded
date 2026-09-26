import { AppAssetImage } from "./AppAssetImage";
import { AppButtonLink } from "./AppButtonLink";
import { AppCard } from "./AppCard";
import { AppStatusBadge } from "./AppStatusBadge";
import { cx, text } from "@/features/design/design-tokens";
import type { StatusToneName } from "@/features/design/status-styles";
import { getModuleAsset } from "@/features/assets/module-asset-map";

// Card for a practice module: Speaking, Writing, Reading, Listening and
// Live Classes.
//
// The icon comes from module-asset-map.ts, which resolves any slug to
// normalized square WebP artwork with a fallback, so an unmapped module
// still renders. The card never depends on hover to communicate state,
// the status pill and the action carry that on touch screens too.

export type AppModuleCardProps = {
  // Module slug from the modules table, for example "celpip-speaking".
  slug: string;
  title: string;
  description?: string | null;
  // Route into the module. Omit for a module that is not available yet.
  href?: string;
  statusLabel: string;
  statusTone?: StatusToneName;
  // Available when the module is not open yet, for example
  // "Coming soon".
  unavailableLabel?: string;
  // Short number or note, for example "3 feedback reports".
  metric?: string;
  ctaLabel?: string;
  className?: string;
};

export function AppModuleCard({
  slug,
  title,
  description,
  href,
  statusLabel,
  statusTone = "neutral",
  unavailableLabel = "Coming soon",
  metric,
  ctaLabel = "Open module",
  className,
}: AppModuleCardProps) {
  const asset = getModuleAsset(slug);
  const isAvailable = Boolean(href);

  return (
    <AppCard
      as="article"
      padding="compact"
      className={cx("flex flex-col", isAvailable ? "" : "opacity-80", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <AppAssetImage
            src={asset.icon}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-xl object-contain"
          />
          <h3 className={cx(text.heading, "min-w-0 text-lg")}>{title}</h3>
        </div>

        <AppStatusBadge tone={statusTone} className="shrink-0">
          {statusLabel}
        </AppStatusBadge>
      </div>

      {description ? (
        <p className={cx("mt-3 text-sm leading-6", text.secondary)}>
          {description}
        </p>
      ) : null}

      {metric ? (
        <p className={cx("mt-3 text-xs font-semibold", text.muted)}>{metric}</p>
      ) : null}

      <div className="mt-auto pt-5">
        {href ? (
          <AppButtonLink href={href} size="md">
            {ctaLabel}
          </AppButtonLink>
        ) : (
          <span
            className={cx(
              "inline-flex h-11 items-center justify-center rounded-full border border-academy-navy/10 bg-academy-navy-soft/60 px-6 text-sm font-semibold",
              text.muted,
            )}
          >
            {unavailableLabel}
          </span>
        )}
      </div>
    </AppCard>
  );
}
