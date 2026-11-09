import type { AppNavIconName } from "@/features/navigation/app-nav-items";

// Line icons for the signed in navigation and the mobile tab bars.
//
// They are inline SVG on purpose: the nav renders on every protected
// screen, and a few small paths cost less than an image request each.
// Always decorative, the link text carries the meaning.

const PATHS: Record<AppNavIconName, string> = {
  dashboard: "M3.5 3.5h6v6h-6zM12.5 3.5h6v4h-6zM12.5 10.5h6v6h-6zM3.5 12.5h6v4h-6z",
  mockTests:
    "M4 5.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2zM7 9.5h8M7 13h5",
  speaking:
    "M11 2.5a2.5 2.5 0 0 0-2.5 2.5v5a2.5 2.5 0 0 0 5 0V5A2.5 2.5 0 0 0 11 2.5zM5.5 9.5a5.5 5.5 0 0 0 11 0M11 15v3.5M8 18.5h6",
  writing: "M4 16.5 15.5 5a2.1 2.1 0 0 1 3 3L7 19.5l-4 1z",
  courses: "M5 3.5h9a3 3 0 0 1 3 3V18.5H8a3 3 0 0 0-3 3zM5 3.5v15",
  miniCourses: "M4 7.5h14v10H4zM7 7.5V5h8v2.5",
  askAmar: "M4 4.5h14v9H8.5L4 17.5z",
  liveClasses:
    "M2.5 5.5h11v9h-11zM13.5 9l5-3v8l-5-3z",
  more: "M4 6.5h14M4 11h14M4 15.5h14",
  home: "M3.5 10 11 3.5l7.5 6.5M5.5 8.5v10h11v-10M9 18.5v-5h4v5",
  results:
    "M11 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L11 15.4l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z",
  calculator:
    "M5.5 2.5h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1zM7.5 5.5h7v3h-7zM7.5 12h1M10.5 12h1M13.5 12h1M7.5 15.5h1M10.5 15.5h1M13.5 15.5h1",
  pricing: "M3.5 3.5h7.6l8 8-7.6 7.6-8-8zM7.4 7.4h.6",
  account: "M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM3.5 19.5a7.5 7.5 0 0 1 15 0",
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
