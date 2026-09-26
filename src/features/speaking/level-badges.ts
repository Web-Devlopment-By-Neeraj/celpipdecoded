// Badge mapping for the estimated practice level shown on the result
// card. Levels use the 1 to 12 practice scale. This is a practice
// estimate for guidance and motivation only; it is never presented as
// an official CELPIP score.

export type LevelBadge = {
  slug: string;
  label: string;
};

type LevelBadgeRange = {
  min: number;
  max: number;
  badge: LevelBadge;
};

// Ranges are inclusive and cover the full practice scale. Slugs match
// the badge catalog seeded in supabase/migrations/001_academy_foundation.sql.
const LEVEL_BADGE_RANGES: LevelBadgeRange[] = [
  {
    min: 1,
    max: 4,
    badge: { slug: "foundation-speaker", label: "Foundation Speaker" },
  },
  {
    min: 5,
    max: 6,
    badge: {
      slug: "developing-communicator",
      label: "Developing Communicator",
    },
  },
  {
    min: 7,
    max: 7,
    badge: { slug: "test-ready-builder", label: "Test Ready Builder" },
  },
  {
    min: 8,
    max: 8,
    badge: { slug: "confident-speaker", label: "Confident Speaker" },
  },
  {
    min: 9,
    max: 12,
    badge: {
      slug: "advanced-communicator",
      label: "Advanced Communicator",
    },
  },
];

// Maps an estimated level to its badge. Values outside the scale are
// clamped to the nearest range so a surprising model output still
// resolves to a valid badge.
export function getBadgeForLevel(level: number): LevelBadge {
  const rounded = Math.round(level);
  const match = LEVEL_BADGE_RANGES.find(
    (range) => rounded >= range.min && rounded <= range.max,
  );

  if (match) {
    return match.badge;
  }

  return rounded < 1
    ? LEVEL_BADGE_RANGES[0].badge
    : LEVEL_BADGE_RANGES[LEVEL_BADGE_RANGES.length - 1].badge;
}

// Display label for a stored badge slug, or null when the slug is not
// in the catalog so callers can fall back to the level mapping.
export function getBadgeLabel(slug: string): string | null {
  const match = LEVEL_BADGE_RANGES.find((range) => range.badge.slug === slug);
  return match?.badge.label ?? null;
}

// Text version of the mapping for the scoring prompt, so the model and
// the server agree on the same ranges.
export function describeBadgeMapping(): string {
  return LEVEL_BADGE_RANGES.map((range) =>
    range.min === range.max
      ? `${range.min}: ${range.badge.slug}`
      : `${range.min} to ${range.max}: ${range.badge.slug}`,
  ).join("\n");
}
