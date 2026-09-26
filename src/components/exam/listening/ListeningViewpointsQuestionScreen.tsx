"use client";

import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ExamCountdownTimer } from "../timer/ExamCountdownTimer";
import { ListeningDropdownQuestionList } from "./ListeningDropdownQuestionList";
import { examListening, examScreenBody } from "@/features/exam-engine/exam-theme";
import { playerDropdown } from "@/features/exam-engine/mock-test-player-theme";
import { LISTENING_QUESTION_TIMER } from "@/features/exam-engine/listening-timing";
import {
  formatListeningAnsweredCount,
  listeningCopy,
} from "@/features/exam-engine/listening-copy";
import type {
  ListeningViewpointsAnswerMap,
  ListeningViewpointsQuestion,
} from "@/features/exam-engine/listening-viewpoints-types";

// Viewpoints question screen for a Listening part (EXAM-13, control
// corrected by EXAM-15F).
//
// Screen type 7 from docs/product/exam-engine-screen-types.md, in the form
// where an incomplete statement is finished from a drop-down menu:
//
// - grey top bar with a live countdown for the whole screen
// - white exam canvas, single column, no split
// - compact instruction row at the top
// - left aligned numbered statements, ruled apart
// - a select under each statement
// - blue Next in the top bar, Back in the bottom bar
//
// Single column, unlike the Parts 1 to 3 question screen. There is no
// question audio in this part, so there is nothing to put in a second
// column and a split would leave half the canvas empty. Same reason the
// dropdown and video question screens are single column.
//
// **The control changed in EXAM-15F.** EXAM-13 drew a radio group here,
// knowingly and against its own content: the six Part 6 items are sentence
// stems ending in a blank, the source document instructs the part with
// "Choose the best way to complete each statement from the drop-down menu"
// in two separate places, and the official study pack describes Parts 4 to
// 6 as sentence completion. EXAM-13 shipped radio options because its
// ticket asked for them, and dropped the drop-down clause from the
// learner-facing copy rather than naming a control that was not on the
// screen. docs/product/listening-format-audit-and-correction-plan.md
// section 8 found the mismatch and this ticket corrects it.
//
// The correction cost no content change at all. ListeningViewpointsQuestion
// already stores each statement split around its blank as textBefore and
// textAfter, exactly as ListeningDropdownQuestion does, so the two types
// are the same shape and the Part 4 list renders a Part 6 question without
// conversion. The screen therefore renders
// ListeningDropdownQuestionList directly and the separate radio list
// EXAM-13 wrote is gone: after the correction the two lists were the same
// list, and the audit asked for the duplicate to be retired rather than
// kept in step by hand.
//
// Nothing about the data moved. The six question ids, the four option ids
// under each of them and the answer key they are marked against are
// untouched, so a Part 6 answer selected from a select scores exactly as
// the same answer selected from a radio did.
//
// This screen is still separate from ListeningDropdownQuestionScreen,
// because a viewpoints part still carries its own content type and its own
// media shape. What is shared now is the question list, which is the piece
// the two formats actually have in common.
//
// A client component, because choosing an option is an event handler. It
// holds no state: the answers are owned by the prototype above it, so
// leaving the screen and coming back shows what was chosen before.
//
// Next is gated on every question having an answer by default, which is
// what allAnswered carries, and the count under the list says how many are
// left. The full Listening route turns that gate off through
// requireAllAnswered (EXAM-15F), because an official-style test lets a
// learner leave a question blank and take the zero. The individual Part 6
// route keeps the gate, because it is a development route.
//
// The timer belongs to the screen rather than to any one question on it:
// this part answers all six questions in one window, so the window is
// keyed to the screen and answering a question does not restart it. What
// happens at zero is the caller's decision, and no caller moves anywhere
// (TIMER-01). The reading becomes "Time is up" in red and the screen stays
// put. onTimeExpire, which the full route passes and the part route does
// not, is a notification: the full route uses it to raise the shared time
// up message for a few seconds. Either way no answer is cleared, nothing
// is submitted and Next remains the learner's to press. See
// docs/product/listening-format-strict-timing-polish.md.

export type ListeningViewpointsQuestionScreenProps = {
  title: string;
  questions: ListeningViewpointsQuestion[];
  answers: ListeningViewpointsAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
  // Whether every question has an answer. Passed in rather than worked out
  // here, so the rule that gates Next lives in one place.
  allAnswered: boolean;
  // Whether Next waits for every question to be answered. False on the
  // full Listening route, where a blank is a legal answer worth zero.
  requireAllAnswered?: boolean;
  // Instruction line above the list. Defaults to the viewpoints wording
  // when a part's content does not carry its own.
  instructionText?: string;
  // Label in front of the countdown in the top bar.
  timerLabel?: string;
  // How long the answering window runs. Defaults to the per question
  // window, which is wrong for a six question screen, so every caller
  // passes the Part 6 screen window from listening-timing.ts.
  timerSeconds?: number;
  timerWarningAtSeconds?: number;
  timerUrgentAtSeconds?: number;
  // What the countdown resets on. Defaults to the first question's id,
  // which is stable for as long as this screen is showing. A caller with a
  // flow screen id can pass that instead.
  timerScreenKey?: string;
  // Fired once when the window reaches zero. Only the full Listening route
  // passes one.
  onTimeExpire?: () => void;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningViewpointsQuestionScreen({
  title,
  questions,
  answers,
  onSelectOption,
  allAnswered,
  requireAllAnswered = true,
  instructionText = listeningCopy.viewpointsInstruction,
  timerLabel = listeningCopy.questionTimerLabel,
  timerSeconds = LISTENING_QUESTION_TIMER.seconds,
  timerWarningAtSeconds,
  timerUrgentAtSeconds,
  timerScreenKey,
  onTimeExpire,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ListeningViewpointsQuestionScreenProps) {
  const answeredCount = questions.filter((question) =>
    Boolean(answers[question.id]),
  ).length;

  return (
    <ExamShell
      title={title}
      timerSlot={
        <ExamCountdownTimer
          // Keyed on the screen rather than on a question, because every
          // question in this part is answered inside one window.
          screenKey={timerScreenKey ?? questions[0]?.id ?? title}
          durationSeconds={timerSeconds}
          warningAtSeconds={timerWarningAtSeconds}
          urgentAtSeconds={timerUrgentAtSeconds}
          label={timerLabel}
          onExpire={onTimeExpire}
        />
      }
      metaText={metaText}
      onNext={onNext}
      nextDisabled={requireAllAnswered && !allAnswered}
      onBack={onBack}
      showBack={showBack}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow text={instructionText} />

        <div className={examListening.columnStack}>
          <ListeningDropdownQuestionList
            questions={questions}
            answers={answers}
            onSelectOption={onSelectOption}
          />

          <p className={playerDropdown.note}>
            {formatListeningAnsweredCount(answeredCount, questions.length)}
            {requireAllAnswered && !allAnswered
              ? ` ${listeningCopy.viewpointsAnswerAllHint}`
              : null}
          </p>
        </div>
      </div>
    </ExamShell>
  );
}
