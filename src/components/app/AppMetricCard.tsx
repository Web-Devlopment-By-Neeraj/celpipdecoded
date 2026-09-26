import type { ReactNode } from "react";
import { AppAssetImage } from "./AppAssetImage";
import { AppStatusBadge } from "./AppStatusBadge";
import { AppCard } from "./AppCard";
import { cx, text } from "@/features/design/design-tokens";
import type { StatusToneName } from "@/features/design/status-styles";

// A single number with its label, for progress summaries and the
// dashboard.
//
// The value slot takes a node rather than a string so a caller can put a
// number next to a small unit, for example 7 next to "out of 12".

export type AppMetricCardProps = {
  label: string;
  value: ReactNode;
  helperText?: string;
  // Short status wording under the value, for example "Ready to review".
  statusText?: string;
  statusTone?: StatusToneName;
  // Optional artwork from the asset registry. Decorative by default, so
  // it carries an empty alt unless iconAlt is supplied.
  iconSrc?: string;
  iconAlt?: string;
  // Any other node to sit beside the label, used when there is no image.
  icon?: ReactNode;
  className?: string;
};

export function AppMetricCard({
  label,
  value,
  helperText,
  statusText,
  statusTone = "neutral",
  iconSrc,
  iconAlt,
  icon,
  className,
}: AppMetricCardProps) {
  return (
    <AppCard padding="compact" className={cx("flex flex-col", className)}>
      <div className="flex items-start justify-between gap-3">
        <p
          className={cx(
            "text-xs font-semibold uppercase tracking-[0.15em]",
            text.muted,
          )}
        >
          {label}
        </p>

        {iconSrc ? (
          <AppAssetImage
            src={iconSrc}
            alt={iconAlt ?? ""}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0"
          />
        ) : (
          icon
        )}
      </div>

      <p
        className={cx(
          "mt-3 font-serif text-3xl font-semibold leading-none",
          text.primary,
        )}
      >
        {value}
      </p>

      {statusText ? (
        <p className="mt-3">
          <AppStatusBadge tone={statusTone}>{statusText}</AppStatusBadge>
        </p>
      ) : null}

      {helperText ? (
        <p className={cx("mt-3 text-xs leading-5", text.muted)}>{helperText}</p>
      ) : null}
    </AppCard>
  );
}
