"use client";

import { useState } from "react";
import Link from "next/link";
import { AppCard } from "@/components/app/AppCard";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { MockAttemptNote } from "@/components/mock-tests/MockAttemptNote";
import { cx, focus, text } from "@/features/design/design-tokens";
import type { MockRunView } from "@/features/mock-tests/mock-run";

export type MockHubCard = {
  key: string;
  href: string | null;
  title: string;
  description: string;
  badge: string | null;
  slug: string | null;
  comingSoon: boolean;
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "not-started", label: "Not started" },
  { id: "in-progress", label: "In progress" },
  { id: "completed", label: "Completed" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function cardStatus(card: MockHubCard, runs: MockRunView[]): FilterId {
  if (!card.slug) return "not-started";
  const mine = runs.filter((run) => run.slug === card.slug);
  if (mine.some((run) => run.status === "in_progress")) return "in-progress";
  if (mine.some((run) => run.status === "submitted")) return "completed";
  return "not-started";
}

export function MockTestHubList({
  cards,
  runs,
}: {
  cards: MockHubCard[];
  runs: MockRunView[];
}) {
  const [filter, setFilter] = useState<FilterId>("all");
  const visible = cards.filter((card) => {
    if (card.comingSoon) return filter === "all";
    if (filter === "all") return true;
    return cardStatus(card, runs) === filter;
  });

  return (
    <div>
      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Mock test filters">
        {FILTERS.map((item) => {
          const count =
            item.id === "all"
              ? cards.length
              : cards.filter(
                  (card) => !card.comingSoon && cardStatus(card, runs) === item.id,
                ).length;
          const selected = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(item.id)}
              className={cx(
                "rounded-full px-3 py-1 text-sm font-semibold",
                focus.ring,
                selected
                  ? "bg-academy-navy text-white"
                  : "bg-white text-academy-navy ring-1 ring-academy-navy/15",
              )}
            >
              {item.label} {count}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-5" aria-label="Mock test list">
        {visible.map((card) => (
          <AppCard key={card.key} as="article">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className={cx(text.heading, "text-xl")}>
                  {card.href ? (
                    <Link
                      href={card.href}
                      className={cx("underline-offset-2 hover:underline", focus.ring)}
                    >
                      {card.title}
                    </Link>
                  ) : (
                    card.title
                  )}
                </h2>
                <p className={cx("mt-2 text-sm leading-6", text.secondary)}>
                  {card.description}
                </p>
                {card.slug ? <MockAttemptNote runs={runs} slug={card.slug} /> : null}
              </div>
              {card.badge ? (
                <AppStatusBadge
                  tone={card.badge === "Free" ? "success" : "neutral"}
                  className="shrink-0"
                >
                  {card.badge}
                </AppStatusBadge>
              ) : null}
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  );
}
