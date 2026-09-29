// Single source of truth for the signed in navigation.
//
// The sidebar, the mobile drawer and the breadcrumbs all read from this
// list, so a route only ever has to be described once.
//
// Live classes has no route inside /dashboard yet. The public program
// page already has a live classes section, so the item points there
// instead of inventing a new feature. See
// docs/product/app-shell-navigation.md.

export type AppNavIconName =
  | "dashboard"
  | "speaking"
  | "writing"
  | "liveClasses"
  | "practice"
  | "mocks"
  | "courses"
  | "mini"
  | "ask"
  | "performance"
  | "templates"
  | "settings";

export type AppNavItem = {
  label: string;
  href: string;
  icon: AppNavIconName;
  // Supporting line shown in the mobile drawer only.
  description: string;
  // True when the destination sits outside the signed in app. These
  // items never take the active style.
  leavesApp?: boolean;
};

export const APP_NAV_ITEMS: readonly AppNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    description: "Countdown, evaluations left, and your next step",
  },
  {
    label: "Practice",
    href: "/dashboard/practice",
    icon: "practice",
    description: "Writing and speaking tasks",
  },
  {
    label: "Speaking practice",
    href: "/dashboard/speaking",
    icon: "speaking",
    description: "Timed speaking tasks and feedback",
  },
  {
    label: "Writing practice",
    href: "/dashboard/writing",
    icon: "writing",
    description: "Timed writing tasks and feedback",
  },
  {
    label: "Mock tests",
    href: "/dashboard/mocks",
    icon: "mocks",
    description: "Start a mock in Practice or Test mode",
  },
  {
    label: "Courses",
    href: "/dashboard/courses",
    icon: "courses",
    description: "Lessons in English and Hindi",
  },
  {
    label: "Mini-courses",
    href: "/dashboard/mini-courses",
    icon: "mini",
    description: "Short lessons for one skill",
  },
  {
    label: "Live classes",
    href: "/dashboard/live",
    icon: "liveClasses",
    description: "Strategy call, private hour, and batches",
  },
  {
    label: "Ask Amar",
    href: "/dashboard/ask",
    icon: "ask",
    description: "A question, with a reply in your account",
  },
  {
    label: "Performance",
    href: "/dashboard/performance",
    icon: "performance",
    description: "Practice estimates over time",
  },
  {
    label: "My answers",
    href: "/dashboard/answers",
    icon: "writing",
    description: "Every attempt, replayable",
  },
  {
    label: "Templates",
    href: "/dashboard/templates",
    icon: "templates",
    description: "Answer shapes by plan",
  },
  {
    label: "Account settings",
    href: "/dashboard/settings",
    icon: "settings",
    description: "Profile, plan, language, and your data",
  },
] as const;

// Active when the current path is the item itself or a page nested under
// it. Dashboard matches exactly, otherwise it would stay active on every
// screen.
export function isNavItemActive(item: AppNavItem, pathname: string): boolean {
  if (item.leavesApp) return false;
  if (item.href === "/dashboard") return pathname === "/dashboard";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

// Labels for path segments, used by the breadcrumb trail.
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  speaking: "Speaking practice",
  writing: "Writing practice",
  attempts: "Attempt history",
  practice: "Practice",
  tasks: "Task",
  mocks: "Mock tests",
  courses: "Courses",
  "mini-courses": "Mini-courses",
  live: "Live classes",
  ask: "Ask Amar",
  performance: "Performance",
  answers: "My answers",
  templates: "Templates",
  settings: "Account settings",
};

export type AppBreadcrumb = {
  label: string;
  href: string;
  isCurrent: boolean;
};

// Turns /dashboard/writing/attempts into a crumb trail. Segments that
// are record ids get a generic label, so no identifier is printed in the
// UI.
export function buildBreadcrumbs(pathname: string): AppBreadcrumb[] {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;

    return {
      label: SEGMENT_LABELS[segment] ?? "Details",
      href,
      isCurrent: index === segments.length - 1,
    };
  });
}
