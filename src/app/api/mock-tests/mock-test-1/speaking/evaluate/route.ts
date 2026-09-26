import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { evaluateSpeakingMockSection } from "@/features/exam-engine/evaluate-speaking-mock-test";
import { mockTest1SpeakingSection } from "@/features/exam-engine/mock-tests/mock-test-1/speaking-section";
import { parseSpeakingMockSubmissionMetadata } from "@/features/exam-engine/speaking-mock-evaluation-schema";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import {
  MAX_SPEAKING_MOCK_AUDIO_BYTES,
  MAX_SPEAKING_MOCK_TOTAL_AUDIO_BYTES,
  isSupportedSpeakingMockAudioType,
} from "@/features/exam-engine/transcribe-speaking-mock-audio";
import type { SpeakingMockTaskSubmission } from "@/features/exam-engine/evaluate-speaking-mock-test";
import type { SpeakingMockEvaluationOutcome } from "@/features/exam-engine/speaking-mock-evaluation-types";

// AI review for the Mock Test 1 Speaking section (EXAM-28).
//
// EXAM-27 shipped the Speaking route with no server side of any kind,
// and the note at the top of its page.tsx said why: nothing left the
// browser, so nothing needed a server. This ticket gives it one, and it
// is an API route rather than the server action beside the page.
//
// Why an API route and not actions.ts
// -----------------------------------
//
// The ticket prefers a server action and allows this route where an
// action cannot safely carry multiple audio blobs. It cannot. A Next.js
// server action posts its arguments through the framework's own encoding
// with a body size limit that defaults to 1 MB, and this submission is
// up to eight audio recordings at once. A section recorded at the full
// windows is comfortably past that limit, so an action would fail on a
// complete attempt and succeed on a partial one, which is the worst of
// the two behaviours. A route handler reads the request body as a
// stream through the platform Request API and is not bound by that
// limit.
//
// The trade is that a route handler is a public URL rather than a
// framework call, so it does its own work at the door: it checks the
// session, refuses anything that is not multipart FormData, refuses a
// submission that is too large before a byte reaches a provider, and
// takes nothing from the caller that it can read from the content
// instead.
//
// The Writing review is still a server action, and that is right for it:
// its whole input is two strings.
//
// What crosses in each direction
// ------------------------------
//
//   client to server   one metadata JSON part, and up to eight audio
//                      parts named audio-speaking-task-N
//   server to client   an estimated level, per task feedback, criterion
//                      levels, transcripts, corrections, two rewrites, a
//                      fixed practice disclaimer and a fixed audio
//                      assessment note
//
// The Speaking prompts, pictures, recording windows, task ids and titles
// are not sent by the browser and are not accepted from it. They are
// read here from mockTest1SpeakingSection, so nothing a caller sends can
// change which prompt an answer is judged against. The metadata part
// carries a taskId, and it is used only to check the browser's claim
// against the server's own content: a part that names a task the section
// does not have is dropped rather than trusted.
//
// What this route does not do
// ---------------------------
//
// - it saves nothing. No attempt row, no migration, no Supabase write
//   and no usage event. The review is returned to the screen that asked
//   for it and is stored nowhere
// - it uploads nothing. The audio arrives in this request, is sent to
//   the transcription model inside it, and is released when the request
//   ends. No Supabase Storage bucket is touched and no file is written
//   to disk
// - it never logs audio and never logs a transcript. What reaches the
//   server log is a task id, a byte count and a character count
// - it never returns a provider message, a stack, a model name or any
//   part of the environment. Every failure carries one of our codes and
//   our own wording
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Node, not Edge. The transcription step wraps a File through the OpenAI
// SDK's toFile helper and the pipeline constructs an SDK client, both of
// which want the Node runtime, and the standalone Speaking routes beside
// this one already pin it for the same reason.
export const runtime = "nodejs";

// The FormData part names.
//
// The metadata part is one JSON string. The audio parts are positional,
// audio-speaking-task-1 through audio-speaking-task-N, which is the
// naming the ticket specifies. Positional rather than keyed on the
// content's own task ids, so the wire format stays readable and stays
// the same if a task id is ever renamed.
const METADATA_FIELD = "metadata";
const AUDIO_FIELD_PREFIX = "audio-speaking-task-";

// The HTTP status for each failure code.
//
// The client does not branch on status, it branches on code, so these
// are here to be correct to a proxy and a log rather than to drive the
// UI. 402 for exhausted credits is the closest honest reading: the
// request was well formed and could not be paid for.
const STATUS_BY_CODE: Record<
  Extract<SpeakingMockEvaluationOutcome, { ok: false }>["code"],
  number
> = {
  unauthenticated: 401,
  "not-configured": 503,
  "invalid-request": 400,
  "audio-too-large": 413,
  "unsupported-audio-type": 415,
  "credits-exhausted": 402,
  "evaluation-failed": 502,
};

function fail(
  code: Extract<SpeakingMockEvaluationOutcome, { ok: false }>["code"],
  message: string,
) {
  const outcome: SpeakingMockEvaluationOutcome = { ok: false, code, message };

  return NextResponse.json(outcome, { status: STATUS_BY_CODE[code] });
}

export async function POST(request: Request) {
  // The session is checked before the body is read, so an
  // unauthenticated request never gets as far as making the server parse
  // several megabytes of audio, let alone spend a provider call on it.
  //
  // This route sits outside /dashboard, so the layout auth guard does
  // not cover it and this check is the only one there is.
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("unauthenticated", speakingMockCopy.reviewUnauthenticatedText);
  }

  let form: FormData;

  try {
    form = await request.formData();
  } catch (error) {
    // A body that is not multipart FormData, a truncated upload, or a
    // request whose parts could not be read. Logged without any of the
    // body in it.
    console.error("Speaking mock review could not parse the submission:", error);

    return fail("invalid-request", speakingMockCopy.reviewInvalidRequestText);
  }

  const metadataRaw = form.get(METADATA_FIELD);

  if (typeof metadataRaw !== "string") {
    console.error("Speaking mock review submission had no metadata part.");

    return fail("invalid-request", speakingMockCopy.reviewInvalidRequestText);
  }

  let metadataJson: unknown;

  try {
    metadataJson = JSON.parse(metadataRaw);
  } catch (error) {
    console.error("Speaking mock review metadata was not valid JSON:", error);

    return fail("invalid-request", speakingMockCopy.reviewInvalidRequestText);
  }

  const metadata = parseSpeakingMockSubmissionMetadata(metadataJson);

  if (!metadata) {
    console.error("Speaking mock review metadata did not match the schema.");

    return fail("invalid-request", speakingMockCopy.reviewInvalidRequestText);
  }

  // The browser's claims about its own recordings, keyed by task number.
  //
  // Keyed by number rather than by task id because the audio parts are
  // positional, so the number is what joins a claim to a part. The id in
  // the claim is checked against the content below and is never used to
  // look anything up.
  const claimsByTaskNumber = new Map(
    metadata.tasks.map((entry) => [entry.taskNumber, entry]),
  );

  const submissions: SpeakingMockTaskSubmission[] = [];
  let totalBytes = 0;

  for (const task of mockTest1SpeakingSection.tasks) {
    const claim = claimsByTaskNumber.get(task.taskNumber);
    const part = form.get(AUDIO_FIELD_PREFIX + task.taskNumber);

    // Not a File, or an empty one. Treated as a task with no recording
    // rather than as a bad request, because that is what it is: a
    // learner who skipped a task sends no part for it, and a browser
    // that sent an empty blob has sent nothing worth transcribing.
    if (!(part instanceof File) || part.size === 0) {
      submissions.push({ task, audioFile: null, durationSeconds: 0 });
      continue;
    }

    if (part.size > MAX_SPEAKING_MOCK_AUDIO_BYTES) {
      console.error(
        "Speaking mock review refused an oversized recording:",
        task.taskId,
        part.size,
      );

      return fail("audio-too-large", speakingMockCopy.reviewAudioTooLargeText);
    }

    totalBytes += part.size;

    if (totalBytes > MAX_SPEAKING_MOCK_TOTAL_AUDIO_BYTES) {
      console.error(
        "Speaking mock review refused an oversized submission:",
        totalBytes,
      );

      return fail("audio-too-large", speakingMockCopy.reviewAudioTooLargeText);
    }

    // The container check is here as well as inside the transcription
    // helper, and the two do different jobs. This one refuses a whole
    // submission recorded in a format nothing in the pipeline can read,
    // before any provider call is made, because a learner whose browser
    // records in an unreadable container needs to be told that rather
    // than shown eight failed tasks. The one inside the helper is the
    // per task guard for a mixed submission.
    if (!isSupportedSpeakingMockAudioType(part.type)) {
      console.error(
        "Speaking mock review refused an unsupported audio type:",
        task.taskId,
      );

      return fail(
        "unsupported-audio-type",
        speakingMockCopy.reviewUnsupportedAudioText,
      );
    }

    // The claim is used for one field only, the duration, and only when
    // its task id agrees with the server's. A mismatched id means the
    // browser and the server disagree about which task this is, so the
    // duration is dropped and the recording is still reviewed: a task
    // with an unknown duration is a smaller loss than a task judged
    // against another task's clock.
    const durationSeconds =
      claim && claim.taskId === task.taskId ? claim.durationSeconds : 0;

    submissions.push({ task, audioFile: part, durationSeconds });
  }

  try {
    const outcome = await evaluateSpeakingMockSection(mockTest1SpeakingSection, {
      submissions,
    });

    if (!outcome.ok) {
      return NextResponse.json(outcome, {
        status: STATUS_BY_CODE[outcome.code],
      });
    }

    return NextResponse.json(outcome);
  } catch (error) {
    // The pipeline is written not to throw, so reaching here is a bug
    // rather than a provider failure. It is caught anyway, because an
    // unhandled rejection in a route handler reaches the browser as an
    // opaque 500 with no wording on it and the error screen would have
    // nothing to say.
    console.error("Speaking mock review route error:", error);

    return fail("evaluation-failed", speakingMockCopy.reviewFailedText);
  }
}
