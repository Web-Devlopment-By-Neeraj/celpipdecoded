// Evaluation allowance. Limits come from settings. A slot is reserved
// under a per-user lock so two submits cannot spend the last evaluation
// twice. Failed and no-speech results release the slot.

import {
  addMonths,
  nextZonedMidnight,
  nextZonedMonday,
  startOfZonedDay,
  startOfZonedWeek,
  timeZoneName,
} from "./time";

export type AllowancePlan = "free" | "sprint";

export type CompletedEvaluation = {
  completedAt: Date;
  status: "done" | "failed" | "no_speech";
};

export type AllowanceLimits = {
  freeTotal: number;
  daily: number;
  weekly: number;
  monthly: number;
  extraCount: number;
};

export type BillingPeriod = {
  start: Date;
  end: Date;
} | null;

export function coursePeriod(
  purchaseAt: Date,
  now: Date,
  monthsIncluded: number,
): BillingPeriod {
  const endAll = addMonths(purchaseAt, monthsIncluded);
  if (now.getTime() >= endAll.getTime()) return null;
  let start = purchaseAt;
  while (true) {
    const end = addMonths(start, 1);
    if (now.getTime() < end.getTime()) return { start, end };
    start = end;
  }
}

export function countInWindow(
  events: CompletedEvaluation[],
  start: Date,
  end: Date,
): number {
  return events.filter(
    (event) =>
      event.status === "done" &&
      event.completedAt.getTime() >= start.getTime() &&
      event.completedAt.getTime() < end.getTime(),
  ).length;
}

export type AllowanceSnapshot = {
  plan: AllowancePlan;
  leftToday: number | null;
  leftThisWeek: number | null;
  leftThisMonth: number | null;
  leftTotal: number | null;
  waitingCount: number;
  blockedBy: "day" | "week" | "month" | "free" | null;
  resetAt: Date | null;
  resetLabel: string;
};

export function allowanceSnapshot(input: {
  plan: AllowancePlan;
  limits: AllowanceLimits;
  events: CompletedEvaluation[];
  reserved: number;
  waitingCount: number;
  now: Date;
  timeZone: string;
  period: BillingPeriod;
}): AllowanceSnapshot {
  const dayStart = startOfZonedDay(input.now, input.timeZone);
  const dayEnd = nextZonedMidnight(input.now, input.timeZone);
  const weekStart = startOfZonedWeek(input.now, input.timeZone);
  const weekEnd = nextZonedMonday(input.now, input.timeZone);
  const zone = timeZoneName(input.now, input.timeZone);

  if (input.plan === "free") {
    const used = input.events.filter((event) => event.status === "done").length + input.reserved;
    const total = input.limits.freeTotal + input.limits.extraCount;
    const left = Math.max(0, total - used);
    return {
      plan: "free",
      leftToday: null,
      leftThisWeek: null,
      leftThisMonth: null,
      leftTotal: left,
      waitingCount: input.waitingCount,
      blockedBy: left === 0 ? "free" : null,
      resetAt: null,
      resetLabel: `${left} of ${total} free evaluations left`,
    };
  }

  const usedToday =
    countInWindow(input.events, dayStart, dayEnd) + input.reserved;
  const usedWeek = countInWindow(input.events, weekStart, weekEnd) + input.reserved;
  const period = input.period ?? { start: dayStart, end: dayEnd };
  const usedPeriod =
    countInWindow(input.events, period.start, period.end) + input.reserved;
  const leftToday = Math.max(0, input.limits.daily - usedToday);
  const leftWeek = Math.max(0, input.limits.weekly - usedWeek);
  const leftMonth = Math.max(
    0,
    input.limits.monthly + input.limits.extraCount - usedPeriod,
  );

  let blockedBy: AllowanceSnapshot["blockedBy"] = null;
  let resetAt: Date | null = null;
  if (leftToday === 0) {
    blockedBy = "day";
    resetAt = dayEnd;
  } else if (leftWeek === 0) {
    blockedBy = "week";
    resetAt = weekEnd;
  } else if (leftMonth === 0) {
    blockedBy = "month";
    resetAt = period.end;
  }

  const resetLabel = resetAt
    ? `You have used today's evaluations. They reset at 12:00 AM (${zone}).`
    : `${leftToday} left today`;

  return {
    plan: "sprint",
    leftToday,
    leftThisWeek: leftWeek,
    leftThisMonth: leftMonth,
    leftTotal: null,
    waitingCount: input.waitingCount,
    blockedBy,
    resetAt,
    resetLabel,
  };
}

export type SlotState = {
  committed: number;
  reserved: number;
};

export function tryReserve(
  snapshot: AllowanceSnapshot,
  slots: SlotState,
): { ok: boolean; slots: SlotState; blockedBy: AllowanceSnapshot["blockedBy"] } {
  if (snapshot.blockedBy) {
    return { ok: false, slots, blockedBy: snapshot.blockedBy };
  }
  return {
    ok: true,
    slots: { ...slots, reserved: slots.reserved + 1 },
    blockedBy: null,
  };
}

export function commitSlot(slots: SlotState): SlotState {
  return {
    reserved: Math.max(0, slots.reserved - 1),
    committed: slots.committed + 1,
  };
}

export function releaseSlot(slots: SlotState): SlotState {
  return { ...slots, reserved: Math.max(0, slots.reserved - 1) };
}

export function createUserLock() {
  const tails = new Map<string, Promise<unknown>>();
  return function locked<T>(userId: string, fn: () => Promise<T>): Promise<T> {
    const previous = tails.get(userId) ?? Promise.resolve();
    const run = previous.then(fn, fn);
    tails.set(
      userId,
      run.then(
        () => undefined,
        () => undefined,
      ),
    );
    return run;
  };
}

export type SubmissionStatus =
  | "queued"
  | "waiting_allowance"
  | "done"
  | "failed"
  | "no_speech";

export type QueuedSubmission = {
  id: string;
  userId: string;
  createdAt: Date;
  status: SubmissionStatus;
  taskType: string;
};

export function placeSubmission(
  allowed: boolean,
  submission: QueuedSubmission,
): QueuedSubmission {
  return {
    ...submission,
    status: allowed ? "queued" : "waiting_allowance",
  };
}

export function dispatchWaiting(
  submissions: QueuedSubmission[],
  slotsLeft: number,
): { submissions: QueuedSubmission[]; dispatched: string[] } {
  const dispatched = submissions
    .filter((item) => item.status === "waiting_allowance")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, Math.max(0, slotsLeft))
    .map((item) => item.id);
  const chosen = new Set(dispatched);
  return {
    submissions: submissions.map((item) =>
      chosen.has(item.id) ? { ...item, status: "queued" as const } : item,
    ),
    dispatched,
  };
}

export function sectionNeedsNotice(taskCount: number, leftToday: number | null): string {
  const left = leftToday === null ? "your free" : String(leftToday);
  return `This section needs ${taskCount} evaluations. You have ${left} left today.`;
}
