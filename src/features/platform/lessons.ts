// Mini-course sandbox. Lessons run on another origin, inside an iframe
// that cannot read the parent session. Report-back is one message shape.

export const LESSON_IFRAME_SANDBOX = "allow-scripts";

export const LESSON_MESSAGE_TYPE = "celpip-lesson";

export type LessonEventName = "start" | "drill" | "finish";

export type LessonMessage = {
  type: typeof LESSON_MESSAGE_TYPE;
  version: 1;
  event: LessonEventName;
  lesson_id: string;
  drill_id?: string;
  score?: number;
  max_score?: number;
};

export function lessonContentSecurityPolicy(frameAncestor: string): string {
  return [
    "default-src 'self'",
    "connect-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    `frame-ancestors ${frameAncestor}`,
  ].join("; ");
}

export function parseLessonMessage(
  data: unknown,
  origin: string,
  expectedOrigin: string,
): { ok: true; message: LessonMessage } | { ok: false; reason: string } {
  if (origin !== expectedOrigin) return { ok: false, reason: "origin" };
  if (!data || typeof data !== "object") return { ok: false, reason: "shape" };
  const record = data as Record<string, unknown>;
  if (record.type !== LESSON_MESSAGE_TYPE || record.version !== 1) {
    return { ok: false, reason: "shape" };
  }
  if (record.event !== "start" && record.event !== "drill" && record.event !== "finish") {
    return { ok: false, reason: "event" };
  }
  if (typeof record.lesson_id !== "string" || record.lesson_id.length === 0) {
    return { ok: false, reason: "lesson" };
  }
  if (
    (record.event === "drill" || record.event === "finish") &&
    typeof record.score !== "number"
  ) {
    return { ok: false, reason: "score" };
  }
  return {
    ok: true,
    message: {
      type: LESSON_MESSAGE_TYPE,
      version: 1,
      event: record.event,
      lesson_id: record.lesson_id,
      drill_id: typeof record.drill_id === "string" ? record.drill_id : undefined,
      score: typeof record.score === "number" ? record.score : undefined,
      max_score: typeof record.max_score === "number" ? record.max_score : undefined,
    },
  };
}

export type MiniEvent = {
  userId: string;
  miniCourseId: string;
  kind: LessonEventName;
  score: number | null;
  drillId: string | null;
  sessionId: string;
};

export function recordLessonMessages(input: {
  messages: LessonMessage[];
  userId: string;
  sessionId: string;
  maxMessages: number;
}): MiniEvent[] {
  const events: MiniEvent[] = [];
  let started = false;
  for (const message of input.messages.slice(0, input.maxMessages)) {
    if (message.event === "start") {
      if (started) continue;
      started = true;
    }
    events.push({
      userId: input.userId,
      miniCourseId: message.lesson_id,
      kind: message.event,
      score: message.score ?? null,
      drillId: message.drill_id ?? null,
      sessionId: input.sessionId,
    });
  }
  return events;
}

export function validateLessonHtml(
  html: string,
  maxMb: number,
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const bytes = new TextEncoder().encode(html).length;
  if (bytes > maxMb * 1024 * 1024) errors.push("File is larger than the upload limit.");
  if (!html.includes("<html") && !html.includes("<HTML")) {
    errors.push("Upload a single HTML file.");
  }
  if (!html.includes("CelpipLesson")) {
    warnings.push("This lesson does not call CelpipLesson. Students will not get credit for finishing it.");
  }
  if (/<script[^>]+src=["']https?:\/\//i.test(html)) {
    warnings.push("External scripts are blocked by the lesson content security policy.");
  }
  return { errors, warnings };
}

export function signLessonToken(lessonId: string, expiresAt: Date, userId: string): string {
  return `${lessonId}.${userId}.${expiresAt.getTime()}`;
}

export function lessonTokenValid(token: string, now: Date): boolean {
  const expires = Number(token.split(".").at(-1));
  return Number.isFinite(expires) && now.getTime() <= expires;
}
