"use client";

import { useSyncExternalStore } from "react";
import { cx } from "@/features/design/design-tokens";
import {
  THEME_COLORS,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/features/theme/theme";

// Light / dark switch (DESIGN.md).
//
// Every toggle on the page reads the same store, so the header button,
// the mobile More sheet and the design guide never disagree. The server
// snapshot is "light" because the server cannot see the saved choice; the
// boot script has already set the attribute, and React swaps to the real
// value right after hydration without a mismatch warning.

const THEME_EVENT = "celpip-theme-change";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.dataset.theme = "dark";
  } else {
    delete root.dataset.theme;
  }
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
}

function subscribe(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key !== THEME_STORAGE_KEY) return;
    applyTheme(event.newValue === "dark" ? "dark" : "light");
    onChange();
  }

  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setTheme(theme: Theme) {
  applyTheme(theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode can refuse storage; the theme still applies for this visit.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "light");
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="3.4" />
      <path d="M10 2.2v1.6M10 16.2v1.6M2.2 10h1.6M16.2 10h1.6M4.5 4.5l1.1 1.1M14.4 14.4l1.1 1.1M4.5 15.5l1.1-1.1M14.4 5.6l1.1-1.1" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16.5 12.3A6.8 6.8 0 0 1 7.7 3.5a6.8 6.8 0 1 0 8.8 8.8z" />
    </svg>
  );
}

export function ThemeToggle({
  className,
  showLabel = false,
}: {
  className?: string;
  // Shows "Dark theme" beside the icon, for menus and sheets.
  showLabel?: boolean;
}) {
  const theme = useTheme();
  const isDark = theme === "dark";
  const Icon = isDark ? SunIcon : MoonIcon;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-pressed={isDark}
      aria-label={showLabel ? undefined : "Dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cx("inline-flex items-center justify-center gap-2", className)}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {showLabel ? <span>Dark theme</span> : null}
    </button>
  );
}
