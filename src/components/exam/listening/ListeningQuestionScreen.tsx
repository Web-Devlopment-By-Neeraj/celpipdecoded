"use client";

import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ExamTwoColumnLayout } from "../ExamTwoColumnLayout";
import { ExamCountdownTimer } from "../timer/ExamCountdownTimer";
import { ListeningAudioPlayer } from "./ListeningAudioPlayer";
import { MockTestAudioVisual } from "../player/MockTestAudioVisual";
import {
  MockTestOptionList,
  MockTestOptionRow,
} from "../player/MockTestOptionRow";
import { examListening, examText } from "@/features/exam-engine/exam-theme";
import { playerQuestionHeader } from "@/features/exam-engine/mock-test-player-theme";
import { formatExamProgress } from "@/features/exam-engine/exam-copy";
import { LISTENING_QUESTION_TIMER } from "@/features/exam-engine/listening-timing";
import { listeningCopy } from "@/features/exam-engine/listening-copy";
import type {
  ListeningQuestion,
  ListeningQuestionAudio,
} from "@/features/exam-engine/listening-types";

// Question screen for a Listening part (EXAM-03).
//
// Screen type 6 from docs/product/exam-engine-screen-types.md, and the
// screen the reference layout matters most for:
//
// - grey top bar with a live "Time remaining: 00:30" countdown
// - left column holding the question audio and its instruction
// - right column on the light blue answer wash
// - question number at the top of the answer panel
// - compact radio options with a rule between them
// - blue Next in the top bar, Back in the bottom bar
//
// The split is the EXAM-01 ExamTwoColumnLayout, whose answer side already
// carries the accent wash, so no new layout is introduced here.
//
// A client component, because selecting an option is an event handler.
// It holds no state itself: the selection is owned by the prototype above
// it, so moving back to a question shows the answer that was chosen
// before.
//
// Next is gated on an option being selected by default. The full Listening
// route turns that gate off through requireAnswer (EXAM-15F), because the
// official-style test lets a learner leave a question blank and take the
// zero for it, and a forward only run must not be able to trap them behind
// a gate. The individual part routes keep the gate, because they are
// development routes.
//
// The question stem is spoken, not printed, in this part. prompt is
// rendered when a part has one, which is what Parts 4 to 6 will need.
//
// What plays in the left column is not decided here. The caller passes the
// result of resolveListeningQuestionAudio, which is the one place the rule
// lives, and this screen draws one of its two states (EXAM-15C):
//
// - "question", the normal case and the only one any shipped content is
//   in: the question clip, captioned as question audio
// - "missing", no clip at all: a notice in the player's place, so a screen
//   with nothing to play says so instead of showing an empty player
//
// The timer is real from EXAM-15D. The bar used to print a fixed
// "Time remaining: 30 seconds", which looked like a clock and was not one.
// It now runs a countdown keyed to the question, so moving to the next
// question starts a fresh window and choosing an option does not. The
// window is 30 seconds, which is the one Listening duration published
// directly, and it comes from listening-timing.ts with the rest of them.
//
// What happens at zero is the caller's decision, and no caller moves
// anywhere (TIMER-01). The reading becomes "Time is up" in red and the
// screen stays exactly where it is. onTimeExpire, which the full route
// passes and the part routes do not, is a notification: the full route
// uses it to raise the shared time up message for a few seconds. Either
// way the selection stays selected, no option is disabled, nothing is
// submitted and Next remains the learner's to press. See
// docs/product/listening-format-strict-timing-polish.md.
//
// Until TIMER-01 the full route passed goNext here, so a closing window
// advanced the run by itself. That is what this ticket removed.
//
// The question clip can be asked to start on its own (EXAM-15F). The full
// route passes autoPlayAudio, because the official test speaks the
// question as the screen opens rather than waiting to be asked. It is an
// attempt, not a guarantee: a browser that refuses autoplay leaves the
// controls exactly where they were and the player prints a short line
// saying to press play. The part routes pass nothing and behave as they
// always did.
//
// This screen used to draw a third state, a labelled conversation replay,
// for Mock Test 1 Listening Part 3 Question 1 while that question had no
// recording of its own. The corrected source document supplied it, so the
// replay branch and its copy are gone and Question 1 renders like any
// other question.

export type ListeningQuestionScreenProps = {
  title: string;
  question: ListeningQuestion;
  // What to play, from resolveListeningQuestionAudio. Left optional so a
  // caller that has only the question still renders the right thing: the
  // question clip when it has one, and the missing notice when it does
  // not, which is what this screen did before EXAM-15C.
  audio?: ListeningQuestionAudio;
  // Position in the part, for example 3 of 8.
  questionNumber: number;
  questionCount: number;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
  // Whether Next waits for an option to be selected. False on the full
  // Listening route, where a blank is a legal answer worth zero.
  requireAnswer?: boolean;
  // Whether the question clip attempts to start on its own.
  autoPlayAudio?: boolean;
  // Label in front of the countdown in the top bar.
  timerLabel?: string;
  // How long the answering window runs. Defaults to the published 30
  // second per question window.
  timerSeconds?: number;
  timerWarningAtSeconds?: number;
  timerUrgentAtSeconds?: number;
  // What the countdown resets on. Defaults to the question's own id, which
  // is unique across the whole Listening section, so every question screen
  // gets its own window without a caller having to build a key. A caller
  // with a flow screen id can pass that instead.
  timerScreenKey?: string;
  // Fired once when the window reaches zero. Only the full Listening route
  // passes one.
  onTimeExpire?: () => void;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningQuestionScreen({
  title,
  question,
  audio,
  questionNumber,
  questionCount,
  selectedOptionId,
  onSelectOption,
  requireAnswer = true,
  autoPlayAudio = false,
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
}: ListeningQuestionScreenProps) {
  const hasAnswer = Boolean(selectedOptionId);

  // One radio group per question, so moving between questions never
  // leaves two groups sharing a name.
  const groupName = `${question.id}-options`;

  // Falls back to the question's own clip so a caller that passes nothing
  // gets the pre EXAM-15C behaviour rather than an empty column.
  const resolvedAudio: ListeningQuestionAudio =
    audio ??
    (question.audioUrl
      ? { kind: "question", url: question.audioUrl }
      : { kind: "missing" });

  return (
    <ExamShell
      title={title}
      timerSlot={
        <ExamCountdownTimer
          // Keyed on the question, so the window restarts when the
          // learner moves to another one and survives every re-render
          // caused by choosing an option.
          screenKey={timerScreenKey ?? question.id}
          durationSeconds={timerSeconds}
          warningAtSeconds={timerWarningAtSeconds}
          urgentAtSeconds={timerUrgentAtSeconds}
          label={timerLabel}
          onExpire={onTimeExpire}
        />
      }
      metaText={metaText}
      onNext={onNext}
      nextDisabled={requireAnswer && !hasAnswer}
      onBack={onBack}
      showBack={showBack}
      // The split manages its own edges and fills the canvas, the way the
      // Writing and Speaking task screens already did (EXAM-UI-03). Before
      // this the two columns were a bordered box floating in the top half
      // of a white content pane, with the audio panel and the answer panel
      // ending in mid air and the rest of the window empty under them.
      padded={false}
      // Each column takes its own scrollbar, so the pane takes none.
      scrollContent={false}
    >
      <ExamTwoColumnLayout
        // No column captions. The reference pass took the "QUESTION
        // AUDIO" and "ANSWER" small caps labels off the top of the two
        // halves: what is in each half is obvious from what is drawn in
        // it, and a test window does not caption its own panes.
        // Full height columns with the rule between them running the whole
        // way down, which is what makes the screen read as an exam window
        // rather than as a card on a page.
        fill
        bordered={false}
        left={
          <div className={examListening.columnStack}>
            <ExamInstructionRow text={listeningCopy.questionInstruction} />

            {resolvedAudio.kind === "missing" ? (
              // No clip for this question in the source material. The
              // notice says so plainly rather than playing something else.
              // No content in the project reaches this: it is the guard for
              // a future part whose source is short a recording.
              <MockTestAudioVisual
                status="idle"
                progress={0}
                hasError
                showNote={false}
                fallbackHeading={listeningCopy.questionAudioMissingHeading}
                fallbackText={listeningCopy.questionAudioMissingText}
              />
            ) : (
              <ListeningAudioPlayer
                src={resolvedAudio.url}
                title={`${listeningCopy.questionPlayerTitle} ${questionNumber}`}
                autoPlay={autoPlayAudio}
                // The note is printed here too. EXAM-UI-03 hid it on the
                // question screens as noise repeated under 38 clips, but
                // the scrub bar it is warning about is on every one of
                // those screens, so the warning belongs on every one of
                // them (reference pass).
              />
            )}

            {question.prompt ? (
              <p className={examText.body}>{question.prompt}</p>
            ) : null}
          </div>
        }
        right={
          <div className={examListening.columnStack}>
            <div className={playerQuestionHeader.wrap}>
              {/* "Question 3 of 8" as a sentence in ink rather than as a
                  small caps field label over a progress track. A learner
                  answering one question at a time needs to know which one
                  they are on, not how far through a bar they are
                  (reference pass). */}
              <p className={playerQuestionHeader.position}>
                {formatExamProgress(questionNumber, questionCount)}
              </p>

              {/* Marked with the shared information glyph (EXAM-UI-03), so
                  the answer column opens the same way the audio column
                  beside it does. */}
              <ExamInstructionRow text={listeningCopy.chooseAnswerInstruction} />
            </div>

            <fieldset className="min-w-0">
              <legend className="sr-only">
                {listeningCopy.chooseAnswerInstruction}
              </legend>

              {/* The option rows are the shared player control since
                  EXAM-UI-03, so hover, selection and the alignment of the
                  circle are decided in one place for every question screen
                  in the test rather than three times over. */}
              <MockTestOptionList>
                {question.options.map((option) => (
                  <MockTestOptionRow
                    key={option.id}
                    name={groupName}
                    value={option.id}
                    label={option.text}
                    selected={option.id === selectedOptionId}
                    onSelect={() => onSelectOption(option.id)}
                  />
                ))}
              </MockTestOptionList>
            </fieldset>

            {requireAnswer && !hasAnswer ? (
              <p className={examText.muted}>{listeningCopy.selectAnswerHint}</p>
            ) : null}
          </div>
        }
      />
    </ExamShell>
  );
}
