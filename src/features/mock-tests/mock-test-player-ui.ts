import type { MockTestPlayerContext } from "./mock-test-flow";

export function mockTestExitBackProps(
  mockTestContext: MockTestPlayerContext | undefined,
  onFirstScreens: boolean,
): {
  showBack: boolean;
  backHref?: string;
  backLabel?: string;
} {
  if (!mockTestContext || !onFirstScreens) {
    return { showBack: false };
  }
  return {
    showBack: true,
    backHref: mockTestContext.exitHref,
    backLabel: "Back to mock test",
  };
}
