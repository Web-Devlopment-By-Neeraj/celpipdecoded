"use client";

import { MockTestDropdownCompletion } from "../player/MockTestDropdownCompletion";
import type { MockTestDropdownItem } from "../player/MockTestDropdownCompletion";
import { readingCopy } from "@/features/exam-engine/reading-copy";
import type {
  ReadingAnswerMap,
  ReadingQuestion,
} from "@/features/exam-engine/reading-types";

// The numbered list of drop-down questions on a Reading panel (EXAM-16).
//
// **This is now a thin adapter** (EXAM-UI-05), the same shape
// ListeningDropdownQuestionList has been since EXAM-UI-03. The list is
// drawn by MockTestDropdownCompletion in src/components/exam/player, so
// one component decides how a drop-down question looks and behaves across
// the whole player instead of two lists drifting apart.
//
// **Why it was two lists, and why it is not any more.** EXAM-16 wrote
// this one out separately because Reading has a question shape Listening
// did not: a numbered blank inside a reply, which prints no sentence at
// all because its sentence is in the reply paragraph above the list.
// Folding that into the shared control would have put a Reading-only
// branch inside a component every Listening screen renders. EXAM-UI-05
// rebuilt the shared control around a floating menu and an inline
// trigger, which is a real behaviour change rather than a restyle, and
// keeping two copies of that in step by hand is exactly the drift the
// ticket was raised to stop. So the third item shape moved into the
// shared list, where it costs one branch, and this file became the
// mapping between the Reading question type and the shared item type.
//
// The mapping is the only thing here. Reading calls a whole question
// text, the shared list calls it prompt, and the two blank shapes carry
// the same field names on both sides.
//
// A client component, because the control under it is one. It holds no
// state: the answers are owned by the prototype at the top of the part,
// so leaving the screen and coming back shows what was chosen before.
//
// Nothing here knows which option is correct. The answer key is stripped
// on the server before the content reaches the browser.

export type ReadingQuestionListProps = {
  questions: ReadingQuestion[];
  answers: ReadingAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
  placeholderLabel?: string;
};

export function ReadingQuestionList({
  questions,
  answers,
  onSelectOption,
  placeholderLabel = readingCopy.dropdownPlaceholder,
}: ReadingQuestionListProps) {
  const items: MockTestDropdownItem[] = questions.map((question) => ({
    id: question.id,
    number: question.number,
    // A whole question on the Reading side is text, and the shared list
    // calls that shape prompt. Both print the sentence and draw no blank.
    prompt: question.text,
    textBefore: question.textBefore,
    textAfter: question.textAfter,
    options: question.options,
  }));

  return (
    <MockTestDropdownCompletion
      items={items}
      answers={answers}
      onSelectOption={onSelectOption}
      placeholderLabel={placeholderLabel}
      blankLabel={readingCopy.blankLabel}
      questionNumberLabel={readingCopy.questionNumberLabel}
    />
  );
}
