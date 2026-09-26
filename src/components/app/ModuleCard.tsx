import { AppModuleCard } from "./AppModuleCard";
import { toneFromModuleStatus } from "@/features/design/status-styles";

export type Module = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  sort_order: number;
};

// Maps module slugs to their app routes. Modules without a route here are
// shown as coming soon even if marked active in the database.
const moduleRoutes: Record<string, string> = {
  "celpip-speaking": "/dashboard/speaking",
  "celpip-writing": "/dashboard/writing",
};

// Card for a practice module. Active modules link into the module, coming
// soon modules render as a disabled preview.
//
// The visual card now lives in AppModuleCard, which pulls the module
// icon from the asset registry. This wrapper keeps the module row to
// card mapping, so the dashboard page did not have to change.
export function ModuleCard({ module }: { module: Module }) {
  const href = moduleRoutes[module.slug];
  const isActive = module.status === "active" && Boolean(href);

  return (
    <AppModuleCard
      slug={module.slug}
      title={module.title}
      description={module.description}
      href={isActive ? href : undefined}
      statusLabel={isActive ? "Active" : "Coming soon"}
      statusTone={toneFromModuleStatus(module.status, Boolean(href))}
    />
  );
}
