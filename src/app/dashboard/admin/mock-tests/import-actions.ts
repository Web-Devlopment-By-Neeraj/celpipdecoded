"use server";

import { revalidatePath } from "next/cache";
import type { PartType, SectionType } from "@/features/admin/mock-test-types";
import {
  SECTION_TYPE_EXAM_ORDER,
  SECTION_TYPE_LABELS,
} from "@/features/admin/mock-test-types";
import type { QuestionType } from "@/features/admin/mock-test-content-types";
import {
  idleMockImportState,
  parseMockImportCsv,
  type ImportPart,
  type MockImportActionState,
  type MockPublishState,
} from "@/features/mock-tests/mock-import-format";
import { partExamTemplate } from "@/features/mock-tests/part-exam-templates";
import {
  BUILT_IN_MOCK_SLUG,
  publishBlockers,
} from "@/features/mock-tests/published-mock-catalog";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const LIST_PATH = "/dashboard/admin/mock-tests";
const HUB_PATH = "/dashboard/mock-tests";
const MAX_FILE_CHARS = 1_500_000;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const SECTION_MINUTES: Record<SectionType, number> = {
  listening: 47,
  reading: 55,
  writing: 53,
  speaking: 20,
};

export async function importMockTestFile(
  _previous: MockImportActionState,
  formData: FormData,
): Promise<MockImportActionState> {
  const session = await requireAdmin();

  if (!session) {
    return {
      ...idleMockImportState,
      status: "error",
      message: "Sign in as staff to upload a practice test.",
    };
  }

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const file = formData.get("file");
  const issues = slugIssues(title, slug);

  if (!(file instanceof File) || file.size === 0) {
    issues.push({
      severity: "error",
      message: "Choose the filled-in template file.",
    });
  } else if (file.size > MAX_FILE_CHARS) {
    issues.push({
      severity: "error",
      message: "That file is too large. Keep the template under 1.5 MB.",
    });
  }

  if (issues.some((issue) => issue.severity === "error")) {
    return { status: "invalid", message: "Fix the form, then upload again.", issues };
  }

  const text = await (file as File).text();
  const parsed = parseMockImportCsv(text);

  if (!parsed.canSave) {
    return {
      status: "invalid",
      message: "Nothing was saved. Fix the file and upload it again.",
      issues: parsed.issues,
    };
  }

  const supabase = getSupabaseAdmin();
  const { data: existing, error: existingError } = await supabase
    .from("mock_tests")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingError) {
    console.error("[mock-import] slug lookup failed", existingError.code);
    return {
      ...idleMockImportState,
      status: "error",
      message: "The practice test could not be saved. Try the upload again.",
    };
  }

  if (existing) {
    return {
      status: "invalid",
      message: "Nothing was saved.",
      issues: [
        {
          severity: "error",
          message: `The slug ${slug} is already used. Choose the next number, such as mock-test-3.`,
        },
      ],
    };
  }

  const { data: created, error: createError } = await supabase
    .from("mock_tests")
    .insert({
      title,
      slug,
      description: "Uploaded from a content file.",
      status: "draft",
      version: 1,
      created_by: session.userId,
      updated_by: session.userId,
    })
    .select("id")
    .single();

  if (createError || !created) {
    console.error("[mock-import] test insert failed", createError?.code);
    return {
      ...idleMockImportState,
      status: "error",
      message: "The practice test could not be saved. Try the upload again.",
    };
  }

  const testId = created.id as string;

  try {
    for (const section of parsed.sections) {
      await insertSection(testId, session.userId, section.skill, section.parts);
    }
  } catch (error) {
    console.error(
      "[mock-import] content insert failed",
      error instanceof Error ? error.message : "unknown",
    );
    await supabase.from("mock_tests").delete().eq("id", testId);

    return {
      ...idleMockImportState,
      status: "error",
      message: "The practice test could not be saved. Nothing was kept. Try the upload again.",
    };
  }

  revalidatePath(LIST_PATH);
  revalidatePath(HUB_PATH);

  const warnings = parsed.issues.filter((issue) => issue.severity === "warning");

  return {
    status: "saved",
    message: `Saved ${title} as a draft. Students cannot see it until you press Publish.`,
    issues: warnings,
  };
}

export async function setImportedMockStatus(
  _previous: MockPublishState,
  formData: FormData,
): Promise<MockPublishState> {
  const session = await requireAdmin();

  if (!session) {
    return { tone: "error", message: "Sign in as staff to change this test." };
  }

  const id = String(formData.get("mock_test_id") ?? "");
  const intent = String(formData.get("intent") ?? "");

  if (!/^[0-9a-f-]{36}$/i.test(id) || (intent !== "publish" && intent !== "unpublish")) {
    return { tone: "error", message: "That practice test could not be found." };
  }

  const supabase = getSupabaseAdmin();
  const { data: test, error } = await supabase
    .from("mock_tests")
    .select("id, slug, status")
    .eq("id", id)
    .maybeSingle();

  if (error || !test) {
    return { tone: "error", message: "That practice test could not be found." };
  }

  const slug = String(test.slug);

  if (intent === "unpublish") {
    const { error: updateError } = await supabase
      .from("mock_tests")
      .update({ status: "draft", updated_by: session.userId })
      .eq("id", id);

    if (updateError) {
      return { tone: "error", message: "The practice test could not be unpublished." };
    }

    revalidatePath(LIST_PATH);
    revalidatePath(HUB_PATH);
    revalidatePath(`${HUB_PATH}/${slug}`);
    return { tone: "ok", message: "Unpublished. Students can no longer open it." };
  }

  const blockers = await collectPublishBlockers(id, slug);

  if (blockers.length > 0) {
    return { tone: "error", message: blockers[0] ?? "This test is not ready to publish." };
  }

  const { error: publishError } = await supabase
    .from("mock_tests")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      updated_by: session.userId,
    })
    .eq("id", id);

  if (publishError) {
    console.error("[mock-import] publish failed", publishError.code);
    return { tone: "error", message: "The practice test could not be published." };
  }

  revalidatePath(LIST_PATH);
  revalidatePath(HUB_PATH);
  revalidatePath(`${HUB_PATH}/${slug}`);

  return {
    tone: "ok",
    message: "Published. Students with Test Sprint can open it from Mock tests.",
  };
}

function slugIssues(title: string, slug: string) {
  const issues: MockImportActionState["issues"] = [];

  if (!title || title.length > 200) {
    issues.push({
      severity: "error",
      message: "Enter a title of 200 characters or fewer.",
    });
  }

  if (!SLUG_PATTERN.test(slug) || slug.length > 120) {
    issues.push({
      severity: "error",
      message: "Use a slug such as mock-test-2. Lowercase letters, numbers and single hyphens.",
    });
  } else if (slug === BUILT_IN_MOCK_SLUG) {
    issues.push({
      severity: "error",
      message: "mock-test-1 is the built-in free test. Use mock-test-2 or later.",
    });
  }

  return issues;
}

async function insertSection(
  testId: string,
  userId: string,
  skill: SectionType,
  parts: ImportPart[],
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: section, error } = await supabase
    .from("mock_test_sections")
    .insert({
      mock_test_id: testId,
      section_type: skill,
      title: SECTION_TYPE_LABELS[skill],
      instructions: null,
      section_order: SECTION_TYPE_EXAM_ORDER[skill],
      estimated_duration_minutes: SECTION_MINUTES[skill],
      scoring_type: skill === "listening" || skill === "reading" ? "objective" : "ai_rubric",
      status: "ready",
      created_by: userId,
      updated_by: userId,
    })
    .select("id")
    .single();

  if (error || !section) {
    throw new Error(error?.code ?? "section");
  }

  for (let index = 0; index < parts.length; index += 1) {
    await insertPart(testId, section.id as string, userId, skill, parts[index], index + 1);
  }
}

async function insertPart(
  testId: string,
  sectionId: string,
  userId: string,
  skill: SectionType,
  part: ImportPart,
  order: number,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const template = partExamTemplate(part.partType);
  const productive = skill === "writing" || skill === "speaking";
  const { data: created, error } = await supabase
    .from("mock_test_parts")
    .insert({
      mock_test_id: testId,
      section_id: sectionId,
      title: part.title,
      part_type: part.partType,
      instructions: part.content,
      part_order: order,
      timer_type: productive
        ? skill === "speaking"
          ? "prep_and_recording"
          : "per_part"
        : skill === "reading"
          ? "per_part"
          : "untimed",
      prep_time_seconds: skill === "speaking" ? template.prepSeconds : null,
      response_time_seconds: skill === "speaking" ? template.responseSeconds : null,
      question_count: productive ? null : part.questions.length,
      status: "ready",
      created_by: userId,
      updated_by: userId,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.code ?? "part");
  }

  const partId = created.id as string;

  if (part.audioUrl) {
    await insertMedia(testId, sectionId, partId, userId, {
      media_type: "audio",
      url: part.audioUrl,
      title: part.title,
      alt_text: null,
      display_order: 0,
    });
  }

  if (part.imageUrl) {
    await insertMedia(testId, sectionId, partId, userId, {
      media_type: "image",
      url: part.imageUrl,
      title: part.title,
      alt_text: part.imageAlt,
      display_order: 1,
    });
  }

  if (part.questions.length === 0) {
    return;
  }

  const { data: questions, error: questionError } = await supabase
    .from("mock_test_questions")
    .insert(
      part.questions.map((question) => ({
        mock_test_id: testId,
        section_id: sectionId,
        part_id: partId,
        question_type: questionTypeFor(part.partType),
        question_number: question.number,
        prompt: question.prompt,
        passage_text: part.content,
        points: 1,
        display_order: question.number,
        is_required: true,
        status: "ready",
        created_by: userId,
        updated_by: userId,
      })),
    )
    .select("id, question_number");

  if (questionError || !questions) {
    throw new Error(questionError?.code ?? "question");
  }

  const idByNumber = new Map(
    (questions as { id: string; question_number: number }[]).map((question) => [
      question.question_number,
      question.id,
    ]),
  );

  const optionRows = part.questions.flatMap((question) => {
    const questionId = idByNumber.get(question.number);

    if (!questionId) {
      return [];
    }

    return question.options.map((option, index) => ({
      question_id: questionId,
      option_label: option.label,
      option_text: option.text,
      display_order: index,
    }));
  });

  const { data: options, error: optionError } = await supabase
    .from("mock_test_options")
    .insert(optionRows)
    .select("id, question_id, option_label");

  if (optionError || !options) {
    throw new Error(optionError?.code ?? "option");
  }

  const optionId = new Map(
    (options as { id: string; question_id: string; option_label: string }[]).map(
      (option) => [`${option.question_id}:${option.option_label}`, option.id],
    ),
  );

  const keyRows = part.questions.flatMap((question) => {
    const questionId = idByNumber.get(question.number);
    const correctOptionId = questionId
      ? optionId.get(`${questionId}:${question.correctLabel}`)
      : undefined;

    if (!questionId || !correctOptionId) {
      return [];
    }

    return [
      {
        question_id: questionId,
        correct_option_id: correctOptionId,
        explanation: question.explanation,
        points: 1,
        created_by: userId,
        updated_by: userId,
      },
    ];
  });

  if (keyRows.length !== part.questions.length) {
    throw new Error("key");
  }

  const { error: keyError } = await supabase.from("mock_test_answer_keys").insert(keyRows);

  if (keyError) {
    throw new Error(keyError.code ?? "key");
  }
}

async function insertMedia(
  testId: string,
  sectionId: string,
  partId: string,
  userId: string,
  asset: {
    media_type: "audio" | "image";
    url: string;
    title: string;
    alt_text: string | null;
    display_order: number;
  },
): Promise<void> {
  const { error } = await getSupabaseAdmin().from("mock_test_media_assets").insert({
    ...asset,
    mock_test_id: testId,
    section_id: sectionId,
    part_id: partId,
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    throw new Error(error.code ?? "media");
  }
}

function questionTypeFor(partType: PartType): QuestionType {
  if (partType === "reading_correspondence") return "reading_correspondence_choice";
  if (partType === "reading_information") return "reading_information_choice";
  if (partType === "reading_viewpoints") return "reading_viewpoints_choice";
  return "single_choice";
}

async function collectPublishBlockers(testId: string, slug: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data: sections, error: sectionError } = await supabase
    .from("mock_test_sections")
    .select("id, section_type")
    .eq("mock_test_id", testId);

  if (sectionError || !sections) {
    return ["This practice test could not be checked."];
  }

  const sectionType = new Map(
    (sections as { id: string; section_type: SectionType }[]).map((section) => [
      section.id,
      section.section_type,
    ]),
  );
  const { data: parts, error: partError } = await supabase
    .from("mock_test_parts")
    .select("id, section_id, title, instructions")
    .eq("mock_test_id", testId);

  if (partError || !parts) {
    return ["This practice test could not be checked."];
  }

  const partRows = parts as {
    id: string;
    section_id: string;
    title: string;
    instructions: string | null;
  }[];
  const partIds = partRows.map((part) => part.id);
  const questions = partIds.length
    ? await supabase
        .from("mock_test_questions")
        .select(
          "id, part_id, question_type, question_number, prompt, instruction, passage_text, stem, helper_text, points, display_order, is_required, status",
        )
        .in("part_id", partIds)
    : { data: [], error: null };

  if (questions.error || !questions.data) {
    return ["This practice test could not be checked."];
  }

  const questionRows = questions.data as {
    id: string;
    part_id: string;
    question_type: QuestionType;
    question_number: number;
    prompt: string | null;
    instruction: string | null;
    passage_text: string | null;
    stem: string | null;
    helper_text: string | null;
    points: number;
    display_order: number;
    is_required: boolean;
    status: "draft" | "ready";
  }[];
  const questionIds = questionRows.map((question) => question.id);
  const optionResult = questionIds.length
    ? await supabase
        .from("mock_test_options")
        .select("id, question_id, option_label, option_text, display_order")
        .in("question_id", questionIds)
    : { data: [], error: null };
  const keyResult = questionIds.length
    ? await supabase
        .from("mock_test_answer_keys")
        .select("id, question_id, correct_option_id, correct_text, explanation, points")
        .in("question_id", questionIds)
    : { data: [], error: null };

  if (optionResult.error || keyResult.error || !optionResult.data || !keyResult.data) {
    return ["This practice test could not be checked."];
  }

  return publishBlockers({
    slug,
    structureErrorCount: 0,
    parts: partRows.map((part) => ({
      title: part.title,
      sectionType: sectionType.get(part.section_id) ?? "listening",
      instructions: part.instructions,
      content: {
        media: [],
        questions: questionRows
          .filter((question) => question.part_id === part.id)
          .map((question) => ({
            ...question,
            mock_test_id: testId,
            section_id: part.section_id,
            media_asset_id: null,
            options: (optionResult.data ?? []).filter(
              (option) => option.question_id === question.id,
            ),
            answerKey:
              (keyResult.data ?? []).find((key) => key.question_id === question.id) ??
              null,
          })),
      },
    })),
  });
}
