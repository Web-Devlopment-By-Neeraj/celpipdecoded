import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { googleBusy, googleCalendarConfigured, createGoogleMeeting } from "@/features/booking/google-calendar";
import {
  CHECKOUT_HOLD_MINUTES,
  HOLD_MINUTES,
  openSlots,
  sessionEnd,
  settlementForSlot,
  type BusyInterval,
} from "@/features/booking/private-session";

export type BookingStatus = "held" | "confirmed" | "cancelled" | "needs_slot";

export type PrivateBooking = {
  id: string;
  userId: string;
  startsAt: string | null;
  endsAt: string | null;
  status: BookingStatus;
  heldUntil: string | null;
  stripeSessionId: string | null;
  meetUrl: string | null;
};

type BookingRow = {
  id: string;
  user_id: string;
  starts_at: string | null;
  ends_at: string | null;
  status: BookingStatus;
  held_until: string | null;
  stripe_session_id: string | null;
  meet_url: string | null;
};

function mapRow(row: BookingRow): PrivateBooking {
  return {
    id: row.id,
    userId: row.user_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    heldUntil: row.held_until,
    stripeSessionId: row.stripe_session_id,
    meetUrl: row.meet_url,
  };
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

function conflictMessage(
  error: { code?: string; message?: string; details?: string } | null,
  fallback: string,
): string {
  const text = `${error?.message ?? ""} ${error?.details ?? ""}`;
  if (text.includes("private_session_one_hold")) {
    return "You already have a time held. Pay for it or pick it again.";
  }
  if (isUniqueViolation(error)) return "That time was just taken. Pick another one.";
  return fallback;
}

export async function privateBookingStorageError(): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("private_session_bookings").select("id").limit(1);
    if (!error) return null;
    return "Booking is not ready yet. The database update still needs to be applied.";
  } catch (err) {
    console.error("1:1 booking storage could not be read:", err);
    return "Booking is not ready yet. The database update still needs to be applied.";
  }
}

export async function releaseExpiredHolds(now = new Date()): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("private_session_bookings")
    .update({ status: "cancelled", updated_at: now.toISOString() })
    .eq("status", "held")
    .lt("held_until", now.toISOString());
}

async function activeBusy(now: Date): Promise<BusyInterval[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("private_session_bookings")
    .select("starts_at, ends_at, status, held_until")
    .in("status", ["held", "confirmed"]);

  const busy: BusyInterval[] = [];
  for (const row of data ?? []) {
    if (!row.starts_at || !row.ends_at) continue;
    if (row.status === "held" && row.held_until && new Date(row.held_until).getTime() <= now.getTime()) {
      continue;
    }
    busy.push({ start: new Date(row.starts_at), end: new Date(row.ends_at) });
  }
  return busy;
}

export async function listOpenPrivateSlots(now = new Date()): Promise<Date[]> {
  await releaseExpiredHolds(now);
  const ours = await activeBusy(now);
  const candidates = openSlots(now, ours);
  if (!googleCalendarConfigured() || candidates.length === 0) return candidates;
  const rangeEnd = sessionEnd(candidates[candidates.length - 1]);
  const external = await googleBusy(candidates[0], rangeEnd);
  return openSlots(now, [...ours, ...external]);
}

export async function bookingForUser(userId: string): Promise<PrivateBooking | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("private_session_bookings")
    .select("id, user_id, starts_at, ends_at, status, held_until, stripe_session_id, meet_url")
    .eq("user_id", userId)
    .in("status", ["held", "confirmed", "needs_slot"])
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as BookingRow[];
  const confirmed = rows.find(
    (row) => row.status === "confirmed" && row.ends_at && new Date(row.ends_at).getTime() > Date.now(),
  );
  if (confirmed) return mapRow(confirmed);
  const credit = rows.find((row) => row.status === "needs_slot");
  if (credit) return mapRow(credit);
  const held = rows.find(
    (row) => row.status === "held" && row.held_until && new Date(row.held_until).getTime() > Date.now(),
  );
  return held ? mapRow(held) : null;
}

async function slotTaken(startsAt: Date, exceptId?: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("private_session_bookings")
    .select("id, status, held_until")
    .eq("starts_at", startsAt.toISOString())
    .in("status", ["held", "confirmed"]);
  return (data ?? []).some((row) => {
    if (exceptId && row.id === exceptId) return false;
    if (row.status === "confirmed") return true;
    return row.held_until && new Date(row.held_until).getTime() > Date.now();
  });
}

export async function holdPrivateSlot(
  userId: string,
  startsAt: Date,
  studentEmail: string | null = null,
  now = new Date(),
): Promise<{ ok: true; booking: PrivateBooking } | { ok: false; error: string }> {
  await releaseExpiredHolds(now);
  const current = await bookingForUser(userId);
  if (
    current?.status === "held" &&
    current.startsAt &&
    new Date(current.startsAt).getTime() === startsAt.getTime()
  ) {
    return { ok: true, booking: current };
  }
  if (current?.status === "confirmed") {
    return { ok: false, error: "You already have a 1:1 booked." };
  }
  if (current?.status === "needs_slot") {
    return claimPaidSlot(userId, startsAt, studentEmail, now);
  }
  if (!studentEmail) {
    return {
      ok: false,
      error: "Add an email to your account before booking. Amar needs it for the meeting.",
    };
  }

  const allowed = (await listOpenPrivateSlots(now)).some(
    (slot) => slot.getTime() === startsAt.getTime(),
  );
  if (!allowed) {
    return { ok: false, error: "That time is not open. Pick another one." };
  }

  const supabase = getSupabaseAdmin();
  if (current?.status === "held") {
    await supabase
      .from("private_session_bookings")
      .update({ status: "cancelled", updated_at: now.toISOString() })
      .eq("id", current.id)
      .eq("status", "held");
  }

  const endsAt = sessionEnd(startsAt);
  const heldUntil = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);
  const { data, error } = await supabase
    .from("private_session_bookings")
    .insert({
      user_id: userId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "held",
      held_until: heldUntil.toISOString(),
      updated_at: now.toISOString(),
    })
    .select("id, user_id, starts_at, ends_at, status, held_until, stripe_session_id, meet_url")
    .single();

  if (error || !data) {
    return { ok: false, error: conflictMessage(error, "The time could not be held. Try again.") };
  }

  return { ok: true, booking: mapRow(data as BookingRow) };
}

export async function claimPaidSlot(
  userId: string,
  startsAt: Date,
  studentEmail: string | null = null,
  now = new Date(),
): Promise<{ ok: true; booking: PrivateBooking } | { ok: false; error: string }> {
  await releaseExpiredHolds(now);
  const current = await bookingForUser(userId);
  if (current?.status !== "needs_slot") {
    return { ok: false, error: "Choose a time and pay before it is yours." };
  }
  const allowed = (await listOpenPrivateSlots(now)).some(
    (slot) => slot.getTime() === startsAt.getTime(),
  );
  if (!allowed || (await slotTaken(startsAt, current.id))) {
    return { ok: false, error: "That time is not open. Pick another one." };
  }

  const endsAt = sessionEnd(startsAt);
  const meeting = await createGoogleMeeting({
    bookingId: current.id,
    startsAt,
    endsAt,
    studentEmail,
  });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("private_session_bookings")
    .update({
      status: "confirmed",
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      held_until: null,
      google_event_id: meeting.eventId,
      meet_url: meeting.meetUrl,
      updated_at: now.toISOString(),
    })
    .eq("id", current.id)
    .eq("status", "needs_slot")
    .select("id, user_id, starts_at, ends_at, status, held_until, stripe_session_id, meet_url")
    .single();

  if (error || !data) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: "That time was just taken. Pick another one." };
    }
    return { ok: false, error: "The time could not be saved. Try again." };
  }
  return { ok: true, booking: mapRow(data as BookingRow) };
}

export async function extendHoldForCheckout(
  userId: string,
  bookingId: string,
  stripeSessionId: string,
  now = new Date(),
): Promise<{ ok: true } | { ok: false; error: string }> {
  await releaseExpiredHolds(now);
  const supabase = getSupabaseAdmin();
  const heldUntil = new Date(now.getTime() + CHECKOUT_HOLD_MINUTES * 60 * 1000);
  const { data, error } = await supabase
    .from("private_session_bookings")
    .update({
      held_until: heldUntil.toISOString(),
      stripe_session_id: stripeSessionId,
      updated_at: now.toISOString(),
    })
    .eq("id", bookingId)
    .eq("user_id", userId)
    .eq("status", "held")
    .gt("held_until", now.toISOString())
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "The hold expired. Pick the time again." };
  }
  return { ok: true };
}

export async function settlePaidBooking(input: {
  userId: string;
  bookingId?: string | null;
  stripeSessionId: string;
  purchaseId?: string | null;
  studentEmail?: string | null;
}): Promise<"confirmed" | "needs_slot" | null> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("private_session_bookings")
    .select("id, user_id, starts_at, ends_at, status, held_until, stripe_session_id, meet_url");
  if (input.bookingId) query = query.eq("id", input.bookingId);
  else query = query.eq("stripe_session_id", input.stripeSessionId);
  const { data } = await query.maybeSingle();
  const row = data as BookingRow | null;
  if (!row || row.user_id !== input.userId) return null;
  if (row.status === "confirmed") return "confirmed";
  if (row.status === "needs_slot") return "needs_slot";
  if (!row.starts_at || !row.ends_at) return null;

  const startsAt = new Date(row.starts_at);
  const taken = await slotTaken(startsAt, row.id);
  const owner = taken ? "taken" : row.status === "held" ? "mine" : "free";
  const outcome = settlementForSlot(owner);
  const now = new Date().toISOString();

  if (outcome === "needs_slot") {
    await supabase
      .from("private_session_bookings")
      .update({
        status: "needs_slot",
        starts_at: null,
        ends_at: null,
        held_until: null,
        stripe_session_id: input.stripeSessionId,
        purchase_id: input.purchaseId ?? null,
        updated_at: now,
      })
      .eq("id", row.id);
    return "needs_slot";
  }

  const meeting = await createGoogleMeeting({
    bookingId: row.id,
    startsAt,
    endsAt: new Date(row.ends_at),
    studentEmail: input.studentEmail ?? null,
  });
  const { error } = await supabase
    .from("private_session_bookings")
    .update({
      status: "confirmed",
      held_until: null,
      stripe_session_id: input.stripeSessionId,
      purchase_id: input.purchaseId ?? null,
      google_event_id: meeting.eventId,
      meet_url: meeting.meetUrl,
      updated_at: now,
    })
    .eq("id", row.id);

  if (isUniqueViolation(error)) {
    await supabase
      .from("private_session_bookings")
      .update({
        status: "needs_slot",
        starts_at: null,
        ends_at: null,
        held_until: null,
        stripe_session_id: input.stripeSessionId,
        purchase_id: input.purchaseId ?? null,
        updated_at: now,
      })
      .eq("id", row.id);
    return "needs_slot";
  }

  return "confirmed";
}
