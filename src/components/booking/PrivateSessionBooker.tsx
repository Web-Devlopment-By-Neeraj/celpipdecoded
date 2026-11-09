"use client";

import { useEffect, useState } from "react";
import { holdPrivateSlotAction } from "@/app/dashboard/live-classes/actions";
import { AppButton } from "@/components/app/AppButton";
import { AppCard } from "@/components/app/AppCard";
import { cx, focus, text } from "@/features/design/design-tokens";

export type BookableDay = {
  dayKey: string;
  dayLabel: string;
  slots: { startIso: string; toronto: string }[];
};

export type MyPrivateSession = {
  status: "held" | "confirmed" | "needs_slot";
  startsAt: string | null;
  heldUntil: string | null;
  toronto: string | null;
  meetUrl: string | null;
  bookingId: string | null;
};

function HoldClock({ until }: { until: string }) {
  const [label, setLabel] = useState("Checking the hold...");

  useEffect(() => {
    function tick() {
      const remaining = new Date(until).getTime() - Date.now();
      if (remaining <= 0) {
        setLabel("This hold has ended. Pick the time again.");
        return;
      }
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setLabel(`${minutes}:${String(seconds).padStart(2, "0")} left to pay`);
    }
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [until]);

  return <p className={cx("mt-3 text-sm font-semibold", text.accent)}>{label}</p>;
}

export function PrivateSessionBooker({
  days,
  mine,
  priceLabel,
  calendarConnected,
  storageError,
}: {
  days: BookableDay[];
  mine: MyPrivateSession | null;
  priceLabel: string;
  calendarConnected: boolean;
  storageError?: string | null;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(startIso: string) {
    setError(null);
    setPending(startIso);
    const result = await holdPrivateSlotAction(startIso);
    setPending(null);
    if (!result.ok) setError(result.error);
  }

  async function pay() {
    if (!mine?.bookingId) return;
    setError(null);
    setPaying(true);
    try {
      const response = await fetch("/api/app/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productCode: "private_1to1", bookingId: mine.bookingId }),
      });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        setError(payload.error ?? "Checkout could not start.");
        setPaying(false);
        return;
      }
      window.location.href = payload.url;
    } catch {
      setError("Checkout could not start. Check your connection and try again.");
      setPaying(false);
    }
  }

  return (
    <div className="space-y-6">
      <AppCard variant="subtle" padding="compact">
        <ol className={cx("space-y-2 text-sm leading-6", text.secondary)}>
          <li>1. Pick one time. It is held for 15 minutes, and nobody else can take it.</li>
          <li>2. Pay {priceLabel}. The hold lasts 30 minutes while checkout is open.</li>
          <li>3. The time is yours only after the card payment is confirmed.</li>
          <li>4. If that time was already taken, you pick another open time. No second charge.</li>
        </ol>
        <p className={cx("mt-4 text-sm leading-6", text.secondary)}>
          Times are Eastern. Today and tomorrow stay closed.
        </p>
        {calendarConnected ? null : (
          <p className={cx("mt-3 text-sm leading-6", text.secondary)}>
            Your time is saved as soon as payment is confirmed. The Meet link shows here once
            Amar&apos;s Google calendar is connected.
          </p>
        )}
      </AppCard>

      {mine?.status === "confirmed" && mine.toronto ? (
        <AppCard as="section" ariaLabel="Your 1:1" variant="highlighted">
          <p className={text.eyebrow}>Your 1:1</p>
          <p className={cx("mt-2 font-serif text-3xl font-bold", text.heading)}>{mine.toronto}</p>
          {mine.meetUrl ? (
            <a
              href={mine.meetUrl}
              className="mt-5 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Join the meeting
            </a>
          ) : (
            <p className={cx("mt-4 text-sm leading-6", text.secondary)}>
              The meeting link will appear here when the calendar is connected.
            </p>
          )}
        </AppCard>
      ) : null}

      {mine?.status === "needs_slot" ? (
        <AppCard as="section" ariaLabel="Choose another time" variant="highlighted">
          <h2 className={cx("font-serif text-xl font-bold", text.heading)}>
            Payment received. Pick another time.
          </h2>
          <p className={cx("mt-2 text-sm leading-6", text.secondary)}>
            The time you paid for was taken before the payment finished. This payment stays on
            your account. Choose any open time below. You will not be charged again.
          </p>
        </AppCard>
      ) : null}

      {mine?.status === "held" && mine.toronto && mine.bookingId ? (
        <AppCard as="section" ariaLabel="Held time" variant="highlighted">
          <p className={text.eyebrow}>Held for you</p>
          <p className={cx("mt-2 font-serif text-2xl font-bold", text.heading)}>{mine.toronto}</p>
          {mine.heldUntil ? <HoldClock until={mine.heldUntil} /> : null}
          <p className={cx("mt-3 text-sm leading-6", text.secondary)}>
            This time is not booked until the card payment is confirmed. Closing the page does not
            charge you.
          </p>
          <AppButton className="mt-4" isLoading={paying} loadingText="Opening checkout..." onClick={() => void pay()}>
            Pay {priceLabel}
          </AppButton>
        </AppCard>
      ) : null}

      {storageError ? (
        <p role="status" className="rounded-2xl bg-academy-red-soft px-4 py-3 text-sm text-academy-red">
          {storageError}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-2xl bg-academy-red-soft px-4 py-3 text-sm text-academy-red">
          {error}
        </p>
      ) : null}

      {mine?.status === "confirmed" || storageError ? null : days.length === 0 ? (
        <p className={cx("text-sm leading-6", text.secondary)}>No open times in the next three weeks.</p>
      ) : (
        <div className="space-y-8">
          {days.map((day) => (
            <section key={day.dayKey}>
              <h2 className={cx("font-serif text-lg font-bold", text.heading)}>{day.dayLabel}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {day.slots.map((slot) => {
                  const selected = mine?.startsAt === slot.startIso && mine.status === "held";
                  return (
                    <li key={slot.startIso}>
                      <button
                        type="button"
                        disabled={pending !== null || selected}
                        onClick={() => void pick(slot.startIso)}
                        className={cx(
                          "flex w-full flex-col rounded-2xl px-4 py-3 text-left ring-1 transition-colors disabled:opacity-70",
                          focus.ring,
                          selected
                            ? "bg-academy-navy text-white ring-academy-navy"
                            : "bg-academy-paper text-academy-navy ring-academy-navy/10 hover:ring-academy-blue/40",
                        )}
                      >
                        <span className="text-base font-semibold">
                          {pending === slot.startIso ? "Holding..." : slot.toronto}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
