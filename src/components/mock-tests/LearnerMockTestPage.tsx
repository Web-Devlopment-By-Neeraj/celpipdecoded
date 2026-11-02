import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { MockTestComingSoon } from "@/components/mock-tests/MockTestComingSoon";
import { MockTestDetails } from "@/components/mock-tests/MockTestDetails";
import { MockTestLockedPracticeButtons } from "@/components/mock-tests/MockTestLockedPracticeButtons";
import {
  PublishedExamSection,
  PublishedOverviewVideo,
} from "@/components/mock-tests/PublishedExamSection";
import { PublishedMockPracticeButtons } from "@/components/mock-tests/PublishedMockPracticeButtons";
import { cx, focus, text } from "@/features/design/design-tokens";
import { SECTION_TYPE_LABELS } from "@/features/admin/mock-test-types";
import { MOCK_TESTS_HUB_PATH } from "@/features/mock-tests/mock-test-1-routes";
import {
  isSectionType,
  summarizeLearnerMockTest,
  type LearnerMockTest,
} from "@/features/mock-tests/published-mock-catalog";
import { getPublishedMockTestForLearner } from "@/features/mock-tests/published-mock-queries";
import { userHasPaidMockAccess } from "@/features/platform/fulfill-stripe-purchase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// One student page for every builder test. Mock Test 1 keeps its own
// routes. A slug with no published row falls back to the coming-soon
// card when fallbackMockNumber is set, and 404s otherwise.
export async function LearnerMockTestPage({
  slug,
  fallbackMockNumber,
  section,
  flow,
}: {
  slug: string;
  fallbackMockNumber: number | null;
  section?: string;
  flow?: string;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const test = await getPublishedMockTestForLearner(slug);
  const unlocked = await userHasPaidMockAccess(user.id);

  if (!test) {
    if (fallbackMockNumber) {
      return (
        <MockTestComingSoon
          mockNumber={fallbackMockNumber}
          section={section}
          unlocked={unlocked}
        />
      );
    }

    notFound();
  }

  if (!unlocked) {
    return <PublishedMockLocked test={test} />;
  }

  const requested = section && isSectionType(section) ? section : null;
  const ordered = [...test.sections].sort((a, b) => a.order - b.order);

  if (flow === "full" && !requested && ordered[0]) {
    return (
      <PublishedOverviewVideo
        test={test}
        nextSection={ordered[0].sectionType}
      />
    );
  }

  if (!requested) {
    return (
      <PublishedMockOverview
        test={test}
        note={
          section
            ? "That section is not part of this practice test."
            : undefined
        }
      />
    );
  }

  const index = ordered.findIndex((item) => item.sectionType === requested);
  const current = index >= 0 ? ordered[index] : null;

  if (!current) {
    return (
      <PublishedMockOverview
        test={test}
        note={`${SECTION_TYPE_LABELS[requested]} is not part of this practice test yet.`}
      />
    );
  }

  const playable =
    current.sectionType === "writing" || current.sectionType === "speaking"
      ? current.parts.some((part) => (part.instructions ?? "").trim().length > 0)
      : current.parts.some((part) => part.questions.length > 0);

  if (!playable) {
    return (
      <PublishedMockOverview
        test={test}
        note={`${SECTION_TYPE_LABELS[requested]} has no content in this practice test yet.`}
      />
    );
  }

  return (
    <PublishedExamSection
      test={test}
      section={current.sectionType}
      mode={flow === "full" ? "full" : "section"}
    />
  );
}

function PublishedMockOverview({
  test,
  note,
}: {
  test: LearnerMockTest;
  note?: string;
}) {
  return (
    <div className="w-full">
      <AppSectionHeader
        title={test.title}
        description="All four sections · about 2 hours 40 minutes"
        action={
          <Link
            href={MOCK_TESTS_HUB_PATH}
            className={cx(
              "text-sm font-semibold text-brand underline-offset-2 hover:underline",
              focus.ring,
            )}
          >
            All mock tests
          </Link>
        }
      />

      {note ? (
        <p className={cx("mt-4 text-sm leading-6", text.secondary)}>{note}</p>
      ) : null}

      <MockTestDetails
        start={
          <PublishedMockPracticeButtons test={summarizeLearnerMockTest(test)} />
        }
      />
    </div>
  );
}

function PublishedMockLocked({ test }: { test: LearnerMockTest }) {
  return (
    <div className="w-full">
      <AppSectionHeader
        title={test.title}
        description="All four sections · about 2 hours 40 minutes"
        action={
          <Link
            href={MOCK_TESTS_HUB_PATH}
            className={cx(
              "text-sm font-semibold text-brand underline-offset-2 hover:underline",
              focus.ring,
            )}
          >
            All mock tests
          </Link>
        }
      />
      <MockTestDetails
        badge={
          <AppStatusBadge tone="neutral" className="shrink-0">
            Locked
          </AppStatusBadge>
        }
        start={<MockTestLockedPracticeButtons productCode="sprint" />}
      />
    </div>
  );
}
