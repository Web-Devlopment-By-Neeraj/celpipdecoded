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

// The answer column of the Reading Part 4 split screen (EXAM-22).
//
// Everything on the right hand side of screen type 8 for this part: the
// five sentence stems about the article, the reader comment with its five
// numbered blanks, the instruction line above each of them, and the
// answered count under both.
//
// It draws no panel itself. The panel is the shared ReadingQuestionPanel,
// which already draws either kind of group: a plain list of questions, or
// a body of text with blanks in it followed by the list that fills them.
// That pair is what Reading Part 1 is, so Part 4 needed nothing new from
// it. The comment is a ReadingResponse with no header lines, no
// salutation and no sign off, and the panel simply renders none of the
// three.
//
// The comment echoes an answered blank back into its own text, which is
// the behaviour the shared panel already has and the reason this part is
// readable while it is being answered: choosing an option for question 8
// makes the sentence read as a sentence rather than as a row of
// underscores, so a learner can check the choice against what it lands
// in.
//
// What this component owns is the column: which groups go in it and the
// progress line at the foot of it. That is the same job
// ReadingPartTwoQuestionPanel and ReadingPartThreeQuestionPanel do, and
// it is a real one rather than a wrapper for its own sake: it is what
// lets the Part 4 screen file be about the split and the timer rather
// than about the contents of one column.
//
// The progress line is the shared wording, from readingCopy, and it says
// the same two things: how many of the ten are answered, and, while any
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

export type ReadingPartFourQuestionPanelProps = {
  content: ReadingPartContent;
  answers: ReadingAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
};

export function ReadingPartFourQuestionPanel({
  content,
  answers,
  onSelectOption,
}: ReadingPartFourQuestionPanelProps) {
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
