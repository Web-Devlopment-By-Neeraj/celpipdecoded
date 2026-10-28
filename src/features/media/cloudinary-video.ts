// Cloudinary delivery helpers for video (instructional clips, course lessons).
//
// Videos are referenced by URL only — nothing is bundled in the app. Use
// f_auto and q_auto so Cloudinary serves a sensible codec and bitrate per
// device, and keep preload="none" on <video> until the learner opens a
// screen that plays a clip (see ExamVideoPlayer on mock intros).

const CLOUDINARY_VIDEO_HOST = "https://res.cloudinary.com/ds1wvtjft/video/upload";

/** Public id path after /upload/, e.g. v1784581003/foo.mp4 */
export function cloudinaryVideoDeliveryUrl(
  publicIdPath: string,
  options?: { autoFormat?: boolean; autoQuality?: boolean },
): string {
  const transforms: string[] = [];
  if (options?.autoFormat !== false) transforms.push("f_auto");
  if (options?.autoQuality !== false) transforms.push("q_auto");
  const prefix =
    transforms.length > 0
      ? `${CLOUDINARY_VIDEO_HOST}/${transforms.join(",")}`
      : CLOUDINARY_VIDEO_HOST;
  return `${prefix}/${publicIdPath.replace(/^\//, "")}`;
}

/** Recommended preload for intro clips — avoids downloading until play. */
export const INSTRUCTIONAL_VIDEO_PRELOAD = "none" as const;
