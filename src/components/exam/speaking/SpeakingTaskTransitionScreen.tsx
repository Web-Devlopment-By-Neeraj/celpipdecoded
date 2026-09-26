import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { examScreenBody, examSpeaking } from "@/features/exam-engine/exam-theme";
import {
  formatSpeakingClock,
  formatSpeakingTaskTransition,
  speakingMockCopy,
} from "@/features/exam-engine/speaking-mock-copy";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";

// Task transition screen inside the Speaking section (EXAM-27).
//
// The doorway between one task and the next. One line saying which task
// just finished and which one is next, whether that task was recorded, a
// quiet hint, and Next. Seven of these appear in the run.
//
// The reading on it is recorded or not recorded, and a length where there
// is one. There is no score here because there is no score anywhere in
// this ticket: Speaking is judged against descriptors by a reviewer that
// does not exist yet, so a number on this screen could only be invented.
// It is not even a judgement of length: a short answer is not a worse
// answer, and the seconds are here so a learner can tell that the take
// they think they made is the take the section is holding.
//
// A task with no recording says so plainly and offers nothing else. It is
// not an error and it is not styled as one: a learner may have chosen to
// skip a task, or may be walking the section to read it.
//
// The hint says the recording is kept and can be returned to, which is
// true: the recordings are held by the prototype above this screen and
// Back walks straight into the previous task with the audio still there.
//
// Presentational only. It holds no state and reads no content object.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type SpeakingTaskTransitionScreenProps = {
  // Exam frame title, normally the section title.
  title: string;
  // The task that just finished, for example "Speaking Task 1".
  completedTaskLabel: string;
  // The task that is starting, for example "Speaking Task 2".
  nextTaskLabel: string;
  // Whether the task that just finished has a recording.
  completedRecorded: boolean;
  // How long that recording ran. Ignored when there is none.
  completedDurationSeconds: number;
  copy?: SpeakingMockCopy;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function SpeakingTaskTransitionScreen({
  title,
  completedTaskLabel,
  nextTaskLabel,
  completedRecorded,
  completedDurationSeconds,
  copy = speakingMockCopy,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: SpeakingTaskTransitionScreenProps) {
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
          text={formatSpeakingTaskTransition(
            completedTaskLabel,
            nextTaskLabel,
          )}
        />

        <p className={examSpeaking.completeCount}>
          {completedRecorded
            ? `${copy.transitionRecordedLabel}: ${formatSpeakingClock(completedDurationSeconds)}`
            : copy.transitionMissingLabel}
        </p>

        <p className={examScreenBody.hint}>{copy.transitionHint}</p>
      </div>
    </ExamShell>
  );
}
