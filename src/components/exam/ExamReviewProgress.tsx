"use client";

import { useEffect, useState } from "react";

const WRITING_STEPS = [
  "Reading your answer...",
  "Checking against CELPIP standards...",
  "Writing your feedback...",
];

export function ExamReviewProgress({
  steps = WRITING_STEPS,
  progressLabel,
}: {
  steps?: string[];
  progressLabel?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % steps.length);
    }, 4000);

    return () => window.clearInterval(id);
  }, [steps.length]);

  return (
    <div className="flex items-center gap-3 text-[15px] font-semibold leading-6 text-academy-navy">
      <span
        className="inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-academy-navy border-t-transparent"
        aria-hidden="true"
      />
      <p role="status">{progressLabel ?? steps[index]}</p>
    </div>
  );
}
