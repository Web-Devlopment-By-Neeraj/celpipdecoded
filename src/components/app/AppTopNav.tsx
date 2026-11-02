"use client";

import Link from "next/link";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { brandCopy } from "@/features/brand/brand-copy";
import { cx, focus, text } from "@/features/design/design-tokens";
import { requestAppMenu } from "@/features/navigation/app-menu";
import { requestProductTour } from "@/features/navigation/product-tour";
import { AppUserMenu } from "./AppUserMenu";

// Top bar for every signed in screen.
//
// On a phone it carries the logo, the theme switch and the avatar, which
// opens the More sheet. Page links live in the bottom tab bar
// (AppMobileTabBar). On desktop the sidebar already owns the branding and
// the links, so the bar keeps the program line, the tour and the account
// menu.
//
// It is sticky so the account control stays in reach while a page
// scrolls, and pads itself below the notch of an installed app.

const iconButton = cx(
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-academy-line bg-academy-paper text-academy-navy transition-colors hover:bg-academy-navy-soft sm:h-11 sm:w-11",
  focus.ring,
);

function initialFor(userEmail: string) {
  const first = userEmail.trim().charAt(0);
  return first ? first.toUpperCase() : "A";
}

export function AppTopNav({ userEmail }: { userEmail: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-academy-line bg-academy-paper/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-14 w-full items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
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
          <ThemeToggle className={iconButton} />

          <button
            type="button"
            data-tour="tour-button"
            onClick={() => requestProductTour()}
            className={cx(
              "hidden h-11 items-center justify-center rounded-full border border-academy-line bg-academy-paper px-4 text-sm font-semibold text-academy-navy transition-colors hover:bg-academy-navy-soft lg:inline-flex",
              focus.ring,
            )}
          >
            Take a tour
          </button>

          <div className="hidden lg:block" data-tour="account">
            <AppUserMenu userEmail={userEmail} />
          </div>

          <button
            type="button"
            onClick={() => requestAppMenu()}
            aria-label={`Account and more for ${userEmail}`}
            data-tour="account"
            className={cx(
              "inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-sm shadow-brand/20 sm:h-11 sm:w-11 lg:hidden",
              focus.ring,
            )}
          >
            {initialFor(userEmail)}
          </button>
        </div>
      </div>
    </header>
  );
}
