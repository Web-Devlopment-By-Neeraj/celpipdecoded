"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx, focus, text } from "@/features/design/design-tokens";
import { buildBreadcrumbs } from "@/features/navigation/app-nav-items";

// Breadcrumb trail above the page body.
//
// The audit found learners lost their place inside the attempt and
// result screens, which sit three levels deep. The trail is derived from
// the path, so a new route under /dashboard gets one without extra work.
//
// Nothing renders on /dashboard itself, a single crumb pointing at the
// current page is noise. Nor on a page whose hero already carries its own
// Back to dashboard link, where the trail would only repeat it.
const PATHS_WITH_OWN_BACK_LINK = new Set([
  "/dashboard/writing",
  "/dashboard/speaking",
]);

export function AppBreadcrumbs() {
  const pathname = usePathname() ?? "";
  const crumbs = buildBreadcrumbs(pathname);

  if (crumbs.length < 2) return null;
  const path = pathname.replace(/\/+$/, "");
  if (PATHS_WITH_OWN_BACK_LINK.has(path)) return null;
  // The course player has its own "All courses" link.
  if (path.startsWith("/dashboard/courses/")) return null;
  // Task and practice pages already have their own back link. The trail
  // above them only repeats Dashboard / Speaking practice / Task.
  if (
    path.startsWith("/dashboard/speaking/tasks/") ||
    path.startsWith("/dashboard/writing/tasks/") ||
    path.startsWith("/dashboard/speaking/practice/") ||
    path.startsWith("/dashboard/writing/practice/")
  ) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium">
        {crumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden className="text-academy-navy/30">
                /
              </span>
            ) : null}

            {crumb.isCurrent ? (
              <span
                aria-current="page"
                className={cx("font-semibold", text.primary)}
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className={cx(
                  "rounded-full transition-colors hover:text-academy-navy",
                  text.muted,
                  focus.ring,
                )}
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
