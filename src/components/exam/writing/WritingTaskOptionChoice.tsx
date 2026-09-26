import { cx } from "@/features/design/design-tokens";
import { examWriting } from "@/features/exam-engine/exam-theme";
import { writingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingTaskContent } from "@/features/exam-engine/writing-mock-types";

// The positions a task offers, as a radio group (EXAM-UI-04).
//
// Lifted out of WritingPromptPanel, because two screens now draw it: the
// Task 2 choice screen, where it is the only thing being asked, and the
// Task 2 editor screen, where it sits above the response box so a writer
// can see and change the position they are arguing. One component means
// the rows cannot look like one control on one screen and another control
// on the next.
//
// It is a real radio group in a fieldset with a legend, rather than two
// styled buttons, so a keyboard user gets arrow key selection and a
// screen reader hears the group and its name. The whole row is the click
// target, which is the pattern the Listening option rows already use.
//
// The radio group name is derived from the task id and the caller's
// scope, so the same task drawn on two screens never has two live groups
// with one name. Only one of the two screens is ever mounted, but the
// name is the thing a browser groups radios by and sharing one across
// screens is the kind of bug that only shows up once something renders
// both.
//
// The two states it draws are in examWriting: a pale green wash under the
// pointer and a warm wash with a hairline ring on the chosen row. The
// note beside those recipes says why this list, alone in the player,
// colours its hover.
//
// Presentational only. It holds no state: the chosen option id is owned
// by the section prototype and passed down, so a choice survives leaving
// the task and coming back.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingTaskOptionChoiceProps = {
  task: WritingTaskContent;
  // The chosen position, or undefined while none has been chosen.
  selectedOptionId?: string;
  // Omit to draw the rows without letting them be changed. Nothing in the
  // section does that today: both screens that draw this pass a handler.
  onSelectOption?: (optionId: string) => void;
  // Which screen is drawing the group, appended to the radio group name.
  groupScope: string;
  // Quiet line under the rows. Omit for no line at all.
  hint?: string;
  // Shown under the rows in place of nothing when the learner has tried
  // to move on without choosing. Announced, because the thing it explains
  // is a control that did not do what it looked like it would do.
  errorText?: string;
  copy?: WritingMockCopy;
};

export function WritingTaskOptionChoice({
  task,
  selectedOptionId,
  onSelectOption,
  groupScope,
  hint,
  errorText,
  copy = writingMockCopy,
}: WritingTaskOptionChoiceProps) {
  const options = task.options ?? [];

  if (options.length === 0) {
    return null;
  }

  return (
    <div className={examWriting.choice}>
      <fieldset className={examWriting.choiceFieldset}>
        <legend className={examWriting.choiceLegend}>
          {task.optionInstruction ?? copy.choiceLegendLabel}
        </legend>

        <div className={examWriting.choiceList}>
          {options.map((option) => {
            const selected = selectedOptionId === option.id;

            return (
              <label
                key={option.id}
                className={cx(
                  examWriting.choiceRow,
                  selected ? examWriting.choiceRowSelected : "",
                )}
              >
                <input
                  type="radio"
                  name={`${task.taskId}-${groupScope}-option`}
                  value={option.id}
                  checked={selected}
                  onChange={() => onSelectOption?.(option.id)}
                  className={examWriting.choiceInput}
                />

                <span className={examWriting.choiceText}>
                  <span className={examWriting.choiceLabel}>
                    {option.label}:
                  </span>{" "}
                  {option.text}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* The live region is always in the DOM and usually empty, so a
          screen reader has something to watch before there is anything to
          say. Mounting the region only once there is a message is how a
          message ends up never being announced at all, so the wrapper
          stays and the styled line inside it is what comes and goes. */}
      <div role="status" aria-live="polite" className="min-w-0">
        {errorText ? (
          <p className={examWriting.choiceError}>{errorText}</p>
        ) : null}
      </div>

      {hint ? <p className={examWriting.choiceHint}>{hint}</p> : null}
    </div>
  );
}
