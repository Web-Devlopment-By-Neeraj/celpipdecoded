import type { ReactNode } from "react";
import { AppCard } from "@/components/app/AppCard";
import { cx, text } from "@/features/design/design-tokens";

const BEFORE_YOU_START = [
  "Set aside about 2 hours and 40 minutes for the full mock test. Press Start, then choose Full mock test to sit the whole exam. To practice one part, choose Listening, Reading, Writing or Speaking instead.",
  "Choose how you want to practice.",
  "Full mock test works like the real exam. Each screen moves on by itself when its time runs out. Audio plays only once, and you can't pause it. You can go back to the previous screen. You see your results at the end.",
  "One section goes at your own pace. You can pause, replay and rewind the audio, and you move on when you're ready. You see your results as soon as you finish that section.",
  "Listening and Reading show a practice score when you finish. Writing and Speaking can be sent for AI review at the end of those sections. A free account includes 1 Speaking evaluation and 1 Writing evaluation. Your Listening, Reading and Writing answers are saved in this browser as you go.",
  "Get set up before you begin. Use headphones or speakers. Allow microphone access when your browser asks, so we can record your Speaking answers. A laptop or desktop feels closest to the real test. Keep a pen and paper nearby for notes, because you'll have them on test day.",
];

export function MockTestDetails({
  badge,
  start,
}: {
  badge?: ReactNode;
  start: ReactNode;
}) {
  return (
    <>
      <AppCard as="article" className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className={cx(text.heading, "text-xl")}>Before you start</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-academy-navy/85">
              {BEFORE_YOU_START.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          {badge}
        </div>

        <div className="mt-6">
          <p className={cx("mb-3 text-sm font-semibold", text.heading)}>Start</p>
          {start}
        </div>

        <p className="mt-6 rounded-sm border border-academy-line bg-academy-navy-soft/40 px-3 py-2.5 text-sm leading-6 text-academy-navy">
          Note: CELPIP changes its test from time to time. We update our mock
          tests to match, but there may be a short gap before a change appears
          here. For the latest official test format, check celpip.ca.
        </p>
      </AppCard>

      <p className={cx("mt-4 text-sm leading-6", text.secondary)}>
        Scores shown on CELPIP Decoded are practice estimates, not official
        CELPIP scores. CELPIP Decoded is independent and not affiliated with
        Paragon Testing Enterprises.
      </p>
    </>
  );
}
