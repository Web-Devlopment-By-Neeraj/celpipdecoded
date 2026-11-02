"use client";

import Link from "next/link";
import { cx } from "@/features/design/design-tokens";
import type { AppNavIconName } from "@/features/navigation/app-nav-items";
import { AppNavIcon } from "./AppNavIcon";

// Bottom tab bar for phones (DESIGN.md, mobile navigation).
//
// Shared by the signed in app and the public site so both feel like the
// same installed app. Hidden from the lg breakpoint, where the sidebar or
// the header takes over. globals.css reserves room for it under the page
// and lifts the assistant button above it, keyed on data-mobile-tab-bar.
//
// A tab is a link, or a button when it opens something on the page (the
// More sheet). The active tab gets a soft emerald pill behind its icon
// and aria-current="page".

export type MobileTab = {
  key: string;
  label: string;
  icon: AppNavIconName;
  active: boolean;
  href?: string;
  onClick?: () => void;
  tourId?: string;
  ariaControls?: string;
  ariaExpanded?: boolean;
};

const tabClass =
  "flex h-16 flex-col items-center justify-center gap-1 rounded-xl text-[0.6875rem] font-semibold leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-academy-blue";

function TabContent({ tab }: { tab: MobileTab }) {
  return (
    <>
      <span
        className={cx(
          "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
          tab.active
            ? "bg-academy-blue-soft text-academy-blue"
            : "text-academy-navy/55",
        )}
      >
        <AppNavIcon name={tab.icon} className="h-[1.375rem] w-[1.375rem]" />
      </span>
      <span
        className={cx(
          "max-w-full truncate px-0.5",
          tab.active ? "text-academy-navy" : "text-academy-navy/60",
        )}
      >
        {tab.label}
      </span>
    </>
  );
}

export function MobileTabBar({
  tabs,
  label,
}: {
  tabs: readonly MobileTab[];
  label: string;
}) {
  return (
    <nav
      aria-label={label}
      data-mobile-tab-bar=""
      className="fixed inset-x-0 bottom-0 z-40 border-t border-academy-line bg-academy-paper/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_-18px_rgb(18_49_79/0.35)] backdrop-blur-md lg:hidden"
    >
      <ul
        className="mx-auto grid max-w-lg px-1"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => (
          <li key={tab.key} className="min-w-0">
            {tab.href ? (
              <Link
                href={tab.href}
                onClick={tab.onClick}
                data-tour={tab.tourId}
                aria-current={tab.active ? "page" : undefined}
                className={tabClass}
              >
                <TabContent tab={tab} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={tab.onClick}
                data-tour={tab.tourId}
                aria-controls={tab.ariaControls}
                aria-expanded={tab.ariaExpanded}
                className={cx(tabClass, "w-full")}
              >
                <TabContent tab={tab} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
