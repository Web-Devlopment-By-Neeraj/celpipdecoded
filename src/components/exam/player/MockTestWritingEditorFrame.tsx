import type { ReactNode } from "react";
import { cx } from "@/features/design/design-tokens";
import { playerWritingEditor } from "@/features/exam-engine/mock-test-player-theme";

// The frame a Writing response is typed into (EXAM-UI-03).
//
// Before this ticket the writing space was four things stacked loose in
// the answer column: a small caps label, a bordered textarea, a word count
// row and a hint paragraph. That reads as a dashboard form rather than as
// a test field, and it put the one reading a writer actually glances at,
// the count, furthest from the text it counts.
//
// This is one frame instead. A hairline box, an optional label strip along
// the top, the field, and a grey meta strip along the bottom carrying the
// count, the target and the hint. Compact enough that the prompt above it
// stays on screen while typing, which is the thing the brief asked for.
//
// **This component is a frame and nothing else.** It owns no text, no
// count and no state. The textarea is passed in as children by
// WritingResponseEditor, which is where the controlled value and the
// onChange still live, and the count is passed in already worked out by
// countWritingWords. So a screen can be reframed without any risk to what
// is typed, saved or reviewed, which is what the brief asked for when it
// said not to change the writing AI review.
//
// The field draws no border of its own, because the frame owns the edge.
// A textarea handed to it should carry playerWritingEditor.field.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type MockTestWritingEditorFrameProps = {
  // The textarea. Passed in rather than built here, so nothing in this
  // file can change how a response is captured.
  children: ReactNode;
  // Small caps strip above the field. Omit for a bare frame.
  label?: string;
  // Ties the label strip to the field it names.
  editorId?: string;
  // Left of the meta strip, for example "Word count" and "128 words".
  countLabel?: string;
  countValue?: string;
  // Beside the count, for example "Target 150-200 words".
  targetText?: string;
  // Right of the meta strip on a wide column, under the count on a narrow
  // one.
  hint?: string;
  className?: string;
};

export function MockTestWritingEditorFrame({
  children,
  label,
  editorId,
  countLabel,
  countValue,
  targetText,
  hint,
  className,
}: MockTestWritingEditorFrameProps) {
  const showMeta = Boolean(countValue || targetText || hint);

  return (
    <div className={cx(playerWritingEditor.frame, className)}>
      {label ? (
        <label htmlFor={editorId} className={playerWritingEditor.label}>
          {label}
        </label>
      ) : null}

      {children}

      {showMeta ? (
        <div className={playerWritingEditor.meta}>
          {countValue ? (
            <>
              {countLabel ? (
                <span className={playerWritingEditor.metaLabel}>
                  {countLabel}
                </span>
              ) : null}

              {/* aria-live so a screen reader user hears the count settle
                  after they stop typing, rather than having to go looking
                  for it. Polite, so it never interrupts the typing. */}
              <span
                className={playerWritingEditor.metaValue}
                aria-live="polite"
              >
                {countValue}
              </span>
            </>
          ) : null}

          {targetText ? (
            <span className={playerWritingEditor.metaTarget}>{targetText}</span>
          ) : null}

          {hint ? (
            <span className={playerWritingEditor.metaHint}>{hint}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
