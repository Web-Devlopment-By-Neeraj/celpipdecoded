import { ExamModeViewport } from "@/components/exam/ExamModeViewport";
import { ExamVideoScreen } from "@/components/exam/ExamVideoScreen";
import { ListeningSectionPrototype } from "@/components/exam/listening/ListeningSectionPrototype";
import { ReadingSectionPrototype } from "@/components/exam/reading/ReadingSectionPrototype";
import { SpeakingSectionPrototype } from "@/components/exam/speaking/SpeakingSectionPrototype";
import { WritingSectionPrototype } from "@/components/exam/writing/WritingSectionPrototype";
import { getInstructionalVideoAsset } from "@/features/exam-engine/instructional-video-assets";
import { buildListeningSectionCopy } from "@/features/exam-engine/listening-section-copy";
import { withoutListeningSectionAnswerKeys } from "@/features/exam-engine/listening-section-flow";
import type { ListeningSectionAnswerMap } from "@/features/exam-engine/listening-section-types";
import { buildReadingSectionCopy } from "@/features/exam-engine/reading-copy";
import { withoutReadingSectionAnswerKeys } from "@/features/exam-engine/reading-section-flow";
import type { ReadingSectionAnswerMap } from "@/features/exam-engine/reading-section-types";
import { buildSpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import { buildWritingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import {
  buildPublishedListeningContent,
  buildPublishedPlayerContext,
  buildPublishedReadingContent,
  buildPublishedSpeakingContent,
  buildPublishedWritingContent,
} from "@/features/mock-tests/published-exam-content";
import {
  learnerMockPath,
  type LearnerMockTest,
} from "@/features/mock-tests/published-mock-catalog";
import type { SectionType } from "@/features/admin/mock-test-types";
import {
  markPublishedListening,
  markPublishedReading,
} from "@/app/dashboard/mock-tests/published-actions";

// The exam window for one section of an uploaded practice test.
//
// Same shells as Mock Test 1. The content is built here, on the server,
// and the answer keys are stripped before a client component can see them.
export async function PublishedExamSection({
  test,
  section,
  mode,
}: {
  test: LearnerMockTest;
  section: SectionType;
  mode: "section" | "full";
}) {
  const present = test.sections.map((item) => item.sectionType);
  const mockTestContext = buildPublishedPlayerContext({
    slug: test.slug,
    section,
    mode,
    present,
  });
  const label = `${test.title} - ${section}`;

  if (section === "listening") {
    const content = buildPublishedListeningContent(test);

    if (!content || content.parts.length === 0) {
      return null;
    }

    async function markListening(answers: ListeningSectionAnswerMap) {
      "use server";
      return markPublishedListening(test.slug, answers);
    }

    return (
      <ExamModeViewport label={label}>
        <ListeningSectionPrototype
          content={withoutListeningSectionAnswerKeys(content)}
          markAnswers={markListening}
          copy={buildListeningSectionCopy({ testLabel: test.title })}
          mockTestContext={mockTestContext}
        />
      </ExamModeViewport>
    );
  }

  if (section === "reading") {
    const content = buildPublishedReadingContent(test);

    if (!content || content.parts.length === 0) {
      return null;
    }

    async function markReading(answers: ReadingSectionAnswerMap) {
      "use server";
      return markPublishedReading(test.slug, answers);
    }

    return (
      <ExamModeViewport label={label}>
        <ReadingSectionPrototype
          content={withoutReadingSectionAnswerKeys(content)}
          markAnswers={markReading}
          copy={buildReadingSectionCopy({ testLabel: test.title })}
          dashboardHref={`/dashboard/mock-tests/${test.slug}`}
          mockTestContext={mockTestContext}
        />
      </ExamModeViewport>
    );
  }

  if (section === "writing") {
    const content = buildPublishedWritingContent(test);

    if (!content || content.tasks.length === 0) {
      return null;
    }

    return (
      <ExamModeViewport label={label}>
        <WritingSectionPrototype
          content={content}
          copy={buildWritingMockCopy({ testLabel: test.title })}
          dashboardHref={`/dashboard/mock-tests/${test.slug}`}
          mockTestContext={mockTestContext}
        />
      </ExamModeViewport>
    );
  }

  const content = buildPublishedSpeakingContent(test);

  if (!content || content.tasks.length === 0) {
    return null;
  }

  return (
    <ExamModeViewport label={label}>
      <SpeakingSectionPrototype
        content={content}
        copy={buildSpeakingMockCopy({ testLabel: test.title })}
        dashboardHref={`/dashboard/mock-tests/${test.slug}`}
        enableReview={false}
        mockTestContext={mockTestContext}
      />
    </ExamModeViewport>
  );
}

export function PublishedOverviewVideo({
  test,
  nextSection,
}: {
  test: LearnerMockTest;
  nextSection: SectionType;
}) {
  const video = getInstructionalVideoAsset("overview");

  return (
    <ExamModeViewport label={`${test.title} - Test overview`}>
      <ExamVideoScreen
        title={`${test.title} - Test overview`}
        videoTitle={video.title}
        videoSrc={video.src}
        description={video.description}
        helperText="This overview is the same video on every practice test."
        nextHref={learnerMockPath(test.slug, {
          section: nextSection,
          flow: "full",
        })}
        nextLabel="Start"
        showBack
        backHref={`/dashboard/mock-tests/${test.slug}`}
        backLabel="Back"
      />
    </ExamModeViewport>
  );
}
