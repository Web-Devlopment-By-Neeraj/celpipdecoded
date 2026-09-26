"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, type AdminSession } from "@/lib/admin/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  adminActionError,
  adminActionSuccess,
  type AdminActionState,
} from "@/features/admin/admin-action-state";
import {
  logAdminSupabaseError,
  reportAdminReadError,
  withDevelopmentReason,
  type AdminErrorContext,
  type SupabaseErrorLike,
} from "@/features/admin/admin-supabase-error";
import {
  getMockTestPartContext,
  getMockTestStructure,
} from "@/features/admin/mock-test-queries";
import {
  MEDIA_TYPES,
  QUESTION_TYPES,
} from "@/features/admin/mock-test-content-types";
import { getPartContent } from "@/features/admin/mock-test-question-queries";
import { evaluatePartContent } from "@/features/admin/mock-test-content-validation";
import {
  MOCK_TEST_STATUSES,
  PART_TYPES,
  PART_TYPES_BY_SECTION,
  PUBLISHABLE_IN_ADMIN_01,
  SCORING_TYPES,
  SECTION_TYPES,
  TIMER_TYPES,
  type MockTestStatus,
} from "@/features/admin/mock-test-types";
import { evaluateMockTestStructure } from "@/features/admin/mock-test-validation";

// Server actions for the admin mock test builder.
//
// ADMIN-01 built the structure half: practice tests, sections and parts.
// ADMIN-02 adds the content half below it: media links, questions,
// options and answer keys, plus the part content check. Both halves live
// here because a "use server" module is the unit a form posts to, and
// splitting them would only move the import.
//
// Every action starts with requireAdmin. A server action is reachable by
// direct POST, so the check on the page that renders the form protects
// nothing here. See the warning in
// node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md.
//
// After the check, writes go through the service role client. Row level
// security on the four builder tables denies anon and authenticated
// outright, because admin membership is an environment variable that a
// Postgres policy cannot read. The service role key stays on the server:
// this file is a "use server" module and never runs in a browser.
//
// What these actions deliberately do not do:
//   - upload a file. Media is a pasted URL and nothing else (ADMIN-02
//     scope rule), so no route here accepts a File.
//   - author a Writing or Speaking prompt, or an AI rubric (ADMIN-03)
//   - write timer rules or scoring rules (ADMIN-03, ADMIN-04)
//   - save a student attempt (ADMIN-08)
//   - publish anything a learner can see (see PUBLISHABLE_IN_ADMIN_01)
//   - replace any hardcoded learner Mock Test 1 route. Nothing authored
//     here reaches a student.
//
// House style: normal hyphens only, straight quotes only.

const LIST_PATH = "/dashboard/admin/mock-tests";

// Postgres unique violation. Only the slug has a unique constraint that
// a staff member can hit by typing, so this maps to one friendly line
// rather than a database error.
const UNIQUE_VIOLATION = "23505";

const REFUSED = "You do not have access to the mock test builder.";

// ---------------------------------------------------------------------
// Field parsing
// ---------------------------------------------------------------------

const uuid = z.uuid("That id is not valid.");

const slugField = z
  .string()
  .trim()
  .min(1, "Enter a slug.")
  .max(120, "Keep the slug under 120 characters.")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and single hyphens, for example mock-test-2.",
  );

// Optional free text. An empty box means null in the database rather
// than an empty string, so a missing value reads the same everywhere.
function optionalText(max: number, label: string) {
  return z
    .string()
    .trim()
    .max(max, `Keep the ${label} under ${max} characters.`)
    .transform((value) => (value.length === 0 ? null : value));
}

// Optional whole number from a text input. An empty box is null.
function optionalInteger(min: number, max: number, label: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? null : Number(value)))
    .refine(
      (value) => value === null || Number.isInteger(value),
      `Enter a whole number for the ${label}.`,
    )
    .refine(
      (value) => value === null || (value >= min && value <= max),
      `Enter a ${label} between ${min} and ${max}.`,
    );
}

// An optional select. The empty option means "not decided yet".
function optionalEnum<T extends readonly [string, ...string[]]>(
  values: T,
  message: string,
) {
  return z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || (values as readonly string[]).includes(value),
      message,
    )
    .transform((value) => (value.length === 0 ? null : (value as T[number])));
}

const mockTestFields = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a title.")
    .max(200, "Keep the title under 200 characters."),
  slug: slugField,
  description: optionalText(2000, "description"),
  internal_notes: optionalText(4000, "internal notes"),
  version: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? 1 : Number(value)))
    .refine(
      (value) => Number.isInteger(value) && value >= 1 && value <= 999,
      "Enter a version between 1 and 999.",
    ),
});

const sectionFields = z.object({
  section_type: z.enum(SECTION_TYPES, {
    message: "Choose Listening, Reading, Writing or Speaking.",
  }),
  title: z
    .string()
    .trim()
    .min(1, "Enter a section title.")
    .max(200, "Keep the title under 200 characters."),
  instructions: optionalText(4000, "instructions"),
  section_order: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? NaN : Number(value)))
    .refine(
      (value) => Number.isInteger(value) && value >= 1 && value <= 20,
      "Enter a section order between 1 and 20.",
    ),
  estimated_duration_minutes: optionalInteger(1, 600, "estimated duration"),
  scoring_type: optionalEnum(SCORING_TYPES, "Choose a valid scoring type."),
  status: z.enum(["draft", "ready"], {
    message: "Choose Draft or Ready.",
  }),
});

const partFields = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a part title.")
    .max(200, "Keep the title under 200 characters."),
  part_type: optionalEnum(PART_TYPES, "Choose a valid part type."),
  instructions: optionalText(4000, "instructions"),
  part_order: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? NaN : Number(value)))
    .refine(
      (value) => Number.isInteger(value) && value >= 1 && value <= 50,
      "Enter a part order between 1 and 50.",
    ),
  timer_type: optionalEnum(TIMER_TYPES, "Choose a valid timer type."),
  prep_time_seconds: optionalInteger(0, 3600, "preparation time"),
  response_time_seconds: optionalInteger(1, 7200, "response time"),
  question_count: optionalInteger(0, 100, "question count"),
  status: z.enum(["draft", "ready"], {
    message: "Choose Draft or Ready.",
  }),
});

// FormData values arrive as string or File. The builder has no file
// inputs, so anything that is not a string is treated as absent.
function readFields(formData: FormData, names: readonly string[]) {
  const values: Record<string, string> = {};

  for (const name of names) {
    const value = formData.get(name);
    values[name] = typeof value === "string" ? value : "";
  }

  return values;
}

// Turns a zod failure into the field map the forms render.
//
// Only the first message per field is kept. A field with two problems
// still only has one place to print them, and the first is the one that
// explains the shape the input wants.
function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field !== "string" || field in fieldErrors) {
      continue;
    }

    fieldErrors[field] = issue.message;
  }

  return fieldErrors;
}

// ---------------------------------------------------------------------
// Mock tests
// ---------------------------------------------------------------------

// Create a practice test. Always created as a draft: the status select
// is not on the create form, so there is no path from an empty test to
// anything a learner could reach.
export async function createMockTest(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const parsed = mockTestFields.safeParse(
    readFields(formData, [
      "title",
      "slug",
      "description",
      "internal_notes",
      "version",
    ]),
  );

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("mock_tests")
    .insert({
      ...parsed.data,
      status: "draft",
      created_by: session.userId,
      updated_by: session.userId,
    })
    .select("id")
    .single();

  if (error) {
    return adminActionError(
      ...describeWriteError("createMockTest", error, "practice test", {
        slug: parsed.data.slug,
      }),
    );
  }

  revalidatePath(LIST_PATH);

  // redirect throws a control flow exception, so it stays outside the
  // error handling above and nothing runs after it.
  redirect(`${LIST_PATH}/${data.id}`);
}

// Edit the basic details of a practice test, including its status.
//
// Status is the only field here that can change what a learner sees, so
// it goes through guardMockTestStatusChange rather than straight into
// the update.
export async function updateMockTest(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const idResult = uuid.safeParse(formData.get("mock_test_id"));

  if (!idResult.success) {
    return adminActionError("That practice test could not be found.");
  }

  const mockTestId = idResult.data;

  const parsed = mockTestFields
    .extend({
      status: z.enum(MOCK_TEST_STATUSES, {
        message: "Choose a valid status.",
      }),
    })
    .safeParse(
      readFields(formData, [
        "title",
        "slug",
        "description",
        "internal_notes",
        "version",
        "status",
      ]),
    );

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const guard = await guardMockTestStatusChange(
    session,
    mockTestId,
    parsed.data.status,
  );

  if (guard) {
    return guard;
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("mock_tests")
    .update({
      ...parsed.data,
      updated_by: session.userId,
    })
    .eq("id", mockTestId);

  if (error) {
    return adminActionError(
      ...describeWriteError("updateMockTest", error, "practice test", {
        id: mockTestId,
        slug: parsed.data.slug,
      }),
    );
  }

  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/${mockTestId}`);
  revalidatePath(`${LIST_PATH}/${mockTestId}/preview`);

  return adminActionSuccess("Saved.");
}

// Refuses a status change that would be unsafe, and returns null when
// the change is allowed.
//
// Two separate refusals, on purpose:
//
//  1. Moving to internal_preview is blocked while the structure has
//     errors, so an incomplete test cannot be circulated for review.
//  2. published is blocked outright in ADMIN-01. A published test would
//     need questions, answer keys, timers and scoring rules, none of
//     which this ticket builds, and there is no learner route that could
//     render one. The status exists so the vocabulary is settled.
//
// draft and archived are never gated. Both only ever narrow who can see
// a test, and refusing to archive a test because its structure is
// incomplete would leave the incomplete ones as the only ones that
// cannot be put away.
async function guardMockTestStatusChange(
  session: AdminSession,
  mockTestId: string,
  nextStatus: MockTestStatus,
): Promise<AdminActionState | null> {
  if (nextStatus === "draft" || nextStatus === "archived") {
    return null;
  }

  const summary = await refreshValidationIssues(session, mockTestId);

  if (!summary) {
    return adminActionError("That practice test could not be found.");
  }

  if (nextStatus === "published" && !PUBLISHABLE_IN_ADMIN_01) {
    return adminActionError(
      "Publishing is not available yet. A published practice test needs questions, answer keys, timers and scoring rules, which arrive in a later ticket. The status stays available so the wording is settled.",
      { status: "Publishing is blocked in this version of the builder." },
    );
  }

  if (!summary.canAdvanceStatus) {
    const noun = summary.errorCount === 1 ? "problem" : "problems";

    return adminActionError(
      `The structure has ${summary.errorCount} ${noun} to fix before this practice test can leave draft. Open the structure preview to see the list.`,
      { status: "Fix the structure problems first." },
    );
  }

  return null;
}

// ---------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------

export async function createMockTestSection(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const idResult = uuid.safeParse(formData.get("mock_test_id"));

  if (!idResult.success) {
    return adminActionError("That practice test could not be found.");
  }

  const mockTestId = idResult.data;

  const parsed = sectionFields.safeParse(
    readFields(formData, [
      "section_type",
      "title",
      "instructions",
      "section_order",
      "estimated_duration_minutes",
      "scoring_type",
      "status",
    ]),
  );

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("mock_test_sections").insert({
    ...parsed.data,
    mock_test_id: mockTestId,
    created_by: session.userId,
    updated_by: session.userId,
  });

  if (error) {
    // A duplicate skill is an ordinary outcome rather than a fault, so
    // it gets its own wording. It is still logged, because a run of them
    // usually means the form is offering a skill the test already has.
    if (error.code === UNIQUE_VIOLATION) {
      logAdminSupabaseError("createMockTestSection", error, { id: mockTestId });

      return adminActionError(
        "That practice test already has a section for this skill. A test holds one Listening, one Reading, one Writing and one Speaking section.",
        { section_type: "This skill is already on the test." },
      );
    }

    return adminActionError(
      ...describeWriteError("createMockTestSection", error, "section", {
        id: mockTestId,
      }),
    );
  }

  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/${mockTestId}`);
  revalidatePath(`${LIST_PATH}/${mockTestId}/preview`);

  redirect(`${LIST_PATH}/${mockTestId}`);
}

export async function updateMockTestSection(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const idResult = uuid.safeParse(formData.get("mock_test_id"));
  const sectionResult = uuid.safeParse(formData.get("section_id"));

  if (!idResult.success || !sectionResult.success) {
    return adminActionError("That section could not be found.");
  }

  const mockTestId = idResult.data;
  const sectionId = sectionResult.data;

  const parsed = sectionFields.safeParse(
    readFields(formData, [
      "section_type",
      "title",
      "instructions",
      "section_order",
      "estimated_duration_minutes",
      "scoring_type",
      "status",
    ]),
  );

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("mock_test_sections")
    .update({
      ...parsed.data,
      updated_by: session.userId,
    })
    .eq("id", sectionId)
    // Scoped to the test from the URL as well, so a section id belonging
    // to another test cannot be edited through this form.
    .eq("mock_test_id", mockTestId);

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      logAdminSupabaseError("updateMockTestSection", error, { id: sectionId });

      return adminActionError(
        "That practice test already has a section for this skill.",
        { section_type: "This skill is already on the test." },
      );
    }

    return adminActionError(
      ...describeWriteError("updateMockTestSection", error, "section", {
        id: sectionId,
      }),
    );
  }

  revalidatePath(`${LIST_PATH}/${mockTestId}`);
  revalidatePath(`${LIST_PATH}/${mockTestId}/preview`);

  return adminActionSuccess("Section saved.");
}

// ---------------------------------------------------------------------
// Parts
// ---------------------------------------------------------------------

export async function createMockTestPart(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const idResult = uuid.safeParse(formData.get("mock_test_id"));
  const sectionResult = uuid.safeParse(formData.get("section_id"));

  if (!idResult.success || !sectionResult.success) {
    return adminActionError("That section could not be found.");
  }

  const mockTestId = idResult.data;
  const sectionId = sectionResult.data;

  const parsed = partFields.safeParse(
    readFields(formData, [
      "title",
      "part_type",
      "instructions",
      "part_order",
      "timer_type",
      "prep_time_seconds",
      "response_time_seconds",
      "question_count",
      "status",
    ]),
  );

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const mismatch = await checkPartTypeFitsSection(
    session,
    mockTestId,
    sectionId,
    parsed.data.part_type,
  );

  if (mismatch) {
    return mismatch;
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("mock_test_parts").insert({
    ...parsed.data,
    mock_test_id: mockTestId,
    section_id: sectionId,
    created_by: session.userId,
    updated_by: session.userId,
  });

  if (error) {
    return adminActionError(
      ...describeWriteError("createMockTestPart", error, "part", {
        id: sectionId,
      }),
    );
  }

  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/${mockTestId}`);
  revalidatePath(`${LIST_PATH}/${mockTestId}/preview`);

  redirect(`${LIST_PATH}/${mockTestId}`);
}

export async function updateMockTestPart(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const idResult = uuid.safeParse(formData.get("mock_test_id"));
  const sectionResult = uuid.safeParse(formData.get("section_id"));
  const partResult = uuid.safeParse(formData.get("part_id"));

  if (!idResult.success || !sectionResult.success || !partResult.success) {
    return adminActionError("That part could not be found.");
  }

  const mockTestId = idResult.data;
  const sectionId = sectionResult.data;
  const partId = partResult.data;

  const parsed = partFields.safeParse(
    readFields(formData, [
      "title",
      "part_type",
      "instructions",
      "part_order",
      "timer_type",
      "prep_time_seconds",
      "response_time_seconds",
      "question_count",
      "status",
    ]),
  );

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const mismatch = await checkPartTypeFitsSection(
    session,
    mockTestId,
    sectionId,
    parsed.data.part_type,
  );

  if (mismatch) {
    return mismatch;
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("mock_test_parts")
    .update({
      ...parsed.data,
      updated_by: session.userId,
    })
    .eq("id", partId)
    .eq("section_id", sectionId)
    .eq("mock_test_id", mockTestId);

  if (error) {
    return adminActionError(
      ...describeWriteError("updateMockTestPart", error, "part", {
        id: partId,
      }),
    );
  }

  revalidatePath(`${LIST_PATH}/${mockTestId}`);
  revalidatePath(`${LIST_PATH}/${mockTestId}/preview`);

  return adminActionSuccess("Part saved.");
}

// A Reading part type in a Listening section is a modelling error the
// database cannot see, because part_type and section_type live on
// different tables. Checked here so it is refused at the point of
// writing rather than only reported by the validator afterwards.
//
// Takes the session it will never read, for the same structural reason
// the query module does: the authorization step becomes an argument a
// future caller cannot drop and still compile.
async function checkPartTypeFitsSection(
  session: AdminSession,
  mockTestId: string,
  sectionId: string,
  partType: string | null,
): Promise<AdminActionState | null> {
  if (partType === null) {
    return null;
  }

  if (!session.userId) {
    return adminActionError(REFUSED);
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("mock_test_sections")
    .select("section_type")
    .eq("id", sectionId)
    .eq("mock_test_id", mockTestId)
    .maybeSingle();

  if (error) {
    logAdminSupabaseError("checkPartTypeFitsSection", error, {
      id: sectionId,
    });

    return adminActionError(
      withDevelopmentReason("That section could not be found.", error),
    );
  }

  if (!data) {
    return adminActionError("That section could not be found.");
  }

  const sectionType = data.section_type as keyof typeof PART_TYPES_BY_SECTION;
  const allowed = PART_TYPES_BY_SECTION[sectionType] ?? [];

  if (!(allowed as readonly string[]).includes(partType)) {
    return adminActionError("That part type does not belong in this section.", {
      part_type: "Choose a part type that fits this section.",
    });
  }

  return null;
}

// ---------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------

// Run every structure rule and refresh the cached issue rows.
//
// The rules themselves live in
// src/features/admin/mock-test-validation.ts and touch no database, so
// the preview screen can show the same findings without writing.
export async function validateMockTestStructure(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const idResult = uuid.safeParse(formData.get("mock_test_id"));

  if (!idResult.success) {
    return adminActionError("That practice test could not be found.");
  }

  const mockTestId = idResult.data;
  const summary = await refreshValidationIssues(session, mockTestId);

  if (!summary) {
    return adminActionError("That practice test could not be found.");
  }

  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/${mockTestId}`);
  revalidatePath(`${LIST_PATH}/${mockTestId}/preview`);

  if (summary.issues.length === 0) {
    return adminActionSuccess(
      "Structure checks passed. Questions, answer keys, media and timers are checked in later tickets.",
    );
  }

  const parts: string[] = [];

  if (summary.errorCount > 0) {
    parts.push(
      `${summary.errorCount} ${summary.errorCount === 1 ? "problem" : "problems"}`,
    );
  }

  if (summary.warningCount > 0) {
    parts.push(
      `${summary.warningCount} ${summary.warningCount === 1 ? "warning" : "warnings"}`,
    );
  }

  return adminActionSuccess(`Structure checked: ${parts.join(" and ")}.`);
}

// Recomputes the rules and rewrites the cached rows for one test.
// Returns null when the test does not exist.
//
// The rows are a cache of a computation, so a run replaces them outright
// rather than reconciling row by row. resolved stays on the table for a
// later ticket where an author dismisses a warning they have decided to
// live with.
async function refreshValidationIssues(
  session: AdminSession,
  mockTestId: string,
) {
  const structure = await getMockTestStructure(session, mockTestId);

  if (!structure) {
    return null;
  }

  const summary = evaluateMockTestStructure(structure);
  const supabase = getSupabaseAdmin();

  const { error: deleteError } = await supabase
    .from("mock_test_validation_issues")
    .delete()
    .eq("mock_test_id", mockTestId);

  if (deleteError) {
    throw reportAdminReadError(
      "validateMockTestStructure:clear",
      deleteError,
      "The structure checks could not be saved.",
      { id: mockTestId },
    );
  }

  if (summary.issues.length > 0) {
    const { error: insertError } = await supabase
      .from("mock_test_validation_issues")
      .insert(
        summary.issues.map((issue) => ({
          mock_test_id: mockTestId,
          entity_type: issue.entityType,
          entity_id: issue.entityId,
          issue_type: issue.issueType,
          issue_message: issue.message,
          severity: issue.severity,
          resolved: false,
        })),
      );

    if (insertError) {
      throw reportAdminReadError(
        "validateMockTestStructure:record",
        insertError,
        "The structure checks could not be saved.",
        { id: mockTestId },
      );
    }
  }

  return summary;
}

// ---------------------------------------------------------------------
// Error wording
// ---------------------------------------------------------------------

// Turns a PostgREST error into something a staff member can act on, and
// writes the full error to the server log on the way past.
//
// Both halves matter. The raw message is not rendered in production,
// because it can name columns, constraints and sometimes the failing
// row, and a database error string is not a place to be casual about
// what leaks. But it has to go somewhere, and before this it went
// nowhere: a create that failed on a missing column produced the same
// "check the values and try again" as a typo, with nothing in the log to
// tell them apart.
//
// In development the sentence carries a short reason as well, since the
// person reading the screen is the person who can fix the schema.
//
// Only a slug or an id is ever passed as context. Never the row: it can
// hold staff internal notes.
function describeWriteError(
  action: string,
  error: SupabaseErrorLike,
  noun: string,
  context: AdminErrorContext = {},
): [string, Record<string, string>] {
  logAdminSupabaseError(action, error, context);

  if (error.code === UNIQUE_VIOLATION) {
    return [
      "That slug is already taken by another practice test. Choose a different one.",
      { slug: "This slug is already in use." },
    ];
  }

  return [
    withDevelopmentReason(
      `The ${noun} could not be saved. Check the values and try again.`,
      error,
    ),
    {},
  ];
}

// =====================================================================
// ADMIN-02: part content
// =====================================================================
//
// Media links, questions, options and answer keys, all addressed by the
// three ids in the URL. Every action below starts with requireAdmin for
// the same reason the ADMIN-01 actions do: a server action is reachable
// by direct POST, so the check on the page that renders the form
// protects nothing here.
//
// After the check, every write is scoped to its parent before it runs.
// loadPartForWrite refuses a part id that does not sit under the section
// and test in the URL, and loadQuestionForWrite refuses a question id
// that does not sit under that part. Without those two, a staff member
// with a stale tab could post an option onto a question in a different
// practice test.

const REFUSED_PART = "That part could not be found.";
const REFUSED_QUESTION = "That question could not be found.";

// ---------------------------------------------------------------------
// Shared field parsing
// ---------------------------------------------------------------------

// A required whole number from a text input.
function requiredInteger(min: number, max: number, label: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? NaN : Number(value)))
    .refine(
      (value) => Number.isInteger(value) && value >= min && value <= max,
      `Enter a ${label} between ${min} and ${max}.`,
    );
}

// An optional uuid from a select. The empty option means "not attached".
const optionalUuid = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || uuid.safeParse(value).success,
    "That selection is not valid.",
  )
  .transform((value) => (value.length === 0 ? null : value));

// A pasted media URL.
//
// Checked for shape rather than for reachability. A HEAD request would
// tell a staff member whether the link resolves right now, which is
// useful, but it also turns every save into an outbound request to a
// third party and fails on a Cloudinary asset that is still processing.
// The shape check catches the mistake that actually happens, which is
// pasting a Cloudinary console path instead of a delivery URL.
const mediaUrlField = z
  .string()
  .trim()
  .min(1, "Enter the media URL.")
  .max(2000, "Keep the URL under 2000 characters.")
  .refine(
    (value) => /^https?:\/\/\S+$/i.test(value),
    "Enter a full URL that starts with https://, for example a Cloudinary delivery link.",
  );

// ---------------------------------------------------------------------
// Route scoping
// ---------------------------------------------------------------------

type PartIds = {
  mockTestId: string;
  sectionId: string;
  partId: string;
};

// Reads the three ids every ADMIN-02 form posts. Returns null when any
// of them is missing or malformed, which the caller turns into the same
// "could not be found" wording a wrong id gets, so a probe learns
// nothing from the difference.
function readPartIds(formData: FormData): PartIds | null {
  const mockTestId = uuid.safeParse(formData.get("mock_test_id"));
  const sectionId = uuid.safeParse(formData.get("section_id"));
  const partId = uuid.safeParse(formData.get("part_id"));

  if (!mockTestId.success || !sectionId.success || !partId.success) {
    return null;
  }

  return {
    mockTestId: mockTestId.data,
    sectionId: sectionId.data,
    partId: partId.data,
  };
}

// The URL of one part inside the builder.
function partPath(ids: PartIds): string {
  return `${LIST_PATH}/${ids.mockTestId}/sections/${ids.sectionId}/parts/${ids.partId}`;
}

// Refreshes every screen a content write can change: the part detail
// screen, its preview, and the practice test screen above them, which
// lists the parts.
function revalidatePartContentPaths(ids: PartIds, questionId?: string): void {
  const base = partPath(ids);

  revalidatePath(base);
  revalidatePath(`${base}/preview`);
  revalidatePath(`${LIST_PATH}/${ids.mockTestId}`);

  if (questionId) {
    revalidatePath(`${base}/questions/${questionId}`);
  }
}

// Confirms the part in the URL exists and sits under the section and
// test in the URL. Returns the context, or null for the caller to turn
// into a refusal.
async function loadPartForWrite(session: AdminSession, ids: PartIds) {
  const context = await getMockTestPartContext(
    session,
    ids.mockTestId,
    ids.sectionId,
    ids.partId,
  );

  return context ?? null;
}

// Confirms a question exists and sits under the part in the URL. Used by
// every option and answer key action, since those are addressed by a
// question id the browser supplies.
async function loadQuestionForWrite(
  session: AdminSession,
  ids: PartIds,
  questionId: string,
): Promise<{ id: string; points: number } | null> {
  if (!session.userId) {
    return null;
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("mock_test_questions")
    .select("id, points")
    .eq("id", questionId)
    .eq("part_id", ids.partId)
    .maybeSingle();

  if (error) {
    logAdminSupabaseError("loadQuestionForWrite", error, { id: questionId });

    return null;
  }

  return (data as { id: string; points: number } | null) ?? null;
}

// ---------------------------------------------------------------------
// Media links
// ---------------------------------------------------------------------

const mediaFields = z.object({
  media_type: z.enum(MEDIA_TYPES, {
    message: "Choose a media type.",
  }),
  url: mediaUrlField,
  title: optionalText(200, "title"),
  alt_text: optionalText(500, "alt text"),
  transcript: optionalText(20000, "transcript"),
  internal_notes: optionalText(4000, "internal notes"),
  display_order: requiredInteger(0, 999, "display order"),
});

const MEDIA_FIELD_NAMES = [
  "media_type",
  "url",
  "title",
  "alt_text",
  "transcript",
  "internal_notes",
  "display_order",
] as const;

// Add one media link to a part.
//
// A link, never a file. ADMIN-02 does not build upload, so this action
// takes a URL that already resolves somewhere, which is how all 46 Mock
// Test 1 assets already work.
export async function createMockTestMediaAsset(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const ids = readPartIds(formData);

  if (!ids) {
    return adminActionError(REFUSED_PART);
  }

  const parsed = mediaFields.safeParse(readFields(formData, MEDIA_FIELD_NAMES));

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const context = await loadPartForWrite(session, ids);

  if (!context) {
    return adminActionError(REFUSED_PART);
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("mock_test_media_assets").insert({
    ...parsed.data,
    mock_test_id: ids.mockTestId,
    section_id: ids.sectionId,
    part_id: ids.partId,
    created_by: session.userId,
    updated_by: session.userId,
  });

  if (error) {
    return adminActionError(
      ...describeWriteError("createMockTestMediaAsset", error, "media link", {
        id: ids.partId,
      }),
    );
  }

  revalidatePartContentPaths(ids);

  redirect(partPath(ids));
}

export async function updateMockTestMediaAsset(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const ids = readPartIds(formData);
  const assetResult = uuid.safeParse(formData.get("media_asset_id"));

  if (!ids || !assetResult.success) {
    return adminActionError("That media link could not be found.");
  }

  const parsed = mediaFields.safeParse(readFields(formData, MEDIA_FIELD_NAMES));

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const context = await loadPartForWrite(session, ids);

  if (!context) {
    return adminActionError(REFUSED_PART);
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("mock_test_media_assets")
    .update({
      ...parsed.data,
      updated_by: session.userId,
    })
    .eq("id", assetResult.data)
    // Scoped to the part from the URL as well, so a media id belonging
    // to another part cannot be edited through this form.
    .eq("part_id", ids.partId);

  if (error) {
    return adminActionError(
      ...describeWriteError("updateMockTestMediaAsset", error, "media link", {
        id: assetResult.data,
      }),
    );
  }

  revalidatePartContentPaths(ids);

  return adminActionSuccess("Media link saved.");
}

// Remove a media link from a part.
//
// Questions pointing at it keep working: mock_test_questions.media_asset_id
// is declared on delete set null, so a question loses its attachment
// rather than being deleted alongside the asset. The gap then shows up
// in the part content check.
export async function deleteMockTestMediaAsset(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const ids = readPartIds(formData);
  const assetResult = uuid.safeParse(formData.get("media_asset_id"));

  if (!ids || !assetResult.success) {
    return adminActionError("That media link could not be found.");
  }

  const context = await loadPartForWrite(session, ids);

  if (!context) {
    return adminActionError(REFUSED_PART);
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("mock_test_media_assets")
    .delete()
    .eq("id", assetResult.data)
    .eq("part_id", ids.partId);

  if (error) {
    return adminActionError(
      ...describeWriteError("deleteMockTestMediaAsset", error, "media link", {
        id: assetResult.data,
      }),
    );
  }

  revalidatePartContentPaths(ids);

  return adminActionSuccess("Media link removed.");
}

// ---------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------

// A question saves with a missing prompt or a missing stem on purpose.
// Authoring is not linear: a staff member typing eleven Reading items
// puts the numbers and the passage in first and comes back for the
// wording. The gap is reported by the part content check instead, which
// is where an unfinished question belongs.
const questionFields = z.object({
  question_type: z.enum(QUESTION_TYPES, {
    message: "Choose a question type.",
  }),
  question_number: requiredInteger(1, 500, "question number"),
  instruction: optionalText(4000, "instruction"),
  passage_text: optionalText(20000, "passage text"),
  prompt: optionalText(4000, "prompt"),
  stem: optionalText(4000, "stem"),
  helper_text: optionalText(2000, "helper text"),
  points: requiredInteger(0, 100, "points value"),
  display_order: requiredInteger(0, 999, "display order"),
  status: z.enum(["draft", "ready"], {
    message: "Choose Draft or Ready.",
  }),
  media_asset_id: optionalUuid,
});

const QUESTION_FIELD_NAMES = [
  "question_type",
  "question_number",
  "instruction",
  "passage_text",
  "prompt",
  "stem",
  "helper_text",
  "points",
  "display_order",
  "status",
  "media_asset_id",
] as const;

// Refuses a media asset that is not on this part, and returns null when
// the attachment is allowed or absent.
//
// The select only offers this part's media, so this is the direct POST
// case. Worth checking anyway: attaching another part's clip would run a
// Listening question against the wrong audio, which is the kind of
// mistake that survives a proofread.
async function checkMediaAssetBelongsToPart(
  session: AdminSession,
  ids: PartIds,
  mediaAssetId: string | null,
): Promise<AdminActionState | null> {
  if (mediaAssetId === null || !session.userId) {
    return null;
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("mock_test_media_assets")
    .select("id")
    .eq("id", mediaAssetId)
    .eq("part_id", ids.partId)
    .maybeSingle();

  if (error) {
    logAdminSupabaseError("checkMediaAssetBelongsToPart", error, {
      id: mediaAssetId,
    });

    return adminActionError(
      withDevelopmentReason("That media link could not be found.", error),
    );
  }

  if (!data) {
    return adminActionError("That media link is not on this part.", {
      media_asset_id: "Choose a media link from this part.",
    });
  }

  return null;
}

export async function createMockTestQuestion(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const ids = readPartIds(formData);

  if (!ids) {
    return adminActionError(REFUSED_PART);
  }

  const parsed = questionFields.safeParse(
    readFields(formData, QUESTION_FIELD_NAMES),
  );

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const context = await loadPartForWrite(session, ids);

  if (!context) {
    return adminActionError(REFUSED_PART);
  }

  const mismatch = await checkMediaAssetBelongsToPart(
    session,
    ids,
    parsed.data.media_asset_id,
  );

  if (mismatch) {
    return mismatch;
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("mock_test_questions")
    .insert({
      ...parsed.data,
      mock_test_id: ids.mockTestId,
      section_id: ids.sectionId,
      part_id: ids.partId,
      created_by: session.userId,
      updated_by: session.userId,
    })
    .select("id")
    .single();

  if (error) {
    return adminActionError(
      ...describeWriteError("createMockTestQuestion", error, "question", {
        id: ids.partId,
      }),
    );
  }

  revalidatePartContentPaths(ids);

  // Straight to the question screen rather than back to the part. A new
  // question is not usable until it has options and a key, and both
  // editors live there.
  redirect(`${partPath(ids)}/questions/${data.id}`);
}

export async function updateMockTestQuestion(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const ids = readPartIds(formData);
  const questionResult = uuid.safeParse(formData.get("question_id"));

  if (!ids || !questionResult.success) {
    return adminActionError(REFUSED_QUESTION);
  }

  const questionId = questionResult.data;

  const parsed = questionFields.safeParse(
    readFields(formData, QUESTION_FIELD_NAMES),
  );

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const context = await loadPartForWrite(session, ids);

  if (!context) {
    return adminActionError(REFUSED_PART);
  }

  const mismatch = await checkMediaAssetBelongsToPart(
    session,
    ids,
    parsed.data.media_asset_id,
  );

  if (mismatch) {
    return mismatch;
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("mock_test_questions")
    .update({
      ...parsed.data,
      updated_by: session.userId,
    })
    .eq("id", questionId)
    .eq("part_id", ids.partId);

  if (error) {
    return adminActionError(
      ...describeWriteError("updateMockTestQuestion", error, "question", {
        id: questionId,
      }),
    );
  }

  revalidatePartContentPaths(ids, questionId);

  return adminActionSuccess("Question saved.");
}

// Delete a question, and with it every option and its answer key.
//
// The cascade is declared in the migration rather than performed here,
// so a delete cannot half succeed and leave an orphaned key behind.
export async function deleteMockTestQuestion(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const ids = readPartIds(formData);
  const questionResult = uuid.safeParse(formData.get("question_id"));

  if (!ids || !questionResult.success) {
    return adminActionError(REFUSED_QUESTION);
  }

  const context = await loadPartForWrite(session, ids);

  if (!context) {
    return adminActionError(REFUSED_PART);
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("mock_test_questions")
    .delete()
    .eq("id", questionResult.data)
    .eq("part_id", ids.partId);

  if (error) {
    return adminActionError(
      ...describeWriteError("deleteMockTestQuestion", error, "question", {
        id: questionResult.data,
      }),
    );
  }

  revalidatePartContentPaths(ids);

  // Back to the part, because the screen this was posted from may have
  // been the question's own page, which no longer exists.
  redirect(partPath(ids));
}

// ---------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------

const optionFields = z.object({
  option_label: z
    .string()
    .trim()
    .min(1, "Enter an option label, for example A.")
    .max(20, "Keep the label under 20 characters."),
  option_text: z
    .string()
    .trim()
    .min(1, "Enter the option text.")
    .max(2000, "Keep the option text under 2000 characters."),
  display_order: requiredInteger(0, 999, "display order"),
});

const OPTION_FIELD_NAMES = [
  "option_label",
  "option_text",
  "display_order",
] as const;

export async function createMockTestOption(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const ids = readPartIds(formData);
  const questionResult = uuid.safeParse(formData.get("question_id"));

  if (!ids || !questionResult.success) {
    return adminActionError(REFUSED_QUESTION);
  }

  const parsed = optionFields.safeParse(
    readFields(formData, OPTION_FIELD_NAMES),
  );

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const question = await loadQuestionForWrite(
    session,
    ids,
    questionResult.data,
  );

  if (!question) {
    return adminActionError(REFUSED_QUESTION);
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("mock_test_options").insert({
    ...parsed.data,
    question_id: question.id,
  });

  if (error) {
    return adminActionError(
      ...describeWriteError("createMockTestOption", error, "option", {
        id: question.id,
      }),
    );
  }

  revalidatePartContentPaths(ids, question.id);

  return adminActionSuccess("Option added.");
}

export async function updateMockTestOption(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const ids = readPartIds(formData);
  const questionResult = uuid.safeParse(formData.get("question_id"));
  const optionResult = uuid.safeParse(formData.get("option_id"));

  if (!ids || !questionResult.success || !optionResult.success) {
    return adminActionError("That option could not be found.");
  }

  const parsed = optionFields.safeParse(
    readFields(formData, OPTION_FIELD_NAMES),
  );

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const question = await loadQuestionForWrite(
    session,
    ids,
    questionResult.data,
  );

  if (!question) {
    return adminActionError(REFUSED_QUESTION);
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("mock_test_options")
    .update(parsed.data)
    .eq("id", optionResult.data)
    .eq("question_id", question.id);

  if (error) {
    return adminActionError(
      ...describeWriteError("updateMockTestOption", error, "option", {
        id: optionResult.data,
      }),
    );
  }

  revalidatePartContentPaths(ids, question.id);

  return adminActionSuccess("Option saved.");
}

// Delete one option.
//
// Refused while it is the correct answer. The foreign key is declared on
// delete set null, so the database would allow this and quietly leave an
// answer key pointing at nothing. Saying so is better than repairing it
// silently: the staff member deleting option C is the only one who knows
// which option should be correct instead.
export async function deleteMockTestOption(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const ids = readPartIds(formData);
  const questionResult = uuid.safeParse(formData.get("question_id"));
  const optionResult = uuid.safeParse(formData.get("option_id"));

  if (!ids || !questionResult.success || !optionResult.success) {
    return adminActionError("That option could not be found.");
  }

  const question = await loadQuestionForWrite(
    session,
    ids,
    questionResult.data,
  );

  if (!question) {
    return adminActionError(REFUSED_QUESTION);
  }

  const supabase = getSupabaseAdmin();

  const { data: key, error: keyError } = await supabase
    .from("mock_test_answer_keys")
    .select("id")
    .eq("question_id", question.id)
    .eq("correct_option_id", optionResult.data)
    .maybeSingle();

  if (keyError) {
    logAdminSupabaseError("deleteMockTestOption:key", keyError, {
      id: optionResult.data,
    });

    return adminActionError(
      withDevelopmentReason(
        "The option could not be removed. Try again.",
        keyError,
      ),
    );
  }

  if (key) {
    return adminActionError(
      "That option is the correct answer for this question. Choose a different correct option in the answer key first, then remove it.",
    );
  }

  const { error } = await supabase
    .from("mock_test_options")
    .delete()
    .eq("id", optionResult.data)
    .eq("question_id", question.id);

  if (error) {
    return adminActionError(
      ...describeWriteError("deleteMockTestOption", error, "option", {
        id: optionResult.data,
      }),
    );
  }

  revalidatePartContentPaths(ids, question.id);

  return adminActionSuccess("Option removed.");
}

// ---------------------------------------------------------------------
// Answer keys
// ---------------------------------------------------------------------
//
// ADMIN ONLY. Everything below writes mock_test_answer_keys, the one
// table in the project where a mistake hands a learner the answers. Row
// level security grants it no policy for anon or authenticated at all,
// so the service role client reached after requireAdmin is the only
// route to it, and no learner route reads it because ADMIN-02 builds no
// learner route.

const answerKeyFields = z.object({
  correct_option_id: optionalUuid,
  correct_text: optionalText(2000, "correct text"),
  explanation: optionalText(4000, "explanation"),
  points: requiredInteger(1, 100, "points value"),
});

const ANSWER_KEY_FIELD_NAMES = [
  "correct_option_id",
  "correct_text",
  "explanation",
  "points",
] as const;

// Refuses a correct option that is not on this question, and returns
// null when the choice is allowed or absent.
//
// This is the check the whole answer key model rests on. A key pointing
// at another question's option would mark every attempt wrong and still
// look right on screen, because an option id is not something a
// proofread catches.
async function checkOptionBelongsToQuestion(
  session: AdminSession,
  questionId: string,
  optionId: string | null,
): Promise<AdminActionState | null> {
  if (optionId === null || !session.userId) {
    return null;
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("mock_test_options")
    .select("id")
    .eq("id", optionId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (error) {
    logAdminSupabaseError("checkOptionBelongsToQuestion", error, {
      id: optionId,
    });

    return adminActionError(
      withDevelopmentReason("That option could not be found.", error),
    );
  }

  if (!data) {
    return adminActionError("That option is not on this question.", {
      correct_option_id: "Choose an option from this question.",
    });
  }

  return null;
}

// Create the answer key for a question, or replace the one it has.
//
// An upsert rather than an append, because a question has exactly one
// key. Written as a read then a write rather than a Postgres upsert, so
// the editor behaves the same on a database where the unique index was
// skipped, which the migration does when a legacy table already holds
// two keys for one question.
export async function setMockTestAnswerKey(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const ids = readPartIds(formData);
  const questionResult = uuid.safeParse(formData.get("question_id"));

  if (!ids || !questionResult.success) {
    return adminActionError(REFUSED_QUESTION);
  }

  const parsed = answerKeyFields.safeParse(
    readFields(formData, ANSWER_KEY_FIELD_NAMES),
  );

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const question = await loadQuestionForWrite(
    session,
    ids,
    questionResult.data,
  );

  if (!question) {
    return adminActionError(REFUSED_QUESTION);
  }

  const mismatch = await checkOptionBelongsToQuestion(
    session,
    question.id,
    parsed.data.correct_option_id,
  );

  if (mismatch) {
    return mismatch;
  }

  const supabase = getSupabaseAdmin();

  const existingId = await findAnswerKeyId(question.id);

  if (existingId.error) {
    return adminActionError(
      ...describeWriteError(
        "setMockTestAnswerKey:read",
        existingId.error,
        "answer key",
        { id: question.id },
      ),
    );
  }

  const { error } = existingId.id
    ? await supabase
        .from("mock_test_answer_keys")
        .update({ ...parsed.data, updated_by: session.userId })
        .eq("id", existingId.id)
        .eq("question_id", question.id)
    : await supabase.from("mock_test_answer_keys").insert({
        ...parsed.data,
        question_id: question.id,
        created_by: session.userId,
        updated_by: session.userId,
      });

  if (error) {
    return adminActionError(
      ...describeWriteError("setMockTestAnswerKey", error, "answer key", {
        id: question.id,
      }),
    );
  }

  revalidatePartContentPaths(ids, question.id);

  return adminActionSuccess("Answer key saved.");
}

// Edit an answer key that already exists.
//
// Separate from setMockTestAnswerKey rather than an alias for it, and
// the difference is the refusal: this one will not create a key. A form
// that believes it is editing a key, posting against a question whose
// key was deleted in another tab, should hear about it instead of
// silently creating one.
export async function updateMockTestAnswerKey(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const ids = readPartIds(formData);
  const questionResult = uuid.safeParse(formData.get("question_id"));

  if (!ids || !questionResult.success) {
    return adminActionError(REFUSED_QUESTION);
  }

  const parsed = answerKeyFields.safeParse(
    readFields(formData, ANSWER_KEY_FIELD_NAMES),
  );

  if (!parsed.success) {
    return adminActionError(
      "Check the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const question = await loadQuestionForWrite(
    session,
    ids,
    questionResult.data,
  );

  if (!question) {
    return adminActionError(REFUSED_QUESTION);
  }

  const mismatch = await checkOptionBelongsToQuestion(
    session,
    question.id,
    parsed.data.correct_option_id,
  );

  if (mismatch) {
    return mismatch;
  }

  const existingId = await findAnswerKeyId(question.id);

  if (existingId.error) {
    return adminActionError(
      ...describeWriteError(
        "updateMockTestAnswerKey:read",
        existingId.error,
        "answer key",
        { id: question.id },
      ),
    );
  }

  if (!existingId.id) {
    return adminActionError(
      "This question has no answer key to edit. Set one instead.",
    );
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("mock_test_answer_keys")
    .update({ ...parsed.data, updated_by: session.userId })
    .eq("id", existingId.id)
    .eq("question_id", question.id);

  if (error) {
    return adminActionError(
      ...describeWriteError("updateMockTestAnswerKey", error, "answer key", {
        id: question.id,
      }),
    );
  }

  revalidatePartContentPaths(ids, question.id);

  return adminActionSuccess("Answer key saved.");
}

// Remove the answer key from a question.
//
// The question stays, and the part content check immediately reports it
// as unmarkable, which is the state a staff member asked for by deleting
// the key.
export async function deleteMockTestAnswerKey(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const ids = readPartIds(formData);
  const questionResult = uuid.safeParse(formData.get("question_id"));

  if (!ids || !questionResult.success) {
    return adminActionError(REFUSED_QUESTION);
  }

  const question = await loadQuestionForWrite(
    session,
    ids,
    questionResult.data,
  );

  if (!question) {
    return adminActionError(REFUSED_QUESTION);
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("mock_test_answer_keys")
    .delete()
    .eq("question_id", question.id);

  if (error) {
    return adminActionError(
      ...describeWriteError("deleteMockTestAnswerKey", error, "answer key", {
        id: question.id,
      }),
    );
  }

  revalidatePartContentPaths(ids, question.id);

  return adminActionSuccess("Answer key removed.");
}

// The id of the answer key on a question, or null when it has none.
//
// Returns the Supabase error rather than throwing it, because both
// callers already have a form to put a message on and a thrown error
// there would render an error boundary over a filled in key editor.
async function findAnswerKeyId(
  questionId: string,
): Promise<{ id: string | null; error: SupabaseErrorLike | null }> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("mock_test_answer_keys")
    .select("id")
    .eq("question_id", questionId)
    .limit(1);

  if (error) {
    return { id: null, error };
  }

  const rows = (data ?? []) as { id: string }[];

  return { id: rows[0]?.id ?? null, error: null };
}

// ---------------------------------------------------------------------
// Part content validation
// ---------------------------------------------------------------------

// Run every content rule for one part and report what it found.
//
// The rules live in src/features/admin/mock-test-content-validation.ts
// and touch no database, so the part detail screen and the part preview
// show the same findings on every render without this action running.
// What this adds is a check a staff member can ask for deliberately, and
// a sentence that says whether the part is finished.
//
// Unlike validateMockTestStructure, this writes nothing. The cached rows
// in mock_test_validation_issues belong to the structure check, which
// rewrites them wholesale for a whole practice test, so part level rows
// added here would be deleted by the next structure run. Recomputing one
// part is cheap and always current.
export async function validatePartContent(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!session) {
    return adminActionError(REFUSED);
  }

  const ids = readPartIds(formData);

  if (!ids) {
    return adminActionError(REFUSED_PART);
  }

  const context = await loadPartForWrite(session, ids);

  if (!context) {
    return adminActionError(REFUSED_PART);
  }

  const content = await getPartContent(session, ids.partId);
  const summary = evaluatePartContent(content);

  revalidatePartContentPaths(ids);

  if (summary.issues.length === 0) {
    return adminActionSuccess(
      `Content checks passed. ${summary.questionCount} question${summary.questionCount === 1 ? "" : "s"} worth ${summary.totalPoints} point${summary.totalPoints === 1 ? "" : "s"}. Timers, scoring rules and rubrics are checked in later tickets.`,
    );
  }

  const counted: string[] = [];

  if (summary.errorCount > 0) {
    counted.push(
      `${summary.errorCount} ${summary.errorCount === 1 ? "problem" : "problems"}`,
    );
  }

  if (summary.warningCount > 0) {
    counted.push(
      `${summary.warningCount} ${summary.warningCount === 1 ? "warning" : "warnings"}`,
    );
  }

  return adminActionSuccess(
    `Content checked: ${counted.join(" and ")}. The list is below and on the part preview.`,
  );
}
