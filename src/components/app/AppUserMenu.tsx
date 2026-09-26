"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cx, focus, radius, text } from "@/features/design/design-tokens";
import { SignOutButton } from "./SignOutButton";

// Account area for the signed in shell.
//
// The audit found that a learner on a phone could not confirm which
// account they were in, so the email is never hidden behind hover here:
//
// - "menu" is the desktop dropdown in the top bar, opened by click and
//   closed by Escape or an outside click
// - "panel" is the always open block at the top of the mobile drawer
//
// The email arrives as a prop from the server layout, which already
// resolved the session. No Supabase call happens in this component
// beyond the existing sign out.

export type AppUserMenuProps = {
  userEmail: string;
  variant?: "menu" | "panel";
};

function initialFor(userEmail: string) {
  const first = userEmail.trim().charAt(0);
  return first ? first.toUpperCase() : "A";
}

function AccountIdentity({ userEmail }: { userEmail: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-academy-navy text-sm font-semibold text-white"
      >
        {initialFor(userEmail)}
      </span>
      <span className="min-w-0">
        <span className={cx("block text-xs font-semibold", text.muted)}>
          Signed in
        </span>
        <span
          className={cx(
            "block truncate text-sm font-semibold",
            text.primary,
          )}
        >
          {userEmail}
        </span>
      </span>
    </div>
  );
}

export function AppUserMenu({
  userEmail,
  variant = "menu",
}: AppUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Only subscribes while the dropdown is open. State changes happen in
  // the listeners, never in the effect body.
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (variant === "panel") {
    return (
      <div className={cx(radius.panel, "bg-academy-navy-soft/60 p-4")}>
        <AccountIdentity userEmail={userEmail} />
        <div className="mt-4">
          <SignOutButton size="md" fullWidth />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Account menu for ${userEmail}`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cx(
          "flex h-11 max-w-[16rem] items-center gap-2 rounded-full border border-academy-line bg-academy-paper pl-1.5 pr-3 transition-colors hover:bg-academy-navy-soft",
          focus.ring,
        )}
      >
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-academy-navy text-xs font-semibold text-white"
        >
          {initialFor(userEmail)}
        </span>
        <span
          className={cx(
            "hidden min-w-0 truncate text-sm font-semibold lg:block",
            text.primary,
          )}
        >
          {userEmail}
        </span>
        <svg
          className={cx(
            "h-4 w-4 shrink-0 text-academy-navy/60 transition-transform",
            isOpen ? "rotate-180" : "",
          )}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 6.5 8 10.5l4-4" />
        </svg>
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        className={cx(
          "absolute right-0 top-full z-40 mt-2 w-72 border border-academy-line bg-academy-paper p-4 shadow-md",
          radius.panel,
        )}
      >
        <AccountIdentity userEmail={userEmail} />
        <div className="mt-4">
          <SignOutButton
            size="md"
            fullWidth
            onSignOut={() => setIsOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
