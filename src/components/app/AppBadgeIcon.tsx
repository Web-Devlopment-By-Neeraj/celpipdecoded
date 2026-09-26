import { AppAssetImage } from "./AppAssetImage";
import { cx } from "@/features/design/design-tokens";
import { getBadgeArtwork } from "@/features/assets/badge-asset-map";

// Badge artwork for a stored badge slug.
//
// The app used to draw a star glyph wherever a badge appeared, even
// though normalized badge artwork already exists. This resolves the slug
// through badge-asset-map.ts, which falls back to a generic badge for an
// unmapped slug so the UI never renders a broken image.
//
// Sizes below 96px use the 512px artwork, larger sizes use the 1024px
// artwork, so a chip does not download a full size badge.
//
// Badge slugs are database values and must not be renamed here. The
// visible label can use communicator wording even where the slug says
// speaker.

const SIZES = {
  sm: 40,
  md: 64,
  lg: 96,
  xl: 144,
} as const;

export type AppBadgeIconSize = keyof typeof SIZES;

export type AppBadgeIconProps = {
  slug: string | null | undefined;
  size?: AppBadgeIconSize;
  // The badge name, for example "Confident communicator". Pass an empty
  // string when the name is already written next to the image, so screen
  // readers do not hear it twice.
  alt: string;
  priority?: boolean;
  className?: string;
};

export function AppBadgeIcon({
  slug,
  size = "md",
  alt,
  priority = false,
  className,
}: AppBadgeIconProps) {
  const artwork = getBadgeArtwork(slug);
  const pixels = SIZES[size];
  const src = pixels >= 96 ? artwork.large : artwork.small;

  return (
    <AppAssetImage
      src={src}
      alt={alt}
      width={pixels}
      height={pixels}
      priority={priority}
      className={cx("shrink-0 object-contain", className)}
    />
  );
}
