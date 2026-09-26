// Helpers that turn raw OpenAI call results and thrown errors into the
// fields an AI usage event needs (USAGE-00).
//
// These read provider shapes defensively. The transcription API and the
// chat completions API report usage differently, and a failed call may
// throw anything at all, so nothing here assumes a shape it has not
// checked. No secret, prompt, or student response is ever read out of
// these objects.

import type { AiUsageErrorCode, AiUsageTokenCounts } from "./ai-usage-types";

// error_message is a debugging aid in a report, not a log. Keep it short
// so a long provider payload cannot bloat the table.
const MAX_ERROR_MESSAGE_LENGTH = 500;

function toPositiveInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return Math.round(value);
}

// Reads token counts from an OpenAI response.
//
// chat.completions returns prompt_tokens / completion_tokens /
// total_tokens. The audio models use input_tokens / output_tokens and
// may omit usage entirely, in which case every field comes back null.
export function readOpenAiTokenUsage(response: unknown): AiUsageTokenCounts {
  const usage = (response as { usage?: Record<string, unknown> } | null)?.usage;

  if (!usage || typeof usage !== "object") {
    return { promptTokens: null, completionTokens: null, totalTokens: null };
  }

  const promptTokens =
    toPositiveInteger(usage.prompt_tokens) ??
    toPositiveInteger(usage.input_tokens);
  const completionTokens =
    toPositiveInteger(usage.completion_tokens) ??
    toPositiveInteger(usage.output_tokens);
  const totalTokens = toPositiveInteger(usage.total_tokens);

  return {
    promptTokens,
    completionTokens,
    totalTokens:
      totalTokens ??
      (promptTokens !== null && completionTokens !== null
        ? promptTokens + completionTokens
        : null),
  };
}

// Reads an audio duration in seconds when the provider reports one.
// The json response format does not include a duration, so this is
// usually null. It is read anyway so a later switch to verbose_json
// starts populating the column with no further code change.
export function readOpenAiAudioDuration(response: unknown): number | null {
  const duration = (response as { duration?: unknown } | null)?.duration;

  if (typeof duration === "string") {
    return toPositiveInteger(Number.parseFloat(duration));
  }

  return toPositiveInteger(duration);
}

export type AiUsageErrorDetails = {
  errorCode: AiUsageErrorCode;
  errorMessage: string | null;
};

// Buckets a thrown error into a coarse error code and a short message.
//
// The OpenAI SDK throws APIError, which carries a numeric status and a
// string code. Zod throws ZodError, which has issues. Both are matched
// by shape rather than by instanceof, so this helper stays free of
// provider and validation imports.
export function describeAiError(err: unknown): AiUsageErrorDetails {
  const message = truncateErrorMessage(readErrorMessage(err));
  const candidate = err as
    | { status?: unknown; code?: unknown; name?: unknown; issues?: unknown }
    | null;

  if (candidate && Array.isArray(candidate.issues)) {
    return { errorCode: "invalid_response", errorMessage: message };
  }

  const name = typeof candidate?.name === "string" ? candidate.name : "";

  if (name === "SyntaxError") {
    return { errorCode: "invalid_response", errorMessage: message };
  }

  if (name === "AbortError" || name === "APIConnectionTimeoutError") {
    return { errorCode: "timeout", errorMessage: message };
  }

  const status = typeof candidate?.status === "number" ? candidate.status : null;

  if (status === 429) {
    return { errorCode: "rate_limited", errorMessage: message };
  }

  if (status !== null) {
    return { errorCode: "provider_error", errorMessage: message };
  }

  const code = typeof candidate?.code === "string" ? candidate.code : "";

  if (code === "ETIMEDOUT" || code === "ECONNRESET") {
    return { errorCode: "timeout", errorMessage: message };
  }

  return { errorCode: "unknown", errorMessage: message };
}

function readErrorMessage(err: unknown): string | null {
  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === "string") {
    return err;
  }

  return null;
}

function truncateErrorMessage(message: string | null): string | null {
  if (!message) {
    return null;
  }

  const trimmed = message.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.length > MAX_ERROR_MESSAGE_LENGTH
    ? `${trimmed.slice(0, MAX_ERROR_MESSAGE_LENGTH)}...`
    : trimmed;
}
