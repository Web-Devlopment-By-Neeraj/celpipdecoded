import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppPageShell } from "@/components/app/AppPageShell";
import { ExamButton } from "@/components/exam/ExamButton";
import { ExamInstructionRow } from "@/components/exam/ExamInstructionRow";
import { ExamMediaPlaceholder } from "@/components/exam/ExamMediaPlaceholder";
import { ExamPanel } from "@/components/exam/ExamPanel";
import { ExamProgressIndicator } from "@/components/exam/ExamProgressIndicator";
import { ExamShell } from "@/components/exam/ExamShell";
import { ExamTwoColumnLayout } from "@/components/exam/ExamTwoColumnLayout";
import { cx, text } from "@/features/design/design-tokens";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { examText } from "@/features/exam-engine/exam-theme";

export const metadata: Metadata = {
  title: "Practice test shell preview - CELPIP Decoded",
  description:
    "Internal preview of the practice test screen shell, using placeholder content only.",
  robots: { index: false, follow: false },
};

// Internal preview of the exam engine screen shell (EXAM-01).
//
// Every sample below uses placeholder text written for this page. No
// Mock Test 1 content, no official screenshot, and no CELPIP branding
// appears here. The page exists so the shell can be reviewed on desktop
// and mobile before any exam screen is built on top of it.
//
// The route sits under /dashboard so it is behind auth. It is not in
// navigation. A temporary card on the dashboard links to it, so a
// reviewer does not have to type the URL, and both the card and the
// notice below say Internal preview before anything else.

const INSTRUCTION_BULLETS = [
  "This is a CELPIP Decoded practice test, not the official CELPIP test.",
  "Each part begins with a short instruction screen like this one.",
  "Use Next at the top right to move forward, and Back at the bottom left to return.",
  "Placeholder text only. Practice test content is added in a later ticket.",
];

const PASSAGE_PARAGRAPHS = [
  "Placeholder passage paragraph one. This block exists to show how a long reading passage behaves inside a scrolling panel, so the questions beside it stay in view.",
  "Placeholder passage paragraph two. The left column keeps its own scrollbar, and the page itself never scrolls sideways on a small screen.",
  "Placeholder passage paragraph three. Real reading passages arrive with EXAM-05, together with the dropdown answer controls.",
  "Placeholder passage paragraph four. Nothing on this page is practice test content.",
];

const SAMPLE_OPTIONS = [
  "Placeholder answer option A",
  "Placeholder answer option B",
  "Placeholder answer option C",
  "Placeholder answer option D",
];

// Placeholder radio list. It shows the answer side of a split screen and
// stores nothing. Answer state arrives with the flow tickets.
function SampleOptionList({ name }: { name: string }) {
  return (
    <ul className="space-y-0">
      {SAMPLE_OPTIONS.map((option) => (
        <li
          key={option}
          className="border-b border-dotted border-academy-navy/15 py-1.5 last:border-b-0"
        >
          <label className="flex items-start gap-2 text-[13px] leading-5 text-academy-navy/85">
            <input
              type="radio"
              name={name}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-academy-blue"
            />
            <span className="min-w-0">{option}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function SampleHeading({ id, label }: { id: string; label: string }) {
  return (
    <h2 id={id} className={cx(text.heading, "scroll-mt-24 text-lg")}>
      {label}
    </h2>
  );
}

export default async function ExamShellPreviewPage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppPageShell
      title={examCopy.previewTitle}
      eyebrow={examCopy.previewBadge}
      description={examCopy.previewSummary}
    >
      <div className="space-y-10">
        {/* Standing notice, so the page is unmistakable even if someone
            lands on it mid scroll or shares a screenshot of one sample. */}
        <p className="rounded-md border border-dashed border-academy-navy/30 bg-academy-navy-soft/40 px-4 py-3 text-sm leading-6 text-academy-navy/80">
          <span className="font-semibold text-academy-navy">
            {examCopy.previewBadge}:
          </span>{" "}
          this page is a layout check for the practice test screen shell. It
          is not a practice test, nothing here is scored, and every word in
          the samples is placeholder text.
        </p>

        <section className="space-y-3">
          <SampleHeading id="sample-instructions" label="1. Instruction screen" />
          <ExamShell
            title="CELPIP Decoded practice test - Sample part instructions"
            metaText="Sample screen 1 of 4"
            nextHref="#sample-reading"
            showBack={false}
          >
            <div className="space-y-4">
              <ExamInstructionRow
                heading={examCopy.instructionsHeading}
                text="Read the following information before you continue."
              />
              <ul className={examText.bulletList}>
                {INSTRUCTION_BULLETS.map((bullet) => (
                  <li key={bullet} className={examText.bulletItem}>
                    {bullet}
                  </li>
                ))}
              </ul>
              <p className={examText.muted}>
                {examCopy.practiceEstimateDisclaimer}
              </p>
            </div>
          </ExamShell>
        </section>

        <section className="space-y-3">
          <SampleHeading id="sample-reading" label="2. Two column reading layout" />
          <ExamShell
            title="CELPIP Decoded practice test - Sample reading layout"
            timerLabel={examCopy.timeRemainingLabel}
            timerValue="9:00"
            nextHref="#sample-listening"
            backHref="#sample-instructions"
            padded={false}
            secondaryAction={
              <ExamButton
                variant="secondary"
                size="sm"
                uppercase={false}
                href="#sample-reading"
              >
                Sample secondary action
              </ExamButton>
            }
          >
            {/* padded={false} lets the split run to the canvas edge, which
                is how a real reading screen uses the space. */}
            <ExamTwoColumnLayout
              bordered={false}
              leftLabel="Passage"
              rightLabel="Questions"
              leftScroll="medium"
              rightScroll="medium"
              left={
                <div className="space-y-2">
                  {PASSAGE_PARAGRAPHS.map((paragraph) => (
                    <p key={paragraph} className={examText.body}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              }
              right={
                <div className="space-y-3">
                  <ExamInstructionRow text="Choose the best answer for each question." />
                  <SampleOptionList name="preview-reading" />
                </div>
              }
            />
          </ExamShell>
        </section>

        <section className="space-y-3">
          <SampleHeading
            id="sample-listening"
            label="3. Listening question layout with media placeholder"
          />
          <ExamShell
            title="CELPIP Decoded practice test - Sample listening layout"
            timerLabel={examCopy.timeRemainingLabel}
            timerValue="0:30"
            timerState="warning"
            nextHref="#sample-speaking"
            backHref="#sample-reading"
            padded={false}
          >
            <ExamTwoColumnLayout
              bordered={false}
              left={
                <div className="space-y-3">
                  <ExamInstructionRow text="Listen to the question. Placeholder instruction text." />
                  <ExamMediaPlaceholder kind="audio" />
                </div>
              }
              right={
                <div className="space-y-3">
                  <ExamProgressIndicator current={3} total={8} />
                  <ExamInstructionRow text="Choose the best answer. Placeholder instruction text." />
                  <SampleOptionList name="preview-listening" />
                </div>
              }
            />
          </ExamShell>
        </section>

        <section className="space-y-3">
          <SampleHeading id="sample-speaking" label="4. Speaking preparation layout" />
          <ExamShell
            title="CELPIP Decoded practice test - Sample speaking layout"
            timers={[
              {
                label: examCopy.preparationLabel,
                value: "0:30",
                state: "muted",
              },
              {
                label: examCopy.recordingLabel,
                value: "1:00",
                state: "muted",
              },
            ]}
            nextHref="#sample-instructions"
            backHref="#sample-listening"
          >
            <div className="space-y-4">
              <ExamInstructionRow
                heading="Placeholder speaking prompt"
                text="Describe the situation below. This is placeholder text, not a practice test prompt."
              />

              <ExamMediaPlaceholder kind="image" label="Prompt image" />

              <ExamPanel tone="muted">
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <p className={examText.muted}>Preparation time</p>
                  <p className="text-xl font-semibold tabular-nums text-academy-navy">
                    0:30
                  </p>
                  <p className={examText.muted}>
                    Static placeholder. The countdown is added with the speaking
                    flow ticket.
                  </p>
                </div>
              </ExamPanel>
            </div>
          </ExamShell>
        </section>
      </div>
    </AppPageShell>
  );
}
