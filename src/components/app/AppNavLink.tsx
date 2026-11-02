"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx, focus } from "@/features/design/design-tokens";
import {
  isNavItemActive,
  type AppNavItem,
} from "@/features/navigation/app-nav-items";
import { AppNavIcon } from "./AppNavIcon";

// One navigation link, used by the desktop sidebar and the mobile More
// sheet.
//
// The active recipe lives here only, so the two navigations can never
// drift apart. The active item gets the emerald fill plus
// aria-current="page", which is what a screen reader announces.
//
// The sidebar sits on the navy panel, the sheet on a light surface, so
// each variant has its own pair of active and idle styles.
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

const base = "flex items-center gap-3 font-semibold transition-colors";

const variantStyles = {
  sidebar: {
    shape: "h-11 rounded-xl px-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint",
    active: "bg-brand text-white shadow-sm shadow-black/20",
    idle: "text-white/70 hover:bg-white/10 hover:text-white",
    icon: { active: "text-white", idle: "text-white/55" },
    description: { active: "text-white/75", idle: "text-white/50" },
  },
  drawer: {
    shape: `min-h-14 rounded-2xl px-4 py-3 text-base ${focus.ring}`,
    active: "bg-academy-blue-soft text-academy-navy ring-1 ring-academy-blue/30",
    idle: "text-academy-navy/80 hover:bg-academy-navy-soft",
    icon: { active: "text-academy-blue", idle: "text-academy-navy/55" },
    description: { active: "text-academy-navy/65", idle: "text-academy-navy/55" },
  },
} as const;

export function AppNavLink({
  item,
  variant = "sidebar",
  onNavigate,
}: AppNavLinkProps) {
  const pathname = usePathname() ?? "";
  const isActive = isNavItemActive(item, pathname);
  const styles = variantStyles[variant];
  const state = isActive ? "active" : "idle";

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      data-tour={item.tourId}
      aria-current={isActive ? "page" : undefined}
      className={cx(base, styles.shape, styles[state])}
    >
      <AppNavIcon
        name={item.icon}
        className={cx("h-5 w-5 shrink-0", styles.icon[state])}
      />

      <span className="min-w-0">
        <span className="block truncate leading-tight">{item.label}</span>
        {variant === "drawer" ? (
          <span
            className={cx(
              "mt-0.5 block truncate text-xs font-medium",
              styles.description[state],
            )}
          >
            {item.description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
