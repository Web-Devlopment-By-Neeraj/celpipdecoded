// Shared copy and decisions for the Avinash and Sahil surfaces that do not
// need a live payment, calendar, or email provider.

export const QUESTION_TYPE_LABELS = [
  "Short conversation",
  "Problem and solution",
  "Daily life talk",
  "News item",
  "Discussion",
  "Viewpoints",
  "Email reply",
  "Survey response",
  "Speaking: describe a scene",
  "Speaking: personal experience",
  "Speaking: describe a picture",
  "Speaking: make a prediction",
  "Speaking: compare and persuade",
  "Speaking: difficult situation",
  "Speaking: express opinions",
  "Speaking: unusual situation",
] as const;

export const ANALYTICS_EVENTS = [
  "signup_started",
  "signup_completed",
  "crs_calculated",
  "diagnostic_completed",
  "checkout_started",
  "purchase_completed",
  "allowance_reached",
  "batch_reserved",
  "batch_confirmed",
  "batch_released",
  "lesson_played",
  "mini_started",
  "mini_finished",
  "prescription_created",
  "prescription_proved",
  "assistant_handover",
  "review_submitted",
] as const;

export type EmailDraft = {
  subject: string;
  body: string;
};

export function seatReservedEmail(batchName: string): EmailDraft {
  return {
    subject: `Seat reserved for ${batchName}`,
    body: "Your seat is reserved. Nothing is charged yet. We will email you again if the class is confirmed.",
  };
}

export function batchConfirmedEmail(batchName: string, when: string): EmailDraft {
  return {
    subject: `${batchName} is confirmed`,
    body: `The class will run. Join details are in your account. First session: ${when}.`,
  };
}

export function renewalReminderEmail(planName: string, renewsOn: string): EmailDraft {
  return {
    subject: `${planName} renews on ${renewsOn}`,
    body: `Your ${planName} renews on ${renewsOn}. This reminder is about billing, not a practice estimate. You can cancel in account settings before that date.`,
  };
}

export function refundDecision(
  hoursBeforeStart: number,
  transferHours: number,
): "move_to_next_block" | "no_refund" {
  if (hoursBeforeStart >= transferHours) return "move_to_next_block";
  return "no_refund";
}

export function formatCad(cents: number): string {
  return `$${(cents / 100).toFixed(2)} CAD`;
}
