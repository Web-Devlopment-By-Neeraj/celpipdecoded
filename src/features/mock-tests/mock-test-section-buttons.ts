import {
  MOCK_TEST_1_FULL_MOCK_START_PATH,
  MOCK_TEST_1_SECTION_PATHS,
} from "./mock-test-1-routes";

export type MockTestSectionKey = keyof typeof MOCK_TEST_1_SECTION_PATHS;

const SECTION_BUTTON_CLASS =
  "bg-brand text-white hover:bg-brand-dark shadow-sm shadow-brand/20 ring-1 ring-inset ring-white/15";

export const MOCK_TEST_1_SECTION_BUTTONS: readonly {
  key: MockTestSectionKey;
  label: string;
  href: string;
  buttonClassName: string;
}[] = [
  {
    key: "listening",
    label: "Listening",
    href: MOCK_TEST_1_SECTION_PATHS.listening,
    buttonClassName: SECTION_BUTTON_CLASS,
  },
  {
    key: "reading",
    label: "Reading",
    href: MOCK_TEST_1_SECTION_PATHS.reading,
    buttonClassName: SECTION_BUTTON_CLASS,
  },
  {
    key: "writing",
    label: "Writing",
    href: MOCK_TEST_1_SECTION_PATHS.writing,
    buttonClassName: SECTION_BUTTON_CLASS,
  },
  {
    key: "speaking",
    label: "Speaking",
    href: MOCK_TEST_1_SECTION_PATHS.speaking,
    buttonClassName: SECTION_BUTTON_CLASS,
  },
] as const;

export const MOCK_TEST_1_FULL_MOCK_LABEL = "Full mock test";

export const MOCK_TEST_1_FULL_MOCK_HREF = MOCK_TEST_1_FULL_MOCK_START_PATH;
