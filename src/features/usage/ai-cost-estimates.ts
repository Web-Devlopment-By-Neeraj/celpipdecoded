// Provider cost estimation for AI usage events (USAGE-00).
//
// IMPORTANT: these numbers are approximate provider costs, not customer
// prices. They exist so we can answer "roughly what does one speaking
// attempt cost us" before designing free attempts and packages in
// USAGE-01. They are not a billing source of truth.
//
// Every rate below must be re-checked against the current OpenAI pricing
// page before launch. Rates marked verified: false are placeholders in
// the right order of magnitude, not confirmed prices. Events written
// with an unverified rate carry cost_estimate_verified: false in their
// metadata so a cost report can exclude or re-price them.
//
// When a model is unknown, or when there is no usage signal to multiply
// a rate by, this module returns null. A null estimate is correct and
// expected. It is much better than a confident wrong number.

import type { AiUsageProvider, AiUsageTokenCounts } from "./ai-usage-types";

// usage_events.estimated_cost_usd is numeric(10, 6).
const COST_DECIMAL_PLACES = 6;

type ModelPricing = {
  // USD per one million input (prompt) tokens.
  inputPerMillionTokensUsd: number | null;
  // USD per one million output (completion) tokens.
  outputPerMillionTokensUsd: number | null;
  // USD per minute of transcribed audio, for audio models billed by time.
  perAudioMinuteUsd: number | null;
  // False means the rate is a placeholder that must be reviewed.
  verified: boolean;
};

// Keyed by exact model id. Model ids are matched exactly and then by
// longest known prefix, so a dated variant such as
// "gpt-4o-mini-transcribe-2025-01-01" still resolves.
const OPENAI_PRICING: Record<string, ModelPricing> = {
  // Audio transcription. OpenAI publishes both a per minute rate and a
  // token rate for this model. The per minute rate is preferred when an
  // audio duration is known because it is the simpler signal.
  "gpt-4o-mini-transcribe": {
    inputPerMillionTokensUsd: 3.0,
    outputPerMillionTokensUsd: 5.0,
    perAudioMinuteUsd: 0.003,
    verified: false,
  },
  "whisper-1": {
    inputPerMillionTokensUsd: null,
    outputPerMillionTokensUsd: null,
    perAudioMinuteUsd: 0.006,
    verified: false,
  },
  // Scoring models used by speaking feedback and writing feedback.
  // PLACEHOLDER RATES. Review before launch.
  "gpt-5.4-mini": {
    inputPerMillionTokensUsd: 0.25,
    outputPerMillionTokensUsd: 2.0,
    perAudioMinuteUsd: null,
    verified: false,
  },
  "gpt-5.4": {
    inputPerMillionTokensUsd: 1.25,
    outputPerMillionTokensUsd: 10.0,
    perAudioMinuteUsd: null,
    verified: false,
  },
};

function findPricing(
  provider: AiUsageProvider,
  model: string | null | undefined,
): ModelPricing | null {
  if (provider !== "openai" || !model) {
    return null;
  }

  const normalized = model.trim().toLowerCase();

  if (OPENAI_PRICING[normalized]) {
    return OPENAI_PRICING[normalized];
  }

  // Longest matching prefix wins, so "gpt-5.4-mini-2026-01-01" resolves
  // to the mini rate rather than the full model rate.
  let matched: ModelPricing | null = null;
  let matchedLength = 0;

  for (const [knownModel, pricing] of Object.entries(OPENAI_PRICING)) {
    if (normalized.startsWith(knownModel) && knownModel.length > matchedLength) {
      matched = pricing;
      matchedLength = knownModel.length;
    }
  }

  return matched;
}

function isUsableCount(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export type EstimateAiCostInput = {
  provider: AiUsageProvider;
  model: string | null | undefined;
  tokens?: AiUsageTokenCounts | null;
  audioDurationSeconds?: number | null;
};

// Returns an approximate provider cost in USD, or null when it cannot
// be estimated safely.
//
// Null is returned when the model is unknown, when the model has no
// rate for the signal we have, or when there is no usage signal at all
// (a failed call that never reached the model, for example).
export function estimateAiCostUsd(
  input: EstimateAiCostInput,
): number | null {
  const pricing = findPricing(input.provider, input.model);

  if (!pricing) {
    return null;
  }

  // Audio billed by time. Preferred for transcription when a duration
  // was reported by the provider.
  if (
    isUsableCount(input.audioDurationSeconds) &&
    pricing.perAudioMinuteUsd !== null
  ) {
    return roundCost((input.audioDurationSeconds / 60) * pricing.perAudioMinuteUsd);
  }

  const promptTokens = input.tokens?.promptTokens;
  const completionTokens = input.tokens?.completionTokens;
  const totalTokens = input.tokens?.totalTokens;

  const hasSplitTokens =
    isUsableCount(promptTokens) || isUsableCount(completionTokens);

  if (hasSplitTokens) {
    if (
      pricing.inputPerMillionTokensUsd === null ||
      pricing.outputPerMillionTokensUsd === null
    ) {
      return null;
    }

    const inputCost =
      ((isUsableCount(promptTokens) ? promptTokens : 0) / 1_000_000) *
      pricing.inputPerMillionTokensUsd;
    const outputCost =
      ((isUsableCount(completionTokens) ? completionTokens : 0) / 1_000_000) *
      pricing.outputPerMillionTokensUsd;

    return roundCost(inputCost + outputCost);
  }

  // Only a total was reported. Price the whole total at the input rate
  // and accept that this understates output heavy calls. Flagged in the
  // docs as a known limitation.
  if (isUsableCount(totalTokens) && pricing.inputPerMillionTokensUsd !== null) {
    return roundCost((totalTokens / 1_000_000) * pricing.inputPerMillionTokensUsd);
  }

  return null;
}

// True when the rate used for this model is a confirmed provider price.
// Recorded in event metadata so unverified estimates can be filtered out
// of a cost report.
export function isCostEstimateVerified(
  provider: AiUsageProvider,
  model: string | null | undefined,
): boolean {
  return findPricing(provider, model)?.verified ?? false;
}

function roundCost(value: number): number | null {
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  const factor = 10 ** COST_DECIMAL_PLACES;
  return Math.round(value * factor) / factor;
}
