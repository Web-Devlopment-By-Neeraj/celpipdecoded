"use client";

import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ExamCountdownTimer } from "../timer/ExamCountdownTimer";
import { MockTestDropdownCompletion } from "../player/MockTestDropdownCompletion";
import { examListening, examScreenBody } from "@/features/exam-engine/exam-theme";
import { playerDropdown } from "@/features/exam-engine/mock-test-player-theme";
import { LISTENING_QUESTION_TIMER } from "@/features/exam-engine/listening-timing";
import {
  formatListeningAnsweredCount,
  listeningCopy,
} from "@/features/exam-engine/listening-copy";
import type {
  ListeningVideoAnswerMap,
  ListeningVideoQuestion,
} from "@/features/exam-engine/listening-video-types";

// Question screen for a video discussion Listening part (EXAM-11, control
// corrected by EXAM-UI-03).
//
// Screen type 7 from docs/product/exam-engine-screen-types.md, in the
// form where a whole question set is answered on one screen:
//
// - grey top bar with a live countdown for the whole screen
// - white exam canvas, single column, no split
// - compact instruction row at the top
// - left aligned numbered questions, each in its own block
// - a drop-down menu under each question
// - blue Next in the top bar, Back in the bottom bar
//
// Single column, unlike the Parts 1 to 3 question screen. There is no
// question audio in this part, so there is nothing to put in a second
// column, and a split would leave half the canvas empty. Same reason
// ListeningDropdownQuestionScreen is single column.
//
// A client component, because choosing an option is an event handler. It
// holds no state: the answers are owned by the prototype above it, so
// leaving the screen and coming back shows what was chosen before.
//
// **The control changed in EXAM-UI-03.** EXAM-11 drew eight radio groups
// here and EXAM-15F kept them, on the reading that the eight Mock Test 1
// items are whole interrogatives rather than sentence stems, so there was
// no blank for a select to sit in.
//
// That reading answered the wrong question. Part 5 is a one screen part
// answered from a drop-down menu: the source document instructs it that
// way, the part sits beside Parts 4 and 6 which are already selects, and
// eight radio groups of four options is thirty two controls stacked down a
// page a learner has to scroll several times to work through. A drop-down
// does not need a blank in the text: the question is printed whole in the
// block header and the menu under it carries the four answers. That is
// what MockTestDropdownCompletion draws when an item has a prompt rather
// than a split statement, and it is why the fix cost no content change.
//
// **Nothing about the data moved.** The eight question ids, the four
// option ids under each of them, the option wording and the answer key
// they are marked against are exactly as EXAM-11 wrote them. The value
// stored is still the option id, so a Part 5 answer chosen from a menu
// marks precisely as the same answer chosen from a radio did, on the same
// server action, against the same key.
//
// ListeningVideoQuestionList, the radio list this screen used to render,
// is gone rather than left in place unused: after the correction it was a
// second way to draw a screen that now has one.
//
// Next is gated on every question having an answer by default, which is
// what allAnswered carries. The count under the list says how many are
// left, so a learner scrolling an eight question form can see why Next is
// not available without hunting for the empty control.
//
// The full Listening route turns that gate off through requireAllAnswered
// (EXAM-15F), because an official-style test lets a learner leave a
// question blank and take the zero for it. The individual Part 5 route
// keeps the gate, because it is a development route.
//
// The timer is real from EXAM-15D, and it belongs to the screen rather
// than to any one question on it: this part answers all eight questions in
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

export type ListeningVideoQuestionScreenProps = {
  title: string;
  questions: ListeningVideoQuestion[];
  answers: ListeningVideoAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
  // Whether every question has an answer. Passed in rather than worked
  // out here, so the rule that gates Next lives in one place.
  allAnswered: boolean;
  // Whether Next waits for every question to be answered. False on the
  // full Listening route, where a blank is a legal answer worth zero.
  requireAllAnswered?: boolean;
  // Instruction line above the list. Defaults to the source document's
  // wording for this part when a part's content does not carry its own.
  instructionText?: string;
  // Label in front of the countdown in the top bar.
  timerLabel?: string;
  // How long the answering window runs. Defaults to the per question
  // window, which is wrong for an eight question screen, so every caller
  // passes the Part 5 screen window from listening-timing.ts.
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

export function ListeningVideoQuestionScreen({
  title,
  questions,
  answers,
  onSelectOption,
  allAnswered,
  requireAllAnswered = true,
  instructionText = listeningCopy.chooseBestWayInstruction,
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
}: ListeningVideoQuestionScreenProps) {
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
          <MockTestDropdownCompletion
            items={questions}
            answers={answers}
            onSelectOption={onSelectOption}
            placeholderLabel={listeningCopy.dropdownPlaceholder}
            blankLabel={listeningCopy.dropdownBlankLabel}
          />

          <p className={playerDropdown.note}>
            {formatListeningAnsweredCount(answeredCount, questions.length)}
            {requireAllAnswered && !allAnswered
              ? ` ${listeningCopy.choiceAnswerAllHint}`
              : null}
          </p>
        </div>
      </div>
    </ExamShell>
  );
}
