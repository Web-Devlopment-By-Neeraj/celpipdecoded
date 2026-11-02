"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PublicMobileTabBar } from "./PublicMobileTabBar";

// Header for the public site (DESIGN.md, public header).
//
// Light, translucent and sticky, as in the client mockup. The links use
// absolute paths ("/#program") so the same header works on every public
// page, not only the home page. On a phone the main pages live in the
// bottom tab bar this header renders, and the menu button opens the
// remaining links.

// inBar: shown in the desktop bar. The rest stay in the menu and the
// footer, so the bar never wraps.
const navLinks = [
  { label: "The method", href: "/#program", inBar: true },
  { label: "Results", href: "/results", inBar: true },
  { label: "AI practice", href: "/#ai-practice", inBar: false },
  { label: "Live classes", href: "/#live-classes", inBar: true },
  { label: "CRS calculator", href: "/crs", inBar: true },
  { label: "Draws", href: "/draws", inBar: false },
  { label: "Pricing", href: "/pricing", inBar: true },
];

const iconButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-academy-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function LandingHeader({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname() ?? "";

  // Recorded against the route it was opened on, so following a link
  // closes the menu without an effect.
  const [openedOnPath, setOpenedOnPath] = useState<string | null>(null);
  const menuOpen = openedOnPath === pathname;

  function closeMenu() {
    setOpenedOnPath(null);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:h-[4.5rem] sm:px-8">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {/* The promise line needs room beside the header buttons:
                380px with just the menu button, 410px once Get started
                shows. Narrower phones get the plain logo, and under
                360px just the mark. Literal class strings so Tailwind
                generates them. */}
            <span className="min-[360px]:hidden">
              <CelpipDecodedLogo size="sm" showWordmark={false} />
            </span>
            <span
              className={
                signedIn
                  ? "hidden min-[360px]:block min-[380px]:hidden"
                  : "hidden min-[360px]:block min-[410px]:hidden"
              }
            >
              <CelpipDecodedLogo size="sm" />
            </span>
            <span
              className={
                signedIn
                  ? "hidden min-[380px]:block sm:hidden"
                  : "hidden min-[410px]:block sm:hidden"
              }
            >
              <CelpipDecodedLogo size="sm" showPromiseBelow />
            </span>
            <span className="hidden sm:block">
              <CelpipDecodedLogo size="md" showPromiseBelow />
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {navLinks.filter((link) => link.inBar).map((link) => {
              const current = link.href === pathname;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  className={
                    current
                      ? "whitespace-nowrap rounded-full bg-academy-navy-soft px-3 py-2 text-sm font-semibold text-ink"
                      : "whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-academy-navy-soft hover:text-ink"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden sm:block">
              <ThemeToggle className={iconButton} />
            </span>
            {signedIn ? (
              // Below lg the bottom tab bar already has Dashboard.
              <Link
                href="/dashboard"
                className="hidden h-10 items-center justify-center whitespace-nowrap rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-sm shadow-brand/25 transition-colors hover:bg-brand-dark lg:inline-flex"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden h-10 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm font-semibold text-ink transition-colors hover:bg-academy-navy-soft sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full bg-brand px-4 text-sm font-semibold text-white shadow-sm shadow-brand/25 transition-colors hover:bg-brand-dark sm:px-5"
                >
                  Get started
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpenedOnPath(menuOpen ? null : pathname)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className={`${iconButton} lg:hidden`}
            >
              <span className="sr-only">
                {menuOpen ? "Close menu" : "Open menu"}
              </span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path d="M5 5l10 10M15 5L5 15" />
                ) : (
                  <path d="M3 5.5h14M3 10h14M3 14.5h14" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-4.5rem-env(safe-area-inset-top))] overflow-y-auto border-y border-ink/10 bg-white px-5 pb-6 pt-2 shadow-xl shadow-brand-ink/10 motion-safe:animate-fade-up lg:hidden"
          >
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="flex min-h-12 items-center justify-between border-b border-ink/10 py-3 text-base font-medium text-ink/85 transition-colors hover:text-ink"
                  >
                    {link.label}
                    <span aria-hidden className="text-ink/35">→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-1">
              <ThemeToggle
                showLabel
                className="inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-ink ring-1 ring-ink/15 transition-colors hover:bg-academy-navy-soft sm:hidden"
              />
              {signedIn ? null : (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-ink ring-1 ring-ink/15 transition-colors hover:bg-academy-navy-soft sm:hidden"
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        ) : null}
      </header>
      <PublicMobileTabBar signedIn={signedIn} />
    </>
  );
}
