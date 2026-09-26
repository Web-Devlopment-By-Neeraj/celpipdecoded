import type { ReactNode } from "react";
import { cx, layout, text } from "@/features/design/design-tokens";

// Standard layout for a protected page body.
//
// AppShell still owns the frame around the page: navigation, main
// element and footer. This component owns what sits inside it, so every
// screen gets the same title block, the same max width and the same
// vertical rhythm on mobile and desktop.

export type AppPageShellProps = {
  title: string;
  description?: string;
  // Small uppercase label above the title, for example the module name.
  eyebrow?: string;
  // Buttons or links that belong with the title, for example a link to
  // attempt history.
  action?: ReactNode;
  children: ReactNode;
  // Use "narrow" for reading heavy pages such as a feedback report.
  width?: "default" | "narrow";
  className?: string;
};

export function AppPageShell({
  title,
  description,
  eyebrow,
  action,
  children,
  width = "default",
  className,
}: AppPageShellProps) {
  const maxWidth = width === "narrow" ? layout.maxWidthNarrow : "w-full";

  return (
    <div className={cx(maxWidth, className)}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className={text.eyebrow}>{eyebrow}</p> : null}
          <h1
            className={cx(
              text.heading,
              "text-2xl sm:text-3xl",
              eyebrow ? "mt-2" : "",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className={cx("mt-3 max-w-2xl text-sm leading-6", text.secondary)}>
              {description}
            </p>
          ) : null}
        </div>

        {action ? (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {action}
          </div>
        ) : null}
      </header>

      <div className="mt-8 space-y-8">{children}</div>
    </div>
  );
}
