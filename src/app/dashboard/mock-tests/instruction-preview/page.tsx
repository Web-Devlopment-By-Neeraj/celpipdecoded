import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppPageShell } from "@/components/app/AppPageShell";
import { ExamInstructionScreen } from "@/components/exam/ExamInstructionScreen";
import { ExamSectionIntroCard } from "@/components/exam/ExamSectionIntroCard";
import { ExamVideoScreen } from "@/components/exam/ExamVideoScreen";
import { cx, text } from "@/features/design/design-tokens";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { getInstructionalVideoAsset } from "@/features/exam-engine/instructional-video-assets";
import type {
  ExamInstruction,
  ExamSectionIntroDetail,
  ExamSectionKey,
} from "@/features/exam-engine/instruction-screen-types";

export const metadata: Metadata = {
  title:
    "Practice test instruction screens preview - CELPIP Decoded",
  description:
    "Internal preview of the practice test instruction and instructional video screens.",
  robots: { index: false, follow: false },
};

// Internal preview of the instruction and instructional video screens
// (EXAM-02).
//
// The nine samples below are the screens a full practice test opens with:
// the complete test overview video, then the instructions and the
// instructional video for each of the four sections. All five local
// the licensed clips are shown, so the whole instructional sequence
// can be reviewed in one place.
//
// The videos are real. Every line of instruction text on this page is
// placeholder copy written for the preview, because the real section
// instructions are not structured yet. No Mock Test 1 content, no
// question, no official screenshot, and no CELPIP branding appears here.
//
// This is not the practice test flow. Next, Back and Skip link between
// the samples on this page, nothing is saved, and nothing is scored. The
// flow tickets connect these screens to Mock Test 1.
//
// The route sits under /dashboard so the layout auth guard covers it, and
// the page verifies the session again. It is absent from navigation and
// carries robots noindex.

const TITLE_PREFIX = "CELPIP Decoded practice test";

const PLACEHOLDER_NOTICE =
  "Placeholder instruction text for internal review. The section instructions are structured in a later ticket.";

const PLACEHOLDER_SUMMARY =
  "CELPIP-style practice. Placeholder summary text for internal review.";

// The four sections, in the order a full practice test runs them. Each
// one contributes an instruction screen and an instructional video
// screen, both built from this record.
type PreviewSection = {
  key: Exclude<ExamSectionKey, "overview">;
  label: string;
  // Reads into the top bar title, for example
  // "CELPIP Decoded practice test - Listening test instructions".
  sectionTitle: string;
  subtitle: string;
  instructions: ExamInstruction[];
  noticeText: string;
  details: ExamSectionIntroDetail[];
  videoDescription: string;
};

const PREVIEW_SECTIONS: PreviewSection[] = [
  {
    key: "listening",
    label: "Listening",
    sectionTitle: "Listening",
    subtitle:
      "Read the following information before you start the Listening section.",
    instructions: [
      "This is a CELPIP Decoded practice test, not the official CELPIP test.",
      "The Listening section has six parts, and each part opens with its own instruction screen.",
      "Placeholder line: each audio clip plays once, and the answer window opens when the clip ends.",
      {
        heading: "Moving through the test.",
        text: "Use Next at the top right to move forward, and Back at the bottom left to return to the previous screen.",
      },
    ],
    noticeText: PLACEHOLDER_NOTICE,
    details: [
      { label: "Parts", value: "6" },
      { label: "Format", value: "Audio and questions" },
      { label: "Scoring", value: "Practice estimate" },
    ],
    videoDescription:
      "Watch this short video before you start the Listening section.",
  },
  {
    key: "reading",
    label: "Reading",
    sectionTitle: "Reading",
    subtitle:
      "Read the following information before you start the Reading section.",
    instructions: [
      "This is a CELPIP Decoded practice test, not the official CELPIP test.",
      "The Reading section has four parts, and each part opens with its own instruction screen.",
      "Placeholder line: the passage sits on the left and the questions sit on the right, and each side scrolls on its own.",
      {
        heading: "Timing.",
        text: "Placeholder line: the timer in the top bar covers the whole part.",
      },
    ],
    noticeText: PLACEHOLDER_NOTICE,
    details: [
      { label: "Parts", value: "4" },
      { label: "Format", value: "Split screen" },
      { label: "Scoring", value: "Practice estimate" },
    ],
    videoDescription:
      "Watch this short video before you start the Reading section.",
  },
  {
    key: "writing",
    label: "Writing",
    sectionTitle: "Writing",
    subtitle:
      "Read the following information before you start the Writing section.",
    instructions: [
      "This is a CELPIP Decoded practice test, not the official CELPIP test.",
      "The Writing section has two tasks, and each task has its own time limit.",
      "Placeholder line: the source information sits on the left and the editor sits on the right, with a live word count under it.",
      {
        heading: "Feedback.",
        text: "Your response is reviewed by the existing CELPIP Decoded writing feedback tool after you finish the task.",
      },
    ],
    noticeText: examCopy.practiceEstimateDisclaimer,
    details: [
      { label: "Tasks", value: "2" },
      { label: "Format", value: "Written response" },
      { label: "Feedback", value: "AI reviewed" },
    ],
    videoDescription:
      "Watch this short video before you start the Writing section.",
  },
  {
    key: "speaking",
    label: "Speaking",
    sectionTitle: "Speaking",
    subtitle:
      "Read the following information before you start the Speaking section.",
    instructions: [
      "This is a CELPIP Decoded practice test, not the official CELPIP test.",
      "The Speaking section has eight tasks, and each task has a preparation phase and a recording phase.",
      "Placeholder line: the preparation and recording times for the task appear in the top bar.",
      {
        heading: "Recording.",
        text: "This practice test records your answer, so the existing CELPIP Decoded speaking feedback tool can review it.",
      },
    ],
    noticeText: examCopy.practiceEstimateDisclaimer,
    details: [
      { label: "Tasks", value: "8" },
      { label: "Format", value: "Recorded response" },
      { label: "Feedback", value: "AI reviewed" },
    ],
    videoDescription:
      "Watch this short video before you start the Speaking section.",
  },
];

// One sample on this page. The list is built once below, so the sample
// numbering and the Next and Back targets cannot drift apart when a
// screen is added or reordered.
type PreviewScreen = {
  id: string;
  // Heading above the sample, without its number.
  label: string;
} & (
  | {
      kind: "video";
      section: ExamSectionKey;
      description: string;
    }
  | {
      kind: "instructions";
      section: PreviewSection;
    }
);

const PREVIEW_SCREENS: PreviewScreen[] = [
  {
    kind: "video",
    id: "sample-overview-video",
    label: "Complete test overview video screen",
    section: "overview",
    description:
      "Watch this short overview of how a CELPIP Decoded practice test runs before you start the first section.",
  },
  ...PREVIEW_SECTIONS.flatMap((section): PreviewScreen[] => [
    {
      kind: "instructions",
      id: `sample-${section.key}-instructions`,
      label: `${section.label} instruction text screen`,
      section,
    },
    {
      kind: "video",
      id: `sample-${section.key}-video`,
      label: `${section.label} instructional video screen`,
      section: section.key,
      description: section.videoDescription,
    },
  ]),
];

function SampleHeading({ id, label }: { id: string; label: string }) {
  return (
    <h2 id={id} className={cx(text.heading, "scroll-mt-24 text-lg")}>
      {label}
    </h2>
  );
}

export default async function ExamInstructionPreviewPage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const total = PREVIEW_SCREENS.length;

  return (
    <AppPageShell
      title={examCopy.instructionPreviewTitle}
      eyebrow={examCopy.previewBadge}
      description={examCopy.instructionPreviewSummary}
    >
      <div className="space-y-10">
        {/* Standing notice, so the page is unmistakable even if someone
            lands on it mid scroll or shares a screenshot of one sample. */}
        <p className="rounded-md border border-dashed border-academy-navy/30 bg-academy-navy-soft/40 px-4 py-3 text-sm leading-6 text-academy-navy/80">
          <span className="font-semibold text-academy-navy">
            {examCopy.previewBadge}:
          </span>{" "}
          this page is a layout check for the practice test instruction and
          instructional video screens. It is not a practice test, nothing here
          is scored, and every instruction line is placeholder text. The
          instructional videos are the real licensed clips.
        </p>

        {PREVIEW_SCREENS.map((screen, index) => {
          const position = index + 1;
          const metaText = `Sample screen ${position} of ${total}`;

          // Samples link to each other and wrap around at the ends, so
          // nothing on this page navigates away.
          const previousId = PREVIEW_SCREENS[(index - 1 + total) % total].id;
          const nextId = PREVIEW_SCREENS[(index + 1) % total].id;
          const isFirst = index === 0;

          return (
            <section key={screen.id} className="space-y-3">
              <SampleHeading
                id={screen.id}
                label={`${position}. ${screen.label}`}
              />

              {screen.kind === "video" ? (
                <VideoSample
                  section={screen.section}
                  description={screen.description}
                  metaText={metaText}
                  nextHref={`#${nextId}`}
                  backHref={isFirst ? undefined : `#${previousId}`}
                />
              ) : (
                <InstructionsSample
                  section={screen.section}
                  metaText={metaText}
                  nextHref={`#${nextId}`}
                  backHref={`#${previousId}`}
                />
              )}
            </section>
          );
        })}
      </div>
    </AppPageShell>
  );
}

// Instructional video sample.
//
// The clip comes from the EXAM-02 registry, never from a path typed here.
// A missing file is handled by ExamVideoPlayer, which swaps the stage for
// a safe fallback message instead of showing a broken element.
function VideoSample({
  section,
  description,
  metaText,
  nextHref,
  backHref,
}: {
  section: ExamSectionKey;
  description: string;
  metaText: string;
  nextHref: string;
  backHref?: string;
}) {
  const video = getInstructionalVideoAsset(section);

  const title =
    section === "overview"
      ? `${TITLE_PREFIX} - Test overview`
      : `${TITLE_PREFIX} - ${video.title}`;

  return (
    <ExamVideoScreen
      title={title}
      videoTitle={video.title}
      videoSrc={video.src}
      posterSrc={video.poster}
      durationLabel={video.durationLabel}
      description={description}
      helperText={video.description}
      metaText={metaText}
      nextHref={nextHref}
      backHref={backHref}
      showBack={Boolean(backHref)}
      skipHref={nextHref}
    />
  );
}

// Instruction text sample. Every line is placeholder copy.
function InstructionsSample({
  section,
  metaText,
  nextHref,
  backHref,
}: {
  section: PreviewSection;
  metaText: string;
  nextHref: string;
  backHref: string;
}) {
  return (
    <ExamInstructionScreen
      title={`${TITLE_PREFIX} - ${section.sectionTitle} test instructions`}
      subtitle={section.subtitle}
      instructions={section.instructions}
      noticeText={section.noticeText}
      metaText={metaText}
      nextHref={nextHref}
      backHref={backHref}
      intro={
        <ExamSectionIntroCard
          label={section.label}
          title={`${section.label} section`}
          summary={PLACEHOLDER_SUMMARY}
          details={section.details}
        />
      }
    />
  );
}
