import Link from "next/link";
import type { ReactNode } from "react";
import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  cx,
  type ButtonSize,
  type ButtonVariant,
} from "@/features/design/design-tokens";

// A link that looks like a button.
//
// Navigation must stay a link so it keeps middle click, open in new tab
// and the correct role for screen readers. It shares the button recipes
// from design-tokens so the two never drift apart.

export type AppButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  // Set when the destination is outside the app.
  external?: boolean;
  className?: string;
  children: ReactNode;
};

export function AppButtonLink({
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  external = false,
  className,
  children,
}: AppButtonLinkProps) {
  const classes = cx(
    buttonBase,
    buttonVariants[variant],
    buttonSizes[size],
    fullWidth ? "w-full" : "",
    className,
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
