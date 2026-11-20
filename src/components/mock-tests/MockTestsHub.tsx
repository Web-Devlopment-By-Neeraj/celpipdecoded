import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import {
  MockTestHubList,
  type MockHubCard,
} from "@/components/mock-tests/MockTestHubList";
import { MOCK_TEST_1_HUB_PATH } from "@/features/mock-tests/mock-test-1-routes";
import type { MockRunView } from "@/features/mock-tests/mock-run";
import {
  buildMockTestHub,
  learnerMockPath,
  type LearnerMockTestSummary,
} from "@/features/mock-tests/published-mock-catalog";

export function MockTestsHub({
  mocksUnlocked,
  published,
  runs,
}: {
  mocksUnlocked: boolean;
  published: LearnerMockTestSummary[];
  runs: MockRunView[];
}) {
  const cards = buildHubCards(mocksUnlocked, published);

  return (
    <div className="w-full">
      <AppSectionHeader
        title="Mock tests"
        description="Take a full mock test for the real exam experience, or practice one section at a time at your own pace."
      />
      <MockTestHubList cards={cards} runs={runs} />
    </div>
  );
}

function buildHubCards(
  mocksUnlocked: boolean,
  published: LearnerMockTestSummary[],
): MockHubCard[] {
  const publishedBySlot = new Map<number, LearnerMockTestSummary>();
  const extras: LearnerMockTestSummary[] = [];

  for (const entry of buildMockTestHub(published)) {
    if (entry.kind !== "published") continue;
    if (entry.slot) publishedBySlot.set(entry.slot, entry.test);
    else extras.push(entry.test);
  }

  const cards: MockHubCard[] = [
    {
      key: "mock-test-1",
      href: MOCK_TEST_1_HUB_PATH,
      title: "Mock Test 1",
      slug: "mock-test-1",
      comingSoon: false,
      description: mocksUnlocked
        ? "Click full mock test for timed practice or one section at a time."
        : "Free. Click full mock test for timed practice or one section at a time.",
      badge: mocksUnlocked ? null : "Free",
    },
  ];

  for (let slot = 2; slot <= 20; slot += 1) {
    const test = publishedBySlot.get(slot);
    cards.push(test ? publishedCard(test, mocksUnlocked) : placeholderCard(slot, mocksUnlocked));
  }

  for (const test of extras) {
    cards.push(publishedCard(test, mocksUnlocked));
  }

  for (let slot = 21; slot <= 30; slot += 1) {
    cards.push({
      key: `soon-${slot}`,
      href: null,
      title: `Mock Test ${slot}`,
      slug: null,
      comingSoon: true,
      description: "Coming soon.",
      badge: "Coming soon",
    });
  }

  return cards;
}

function publishedCard(
  test: LearnerMockTestSummary,
  mocksUnlocked: boolean,
): MockHubCard {
  return {
    key: test.slug,
    href: learnerMockPath(test.slug),
    title: test.title,
    slug: test.slug,
    comingSoon: false,
    description: mocksUnlocked
      ? "Click full mock test for timed practice or one section at a time."
      : "Included with Test Sprint. Tap any option to see the plan and pay.",
    badge: mocksUnlocked ? null : "Locked",
  };
}

function placeholderCard(slot: number, mocksUnlocked: boolean): MockHubCard {
  return {
    key: `mock-test-${slot}`,
    href: `/dashboard/mock-tests/mock-test-${slot}`,
    title: `Mock Test ${slot}`,
    slug: `mock-test-${slot}`,
    comingSoon: false,
    description: mocksUnlocked
      ? "Coming soon."
      : "Included with Test Sprint. Tap any option to see the plan and pay.",
    badge: mocksUnlocked ? null : "Locked",
  };
}
