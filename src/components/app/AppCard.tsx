import type { ReactNode } from "react";
import { cardStyles, cx, layout, type CardVariant } from "@/features/design/design-tokens";

// Shared card wrapper.
//
// The app repeats the same rounded white panel on nearly every screen.
// This holds that recipe once. Variants:
// - default: white panel, the normal case
// - highlighted: soft blue ring, for the card a learner should act on
// - subtle: tinted panel, for secondary information
// - danger: red tinted panel, for errors and destructive confirmations

export type AppCardProps = {
  children: ReactNode;
  variant?: CardVariant;
  // Renders as a section when an accessible label is supplied, otherwise
  // as a plain div, so the page does not gain unlabelled landmarks.
  as?: "div" | "section" | "article";
  ariaLabel?: string;
  padding?: "default" | "compact" | "none";
  className?: string;
};

export function AppCard({
  children,
  variant = "default",
  as: Element = "div",
  ariaLabel,
  padding = "default",
  className,
}: AppCardProps) {
  const paddingClass =
    padding === "none"
      ? ""
      : padding === "compact"
        ? layout.cardPaddingCompact
        : layout.cardPadding;

  return (
    <Element
      aria-label={ariaLabel}
      className={cx(cardStyles[variant], paddingClass, className)}
    >
      {children}
    </Element>
  );
}
