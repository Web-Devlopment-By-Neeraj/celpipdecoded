// Central registry of static image assets served from public/.
//
// Paths point at the optimized WebP copies created by
// scripts/audit-and-optimize-assets.mjs when one exists, and at the
// original file when conversion is unsafe (favicon, app icon) or no
// optimized copy was needed.
//
// Badges and skill icons point at the normalized square copies created by
// scripts/normalize-badge-icon-assets.mjs. The originals are landscape
// 2816x1536 sheets with a painted checkerboard background, so they are not
// usable in UI directly. The normalized copies are square, cropped to the
// artwork and carry a real alpha channel.
//
// Regenerate optimized copies with: npm run assets:optimize
// Regenerate normalized badges and icons with: npm run assets:normalize-badges
// Inventory and warnings: docs/product/asset-inventory.md
// Normalization notes: docs/product/badge-icon-normalization-report.md

// BRAND-01: the CELPIP Decoded lockup is drawn in
// src/components/brand/CelpipDecodedLogo.tsx as inline SVG and text, so
// there is no logo raster to register here. The previous brand's logo
// files stay in public/ but are no longer referenced by the app.
export const brandingAssets = {
  // Browser and app icon.
  favicon: "/favicon.png",
} as const;

export const dashboardAssets = {
  studyHero: "/assets/optimized/illustrations/dashboard-study-hero.webp",
  practiceJourney: "/assets/optimized/illustrations/dashboard-practice-journey.webp",
  progressOverview: "/assets/optimized/illustrations/dashboard-progress-overview.webp",
  liveClasses: "/assets/optimized/illustrations/dashboard-live-classes.webp",
} as const;

export const emptyStateAssets = {
  noBadges: "/assets/optimized/empty-states/empty-no-badges.webp",
  noFeedback: "/assets/optimized/empty-states/empty-no-feedback.webp",
  noProgress: "/assets/optimized/empty-states/empty-no-progress.webp",
  speakingHistory: "/assets/optimized/empty-states/empty-speaking-history.webp",
  writingHistory: "/assets/optimized/empty-states/empty-writing-history.webp",
} as const;

// Normalized 512x512 skill icons. Default to WebP, the PNG twin is there
// for anywhere WebP is not an option.
export const skillAssets = {
  speaking: "/assets/normalized/skills/skill-speaking-512.webp",
  writing: "/assets/normalized/skills/skill-writing-512.webp",
  reading: "/assets/normalized/skills/skill-reading-512.webp",
  listening: "/assets/normalized/skills/skill-listening-512.webp",
} as const;

export const skillAssetsPng = {
  speaking: "/assets/normalized/skills/skill-speaking-512.png",
  writing: "/assets/normalized/skills/skill-writing-512.png",
  reading: "/assets/normalized/skills/skill-reading-512.png",
  listening: "/assets/normalized/skills/skill-listening-512.png",
} as const;

// Normalized 1024x1024 badges, for badge detail and award moments.
export const badgeAssets = {
  advancedCommunicator: "/assets/normalized/badges/badge-advanced-communicator-1024.webp",
  confidentCommunicator: "/assets/normalized/badges/badge-confident-communicator-1024.webp",
  testReadyBuilder: "/assets/normalized/badges/badge-test-ready-builder-1024.webp",
  consistentLearner: "/assets/normalized/badges/badge-consistent-learner-1024.webp",
  feedbackFinisher: "/assets/normalized/badges/badge-feedback-finisher-1024.webp",
  firstSpeaking: "/assets/normalized/badges/badge-first-speaking-1024.webp",
  firstWriting: "/assets/normalized/badges/badge-first-writing-1024.webp",
  speakingImprover: "/assets/normalized/badges/badge-speaking-improver-1024.webp",
  writingImprover: "/assets/normalized/badges/badge-writing-improver-1024.webp",
} as const;

// Normalized 512x512 badges, for lists, grids and small badge chips.
export const badgeAssetsSmall = {
  advancedCommunicator: "/assets/normalized/badges/badge-advanced-communicator-512.webp",
  confidentCommunicator: "/assets/normalized/badges/badge-confident-communicator-512.webp",
  testReadyBuilder: "/assets/normalized/badges/badge-test-ready-builder-512.webp",
  consistentLearner: "/assets/normalized/badges/badge-consistent-learner-512.webp",
  feedbackFinisher: "/assets/normalized/badges/badge-feedback-finisher-512.webp",
  firstSpeaking: "/assets/normalized/badges/badge-first-speaking-512.webp",
  firstWriting: "/assets/normalized/badges/badge-first-writing-512.webp",
  speakingImprover: "/assets/normalized/badges/badge-speaking-improver-512.webp",
  writingImprover: "/assets/normalized/badges/badge-writing-improver-512.webp",
} as const;

export const badgeAssetsPng = {
  advancedCommunicator: "/assets/normalized/badges/badge-advanced-communicator-1024.png",
  confidentCommunicator: "/assets/normalized/badges/badge-confident-communicator-1024.png",
  testReadyBuilder: "/assets/normalized/badges/badge-test-ready-builder-1024.png",
  consistentLearner: "/assets/normalized/badges/badge-consistent-learner-1024.png",
  feedbackFinisher: "/assets/normalized/badges/badge-feedback-finisher-1024.png",
  firstSpeaking: "/assets/normalized/badges/badge-first-speaking-1024.png",
  firstWriting: "/assets/normalized/badges/badge-first-writing-1024.png",
  speakingImprover: "/assets/normalized/badges/badge-speaking-improver-1024.png",
  writingImprover: "/assets/normalized/badges/badge-writing-improver-1024.png",
} as const;

export type BrandingAssetKey = keyof typeof brandingAssets;
export type DashboardAssetKey = keyof typeof dashboardAssets;
export type EmptyStateAssetKey = keyof typeof emptyStateAssets;
export type SkillAssetKey = keyof typeof skillAssets;
export type BadgeAssetKey = keyof typeof badgeAssets;
