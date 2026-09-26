import { cx, progress, text } from "@/features/design/design-tokens";
import { formatPercent, toPercent } from "@/features/design/formatters";

// Accessible progress bar.
//
// The bar exposes real values through the progressbar role, so assistive
// technology announces "7 of 12" rather than a bare percentage. The fill
// is clamped by toPercent, so an out of range value cannot overflow the
// track.

export type AppProgressBarProps = {
  value: number;
  max: number;
  // Required. Used as the accessible name for the bar.
  label: string;
  // Renders the label above the bar. Turn off when the surrounding card
  // heading already says the same thing.
  showLabel?: boolean;
  helperText?: string;
  showPercent?: boolean;
  tone?: "brand" | "accent";
  size?: "sm" | "md";
  className?: string;
};

export function AppProgressBar({
  value,
  max,
  label,
  showLabel = true,
  helperText,
  showPercent = false,
  tone = "brand",
  size = "md",
  className,
}: AppProgressBarProps) {
  const percent = toPercent(value, max);
  const safeValue = Math.min(Math.max(value, 0), max);

  return (
    <div className={className}>
      {showLabel || showPercent ? (
        <div className="flex items-baseline justify-between gap-3">
          {showLabel ? (
            <span className={cx("text-sm font-medium", text.secondary)}>
              {label}
            </span>
          ) : (
            <span />
          )}
          {showPercent ? (
            <span className={cx("text-xs font-semibold", text.muted)}>
              {formatPercent(value, max)}
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={safeValue}
        aria-valuetext={`${Math.round(safeValue)} of ${max}`}
        className={cx(
          progress.track,
          size === "sm" ? "h-1.5" : "h-2",
          showLabel || showPercent ? "mt-2" : "",
        )}
      >
        <div
          className={tone === "accent" ? progress.fillAccent : progress.fill}
          style={{ width: `${percent}%` }}
        />
      </div>

      {helperText ? (
        <p className={cx("mt-2 text-xs leading-5", text.muted)}>{helperText}</p>
      ) : null}
    </div>
  );
}
