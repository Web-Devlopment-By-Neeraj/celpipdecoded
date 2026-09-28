// Writing evaluation. The model is asked for structured JSON. The server
// counts words, forces the practice-estimate flag, and escapes markup
// before anything is rendered.

import { z } from "zod";
import { costCents, type PriceTable } from "./settings";

export const WRITING_CRITERIA = [
  "content_coherence",
  "vocabulary",
  "readability",
  "task_fulfilment",
] as const;

export type WritingCriterionName = (typeof WRITING_CRITERIA)[number];

const levelSchema = z.union([
  z.literal("M"),
  z.number().int().min(3).max(12),
]);

export const writingEvaluationSchema = z.object({
  task: z.enum(["writing_task_1", "writing_task_2"]),
  word_count: z.number().int(),
  in_range: z.boolean(),
  criteria: z
    .array(
      z.object({
        name: z.enum(WRITING_CRITERIA),
        level: levelSchema,
        evidence: z.string(),
        next_level_gap: z.string(),
      }),
    )
    .length(4),
  overall_level: levelSchema,
  mistakes: z
    .array(
      z.object({
        original: z.string(),
        correction: z.string(),
        criterion: z.enum(WRITING_CRITERIA),
      }),
    )
    .max(5),
  rewrite_next_level: z.string(),
  rewrite_top_level: z.string(),
  markup: z.string(),
  is_estimate: z.boolean().optional(),
});

export type WritingEvaluation = z.infer<typeof writingEvaluationSchema> & {
  is_estimate: true;
};

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function wordRangeFlag(
  wordCount: number,
  min: number,
  max: number,
): { inRange: boolean; message: string | null } {
  const inRange = wordCount >= min && wordCount <= max;
  if (inRange) return { inRange, message: null };
  return {
    inRange,
    message: `Your answer is ${wordCount} words. The target range is ${min}-${max}.`,
  };
}

export function levelToStored(level: "M" | number): number {
  return level === "M" ? 0 : level;
}

export function storedToLevel(stored: number): "M" | number {
  return stored === 0 ? "M" : stored;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function markupToHtml(markup: string): string {
  const pattern = /\[-([\s\S]*?)-\]|\{\+([\s\S]*?)\+\}/g;
  let html = "";
  let cursor = 0;
  for (const match of markup.matchAll(pattern)) {
    const index = match.index ?? 0;
    html += escapeHtml(markup.slice(cursor, index));
    if (match[1] !== undefined) {
      html += `<del>${escapeHtml(match[1])}</del>`;
    } else if (match[2] !== undefined) {
      html += `<strong>${escapeHtml(match[2])}</strong>`;
    }
    cursor = index + match[0].length;
  }
  html += escapeHtml(markup.slice(cursor));
  return html;
}

export function overallFromCriteria(
  levels: Array<"M" | number>,
): "M" | number {
  const numeric = levels.filter((level): level is number => level !== "M");
  if (numeric.length === 0) return "M";
  const mean = numeric.reduce((sum, level) => sum + level, 0) / numeric.length;
  return Math.round(mean);
}

export type WritingEvalInput = {
  task: "writing_task_1" | "writing_task_2";
  promptText: string;
  chosenOption?: string;
  textBody: string;
  wordMin: number;
  wordMax: number;
  promptVersion: string;
  modelId: string;
  priceTable: PriceTable;
  maxAttempts: number;
};

export type ModelCall = {
  raw: string;
  inputTokens: number;
  outputTokens: number;
};

export type WritingEvalOutcome =
  | {
      ok: true;
      evaluation: WritingEvaluation;
      criterionRows: Array<{
        criterion: WritingCriterionName;
        level: number;
        evidence: string;
        nextLevelGap: string;
      }>;
      modelVersion: string;
      costCents: number;
      allowanceUsed: true;
      status: "done";
    }
  | {
      ok: false;
      status: "failed";
      allowanceUsed: false;
      studentMessage: string;
      attempts: number;
    };

export const WRITING_FAILURE_MESSAGE =
  "We could not mark this answer. It has not used your allowance. We will retry shortly.";

export async function evaluateWriting(
  input: WritingEvalInput,
  callModel: (attempt: number) => Promise<ModelCall>,
): Promise<WritingEvalOutcome> {
  const wordCount = countWords(input.textBody);
  const range = wordRangeFlag(wordCount, input.wordMin, input.wordMax);
  let attempts = 0;

  while (attempts < input.maxAttempts) {
    attempts += 1;
    try {
      const response = await callModel(attempts);
      const parsed = writingEvaluationSchema.safeParse(JSON.parse(response.raw));
      if (!parsed.success) continue;
      if (parsed.data.is_estimate === false) continue;
      const names = parsed.data.criteria.map((criterion) => criterion.name);
      if (new Set(names).size !== WRITING_CRITERIA.length) continue;

      const evaluation: WritingEvaluation = {
        ...parsed.data,
        word_count: wordCount,
        in_range: range.inRange,
        is_estimate: true,
        overall_level:
          parsed.data.overall_level ??
          overallFromCriteria(parsed.data.criteria.map((item) => item.level)),
      };

      return {
        ok: true,
        evaluation,
        criterionRows: evaluation.criteria.map((criterion) => ({
          criterion: criterion.name,
          level: levelToStored(criterion.level),
          evidence: criterion.evidence,
          nextLevelGap: criterion.next_level_gap,
        })),
        modelVersion: `${input.modelId}+${input.promptVersion}`,
        costCents: costCents(
          {
            inputTokens: response.inputTokens,
            outputTokens: response.outputTokens,
          },
          input.priceTable,
        ),
        allowanceUsed: true,
        status: "done",
      };
    } catch {
      continue;
    }
  }

  return {
    ok: false,
    status: "failed",
    allowanceUsed: false,
    studentMessage: WRITING_FAILURE_MESSAGE,
    attempts,
  };
}
