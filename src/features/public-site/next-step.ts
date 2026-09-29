export type NextStepInput = {
  testDate: string | null;
  notBooked: boolean;
  target: string | null;
  worry: "Listening" | "Reading" | "Writing" | "Speaking" | null;
  firstTimer: boolean;
  speakingShortfalls: number;
  today: string;
  soonDays?: number;
};

export type NextStepCard = {
  id: string;
  body: string;
  href: string;
};

export function daysUntilTest(testDate: string, today: string): number {
  const start = Date.parse(`${today}T00:00:00Z`);
  const end = Date.parse(`${testDate}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000);
}

export function countdownLabel(days: number): string {
  if (days <= 0) return "Your test is today";
  if (days === 1) return "Your test is tomorrow";
  return `Your test is in ${days} days`;
}

export function chooseNextStep(input: NextStepInput): NextStepCard {
  const soonDays = input.soonDays ?? 7;

  if (input.testDate && !input.notBooked) {
    const days = daysUntilTest(input.testDate, input.today);
    if (days >= 0 && days < soonDays) {
      return {
        id: "test_soon",
        body: `Your test is in ${days} days. Do not learn anything new. Start here: Speaking Task 1 structure.`,
        href: "/dashboard/practice/speaking-task-1",
      };
    }
    if (days < 0) {
      return {
        id: "how_did_it_go",
        body: "How did it go?",
        href: "/dashboard/settings#results",
      };
    }
  }

  if (!input.firstTimer && input.speakingShortfalls >= 2) {
    return {
      id: "speaking_repeat",
      body: `You have been short in speaking ${input.speakingShortfalls} times. That is almost never vocabulary. Start here: the three-part shape.`,
      href: "/dashboard/mini-courses/speaking-shape",
    };
  }

  if (input.firstTimer && (input.notBooked || !input.testDate)) {
    return {
      id: "first_timer",
      body: "Before anything else, find out where you stand. Start here: your free mock test.",
      href: "/dashboard/mocks/mock-1",
    };
  }

  const worry = input.worry ?? "Speaking";
  return {
    id: "worry",
    body: `Start with ${worry}. That is the section you said worries you most.`,
    href: `/dashboard/courses/${worry.toLowerCase()}`,
  };
}

export function formatFreeEvaluations(remaining: number, baseLimit: number, grants: number): string {
  const total = baseLimit + grants;
  return `${remaining} of ${total} free evaluations left`;
}

export function allowanceReached(usedToday: number, dailyLimit: number): boolean {
  return usedToday >= dailyLimit;
}

export function nextResetLabel(timeZone: string, now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const minutesLeft = (24 - hour) * 60 - minute;
  const reset = new Date(now.getTime() + minutesLeft * 60_000);
  const time = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(reset);
  return `midnight (${time})`;
}
