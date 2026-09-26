// Shared vocabulary for AI usage instrumentation (USAGE-00).
//
// These types describe rows written to public.usage_events. This ticket
// is measurement only: nothing here blocks a user, deducts a credit, or
// prices anything for a customer. USAGE-01 builds enforcement on top of
// the data these events collect.
//
// Types only, no side effects, so this file is safe to import anywhere.
// The writer (record-ai-usage-event.ts) is server only.

// The AI operations we pay a provider for.
export const AI_USAGE_EVENT_TYPES = [
  "speaking_transcription",
  "speaking_feedback",
  "writing_feedback",
] as const;

export type AiUsageEventType = (typeof AI_USAGE_EVENT_TYPES)[number];

// Only terminal outcomes are recorded. A "started" status was considered
// and skipped: it doubles the row count and the pipelines are short
// enough that a missing terminal row already means the request died.
export const AI_USAGE_STATUSES = ["succeeded", "failed"] as const;

export type AiUsageStatus = (typeof AI_USAGE_STATUSES)[number];

// Only OpenAI is used today. Kept as a named type so a second provider
// is an additive change rather than a string hunt.
export type AiUsageProvider = "openai";

export const OPENAI_PROVIDER: AiUsageProvider = "openai";

// Module slugs as stored in public.modules.
export const SPEAKING_MODULE_SLUG = "celpip-speaking";
export const WRITING_MODULE_SLUG = "celpip-writing";

// OpenAI endpoints we call, recorded verbatim so cost per endpoint can
// be grouped later without parsing model names.
export const AI_USAGE_ENDPOINTS = {
  transcriptions: "audio.transcriptions.create",
  chatCompletions: "chat.completions.create",
} as const;

// Token counts as reported by the provider. Every field is optional
// because transcription responses often omit usage entirely.
export type AiUsageTokenCounts = {
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
};

// One AI usage event, in application terms. record-ai-usage-event.ts
// maps this onto the snake_case usage_events columns.
export type AiUsageEventInput = {
  userId: string;
  eventType: AiUsageEventType;
  status: AiUsageStatus;
  provider?: AiUsageProvider;
  moduleSlug?: string | null;
  attemptId?: string | null;
  taskId?: string | null;
  model?: string | null;
  endpoint?: string | null;
  tokens?: AiUsageTokenCounts | null;
  audioDurationSeconds?: number | null;
  inputSizeBytes?: number | null;
  estimatedCostUsd?: number | null;
  latencyMs?: number | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  metadata?: Record<string, unknown> | null;
};

// Coarse error buckets. Kept small on purpose: the goal is to tell
// "we were rate limited" apart from "the model returned nonsense"
// when reading a cost report, not to reproduce the provider taxonomy.
export const AI_USAGE_ERROR_CODES = [
  "rate_limited",
  "provider_error",
  "timeout",
  "invalid_response",
  "empty_response",
  "storage_error",
  "unknown",
] as const;

export type AiUsageErrorCode = (typeof AI_USAGE_ERROR_CODES)[number];
