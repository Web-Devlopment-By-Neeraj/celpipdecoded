"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  APP_NAV_ITEMS,
  isNavItemActive,
} from "@/features/navigation/app-nav-items";
import { APP_MENU_EVENT } from "@/features/navigation/app-menu";
import { AppMobileNav } from "./AppMobileNav";
import { MobileTabBar, type MobileTab } from "./MobileTabBar";

// The signed in bottom tab bar: Home, Mocks, Speaking, Writing, More.
//
// More opens AppMobileNav as a bottom sheet with the remaining pages, the
// account, the theme switch and the tour. The avatar in the top bar opens
// the same sheet through requestAppMenu().

const SHEET_ID = "app-mobile-more";

export function AppMobileTabBar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname() ?? "";

  // The sheet records the route it was opened on instead of a plain
  // boolean. A route change then closes it during render, with no effect
  // writing state, which also covers back and forward navigation.
  const [openedOnPath, setOpenedOnPath] = useState<string | null>(null);
  const isOpen = openedOnPath !== null && openedOnPath === pathname;

  useEffect(() => {
    function open() {
      setOpenedOnPath(window.location.pathname);
    }
    window.addEventListener(APP_MENU_EVENT, open);
    return () => window.removeEventListener(APP_MENU_EVENT, open);
  }, []);

  // Escape closes the sheet, and the page behind it should not scroll
  // while it is open.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenedOnPath(null);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const tabItems = APP_NAV_ITEMS.filter((item) => item.inTabBar);
  const moreItems = APP_NAV_ITEMS.filter((item) => !item.inTabBar);
  const moreRouteActive = moreItems.some((item) =>
    isNavItemActive(item, pathname),
  );

  const tabs: MobileTab[] = [
    ...tabItems.map((item) => ({
      key: item.href,
      label: item.shortLabel,
      icon: item.icon,
      href: item.href,
      active: !isOpen && isNavItemActive(item, pathname),
      tourId: item.tourId,
    })),
    {
      key: "more",
      label: "More",
      icon: "more",
      active: isOpen || moreRouteActive,
      onClick: () => setOpenedOnPath(isOpen ? null : pathname),
      tourId: "app-menu",
      ariaControls: SHEET_ID,
      ariaExpanded: isOpen,
    },
  ];

  return (
    <>
      <MobileTabBar tabs={tabs} label="App" />
      <AppMobileNav
        id={SHEET_ID}
        isOpen={isOpen}
        userEmail={userEmail}
        items={moreItems}
        onClose={() => setOpenedOnPath(null)}
      />
    </>
  );
}
