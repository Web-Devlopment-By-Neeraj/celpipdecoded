"use client";

import { useState } from "react";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { SpeakingOptionCardBlock } from "./SpeakingVisualPrompt";
import { SpeakingPrepTimer } from "./SpeakingPrepTimer";
import { cx } from "@/features/design/design-tokens";
import {
  examSpeaking,
  examSpeakingTaskFive,
} from "@/features/exam-engine/exam-theme";
import {
  formatSpeakingTaskScreenTitle,
  speakingMockCopy,
} from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingTaskContent } from "@/features/exam-engine/speaking-mock-types";

// The second of the four Speaking Task 5 screens (SPEAKING-05A).
//
// The situation, a 60 second window, and the two camps side by side as
// cards the learner can pick between. No recorder and no microphone: the
// source's own line on this screen says so in words, and it is printed
// under the situation rather than paraphrased.
//
// Why the cards are a radio group
// -------------------------------
//
// Because a choice is being recorded this time. Task 6 offers an either
// or pair and this engine deliberately does not make it selectable, since
// the source asks the learner to pick one in their head and speak. Task 5
// is the opposite: the next two screens are built around which camp was
// picked, so the pick has to be a real control with a real value.
//
// It is a fieldset with a legend and two radios rather than two styled
// buttons, so a keyboard user gets arrow key selection and a screen
// reader hears the group and its name. The whole card is the click
// target, which is the pattern every option row in the player follows,
// and the chosen card takes the warm wash and hairline ring the player
// has used for a selected row since EXAM-UI-05.
//
// What happens when the window closes
// -----------------------------------
//
// Nothing, and the screen says so. The reading turns red and reads "Time
// is up", a line appears under the cards saying "Time is up. You can
// continue when you are ready.", and the section raises its shared time
// up message. No option is selected, no screen advances, nothing is
// submitted and nothing is erased. The cards stay live, so a learner who
// was still deciding when the clock ran out can still decide.
//
// That is the whole of TIMER-01 applied to a screen that has something to
// lose. It is worth stating plainly because the obvious implementation of
// "the computer will choose one for you" is to choose one at zero, and
// choosing at zero would take the decision away from a learner who was
// half a second from making it.
//
// What happens when Next is pressed with nothing chosen
// -----------------------------------------------------
//
// The screen above picks an option and records that it picked it. That is
// in the section prototype rather than here, for one reason: this screen
// is unmounted by the move, so a pick made here would be a pick made by a
// component on its way out. See onNext below and
// defaultSpeakingChoiceOptionId for which option and why it is not
// random.
//
// This screen holds exactly one piece of state, whether its window has
// closed, and that is all. The choice itself belongs to the section
// prototype, so choosing here and arriving at the preparation screen is
// one value read twice rather than two values kept in step.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingTaskFiveChoiceScreenProps = {
  task: SpeakingTaskContent;
  // The chosen option, or undefined while none has been chosen.
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
  // What the countdown keys on. Pass the flow screen id, so the window
  // belongs to the screen and selecting a card does not restart it.
  timerScreenKey?: string;
  // Fired once when the choice window reaches zero (TIMER-01). The
  // section raises its shared time up message with it. Nothing here
  // selects, advances or clears because of it.
  onTimeExpire?: () => void;
  copy?: SpeakingMockCopy;
  metaText?: string;
  // Called on Next, chosen or not. The section picks an option first
  // where none has been chosen.
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function SpeakingTaskFiveChoiceScreen({
  task,
  selectedOptionId,
  onSelectOption,
  timerScreenKey,
  onTimeExpire,
  copy = speakingMockCopy,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: SpeakingTaskFiveChoiceScreenProps) {
  // Whether this screen's window has closed. Set from the countdown's
  // expiry callback, which is the same path the shared time up message
  // has always taken, and read for one line of text. Nothing else on the
  // screen changes with it.
  const [timeUp, setTimeUp] = useState(false);

  const step = task.choiceStep;

  const handleExpire = () => {
    setTimeUp(true);
    onTimeExpire?.();
  };

  // A task with no choice step never reaches this screen: the flow
  // builder does not produce one for it.
  if (!step) {
    return null;
  }

  const situationParagraphs = task.situationParagraphs ?? [];

  return (
    <ExamShell
      title={formatSpeakingTaskScreenTitle(task.title, task.taskTitle)}
      metaText={metaText}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
    >
      <div className={examSpeakingTaskFive.stack}>
        <div className={examSpeakingTaskFive.prompt}>
          {/* The situation, marked with the shared information glyph and
              ruled off from the cards under it, which is how every prompt
              in the player opens. It is the source's own paragraph: the
              first of the two Task 5 screens prints it above the two
              camps. */}
          <ExamInstructionRow className={examSpeaking.instructionRow}>
            <span className={examSpeakingTaskFive.promptInstruction}>
              {situationParagraphs[0] ?? task.promptInstruction}
            </span>
          </ExamInstructionRow>

          {situationParagraphs.slice(1).map((paragraph, index) => (
            <p
              // Paragraphs have no ids of their own and never reorder, so
              // the index is the stable key here, the same rule the
              // prompt panel and the Reading passage follow.
              key={`${task.taskId}-choice-situation-${index}`}
              className={examSpeakingTaskFive.promptParagraph}
            >
              {paragraph}
            </p>
          ))}

          {step.chooseNote ? (
            <p className={examSpeakingTaskFive.promptNote}>{step.chooseNote}</p>
          ) : null}
        </div>

        <div className={examSpeakingTaskFive.timerRow}>
          <SpeakingPrepTimer
            // The flow screen id, so the window belongs to the screen and
            // picking a card does not start a new one.
            screenKey={`${timerScreenKey ?? task.taskId}-choose`}
            timer={step.chooseTimer}
            // Always counting. Nothing on this screen ends the window
            // early: there is no recorder here to end it, and choosing a
            // camp does not stop a learner changing their mind.
            active
            onExpire={handleExpire}
            label={copy.choiceTimerLabel}
            note={copy.choiceTimerNote}
            copy={copy}
          />
        </div>

        <fieldset className={examSpeakingTaskFive.fieldset}>
          <legend className={examSpeakingTaskFive.legend}>
            {step.optionsCaption ?? copy.choiceLegendLabel}
          </legend>

          <div className={examSpeaking.cardGrid}>
            {step.options.map((option) => {
              const selected = selectedOptionId === option.id;

              return (
                <label
                  key={option.id}
                  className={examSpeakingTaskFive.optionLabel}
                >
                  <SpeakingOptionCardBlock
                    card={option}
                    // The chosen card says so above the picture, so the
                    // selection reads without relying on the wash alone.
                    label={selected ? step.chosenLabel : undefined}
                    className={cx(
                      "h-full",
                      selected ? examSpeaking.cardSelected : "",
                    )}
                    control={
                      <input
                        type="radio"
                        name={`${task.taskId}-choice`}
                        value={option.id}
                        checked={selected}
                        onChange={() => onSelectOption(option.id)}
                        className={examSpeaking.cardInput}
                      />
                    }
                  />
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* The live region is always in the DOM and usually empty, so a
            screen reader has something to watch before there is anything
            to say. Mounting it only once the window has closed is how a
            message ends up never being announced at all. */}
        <div role="status" aria-live="polite" className="min-w-0">
          {timeUp ? (
            <p className={examSpeakingTaskFive.timeUpNote}>
              {copy.choiceTimeUpNote}
            </p>
          ) : null}
        </div>

        <p className={examSpeakingTaskFive.hint}>{copy.choiceHint}</p>
      </div>
    </ExamShell>
  );
}
