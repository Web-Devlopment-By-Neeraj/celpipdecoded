// Zod schema for the AI writing feedback response. The writing model
// must return JSON matching this shape; the server validates it before
// anything is saved to attempt_scores.

import { z } from "zod";

// Practice scale used for the estimated level and each category score.
const scoreValueSchema = z.number().min(1).max(12);

const categoryFeedbackSchema = z.object({
  score: scoreValueSchema,
  feedback: z.string().min(1),
  improvement: z.string().min(1),
});

export const writingScoringResponseSchema = z.object({
  estimated_level: scoreValueSchema,
  level_label: z.string().min(1),
  badge_slug: z.string().min(1),
  overall_summary: z.string().min(1),
  task_fulfillment: categoryFeedbackSchema,
  organization_coherence: categoryFeedbackSchema,
  vocabulary: categoryFeedbackSchema,
  grammar_sentence_control: categoryFeedbackSchema,
  tone_clarity: categoryFeedbackSchema,
  strengths: z.array(z.string().min(1)).min(1),
  improvements: z.array(z.string().min(1)).min(1),
  next_steps: z.array(z.string().min(1)).min(1),
  suggested_structure: z.string().min(1),
});

export type WritingCategoryFeedback = z.infer<typeof categoryFeedbackSchema>;
export type WritingScoringResponse = z.infer<
  typeof writingScoringResponseSchema
>;

// The five category blocks saved to attempt_scores.writing_feedback.
export const writingFeedbackJsonSchema = z.object({
  task_fulfillment: categoryFeedbackSchema,
  organization_coherence: categoryFeedbackSchema,
  vocabulary: categoryFeedbackSchema,
  grammar_sentence_control: categoryFeedbackSchema,
  tone_clarity: categoryFeedbackSchema,
});

export type WritingFeedbackJson = z.infer<typeof writingFeedbackJsonSchema>;

// Parses a stored writing_feedback jsonb value back into typed category
// feedback. Returns null when the stored value does not match, so the
// result page can degrade gracefully instead of crashing.
export function parseStoredWritingFeedback(
  value: unknown,
): WritingFeedbackJson | null {
  const parsed = writingFeedbackJsonSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
