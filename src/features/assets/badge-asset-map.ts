// Maps stored badge slugs to badge artwork.
//
// The slugs here must match the badge catalog seeded in Supabase and used
// by src/features/speaking/level-badges.ts. Do not rename them. The UI
// label can say communicator even where the slug says speaker.
//
// Artwork comes from the normalized square badges produced by
// scripts/normalize-badge-icon-assets.mjs, see
// docs/product/badge-icon-normalization-report.md. Each slug resolves to a
// large and a small variant so a caller can pick the right one for its
// render size instead of downscaling a 1024px badge into a chip.
//
// Some slugs have no exact artwork yet, so the closest available badge is
// used as a stand-in. Those are marked below so a future design ticket can
// commission the missing pieces.

import { badgeAssets, badgeAssetsSmall, type BadgeAssetKey } from "./asset-registry";

export type BadgeArtwork = {
  // Normalized 1024x1024 WebP, for badge detail and award moments.
  large: string;
  // Normalized 512x512 WebP, for lists, grids and small badge chips.
  small: string;
};

function artwork(key: BadgeAssetKey): BadgeArtwork {
  return { large: badgeAssets[key], small: badgeAssetsSmall[key] };
}

export const BADGE_ASSET_MAP = {
  // No dedicated artwork yet, first speaking badge is the closest fit.
  "foundation-speaker": artwork("firstSpeaking"),
  // No dedicated artwork yet, speaking improver reads as developing.
  "developing-communicator": artwork("speakingImprover"),
  // Exact match.
  "test-ready-builder": artwork("testReadyBuilder"),
  // Slug says speaker, artwork and label say communicator.
  "confident-speaker": artwork("confidentCommunicator"),
  // Exact match.
  "advanced-communicator": artwork("advancedCommunicator"),
} as const satisfies Record<string, BadgeArtwork>;

export type MappedBadgeSlug = keyof typeof BADGE_ASSET_MAP;

// Slugs that still need their own artwork.
export const BADGE_SLUGS_NEEDING_ARTWORK: readonly MappedBadgeSlug[] = [
  "foundation-speaker",
  "developing-communicator",
];

// Shown when a slug has no mapping, for example a practice badge that is
// awarded outside the level ladder.
export const FALLBACK_BADGE_ARTWORK: BadgeArtwork = artwork("consistentLearner");
export const FALLBACK_BADGE_ASSET = FALLBACK_BADGE_ARTWORK.large;

// Resolves any badge slug to both artwork sizes. Unknown slugs fall back so
// the UI never renders a broken image.
export function getBadgeArtwork(slug: string | null | undefined): BadgeArtwork {
  if (!slug) return FALLBACK_BADGE_ARTWORK;
  return BADGE_ASSET_MAP[slug as MappedBadgeSlug] ?? FALLBACK_BADGE_ARTWORK;
}

// Resolves any badge slug to a single image path, the large variant.
export function getBadgeAsset(slug: string | null | undefined): string {
  return getBadgeArtwork(slug).large;
}

// Resolves any badge slug to the small variant, for chips and list rows.
export function getBadgeAssetSmall(slug: string | null | undefined): string {
  return getBadgeArtwork(slug).small;
}
