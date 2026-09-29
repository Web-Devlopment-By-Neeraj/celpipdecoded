"use client";

import Link from "next/link";
import { useState } from "react";
import { areaUnlocked, formatPlanPrice, unlockingPlan, type AccessArea, type PlanCode } from "@/features/public-site/access";
import { PRODUCTS } from "@/features/public-site/seed";
import { SignUpPrompt } from "./SignUpPrompt";

const AREAS: { key: AccessArea; label: string; href: string; preview: string }[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", preview: "Test countdown, evaluations left, and one next step." },
  { key: "practice", label: "Practice", href: "/dashboard/practice", preview: "Writing and speaking tasks with a live word count." },
  { key: "mocks", label: "Mock tests", href: "/dashboard/mocks", preview: "Mock test 1 is free. Later mocks list their sections and timings." },
  { key: "courses", label: "Courses", href: "/dashboard/courses", preview: "Section 1 of each module plays in full after sign-up." },
  { key: "mini_free", label: "Mini-courses", href: "/dashboard/mini-courses", preview: "Free lessons on answer shape." },
  { key: "live", label: "Live classes", href: "/dashboard/live", preview: "Strategy call, private hour, and live batches." },
  { key: "ask", label: "Ask Amar", href: "/dashboard/ask", preview: "A question to Amar, with a reply in your account." },
];

export function AppPreview() {
  const [area, setArea] = useState(AREAS[0]);
  const viewer = { signedIn: false, verified: false, plans: [] as PlanCode[] };
  const plan = unlockingPlan(area.key);
  const product = PRODUCTS.find((item) => item.code === plan);

  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink/10">
      <div className="flex gap-2 overflow-x-auto p-3 lg:hidden">
        {AREAS.map((item) => (
          <button key={item.key} type="button" className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold ring-1 ring-ink/15" onClick={() => setArea(item)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="lg:grid lg:grid-cols-[220px_1fr]">
        <nav aria-label="App" className="hidden border-r border-ink/10 p-3 lg:block">
          {AREAS.map((item) => {
            const itemUnlocked = areaUnlocked(viewer, item.key);
            return (
            <button key={item.key} type="button" className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm font-semibold" onClick={() => setArea(item)}>
              {itemUnlocked ? item.label : `🔒 ${item.label}`}
            </button>
            );
          })}
        </nav>
        <div className="p-5">
          <h3 className="font-serif text-2xl">{area.label}</h3>
          <p className="mt-2 text-base leading-7">{area.preview}</p>
          <p className="mt-3 text-sm">Sample data. Sign up to use your own.</p>
          {area.key === "dashboard" || area.key === "tools" ? null : (
            <div className="mt-4">
              <p className="text-sm font-semibold">
                Unlocks with {product?.name ?? "Free"} {product ? formatPlanPrice(product.priceCents) : ""}
              </p>
              <SignUpPrompt context="locked_area" presentation="inline" items={[area.label]} area={area.key} />
              <Link href={area.href} className="mt-3 inline-flex text-sm font-semibold underline">Open in the app</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
