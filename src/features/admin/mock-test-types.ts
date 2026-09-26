// Shared vocabulary for the ADMIN-01 mock test builder.
//
// Every list here matches a check constraint in
// supabase/migrations/013_mock_test_builder_admin_foundation.sql. The
// database is the authority; these arrays exist so a form can render the
// same options the database will accept, and so a server action can
// reject a bad value before it becomes a Postgres error.
//
// Nothing in this file is learner facing. Wording follows the house
// rule: practice test, estimated level, never official CELPIP score.

import type { StatusToneName } from "@/features/design/status-styles";

// ---------------------------------------------------------------------
// Mock test status
// ---------------------------------------------------------------------

export const MOCK_TEST_STATUSES = [
  "draft",
  "internal_preview",
  "published",
  "archived",
] as const;

export type MockTestStatus = (typeof MOCK_TEST_STATUSES)[number];

export const MOCK_TEST_STATUS_LABELS: Record<MockTestStatus, string> = {
  draft: "Draft",
  internal_preview: "Internal preview",
  published: "Published",
  archived: "Archived",
};

export const MOCK_TEST_STATUS_HINTS: Record<MockTestStatus, string> = {
  draft: "Being authored. Not visible to students.",
  internal_preview: "Staff review only. Still not visible to students.",
  published:
    "Reserved. Publishing stays blocked until a later ticket adds questions, answer keys and timers.",
  archived: "Retired. Not visible to students.",
};

export const MOCK_TEST_STATUS_TONES: Record<MockTestStatus, StatusToneName> = {
  draft: "neutral",
  internal_preview: "info",
  published: "success",
  archived: "warning",
};

// Publishing is not built in ADMIN-01. The status is allowed by the
// database so the vocabulary is settled, but the server action refuses
// the move, because a published test would need questions, answer keys,
// timers and scoring rules that no ticket has built yet.
export const PUBLISHABLE_IN_ADMIN_01 = false;

// ---------------------------------------------------------------------
// Section skills
// ---------------------------------------------------------------------

export const SECTION_TYPES = [
  "listening",
  "reading",
  "writing",
  "speaking",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

// Exam order. Used to sort a preview when section_order has not been set
// consistently, and to suggest the next order number on the add form.
export const SECTION_TYPE_EXAM_ORDER: Record<SectionType, number> = {
  listening: 1,
  reading: 2,
  writing: 3,
  speaking: 4,
};

// ---------------------------------------------------------------------
// Section scoring type
// ---------------------------------------------------------------------

export const SCORING_TYPES = ["objective", "ai_rubric"] as const;

export type ScoringType = (typeof SCORING_TYPES)[number];

export const SCORING_TYPE_LABELS: Record<ScoringType, string> = {
  objective: "Objective marking",
  ai_rubric: "AI rubric review",
};

// What each skill normally uses, offered as the default on the form.
// Listening and Reading are marked against an answer key. Writing and
// Speaking get an AI review that reports an estimated level and is not
// an official CELPIP score.
export const DEFAULT_SCORING_TYPE: Record<SectionType, ScoringType> = {
  listening: "objective",
  reading: "objective",
  writing: "ai_rubric",
  speaking: "ai_rubric",
};

// ---------------------------------------------------------------------
// Section and part working status
// ---------------------------------------------------------------------

export const BUILD_STATUSES = ["draft", "ready"] as const;

export type BuildStatus = (typeof BUILD_STATUSES)[number];

export const BUILD_STATUS_LABELS: Record<BuildStatus, string> = {
  draft: "Draft",
  ready: "Ready",
};

export const BUILD_STATUS_TONES: Record<BuildStatus, StatusToneName> = {
  draft: "neutral",
  ready: "success",
};

// ---------------------------------------------------------------------
// Part types
// ---------------------------------------------------------------------

// One entry per shape the four sections use, taken from
// docs/admin/mock-test-builder-workflow.md section 4.
export const PART_TYPES = [
  "listening_problem_solving",
  "listening_daily_conversation",
  "listening_information",
  "listening_news_item",
  "listening_discussion",
  "listening_viewpoints",
  "reading_correspondence",
  "reading_diagram",
  "reading_information",
  "reading_viewpoints",
  "writing_email",
  "writing_survey",
  "speaking_task",
  "speaking_image_task",
  "speaking_comparison_task",
] as const;

export type PartType = (typeof PART_TYPES)[number];

export const PART_TYPE_LABELS: Record<PartType, string> = {
  listening_problem_solving: "Listening to Problem Solving",
  listening_daily_conversation: "Listening to a Daily Life Conversation",
  listening_information: "Listening for Information",
  listening_news_item: "Listening to a News Item",
  listening_discussion: "Listening to a Discussion",
  listening_viewpoints: "Listening to Viewpoints",
  reading_correspondence: "Reading Correspondence",
  reading_diagram: "Reading to Apply a Diagram",
  reading_information: "Reading for Information",
  reading_viewpoints: "Reading for Viewpoints",
  writing_email: "Writing an Email",
  writing_survey: "Responding to Survey Questions",
  speaking_task: "Speaking task",
  speaking_image_task: "Speaking task with a scene image",
  speaking_comparison_task: "Speaking comparison task",
};

// Which part types belong under which skill. The add part form only
// offers the types that fit the section it is adding to, and the
// validator reports a mismatch as an error.
export const PART_TYPES_BY_SECTION: Record<SectionType, readonly PartType[]> = {
  listening: [
    "listening_problem_solving",
    "listening_daily_conversation",
    "listening_information",
    "listening_news_item",
    "listening_discussion",
    "listening_viewpoints",
  ],
  reading: [
    "reading_correspondence",
    "reading_diagram",
    "reading_information",
    "reading_viewpoints",
  ],
  writing: ["writing_email", "writing_survey"],
  speaking: [
    "speaking_task",
    "speaking_image_task",
    "speaking_comparison_task",
  ],
};

// ---------------------------------------------------------------------
// Part timer type
// ---------------------------------------------------------------------

// A label for the window a part runs under. The real timer values arrive
// with mock_test_timer_rules in a later ticket, so this is a shape, not
// a clock.
export const TIMER_TYPES = [
  "per_question",
  "per_screen",
  "per_part",
  "prep_and_recording",
  "untimed",
] as const;

export type TimerType = (typeof TIMER_TYPES)[number];

export const TIMER_TYPE_LABELS: Record<TimerType, string> = {
  per_question: "One window per question",
  per_screen: "One window per screen",
  per_part: "One window for the whole part",
  prep_and_recording: "Preparation window then recording window",
  untimed: "No timer",
};

// The window each skill normally runs under, offered as the default.
export const DEFAULT_TIMER_TYPE: Record<SectionType, TimerType> = {
  listening: "per_question",
  reading: "per_part",
  writing: "per_part",
  speaking: "prep_and_recording",
};

// ---------------------------------------------------------------------
// Row shapes
// ---------------------------------------------------------------------

// These mirror the columns the builder selects. internal_notes is staff
// only and is read on the edit screen alone, never on a preview or a
// list.
export type MockTestRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: MockTestStatus;
  version: number;
  published_at: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MockTestSectionRow = {
  id: string;
  mock_test_id: string;
  section_type: SectionType;
  title: string;
  instructions: string | null;
  section_order: number;
  estimated_duration_minutes: number | null;
  scoring_type: ScoringType | null;
  status: BuildStatus;
};

export type MockTestPartRow = {
  id: string;
  mock_test_id: string;
  section_id: string;
  title: string;
  part_type: PartType | null;
  instructions: string | null;
  part_order: number;
  timer_type: TimerType | null;
  prep_time_seconds: number | null;
  response_time_seconds: number | null;
  question_count: number | null;
  status: BuildStatus;
};

// A section with its parts attached, which is what every builder screen
// actually renders.
export type MockTestSectionWithParts = MockTestSectionRow & {
  parts: MockTestPartRow[];
};

export type MockTestStructure = {
  test: MockTestRow;
  sections: MockTestSectionWithParts[];
};

// ---------------------------------------------------------------------
// Small display helpers
// ---------------------------------------------------------------------

// Turns a seconds value into something readable in a table. Returns a
// dash for null so a column stays aligned.
export function formatSeconds(value: number | null): string {
  if (value === null) {
    return "-";
  }

  if (value < 60) {
    return `${value} sec`;
  }

  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} sec`;
}

// A route parameter is untrusted text. Checking the shape before it
// reaches a uuid column turns a bad URL into a 404 instead of a Postgres
// type error.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

// Slugs are lowercase, hyphen separated, and have to match the
// mock_tests_slug_format_check constraint. Used to suggest a slug from a
// title and to clean up what a staff member types.
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
