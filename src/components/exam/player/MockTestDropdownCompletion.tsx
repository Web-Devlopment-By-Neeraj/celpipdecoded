"use client";

import { cx } from "@/features/design/design-tokens";
import { playerDropdown } from "@/features/exam-engine/mock-test-player-theme";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { MockTestDropdownSelect } from "./MockTestDropdownSelect";

// The drop-down completion question list (EXAM-UI-03, rebuilt EXAM-UI-05).
//
// Screen type 7: a set of questions answered from drop-down menus on one
// screen. Listening Parts 4, 5 and 6 are this list, and since EXAM-UI-05
// so are all four Reading parts, through the thin adapter in
// ReadingQuestionList.
//
// **What EXAM-UI-05 changed.** Every item used to be a bordered block: a
// tinted strip carrying the sentence, and a native select in the body
// under it. That put the control a line below the words it completes,
// made five sentences into five boxes, and on the Reading side the same
// block was written out a second time in exam-theme.ts because Reading
// has an item shape Listening does not. The list is now the sentences
// themselves, with a compact floating control sitting inline where the
// blank falls, and the Reading shape has moved in here rather than being
// a reason to keep two lists.
//
// An item is drawn one of three ways, decided by the item itself and not
// by a flag the caller has to remember:
//
// - **a question**, when prompt is set: the whole sentence is printed and
//   the control follows it. Listening Part 5 and Reading Part 2 questions
//   6 to 8 are written as complete interrogatives, so there is no blank
//   to draw and inventing one would be inventing source text.
// - **a statement**, when textBefore is set: the sentence is printed with
//   the control standing in the blank, and the tail of the sentence after
//   it. The control is capped, so a long option cannot stretch the line.
// - **a number alone**, when neither is set: the sentence lives somewhere
//   else on the screen, which on Reading Parts 1, 2 and 4 is the reply
//   paragraph above the list. The source prints nothing beside the number
//   but the options, so neither does this.
//
// The control is named with a string built from the item rather than
// wired to the line it sits in, because it sits inside that line: naming
// it from its own container would fold the trigger's own text back into
// its name.
//
// **Nothing here knows which option is correct.** The answer key is
// stripped on the server before the content reaches the browser, the
// option ids are the content's own ids, and the value stored is the
// option id rather than its text. So the control a learner clicks changed
// and nothing about what is marked did.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type MockTestDropdownOption = {
  id: string;
  text: string;
};

export type MockTestDropdownItem = {
  id: string;
  // Position inside the part, counting from 1. Display only.
  number: number;
  // The whole question, for a part whose items are questions.
  prompt?: string;
  // Statement text up to the blank, for a completion part.
  textBefore?: string;
  // Statement text after the blank. Unset when the blank ends it.
  textAfter?: string;
  options: MockTestDropdownOption[];
};

export type MockTestDropdownCompletionProps = {
  items: MockTestDropdownItem[];
  // { questionId: selectedOptionId }. The same shape the marking action
  // and the review screens already read.
  answers: Readonly<Record<string, string>>;
  onSelectOption: (questionId: string, optionId: string) => void;
  placeholderLabel?: string;
  // Read in place of the blank the control stands in.
  blankLabel?: string;
  // Read in front of the number on an item that prints no sentence.
  questionNumberLabel?: string;
  className?: string;
};

// The accessible name of one item's control. The sentence with the word
// "blank" where the control is, so a screen reader user hears the same
// thing a sighted learner reads.
function buildControlLabel(
  item: MockTestDropdownItem,
  blankLabel: string,
  questionNumberLabel: string,
): string {
  if (item.prompt) {
    return `${item.number}. ${item.prompt}`;
  }

  if (item.textBefore) {
    const tail = item.textAfter ? ` ${item.textAfter}` : "";

    return `${item.number}. ${item.textBefore} ${blankLabel}${tail}`;
  }

  return `${questionNumberLabel} ${item.number}`;
}

export function MockTestDropdownCompletion({
  items,
  answers,
  onSelectOption,
  placeholderLabel = examCopy.selectAnswerLabel,
  blankLabel = examCopy.dropdownBlankLabel,
  questionNumberLabel = examCopy.questionNumberLabel,
  className,
}: MockTestDropdownCompletionProps) {
  return (
    <ol className={cx(playerDropdown.list, className)}>
      {items.map((item) => {
        const control = (
          <MockTestDropdownSelect
            options={item.options}
            value={answers[item.id] ?? ""}
            onChange={(optionId) => onSelectOption(item.id, optionId)}
            placeholderLabel={placeholderLabel}
            ariaLabel={buildControlLabel(item, blankLabel, questionNumberLabel)}
          />
        );

        return (
          <li key={item.id} className={playerDropdown.item}>
            <p className={playerDropdown.statement}>
              <span className={playerDropdown.number}>{item.number}.</span>

              {item.prompt ? (
                <>
                  {item.prompt} {control}
                </>
              ) : item.textBefore ? (
                <>
                  {item.textBefore} {control}
                  {item.textAfter ? ` ${item.textAfter}` : null}
                </>
              ) : (
                // The sentence is printed elsewhere on the screen, so the
                // number is all there is to show. The control carries the
                // question number as its name.
                control
              )}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
