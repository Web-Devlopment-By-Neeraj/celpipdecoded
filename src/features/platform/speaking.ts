// Speaking evaluation is audio-first. Scoring receives the recording.
// A transcript is something the same call returns. A separate speech-to-text
// step is only the text-only fallback, and that fallback says so.

import { z } from "zod";
import { costCents, type PriceTable } from "./settings";
import { levelToStored } from "./writing";

const levelSchema = z.union([
  z.literal("M"),
  z.number().int().min(3).max(12),
]);

export const SPEAKING_CRITERIA = [
  "content_coherence",
  "vocabulary",
  "listenability",
  "task_fulfilment",
] as const;

const deliveryItem = z.object({
  assessed: z.boolean(),
  comment: z.string(),
});

export const speakingEvaluationSchema = z.object({
  task: z.string().regex(/^speaking_task_[1-8]$/),
  transcript_verbatim: z.string(),
  seconds_spoken: z.number(),
  criteria: z
    .array(
      z.object({
        name: z.enum(SPEAKING_CRITERIA),
        level: levelSchema,
        evidence: z.string(),
        next_level_gap: z.string(),
      }),
    )
    .length(4),
  delivery: z.object({
    pronunciation: deliveryItem,
    rhythm: deliveryItem,
    intonation: deliveryItem,
  }),
  assessment_mode: z.enum(["audio", "text_only"]),
  overall_level: levelSchema,
  mistakes: z
    .array(
      z.object({
        original: z.string(),
        correction: z.string(),
        criterion: z.enum(SPEAKING_CRITERIA),
      }),
    )
    .max(5),
  rewrite_next_level: z.string(),
  rewrite_top_level: z.string(),
  is_estimate: z.boolean().optional(),
});

export type SpeakingEvaluation = z.infer<typeof speakingEvaluationSchema> & {
  is_estimate: true;
};

export const TEXT_ONLY_NOTICE =
  "This answer was assessed from a transcript only. Pronunciation, rhythm and intonation were not assessed.";

export const NO_SPEECH_MESSAGE = "No speech detected";

export const ACCEPTED_AUDIO_TYPES = [
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/aac",
  "audio/mpeg",
] as const;

export function audioTypeAccepted(mime: string): boolean {
  const base = mime.split(";")[0]?.trim().toLowerCase() ?? "";
  return ACCEPTED_AUDIO_TYPES.some((allowed) => allowed.split(";")[0] === base);
}

export function pickRecorderMime(supported: string[]): string | null {
  const preferred = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac"];
  return preferred.find((mime) => supported.includes(mime)) ?? null;
}

export type SpeakingTake = {
  takeNo: number;
  submitted: boolean;
  seconds: number;
  mime: string;
};

export function submittedTake(takes: SpeakingTake[]): SpeakingTake | null {
  return takes.find((take) => take.submitted) ?? null;
}

export type SpeakingModel = {
  transcribe: (audioId: string) => Promise<string>;
  scoreAudio: (audioId: string) => Promise<{ raw: string; audioSeconds: number; inputTokens: number; outputTokens: number }>;
  scoreText: (transcript: string) => Promise<{ raw: string; inputTokens: number; outputTokens: number }>;
};

export type SpeakingEvalOutcome =
  | {
      ok: true;
      evaluation: SpeakingEvaluation;
      modelVersion: string;
      costCents: number;
      allowanceUsed: boolean;
      status: "done";
      calls: { audioScores: number; transcriptions: number };
    }
  | {
      ok: false;
      status: "no_speech" | "failed";
      allowanceUsed: false;
      studentMessage: string;
      calls: { audioScores: number; transcriptions: number };
    };

function notAssessed() {
  return { assessed: false, comment: "Not assessed" };
}

function parseSpeaking(raw: string): SpeakingEvaluation | null {
  try {
    const parsed = speakingEvaluationSchema.safeParse(JSON.parse(raw));
    if (!parsed.success || parsed.data.is_estimate === false) return null;
    return { ...parsed.data, is_estimate: true };
  } catch {
    return null;
  }
}

export async function evaluateSpeaking(input: {
  task: string;
  audioId: string;
  secondsSpoken: number;
  mime: string;
  submitted: boolean;
  minSeconds: number;
  modelId: string;
  promptVersion: string;
  priceTable: PriceTable;
  maxAttempts: number;
  model: SpeakingModel;
}): Promise<SpeakingEvalOutcome> {
  const calls = { audioScores: 0, transcriptions: 0 };
  if (!input.submitted) {
    return {
      ok: false,
      status: "failed",
      allowanceUsed: false,
      studentMessage: "Only the submitted take is evaluated.",
      calls,
    };
  }
  if (!audioTypeAccepted(input.mime)) {
    return {
      ok: false,
      status: "failed",
      allowanceUsed: false,
      studentMessage: "This recording format is not supported.",
      calls,
    };
  }
  if (input.secondsSpoken < input.minSeconds) {
    return {
      ok: false,
      status: "no_speech",
      allowanceUsed: false,
      studentMessage: NO_SPEECH_MESSAGE,
      calls,
    };
  }

  for (let attempt = 1; attempt <= input.maxAttempts; attempt += 1) {
    calls.audioScores += 1;
    try {
      const response = await input.model.scoreAudio(input.audioId);
      const evaluation = parseSpeaking(response.raw);
      if (!evaluation || evaluation.assessment_mode !== "audio") continue;
      evaluation.seconds_spoken = input.secondsSpoken;
      return {
        ok: true,
        evaluation,
        modelVersion: `${input.modelId}+${input.promptVersion}`,
        costCents: costCents(
          {
            inputTokens: response.inputTokens,
            outputTokens: response.outputTokens,
            audioSeconds: response.audioSeconds,
          },
          input.priceTable,
        ),
        allowanceUsed: true,
        status: "done",
        calls,
      };
    } catch {
      continue;
    }
  }

  let transcript = "";
  try {
    calls.transcriptions += 1;
    transcript = await input.model.transcribe(input.audioId);
  } catch {
    transcript = "";
  }

  if (transcript.trim()) {
    try {
      const response = await input.model.scoreText(transcript);
      const evaluation = parseSpeaking(response.raw);
      if (evaluation) {
        evaluation.assessment_mode = "text_only";
        evaluation.delivery = {
          pronunciation: notAssessed(),
          rhythm: notAssessed(),
          intonation: notAssessed(),
        };
        evaluation.transcript_verbatim = transcript;
        evaluation.seconds_spoken = input.secondsSpoken;
        return {
          ok: true,
          evaluation,
          modelVersion: `${input.modelId}+${input.promptVersion}`,
          costCents: costCents(
            { inputTokens: response.inputTokens, outputTokens: response.outputTokens },
            input.priceTable,
          ),
          allowanceUsed: true,
          status: "done",
          calls,
        };
      }
    } catch {
      // Fall through to failed.
    }
  }

  return {
    ok: false,
    status: "failed",
    allowanceUsed: false,
    studentMessage:
      "We could not mark this answer. It has not used your allowance. We will retry shortly.",
    calls,
  };
}

export function highlightFillers(transcript: string): Array<{ text: string; filler: boolean }> {
  const pattern = /\b(um+|uh+|er+|ah+)\b/gi;
  const parts: Array<{ text: string; filler: boolean }> = [];
  let cursor = 0;
  for (const match of transcript.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push({ text: transcript.slice(cursor, index), filler: false });
    parts.push({ text: match[0], filler: true });
    cursor = index + match[0].length;
  }
  if (cursor < transcript.length) {
    parts.push({ text: transcript.slice(cursor), filler: false });
  }
  return parts;
}

export { levelToStored };
