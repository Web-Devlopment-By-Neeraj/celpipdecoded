// Server side reads for the ADMIN-01 mock test builder.
//
// Every function takes an AdminSession. That is not decoration: it means
// a caller cannot reach these tables without having already run
// getAdminSession, because there is no way to produce an AdminSession
// except by passing the allow list check in
// src/lib/admin/require-admin.ts.
//
// The service role client is used deliberately. Row level security on
// the four builder tables denies anon and authenticated outright, since
// admin membership is an environment variable that a Postgres policy
// cannot see. See the RLS note in
// supabase/migrations/013_mock_test_builder_admin_foundation.sql.
//
// This module is server only. The service role key must never reach a
// client component, so nothing here may be imported from a file marked
// "use client".

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AdminSession } from "@/lib/admin/require-admin";
import {
  logAdminSupabaseError,
  reportAdminReadError,
} from "./admin-supabase-error";
import {
  SECTION_TYPE_EXAM_ORDER,
  type MockTestPartRow,
  type MockTestRow,
  type MockTestSectionRow,
  type MockTestSectionWithParts,
  type MockTestStructure,
} from "./mock-test-types";

// internal_notes is left out of the list query on purpose. The list is
// the widest read in the builder and staff notes have no business being
// in it.
const MOCK_TEST_LIST_COLUMNS =
  "id, slug, title, description, status, version, published_at, created_at, updated_at";

const MOCK_TEST_DETAIL_COLUMNS = `${MOCK_TEST_LIST_COLUMNS}, internal_notes`;

const SECTION_COLUMNS =
  "id, mock_test_id, section_type, title, instructions, section_order, estimated_duration_minutes, scoring_type, status";

const PART_COLUMNS =
  "id, mock_test_id, section_id, title, part_type, instructions, part_order, timer_type, prep_time_seconds, response_time_seconds, question_count, status";

// The service role client, reached only with an AdminSession in hand.
// The check is cheap and the point of it is structural: it makes the
// session an argument every read has to carry, so a future caller cannot
// quietly drop the authorization step and still compile.
function adminClient(session: AdminSession) {
  if (!session.userId) {
    throw new Error("Admin session is missing a user id.");
  }

  return getSupabaseAdmin();
}

// One part with the section and practice test above it. What the
// ADMIN-02 screens work from, since all four of them are addressed by
// three ids and need every level to draw a breadcrumb.
export type MockTestPartContext = {
  test: Omit<MockTestRow, "internal_notes">;
  section: MockTestSectionRow;
  part: MockTestPartRow;
};

// A row of the admin list, with the counts the table shows.
export type MockTestListItem = Omit<MockTestRow, "internal_notes"> & {
  sectionCount: number;
  partCount: number;
  openErrorCount: number;
  openWarningCount: number;
};

// Everything the list screen needs, in one place. Three reads rather
// than one join, because PostgREST cannot aggregate a two level tree and
// the number of tests here is small by design.
export async function listMockTests(
  session: AdminSession,
): Promise<MockTestListItem[]> {
  const supabase = adminClient(session);

  const { data: tests, error } = await supabase
    .from("mock_tests")
    .select(MOCK_TEST_LIST_COLUMNS)
    .order("updated_at", { ascending: false });

  if (error) {
    throw reportAdminReadError(
      "listMockTests",
      error,
      "The practice tests could not be loaded.",
    );
  }

  const rows = (tests ?? []) as Omit<MockTestRow, "internal_notes">[];

  if (rows.length === 0) {
    return [];
  }

  const ids = rows.map((row) => row.id);

  const [sectionsResult, partsResult, issuesResult] = await Promise.all([
    supabase.from("mock_test_sections").select("id, mock_test_id").in("mock_test_id", ids),
    supabase.from("mock_test_parts").select("id, mock_test_id").in("mock_test_id", ids),
    supabase
      .from("mock_test_validation_issues")
      .select("mock_test_id, severity")
      .eq("resolved", false)
      .in("mock_test_id", ids),
  ]);

  // The three count reads are secondary. A failure here means the list
  // shows zeroes in three columns, which is better than refusing to show
  // the list at all, so each is logged and then allowed to fall through
  // to an empty array. Silently swallowing them was how a schema problem
  // on these tables stayed invisible.
  for (const [name, result] of [
    ["listMockTests:sectionCounts", sectionsResult],
    ["listMockTests:partCounts", partsResult],
    ["listMockTests:issueCounts", issuesResult],
  ] as const) {
    if (result.error) {
      logAdminSupabaseError(name, result.error);
    }
  }

  const sectionCounts = countBy(
    (sectionsResult.data ?? []) as { mock_test_id: string }[],
  );
  const partCounts = countBy(
    (partsResult.data ?? []) as { mock_test_id: string }[],
  );

  const issueRows = (issuesResult.data ?? []) as {
    mock_test_id: string;
    severity: string;
  }[];

  const errorCounts = countBy(
    issueRows.filter((row) => row.severity === "error"),
  );
  const warningCounts = countBy(
    issueRows.filter((row) => row.severity === "warning"),
  );

  return rows.map((row) => ({
    ...row,
    sectionCount: sectionCounts.get(row.id) ?? 0,
    partCount: partCounts.get(row.id) ?? 0,
    openErrorCount: errorCounts.get(row.id) ?? 0,
    openWarningCount: warningCounts.get(row.id) ?? 0,
  }));
}

// One test with its sections and parts, sorted the way the builder shows
// them. Returns null when the id does not exist, so a page can call
// notFound instead of rendering an empty shell.
export async function getMockTestStructure(
  session: AdminSession,
  mockTestId: string,
): Promise<MockTestStructure | null> {
  const supabase = adminClient(session);

  const { data: test, error } = await supabase
    .from("mock_tests")
    .select(MOCK_TEST_DETAIL_COLUMNS)
    .eq("id", mockTestId)
    .maybeSingle();

  if (error) {
    throw reportAdminReadError(
      "getMockTest",
      error,
      "That practice test could not be loaded.",
      { id: mockTestId },
    );
  }

  if (!test) {
    return null;
  }

  const [sectionsResult, partsResult] = await Promise.all([
    supabase
      .from("mock_test_sections")
      .select(SECTION_COLUMNS)
      .eq("mock_test_id", mockTestId),
    supabase
      .from("mock_test_parts")
      .select(PART_COLUMNS)
      .eq("mock_test_id", mockTestId),
  ]);

  if (sectionsResult.error) {
    throw reportAdminReadError(
      "getMockTest:sections",
      sectionsResult.error,
      "The sections of that practice test could not be loaded.",
      { id: mockTestId },
    );
  }

  if (partsResult.error) {
    throw reportAdminReadError(
      "getMockTest:parts",
      partsResult.error,
      "The parts of that practice test could not be loaded.",
      { id: mockTestId },
    );
  }

  const sections = (sectionsResult.data ?? []) as MockTestSectionRow[];
  const parts = (partsResult.data ?? []) as MockTestPartRow[];

  const withParts: MockTestSectionWithParts[] = sections
    .map((section) => ({
      ...section,
      parts: parts
        .filter((part) => part.section_id === section.id)
        .sort(comparePartOrder),
    }))
    .sort(compareSectionOrder);

  return { test: test as MockTestRow, sections: withParts };
}

// One section, used by the add part screen so it can name the section it
// is adding to and offer only the part types that fit it.
export async function getMockTestSection(
  session: AdminSession,
  mockTestId: string,
  sectionId: string,
): Promise<MockTestSectionRow | null> {
  const supabase = adminClient(session);

  const { data, error } = await supabase
    .from("mock_test_sections")
    .select(SECTION_COLUMNS)
    .eq("id", sectionId)
    // Scoped to the test in the URL as well, so a section id from
    // another test cannot be edited through this one's route.
    .eq("mock_test_id", mockTestId)
    .maybeSingle();

  if (error) {
    throw reportAdminReadError(
      "getMockTestSection",
      error,
      "That section could not be loaded.",
      { id: sectionId },
    );
  }

  return (data as MockTestSectionRow | null) ?? null;
}

// One part with the section and practice test above it, which is what
// every ADMIN-02 screen needs to draw a breadcrumb and a heading.
//
// Every id in the URL is checked against its parent, so a part id
// belonging to a different section, or a section id belonging to a
// different test, resolves to null rather than opening the wrong
// content. That matters more here than on the structure screens: the
// ADMIN-02 routes carry three ids, and a mismatched one would otherwise
// let a staff member edit a part they navigated to by mistake.
export async function getMockTestPartContext(
  session: AdminSession,
  mockTestId: string,
  sectionId: string,
  partId: string,
): Promise<MockTestPartContext | null> {
  const supabase = adminClient(session);

  const { data: part, error } = await supabase
    .from("mock_test_parts")
    .select(PART_COLUMNS)
    .eq("id", partId)
    .eq("section_id", sectionId)
    .eq("mock_test_id", mockTestId)
    .maybeSingle();

  if (error) {
    throw reportAdminReadError(
      "getMockTestPartContext",
      error,
      "That part could not be loaded.",
      { id: partId },
    );
  }

  if (!part) {
    return null;
  }

  const [sectionResult, testResult] = await Promise.all([
    supabase
      .from("mock_test_sections")
      .select(SECTION_COLUMNS)
      .eq("id", sectionId)
      .eq("mock_test_id", mockTestId)
      .maybeSingle(),
    supabase
      .from("mock_tests")
      .select(MOCK_TEST_LIST_COLUMNS)
      .eq("id", mockTestId)
      .maybeSingle(),
  ]);

  if (sectionResult.error) {
    throw reportAdminReadError(
      "getMockTestPartContext:section",
      sectionResult.error,
      "The section that part belongs to could not be loaded.",
      { id: sectionId },
    );
  }

  if (testResult.error) {
    throw reportAdminReadError(
      "getMockTestPartContext:test",
      testResult.error,
      "The practice test that part belongs to could not be loaded.",
      { id: mockTestId },
    );
  }

  if (!sectionResult.data || !testResult.data) {
    return null;
  }

  return {
    // internal_notes is not selected here. This context is read by the
    // part detail, question, media and preview screens, and none of them
    // shows the staff notes on the test.
    test: testResult.data as Omit<MockTestRow, "internal_notes">,
    section: sectionResult.data as MockTestSectionRow,
    part: part as MockTestPartRow,
  };
}

// Parts already in a section, so the add part form can suggest the next
// order number.
export async function listSectionParts(
  session: AdminSession,
  sectionId: string,
): Promise<MockTestPartRow[]> {
  const supabase = adminClient(session);

  const { data, error } = await supabase
    .from("mock_test_parts")
    .select(PART_COLUMNS)
    .eq("section_id", sectionId);

  if (error) {
    throw reportAdminReadError(
      "listSectionParts",
      error,
      "The parts in that section could not be loaded.",
      { id: sectionId },
    );
  }

  return ((data ?? []) as MockTestPartRow[]).sort(comparePartOrder);
}

// Sorting falls back to exam order when two sections claim the same
// order number, which is a state the validator reports rather than the
// database refuses.
function compareSectionOrder(
  a: MockTestSectionRow,
  b: MockTestSectionRow,
): number {
  if (a.section_order !== b.section_order) {
    return a.section_order - b.section_order;
  }

  return (
    SECTION_TYPE_EXAM_ORDER[a.section_type] -
    SECTION_TYPE_EXAM_ORDER[b.section_type]
  );
}

function comparePartOrder(a: MockTestPartRow, b: MockTestPartRow): number {
  if (a.part_order !== b.part_order) {
    return a.part_order - b.part_order;
  }

  return a.title.localeCompare(b.title);
}

function countBy(rows: { mock_test_id: string }[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(row.mock_test_id, (counts.get(row.mock_test_id) ?? 0) + 1);
  }

  return counts;
}
