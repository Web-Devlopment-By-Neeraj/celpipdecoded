"use client";

import { useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cx, focus, text } from "@/features/design/design-tokens";
import type { AppNavItem } from "@/features/navigation/app-nav-items";
import { requestProductTour } from "@/features/navigation/product-tour";
import { AppNavLink } from "./AppNavLink";
import { AppUserMenu } from "./AppUserMenu";

// The mobile More sheet, opened from the bottom tab bar or the avatar in
// the top bar.
//
// It slides up from the bottom so it opens under the thumb that tapped
// More. The account block sits at the top because the audit found
// learners could not confirm which account they were signed in to on a
// phone. Below it: the pages that are not tabs, then the theme switch and
// the tour.

export type AppMobileNavProps = {
  isOpen: boolean;
  userEmail: string;
  items: readonly AppNavItem[];
  onClose: () => void;
  // Ties the sheet back to the More tab that controls it.
  id: string;
};

const rowButton = cx(
  "inline-flex h-12 w-full items-center justify-center rounded-full border border-academy-line bg-academy-paper px-4 text-sm font-semibold text-academy-navy transition-colors hover:bg-academy-navy-soft",
  focus.ring,
);

export function AppMobileNav({
  isOpen,
  userEmail,
  items,
  onClose,
  id,
}: AppMobileNavProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      className="fixed inset-0 z-[60] lg:hidden"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close menu"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto overscroll-contain rounded-t-3xl bg-academy-paper px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl ring-1 ring-academy-line motion-safe:animate-sheet-up">
        <div aria-hidden className="mx-auto h-1.5 w-10 rounded-full bg-academy-navy/15" />

        <div className="mt-3 flex items-center justify-between">
          <h2 id={`${id}-title`} className={cx(text.heading, "text-lg")}>
            More
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={cx(
              "inline-flex h-10 w-10 items-center justify-center rounded-full text-academy-navy transition-colors hover:bg-academy-navy-soft",
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
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <div className="mt-4" data-tour="account">
          <AppUserMenu userEmail={userEmail} variant="panel" />
        </div>

        <nav aria-label="More pages" className="mt-5">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.href}>
                <AppNavLink item={item} variant="drawer" onNavigate={onClose} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <ThemeToggle showLabel className={rowButton} />
          <button
            type="button"
            className={rowButton}
            onClick={() => {
              onClose();
              requestProductTour();
            }}
          >
            Take a tour
          </button>
        </div>

        <p className={cx("mt-5 text-xs leading-5", text.muted)}>
          Practice feedback supports your preparation. It is not an
          official CELPIP score.
        </p>
      </div>
    </div>
  );
}
