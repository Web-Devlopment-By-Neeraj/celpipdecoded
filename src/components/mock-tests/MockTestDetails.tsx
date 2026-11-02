import type { ReactNode } from "react";
import { AppCard } from "@/components/app/AppCard";
import { cx, text } from "@/features/design/design-tokens";

const BEFORE_YOU_START = [
  "Set aside about 2 hours and 40 minutes for the complete test. Press Start, then choose Complete test to sit the whole exam. To practice one part, choose Listening, Reading, Writing or Speaking instead.",
  "Choose how you want to practice.",
  "Complete test works like the real exam. Each screen moves on by itself when its time runs out. Audio plays only once, and you can't pause it. You can go back to the previous screen. You see your results at the end.",
  "One section goes at your own pace. You can pause, replay and rewind the audio, and you move on when you're ready. You see your results as soon as you finish that section.",
  "Your Writing and Speaking are marked for you. Our AI checks each answer against the official CELPIP performance standards. It gives you a practice estimate and clear feedback on what to fix, so you don't need to save your writing or record yourself. Each Writing or Speaking answer uses one evaluation from your allowance, so a complete test uses 10. On a free account, your first 3 answers are marked, and the rest are saved until you upgrade.",
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
