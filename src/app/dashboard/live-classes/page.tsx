import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppPageShell } from "@/components/app/AppPageShell";
import { PrivateSessionBooker, type BookableDay, type MyPrivateSession } from "@/components/booking/PrivateSessionBooker";
import { bookingForUser, listOpenPrivateSlots, privateBookingStorageError } from "@/features/booking/booking-store";
import { googleCalendarConfigured } from "@/features/booking/google-calendar";
import {
  earliestBookableInstant,
  formatDualTime,
  STUDENT_TIME_ZONE,
} from "@/features/booking/private-session";
import { formatCad } from "@/features/platform/pack-surface";
import { DEFAULT_PRODUCTS } from "@/features/platform/payments";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Do 1:1 with Amar - CELPIP Decoded",
  description: "Choose an open time with Amar, then pay. The time is yours after the payment is confirmed.",
};

export const dynamic = "force-dynamic";

function groupDays(starts: Date[]): BookableDay[] {
  const days: BookableDay[] = [];
  for (const start of starts) {
    const label = formatDualTime(start);
    const slot = {
      startIso: start.toISOString(),
      toronto: label.toronto,
    };
    const existing = days.find((day) => day.dayKey === label.dayKey);
    if (existing) existing.slots.push(slot);
    else days.push({ dayKey: label.dayKey, dayLabel: label.dayLabel, slots: [slot] });
  }
  return days;
}

export default async function LiveClassesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/live-classes");

  const now = new Date();
  const storageError = await privateBookingStorageError();
  const [slots, mine] = storageError
    ? [[], null]
    : await Promise.all([listOpenPrivateSlots(now), bookingForUser(user.id)]);
  const product = DEFAULT_PRODUCTS.find((item) => item.code === "private_1to1");
  const earliestLabel = new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDENT_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(earliestBookableInstant(now));

  const session: MyPrivateSession | null =
    mine && mine.status !== "cancelled"
      ? {
          status: mine.status,
          startsAt: mine.startsAt ? new Date(mine.startsAt).toISOString() : null,
          heldUntil: mine.heldUntil,
          toronto: mine.startsAt ? formatDualTime(new Date(mine.startsAt)).toronto : null,
          meetUrl: mine.meetUrl,
          bookingId: mine.status === "held" ? mine.id : null,
        }
      : null;

  return (
    <AppPageShell
      eyebrow="Learn with Amar"
      title="1:1 with Amar"
      description={`60 minutes, ${product ? formatCad(product.priceCents) : "$49.00 CAD"}. The first day you can book is ${earliestLabel}. On a Monday, that is Wednesday.`}
      width="narrow"
    >
      <PrivateSessionBooker
        days={groupDays(slots)}
        mine={session}
        priceLabel={product ? formatCad(product.priceCents) : "$49.00 CAD"}
        calendarConnected={googleCalendarConfigured()}
        storageError={storageError}
      />
    </AppPageShell>
  );
}
