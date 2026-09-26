"use client";

import { MockTestDropdownCompletion } from "../player/MockTestDropdownCompletion";
import { listeningCopy } from "@/features/exam-engine/listening-copy";
import type {
  ListeningDropdownAnswerMap,
  ListeningDropdownQuestion,
} from "@/features/exam-engine/listening-dropdown-types";

// The numbered list of completion questions on a dropdown screen
// (EXAM-09).
//
// **This is now a thin adapter** (EXAM-UI-03). The list moved to
// src/components/exam/player/MockTestDropdownCompletion.tsx, which is
// where the block, the strip, the drawn blank and the select are built,
// and which Listening Parts 4, 5 and 6 now all render. Keeping this name
// and this prop list means the Part 4 screen and the Part 6 screen did
// not have to change to get the shared control.
//
// Everything the list used to document about itself still holds and is
// documented on MockTestDropdownCompletion:
//
// - the statement is the select's label, wired with htmlFor
// - the blank keeps the underscores from the source document, quieted,
//   with the word "blank" read in their place
// - the placeholder is a real option with an empty value, so an
//   unanswered select shows "Select answer" rather than silently reading
//   as the first answer
//
// A client component, because choosing an option is an event handler. It
// holds no state itself: the answers are owned by the prototype above it,
// so leaving the screen and coming back shows what was chosen before.
//
// Nothing here knows which option is correct. The answer key is stripped
// on the server before the content reaches the browser.

export type ListeningDropdownQuestionListProps = {
  questions: ListeningDropdownQuestion[];
  answers: ListeningDropdownAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
  placeholderLabel?: string;
};

export function ListeningDropdownQuestionList({
  questions,
  answers,
  onSelectOption,
  placeholderLabel = listeningCopy.dropdownPlaceholder,
}: ListeningDropdownQuestionListProps) {
  return (
    <MockTestDropdownCompletion
      items={questions}
      answers={answers}
      onSelectOption={onSelectOption}
      placeholderLabel={placeholderLabel}
      blankLabel={listeningCopy.dropdownBlankLabel}
    />
  );
}
