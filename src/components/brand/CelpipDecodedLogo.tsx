import { cx } from "@/features/design/design-tokens";
import { BRAND_NAME } from "@/features/brand/brand-copy";

// CELPIP Decoded logo (BRAND-01).
//
// The mark from the brand brief: two code brackets with a solved centre
// dot. The brackets carry the "decoded" idea, the dot is the answer that
// falls into place once a candidate knows what CELPIP is asking for.
//
// Drawn as inline SVG and text, so there is no image request, no raster
// asset to keep in sync, and nothing that can 404 on a demo machine. It
// scales with its size prop rather than with a fixed pixel width.
//
// No official CELPIP logo, no Paragon or Prometric mark, and no other
// brand's artwork appears here or anywhere near it.
//
// Two tones:
//
//   light     ink navy brackets and wordmark, for a light surface
//   reversed  off-white brackets and wordmark, for the navy surfaces
//
// The centre dot is teal in both, a lighter teal on navy so it keeps its
// contrast against the dark ground.

export type CelpipDecodedLogoTone = "light" | "reversed";
export type CelpipDecodedLogoSize = "sm" | "md" | "lg";

export type CelpipDecodedLogoProps = {
  tone?: CelpipDecodedLogoTone;
  size?: CelpipDecodedLogoSize;
  // Set false for a mark on its own, for example a compact mobile bar.
  showWordmark?: boolean;
  className?: string;
};

const markSizes: Record<CelpipDecodedLogoSize, string> = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

const wordSizes: Record<CelpipDecodedLogoSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const gapSizes: Record<CelpipDecodedLogoSize, string> = {
  sm: "gap-2",
  md: "gap-2.5",
  lg: "gap-3",
};

const toneStyles: Record<
  CelpipDecodedLogoTone,
  { mark: string; frame: string; word: string; accent: string; dot: string }
> = {
  light: {
    mark: "text-brand-ink",
    frame: "bg-brand-offwhite",
    word: "text-brand-ink",
    accent: "text-brand-teal-deep",
    dot: "#0e9f6e",
  },
  reversed: {
    mark: "text-brand-offwhite",
    frame: "bg-white/10",
    word: "text-brand-offwhite",
    accent: "text-brand-teal",
    dot: "#5ad3a4",
  },
};

export function CelpipDecodedLogo({
  tone = "light",
  size = "md",
  showWordmark = true,
  className,
}: CelpipDecodedLogoProps) {
  const styles = toneStyles[tone];

  return (
    <span
      className={cx("inline-flex items-center", gapSizes[size], className)}
      // The wordmark is real text when it is shown, so the label is only
      // needed for the mark on its own.
      aria-label={showWordmark ? undefined : BRAND_NAME}
      role={showWordmark ? undefined : "img"}
    >
      <span
        aria-hidden={showWordmark ? true : undefined}
        className={cx(
          "inline-flex shrink-0 items-center justify-center rounded-xl",
          markSizes[size],
          styles.frame,
          styles.mark,
        )}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="h-[72%] w-[72%]"
          aria-hidden="true"
        >
          {/* Left and right code brackets. */}
          <path
            d="M11.5 5.5H7.5a2 2 0 0 0-2 2v6.2a2 2 0 0 1-2 2 2 2 0 0 1 2 2v6.8a2 2 0 0 0 2 2h4"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.5 5.5h4a2 2 0 0 1 2 2v6.2a2 2 0 0 0 2 2 2 2 0 0 0-2 2v6.8a2 2 0 0 1-2 2h-4"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* The solved centre dot. */}
          <circle cx="16" cy="16" r="3.6" fill={styles.dot} />
        </svg>
      </span>

      {showWordmark ? (
        <span
          className={cx(
            "min-w-0 truncate font-semibold leading-tight tracking-tight",
            wordSizes[size],
            styles.word,
          )}
        >
          CELPIP <span className={styles.accent}>Decoded</span>
        </span>
      ) : null}
    </span>
  );
}
