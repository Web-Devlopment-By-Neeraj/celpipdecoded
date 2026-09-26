// Server-side transcription pipeline for a speaking attempt. Verifies
// that the attempt belongs to the given user, downloads the private
// audio from Supabase Storage, sends it to OpenAI transcription, and
// saves the transcript back onto the attempt row.
//
// This module uses the service role client and the OpenAI API key, so
// it must only run on the server. Never import it into client
// components; the browser talks to /api/speaking/transcribe instead.

import OpenAI, { toFile } from "openai";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  describeAiError,
  readOpenAiAudioDuration,
  readOpenAiTokenUsage,
} from "@/features/usage/ai-usage-metadata";
import {
  AI_USAGE_ENDPOINTS,
  SPEAKING_MODULE_SLUG,
} from "@/features/usage/ai-usage-types";
import { recordAiUsageEvent } from "@/features/usage/record-ai-usage-event";
import {
  NO_SCORED_ATTEMPTS_ERROR,
  NO_SCORED_ATTEMPTS_REMAINING,
  NO_SCORED_ATTEMPTS_STATUS,
} from "@/features/usage/access-types";
import { checkScoredAttemptAccess } from "@/features/usage/check-scored-attempt-access";
import { ATTEMPT_AUDIO_BUCKET } from "./audio-utils";
import { transcriptCopy } from "./practice-flow";

const DEFAULT_TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";

// Keeps the model focused on faithful transcription. The transcript
// must reflect what the student said, not what they should have said.
const TRANSCRIPTION_PROMPT =
  "This is a CELPIP speaking practice response from an English-language " +
  "test preparation student. Preserve the speaker's wording as accurately " +
  "as possible. Do not correct grammar. Do not rewrite the answer.";

type AttemptRow = {
  id: string;
  user_id: string;
  status: string;
  task_id: string | null;
  audio_path: string | null;
  transcript: string | null;
};

export type TranscribeAttemptInput = {
  attemptId: string;
  userId: string;
};

export type TranscribeAttemptResult =
  | { ok: true; attemptId: string; transcript: string }
  // code is set for failures the UI reacts to differently, currently
  // only NO_SCORED_ATTEMPTS_REMAINING.
  | { ok: false; status: number; message: string; code?: string };

// Best effort failure marker so the attempt is retryable and never
// stuck in "transcribing". Keeps audio_path untouched.
async function markTranscriptionFailed(attemptId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("attempts")
    .update({ status: "transcription_failed" })
    .eq("id", attemptId);

  if (error) {
    console.error("Could not mark attempt as failed:", error.message);
  }
}

export async function transcribeAttempt(
  input: TranscribeAttemptInput,
): Promise<TranscribeAttemptResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("Transcription is not configured: OPENAI_API_KEY is missing.");
    return {
      ok: false,
      status: 503,
      message: transcriptCopy.errors.notConfigured,
    };
  }

  const supabase = getSupabaseAdmin();

  // 1. Fetch the attempt and verify ownership before touching storage.
  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .select("id, user_id, status, task_id, audio_path, transcript")
    .eq("id", input.attemptId)
    .maybeSingle<AttemptRow>();

  if (attemptError) {
    console.error("Attempt lookup failed:", attemptError.message);
    return {
      ok: false,
      status: 500,
      message: transcriptCopy.errors.requestFailed,
    };
  }

  if (!attempt) {
    return {
      ok: false,
      status: 404,
      message: transcriptCopy.errors.attemptNotFound,
    };
  }

  if (attempt.user_id !== input.userId) {
    return {
      ok: false,
      status: 403,
      message: transcriptCopy.errors.attemptNotOwned,
    };
  }

  // A finished attempt returns its saved transcript, so a repeat click
  // never pays for a second OpenAI call.
  if (attempt.status === "transcribed" && attempt.transcript) {
    return { ok: true, attemptId: attempt.id, transcript: attempt.transcript };
  }

  if (!attempt.audio_path) {
    return {
      ok: false,
      status: 409,
      message: transcriptCopy.errors.audioMissing,
    };
  }

  // USAGE-01: transcription is a paid OpenAI call and /api/speaking/
  // transcribe can be reached on its own, so it is gated by the same
  // access rule as feedback. Transcription is never charged separately:
  // the scored attempt is consumed only after a feedback report is
  // saved. The saved transcript branch above returns first, so a repeat
  // request for finished audio is not gated.
  const access = await checkScoredAttemptAccess({
    attemptId: attempt.id,
    userId: input.userId,
  });

  if (!access.allowed) {
    return {
      ok: false,
      status: NO_SCORED_ATTEMPTS_STATUS,
      message: NO_SCORED_ATTEMPTS_ERROR,
      code: NO_SCORED_ATTEMPTS_REMAINING,
    };
  }

  // 2. Mark the attempt as in progress. A failure here is logged but
  // not fatal; the status is a progress marker, not a lock.
  const { error: markError } = await supabase
    .from("attempts")
    .update({ status: "transcribing" })
    .eq("id", attempt.id);

  if (markError) {
    console.error("Could not mark attempt as transcribing:", markError.message);
  }

  // 3. Download the private audio server side. No signed URL is created
  // and the file is never exposed publicly.
  const { data: audio, error: downloadError } = await supabase.storage
    .from(ATTEMPT_AUDIO_BUCKET)
    .download(attempt.audio_path);

  if (downloadError || !audio) {
    console.error(
      "Audio download failed:",
      downloadError?.message ?? "empty file",
    );
    // Recorded even though OpenAI was never called, so a spike in
    // failed transcriptions is visible whether or not it cost money.
    // reached_provider tells the two cases apart in a report.
    await recordAiUsageEvent({
      userId: attempt.user_id,
      eventType: "speaking_transcription",
      status: "failed",
      moduleSlug: SPEAKING_MODULE_SLUG,
      attemptId: attempt.id,
      taskId: attempt.task_id,
      endpoint: AI_USAGE_ENDPOINTS.transcriptions,
      errorCode: "storage_error",
      errorMessage: downloadError?.message ?? "empty audio file",
      metadata: { reached_provider: false },
    });
    await markTranscriptionFailed(attempt.id);
    return {
      ok: false,
      status: 502,
      message: transcriptCopy.errors.audioDownloadFailed,
    };
  }

  // 4. Send the audio to OpenAI. The blob is wrapped as a named file so
  // the API can detect the container format, for example webm or mp4.
  const fileName = attempt.audio_path.split("/").pop() || "answer.webm";
  const model =
    process.env.OPENAI_TRANSCRIPTION_MODEL || DEFAULT_TRANSCRIPTION_MODEL;
  const inputSizeBytes = audio.size;
  let transcript = "";

  // USAGE-00: one usage event per paid OpenAI call. Latency is measured
  // across exactly the provider call.
  const startedAt = Date.now();
  // Usage reported by the call that just ran, so the empty transcript
  // branch below can record the same tokens and cost as a success would.
  let callUsage: Pick<
    Parameters<typeof recordAiUsageEvent>[0],
    "tokens" | "audioDurationSeconds"
  > = {};

  try {
    const openai = new OpenAI({ apiKey });
    const result = await openai.audio.transcriptions.create({
      file: await toFile(audio, fileName),
      model,
      language: "en",
      response_format: "json",
      prompt: TRANSCRIPTION_PROMPT,
    });
    transcript = result.text?.trim() ?? "";
    callUsage = {
      tokens: readOpenAiTokenUsage(result),
      audioDurationSeconds: readOpenAiAudioDuration(result),
    };
  } catch (err) {
    console.error("OpenAI transcription failed:", err);
    await recordAiUsageEvent({
      userId: attempt.user_id,
      eventType: "speaking_transcription",
      status: "failed",
      moduleSlug: SPEAKING_MODULE_SLUG,
      attemptId: attempt.id,
      taskId: attempt.task_id,
      model,
      endpoint: AI_USAGE_ENDPOINTS.transcriptions,
      inputSizeBytes,
      latencyMs: Date.now() - startedAt,
      ...describeAiError(err),
      metadata: { reached_provider: true },
    });
    await markTranscriptionFailed(attempt.id);
    return {
      ok: false,
      status: 502,
      message: transcriptCopy.errors.transcriptionFailed,
    };
  }

  const latencyMs = Date.now() - startedAt;

  // An empty transcript usually means silence or an unreadable file.
  // Treat it as a failure so the student knows to retry or re-record.
  if (!transcript) {
    // The call still cost money, so its usage figures are recorded even
    // though the outcome is a failure.
    await recordAiUsageEvent({
      userId: attempt.user_id,
      eventType: "speaking_transcription",
      status: "failed",
      moduleSlug: SPEAKING_MODULE_SLUG,
      attemptId: attempt.id,
      taskId: attempt.task_id,
      model,
      endpoint: AI_USAGE_ENDPOINTS.transcriptions,
      ...callUsage,
      inputSizeBytes,
      latencyMs,
      errorCode: "empty_response",
      errorMessage: "Transcription returned an empty transcript",
      metadata: { reached_provider: true },
    });
    await markTranscriptionFailed(attempt.id);
    return {
      ok: false,
      status: 502,
      message: transcriptCopy.errors.transcriptionFailed,
    };
  }

  await recordAiUsageEvent({
    userId: attempt.user_id,
    eventType: "speaking_transcription",
    status: "succeeded",
    moduleSlug: SPEAKING_MODULE_SLUG,
    attemptId: attempt.id,
    taskId: attempt.task_id,
    model,
    endpoint: AI_USAGE_ENDPOINTS.transcriptions,
    ...callUsage,
    inputSizeBytes,
    latencyMs,
    metadata: { transcript_characters: transcript.length },
  });

  // 5. Save the transcript and finish. audio_path stays untouched.
  const { error: saveError } = await supabase
    .from("attempts")
    .update({ status: "transcribed", transcript })
    .eq("id", attempt.id);

  if (saveError) {
    console.error("Transcript save failed:", saveError.message);
    await markTranscriptionFailed(attempt.id);
    return {
      ok: false,
      status: 500,
      message: transcriptCopy.errors.transcriptSaveFailed,
    };
  }

  return { ok: true, attemptId: attempt.id, transcript };
}
