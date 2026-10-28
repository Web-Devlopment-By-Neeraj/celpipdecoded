import Link from "next/link";
import { cx } from "@/features/design/design-tokens";
import { MOCK_TEST_1_SECTION_BUTTONS } from "@/features/mock-tests/mock-test-section-buttons";
import {
  MockTestPracticeButtonRow,
  mockTestRowButtonClass,
} from "@/components/mock-tests/MockTestPracticeButtonRow";

function placeholderHref(mockNumber: number, section?: string): string {
  const path = `/dashboard/mock-tests/mock-test-${mockNumber}`;
  if (!section) return path;
  return `${path}?section=${section}`;
}

/** Paid mock: same button row, every option opens the coming-soon page. */
export function MockTestUnlockedPracticeButtons({
  mockNumber,
}: {
  mockNumber: number;
}) {
  return (
    <MockTestPracticeButtonRow
      fullMock={
        <Link
          href={placeholderHref(mockNumber)}
          className={cx(
            mockTestRowButtonClass,
            "bg-academy-navy text-white shadow-sm hover:bg-academy-navy-dark",
          )}
        >
          Full mock test
        </Link>
      }
      sections={MOCK_TEST_1_SECTION_BUTTONS.map((section) => (
        <Link
          key={section.key}
          href={placeholderHref(mockNumber, section.key)}
          className={cx(mockTestRowButtonClass, section.buttonClassName)}
        >
          {section.label}
        </Link>
      ))}
    />
  );
}
