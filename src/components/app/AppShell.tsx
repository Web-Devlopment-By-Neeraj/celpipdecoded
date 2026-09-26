import type { ReactNode } from "react";
import { BrandDisclaimer } from "@/components/brand/BrandDisclaimer";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";
import { AppBreadcrumbs } from "./AppBreadcrumbs";
import { AppShellFrame } from "./AppShellFrame";
import { AppSideNav } from "./AppSideNav";
import { AppTopNav } from "./AppTopNav";

// Frame for every signed in screen.
//
// It replaces DashboardShell, which had a single header row and no
// navigation. The layout is a two column grid on desktop, sidebar plus
// content, and a single column with a drawer on mobile.
//
// The content column carries min-w-0 so a wide table or a long
// transcript scrolls inside its own container instead of pushing the
// page sideways.
//
// Exam mode (EXAM-15F, second QA pass). One kind of route does not get any
// of the above: a route a learner sits a test on has to fill the browser
// window and show nothing else. The decision needs the pathname, which a
// layout cannot see, so the arrangement of the chrome moved into
// AppShellFrame, a client component that reads the pathname and returns
// either the frame below or the page on its own. This component keeps what
// it always owned, which is which pieces the chrome is made of, and every
// one of them stays a server component because they are passed to the
// frame as elements.
//
// The list of exam mode routes is in
// src/features/navigation/exam-mode-routes.ts and holds exactly one entry:
// the full Mock Test 1 Listening route. The six internal part routes under
// it keep their dashboard chrome on purpose.

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: ReactNode;
}) {
  return (
    <AppShellFrame
      sideNav={<AppSideNav />}
      topNav={<AppTopNav userEmail={userEmail} />}
      breadcrumbs={<AppBreadcrumbs />}
      footer={<AppShellFooter />}
    >
      {children}
    </AppShellFrame>
  );
}

// Split out so the frame can be handed one element rather than a block of
// markup. Nothing else renders it.
//
// BRAND-01: the footer carries the CELPIP Decoded lockup and the one
// legal disclaimer, so every signed in screen shows it once.
function AppShellFooter() {
  return (
    <footer className="border-t border-academy-line bg-academy-paper">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <CelpipDecodedLogo size="sm" />
        <BrandDisclaimer className="mt-3" />
      </div>
    </footer>
  );
}
