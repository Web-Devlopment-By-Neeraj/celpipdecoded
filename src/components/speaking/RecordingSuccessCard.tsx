"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScoredAttemptLimitMessage } from "@/components/usage/ScoredAttemptLimitMessage";
import { NO_SCORED_ATTEMPTS_REMAINING } from "@/features/usage/access-types";
import {
  feedbackCopy,
  practiceCopy,
  recordingCopy,
} from "@/features/speaking/practice-flow";
import { FeedbackProcessingCard } from "./FeedbackProcessingCard";
import { SubmitForFeedbackButton } from "./SubmitForFeedbackButton";

// "blocked" is the USAGE-01 state: the request was valid but the learner
// has no scored attempts left, so the retry button is replaced with the
// access message instead of an error line.
type FeedbackState = "idle" | "working" | "error" | "blocked";

type FeedbackResponse = {
  ok?: boolean;
  resultPath?: string;
  error?: string;
  code?: string;
};

// Success state after the recording has uploaded. From here the student
// submits the attempt for AI-supported feedback. Transcription happens
// in the backend as part of that request; when the feedback is ready
// the student is taken to the attempt result page.
export function RecordingSuccessCard({
  taskId,
  attemptId,
}: {
  taskId: string;
  attemptId: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<FeedbackState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (state === "working") {
      return;
    }
    setState("working");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/speaking/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });

      const payload = (await response
        .json()
        .catch(() => null)) as FeedbackResponse | null;

      if (response.ok && payload?.ok) {
        // Stay in the working state so the processing card remains
        // visible while the result page loads.
        router.push(
          payload.resultPath || `/dashboard/speaking/attempts/${attemptId}`,
        );
        return;
      }

      if (payload?.code === NO_SCORED_ATTEMPTS_REMAINING) {
        setErrorMessage(null);
        setState("blocked");
        return;
      }

      setErrorMessage(payload?.error || feedbackCopy.errors.requestFailed);
      setState("error");
    } catch {
      setErrorMessage(feedbackCopy.errors.requestFailed);
      setState("error");
    }
  };

  const working = state === "working";

  return (
    <section
      aria-label={recordingCopy.successHeading}
      className="rounded-3xl bg-white p-6 text-center ring-1 ring-ink/5 sm:p-8"
    >
      <span
        aria-hidden
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-xl text-brand"
      >
        &#10003;
      </span>
      <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-ink">
        {recordingCopy.successHeading}
      </h2>

      {working ? (
        <div className="mt-5">
          <FeedbackProcessingCard />
        </div>
      ) : state === "blocked" ? (
        <div className="mt-5 text-left">
          <ScoredAttemptLimitMessage previousFeedbackHref="/dashboard/speaking/attempts" />
        </div>
      ) : (
        <div className="mt-3 space-y-5">
          <p className="mx-auto max-w-md text-sm leading-6 text-ink/70">
            {recordingCopy.successText}
          </p>
          {errorMessage && (
            <p
              role="alert"
              className="mx-auto max-w-md rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-800 ring-1 ring-red-200"
            >
              {errorMessage}
            </p>
          )}
          <div className="flex justify-center">
            <SubmitForFeedbackButton
              working={false}
              retry={state === "error"}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      )}

      {!working && (
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/dashboard/speaking/tasks/${taskId}`}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-brand ring-1 ring-brand/30 transition-colors hover:bg-brand/5 sm:w-auto"
          >
            {practiceCopy.backToTask}
          </Link>
          <Link
            href="/dashboard/speaking"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-brand ring-1 ring-brand/30 transition-colors hover:bg-brand/5 sm:w-auto"
          >
            {practiceCopy.practiceAnotherTask}
          </Link>
        </div>
      )}
    </section>
  );
}
