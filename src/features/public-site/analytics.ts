// Event names from the build pack. Callers pass a source or context
// and this helper builds the payload the analytics route stores.

export const ANALYTICS_EVENTS = [
  "signup_started",
  "gate_shown",
  "gate_dismissed",
  "evaluation_submitted",
  "diagnostic_completed",
  "lesson_played",
  "draws_filtered",
  "question_asked",
  "batch_reserved",
  "checkout_started",
  "review_submitted",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsPayload = {
  name: AnalyticsEventName;
  props: Record<string, string | number | boolean>;
};

export function buildAnalyticsEvent(
  name: AnalyticsEventName,
  props: Record<string, string | number | boolean> = {},
): AnalyticsPayload {
  return { name, props };
}

export function signupStarted(source: string): AnalyticsPayload {
  return buildAnalyticsEvent("signup_started", { source });
}
