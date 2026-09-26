import { cx } from "@/features/design/design-tokens";
import { BRAND_DISCLAIMER } from "@/features/brand/brand-copy";

// The one legal disclaimer, in one component (BRAND-01).
//
// It is rendered once per surface, in the footer, so a learner sees it on
// the public site and on every signed in screen without it being repeated
// beside every score. Result screens keep their own short practice
// estimate line instead.
//
// Two tones, matching the logo: light for the app's pale surfaces and
// reversed for the navy footer on the public site.

export type BrandDisclaimerTone = "light" | "reversed";

const toneStyles: Record<BrandDisclaimerTone, string> = {
  light: "text-academy-navy/55",
  reversed: "text-cream/60",
};

export function BrandDisclaimer({
  tone = "light",
  className,
}: {
  tone?: BrandDisclaimerTone;
  className?: string;
}) {
  return (
    <p className={cx("text-xs leading-5", toneStyles[tone], className)}>
      {BRAND_DISCLAIMER}
    </p>
  );
}
