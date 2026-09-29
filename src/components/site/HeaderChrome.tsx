"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/app/SignOutButton";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";
import type { SiteUser } from "@/features/public-site/session";
import { signupStarted } from "@/features/public-site/analytics";

export type NavLabel = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export function HeaderChrome({
  user,
  labels,
}: {
  user: SiteUser | null;
  labels: NavLabel[];
}) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const initial = (user?.name ?? "A").slice(0, 1).toUpperCase();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    function onPointer(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node) && event.target !== menuButtonRef.current) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-8">
        <Link href="/" className="shrink-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          <CelpipDecodedLogo size="sm" />
        </Link>
        <nav aria-label="Main" className="ml-4 hidden items-center gap-4 lg:flex">
          {labels.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className="text-sm font-semibold text-ink/80 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/book"
            className="hidden min-h-11 items-center rounded-full px-3 text-sm font-semibold text-ink sm:inline-flex"
          >
            Book a call
          </Link>
          {user ? (
            <AccountMenu
              name={user.name}
              initial={initial}
              open={accountOpen}
              onToggle={() => setAccountOpen((value) => !value)}
              onClose={() => setAccountOpen(false)}
            />
          ) : (
            <>
              <Link href="/login" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-ink">
                Sign in
              </Link>
              <Link
                href="/signup?source=header"
                onClick={() => {
                  const event = signupStarted("header");
                  void fetch("/api/analytics", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify(event),
                  });
                }}
                className="inline-flex min-h-11 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white"
              >
                Sign up
              </Link>
            </>
          )}
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full ring-1 ring-ink/15 lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <div id={menuId} ref={panelRef} className="border-t border-ink/10 bg-cream px-4 py-4 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {labels.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center text-base font-semibold"
                onClick={() => {
                  setOpen(false);
                  menuButtonRef.current?.focus();
                }}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/book" className="flex min-h-11 items-center text-base font-semibold" onClick={() => setOpen(false)}>
              Book a free strategy call
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function AccountMenu({
  name,
  initial,
  open,
  onToggle,
  onClose,
}: {
  name: string;
  initial: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const menuId = useId();
  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 ring-1 ring-ink/15"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            onToggle();
          }
          if (event.key === "Escape") onClose();
        }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-semibold text-cream">
          {initial}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-semibold sm:inline">{name}</span>
      </button>
      {open ? (
        <div id={menuId} role="menu" className="absolute right-0 z-50 mt-2 w-56 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-ink/10">
          <Link role="menuitem" href="/dashboard" className="block rounded-xl px-3 py-3 text-sm font-semibold" onClick={onClose}>
            Dashboard
          </Link>
          <Link role="menuitem" href="/dashboard/settings" className="block rounded-xl px-3 py-3 text-sm font-semibold" onClick={onClose}>
            Account settings
          </Link>
          <SignOutButton fullWidth onSignOut={onClose} />
        </div>
      ) : null}
    </div>
  );
}
