"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SEEN_KEY = "celpip-leave-offer";

export function LeaveOfferDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem(SEEN_KEY) === "seen") return;

    let reachedEnd = false;

    function onScroll() {
      const root = document.documentElement;
      if (window.scrollY + window.innerHeight >= root.scrollHeight - 120) {
        reachedEnd = true;
      }
    }

    function onLeave(event: MouseEvent) {
      if (!reachedEnd || event.clientY > 8) return;
      window.sessionStorage.setItem(SEEN_KEY, "seen");
      setOpen(true);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onLeave);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  if (!open) return null;

  function close() {
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 px-4 py-8 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-offer-title"
        className="w-full max-w-md rounded-3xl bg-white p-6 text-ink shadow-xl"
      >
        <h2 id="leave-offer-title" className="font-serif text-2xl font-semibold">
          15% off before you go
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          You reached the end of the page. Take 15% off a practice plan. The discount is applied at checkout.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/pricing?offer=leave15"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
          >
            See the discount
          </Link>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-ink/15 text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
