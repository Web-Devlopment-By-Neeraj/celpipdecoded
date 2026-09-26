// Browser helper that sends the Speaking recordings for review
// (EXAM-28).
//
// The one piece of this feature that runs in the browser and talks to a
// server. It builds the FormData the API route expects, posts it, and
// normalizes whatever comes back into the same outcome shape the server
// returns, so the section prototype has exactly one result type to
// branch on and never has to read a status code.
//
// It is the Speaking counterpart of the prop the Writing section is
// given. Writing passes a server action down from its page, because its
// whole input is two strings and an action can carry those. Speaking
// cannot use an action for the reason the API route's own header note
// gives, so the call has to be a fetch, and a fetch has to be made from
// a client module. This is that module, kept out of the component so the
// wire format is in one readable place rather than inlined in the middle
// of a screen flow.
//
// It holds no secret and knows no model name. The API key, the
// transcription model and the scoring model are read on the server and
// nothing here can see any of them. What crosses from here is audio and
// three numbers per task.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { speakingMockCopy } from "./speaking-mock-copy";
import type {
  SpeakingMockEvaluationOutcome,
  SpeakingMockSubmissionMetadata,
  SpeakingMockSubmissionTask,
} from "./speaking-mock-evaluation-types";
import type {
  SpeakingResponseMap,
  SpeakingSectionContent,
} from "./speaking-mock-types";
import { getSpeakingResponse } from "./speaking-mock-flow";

// Where the review is posted.
//
// Fixed rather than passed in, because it is the endpoint for this one
// section's content and a second Mock Test would need its own route with
// its own content import rather than this one pointed elsewhere.
export const SPEAKING_MOCK_REVIEW_ENDPOINT =
  "/api/mock-tests/mock-test-1/speaking/evaluate";

const METADATA_FIELD = "metadata";
const AUDIO_FIELD_PREFIX = "audio-speaking-task-";

// A file name for the audio part.
//
// A FormData file part needs a name, and a name with the right extension
// is one more hint the server can use to identify the container. It
// carries the task number and nothing about the learner.
function buildAudioFileName(taskNumber: number, mimeType: string | null): string {
  const base = (mimeType ?? "audio/webm").split(";")[0]?.trim().toLowerCase();

  const extension =
    base === "audio/mp4" || base === "audio/x-m4a" || base === "audio/m4a"
      ? "m4a"
      : base === "audio/ogg"
        ? "ogg"
        : base === "audio/wav"
          ? "wav"
          : "webm";

  return "speaking-task-" + taskNumber + "." + extension;
}

// Build the submission for a whole section.
//
// Exported so the wire format can be built and inspected without making
// a request. Every audio part is positional and every metadata entry
// carries the task id the browser believes it is sending, which the
// server checks against its own content rather than trusting.
//
// A task with no recording contributes a metadata entry with
// hasRecording false and no audio part at all. That is deliberate: the
// server should be able to tell "the learner skipped this" from "the
// browser forgot to include it", and an entry with no part says the
// first.
export function buildSpeakingMockReviewFormData(
  content: SpeakingSectionContent,
  responses: SpeakingResponseMap,
): FormData {
  const form = new FormData();
  const tasks: SpeakingMockSubmissionTask[] = [];

  for (const task of content.tasks) {
    const response = getSpeakingResponse(responses, task.taskId);
    const hasRecording = response.audioBlob !== null;

    tasks.push({
      taskId: task.taskId,
      taskNumber: task.taskNumber,
      durationSeconds: response.durationSeconds,
      hasRecording,
      ...(response.mimeType ? { mimeType: response.mimeType } : {}),
    });

    if (response.audioBlob) {
      form.append(
        AUDIO_FIELD_PREFIX + task.taskNumber,
        response.audioBlob,
        buildAudioFileName(task.taskNumber, response.mimeType),
      );
    }
  }

  const metadata: SpeakingMockSubmissionMetadata = { tasks };

  form.append(METADATA_FIELD, JSON.stringify(metadata));

  return form;
}

// Whether a value looks like the outcome the route returns.
//
// Checked rather than cast, because a proxy, a sign-in redirect or an
// error page can put HTML or an unrelated JSON body on the other end of
// this fetch, and a cast would let that reach the result screen as an
// evaluation with no fields on it.
function isEvaluationOutcome(
  value: unknown,
): value is SpeakingMockEvaluationOutcome {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { ok?: unknown; evaluation?: unknown; code?: unknown };

  if (candidate.ok === true) {
    return !!candidate.evaluation && typeof candidate.evaluation === "object";
  }

  return candidate.ok === false && typeof candidate.code === "string";
}

// Send the recordings for review.
//
// Always resolves to an outcome. A network failure, an unparseable body
// and an unexpected shape all come back as an ok:false outcome with our
// own wording, so the section prototype never has to catch anything and
// never has a provider message to render.
//
// The response status is deliberately not read. The route puts the same
// information in the body as a code, the codes are what the error screen
// branches on, and reading both would give two sources of truth that
// could disagree.
export async function submitSpeakingMockReview(
  content: SpeakingSectionContent,
  responses: SpeakingResponseMap,
  options?: { signal?: AbortSignal },
): Promise<SpeakingMockEvaluationOutcome> {
  try {
    const response = await fetch(SPEAKING_MOCK_REVIEW_ENDPOINT, {
      method: "POST",
      body: buildSpeakingMockReviewFormData(content, responses),
      signal: options?.signal,
    });

    const payload: unknown = await response.json().catch(() => null);

    if (isEvaluationOutcome(payload)) {
      return payload;
    }

    return {
      ok: false,
      code: "evaluation-failed",
      message: speakingMockCopy.reviewFailedText,
    };
  } catch {
    // A dropped connection, a cancelled request or a browser that
    // refused the upload. No provider is involved and there is nothing
    // to report but our own sentence.
    return {
      ok: false,
      code: "evaluation-failed",
      message: speakingMockCopy.reviewFailedText,
    };
  }
}
