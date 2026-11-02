import { cx } from "@/features/design/design-tokens";
import { brandCopy } from "@/features/brand/brand-copy";

export type BrandPromiseTaglineTone = "onDark" | "onLight" | "brand";

const toneClasses: Record<BrandPromiseTaglineTone, string> = {
  onDark: "text-cream/55 font-normal",
  onLight: "text-brand-ink/55 font-normal",
  // Same green as the section eyebrows, for the hero lockup.
  brand: "text-brand font-semibold",
};

const dotClasses: Record<BrandPromiseTaglineTone, string> = {
  onDark: "text-brand-teal/70",
  onLight: "text-brand-teal-deep/80",
  brand: "text-brand/60",
};

// Decode · Practice · Succeed — sub-brand line, always smaller than the wordmark.
// compact is the size used under the logo, where it should not run much
// wider than the wordmark above it.
export function BrandPromiseTagline({
  tone = "onDark",
  compact = false,
  className,
}: {
  tone?: BrandPromiseTaglineTone;
  compact?: boolean;
  className?: string;
}) {
  const parts = brandCopy.brandPromiseParts;

  return (
    <p
      className={cx(
        "whitespace-nowrap uppercase leading-none",
        compact
          ? "text-[0.5rem] tracking-[0.14em]"
          : "text-[0.5625rem] tracking-[0.18em] sm:text-[0.625rem] sm:tracking-[0.2em]",
        toneClasses[tone],
        className,
      )}
    >
      {parts.map((word, index) => (
        <span key={word}>
          {index > 0 ? (
            <span
              className={cx(
                "font-light normal-case",
                compact ? "px-1" : "px-1.5",
                dotClasses[tone],
              )}
            >
              ·
            </span>
          ) : null}
          {word}
        </span>
      ))}
    </p>
  );
}
