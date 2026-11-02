import Link from "next/link";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";
import { AppNavLink } from "./AppNavLink";
import { brandCopy } from "@/features/brand/brand-copy";
import {
  APP_NAV_GROUP_LABELS,
  APP_NAV_ITEMS,
  type AppNavGroup,
  type AppNavItem,
} from "@/features/navigation/app-nav-items";

// Desktop sidebar. Hidden below the lg breakpoint, where the bottom tab
// bar and the More sheet take over.
//
// It is the navy panel from DESIGN.md: the one dark structural surface
// of the light theme, with the emerald active item.
//
// It sticks to the viewport so the learner keeps the same navigation
// while a long attempt history scrolls next to it. Only the nav list
// scrolls if it ever outgrows the screen, the brand stays put.

const GROUP_ORDER: readonly AppNavGroup[] = ["practice", "learn"];

function NavList({ items }: { items: readonly AppNavItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.href}>
          <AppNavLink item={item} />
        </li>
      ))}
    </ul>
  );
}

export function AppSideNav() {
  const ungrouped = APP_NAV_ITEMS.filter((item) => !item.group);

  return (
    <aside className="hidden w-64 shrink-0 bg-navy-panel text-white lg:block xl:w-72">
      <div className="sticky top-0 flex h-screen flex-col gap-5 px-4 pb-6">
        {/* Same height as the top bar (AppTopNav, h-16 at lg), so the logo
            shares its centre line with the bar beside it. */}
        <div className="flex h-16 shrink-0 items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint"
          >
            <CelpipDecodedLogo tone="reversed" size="md" />
          </Link>
        </div>

        <nav aria-label="Main" className="min-h-0 flex-1 space-y-6 overflow-y-auto">
          <NavList items={ungrouped} />

          {GROUP_ORDER.map((group) => (
            <div key={group}>
              <p className="px-3.5 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-white/40">
                {APP_NAV_GROUP_LABELS[group]}
              </p>
              <NavList
                items={APP_NAV_ITEMS.filter((item) => item.group === group)}
              />
            </div>
          ))}
        </nav>

        <p className="rounded-xl bg-white/5 px-3.5 py-3 text-xs leading-5 text-white/55 ring-1 ring-white/10">
          {brandCopy.practiceEstimateLine}
        </p>
      </div>
    </aside>
  );
}
