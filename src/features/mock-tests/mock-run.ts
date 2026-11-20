// Shared shape of a saved mock run.
//
// No database client here. Pages, the player and the hub all speak this
// shape, and the store is the only file that talks to Supabase.

export type MockRunMode = "full" | "section";

export type MockRunStatus = "in_progress" | "submitted";

export type MockRunTimer = {
  screenKey: string;
  remainingSeconds: number;
  savedAt: number;
};

export type MockRunSummary = {
  label: string;
  detail: string;
};

export type MockSectionDraft = {
  screenIndex: number;
  answers?: Record<string, string>;
  responses?: Record<string, string>;
  choices?: Record<string, unknown>;
  timer?: MockRunTimer | null;
};

export type MockRunView = {
  id: string;
  slug: string;
  mode: MockRunMode;
  section: string;
  status: MockRunStatus;
  screenIndex: number;
  updatedAt: string;
  summary: MockRunSummary | null;
};

export function mockSlugFromHub(hubPath: string | undefined): string {
  const segment = hubPath?.split("/").filter(Boolean).pop();
  if (segment && /^mock-test-[a-z0-9-]+$/.test(segment)) {
    return segment;
  }
  return "mock-test-1";
}

export function mockSectionHref(
  slug: string,
  section: string,
  mode: MockRunMode,
): string {
  const path = `/dashboard/mock-tests/${slug}/${section}`;
  return mode === "full" ? `${path}?flow=full` : path;
}

export function mockResultsHref(slug: string): string {
  return `/dashboard/mock-tests/${slug}/results`;
}

export function sectionLabel(section: string): string {
  if (!section) return "Section";
  return section.charAt(0).toUpperCase() + section.slice(1);
}
