// Single source of truth for the signed in navigation.
//
// The sidebar, the mobile drawer and the breadcrumbs all read from this
// list, so a route only ever has to be described once.
//
// Live classes, mini-courses, and Ask Amar are pages inside the app.
// Speaking and Writing stay separate. See docs/product/app-shell-navigation.md.

export type AppNavIconName =
  | "dashboard"
  | "mockTests"
  | "speaking"
  | "writing"
  | "courses"
  | "miniCourses"
  | "askAmar"
  | "liveClasses"
  // Tab bar only.
  | "more"
  | "home"
  | "results"
  | "calculator"
  | "pricing"
  | "account";

// Sidebar group headings. Items without a group sit at the top.
export type AppNavGroup = "practice" | "learn";

export const APP_NAV_GROUP_LABELS: Record<AppNavGroup, string> = {
  practice: "Practice",
  learn: "Learn with Amar",
};

export type AppNavItem = {
  label: string;
  // One word label for the mobile bottom tab bar.
  shortLabel: string;
  group?: AppNavGroup;
  // Shown as a tab in the mobile bottom bar. The rest live under More.
  inTabBar?: boolean;
  href: string;
  icon: AppNavIconName;
  // Supporting line shown in the mobile drawer only.
  description: string;
  // True when the destination sits outside the signed in app. These
  // items never take the active style.
  leavesApp?: boolean;
  // Marks the link for the product tour highlight.
  tourId?: string;
};

export const APP_NAV_ITEMS: readonly AppNavItem[] = [
  {
    label: "Dashboard",
    shortLabel: "Home",
    inTabBar: true,
    href: "/dashboard",
    icon: "dashboard",
    description: "Your practice modules and progress",
    tourId: "nav-dashboard",
  },
  {
    label: "Mock tests",
    shortLabel: "Mocks",
    group: "practice",
    inTabBar: true,
    href: "/dashboard/mock-tests",
    icon: "mockTests",
    description: "Full mocks and section practice",
    tourId: "nav-mock-tests",
  },
  {
    label: "Speaking practice",
    shortLabel: "Speaking",
    group: "practice",
    inTabBar: true,
    href: "/dashboard/speaking",
    icon: "speaking",
    description: "Timed speaking tasks and feedback",
    tourId: "nav-speaking",
  },
  {
    label: "Writing practice",
    shortLabel: "Writing",
    group: "practice",
    inTabBar: true,
    href: "/dashboard/writing",
    icon: "writing",
    description: "Timed writing tasks and feedback",
    tourId: "nav-writing",
  },
  {
    label: "Courses",
    shortLabel: "Courses",
    group: "learn",
    href: "/dashboard/courses",
    icon: "courses",
    description: "Video lessons, your progress, and lesson comments",
    tourId: "nav-courses",
  },
  {
    label: "1:1 with Amar",
    shortLabel: "1:1",
    group: "learn",
    href: "/dashboard/live-classes",
    icon: "liveClasses",
    description: "Choose a time, then pay",
    tourId: "nav-live",
  },
  {
    label: "Mini-courses",
    shortLabel: "Minis",
    group: "learn",
    href: "/dashboard/mini-courses",
    icon: "miniCourses",
    description: "Short lessons, coming soon",
    tourId: "nav-mini-courses",
  },
  {
    label: "Ask Amar",
    shortLabel: "Ask",
    group: "learn",
    href: "/dashboard/ask",
    icon: "askAmar",
    description: "Practice questions, and Amar for your account",
    tourId: "nav-ask",
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
  "mock-tests": "Mock tests",
  speaking: "Speaking practice",
  writing: "Writing practice",
  courses: "Courses",
  "live-classes": "1:1 with Amar",
  "mini-courses": "Mini-courses",
  ask: "Ask Amar",
  attempts: "Attempt history",
  practice: "Practice",
  tasks: "Task",
};

export type AppBreadcrumb = {
  label: string;
  href: string;
  isCurrent: boolean;
};

// Turns /dashboard/writing/attempts into a crumb trail. Segments that
// are record ids get a generic label, so no identifier is printed in the
// UI.
function breadcrumbLabel(segment: string, segments: string[]): string {
  const mockTest = /^mock-test-(\d+)$/.exec(segment);

  if (mockTest) {
    return `Mock Test ${mockTest[1]}`;
  }

  const insideMock = segments.some((part) => part.startsWith("mock-test-"));

  if (insideMock && segment === "full") {
    return "Complete test";
  }

  if (
    insideMock &&
    (segment === "listening" ||
      segment === "reading" ||
      segment === "writing" ||
      segment === "speaking")
  ) {
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }

  return SEGMENT_LABELS[segment] ?? "Details";
}

export function buildBreadcrumbs(pathname: string): AppBreadcrumb[] {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;

    return {
      label: breadcrumbLabel(segment, segments),
      href,
      isCurrent: index === segments.length - 1,
    };
  });
}