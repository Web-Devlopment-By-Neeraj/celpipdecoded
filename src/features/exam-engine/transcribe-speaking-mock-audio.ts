// Server side transcription for one Mock Test 1 Speaking recording
// (EXAM-28).
//
// SERVER ONLY. This module takes an OpenAI client and reads
// OPENAI_TRANSCRIPTION_MODEL from the process environment. Never import
// it from a client component and never re-export anything from it
// through a file a client component imports. The browser reaches it
// through the API route at
// src/app/api/mock-tests/mock-test-1/speaking/evaluate/route.ts and by
// no other route.
//
// One recording in, one outcome out. The pipeline in
// evaluate-speaking-mock-test.ts calls this once per recorded task and
// decides what to do with eight outcomes; this file has no opinion about
// the section, the other tasks, or the review.
//
// What it deliberately does not do:
//
// - it never touches Supabase. The audio is not downloaded from storage
//   and is never written to it. It arrives in the request, is sent to
//   the transcription model, and is released when the request ends. That
//   is the difference between this file and
//   src/features/speaking/transcribe-attempt.ts, which is the standalone
//   Speaking Practice pipeline: that one owns an attempt row, a storage
//   bucket, a usage event and a credit check, and none of them are
//   imported, modified or reused here
// - it never logs audio, and never logs a transcript. What reaches the
//   server log is a task id, a byte count and a character count, which
//   is enough to diagnose a failure and not enough to reconstruct what
//   anybody said
// - it never throws. Every failure comes back as an outcome, so the
//   pipeline can carry on with the other seven tasks
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { toFile } from "openai";
import type OpenAI from "openai";

// The model used when OPENAI_TRANSCRIPTION_MODEL is unset.
//
// The same default the standalone Speaking Practice transcription falls
// back to, which is the fallback pattern the ticket asks for: an
// environment configured for one is configured for the other, and a
// missing variable is a configured default rather than a failed review.
const DEFAULT_TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";

// The transcription bias prompt.
//
// A transcription model will tidy speech if it is not told otherwise: it
// drops the "um", joins the false start to the sentence that replaced
// it, and hands back a fluent paragraph. That would be a transcript of a
// better answer than the one that was given, and it would quietly delete
// the evidence Listenability is judged on, so this prompt asks for the
// opposite.
//
// It is a bias, not a guarantee. How much of the hesitation survives
// depends on the model, which is exactly why the result screen says the
// transcript is a close record rather than an exact one.
const TRANSCRIPTION_PROMPT =
  "This is a CELPIP speaking practice response from an English-language " +
  "test preparation student. Transcribe exactly what the speaker said. " +
  "Keep filler words such as um, uh and like. Keep repetitions, false " +
  "starts and self-corrections. Do not correct grammar, do not tidy the " +
  "wording and do not rewrite the answer.";

// Audio containers a browser MediaRecorder produces, plus the ones the
// transcription API accepts for them.
//
// Checked rather than assumed, because the API route is reachable by
// direct POST and a part named audio-speaking-task-1 can hold anything
// at all. A learner's browser only ever produces webm or mp4, which
// src/features/speaking/audio-utils.ts picks between, so anything
// outside this list is a request that did not come from the section.
const SUPPORTED_AUDIO_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/mpga",
  "audio/m4a",
  "audio/x-m4a",
  "audio/wav",
  "audio/ogg",
  "audio/flac",
] as const;

// The base mime type of a part, with any codec parameter dropped.
//
// A browser reports "audio/webm;codecs=opus", and the container is the
// part that matters here. Lowercased, because a hand made request can
// send "Audio/WEBM".
export function getSpeakingMockAudioBaseType(mimeType: string): string {
  return mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
}

export function isSupportedSpeakingMockAudioType(mimeType: string): boolean {
  const base = getSpeakingMockAudioBaseType(mimeType);

  return SUPPORTED_AUDIO_TYPES.some((type) => type === base);
}

// The largest single recording this pipeline will accept, in bytes.
//
// 25 MB, which is the transcription API's own per file limit. A 90
// second opus recording is well under a megabyte, so this is far above
// any honest answer from this section and is here to stop a hand made
// request rather than to catch a talkative learner.
export const MAX_SPEAKING_MOCK_AUDIO_BYTES = 25 * 1024 * 1024;

// The largest whole submission, in bytes.
//
// Eight tasks at 25 MB each would be 200 MB of request body for a
// section whose honest total is a few megabytes. 40 MB leaves room for
// eight generous recordings and refuses anything that could only be an
// attempt to make the server do expensive work.
export const MAX_SPEAKING_MOCK_TOTAL_AUDIO_BYTES = 40 * 1024 * 1024;

// The shortest transcript this pipeline treats as an answer.
//
// Below this a task is reported as an insufficient response rather than
// scored. A recording of silence transcribes to nothing, and a recording
// of one word transcribes to one word; neither can be judged against
// four criteria, and asking a model to try would produce four
// invented levels rather than four judgements.
//
// 20 characters is roughly four words. It is deliberately low: the job
// here is to catch silence and accidents, not to decide what counts as a
// short answer. A genuinely brief answer of a few sentences is scored,
// and the length check on the card is where being too short is reported.
export const MIN_SPEAKING_MOCK_TRANSCRIPT_CHARACTERS = 20;

// The transcription model this environment uses.
//
// Read through a function rather than a constant so the variable is read
// per request and a deployment does not have to be rebuilt to change it.
export function getSpeakingMockTranscriptionModel(): string {
  return process.env.OPENAI_TRANSCRIPTION_MODEL || DEFAULT_TRANSCRIPTION_MODEL;
}

// Why a provider call failed, at the coarseness the UI needs.
//
// Deliberately not the full set of codes ai-usage-metadata.ts produces.
// That helper exists to fill a usage row for a report, and this one
// exists to choose a sentence for a learner, so the only distinctions it
// draws are the ones that change what the learner should do next:
//
// - "credits-exhausted" means the account is out of credit. Retrying
//   cannot help and the screen must not invite it. This is the case the
//   ticket calls out by name
// - everything else means try again later, so it is one kind
export type SpeakingMockProviderFailureKind =
  | "credits-exhausted"
  | "provider-error";

// Read a string field off an unknown thrown value.
function readStringField(value: unknown, key: string): string {
  const field = (value as Record<string, unknown> | null)?.[key];

  return typeof field === "string" ? field : "";
}

// Classify a thrown provider error.
//
// Matched by shape rather than by instanceof, so this file does not have
// to import the SDK's error classes and a change to them cannot silently
// stop the credit case being recognised.
//
// The credit case is recognised three ways, because the provider has
// reported it as all three at different times: a 402, a 429 carrying a
// billing related code, or a 429 whose message names the credit balance.
// Recognising it too eagerly is the safer failure: the worst outcome is
// a learner being told to add credits when the real problem was a rate
// limit, and the message still leaves their recordings on the page.
export function classifySpeakingMockProviderError(
  error: unknown,
): SpeakingMockProviderFailureKind {
  const candidate = error as
    | { status?: unknown; code?: unknown; type?: unknown; message?: unknown }
    | null;

  const status = typeof candidate?.status === "number" ? candidate.status : null;
  const code = readStringField(error, "code").toLowerCase();
  const type = readStringField(error, "type").toLowerCase();
  const message = readStringField(error, "message").toLowerCase();

  if (status === 402) {
    return "credits-exhausted";
  }

  const billingCodes = [
    "credit_balance_exhausted",
    "insufficient_quota",
    "billing_hard_limit_reached",
    "billing_not_active",
  ];

  if (billingCodes.some((entry) => code === entry || type === entry)) {
    return "credits-exhausted";
  }

  if (
    status === 429 &&
    (message.includes("credit balance") ||
      message.includes("credit_balance_exhausted") ||
      message.includes("insufficient_quota") ||
      message.includes("quota"))
  ) {
    return "credits-exhausted";
  }

  return "provider-error";
}

// One recording, as the pipeline hands it over.
export type SpeakingMockAudioInput = {
  // For the log line. No transcript and no audio is ever logged beside
  // it.
  taskId: string;
  // The part as it arrived in the FormData.
  file: File;
};

// What happened to one recording.
//
// Four outcomes rather than a transcript or a throw, because the
// pipeline has to be able to tell them apart and put different words on
// four different cards:
//
// - "transcribed" produced usable speech and is sent for scoring
// - "insufficient" transcribed into almost nothing. Silence, or a word
// - "unsupported" was not an audio container this pipeline reads. It is
//   separated from a failure because it has a different fix: record in a
//   different browser rather than try again
// - "failed" is a provider failure, carrying the kind so the route can
//   tell a credit failure from anything else
export type SpeakingMockTranscriptionOutcome =
  | { status: "transcribed"; transcript: string }
  | { status: "insufficient" }
  | { status: "unsupported" }
  | { status: "failed"; kind: SpeakingMockProviderFailureKind };

// Transcribe one recording.
//
// The client is passed in rather than constructed here, so the whole
// section is transcribed through one client and the API key is read in
// exactly one place: the pipeline. This file never reads
// OPENAI_API_KEY at all.
//
// Always resolves. A provider failure on one task is one failed task,
// not a failed section, which is what the ticket asks for: a missing or
// broken recording must not take the other seven down with it.
export async function transcribeSpeakingMockAudio(
  client: OpenAI,
  model: string,
  input: SpeakingMockAudioInput,
): Promise<SpeakingMockTranscriptionOutcome> {
  const { taskId, file } = input;

  // The size check is here as well as in the route. The route rejects a
  // whole submission that is too big, and this rejects one part that is,
  // so a single oversized recording is one unreadable task rather than a
  // refused section.
  if (file.size > MAX_SPEAKING_MOCK_AUDIO_BYTES) {
    console.error(
      "Speaking mock transcription skipped an oversized recording:",
      taskId,
      file.size,
    );

    return { status: "unsupported" };
  }

  if (!isSupportedSpeakingMockAudioType(file.type)) {
    // The type is logged because it is a container name, not content.
    console.error(
      "Speaking mock transcription skipped an unsupported audio type:",
      taskId,
      getSpeakingMockAudioBaseType(file.type),
    );

    return { status: "unsupported" };
  }

  let transcript = "";

  try {
    const result = await client.audio.transcriptions.create({
      // Wrapped as a named file so the API can detect the container from
      // the extension as well as the type. The name is built from the
      // task id and the container and carries nothing about the learner.
      file: await toFile(file, buildTranscriptionFileName(taskId, file.type)),
      model,
      language: "en",
      response_format: "json",
      prompt: TRANSCRIPTION_PROMPT,
    });

    transcript = result.text?.trim() ?? "";
  } catch (error) {
    // Logged server side so a failure is diagnosable, and never
    // returned, so a provider message can never reach a learner's
    // screen.
    console.error("Speaking mock transcription failed for", taskId, error);

    return { status: "failed", kind: classifySpeakingMockProviderError(error) };
  }

  if (transcript.length < MIN_SPEAKING_MOCK_TRANSCRIPT_CHARACTERS) {
    // The length is logged, not the text. A four character transcript is
    // still something somebody said.
    console.error(
      "Speaking mock transcription returned too little speech for",
      taskId,
      transcript.length,
    );

    return { status: "insufficient" };
  }

  return { status: "transcribed", transcript };
}

// A file name for the upload, from the task id and the container.
//
// The transcription API uses the extension as a hint alongside the mime
// type, so a name with the right extension makes the container
// unambiguous. Nothing about the learner is in it.
function buildTranscriptionFileName(taskId: string, mimeType: string): string {
  const base = getSpeakingMockAudioBaseType(mimeType);

  const extension =
    base === "audio/mp4" || base === "audio/m4a" || base === "audio/x-m4a"
      ? "m4a"
      : base === "audio/mpeg" || base === "audio/mpga"
        ? "mp3"
        : base === "audio/wav"
          ? "wav"
          : base === "audio/ogg"
            ? "ogg"
            : base === "audio/flac"
              ? "flac"
              : "webm";

  // Sanitised, because the task id reaches this from the server's own
  // content object today but a file name is not a place to be relaxed
  // about what a string might contain.
  const safeTaskId = taskId.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 80);

  return safeTaskId + "." + extension;
}
