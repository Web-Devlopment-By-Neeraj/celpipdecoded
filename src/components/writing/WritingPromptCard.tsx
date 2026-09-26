import { writingCopy } from "@/features/writing/task-copy";

// Prompt display for the timed writing screen. Preserves line breaks
// so multi-part prompts stay readable.
export function WritingPromptCard({ prompt }: { prompt: string }) {
  return (
    <section aria-label={writingCopy.practicePromptTitle}>
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">
        {writingCopy.practicePromptTitle}
      </h2>
      <div className="mt-3 rounded-2xl border-l-4 border-brand bg-cream-soft p-5">
        <p className="whitespace-pre-line text-sm leading-7 text-ink sm:text-base">
          {prompt}
        </p>
      </div>
    </section>
  );
}
