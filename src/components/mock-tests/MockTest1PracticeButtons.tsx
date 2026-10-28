import Link from "next/link";
import { cx } from "@/features/design/design-tokens";
import {
  MOCK_TEST_1_FULL_MOCK_HREF,
  MOCK_TEST_1_FULL_MOCK_LABEL,
  MOCK_TEST_1_SECTION_BUTTONS,
} from "@/features/mock-tests/mock-test-section-buttons";
import {
  MockTestPracticeButtonRow,
  mockTestRowButtonClass,
} from "@/components/mock-tests/MockTestPracticeButtonRow";

/** Full mock ~35% width; the four section buttons share the remaining ~65%. */
export function MockTest1PracticeButtons() {
  return (
    <MockTestPracticeButtonRow
      fullMock={
        <Link
          href={MOCK_TEST_1_FULL_MOCK_HREF}
          className={cx(
            mockTestRowButtonClass,
            "bg-academy-navy text-white shadow-sm hover:bg-academy-navy-dark",
          )}
        >
          {MOCK_TEST_1_FULL_MOCK_LABEL}
        </Link>
      }
      sections={MOCK_TEST_1_SECTION_BUTTONS.map((section) => (
        <Link
          key={section.key}
          href={section.href}
          className={cx(mockTestRowButtonClass, section.buttonClassName)}
        >
          {section.label}
        </Link>
      ))}
    />
  );
}
