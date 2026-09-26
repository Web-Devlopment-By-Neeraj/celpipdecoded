import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/features/design/design-tokens";
import {
  playerButtonBase,
  playerButtonCase,
  playerButtonSizes,
  playerButtonVariants,
} from "@/features/exam-engine/mock-test-player-theme";
import type {
  ExamButtonSize,
  ExamButtonVariant,
} from "@/features/exam-engine/exam-shell-types";

// The one button style inside the mock test player (EXAM-UI-02).
//
// Square cornered, compact, and uppercase by default for the navigation
// labels. It is deliberately not the pill shaped brand button the
// dashboard and the landing page use: a control inside a test window
// should read as part of a testing application rather than as a call to
// action.
//
// href and onClick are both accepted, because the player drives some
// moves by route and some by client state. A disabled link is rendered as
// a span with aria-disabled, since an anchor cannot be disabled and
// removing the href would leave nothing for a screen reader to announce.

export type MockTestButtonProps = {
  variant?: ExamButtonVariant;
  size?: ExamButtonSize;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  uppercase?: boolean;
  fullWidth?: boolean;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
};

export function MockTestButton({
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled = false,
  type = "button",
  uppercase = true,
  fullWidth = false,
  ariaLabel,
  className,
  children,
}: MockTestButtonProps) {
  const classes = cx(
    playerButtonBase,
    playerButtonVariants[variant],
    playerButtonSizes[size],
    uppercase ? playerButtonCase : "",
    fullWidth ? "w-full" : "",
    className,
  );

  if (href && !disabled) {
    return (
      <Link href={href} aria-label={ariaLabel} className={classes}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <span
        aria-disabled="true"
        aria-label={ariaLabel}
        className={cx(classes, "cursor-not-allowed opacity-55")}
      >
        {children}
      </span>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={classes}
    >
      {children}
    </button>
  );
}
