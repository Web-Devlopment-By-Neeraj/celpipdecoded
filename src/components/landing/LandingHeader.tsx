"use client";

import Link from "next/link";
import { useState } from "react";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";

const navLinks = [
  { label: "The method", href: "#program" },
  { label: "AI practice", href: "#ai-practice" },
  { label: "Live classes", href: "#live-classes" },
  { label: "Pricing", href: "#pricing" },
];

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-cream/10 bg-ink/95 text-cream backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:h-20 sm:px-8">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex min-w-0 items-center gap-3"
        >
          <CelpipDecodedLogo tone="reversed" size="md" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-cream/80 transition-colors hover:text-cream"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden h-10 items-center justify-center rounded-full px-4 text-sm font-semibold text-cream transition-colors hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-full bg-brand px-4 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark sm:px-5"
          >
            Get started
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cream transition-colors hover:bg-cream/10 lg:hidden"
          >
            <span className="sr-only">
              {menuOpen ? "Close menu" : "Open menu"}
            </span>
            {menuOpen ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M3 5.5h14M3 10h14M3 14.5h14" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-cream/10 bg-ink px-5 pb-6 pt-2 lg:hidden"
        >
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="border-b border-cream/10 py-4 text-base font-medium text-cream/85 transition-colors hover:text-cream"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={closeMenu}
              className="py-4 text-base font-medium text-cream/85 transition-colors hover:text-cream sm:hidden"
            >
              Sign in
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
