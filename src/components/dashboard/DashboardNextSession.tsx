import Link from "next/link";
import { AppCard } from "@/components/app/AppCard";
import { cx, text } from "@/features/design/design-tokens";
import { formatDualTime } from "@/features/booking/private-session";
import type { PrivateBooking } from "@/features/booking/booking-store";

export function DashboardNextSession({ booking }: { booking: PrivateBooking | null }) {
  const when =
    booking?.startsAt && (booking.status === "confirmed" || booking.status === "held")
      ? formatDualTime(new Date(booking.startsAt))
      : null;

  const value =
    booking?.status === "confirmed" && when
      ? when.toronto
      : booking?.status === "held" && when
        ? "Held, not paid"
        : booking?.status === "needs_slot"
          ? "Pick another time"
          : "None booked";

  const detail =
    booking?.status === "confirmed" && when
      ? "Open 1:1 with Amar for the meeting link."
      : booking?.status === "held"
        ? "The time is held while you pay. It is not yours until the payment is confirmed."
        : booking?.status === "needs_slot"
          ? "Your payment is saved. Choose a different open time. There is no second charge."
          : "The soonest time is the day after tomorrow.";

  return (
    <AppCard as="section" ariaLabel="Next 1:1 with Amar" padding="compact">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={cx("text-xs font-semibold uppercase tracking-[0.15em]", text.muted)}>
            Next 1:1 with Amar
          </p>
          <p className={cx("mt-2 font-serif text-2xl font-bold", text.heading)}>{value}</p>
          <p className={cx("mt-2 text-sm leading-6", text.secondary)}>{detail}</p>
        </div>
        <Link
          href="/dashboard/live-classes"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {booking?.status === "needs_slot" ? "Choose a time" : "Open times"}
        </Link>
      </div>
    </AppCard>
  );
}
