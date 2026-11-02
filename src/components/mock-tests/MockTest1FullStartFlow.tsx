"use client";

import { useRouter } from "next/navigation";
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

export function MockTest1FullStartFlow() {
  const router = useRouter();

  function startFullRun() {
    clearMockTestFullResults();
    router.push(sectionPath("listening", "full"));
  }

  return (
    <ExamVideoScreen
      title="Mock Test 1 - Overview Video"
      videoTitle={examCopy.officialVideoLabel}
      videoSrc={OVERVIEW.src}
      description={examCopy.officialOverviewVideoText}
      helperText={examCopy.officialVideoCaption}
      preload={INSTRUCTIONAL_VIDEO_PRELOAD}
      autoPlayVideo
      onVideoEnded={startFullRun}
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
