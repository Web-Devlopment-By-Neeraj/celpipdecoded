import Link from "next/link";
import type { ReactNode } from "react";
import { BRAND_NAME } from "@/features/brand/brand-copy";
import { cx, text } from "@/features/design/design-tokens";

// Heading block for an admin builder screen.
//
// The learner side has AppPageShell, which is tuned for a study screen:
// large serif title, generous spacing, a description that reads as
// encouragement. An authoring tool wants the opposite, so this is a
// tighter header with a breadcrumb trail, because the builder is four
// levels deep and a staff member needs to know where they are.

export type AdminBreadcrumb = {
  label: string;
  // Omit on the current page, which renders as plain text.
  href?: string;
};

// BRAND-01: the instructor and admin side is branded too, so a staff
// screen reads as part of the same product.
const ADMIN_EYEBROW = BRAND_NAME + " admin";

export type AdminPageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumbs?: AdminBreadcrumb[];
  // Buttons or links that belong with the title.
  action?: ReactNode;
  children?: ReactNode;
};

export function AdminPageHeader({
  title,
  description,
  eyebrow = ADMIN_EYEBROW,
  breadcrumbs,
  action,
  children,
}: AdminPageHeaderProps) {
  return (
    <header className="border-b border-academy-line pb-6">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                {index > 0 ? (
                  <span aria-hidden className={text.muted}>
                    /
                  </span>
                ) : null}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className={cx(
                      "font-medium underline underline-offset-2 hover:no-underline",
                      text.accent,
                    )}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={cx("font-medium", text.muted)} aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className={text.eyebrow}>{eyebrow}</p>
          <h1 className={cx(text.heading, "mt-2 text-2xl sm:text-3xl")}>
            {title}
          </h1>
          {description ? (
            <p className={cx("mt-3 max-w-2xl text-sm leading-6", text.secondary)}>
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-4">{children}</div> : null}
        </div>

        {action ? (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {action}
          </div>
        ) : null}
      </div>
    </header>
  );
}
