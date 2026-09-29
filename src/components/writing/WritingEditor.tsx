"use client";

import { WritingBox } from "@/components/site/WritingBox";
import { writingPracticeCopy } from "@/features/writing/task-copy";

// The shared writing box. Line breaks stay as typed. Spell check is the
// red underline inside WritingBox, and the browser's own checker is off.
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
      <WritingBox
        id="writing-response"
        value={value}
        readOnly={disabled}
        ariaLabel={writingPracticeCopy.editorLabel}
        onChange={(text) => onChange(text)}
      />
    </section>
  );
}
