import type { AppNavIconName } from "@/features/navigation/app-nav-items";

// Line icons for the signed in navigation.
//
// They are inline SVG on purpose: the nav renders on every protected
// screen, and four small paths cost less than an image request each.
// Always decorative, the link text carries the meaning.

const PATHS: Record<AppNavIconName, string> = {
  dashboard: "M3.5 3.5h6v6h-6zM12.5 3.5h6v4h-6zM12.5 10.5h6v6h-6zM3.5 12.5h6v4h-6z",
  speaking:
    "M11 2.5a2.5 2.5 0 0 0-2.5 2.5v5a2.5 2.5 0 0 0 5 0V5A2.5 2.5 0 0 0 11 2.5zM5.5 9.5a5.5 5.5 0 0 0 11 0M11 15v3.5M8 18.5h6",
  writing: "M4 16.5 15.5 5a2.1 2.1 0 0 1 3 3L7 19.5l-4 1z",
  liveClasses:
    "M2.5 5.5h11v9h-11zM13.5 9l5-3v8l-5-3z",
};

export function AppNavIcon({
  name,
  className,
}: {
  name: AppNavIconName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
