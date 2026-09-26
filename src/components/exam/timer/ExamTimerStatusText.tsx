"use client";

import type { ExamTimerStatus } from "@/features/exam-engine/exam-timer-types";

// Spoken half of the exam countdown (EXAM-15D).
//
// The visible reading changes four times a second, so it cannot also be
// the thing a screen reader watches: a polite live region on a ticking
// clock reads every number out and buries the question underneath it. The
// reading is therefore silent, and this is the region that speaks.
//
// It says one thing, once, when the window closes. Warning and urgent are
// colour only: they are a glance cue, and interrupting somebody mid
// question to tell them they have nine seconds left is worse than saying
// nothing. Reaching zero is different, because the colour cue for it looks
// the same as the urgent one and the wording is the only thing that
// distinguishes them.
//
// Nothing here makes a sound, opens a dialog or moves focus. The ticket is
// explicit that time running out is a change of reading and nothing else.
//
// The region is rendered whatever the status is, and empty until the end.
// A live region has to be in the document before its text changes for the
// change to be announced, so creating it at zero would announce nothing.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ExamTimerStatusTextProps = {
  status: ExamTimerStatus;
  // What to say when the window has run out. Passed in so the wording
  // stays with the rest of the exam copy.
  expiredText: string;
};

export function ExamTimerStatusText({
  status,
  expiredText,
}: ExamTimerStatusTextProps) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {status === "expired" ? expiredText : ""}
    </span>
  );
}
