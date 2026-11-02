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
  | "mockTests"
  | "speaking"
  | "writing"
  | "courses"
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
    description: "Course lessons and the locked preview",
    tourId: "nav-courses",
  },
  {
    label: "Live classes",
    shortLabel: "Live",
    group: "learn",
    href: "/#live-classes",
    icon: "liveClasses",
    description: "Class options on the program page",
    leavesApp: true,
    tourId: "nav-live",
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