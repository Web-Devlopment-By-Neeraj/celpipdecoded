"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cx, surface } from "@/features/design/design-tokens";
import { isExamModeRoute } from "@/features/navigation/exam-mode-routes";

// Chooses the frame a signed in route gets (EXAM-15F, second QA pass).
//
// Two frames, and the pathname picks between them:
//
// - the ordinary app frame, which is the sidebar, the top bar with the
//   account menu, the breadcrumb trail, the padded and width capped
//   content column, and the footer
// - exam mode, which is the page and nothing else. No chrome is rendered
//   at all, no page padding is applied, and no width cap is imposed, so a
//   test can fill the browser window
//
// It is a client component only because a layout cannot see the pathname
// and a client component can. usePathname resolves during the server
// render of a client component too, so the correct frame is in the first
// HTML the browser receives and no chrome flashes before hydration.
//
// The chrome is passed in as elements rather than imported, so the pieces
// stay server components and this file gains no knowledge of navigation,
// branding or the user. In exam mode those elements are simply not
// returned. They cost a little payload and render nothing.
//
// Children appear in both branches and are rendered once, because only one
// branch is returned. Writing it this way rather than wrapping the chrome
// around a shared child slot is what keeps the page out of the RSC payload
// twice.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type AppShellFrameProps = {
  sideNav: ReactNode;
  topNav: ReactNode;
  breadcrumbs: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

export function AppShellFrame({
  sideNav,
  topNav,
  breadcrumbs,
  footer,
  children,
}: AppShellFrameProps) {
  const pathname = usePathname() ?? "";

  // Exam mode. The route renders its own viewport, which is fixed and one
  // window tall, so this returns the page bare: no wrapper with a page
  // background to show through, no main element with padding to inset the
  // test, and no max width to hold it in a column.
  if (isExamModeRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className={cx("flex min-h-screen", surface.page)}>
      {sideNav}

      <div className="flex min-w-0 flex-1 flex-col">
        {topNav}

        <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto w-full max-w-5xl">
            {breadcrumbs}
            {children}
          </div>
        </main>

        {footer}
      </div>
    </div>
  );
}
