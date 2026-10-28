"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExamInstructionScreen } from "@/components/exam/ExamInstructionScreen";
import { ExamVideoScreen } from "@/components/exam/ExamVideoScreen";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { getInstructionalVideoAsset } from "@/features/exam-engine/instructional-video-assets";
import { INSTRUCTIONAL_VIDEO_PRELOAD } from "@/features/media/cloudinary-video";
import {
  clearMockTestFullResults,
  sectionPath,
} from "@/features/mock-tests/mock-test-flow";
import { MOCK_TEST_1_HUB_PATH } from "@/features/mock-tests/mock-test-1-routes";

const OVERVIEW = getInstructionalVideoAsset("overview");

type Step = "instructions" | "video";

export function MockTest1FullStartFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("instructions");

  function startFullRun() {
    clearMockTestFullResults();
    router.push(sectionPath("listening", "full"));
  }

  if (step === "instructions") {
    return (
      <ExamInstructionScreen
        title="Mock Test 1 — Complete test overview"
        heading="Before you begin"
        instructions={[
          "You will complete Listening, Reading, Writing and Speaking in one sitting.",
          "Each section begins with short instructions and an instructional video.",
          "Between sections you will get a short preparation break.",
          "Results for section practice appear after that section; the full run shows a combined summary at the end.",
        ]}
        noticeText="Answers on this prototype stay in your browser for this visit only."
        showBack
        backHref={MOCK_TEST_1_HUB_PATH}
        backLabel="Back to mock test"
        onNext={() => setStep("video")}
        nextLabel="Continue"
      />
    );
  }

  return (
    <ExamVideoScreen
      title="Mock Test 1 — Overview video"
      videoTitle={OVERVIEW.title}
      videoSrc={OVERVIEW.src}
      description={OVERVIEW.description}
      preload={INSTRUCTIONAL_VIDEO_PRELOAD}
      autoPlayVideo
      showBack
      backHref={MOCK_TEST_1_HUB_PATH}
      backLabel="Back to mock test"
      onNext={startFullRun}
      nextLabel="Start Listening section"
      skipLabel={examCopy.skipVideoLabel}
      onSkip={startFullRun}
    />
  );
}
