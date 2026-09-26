// Badge mapping for the estimated writing practice level shown on the
// writing result card. Levels use the 1 to 12 practice scale. This is
// a practice estimate for guidance and motivation only; it is never
// presented as an official CELPIP score.

export type WritingLevelBadge = {
  slug: string;
  label: string;
};

type WritingLevelBadgeRange = {
  min: number;
  max: number;
  badge: WritingLevelBadge;
};

// Ranges are inclusive and cover the full practice scale. Slugs match
// the badge catalog seeded in supabase/migrations/001_academy_foundation.sql,
// which is shared across practice modules, so some slugs still use
// speaker wording. The writing UI labels use communicator wording
// instead, because writing practice is not a spoken task.
const WRITING_LEVEL_BADGE_RANGES: WritingLevelBadgeRange[] = [
  {
    min: 1,
    max: 4,
    badge: { slug: "foundation-speaker", label: "Foundation communicator" },
  },
  {
    min: 5,
    max: 6,
    badge: {
      slug: "developing-communicator",
      label: "Developing communicator",
    },
  },
  {
    min: 7,
    max: 7,
    badge: { slug: "test-ready-builder", label: "Test readiness builder" },
  },
  {
    min: 8,
    max: 8,
    badge: { slug: "confident-speaker", label: "Confident communicator" },
  },
  {
    min: 9,
    max: 12,
    badge: {
      slug: "advanced-communicator",
      label: "Advanced communicator",
    },
  },
];

// Maps an estimated level to its badge. Values outside the scale are
// clamped to the nearest range so a surprising model output still
// resolves to a valid badge.
export function getWritingBadgeForLevel(level: number): WritingLevelBadge {
  const rounded = Math.round(level);
  const match = WRITING_LEVEL_BADGE_RANGES.find(
    (range) => rounded >= range.min && rounded <= range.max,
  );

  if (match) {
    return match.badge;
  }

  return rounded < 1
    ? WRITING_LEVEL_BADGE_RANGES[0].badge
    : WRITING_LEVEL_BADGE_RANGES[WRITING_LEVEL_BADGE_RANGES.length - 1].badge;
}

// Display label for a stored badge slug, or null when the slug is not
// in the catalog so callers can fall back to the level mapping.
export function getWritingBadgeLabel(slug: string): string | null {
  const match = WRITING_LEVEL_BADGE_RANGES.find(
    (range) => range.badge.slug === slug,
  );
  return match?.badge.label ?? null;
}

// Text version of the mapping for the writing scoring prompt, so the
// model and the server agree on the same ranges.
export function describeWritingBadgeMapping(): string {
  return WRITING_LEVEL_BADGE_RANGES.map((range) =>
    range.min === range.max
      ? `${range.min}: ${range.badge.slug}`
      : `${range.min} to ${range.max}: ${range.badge.slug}`,
  ).join("\n");
}
