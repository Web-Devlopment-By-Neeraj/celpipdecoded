// Browser helper that asks the server to transcribe a saved attempt.
// All secrets stay on the server; this only calls the API route and
// normalizes the response for the UI.

import { transcriptCopy } from "./practice-flow";

export type RequestTranscriptResult =
  | { ok: true; transcript: string }
  | { ok: false; message: string };

type TranscribeResponse = {
  ok?: boolean;
  transcript?: string;
  error?: string;
};

export async function requestTranscript(
  attemptId: string,
): Promise<RequestTranscriptResult> {
  try {
    const response = await fetch("/api/speaking/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId }),
    });

    const payload = (await response
      .json()
      .catch(() => null)) as TranscribeResponse | null;

    if (response.ok && payload?.ok && typeof payload.transcript === "string") {
      return { ok: true, transcript: payload.transcript };
    }

    return {
      ok: false,
      message: payload?.error || transcriptCopy.errors.requestFailed,
    };
  } catch {
    return { ok: false, message: transcriptCopy.errors.requestFailed };
  }
}
