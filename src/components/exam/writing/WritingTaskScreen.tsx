import { ExamShell } from "../ExamShell";
import { ExamTwoColumnLayout } from "../ExamTwoColumnLayout";
import { ExamCountdownTimer } from "../timer/ExamCountdownTimer";
import { WritingPromptPanel } from "./WritingPromptPanel";
import { WritingResponseEditor } from "./WritingResponseEditor";
import { WritingSituationPanel } from "./WritingSituationPanel";
import { examWriting } from "@/features/exam-engine/exam-theme";
import { writingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type { WritingTaskContent } from "@/features/exam-engine/writing-mock-types";

// The working screen for one Writing task (EXAM-25).
//
// Screen type 9 from docs/product/exam-engine-screen-types.md: the
// situation on the left, and on the right the prompt, the positions where
// the task has them, and the editor.
//
// Both Mock Test 1 tasks used to use this one screen. EXAM-UI-04 changed
// that for one of them: a task that offers positions to choose between
// now gets a choice screen and then an editor screen of its own, in
// WritingTaskTwoChoiceScreen.tsx and WritingTaskTwoEditorScreen.tsx, and
// the section prototype routes it there. So this screen now draws the
// tasks that are answered in one step, which in Mock Test 1 is Task 1 and
// which is unchanged by this ticket: the same split, the same prompt
// panel, the same editor, the same word count and the same timer.
//
// The split is the shared ExamTwoColumnLayout rather than the Reading
// wrapper over it. Reading passes both columns a fixed scroll height,
// which is right when both halves are things to read and wrong here: an
// editor inside a column capped at 28rem would put the writing area in a
// box inside a box, with two scrollbars over the same text. So the
// situation column scrolls on its own and the response column does not.
// The canvas scrolls whatever is left, which for a 150 to 200 word
// response is very little.
//
// The timer belongs to the task rather than to anything on it. Writing is
// timed per task in the source document, which gives 27 minutes for Task
// 1 and 53 minutes for the section, so the window is keyed to the flow
// screen id: typing, choosing a position and every re-render that follows
// keep the same key and therefore the same window.
//
// What happens at zero is the caller's decision, and no caller moves
// anywhere (TIMER-01). The reading becomes "Time is up" in red, the
// screen stays put, every word stays on it, and the learner continues by
// pressing Next or Finish Writing when they are ready. Nothing
// auto-submits, nothing advances and nothing is erased. onTimeExpire is a
// notification: the section run passes one and uses it to raise the
// shared time up message for a few seconds. Strict Writing timing is a
// later ticket.
//
// The screen holds no state. The response text and the chosen position
// are owned by the prototype above it, so leaving the task and coming
// back shows exactly what was there before.
//
// Presentational, so no "use client" of its own: it is rendered by the
// prototype, which is the client component, and ExamCountdownTimer
// carries its own.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingTaskScreenProps = {
  task: WritingTaskContent;
  response: string;
  onChangeResponse: (text: string) => void;
  // The chosen position on a task that offers one.
  selectedOptionId?: string;
  onSelectOption?: (optionId: string) => void;
  // What the countdown resets on. Pass the flow screen id, so the window
  // belongs to the screen and nothing typed on it starts a new one.
  timerScreenKey?: string;
  // Fired once when the window reaches zero. Nothing passes one in
  // EXAM-25.
  onTimeExpire?: () => void;
  copy?: WritingMockCopy;
  metaText?: string;
  nextLabel?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function WritingTaskScreen({
  task,
  response,
  onChangeResponse,
  selectedOptionId,
  onSelectOption,
  timerScreenKey,
  onTimeExpire,
  copy = writingMockCopy,
  metaText,
  nextLabel,
  onNext,
  onBack,
  showBack = true,
}: WritingTaskScreenProps) {
  return (
    <ExamShell
      title={task.title}
      timerSlot={
        <ExamCountdownTimer
          // Keyed on the screen, because the whole task is written
          // inside one window.
          screenKey={timerScreenKey ?? task.taskId}
          durationSeconds={task.timer.seconds}
          warningAtSeconds={task.timer.warningAtSeconds}
          urgentAtSeconds={task.timer.urgentAtSeconds}
          label={copy.taskTimerLabel}
          onExpire={onTimeExpire}
        />
      }
      metaText={metaText}
      nextLabel={nextLabel}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
      // The split manages its own edges and fills the canvas.
      padded={false}
      // The split pane gives each column its own scrollbar, so the
      // content pane takes none of its own (EXAM-UI-02).
      scrollContent={false}
    >
      <ExamTwoColumnLayout
        // No column labels (EXAM-UI-03). Each half already opens with its
        // own instruction line, "Read the following information." on the
        // left and the task on the right, so a small caps INFORMATION
        // above the first and YOUR RESPONSE above the second said the
        // same thing twice and cost two rows of the window. The rule
        // between the columns is what separates them, and the field keeps
        // its own label strip.
        // Fixed heights, used only below the large breakpoint and on the
        // internal part routes, where there is no window height to fill.
        leftScroll="tall"
        rightScroll="none"
        // Above that, each column takes the height of the content pane and
        // its own scrollbar (EXAM-UI-02). The situation stays readable
        // while the editor is being typed in, the word count under the
        // editor stays reachable without scrolling the whole screen, and
        // the timer in the top bar and Next in the bottom bar never move.
        fill
        bordered={false}
        // The same left column the Task 2 choice and editor screens draw
        // (EXAM-UI-04), so all three screens in the section open their
        // reading half identically.
        left={<WritingSituationPanel task={task} />}
        right={
          <div className={examWriting.taskColumn}>
            <WritingPromptPanel
              task={task}
              selectedOptionId={selectedOptionId}
              onSelectOption={onSelectOption}
              copy={copy}
            />

            <WritingResponseEditor
              editorId={`${task.taskId}-response`}
              value={response}
              onChange={onChangeResponse}
              placeholder={task.editorPlaceholder}
              targetMin={task.wordTarget.min}
              targetMax={task.wordTarget.max}
              copy={copy}
            />
          </div>
        }
      />
    </ExamShell>
  );
}
