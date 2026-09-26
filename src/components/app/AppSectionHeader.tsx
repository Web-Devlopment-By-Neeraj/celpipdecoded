import type { ReactNode } from "react";
import { cx, text } from "@/features/design/design-tokens";

// Heading block for a section inside a page.
//
// Kept separate from AppPageShell so a page can hold several sections
// without repeating heading sizes and spacing. The heading level is
// configurable so a section nested under an h2 can render an h3 and keep
// the document outline correct.

export type AppSectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  as?: "h2" | "h3";
  className?: string;
};

export function AppSectionHeader({
  title,
  description,
  eyebrow,
  action,
  as: Heading = "h2",
  className,
}: AppSectionHeaderProps) {
  return (
    <div
      className={cx(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? <p className={text.eyebrow}>{eyebrow}</p> : null}
        <Heading
          className={cx(
            text.heading,
            Heading === "h2" ? "text-xl" : "text-lg",
            eyebrow ? "mt-2" : "",
          )}
        >
          {title}
        </Heading>
        {description ? (
          <p className={cx("mt-2 max-w-2xl text-sm leading-6", text.secondary)}>
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {action}
        </div>
      ) : null}
    </div>
  );
}
