import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export async function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col overflow-x-clip bg-cream text-ink">
      <SiteHeader />
      <main className="min-w-0 flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
