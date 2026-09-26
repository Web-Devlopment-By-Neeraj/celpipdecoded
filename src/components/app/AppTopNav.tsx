"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";
import { brandCopy } from "@/features/brand/brand-copy";
import { cx, focus, text } from "@/features/design/design-tokens";
import { AppMobileNav } from "./AppMobileNav";
import { AppUserMenu } from "./AppUserMenu";

// Top bar for every signed in screen.
//
// On mobile it carries the branding, the menu button and the drawer. On
// desktop the sidebar already owns the branding and the links, so the
// bar keeps only the program name and the account menu.
//
// It is sticky so the account control and the menu button stay in reach
// while a page scrolls.

const MOBILE_NAV_ID = "app-mobile-nav";

export function AppTopNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname() ?? "";

  // The drawer records the route it was opened on instead of a plain
  // boolean. A route change then closes it during render, with no effect
  // writing state, which also covers back and forward navigation.
  const [openedOnPath, setOpenedOnPath] = useState<string | null>(null);
  const isMenuOpen = openedOnPath !== null && openedOnPath === pathname;

  function closeMenu() {
    setOpenedOnPath(null);
  }

  function toggleMenu() {
    setOpenedOnPath(isMenuOpen ? null : pathname);
  }

  // Escape closes the drawer, and the page behind it should not scroll
  // while it is open.
  useEffect(() => {
    if (!isMenuOpen) return;

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
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-academy-line bg-academy-paper">
      <div className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className={cx(
            "flex min-w-0 items-center gap-2.5 rounded-full py-1 pr-2 lg:hidden",
            focus.ring,
          )}
        >
          <CelpipDecodedLogo size="sm" />
        </Link>

        <p
          className={cx(
            "hidden min-w-0 truncate text-sm font-semibold lg:block",
            text.secondary,
          )}
        >
          {brandCopy.tagline}
        </p>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden lg:block">
            <AppUserMenu userEmail={userEmail} />
          </div>

          <button
            type="button"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
            aria-expanded={isMenuOpen}
            aria-controls={MOBILE_NAV_ID}
            className={cx(
              "inline-flex h-11 w-11 items-center justify-center rounded-full border border-academy-line bg-academy-paper text-academy-navy transition-colors hover:bg-academy-navy-soft lg:hidden",
              focus.ring,
            )}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {isMenuOpen ? (
                <path d="M5 5l10 10M15 5L5 15" />
              ) : (
                <path d="M3 5.5h14M3 10h14M3 14.5h14" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AppMobileNav
        id={MOBILE_NAV_ID}
        isOpen={isMenuOpen}
        userEmail={userEmail}
        onClose={closeMenu}
      />
    </header>
  );
}
