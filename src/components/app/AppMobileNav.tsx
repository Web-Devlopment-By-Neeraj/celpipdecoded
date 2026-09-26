"use client";

import { cx, text } from "@/features/design/design-tokens";
import { APP_NAV_ITEMS } from "@/features/navigation/app-nav-items";
import { AppNavLink } from "./AppNavLink";
import { AppUserMenu } from "./AppUserMenu";

// Mobile drawer, opened from the menu button in AppTopNav.
//
// It fills the screen under the header rather than floating in a corner,
// which keeps every tap target large and removes any need for hover. The
// account block sits at the top because the audit found learners could
// not confirm which account they were signed in to on a phone.
//
// It is rendered inside the header element, directly after the toggle
// button, so Tab moves from the button straight into the drawer.

export type AppMobileNavProps = {
  isOpen: boolean;
  userEmail: string;
  onClose: () => void;
  // Ties the drawer back to the button that controls it.
  id: string;
};

export function AppMobileNav({
  isOpen,
  userEmail,
  onClose,
  id,
}: AppMobileNavProps) {
  if (!isOpen) return null;

  return (
    <div
      id={id}
      className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain border-t border-academy-line bg-academy-paper lg:hidden"
    >
      <div className="mx-auto w-full max-w-2xl px-5 py-6">
        <AppUserMenu userEmail={userEmail} variant="panel" />

        <nav aria-label="Main" className="mt-6">
          <ul className="space-y-2">
            {APP_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <AppNavLink
                  item={item}
                  variant="drawer"
                  onNavigate={onClose}
                />
              </li>
            ))}
          </ul>
        </nav>

        <p className={cx("mt-6 text-xs leading-5", text.muted)}>
          Practice feedback supports your preparation. It is not an
          official CELPIP score.
        </p>
      </div>
    </div>
  );
}
