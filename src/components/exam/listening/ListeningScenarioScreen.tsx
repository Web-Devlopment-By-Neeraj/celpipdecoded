import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import {
  MockTestMediaFrame,
  mockTestMediaImageClass,
} from "../player/MockTestMediaFrame";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import { listeningCopy } from "@/features/exam-engine/listening-copy";
import type { ListeningScenario } from "@/features/exam-engine/listening-types";

// Scenario screen for a Listening part (EXAM-03).
//
// Screen type 3 from docs/product/exam-engine-screen-types.md: the
// context a learner reads before the first clip plays. One instruction
// row, the scenario sentence, and the context picture.
//
// The picture is a plain img rather than next/image on purpose. The file
// is a remote Cloudinary asset, so next/image would need a
// images.remotePatterns entry in next.config.ts, which would widen this
// ticket into app wide image configuration, and it would route licensed
// practice test artwork through the Next image optimizer. A plain element
// keeps both out of scope. The size is controlled by the class recipe, so
// the picture cannot stretch past its column.
//
// No timer. The scenario screen carries no countdown.

export type ListeningScenarioScreenProps = {
  title: string;
  scenario: ListeningScenario;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningScenarioScreen({
  title,
  scenario,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ListeningScenarioScreenProps) {
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
          heading={examCopy.instructionsHeading}
          text={scenario.text}
        />

        {/* The picture sits in the shared player media frame
            (EXAM-UI-02), which caps its height against the viewport and
            letterboxes rather than cropping. A scenario drawing served at
            its intrinsic size used to be able to run taller than the whole
            content pane, which pushed the audio controls and the questions
            after it out of reach. */}
        {scenario.imageUrl ? (
          <MockTestMediaFrame caption={listeningCopy.scenarioImageCaption}>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote
                Cloudinary asset, see the note at the top of this file. */}
            <img
              src={scenario.imageUrl}
              alt={scenario.imageAlt ?? scenario.text}
              className={mockTestMediaImageClass}
              loading="lazy"
              decoding="async"
            />
          </MockTestMediaFrame>
        ) : null}
      </div>
    </ExamShell>
  );
}
