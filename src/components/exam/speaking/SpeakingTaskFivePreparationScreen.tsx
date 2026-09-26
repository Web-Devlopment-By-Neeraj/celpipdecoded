"use client";

import { useState } from "react";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { SpeakingOptionCardBlock } from "./SpeakingVisualPrompt";
import { SpeakingPrepTimer } from "./SpeakingPrepTimer";
import {
  examSpeaking,
  examSpeakingTaskFive,
} from "@/features/exam-engine/exam-theme";
import {
  formatSpeakingTaskScreenTitle,
  speakingMockCopy,
} from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type {
  SpeakingChoiceSource,
  SpeakingOptionCard,
  SpeakingTaskContent,
} from "@/features/exam-engine/speaking-mock-types";

// The third of the four Speaking Task 5 screens (SPEAKING-05A).
//
// The camp the learner chose, the camp their sister is proposing, the
// instruction to persuade her, and 60 seconds to work out how. No
// recorder: this is the planning window, and the source gives it its own
// screen for the same reason this engine does, which is that comparing
// two camps is work and a microphone open while you do it is a distraction
// rather than a help.
//
// The two cards are printed in the order the source prints them, the
// sister's camp first and the learner's second under "Your Choice". The
// second card is whichever camp was actually chosen, which is the whole
// difference between this screen and the comparison row it replaced: that
// row printed the music camp under "Your Choice" no matter what, because
// nothing had been chosen and the content file had to say something.
//
// Saying who chose
// ----------------
//
// A short line above the cards says whether the learner picked this camp
// or the app picked it for them, and where the app picked it, the line
// says the choice screen is one Back press away. Both facts matter for
// the next 60 seconds. A learner about to plan an argument for a camp
// they did not choose should know they did not choose it, and should not
// have to guess whether that is fixed.
//
// It is a reading, not a control. The choice is changed on the screen it
// was made on, so there is no second selector here that could disagree
// with the first one.
//
// What happens when the window closes
// -----------------------------------
//
// The same as everywhere else in this section (TIMER-01). The reading
// turns red, a line appears saying "Time is up. You can continue when you
// are ready.", the section raises its shared message, and that is all.
// Nothing advances to the recording screen, nothing starts recording, and
// the chosen camp is untouched.
//
// One piece of state, whether the window has closed, read for one line of
// text.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingTaskFivePreparationScreenProps = {
  task: SpeakingTaskContent;
  // The camp the learner is arguing for. Undefined only where a stored
  // choice no longer matches any option, which a content edit between two
  // runs would leave behind.
  chosenOption?: SpeakingOptionCard;
  // Whether the learner picked it or the app did.
  choiceSource?: SpeakingChoiceSource;
  // What the countdown keys on. Pass the flow screen id, so the window
  // belongs to the screen and a re-render does not restart it.
  timerScreenKey?: string;
  // Fired once when the preparation window reaches zero (TIMER-01).
  onTimeExpire?: () => void;
  copy?: SpeakingMockCopy;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function SpeakingTaskFivePreparationScreen({
  task,
  chosenOption,
  choiceSource,
  timerScreenKey,
  onTimeExpire,
  copy = speakingMockCopy,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: SpeakingTaskFivePreparationScreenProps) {
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
          {/* The source's own persuade instruction, the same sentence the
              recording screen carries, because it is the same task. A
              learner reads it here to plan and re-reads it there to
              speak. */}
          <ExamInstructionRow className={examSpeaking.instructionRow}>
            <span className={examSpeakingTaskFive.promptInstruction}>
              {task.promptInstruction}
            </span>
          </ExamInstructionRow>

          <p className={examSpeakingTaskFive.promptParagraph}>
            {copy.prepareScreenHint}
          </p>
        </div>

        <div className={examSpeakingTaskFive.timerRow}>
          <SpeakingPrepTimer
            screenKey={`${timerScreenKey ?? task.taskId}-prepare`}
            timer={task.prepTimer}
            // Always counting. Nothing on this screen ends the window
            // early, because there is no recorder here to end it.
            active
            onExpire={handleExpire}
            copy={copy}
          />
        </div>

        {chosenOption ? (
          <div className={examSpeakingTaskFive.chosenNote}>
            <p className={examSpeakingTaskFive.chosenNoteLabel}>
              {copy.choiceSelectedLabel}
            </p>

            <p className={examSpeakingTaskFive.chosenNoteText}>
              <span className={examSpeakingTaskFive.chosenNoteOption}>
                {chosenOption.heading}
              </span>
              {". "}
              {choiceSource === "system"
                ? copy.choiceSystemSelectedNote
                : copy.choiceUserSelectedNote}
            </p>
          </div>
        ) : null}

        <div className={examSpeaking.prompt}>
          <p className={examSpeaking.promptLabel}>
            {step.comparisonCaption ?? copy.optionCardsHeading}
          </p>

          {/* The sister's camp first and the learner's second, which is
              the order the second source screen prints them in. Both are
              read only here: the choice is changed on the screen it was
              made on. */}
          <div className={examSpeaking.cardGrid}>
            <SpeakingOptionCardBlock
              card={step.comparison}
              className="h-full"
            />

            {chosenOption ? (
              <SpeakingOptionCardBlock
                card={chosenOption}
                label={step.chosenLabel}
                className="h-full"
              />
            ) : null}
          </div>
        </div>

        {/* Always in the DOM and usually empty, so a screen reader has
            something to watch before there is anything to say. */}
        <div role="status" aria-live="polite" className="min-w-0">
          {timeUp ? (
            <p className={examSpeakingTaskFive.timeUpNote}>
              {copy.choiceTimeUpNote}
            </p>
          ) : null}
        </div>
      </div>
    </ExamShell>
  );
}
