import { speakingCopy } from "@/features/speaking/task-copy";

// The practice prompt, styled to match the task detail page so the
// student sees the same prompt in both places.
export function PracticePromptCard({ prompt }: { prompt: string }) {
  return (
    <section aria-label={speakingCopy.practicePromptTitle}>
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">
        {speakingCopy.practicePromptTitle}
      </h2>
      <div className="mt-3 rounded-2xl border-l-4 border-brand bg-cream-soft p-5">
        <p className="text-sm leading-7 text-ink sm:text-base">{prompt}</p>
      </div>
    </section>
  );
}
