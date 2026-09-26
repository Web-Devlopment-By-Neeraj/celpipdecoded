import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  cx,
  type ButtonSize,
  type ButtonVariant,
} from "@/features/design/design-tokens";

// Shared button.
//
// The project had no button component, so the same pill classes were
// pasted into every form and card. This centralizes them. It is a plain
// component with no state, so it works inside a client component and
// stays out of the way of the server components that only render links.
//
// Pass loadingText together with isLoading to swap the label while a
// server action or fetch is in flight. The button disables itself while
// loading so a second submit cannot start.

export type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  // Stretches to the container width, useful for stacked mobile forms.
  fullWidth?: boolean;
  children: ReactNode;
};

export function AppButton({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  fullWidth = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: AppButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cx(
        buttonBase,
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth ? "w-full" : "",
        className,
      )}
    >
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}
