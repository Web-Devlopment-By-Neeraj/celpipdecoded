export type RateBucket = { count: number; resetAt: number };

export function consumeRateLimit(
  buckets: Map<string, RateBucket>,
  key: string,
  limit: number,
  now: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (current.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  current.count += 1;
  return { allowed: true, remaining: limit - current.count };
}

export function audioTooLong(seconds: number, recordSeconds: number, tolerance: number): boolean {
  return seconds > recordSeconds + tolerance;
}

export type DemoFeedback = {
  overallLevel: number;
  unlocked: { name: string; body: string }[];
  locked: string[];
  practiceEstimate: true;
};

export function buildDemoFeedback(secondsSpoken: number): DemoFeedback {
  const overall = secondsSpoken >= 60 ? 8 : secondsSpoken >= 30 ? 7 : 6;
  return {
    overallLevel: overall,
    practiceEstimate: true,
    unlocked: [
      {
        name: "Overall practice estimate",
        body: `Practice estimate ${overall}. This is from the take you submitted, not an official result.`,
      },
      {
        name: "Content and Coherence",
        body: "The answer has a start, a middle and an end. Add one more specific detail to move up.",
      },
    ],
    locked: [
      "Vocabulary",
      "Listenability",
      "Task Fulfilment",
      "Transcript",
      "Top mistakes",
      "Rewrites",
      "Pronunciation notes",
    ],
  };
}

export function newClaimToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");
}
