import type { ReactNode } from "react";
import { cx } from "@/features/design/design-tokens";
import { playerMedia } from "@/features/exam-engine/mock-test-player-theme";

// The box an image, an audio clip or a video sits in (EXAM-UI-02).
//
// This is the fix for the image overflow the brief calls out. A Listening
// scenario drawing or a Reading brochure served at its intrinsic size
// could be taller than the whole content pane on a laptop, which pushed
// the questions under it out of sight and made the screen feel bottomless.
//
// Three rules, and each one is doing a job:
//
// - **the frame is capped and centred**, so a picture never runs the full
//   1100 pixels of the window
// - **the picture is capped by viewport height**, not by a pixel value, so
//   it takes a share of the screen a learner actually has rather than a
//   share of the screen it was designed on. tall raises the cap for a
//   passage image that is the whole point of the screen, such as the
//   Reading Part 2 brochure.
// - **object-contain, never cover**, because a test image is information
//   and cropping it would remove some
//
// The caller still supplies the element itself, so nothing here touches
// how a clip is loaded, which source it comes from, or what happens when
// it will not play. This is a frame and nothing else.

export type MockTestMediaFrameProps = {
  children: ReactNode;
  // Small line under the frame naming the picture or the clip.
  caption?: string;
  // Raise the height cap for a picture that is the screen's subject.
  tall?: boolean;
  // Drop the bordered surface, for a child that draws its own box such as
  // a video player.
  bare?: boolean;
  className?: string;
};

export function MockTestMediaFrame({
  children,
  caption,
  tall = false,
  bare = false,
  className,
}: MockTestMediaFrameProps) {
  return (
    <figure className={cx(playerMedia.frame, className)}>
      <div
        className={cx(
          bare ? "min-w-0" : playerMedia.surface,
          // The cap is applied to the frame as well as to any picture
          // inside it, so a caller passing its own img still cannot push
          // the navigation out of reach.
          tall ? "max-h-[62vh]" : "max-h-[46vh]",
        )}
      >
        {children}
      </div>

      {caption ? (
        <figcaption className={playerMedia.caption}>{caption}</figcaption>
      ) : null}
    </figure>
  );
}

// The class an image inside the frame should carry. Exported rather than
// applied here, because the screens pass their own img with intrinsic
// width and height on it, which is what reserves the right box before the
// file arrives and stops the screen jumping as it loads.
export const mockTestMediaImageClass = playerMedia.image;
export const mockTestMediaImageTallClass = playerMedia.imageTall;
