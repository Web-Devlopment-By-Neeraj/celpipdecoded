import { MockTestWritingEditorFrame } from "../player/MockTestWritingEditorFrame";
import { playerWritingEditor } from "@/features/exam-engine/mock-test-player-theme";
import { countWritingWords } from "@/features/exam-engine/writing-mock-flow";
import {
  formatWritingWordCount,
  formatWritingWordTarget,
  writingMockCopy,
} from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";

// The writing area for one task (EXAM-25).
//
// A plain textarea, a label strip above it and the live word count under
// it. Nothing else: no toolbar, no formatting controls, no autosave
// indicator, no submit button. A CELPIP writing space is a plain text
// field with a word count and a spell check, which
// docs/product/celpip-exam-rules-research.md section 12 records, and this
// is that.
//
// EXAM-UI-03 put the three pieces inside one frame,
// MockTestWritingEditorFrame, rather than leaving them stacked loose in
// the answer column. The count now sits in the grey strip along the
// bottom of the field instead of floating under it, which is where a
// writer can read it without looking away from the text, and the block is
// compact enough that the prompt above it stays on screen.
//
// It is a controlled field and it owns no state. The text lives in the
// prototype above it, keyed by task id, which is what lets a response
// survive moving to the next task and back again: this component is
// remounted by that navigation and the text is not.
//
// Line breaks are kept exactly as typed, because a Task 1 email has a
// greeting, paragraphs and a sign off, and a field that collapsed them
// would make the format of the response impossible to judge later.
//
// spellCheck is on. It is a browser feature rather than anything we
// built, and the official writing space has one, so switching it off
// would make our editor harder to use than the thing it stands in for.
//
// What it deliberately does not do: it does not save, it does not
// validate, it does not block an empty response, and it does not submit
// anything to an AI reviewer. Typing here has exactly one effect, which
// is that the text and the count change.
//
// Presentational, so no "use client" of its own: it is rendered by the
// prototype, which is the client component.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingResponseEditorProps = {
  // Unique id for the field, normally the task id. It ties the label to
  // the textarea.
  editorId: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  // The task's word target, shown beside the count as guidance.
  targetMin?: number;
  targetMax?: number;
  copy?: WritingMockCopy;
};

export function WritingResponseEditor({
  editorId,
  value,
  onChange,
  placeholder,
  targetMin,
  targetMax,
  copy = writingMockCopy,
}: WritingResponseEditorProps) {
  const showTarget = targetMin !== undefined && targetMax !== undefined;

  return (
    <MockTestWritingEditorFrame
      label={copy.editorLabel}
      editorId={editorId}
      countLabel={copy.wordCountLabel}
      // Counted here rather than passed down from the prototype, so the
      // count and the text it counts can never be a render apart.
      countValue={formatWritingWordCount(countWritingWords(value))}
      targetText={
        showTarget
          ? `${copy.wordTargetLabel} ${formatWritingWordTarget(targetMin, targetMax)}`
          : undefined
      }
      hint={copy.editorHint}
    >
      <textarea
        id={editorId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        // Off, because a response is prose rather than a form field and
        // an autofilled name in the middle of an email would be worse
        // than typing it.
        autoComplete="off"
        spellCheck
        className={playerWritingEditor.field}
      />
    </MockTestWritingEditorFrame>
  );
}
