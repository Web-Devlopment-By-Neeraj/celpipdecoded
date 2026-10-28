// Mock Test 1 full-run routing and player context (Task 5).
//
// Section practice: /dashboard/mock-tests/mock-test-1/listening
// Full mock:       /dashboard/mock-tests/mock-test-1/full → four sections
//                  in order with ?flow=full on each section URL.

import {
  MOCK_TEST_1_HUB_PATH,
  MOCK_TEST_1_SECTION_PATHS,
} from "./mock-test-1-routes";

export const MOCK_TEST_FLOW_QUERY = "flow";
export const MOCK_TEST_FULL_FLOW_VALUE = "full";

export const MOCK_TEST_FULL_PREP_SECONDS = 10;

export const MOCK_TEST_1_SECTION_ORDER = [
  "listening",
  "reading",
  "writing",
  "speaking",
] as const;

export type MockTestSectionSlug = (typeof MOCK_TEST_1_SECTION_ORDER)[number];

export type MockTestFlowMode = "section" | "full";

export type MockTestPlayerContext = {
  flow: MockTestFlowMode;
  hubPath: string;
  exitHref: string;
  section: MockTestSectionSlug;
  nextSection?: {
    slug: MockTestSectionSlug;
    href: string;
    label: string;
  };
  isLastSectionInFullMock: boolean;
};

const SECTION_LABELS: Record<MockTestSectionSlug, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export function parseMockTestFlowMode(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): MockTestFlowMode {
  const raw = searchParams?.[MOCK_TEST_FLOW_QUERY];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === MOCK_TEST_FULL_FLOW_VALUE ? "full" : "section";
}

export function withMockTestFlowQuery(
  path: string,
  mode: MockTestFlowMode,
): string {
  if (mode !== "full") return path;
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}${MOCK_TEST_FLOW_QUERY}=${MOCK_TEST_FULL_FLOW_VALUE}`;
}

export function sectionPath(
  slug: MockTestSectionSlug,
  mode: MockTestFlowMode = "section",
): string {
  return withMockTestFlowQuery(MOCK_TEST_1_SECTION_PATHS[slug], mode);
}

export function buildMockTestPlayerContext(
  section: MockTestSectionSlug,
  mode: MockTestFlowMode,
): MockTestPlayerContext {
  const index = MOCK_TEST_1_SECTION_ORDER.indexOf(section);
  const nextSlug =
    mode === "full" && index >= 0 && index < MOCK_TEST_1_SECTION_ORDER.length - 1
      ? MOCK_TEST_1_SECTION_ORDER[index + 1]
      : undefined;

  return {
    flow: mode,
    hubPath: MOCK_TEST_1_HUB_PATH,
    exitHref: MOCK_TEST_1_HUB_PATH,
    section,
    nextSection: nextSlug
      ? {
          slug: nextSlug,
          href: sectionPath(nextSlug, "full"),
          label: SECTION_LABELS[nextSlug],
        }
      : undefined,
    isLastSectionInFullMock: mode === "full" && section === "speaking",
  };
}

export const MOCK_TEST_1_FULL_RESULTS_STORAGE_KEY =
  "celpip-mock-test-1-full-results";

export type MockTestFullSectionResult = {
  label: string;
  detail?: string;
};

export type MockTestFullResultsSnapshot = {
  sections: MockTestFullSectionResult[];
  completedAt?: string;
};

export function readMockTestFullResults(): MockTestFullResultsSnapshot {
  if (typeof window === "undefined") {
    return { sections: [] };
  }
  try {
    const raw = window.sessionStorage.getItem(
      MOCK_TEST_1_FULL_RESULTS_STORAGE_KEY,
    );
    if (!raw) return { sections: [] };
    return JSON.parse(raw) as MockTestFullResultsSnapshot;
  } catch {
    return { sections: [] };
  }
}

export function appendMockTestFullSectionResult(
  entry: MockTestFullSectionResult,
): void {
  if (typeof window === "undefined") return;
  const current = readMockTestFullResults();
  const sections = [...current.sections, entry];
  window.sessionStorage.setItem(
    MOCK_TEST_1_FULL_RESULTS_STORAGE_KEY,
    JSON.stringify({
      sections,
      completedAt: current.completedAt,
    } satisfies MockTestFullResultsSnapshot),
  );
}

export function markMockTestFullRunComplete(): void {
  if (typeof window === "undefined") return;
  const current = readMockTestFullResults();
  window.sessionStorage.setItem(
    MOCK_TEST_1_FULL_RESULTS_STORAGE_KEY,
    JSON.stringify({
      ...current,
      completedAt: new Date().toISOString(),
    } satisfies MockTestFullResultsSnapshot),
  );
}

export function clearMockTestFullResults(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(MOCK_TEST_1_FULL_RESULTS_STORAGE_KEY);
}
