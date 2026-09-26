// Zod schema for the AI speaking feedback response. The scoring model
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

export const scoringResponseSchema = z.object({
  estimated_level: scoreValueSchema,
  level_label: z.string().min(1),
  badge_slug: z.string().min(1),
  overall_summary: z.string().min(1),
  content_coherence: categoryFeedbackSchema,
  vocabulary: categoryFeedbackSchema,
  listenability: categoryFeedbackSchema,
  task_fulfillment: categoryFeedbackSchema,
  strengths: z.array(z.string().min(1)).min(1),
  improvements: z.array(z.string().min(1)).min(1),
  next_steps: z.array(z.string().min(1)).min(1),
});

export type CategoryFeedback = z.infer<typeof categoryFeedbackSchema>;
export type ScoringResponse = z.infer<typeof scoringResponseSchema>;

// Parses a stored raw_ai_response jsonb value back into a typed scoring
// response. Returns null when the stored value does not match, so the
// result page can degrade gracefully instead of crashing.
export function parseStoredScoringResponse(
  value: unknown,
): ScoringResponse | null {
  const parsed = scoringResponseSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
