import { cx } from "@/features/design/design-tokens";
import { brandCopy } from "@/features/brand/brand-copy";

export type BrandPromiseTaglineTone = "onDark" | "onLight";

const toneClasses: Record<BrandPromiseTaglineTone, string> = {
  onDark: "text-cream/55",
  onLight: "text-brand-ink/55",
};

const dotClasses: Record<BrandPromiseTaglineTone, string> = {
  onDark: "text-brand-teal/70",
  onLight: "text-brand-teal-deep/80",
};

// Decode · Practice · Succeed — sub-brand line, always smaller than the wordmark.
export function BrandPromiseTagline({
  tone = "onDark",
  className,
}: {
  tone?: BrandPromiseTaglineTone;
  className?: string;
}) {
  const parts = brandCopy.brandPromiseParts;

  return (
    <p
      className={cx(
        "text-[0.5625rem] font-normal uppercase leading-none tracking-[0.18em] sm:text-[0.625rem] sm:tracking-[0.2em]",
        toneClasses[tone],
        className,
      )}
    >
      {parts.map((word, index) => (
        <span key={word}>
          {index > 0 ? (
            <span className={cx("px-1.5 font-light normal-case", dotClasses[tone])}>
              ·
            </span>
          ) : null}
          {word}
        </span>
      ))}
    </p>
  );
}
