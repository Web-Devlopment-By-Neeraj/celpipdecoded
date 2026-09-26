import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamMediaPlaceholder } from "../ExamMediaPlaceholder";
import { ExamShell } from "../ExamShell";
import { examListening, examScreenBody } from "@/features/exam-engine/exam-theme";
import { listeningCopy } from "@/features/exam-engine/listening-copy";

// Section break screen for a Listening part (EXAM-03).
//
// The short pause the source document marks between the conversation
// sections. One line telling the learner what is coming, and a small
// inert placeholder standing in for the timed pause that a later ticket
// plays here.
//
// The placeholder is the EXAM-01 ExamMediaPlaceholder, so the break
// screen reserves the same area the real preparation pause will use and
// nothing has to move when it lands.
//
// No timer, and no countdown. In this prototype the learner leaves the
// break screen by pressing Next.

export type ListeningSectionBreakScreenProps = {
  title: string;
  // For example "You will hear the second section of the conversation
  // shortly."
  message: string;
  // Section position, for example "Section 2 of 3".
  sectionLabel?: string;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningSectionBreakScreen({
  title,
  message,
  sectionLabel,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ListeningSectionBreakScreenProps) {
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
          heading={sectionLabel ?? listeningCopy.sectionBreakHeading}
          text={message}
        />

        <div className={examListening.mediaStack}>
          <ExamMediaPlaceholder
            kind="audio"
            label={listeningCopy.sectionBreakPlaceholderLabel}
            helperText={listeningCopy.sectionBreakPlaceholderHelper}
          />

          <p className={examScreenBody.hint}>
            {listeningCopy.sectionBreakHint}
          </p>
        </div>
      </div>
    </ExamShell>
  );
}
