// Writes one AI usage event to public.usage_events (USAGE-00).
//
// This module uses the service role client, so it must only run on the
// server. Never import it into a client component. There is no insert
// policy on usage_events, so the browser cannot write these rows even
// if it tried.
//
// Recording is always best effort. Instrumentation must never change
// what a student sees: if the insert fails, the failure is logged and
// the caller carries on with its existing success or error behaviour.
// This function never throws.
//
// Measurement only. Nothing here blocks a user, counts an attempt
// against a quota, or deducts a credit. USAGE-01 adds enforcement.

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { estimateAiCostUsd, isCostEstimateVerified } from "./ai-cost-estimates";
import {
  OPENAI_PROVIDER,
  type AiUsageEventInput,
  type AiUsageProvider,
} from "./ai-usage-types";

function toStoredInteger(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return Math.round(value);
}

export async function recordAiUsageEvent(
  input: AiUsageEventInput,
): Promise<void> {
  try {
    const provider: AiUsageProvider = input.provider ?? OPENAI_PROVIDER;

    // The caller may pass an estimate it computed itself. Otherwise the
    // estimate is derived here from whatever usage signal is available,
    // and stays null when it cannot be derived safely.
    const estimatedCostUsd =
      input.estimatedCostUsd ??
      estimateAiCostUsd({
        provider,
        model: input.model,
        tokens: input.tokens,
        audioDurationSeconds: input.audioDurationSeconds,
      });

    const row = {
      user_id: input.userId,
      event_type: input.eventType,
      status: input.status,
      provider,
      module_slug: input.moduleSlug ?? null,
      attempt_id: input.attemptId ?? null,
      task_id: input.taskId ?? null,
      model: input.model ?? null,
      endpoint: input.endpoint ?? null,
      prompt_tokens: toStoredInteger(input.tokens?.promptTokens),
      completion_tokens: toStoredInteger(input.tokens?.completionTokens),
      total_tokens: toStoredInteger(input.tokens?.totalTokens),
      audio_duration_seconds: toStoredInteger(input.audioDurationSeconds),
      input_size_bytes: toStoredInteger(input.inputSizeBytes),
      estimated_cost_usd: estimatedCostUsd,
      latency_ms: toStoredInteger(input.latencyMs),
      error_code: input.errorCode ?? null,
      error_message: input.errorMessage ?? null,
      metadata: {
        ...(input.metadata ?? {}),
        // Cost rates are approximate. This flag lets a report separate
        // confirmed provider prices from placeholder rates.
        cost_estimate_verified:
          estimatedCostUsd === null
            ? null
            : isCostEstimateVerified(provider, input.model),
      },
    };

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("usage_events").insert(row);

    if (error) {
      console.error("AI usage event insert failed:", error.message);
    }
  } catch (err) {
    // Includes the case where the admin client cannot be built because
    // Supabase env vars are missing. Instrumentation stays silent.
    console.error("AI usage event could not be recorded:", err);
  }
}
