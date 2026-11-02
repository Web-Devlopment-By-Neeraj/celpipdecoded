import Link from "next/link";
import { cx } from "@/features/design/design-tokens";
import { learnerMockPath } from "@/features/mock-tests/published-mock-catalog";
import type { LearnerMockTestSummary } from "@/features/mock-tests/published-mock-catalog";
import { MOCK_TEST_1_SECTION_BUTTONS } from "@/features/mock-tests/mock-test-section-buttons";
import {
  MockTestPracticeButtonRow,
  mockTestRowButtonClass,
} from "@/components/mock-tests/MockTestPracticeButtonRow";

// The same button row as Mock Test 1. A skill that was not authored is
// shown disabled so the card stays aligned and the gap is obvious.
export function PublishedMockPracticeButtons({
  test,
}: {
  test: LearnerMockTestSummary;
}) {
  const available = new Set(test.sectionTypes);
  const fullHref =
    test.sectionTypes.length > 0
      ? learnerMockPath(test.slug, { flow: "full" })
      : learnerMockPath(test.slug);

  return (
    <MockTestPracticeButtonRow
      fullMock={
        <Link
          href={fullHref}
          className={cx(
            mockTestRowButtonClass,
            "bg-academy-navy text-white shadow-sm hover:bg-academy-navy-dark",
          )}
        >
          Full mock test
        </Link>
      }
      sections={MOCK_TEST_1_SECTION_BUTTONS.map((section) => {
        if (!available.has(section.key)) {
          return (
            <span
              key={section.key}
              aria-disabled="true"
              title="Not in this test yet"
              className={cx(
                mockTestRowButtonClass,
                "cursor-not-allowed bg-academy-navy/10 text-academy-navy/45",
              )}
            >
              {section.label}
            </span>
          );
        }

        return (
          <Link
            key={section.key}
            href={learnerMockPath(test.slug, { section: section.key })}
            className={cx(mockTestRowButtonClass, section.buttonClassName)}
          >
            {section.label}
          </Link>
        );
      })}
    />
  );
}
