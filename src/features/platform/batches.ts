// Live Batch reserve-and-charge. A saved card is not a charge. The third
// reservation charges everyone. An under-filled batch is released, not billed.

export type BatchStatus = "open" | "confirming" | "confirmed" | "not_running" | "completed";
export type SeatStatus = "reserved" | "charged" | "released" | "refunded" | "payment_failed";

export type Batch = {
  id: string;
  startsOn: Date;
  seatCap: number;
  minToRun: number;
  status: BatchStatus;
  zoomLink: string;
};

export type BatchSeat = {
  id: string;
  batchId: string;
  userId: string;
  status: SeatStatus;
  method: "card" | "interac";
  purchaseId: string | null;
};

export type BatchState = {
  batches: Batch[];
  seats: BatchSeat[];
  charges: string[];
  emails: string[];
  events: string[];
  refundTasks: string[];
  processedWebhooks: Set<string>;
};

export function countTowardMinimum(seats: BatchSeat[], batchId: string): number {
  return seats.filter(
    (seat) =>
      seat.batchId === batchId &&
      (seat.status === "reserved" || seat.status === "charged"),
  ).length;
}

export function reserveSeat(
  state: BatchState,
  input: { batchId: string; userId: string; webhookId: string; seatId: string },
): { state: BatchState; error?: string } {
  if (state.processedWebhooks.has(input.webhookId)) return { state };
  const batch = state.batches.find((item) => item.id === input.batchId);
  if (!batch || (batch.status !== "open" && batch.status !== "confirmed")) {
    return { state, error: "This batch is not open." };
  }
  const taken = state.seats.filter(
    (seat) => seat.batchId === batch.id && seat.status !== "released" && seat.status !== "refunded",
  );
  if (taken.some((seat) => seat.userId === input.userId)) {
    return { state, error: "You already have a seat." };
  }
  if (taken.length >= batch.seatCap) {
    return { state, error: "This batch is full. Join the next block." };
  }

  const next: BatchState = {
    ...state,
    batches: state.batches.map((item) => ({ ...item })),
    seats: [...state.seats],
    charges: [...state.charges],
    emails: [...state.emails],
    events: [...state.events, "batch_reserved"],
    refundTasks: [...state.refundTasks],
    processedWebhooks: new Set(state.processedWebhooks).add(input.webhookId),
  };

  const chargeNow = batch.status === "confirmed";
  next.seats.push({
    id: input.seatId,
    batchId: batch.id,
    userId: input.userId,
    status: chargeNow ? "charged" : "reserved",
    method: "card",
    purchaseId: chargeNow ? `pur_${input.seatId}` : null,
  });
  next.emails.push(chargeNow ? `charged:${input.userId}` : `seat-reserved:${input.userId}`);
  if (chargeNow) next.charges.push(input.seatId);

  const filled = countTowardMinimum(next.seats, batch.id);
  if (batch.status === "open" && filled >= batch.minToRun) {
    return { state: confirmBatch(next, batch.id) };
  }
  return { state: next };
}

export function confirmBatch(state: BatchState, batchId: string): BatchState {
  const next: BatchState = {
    ...state,
    batches: state.batches.map((batch) =>
      batch.id === batchId ? { ...batch, status: "confirmed" } : batch,
    ),
    seats: state.seats.map((seat) => ({ ...seat })),
    charges: [...state.charges],
    emails: [...state.emails, "batch-confirmed"],
    events: [...state.events, "batch_confirmed"],
    refundTasks: [...state.refundTasks],
    processedWebhooks: state.processedWebhooks,
  };
  for (const seat of next.seats) {
    if (seat.batchId === batchId && seat.status === "reserved" && seat.method === "card") {
      seat.status = "charged";
      seat.purchaseId = `pur_${seat.id}`;
      next.charges.push(seat.id);
    }
  }
  return next;
}

export function markChargeFailed(state: BatchState, seatId: string): BatchState {
  return {
    ...state,
    seats: state.seats.map((seat) =>
      seat.id === seatId ? { ...seat, status: "payment_failed", purchaseId: null } : seat,
    ),
    charges: state.charges.filter((id) => id !== seatId),
    emails: [...state.emails, `payment-link:${seatId}`],
    events: state.events,
    batches: state.batches,
    refundTasks: state.refundTasks,
    processedWebhooks: state.processedWebhooks,
  };
}

export function releaseUnderfilled(
  state: BatchState,
  now: Date,
  releaseDaysBefore: number,
  nextBatchId: string | null,
): BatchState {
  const next: BatchState = {
    ...state,
    batches: state.batches.map((batch) => ({ ...batch })),
    seats: state.seats.map((seat) => ({ ...seat })),
    charges: [...state.charges],
    emails: [...state.emails],
    events: [...state.events],
    refundTasks: [...state.refundTasks],
    processedWebhooks: state.processedWebhooks,
  };
  for (const batch of next.batches) {
    if (batch.status !== "open") continue;
    const days = (batch.startsOn.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
    if (days > releaseDaysBefore) continue;
    const filled = countTowardMinimum(next.seats, batch.id);
    if (filled >= batch.minToRun) continue;
    batch.status = "not_running";
    next.events.push("batch_released");
    for (const seat of next.seats) {
      if (seat.batchId !== batch.id) continue;
      if (seat.method === "interac" && seat.status === "charged") {
        seat.status = "refunded";
        next.refundTasks.push(seat.id);
      } else if (seat.status === "reserved" || seat.status === "charged") {
        seat.status = "released";
        next.emails.push(`not-running:${seat.userId}:${nextBatchId ?? "none"}`);
      }
    }
  }
  return next;
}

export function cancelSeat(
  state: BatchState,
  seatId: string,
  now: Date,
  transferHours: number,
  nextBatch: Batch | null,
): { state: BatchState; moved: boolean } {
  const seat = state.seats.find((item) => item.id === seatId);
  const batch = state.batches.find((item) => item.id === seat?.batchId);
  if (!seat || !batch) return { state, moved: false };
  const hours = (batch.startsOn.getTime() - now.getTime()) / (60 * 60 * 1000);
  if (hours <= transferHours || !nextBatch) return { state, moved: false };
  const moved: BatchSeat = {
    ...seat,
    id: `${seat.id}-moved`,
    batchId: nextBatch.id,
  };
  return {
    moved: true,
    state: {
      ...state,
      seats: state.seats
        .map((item) => (item.id === seat.id ? { ...item, status: "released" as const } : item))
        .concat(moved),
    },
  };
}

export function addInteracSeat(state: BatchState, seat: BatchSeat): BatchState {
  return { ...state, seats: [...state.seats, { ...seat, method: "interac", status: "charged" }] };
}
