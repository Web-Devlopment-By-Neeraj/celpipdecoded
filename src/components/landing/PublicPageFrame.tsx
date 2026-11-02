import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { SiteHeader } from "./SiteHeader";

// Header and footer around a public page other than the home page (CRS,
// draws, pricing, results, legal ...). The audit found these pages had no
// way back to the rest of the site; each one now gets this frame from its
// own layout.tsx, so the page files themselves are unchanged.

export function PublicPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
