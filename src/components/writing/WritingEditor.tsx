"use client";

import { writingPracticeCopy } from "@/features/writing/task-copy";

// Large plain textarea for the timed writing session. Line breaks are
// preserved as typed. Kept deliberately simple so it works well on
// phone keyboards.
export function WritingEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <section aria-label={writingPracticeCopy.editorLabel}>
      <label
        htmlFor="writing-response"
        className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50"
      >
        {writingPracticeCopy.editorLabel}
      </label>
      <textarea
        id="writing-response"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={writingPracticeCopy.editorPlaceholder}
        autoComplete="off"
        spellCheck
        className="mt-3 block min-h-[320px] w-full resize-y rounded-2xl bg-white p-4 text-sm leading-7 text-ink ring-1 ring-ink/10 placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-brand disabled:cursor-not-allowed disabled:bg-cream-soft sm:min-h-[380px] sm:text-base"
      />
    </section>
  );
}
