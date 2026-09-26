// Server-side AI feedback pipeline for a writing attempt. Verifies
// that the attempt belongs to the given user and to the CELPIP writing
// module, sends the saved response with the task context to the OpenAI
// writing model, validates the response with zod, and saves the result
// to attempt_scores.
//
// This module uses the service role client and the OpenAI API key, so
// it must only run on the server. Never import it into client
// components; the browser talks to /api/writing/evaluate instead.

import OpenAI from "openai";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  describeAiError,
  readOpenAiTokenUsage,
} from "@/features/usage/ai-usage-metadata";
import {
  AI_USAGE_ENDPOINTS,
  WRITING_MODULE_SLUG,
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
import { writingEvaluationCopy } from "./task-copy";
import { countWords } from "./word-count";
import { getWritingBadgeForLevel } from "./writing-level-badges";
import {
  buildWritingScoringSystemPrompt,
  buildWritingScoringUserPrompt,
} from "./writing-scoring-prompt";
import {
  writingScoringResponseSchema,
  type WritingScoringResponse,
} from "./writing-scoring-schema";

const DEFAULT_WRITING_MODEL = "gpt-5.4-mini";

// Fallback time limit for the prompt when a task has no stored timing.
const DEFAULT_TIME_SECONDS = 1620;

// Attempt statuses that are allowed to start an evaluation.
const EVALUABLE_STATUSES = ["writing_submitted", "writing_evaluation_failed"];

type WritingDetailsEmbed = {
  task_number: number | null;
  time_seconds: number | null;
  word_min: number | null;
  word_max: number | null;
};

type ModuleEmbed = {
  slug: string;
};

type TaskEmbed = {
  id: string;
  title: string;
  prompt: string;
  task_type: string;
  modules: ModuleEmbed | ModuleEmbed[] | null;
  writing_task_details: WritingDetailsEmbed | WritingDetailsEmbed[] | null;
};

type AttemptRow = {
  id: string;
  user_id: string;
  status: string;
  response_text: string | null;
  word_count: number | null;
  tasks: TaskEmbed | TaskEmbed[] | null;
};

export type GenerateWritingFeedbackInput = {
  attemptId: string;
  userId: string;
};

export type GenerateWritingFeedbackResult =
  | { ok: true; attemptId: string; resultPath: string }
  // code is set for failures the UI reacts to differently, currently
  // only NO_SCORED_ATTEMPTS_REMAINING.
  | { ok: false; status: number; message: string; code?: string };

// Result route for one writing attempt, shared by the pipeline and the
// API response so the redirect target is defined in one place.
export function getWritingAttemptResultPath(attemptId: string): string {
  return `/dashboard/writing/attempts/${attemptId}`;
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
    console.error(`Could not set attempt status to ${status}:`, error.message);
  }
}

// PostgREST returns a one-to-one embed as an object, but older schema
// caches can return an array. Normalize both to a single object.
function normalizeEmbed<T>(embed: T | T[] | null): T | null {
  return Array.isArray(embed) ? (embed[0] ?? null) : (embed ?? null);
}

// Awards the practice badge for a finished feedback report. Runs only
// after the attempt is writing_feedback_ready. Best effort: the
// feedback is already saved, so a badge problem is logged and never
// fails the request. The unique (user_id, badge_id) constraint plus
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

export async function generateWritingFeedback(
  input: GenerateWritingFeedbackInput,
): Promise<GenerateWritingFeedbackResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error(
      "Writing evaluation is not configured: OPENAI_API_KEY is missing.",
    );
    return {
      ok: false,
      status: 503,
      message: writingEvaluationCopy.errors.notConfigured,
    };
  }

  const supabase = getSupabaseAdmin();

  // 1. Fetch the attempt with its task context and verify ownership
  // before any scoring work happens.
  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .select(
      "id, user_id, status, response_text, word_count, tasks(id, title, prompt, task_type, modules(slug), writing_task_details(task_number, time_seconds, word_min, word_max))",
    )
    .eq("id", input.attemptId)
    .maybeSingle<AttemptRow>();

  if (attemptError) {
    console.error("Attempt lookup failed:", attemptError.message);
    return {
      ok: false,
      status: 500,
      message: writingEvaluationCopy.errors.requestFailed,
    };
  }

  if (!attempt) {
    return {
      ok: false,
      status: 404,
      message: writingEvaluationCopy.errors.attemptNotFound,
    };
  }

  if (attempt.user_id !== input.userId) {
    return {
      ok: false,
      status: 403,
      message: writingEvaluationCopy.errors.attemptNotFound,
    };
  }

  const responseText = attempt.response_text?.trim() ?? "";

  if (!responseText) {
    return {
      ok: false,
      status: 409,
      message: writingEvaluationCopy.errors.responseMissing,
    };
  }

  const task = normalizeEmbed(attempt.tasks);
  const moduleEmbed = normalizeEmbed(task?.modules ?? null);

  if (!task) {
    console.error(`Attempt ${attempt.id} has no task for writing scoring.`);
    return {
      ok: false,
      status: 500,
      message: writingEvaluationCopy.errors.taskMissing,
    };
  }

  if (moduleEmbed?.slug !== "celpip-writing") {
    return {
      ok: false,
      status: 409,
      message: writingEvaluationCopy.errors.wrongModule,
    };
  }

  // A finished attempt with a saved score returns its result route, so
  // a repeat click never pays for a second AI call.
  if (attempt.status === "writing_feedback_ready") {
    const { data: existingScores } = await supabase
      .from("attempt_scores")
      .select("id")
      .eq("attempt_id", attempt.id)
      .limit(1);

    if (existingScores && existingScores.length > 0) {
      return {
        ok: true,
        attemptId: attempt.id,
        resultPath: getWritingAttemptResultPath(attempt.id),
      };
    }
  }

  if (!EVALUABLE_STATUSES.includes(attempt.status)) {
    return {
      ok: false,
      status: 409,
      message: writingEvaluationCopy.errors.notReadyForEvaluation,
    };
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

  const details = normalizeEmbed(task.writing_task_details);

  // 2. Score the response with the OpenAI writing model.
  await setAttemptStatus(attempt.id, "writing_evaluating");

  let scoring: WritingScoringResponse;

  // USAGE-00: one usage event per paid OpenAI call.
  const model = process.env.OPENAI_WRITING_MODEL || DEFAULT_WRITING_MODEL;
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
        { role: "system", content: buildWritingScoringSystemPrompt() },
        {
          role: "user",
          content: buildWritingScoringUserPrompt({
            taskTitle: task.title,
            taskType: task.task_type,
            taskPrompt: task.prompt,
            taskNumber: details?.task_number ?? 1,
            timeSeconds: details?.time_seconds ?? DEFAULT_TIME_SECONDS,
            wordMin: details?.word_min ?? null,
            wordMax: details?.word_max ?? null,
            responseText,
            wordCount: attempt.word_count ?? countWords(responseText),
          }),
        },
      ],
    });

    tokens = readOpenAiTokenUsage(completion);

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      throw new Error("Writing model returned an empty response");
    }

    scoring = writingScoringResponseSchema.parse(JSON.parse(raw));

    await recordAiUsageEvent({
      userId: attempt.user_id,
      eventType: "writing_feedback",
      status: "succeeded",
      moduleSlug: WRITING_MODULE_SLUG,
      attemptId: attempt.id,
      taskId: task.id,
      model,
      endpoint: AI_USAGE_ENDPOINTS.chatCompletions,
      tokens,
      inputSizeBytes: Buffer.byteLength(responseText, "utf8"),
      latencyMs: Date.now() - startedAt,
      metadata: { response_characters: responseText.length },
    });
  } catch (err) {
    console.error("AI writing evaluation failed:", err);
    // Tokens are still recorded when the call returned and only the
    // validation failed, so the cost of a bad response stays visible.
    await recordAiUsageEvent({
      userId: attempt.user_id,
      eventType: "writing_feedback",
      status: "failed",
      moduleSlug: WRITING_MODULE_SLUG,
      attemptId: attempt.id,
      taskId: task.id,
      model,
      endpoint: AI_USAGE_ENDPOINTS.chatCompletions,
      tokens,
      inputSizeBytes: Buffer.byteLength(responseText, "utf8"),
      latencyMs: Date.now() - startedAt,
      ...describeAiError(err),
    });
    await setAttemptStatus(attempt.id, "writing_evaluation_failed");
    return {
      ok: false,
      status: 502,
      message: writingEvaluationCopy.errors.evaluationFailed,
    };
  }

  // Enforce the level to badge mapping server side, regardless of the
  // badge the model chose.
  const badge = getWritingBadgeForLevel(scoring.estimated_level);
  const validated: WritingScoringResponse = {
    ...scoring,
    badge_slug: badge.slug,
  };

  // 3. Save the score, updating in place when the attempt was scored
  // before, so each attempt keeps a single attempt_scores row.
  const scoreRow = {
    estimated_level: validated.estimated_level,
    level_label: validated.level_label,
    badge_slug: validated.badge_slug,
    task_fulfillment_score: validated.task_fulfillment.score,
    vocabulary_score: validated.vocabulary.score,
    strengths: validated.strengths,
    improvements: validated.improvements,
    next_steps: validated.next_steps,
    raw_ai_response: validated,
    writing_feedback: {
      task_fulfillment: validated.task_fulfillment,
      organization_coherence: validated.organization_coherence,
      vocabulary: validated.vocabulary,
      grammar_sentence_control: validated.grammar_sentence_control,
      tone_clarity: validated.tone_clarity,
    },
    writing_overall_summary: validated.overall_summary,
    writing_suggested_structure: validated.suggested_structure,
  };

  const { data: existingRows, error: existingError } = await supabase
    .from("attempt_scores")
    .select("id")
    .eq("attempt_id", attempt.id)
    .limit(1);

  if (existingError) {
    console.error("Score lookup failed:", existingError.message);
    await setAttemptStatus(attempt.id, "writing_evaluation_failed");
    return {
      ok: false,
      status: 500,
      message: writingEvaluationCopy.errors.saveFailed,
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
    await setAttemptStatus(attempt.id, "writing_evaluation_failed");
    return {
      ok: false,
      status: 500,
      message: writingEvaluationCopy.errors.saveFailed,
    };
  }

  // 4. Mark the attempt ready. The score is already saved, so the
  // result page can render it even if this status write fails.
  await setAttemptStatus(attempt.id, "writing_feedback_ready");

  // 5. USAGE-01: charge one scored attempt, now that a report exists and
  // not a moment earlier. A failed OpenAI call returned above, so it
  // never reaches this point, and attempt_id is unique in
  // scored_attempt_consumptions, so a retry cannot charge twice.
  await consumeScoredAttemptCredit({
    userId: attempt.user_id,
    attemptId: attempt.id,
    moduleSlug: WRITING_MODULE_SLUG,
    taskId: task.id,
    metadata: { estimated_level: validated.estimated_level },
  });

  // 6. Award the matching practice badge now that feedback is ready.
  await awardPracticeBadge(input.userId, attempt.id, badge.slug);

  return {
    ok: true,
    attemptId: attempt.id,
    resultPath: getWritingAttemptResultPath(attempt.id),
  };
}
