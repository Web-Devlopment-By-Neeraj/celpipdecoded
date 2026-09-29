"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV_ITEMS, isNavItemActive } from "@/features/navigation/app-nav-items";

// Phone sidebar: a row that scrolls inside itself so the page does not.
export function AppMobileNavRow() {
  const pathname = usePathname() ?? "";
  return (
    <nav aria-label="App sections" className="flex gap-2 overflow-x-auto px-4 py-2 lg:hidden">
      {APP_NAV_ITEMS.map((item) => {
        const active = isNavItemActive(item, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-semibold ring-1 ring-academy-navy/15"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
