import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { WritingWordCount } from "./WritingWordCount";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import {
  formatWritingTaskTransition,
  writingMockCopy,
} from "@/features/exam-engine/writing-mock-copy";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";

// Task transition screen inside the Writing section (EXAM-25).
//
// The doorway between Task 1 and Task 2. One line saying which task just
// finished and which one is next, the word count for the task that
// closed, a quiet hint, and Next. One of these appears in the run.
//
// The word count is the only reading on it, and it is a count of what was
// typed rather than a judgement of it. There is no score here because
// there is no score anywhere in this ticket: Writing is judged against
// descriptors by a reviewer that does not exist yet, so a number on this
// screen could only be invented. The ticket asks for the Task 1 word
// count specifically, and that is exactly what is shown.
//
// The hint says the Task 1 writing is kept and can be returned to, which
// is true: the responses are held by the prototype above this screen and
// Back walks straight into Task 1 with every word still there.
//
// Presentational only. It holds no state and reads no content object.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type WritingTaskTransitionScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  // The task that just finished, for example "Writing Task 1".
  completedTaskLabel: string;
  // The task that is starting, for example "Writing Task 2".
  nextTaskLabel: string;
  // How many words were typed for the task that just finished.
  completedWordCount: number;
  copy?: WritingMockCopy;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function WritingTaskTransitionScreen({
  title,
  completedTaskLabel,
  nextTaskLabel,
  completedWordCount,
  copy = writingMockCopy,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: WritingTaskTransitionScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow
          heading={copy.transitionHeading}
          text={formatWritingTaskTransition(completedTaskLabel, nextTaskLabel)}
        />

        {/* No target beside this count. The target belongs next to the
            editor, where a writer can still act on it. */}
        <WritingWordCount wordCount={completedWordCount} copy={copy} />

        <p className={examScreenBody.hint}>{copy.transitionHint}</p>
      </div>
    </ExamShell>
  );
}
