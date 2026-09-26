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

// The answer column of the Reading Part 2 split screen (EXAM-18).
//
// Everything on the right hand side of screen type 8 for this part: the
// email with its five blanks, the three questions about the situation,
// and the answered count under them.
//
// It draws neither panel itself. Both are the shared
// ReadingQuestionPanel, which already handles a completion group with a
// response in it and a plain group without one, and which EXAM-18 taught
// one new thing, the email header lines. What this component owns is the
// column: which groups go in it, in what order, and the progress line at
// the foot of it.
//
// That is a real job rather than a wrapper for its own sake. Reading Part
// 1 does the same work inline inside ReadingCorrespondenceScreen, and
// lifting it out here is what lets the Part 2 screen file be about the
// split and the timer rather than about the contents of one column. It is
// also the piece Reading Parts 3 and 4 will diverge on: Part 3's answer
// column is nine statements sharing one option list, which is a different
// column made of the same panels.
//
// The progress line is the Part 1 wording, from readingCopy, and it says
// the same two things: how many of the eight are answered, and, while any
// are outstanding, that leaving one blank is allowed and costs a mark.
// Nothing here gates anything. Next is always available on the screen
// above, which is the EXAM-17 rule this part inherits rather than
// rediscovers.
//
// A client component, because the lists under it are. It holds no state:
// the answers are owned by the prototype at the top of the part, so
// leaving the screen and coming back shows what was chosen before.
//
// Nothing here knows which option is correct. The answer key is stripped
// on the server before the content reaches the browser.

export type ReadingPartTwoQuestionPanelProps = {
  content: ReadingPartContent;
  answers: ReadingAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
};

export function ReadingPartTwoQuestionPanel({
  content,
  answers,
  onSelectOption,
}: ReadingPartTwoQuestionPanelProps) {
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
