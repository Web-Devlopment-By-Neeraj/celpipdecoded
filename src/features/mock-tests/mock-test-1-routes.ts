// Mock Test 1 entry URLs (Task 5).

export const MOCK_TESTS_HUB_PATH = "/dashboard/mock-tests";

export const MOCK_TEST_1_HUB_PATH = `${MOCK_TESTS_HUB_PATH}/mock-test-1`;

export const MOCK_TEST_2_HUB_PATH = `${MOCK_TESTS_HUB_PATH}/mock-test-2`;

export const MOCK_TEST_1_SECTION_PATHS = {
  listening: `${MOCK_TEST_1_HUB_PATH}/listening`,
  reading: `${MOCK_TEST_1_HUB_PATH}/reading`,
  writing: `${MOCK_TEST_1_HUB_PATH}/writing`,
  speaking: `${MOCK_TEST_1_HUB_PATH}/speaking`,
} as const;

/** Full mock opens with overview, then Listening → Reading → Writing → Speaking. */
export const MOCK_TEST_1_FULL_MOCK_START_PATH = `${MOCK_TEST_1_HUB_PATH}/full`;
