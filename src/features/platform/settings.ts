// Typed settings registry. Every limit, price rule, timing default and
// refund threshold the platform reads lives here. Business code asks the
// registry for a value. It does not repeat the number.

export const SETTINGS = {
  "eval.free_total": {
    type: "number",
    default: 3,
    description: "Lifetime writing and speaking evaluations on a free account.",
  },
  "eval.daily": {
    type: "number",
    default: 10,
    description: "Test Sprint evaluations allowed per local day.",
  },
  "eval.weekly": {
    type: "number",
    default: 50,
    description: "Test Sprint evaluations allowed per local week, Monday start.",
  },
  "eval.monthly": {
    type: "number",
    default: 200,
    description: "Test Sprint evaluations allowed in the current billing period.",
  },
  "eval.week_start": {
    type: "string",
    default: "Monday",
    description: "Week boundary for the weekly evaluation cap.",
  },
  "eval.max_retries": {
    type: "number",
    default: 3,
    description: "Total model attempts before an evaluation is marked failed.",
  },
  "writing.word_min": {
    type: "number",
    default: 150,
    description: "Minimum words for a writing answer to be in range.",
  },
  "writing.word_max": {
    type: "number",
    default: 200,
    description: "Maximum words for a writing answer to be in range.",
  },
  "speaking.min_seconds": {
    type: "number",
    default: 5,
    description: "Recordings shorter than this are 'No speech detected' and do not use allowance.",
  },
  "ai.writing_prompt_version": {
    type: "string",
    default: "writing_v1",
    description: "Prompt file version stored on each writing evaluation.",
  },
  "ai.speaking_prompt_version": {
    type: "string",
    default: "speaking_v1",
    description: "Prompt file version stored on each speaking evaluation.",
  },
  "ai.model_writing": {
    type: "string",
    default: "gpt-4o-mini",
    description: "Model id used for writing evaluation.",
  },
  "ai.model_speaking": {
    type: "string",
    default: "gpt-4o-mini-audio",
    description: "Audio-capable model id used for speaking evaluation.",
  },
  "ai.price_table": {
    type: "json",
    default: {
      inputTokenCents: 0.000015,
      outputTokenCents: 0.00006,
      audioSecondCents: 0.1,
    },
    description: "Per-token and per-audio-second prices in cents CAD, used when an evaluation is stored.",
  },
  "crs.job_offer_awarded": {
    type: "boolean",
    default: false,
    description: "When false, a job offer is shown and adds zero CRS points.",
  },
  "course.included_sprint_months": {
    type: "number",
    default: 3,
    description: "Test Sprint months included with a Decoded Course purchase.",
  },
  "email.renewal_reminder_days": {
    type: "number",
    default: 3,
    description: "Days before a Sprint renewal to queue the reminder email.",
  },
  "player.autosave_seconds": {
    type: "number",
    default: 10,
    description: "How often the mock player autosaves.",
  },
  "player.grace_ms": {
    type: "number",
    default: 1500,
    description: "Network grace after a Test-mode deadline before an answer is rejected.",
  },
  "player.upload_chunk_seconds": {
    type: "number",
    default: 5,
    description: "How often a speaking recording uploads a chunk.",
  },
  "calibration.generous_alert": {
    type: "number",
    default: 0.5,
    description: "Mean signed error, in levels, above which a calibration batch is drifting generous.",
  },
  "batch.seat_cap": {
    type: "number",
    default: 8,
    description: "Maximum students in one Live Batch.",
  },
  "batch.min_to_run": {
    type: "number",
    default: 3,
    description: "Reserved seats required before a Live Batch is charged.",
  },
  "batch.release_days_before": {
    type: "number",
    default: 3,
    description: "Days before the start when an under-filled batch is released.",
  },
  "batch.transfer_hours": {
    type: "number",
    default: 48,
    description: "Hours before the first class when a cancellation can move to the next block.",
  },
  "batch.class_schedule": {
    type: "string",
    default: "Mon,Tue,Thu,Fri 19:30-20:30 America/Toronto",
    description: "Live Batch class days and wall-clock time.",
  },
  "booking.private_duration_min": {
    type: "number",
    default: 60,
    description: "Private 1:1 length in minutes.",
  },
  "booking.strategy_duration_min": {
    type: "number",
    default: 15,
    description: "Free strategy call length in minutes.",
  },
  "booking.payment_hold_minutes": {
    type: "number",
    default: 15,
    description: "How long an unpaid 1:1 hold lasts.",
  },
  "mini.max_upload_mb": {
    type: "number",
    default: 5,
    description: "Maximum HTML upload size for a mini-course lesson.",
  },
  "mini.lesson_origin": {
    type: "string",
    default: "https://lessons.celpipdecoded.com",
    description: "Origin that serves sandboxed mini-course HTML. Cookies are not shared with it.",
  },
  "video.token_ttl_minutes": {
    type: "number",
    default: 10,
    description: "Lifetime of a signed course-video playback token.",
  },
  "video.preview_seconds": {
    type: "number",
    default: 120,
    description: "How long a visitor can watch a paid lesson before the upgrade prompt.",
  },
  "lesson.completed_threshold": {
    type: "number",
    default: 0.9,
    description: "Fraction watched before a lesson counts as completed.",
  },
  "assistant.daily_cap": {
    type: "number",
    default: 20,
    description: "Student messages allowed per local day.",
  },
  "assistant.unresolved_limit": {
    type: "number",
    default: 3,
    description: "Student messages without a resolution before handover.",
  },
  "assistant.top_k": {
    type: "number",
    default: 4,
    description: "Knowledge-base entries retrieved for one question.",
  },
  "assistant.min_similarity": {
    type: "number",
    default: 0.75,
    description: "Minimum cosine similarity before a knowledge-base entry may be used.",
  },
  "assistant.enabled": {
    type: "boolean",
    default: true,
    description: "Turns the AI assistant on or off without a deploy.",
  },
  "loop.ws_window": {
    type: "number",
    default: 3,
    description: "How many recent writing or speaking evaluations to inspect.",
  },
  "loop.ws_hits": {
    type: "number",
    default: 2,
    description: "How many of those evaluations must share the same lowest criterion.",
  },
  "loop.rl_accuracy_below": {
    type: "number",
    default: 60,
    description: "Reading or listening accuracy, in percent, below which a question type is a pattern.",
  },
  "loop.rl_min_questions": {
    type: "number",
    default: 8,
    description: "Minimum answered questions before a reading or listening pattern counts.",
  },
  "loop.expire_days": {
    type: "number",
    default: 30,
    description: "Days before an unfinished prescription expires.",
  },
  "loop.rl_set_size": {
    type: "number",
    default: 10,
    description: "Same-tag questions in a re-practice set.",
  },
  "loop.after_window": {
    type: "number",
    default: 3,
    description: "Evaluations after a mini-course used for the after level.",
  },
  "cohort.min_n": {
    type: "number",
    default: 10,
    description: "Proved prescriptions required before a cohort row is judged.",
  },
  "rate.signin_ip": {
    type: "number",
    default: 10,
    description: "Sign-in attempts allowed per IP per 15 minutes.",
  },
  "rate.signin_email": {
    type: "number",
    default: 5,
    description: "Sign-in attempts allowed per email per 15 minutes.",
  },
  "rate.verify_attempts": {
    type: "number",
    default: 5,
    description: "Wrong verification codes before the code is invalidated.",
  },
  "rate.verify_resend_seconds": {
    type: "number",
    default: 60,
    description: "Minimum seconds between verification resends.",
  },
  "rate.verify_resend_per_hour": {
    type: "number",
    default: 5,
    description: "Maximum verification resends per email per hour.",
  },
  "rate.checkout_per_hour": {
    type: "number",
    default: 10,
    description: "Checkout sessions one user may create per hour.",
  },
  "rate.eval_submit_per_hour": {
    type: "number",
    default: 30,
    description: "Evaluation submits one user may make per hour, separate from allowance.",
  },
  "rate.assistant_burst_per_minute": {
    type: "number",
    default: 10,
    description: "Assistant messages one user may send per minute.",
  },
  "media.signed_url_ttl_minutes": {
    type: "number",
    default: 15,
    description: "Lifetime of a signed audio, PDF or attachment URL.",
  },
  "backup.retention_days": {
    type: "number",
    default: 35,
    description: "How long database backups are kept.",
  },
  "retake.reminder_days": {
    type: "number",
    default: 10,
    description: "Days after a mock before the retake reminder.",
  },
  "retention.audio_days": {
    type: "number",
    default: 90,
    description: "Days a speaking recording is kept.",
  },
  "retention.draft_days": {
    type: "number",
    default: 14,
    description: "Days an abandoned draft is kept.",
  },
  "review.auto_send": {
    type: "boolean",
    default: false,
    description: "Whether review requests send automatically.",
  },
  "review.reminder_days": {
    type: "number",
    default: 3,
    description: "Days before a review reminder.",
  },
  "review.token_expiry_days": {
    type: "number",
    default: 60,
    description: "Days a review link stays valid.",
  },
} as const;

type Widen<T> =
  T extends number ? number : T extends boolean ? boolean : T extends string ? string : T;

export type SettingsKey = keyof typeof SETTINGS;

export type SettingsMap = {
  [K in SettingsKey]: Widen<(typeof SETTINGS)[K]["default"]>;
};

export type PriceTable = {
  inputTokenCents: number;
  outputTokenCents: number;
  audioSecondCents: number;
};

export function defaultSettings(): SettingsMap {
  const values = {} as SettingsMap;
  for (const key of Object.keys(SETTINGS) as SettingsKey[]) {
    (values as Record<string, unknown>)[key] = SETTINGS[key].default;
  }
  return values;
}

export type SettingsAudit = {
  key: string;
  oldValue: unknown;
  newValue: unknown;
  updatedBy: string;
  updatedAt: string;
};

export function applySettingChange(
  current: SettingsMap,
  key: SettingsKey,
  newValue: unknown,
  updatedBy: string,
  now: Date,
): { next: SettingsMap; audit: SettingsAudit } {
  const spec = SETTINGS[key];
  if (spec.type === "number" && typeof newValue !== "number") {
    throw new Error(`Setting ${key} must be a number.`);
  }
  if (spec.type === "boolean" && typeof newValue !== "boolean") {
    throw new Error(`Setting ${key} must be a boolean.`);
  }
  if (spec.type === "string" && typeof newValue !== "string") {
    throw new Error(`Setting ${key} must be a string.`);
  }
  if (spec.type === "json" && (typeof newValue !== "object" || newValue === null)) {
    throw new Error(`Setting ${key} must be an object.`);
  }

  return {
    next: { ...current, [key]: newValue } as SettingsMap,
    audit: {
      key,
      oldValue: current[key],
      newValue,
      updatedBy,
      updatedAt: now.toISOString(),
    },
  };
}

const STALE_MS = 60_000;

export function createSettingsCache(clock: () => number) {
  let cached: { at: number; values: SettingsMap } | null = null;

  return {
    read(load: () => SettingsMap): SettingsMap {
      const now = clock();
      if (!cached || now - cached.at >= STALE_MS) {
        cached = { at: now, values: load() };
      }
      return cached.values;
    },
    ageMs(): number | null {
      if (!cached) return null;
      return clock() - cached.at;
    },
  };
}

export function costCents(
  usage: { inputTokens?: number; outputTokens?: number; audioSeconds?: number },
  priceTable: PriceTable,
): number {
  const raw =
    (usage.inputTokens ?? 0) * priceTable.inputTokenCents +
    (usage.outputTokens ?? 0) * priceTable.outputTokenCents +
    (usage.audioSeconds ?? 0) * priceTable.audioSecondCents;
  return Math.max(0, Math.round(raw));
}
