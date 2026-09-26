// Submits a finished writing response from the browser to the writing
// attempts API route. The route runs with the caller's session cookies,
// so ownership is enforced server side. Never import the admin client
// or any secret keys here.

import { writingPracticeCopy } from "./task-copy";

export type SubmitWritingAttemptInput = {
  taskId: string;
  responseText: string;
  wordCount: number;
  timeSpentSeconds: number;
};

export type SubmitWritingAttemptResult =
  | { ok: true; attemptId: string }
  | { ok: false; message: string };

export async function submitWritingAttempt(
  input: SubmitWritingAttemptInput,
): Promise<SubmitWritingAttemptResult> {
  try {
    const response = await fetch("/api/writing/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      attemptId?: string;
      error?: string;
    };

    if (!response.ok || !payload.ok || !payload.attemptId) {
      return {
        ok: false,
        message: payload.error ?? writingPracticeCopy.errors.saveFailed,
      };
    }

    return { ok: true, attemptId: payload.attemptId };
  } catch {
    return { ok: false, message: writingPracticeCopy.errors.saveFailed };
  }
}
