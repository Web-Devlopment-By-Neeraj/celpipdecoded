"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx, focus } from "@/features/design/design-tokens";
import {
  isNavItemActive,
  type AppNavItem,
} from "@/features/navigation/app-nav-items";
import { AppNavIcon } from "./AppNavIcon";

// One navigation link, used by the desktop sidebar and the mobile
// drawer.
//
// The active recipe lives here only, so the two navigations can never
// drift apart. The active item gets navy on white text plus
// aria-current="page", which is what a screen reader announces.
//
// The drawer variant is taller and shows the supporting line, because a
// touch target needs the room and a phone has no hover state to fall
// back on.

export type AppNavLinkProps = {
  item: AppNavItem;
  variant?: "sidebar" | "drawer";
  // Lets the drawer close itself when a link is followed.
  onNavigate?: () => void;
};

const base = `flex items-center gap-3 font-semibold transition-colors ${focus.ring}`;

const variantStyles = {
  sidebar: "h-11 rounded-full px-4 text-sm",
  drawer: "min-h-14 rounded-2xl px-4 py-3 text-base",
} as const;

const activeStyles = "bg-academy-navy text-white";
const idleStyles =
  "text-academy-navy/75 hover:bg-academy-navy-soft hover:text-academy-navy";

export function AppNavLink({
  item,
  variant = "sidebar",
  onNavigate,
}: AppNavLinkProps) {
  const pathname = usePathname() ?? "";
  const isActive = isNavItemActive(item, pathname);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cx(
        base,
        variantStyles[variant],
        isActive ? activeStyles : idleStyles,
      )}
    >
      <AppNavIcon name={item.icon} className="h-5 w-5 shrink-0" />

      <span className="min-w-0">
        <span className="block truncate leading-tight">{item.label}</span>
        {variant === "drawer" ? (
          <span
            className={cx(
              "mt-0.5 block truncate text-xs font-medium",
              isActive ? "text-white/75" : "text-academy-navy/55",
            )}
          >
            {item.description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
