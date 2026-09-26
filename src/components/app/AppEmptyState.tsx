import type { ReactNode } from "react";
import { AppAssetImage } from "./AppAssetImage";
import { AppCard } from "./AppCard";
import { cx, text } from "@/features/design/design-tokens";

// Shared empty state.
//
// The app repeats the same centered panel wherever there is no data yet.
// The image is optional and should come from emptyStateAssets in the
// asset registry, which already points at optimized WebP files.

export type AppEmptyStateProps = {
  title: string;
  description?: string;
  // A button or link, usually the next step the learner should take.
  action?: ReactNode;
  imageSrc?: string;
  // Leave empty when the image only decorates the panel and the title
  // already carries the meaning.
  imageAlt?: string;
  className?: string;
};

export function AppEmptyState({
  title,
  description,
  action,
  imageSrc,
  imageAlt = "",
  className,
}: AppEmptyStateProps) {
  return (
    <AppCard className={cx("text-center", className)}>
      {imageSrc ? (
        <AppAssetImage
          src={imageSrc}
          alt={imageAlt}
          width={200}
          height={200}
          className="mx-auto mb-5 h-32 w-32 object-contain sm:h-40 sm:w-40"
        />
      ) : null}

      <h2 className={cx(text.heading, "text-xl")}>{title}</h2>

      {description ? (
        <p
          className={cx(
            "mx-auto mt-3 max-w-md text-sm leading-6",
            text.secondary,
          )}
        >
          {description}
        </p>
      ) : null}

      {action ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
        </div>
      ) : null}
    </AppCard>
  );
}
