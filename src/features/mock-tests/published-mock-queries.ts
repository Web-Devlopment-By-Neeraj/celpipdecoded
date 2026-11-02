// Server-only reads of published builder tests for student pages.
//
// Row level security on the builder tables denies signed-in students, so
// this module uses the service role client. That is safe only because
// every select lists columns by name and never reads mock_test_answer_keys,
// internal_notes, or media transcripts. Scoring lives in the submit
// action and loads keys in its own query.
//
// Do not import this file from a client component.

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SectionType } from "@/features/admin/mock-test-types";
import { reportAdminReadError } from "@/features/admin/admin-supabase-error";
import {
  assembleLearnerMockTest,
  summarizeLearnerMockTest,
  type LearnerMockTest,
  type LearnerMockTestSummary,
  type PublishedMediaRow,
  type PublishedOptionRow,
  type PublishedPartRow,
  type PublishedQuestionRow,
  type PublishedSectionRow,
  type PublishedTestRow,
} from "./published-mock-catalog";

const TEST_COLUMNS = "id, slug, title, description";
const SECTION_COLUMNS =
  "id, mock_test_id, section_type, title, instructions, section_order";
const PART_COLUMNS =
  "id, section_id, title, part_type, instructions, part_order, prep_time_seconds, response_time_seconds";
const QUESTION_COLUMNS =
  "id, part_id, question_type, question_number, prompt, instruction, passage_text, stem, helper_text, points, display_order";
const OPTION_COLUMNS = "id, question_id, option_label, option_text, display_order";
const MEDIA_COLUMNS =
  "id, part_id, media_type, url, title, alt_text, display_order";

export async function listPublishedMockSummaries(): Promise<
  LearnerMockTestSummary[]
> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("mock_tests")
    .select(`${TEST_COLUMNS}, created_at`)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error) {
    throw reportAdminReadError(
      "listPublishedMockSummaries",
      error,
      "Published practice tests could not be loaded.",
    );
  }

  const tests = (data ?? []) as (PublishedTestRow & { created_at: string })[];

  if (tests.length === 0) {
    return [];
  }

  const { data: sections, error: sectionError } = await supabase
    .from("mock_test_sections")
    .select("mock_test_id, section_type, section_order")
    .in(
      "mock_test_id",
      tests.map((test) => test.id),
    );

  if (sectionError) {
    throw reportAdminReadError(
      "listPublishedMockSummaries:sections",
      sectionError,
      "Published practice tests could not be loaded.",
    );
  }

  const byTest = new Map<string, { sectionType: SectionType; order: number }[]>();

  for (const section of (sections ?? []) as {
    mock_test_id: string;
    section_type: SectionType;
    section_order: number;
  }[]) {
    const list = byTest.get(section.mock_test_id) ?? [];
    list.push({
      sectionType: section.section_type,
      order: section.section_order,
    });
    byTest.set(section.mock_test_id, list);
  }

  return tests.map((test) =>
    summarizeLearnerMockTest({
      slug: test.slug,
      title: test.title,
      description: test.description,
      sections: [...(byTest.get(test.id) ?? [])]
        .sort((a, b) => a.order - b.order)
        .map((section) => ({
          sectionType: section.sectionType,
          order: section.order,
        })),
    }),
  );
}

export async function getPublishedMockTestForLearner(
  slug: string,
): Promise<LearnerMockTest | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("mock_tests")
    .select(TEST_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw reportAdminReadError(
      "getPublishedMockTestForLearner",
      error,
      "That practice test could not be loaded.",
      { slug },
    );
  }

  if (!data) {
    return null;
  }

  const test = data as PublishedTestRow;
  const { data: sections, error: sectionError } = await supabase
    .from("mock_test_sections")
    .select(SECTION_COLUMNS)
    .eq("mock_test_id", test.id);

  if (sectionError) {
    throw reportAdminReadError(
      "getPublishedMockTestForLearner:sections",
      sectionError,
      "That practice test could not be loaded.",
      { id: test.id },
    );
  }

  const sectionRows = (sections ?? []) as PublishedSectionRow[];
  const { data: parts, error: partError } = await supabase
    .from("mock_test_parts")
    .select(PART_COLUMNS)
    .eq("mock_test_id", test.id);

  if (partError) {
    throw reportAdminReadError(
      "getPublishedMockTestForLearner:parts",
      partError,
      "That practice test could not be loaded.",
      { id: test.id },
    );
  }

  const partRows = (parts ?? []) as PublishedPartRow[];
  const { data: questions, error: questionError } = await supabase
    .from("mock_test_questions")
    .select(QUESTION_COLUMNS)
    .eq("mock_test_id", test.id);

  if (questionError) {
    throw reportAdminReadError(
      "getPublishedMockTestForLearner:questions",
      questionError,
      "That practice test could not be loaded.",
      { id: test.id },
    );
  }

  const questionRows = (questions ?? []) as PublishedQuestionRow[];
  const questionIds = questionRows.map((question) => question.id);

  const [optionsResult, mediaResult] = await Promise.all([
    questionIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from("mock_test_options")
          .select(OPTION_COLUMNS)
          .in("question_id", questionIds),
    supabase
      .from("mock_test_media_assets")
      .select(MEDIA_COLUMNS)
      .eq("mock_test_id", test.id),
  ]);

  if (optionsResult.error) {
    throw reportAdminReadError(
      "getPublishedMockTestForLearner:options",
      optionsResult.error,
      "That practice test could not be loaded.",
      { id: test.id },
    );
  }

  if (mediaResult.error) {
    throw reportAdminReadError(
      "getPublishedMockTestForLearner:media",
      mediaResult.error,
      "That practice test could not be loaded.",
      { id: test.id },
    );
  }

  return assembleLearnerMockTest({
    test,
    sections: sectionRows,
    parts: partRows,
    questions: questionRows,
    options: (optionsResult.data ?? []) as PublishedOptionRow[],
    media: (mediaResult.data ?? []) as PublishedMediaRow[],
  });
}
