"use client";

import { ReadingQuestionPanel } from "./ReadingQuestionPanel";
import { examReading } from "@/features/exam-engine/exam-theme";
import {
  formatReadingAnsweredCount,
  readingCopy,
} from "@/features/exam-engine/reading-copy";
import { listReadingQuestions } from "@/features/exam-engine/reading-flow";
import type {
  ReadingAnswerMap,
  ReadingPartContent,
} from "@/features/exam-engine/reading-types";

// The answer column of the Reading Part 3 split screen (EXAM-20).
//
// Everything on the right hand side of screen type 8 for this part: the
// instruction line, the nine statements with their A to E selectors, and
// the answered count under them.
//
// It draws no panel itself. The panel is the shared ReadingQuestionPanel,
// which already handles a plain group of whole questions, and the list
// inside it is the shared ReadingQuestionList, which already draws a
// whole question with no blank in it. That shape was added by EXAM-18 for
// Reading Part 2 questions 6 to 8 and it fits these nine statements with
// no change at all, which is why nothing shared had to learn about
// paragraph matching.
//
// What this component owns is the column: which groups go in it and the
// progress line at the foot of it. That is the same job
// ReadingPartTwoQuestionPanel does, and it is a real one rather than a
// wrapper for its own sake: it is what lets the Part 3 screen file be
// about the split and the timer rather than about the contents of one
// column.
//
// Part 3 has one group where Part 2 has two, so the loop below has one
// pass. It is still a loop, because the group list is the content
// object's shape and a component that hard coded questionGroups[0] would
// silently drop a second panel if the part ever grew one.
//
// The progress line is the shared wording, from readingCopy, and it says
// the same two things: how many of the nine are answered, and, while any
// are outstanding, that leaving one blank is allowed and costs a mark.
// Nothing here gates anything. Next is always available on the screen
// above, which is the EXAM-17 rule this part inherits rather than
// rediscovers.
//
// A client component, because the list under it is. It holds no state:
// the answers are owned by the prototype at the top of the part, so
// leaving the screen and coming back shows what was chosen before.
//
// Nothing here knows which option is correct. The answer key is stripped
// on the server before the content reaches the browser.

export type ReadingPartThreeQuestionPanelProps = {
  content: ReadingPartContent;
  answers: ReadingAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
};

export function ReadingPartThreeQuestionPanel({
  content,
  answers,
  onSelectOption,
}: ReadingPartThreeQuestionPanelProps) {
  const questions = listReadingQuestions(content);
  const answeredCount = questions.filter((question) =>
    Boolean(answers[question.id]),
  ).length;

  return (
    <div className={examReading.panelStack}>
      {content.questionGroups.map((group) => (
        <ReadingQuestionPanel
          key={group.id}
          group={group}
          answers={answers}
          onSelectOption={onSelectOption}
        />
      ))}

      <p className={examReading.progressNote}>
        {formatReadingAnsweredCount(answeredCount, questions.length)}
        {answeredCount < questions.length
          ? ` ${readingCopy.blanksAllowedHint}`
          : null}
      </p>
    </div>
  );
}
