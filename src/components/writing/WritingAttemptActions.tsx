"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NO_SCORED_ATTEMPTS_REMAINING } from "@/features/usage/access-types";
import { scoredAttemptLimitCopy } from "@/features/usage/usage-copy";
import { evaluateWritingAttempt } from "@/features/writing/evaluate-writing-attempt";
import {
  getWritingAttemptPath,
  writingHistoryCopy,
} from "@/features/writing/writing-attempt-history";
import { getWritingAttemptActionKind } from "@/features/writing/writing-status-labels";

// Visual styles for the same set of actions. "button" is used in the
// mobile history cards, "inline" in the desktop table and the recent
// attempts list where a text action fits better.
export type WritingAttemptActionsVariant = "button" | "inline";

const BUTTON_CLASSES =
  "inline-flex h-10 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60";

const INLINE_CLASSES =
  "inline-flex items-center whitespace-nowrap text-sm font-semibold text-brand transition-colors hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-60";

// Single action per writing attempt: open a saved feedback report, send
// a saved response for evaluation, or retry after a failed run. The
// evaluation request runs against /api/writing/evaluate, which verifies
// ownership from the session cookies, so no keys are used here.
export function WritingAttemptActions({
  attemptId,
  status,
  variant = "inline",
}: {
  attemptId: string;
  status: string;
  variant?: WritingAttemptActionsVariant;
}) {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kind = getWritingAttemptActionKind(status);
  const className = variant === "button" ? BUTTON_CLASSES : INLINE_CLASSES;

  if (kind === "view") {
    return (
      <Link href={getWritingAttemptPath(attemptId)} className={className}>
        {writingHistoryCopy.viewFeedback}
      </Link>
    );
  }

  if (kind === "none") {
    return (
      <span className="inline-flex items-center whitespace-nowrap text-sm text-ink/50">
        {writingHistoryCopy.actionUnavailable}
      </span>
    );
  }

  const handleEvaluate = async () => {
    if (working) {
      return;
    }

    setWorking(true);
    setError(null);

    const result = await evaluateWritingAttempt(attemptId);

    if (result.ok) {
      router.push(result.resultPath);
      return;
    }

    setWorking(false);
    // A blocked attempt is not a fault the learner can retry away, so it
    // reads as the access message rather than as an error.
    setError(
      result.code === NO_SCORED_ATTEMPTS_REMAINING
        ? scoredAttemptLimitCopy.message
        : result.message,
    );
    // Pull fresh status values in case the failed run changed the
    // attempt status behind this row.
    router.refresh();
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => void handleEvaluate()}
        disabled={working}
        aria-busy={working}
        className={className}
      >
        {working
          ? writingHistoryCopy.preparingFeedback
          : kind === "retry"
            ? writingHistoryCopy.tryAgain
            : writingHistoryCopy.submitForEvaluation}
      </button>
      {error && (
        <p role="alert" className="max-w-xs text-xs leading-5 text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
