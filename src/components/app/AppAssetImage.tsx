import Image from "next/image";
import { cx } from "@/features/design/design-tokens";

// Next.js Image wrapper for the local optimized assets in public/.
//
// Everything the design system renders as an image goes through here so
// asset rules stay in one place:
// - paths come from src/features/assets, which already points at WebP
// - images never overflow their container
// - loading stays lazy unless a caller explicitly asks for eager loading
//
// Next.js 16 deprecated the Image priority prop in favour of preload.
// The prop here is still called priority because that is the wording the
// rest of the product uses, and it maps to preload underneath.

export type AppAssetImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  // Opt in only. Reserve this for a single above the fold image per
  // page, never for a grid of cards.
  priority?: boolean;
  // Responsive hint for images that scale with their container.
  sizes?: string;
};

export function AppAssetImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
}: AppAssetImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      preload={priority}
      className={cx("h-auto max-w-full", className)}
    />
  );
}
