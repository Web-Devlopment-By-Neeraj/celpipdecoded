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
  ListeningDropdownAnswerMap,
  ListeningDropdownQuestion,
} from "@/features/exam-engine/listening-dropdown-types";

// Dropdown completion question screen for a Listening part (EXAM-09).
//
// Screen type 7 from docs/product/exam-engine-screen-types.md, and the
// screen the reference layout matters most for in this part:
//
// - grey top bar with a live "Time remaining: 00:30" countdown
// - white exam canvas, single column, no split
// - compact instruction row at the top
// - left aligned numbered statements, ruled apart
// - a dropdown under each statement
// - blue Next in the top bar, Back in the bottom bar
//
// Single column, unlike the Parts 1 to 3 question screen. There is no
// question audio in a dropdown part, so there is nothing to put in a
// second column, and a split would leave half the canvas empty.
//
// A client component, because choosing an option is an event handler. It
// holds no state: the answers are owned by the prototype above it, so
// leaving the screen and coming back shows what was chosen before.
//
// Next is gated on every question having an answer by default, which is
// what allAnswered carries. The count under the list says how many are
// left, so a learner scrolling a five question form can see why Next is
// not available without hunting for the empty control.
//
// The full Listening route turns that gate off through requireAllAnswered
// (EXAM-15F), because an official-style test lets a learner leave a
// question blank and take the zero for it. The individual Part 4 route
// keeps the gate, because it is a development route.
//
// The timer is real from EXAM-15D, and it belongs to the screen rather
// than to any one question on it: this part answers all five questions in
// one window, so the window is keyed to the screen and answering a
// question does not restart it.
//
// What happens at zero is the caller's decision, and no caller moves
// anywhere (TIMER-01). The reading becomes "Time is up" in red and the
// screen stays put. onTimeExpire, which the full route passes and the part
// route does not, is a notification: the full route uses it to raise the
// shared time up message for a few seconds. Either way no answer is
// cleared, no question is disabled, nothing is submitted and Next remains
// the learner's to press. See
// docs/product/listening-format-strict-timing-polish.md.

export type ListeningDropdownQuestionScreenProps = {
  title: string;
  questions: ListeningDropdownQuestion[];
  answers: ListeningDropdownAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
  // Whether every question has an answer. Passed in rather than worked
  // out here, so the rule that gates Next lives in one place.
  allAnswered: boolean;
  // Whether Next waits for every question to be answered. False on the
  // full Listening route, where a blank is a legal answer worth zero.
  requireAllAnswered?: boolean;
  // Instruction line above the list. Defaults to the standard dropdown
  // wording when a part's content does not carry its own.
  instructionText?: string;
  // Label in front of the countdown in the top bar.
  timerLabel?: string;
  // How long the answering window runs. Defaults to the per question
  // window, which is wrong for a five question screen, so every caller
  // passes the Part 4 screen window from listening-timing.ts.
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

export function ListeningDropdownQuestionScreen({
  title,
  questions,
  answers,
  onSelectOption,
  allAnswered,
  requireAllAnswered = true,
  instructionText = listeningCopy.dropdownInstruction,
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
}: ListeningDropdownQuestionScreenProps) {
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
              ? ` ${listeningCopy.dropdownAnswerAllHint}`
              : null}
          </p>
        </div>
      </div>
    </ExamShell>
  );
}
