// Learner-facing shape of a practice test authored in the builder.
//
// Two jobs, both pure:
//   1. Turn database rows into the payload a student page may render.
//      Answer keys, staff notes and listening transcripts are not fields
//      on that payload. A later score step loads keys on the server and
//      returns a result only after the student submits.
//   2. Decide which hub card a published slug fills. mock-test-1 stays
//      the built-in free test. mock-test-2 and later replace the
//      coming-soon cards.
//
// House style: normal hyphens only, straight quotes only.

import { evaluatePartContent } from "@/features/admin/mock-test-content-validation";
import type { MockTestPartContent } from "@/features/admin/mock-test-content-types";
import type { MediaType, QuestionType } from "@/features/admin/mock-test-content-types";
import {
  SECTION_TYPE_EXAM_ORDER,
  SECTION_TYPES,
  type PartType,
  type SectionType,
} from "@/features/admin/mock-test-types";

// The student Mock Test 1 route is hardcoded. A builder row must not use
// this slug, or publishing would look successful and students would still
// open the built-in test.
export const BUILT_IN_MOCK_SLUG = "mock-test-1";

// Cards that exist before any builder test is published.
export const PLACEHOLDER_MOCK_SLOTS = [2, 3, 4, 5] as const;

export type LearnerMockMedia = {
  id: string;
  mediaType: MediaType | null;
  url: string;
  title: string | null;
  altText: string | null;
};

export type LearnerMockOption = {
  id: string;
  label: string;
  text: string;
};

export type LearnerMockQuestion = {
  id: string;
  number: number;
  type: QuestionType;
  prompt: string | null;
  instruction: string | null;
  passageText: string | null;
  stem: string | null;
  helperText: string | null;
  points: number;
  options: LearnerMockOption[];
};

export type LearnerMockPart = {
  id: string;
  title: string;
  partType: PartType | null;
  instructions: string | null;
  order: number;
  prepTimeSeconds: number | null;
  responseTimeSeconds: number | null;
  media: LearnerMockMedia[];
  questions: LearnerMockQuestion[];
};

export type LearnerMockSection = {
  id: string;
  sectionType: SectionType;
  title: string;
  instructions: string | null;
  order: number;
  parts: LearnerMockPart[];
};

export type LearnerMockTest = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sections: LearnerMockSection[];
};

export type LearnerMockTestSummary = {
  slug: string;
  title: string;
  description: string | null;
  sectionTypes: SectionType[];
};

// Rows the learner query is allowed to select. Extra properties may
// arrive if a caller spreads a wider row; assembleLearnerMockTest copies
// named fields only, so those extras cannot ride along.
export type PublishedTestRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
};

export type PublishedSectionRow = {
  id: string;
  mock_test_id: string;
  section_type: SectionType;
  title: string;
  instructions: string | null;
  section_order: number;
};

export type PublishedPartRow = {
  id: string;
  section_id: string;
  title: string;
  part_type: PartType | null;
  instructions: string | null;
  part_order: number;
  prep_time_seconds: number | null;
  response_time_seconds: number | null;
};

export type PublishedQuestionRow = {
  id: string;
  part_id: string | null;
  question_type: QuestionType;
  question_number: number;
  prompt: string | null;
  instruction: string | null;
  passage_text: string | null;
  stem: string | null;
  helper_text: string | null;
  points: number;
  display_order: number;
};

export type PublishedOptionRow = {
  id: string;
  question_id: string;
  option_label: string;
  option_text: string;
  display_order: number;
};

export type PublishedMediaRow = {
  id: string;
  part_id: string | null;
  media_type: MediaType | null;
  url: string | null;
  title: string | null;
  alt_text: string | null;
  display_order: number;
};

export type PublishedMockBundle = {
  test: PublishedTestRow;
  sections: PublishedSectionRow[];
  parts: PublishedPartRow[];
  questions: PublishedQuestionRow[];
  options: PublishedOptionRow[];
  media: PublishedMediaRow[];
};

export function isSectionType(value: string): value is SectionType {
  return (SECTION_TYPES as readonly string[]).includes(value);
}

// mock-test-2 -> 2. mock-test-1 and any other slug return null.
export function mockSlotFromSlug(slug: string): number | null {
  const match = /^mock-test-(\d+)$/.exec(slug);

  if (!match) {
    return null;
  }

  const slot = Number(match[1]);

  if (!Number.isInteger(slot) || slot < 2) {
    return null;
  }

  return slot;
}

export function learnerMockPath(
  slug: string,
  options?: { section?: SectionType; flow?: "full" },
): string {
  const params = new URLSearchParams();

  if (options?.flow === "full") {
    params.set("flow", "full");
  }

  if (options?.section) {
    params.set("section", options.section);
  }

  const query = params.toString();
  const path = `/dashboard/mock-tests/${slug}`;

  return query ? `${path}?${query}` : path;
}

export function assembleLearnerMockTest(
  bundle: PublishedMockBundle,
): LearnerMockTest {
  const optionsByQuestion = groupBy(bundle.options, (option) => option.question_id);
  const questionsByPart = groupBy(bundle.questions, (question) => question.part_id ?? "");
  const mediaByPart = groupBy(bundle.media, (asset) => asset.part_id ?? "");
  const partsBySection = groupBy(bundle.parts, (part) => part.section_id);

  const sections = [...bundle.sections]
    .sort((a, b) => a.section_order - b.section_order || a.title.localeCompare(b.title))
    .map((section) => ({
      id: section.id,
      sectionType: section.section_type,
      title: section.title,
      instructions: section.instructions,
      order: section.section_order,
      parts: [...(partsBySection.get(section.id) ?? [])]
        .sort((a, b) => a.part_order - b.part_order || a.title.localeCompare(b.title))
        .map((part) => ({
          id: part.id,
          title: part.title,
          partType: part.part_type,
          instructions: part.instructions,
          order: part.part_order,
          prepTimeSeconds: part.prep_time_seconds,
          responseTimeSeconds: part.response_time_seconds,
          media: toLearnerMedia(mediaByPart.get(part.id) ?? []),
          questions: [...(questionsByPart.get(part.id) ?? [])]
            .sort(
              (a, b) =>
                a.display_order - b.display_order ||
                a.question_number - b.question_number,
            )
            .map((question) => ({
              id: question.id,
              number: question.question_number,
              type: question.question_type,
              prompt: question.prompt,
              instruction: question.instruction,
              passageText: question.passage_text,
              stem: question.stem,
              helperText: question.helper_text,
              points: question.points,
              options: [...(optionsByQuestion.get(question.id) ?? [])]
                .sort((a, b) => a.display_order - b.display_order)
                .map((option) => ({
                  id: option.id,
                  label: option.option_label,
                  text: option.option_text,
                })),
            })),
        })),
    }));

  return {
    id: bundle.test.id,
    slug: bundle.test.slug,
    title: bundle.test.title,
    description: bundle.test.description,
    sections,
  };
}

export function summarizeLearnerMockTest(test: {
  slug: string;
  title: string;
  description: string | null;
  sections: { sectionType: SectionType; order: number }[];
}): LearnerMockTestSummary {
  const sectionTypes = [...test.sections]
    .sort(
      (a, b) =>
        SECTION_TYPE_EXAM_ORDER[a.sectionType] -
        SECTION_TYPE_EXAM_ORDER[b.sectionType],
    )
    .map((section) => section.sectionType);

  return {
    slug: test.slug,
    title: test.title,
    description: test.description,
    sectionTypes: unique(sectionTypes),
  };
}

export type HubPlaceholder = {
  kind: "placeholder";
  slot: number;
};

export type HubPublished = {
  kind: "published";
  slot: number | null;
  test: LearnerMockTestSummary;
};

export type HubEntry = HubPlaceholder | HubPublished;

// Mock Test 1 is not in this list. Slots 2 to 5 stay as coming-soon
// cards until a published test uses that slug. A published mock-test-6,
// or any other slug, is added as its own card.
export function buildMockTestHub(
  published: LearnerMockTestSummary[],
): HubEntry[] {
  const bySlot = new Map<number, LearnerMockTestSummary>();
  const extras: LearnerMockTestSummary[] = [];

  for (const test of published) {
    if (test.slug === BUILT_IN_MOCK_SLUG) {
      continue;
    }

    const slot = mockSlotFromSlug(test.slug);

    if (slot !== null && !bySlot.has(slot)) {
      bySlot.set(slot, test);
      continue;
    }

    extras.push(test);
  }

  const slots = new Set<number>(PLACEHOLDER_MOCK_SLOTS);

  for (const slot of bySlot.keys()) {
    slots.add(slot);
  }

  const entries: HubEntry[] = [...slots]
    .sort((a, b) => a - b)
    .map((slot) => {
      const test = bySlot.get(slot);

      if (test) {
        return { kind: "published", slot, test };
      }

      return { kind: "placeholder", slot };
    });

  extras.sort((a, b) => a.title.localeCompare(b.title));

  for (const test of extras) {
    entries.push({ kind: "published", slot: null, test });
  }

  return entries;
}

export type PublishPartInput = {
  title: string;
  sectionType: SectionType;
  instructions: string | null;
  content: MockTestPartContent;
};

// Why a test cannot be set to published. Empty means it can.
export function publishBlockers(input: {
  slug: string;
  structureErrorCount: number;
  parts: PublishPartInput[];
}): string[] {
  const blockers: string[] = [];

  if (input.slug === BUILT_IN_MOCK_SLUG) {
    blockers.push(
      "The slug mock-test-1 is the built-in free test. Change it to mock-test-2 or later, then publish.",
    );
  }

  if (input.structureErrorCount > 0) {
    const noun = input.structureErrorCount === 1 ? "problem" : "problems";
    blockers.push(
      `Fix ${input.structureErrorCount} structure ${noun} before publishing. Open the structure preview to see them.`,
    );
  }

  if (input.parts.length === 0) {
    blockers.push("Add at least one part before publishing.");
  }

  let hasStudentContent = false;

  for (const part of input.parts) {
    const label = part.title.trim() || "Untitled part";
    const hasPrompt = (part.instructions ?? "").trim().length > 0;
    const productive =
      part.sectionType === "writing" || part.sectionType === "speaking";

    if (part.content.questions.length === 0) {
      if (productive && hasPrompt) {
        hasStudentContent = true;
        continue;
      }

      blockers.push(
        productive
          ? `${label} needs the task written in the part instructions, or at least one question.`
          : `${label} needs at least one question, with options and an answer key.`,
      );
      continue;
    }

    const errors = evaluatePartContent(part.content).issues.filter(
      (issue) => issue.severity === "error",
    );

    if (errors.length === 0) {
      hasStudentContent = true;
      continue;
    }

    for (const issue of errors) {
      blockers.push(`${label}: ${issue.message}`);
    }
  }

  if (blockers.length === 0 && !hasStudentContent) {
    blockers.push("Add content students can practice before publishing.");
  }

  return blockers;
}

export type AnswerKeyForGrading = {
  questionId: string;
  correctOptionId: string | null;
  explanation: string | null;
};

export type QuestionGrade = {
  questionId: string;
  correct: boolean;
  explanation: string | null;
  correctLabel: string | null;
};

export type SectionScoreState = {
  status: "idle" | "error" | "scored";
  message: string;
  results: QuestionGrade[];
  correctCount: number;
  totalCount: number;
};

export const initialSectionScoreState: SectionScoreState = {
  status: "idle",
  message: "",
  results: [],
  correctCount: 0,
  totalCount: 0,
};

// Marks a submitted section. Keys stay in this argument and are not part
// of the returned questions. The result names the correct option so the
// review screen can teach, and it is only built after a submit.
export function gradeObjectiveAnswers(
  questions: LearnerMockQuestion[],
  keys: AnswerKeyForGrading[],
  answers: Record<string, string>,
): Pick<SectionScoreState, "results" | "correctCount" | "totalCount"> {
  const keysByQuestion = new Map(keys.map((key) => [key.questionId, key]));

  const results = questions.map((question) => {
    const key = keysByQuestion.get(question.id);
    const chosen = answers[question.id] ?? "";
    const correctOption = question.options.find(
      (option) => option.id === key?.correctOptionId,
    );
    const correct =
      Boolean(key?.correctOptionId) &&
      chosen.length > 0 &&
      chosen === key?.correctOptionId;

    return {
      questionId: question.id,
      correct,
      explanation: key?.explanation?.trim() || null,
      correctLabel: correctOption
        ? `${correctOption.label}. ${correctOption.text}`.trim()
        : null,
    };
  });

  return {
    results,
    correctCount: results.filter((result) => result.correct).length,
    totalCount: questions.length,
  };
}

function toLearnerMedia(assets: PublishedMediaRow[]): LearnerMockMedia[] {
  return [...assets]
    .sort((a, b) => a.display_order - b.display_order)
    .flatMap((asset) => {
      const url = (asset.url ?? "").trim();

      if (!url) {
        return [];
      }

      return [
        {
          id: asset.id,
          mediaType: asset.media_type,
          url,
          title: asset.title,
          altText: asset.alt_text,
        },
      ];
    });
}

function groupBy<T>(rows: T[], key: (row: T) => string): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const row of rows) {
    const id = key(row);
    const list = grouped.get(id);

    if (list) {
      list.push(row);
    } else {
      grouped.set(id, [row]);
    }
  }

  return grouped;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
