// Server-side AI feedback pipeline for a speaking attempt. Verifies
// that the attempt belongs to the given user, transcribes the audio in
// the backend when a transcript is missing, sends the transcript with
// the task context to the OpenAI scoring model, validates the response
// with zod, and saves the result to attempt_scores.
//
// This module uses the service role client and the OpenAI API key, so
// it must only run on the server. Never import it into client
// components; the browser talks to /api/speaking/feedback instead.

import OpenAI from "openai";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  describeAiError,
  readOpenAiTokenUsage,
} from "@/features/usage/ai-usage-metadata";
import {
  AI_USAGE_ENDPOINTS,
  SPEAKING_MODULE_SLUG,
  type AiUsageTokenCounts,
} from "@/features/usage/ai-usage-types";
import { recordAiUsageEvent } from "@/features/usage/record-ai-usage-event";
import {
  NO_SCORED_ATTEMPTS_ERROR,
  NO_SCORED_ATTEMPTS_REMAINING,
  NO_SCORED_ATTEMPTS_STATUS,
} from "@/features/usage/access-types";
import { checkScoredAttemptAccess } from "@/features/usage/check-scored-attempt-access";
import { consumeScoredAttemptCredit } from "@/features/usage/consume-scored-attempt-credit";
import { getBadgeForLevel } from "./level-badges";
import {
  DEFAULT_PREP_SECONDS,
  DEFAULT_SPEAKING_SECONDS,
  feedbackCopy,
} from "./practice-flow";
import {
  buildScoringSystemPrompt,
  buildScoringUserPrompt,
} from "./scoring-prompt";
import { scoringResponseSchema, type ScoringResponse } from "./scoring-schema";
import { transcribeAttempt } from "./transcribe-attempt";

const DEFAULT_SCORING_MODEL = "gpt-5.4-mini";

type TaskTimingEmbed = {
  prep_seconds: number | null;
  speaking_seconds: number | null;
};

type TaskEmbed = {
  id: string;
  title: string;
  prompt: string;
  task_type: string;
  speaking_task_details: TaskTimingEmbed | TaskTimingEmbed[] | null;
};

type AttemptRow = {
  id: string;
  user_id: string;
  status: string;
  audio_path: string | null;
  transcript: string | null;
  tasks: TaskEmbed | TaskEmbed[] | null;
};

export type GenerateSpeakingFeedbackInput = {
  attemptId: string;
  userId: string;
};

export type GenerateSpeakingFeedbackResult =
  | { ok: true; attemptId: string; resultPath: string }
  // code is set for failures the UI reacts to differently, currently
  // only NO_SCORED_ATTEMPTS_REMAINING.
  | { ok: false; status: number; message: string; code?: string };

// Result route for one attempt, shared by the pipeline and the API
// response so the redirect target is defined in one place.
export function getAttemptResultPath(attemptId: string): string {
  return `/dashboard/speaking/attempts/${attemptId}`;
}

// Best effort status update. The status is a progress marker for the
// UI, not a lock, so a failure here is logged and never fatal.
async function setAttemptStatus(
  attemptId: string,
  status: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("attempts")
    .update({ status })
    .eq("id", attemptId);

  if (error) {
    console.error(
      `Could not set attempt status to ${status}:`,
      error.message,
    );
  }
}

// PostgREST returns a one-to-one embed as an object, but older schema
// caches can return an array. Normalize both to a single object.
function normalizeEmbed<T>(embed: T | T[] | null): T | null {
  return Array.isArray(embed) ? (embed[0] ?? null) : (embed ?? null);
}

// Awards the practice badge for a finished feedback report. Runs only
// after the attempt is feedback_ready. Best effort: the feedback is
// already saved, so a badge problem is logged and never fails the
// request. The unique (user_id, badge_id) constraint plus
// ignoreDuplicates makes a repeat award a no-op instead of an error.
async function awardPracticeBadge(
  userId: string,
  attemptId: string,
  badgeSlug: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data: badge, error: badgeError } = await supabase
    .from("badges")
    .select("id")
    .eq("slug", badgeSlug)
    .maybeSingle<{ id: string }>();

  if (badgeError || !badge) {
    console.error(
      `Badge lookup failed for slug ${badgeSlug}:`,
      badgeError?.message ?? "badge not found",
    );
    return;
  }

  const { error: awardError } = await supabase.from("user_badges").upsert(
    { user_id: userId, badge_id: badge.id, attempt_id: attemptId },
    { onConflict: "user_id,badge_id", ignoreDuplicates: true },
  );

  if (awardError) {
    console.error("Badge award failed:", awardError.message);
  }
}

export async function generateSpeakingFeedback(
  input: GenerateSpeakingFeedbackInput,
): Promise<GenerateSpeakingFeedbackResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("Feedback is not configured: OPENAI_API_KEY is missing.");
    return {
      ok: false,
      status: 503,
      message: feedbackCopy.errors.notConfigured,
    };
  }

  const supabase = getSupabaseAdmin();

  // 1. Fetch the attempt with its task context and verify ownership
  // before any transcription or scoring work happens.
  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .select(
      "id, user_id, status, audio_path, transcript, tasks(id, title, prompt, task_type, speaking_task_details(prep_seconds, speaking_seconds))",
    )
    .eq("id", input.attemptId)
    .maybeSingle<AttemptRow>();

  if (attemptError) {
    console.error("Attempt lookup failed:", attemptError.message);
    return {
      ok: false,
      status: 500,
      message: feedbackCopy.errors.requestFailed,
    };
  }

  if (!attempt) {
    return {
      ok: false,
      status: 404,
      message: feedbackCopy.errors.attemptNotFound,
    };
  }

  if (attempt.user_id !== input.userId) {
    return {
      ok: false,
      status: 403,
      message: feedbackCopy.errors.attemptNotOwned,
    };
  }

  if (!attempt.audio_path) {
    return {
      ok: false,
      status: 409,
      message: feedbackCopy.errors.audioMissing,
    };
  }

  // A finished attempt with a saved score returns its result route, so
  // a repeat click never pays for a second AI call.
  if (attempt.status === "feedback_ready") {
    const { data: existingScores } = await supabase
      .from("attempt_scores")
      .select("id")
      .eq("attempt_id", attempt.id)
      .limit(1);

    if (existingScores && existingScores.length > 0) {
      return {
        ok: true,
        attemptId: attempt.id,
        resultPath: getAttemptResultPath(attempt.id),
      };
    }
  }

  // USAGE-01: the learner must have a scored attempt available before
  // any OpenAI work starts. The branch above already returned a saved
  // report, so an attempt that is finished never reaches this check.
  // Nothing is charged here; the charge happens once the score is saved.
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

  const task = normalizeEmbed(attempt.tasks);

  if (!task) {
    console.error(`Attempt ${attempt.id} has no task for scoring.`);
    return {
      ok: false,
      status: 500,
      message: feedbackCopy.errors.taskMissing,
    };
  }

  const timing = normalizeEmbed(task.speaking_task_details);

  // 2. Ensure a transcript exists, transcribing in the backend when
  // needed. transcribeAttempt manages the transcribing, transcribed,
  // and transcription_failed statuses itself.
  let transcript = attempt.transcript?.trim() ?? "";

  if (!transcript) {
    const transcription = await transcribeAttempt({
      attemptId: input.attemptId,
      userId: input.userId,
    });

    if (!transcription.ok) {
      return {
        ok: false,
        status: transcription.status,
        message: transcription.message,
      };
    }

    transcript = transcription.transcript;
  }

  // 3. Score the transcript with the OpenAI scoring model.
  await setAttemptStatus(attempt.id, "scoring");

  let scoring: ScoringResponse;

  // USAGE-00: one usage event per paid OpenAI call. The transcription
  // call above records its own speaking_transcription event, so it is
  // not counted again here.
  const model = process.env.OPENAI_SCORING_MODEL || DEFAULT_SCORING_MODEL;
  const startedAt = Date.now();
  // Captured as soon as the provider responds so a validation failure
  // still records the tokens the call consumed.
  let tokens: AiUsageTokenCounts = {};

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildScoringSystemPrompt() },
        {
          role: "user",
          content: buildScoringUserPrompt({
            taskTitle: task.title,
            taskType: task.task_type,
            taskPrompt: task.prompt,
            prepSeconds: timing?.prep_seconds ?? DEFAULT_PREP_SECONDS,
            speakingSeconds:
              timing?.speaking_seconds ?? DEFAULT_SPEAKING_SECONDS,
            transcript,
          }),
        },
      ],
    });

    tokens = readOpenAiTokenUsage(completion);

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      throw new Error("Scoring model returned an empty response");
    }

    scoring = scoringResponseSchema.parse(JSON.parse(raw));

    await recordAiUsageEvent({
      userId: attempt.user_id,
      eventType: "speaking_feedback",
      status: "succeeded",
      moduleSlug: SPEAKING_MODULE_SLUG,
      attemptId: attempt.id,
      taskId: task.id,
      model,
      endpoint: AI_USAGE_ENDPOINTS.chatCompletions,
      tokens,
      latencyMs: Date.now() - startedAt,
      metadata: { transcript_characters: transcript.length },
    });
  } catch (err) {
    console.error("AI scoring failed:", err);
    // Tokens are still recorded when the call returned and only the
    // validation failed, so the cost of a bad response stays visible.
    await recordAiUsageEvent({
      userId: attempt.user_id,
      eventType: "speaking_feedback",
      status: "failed",
      moduleSlug: SPEAKING_MODULE_SLUG,
      attemptId: attempt.id,
      taskId: task.id,
      model,
      endpoint: AI_USAGE_ENDPOINTS.chatCompletions,
      tokens,
      latencyMs: Date.now() - startedAt,
      ...describeAiError(err),
    });
    await setAttemptStatus(attempt.id, "scoring_failed");
    return {
      ok: false,
      status: 502,
      message: feedbackCopy.errors.scoringFailed,
    };
  }

  // Enforce the level to badge mapping server side, regardless of the
  // badge the model chose.
  const badge = getBadgeForLevel(scoring.estimated_level);
  const validated: ScoringResponse = { ...scoring, badge_slug: badge.slug };

  // 4. Save the score, updating in place when the attempt was scored
  // before, so each attempt keeps a single attempt_scores row.
  const scoreRow = {
    estimated_level: validated.estimated_level,
    level_label: validated.level_label,
    badge_slug: validated.badge_slug,
    content_coherence_score: validated.content_coherence.score,
    vocabulary_score: validated.vocabulary.score,
    listenability_score: validated.listenability.score,
    task_fulfillment_score: validated.task_fulfillment.score,
    strengths: validated.strengths,
    improvements: validated.improvements,
    next_steps: validated.next_steps,
    raw_ai_response: validated,
  };

  const { data: existingRows, error: existingError } = await supabase
    .from("attempt_scores")
    .select("id")
    .eq("attempt_id", attempt.id)
    .limit(1);

  if (existingError) {
    console.error("Score lookup failed:", existingError.message);
    await setAttemptStatus(attempt.id, "scoring_failed");
    return {
      ok: false,
      status: 500,
      message: feedbackCopy.errors.scoreSaveFailed,
    };
  }

  const existingId = existingRows?.[0]?.id;

  const { error: saveError } = existingId
    ? await supabase
        .from("attempt_scores")
        .update(scoreRow)
        .eq("id", existingId)
    : await supabase
        .from("attempt_scores")
        .insert({ attempt_id: attempt.id, ...scoreRow });

  if (saveError) {
    console.error("Score save failed:", saveError.message);
    await setAttemptStatus(attempt.id, "scoring_failed");
    return {
      ok: false,
      status: 500,
      message: feedbackCopy.errors.scoreSaveFailed,
    };
  }

  // 5. Mark the attempt ready. The score is already saved, so the
  // result page can render it even if this status write fails.
  await setAttemptStatus(attempt.id, "feedback_ready");

  // 6. USAGE-01: charge one scored attempt, now that a report exists and
  // not a moment earlier. A failed OpenAI call returned above, so it
  // never reaches this point, and attempt_id is unique in
  // scored_attempt_consumptions, so a retry cannot charge twice.
  await consumeScoredAttemptCredit({
    userId: attempt.user_id,
    attemptId: attempt.id,
    moduleSlug: SPEAKING_MODULE_SLUG,
    taskId: task.id,
    metadata: { estimated_level: validated.estimated_level },
  });

  // 7. Award the matching practice badge now that feedback is ready.
  await awardPracticeBadge(input.userId, attempt.id, badge.slug);

  return {
    ok: true,
    attemptId: attempt.id,
    resultPath: getAttemptResultPath(attempt.id),
  };
}
