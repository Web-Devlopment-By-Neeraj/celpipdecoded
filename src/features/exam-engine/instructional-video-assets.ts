// Registry of the instructional videos the practice test engine plays
// (EXAM-02).
//
// The clips are objects in the public Supabase bucket
// instructional-videos. They are not stored in git. Upload them with
// scripts/upload-instructional-videos.mjs after the bucket migration.
//
// Strings and pure helpers only, no side effects, so this file is safe to
// import from a client component.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ExamInstructionalVideoAsset,
  ExamSectionKey,
} from "./instruction-screen-types";

const INSTRUCTIONAL_VIDEO_BUCKET = "instructional-videos";

function instructionalVideoUrl(fileName: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return "";
  return `${base}/storage/v1/object/public/${INSTRUCTIONAL_VIDEO_BUCKET}/${fileName}`;
}

// The five clips, keyed by section.
//
// poster and durationLabel are deliberately unset. There is no poster
// image for any of these files, and the running times are not recorded
// anywhere in the repository, so a value here would be a guess shown to a
// learner. Fill them in when the real values are known.
export const INSTRUCTIONAL_VIDEO_ASSETS: Record<
  ExamSectionKey,
  ExamInstructionalVideoAsset
> = {
  overview: {
    section: "overview",
    title: "Complete test overview video",
    src: instructionalVideoUrl("overview.mp4"),
    description:
      "How a full CELPIP Decoded practice test runs from start to finish, and what to expect in each of the four sections.",
  },
  listening: {
    section: "listening",
    title: "Listening instructional video",
    src: instructionalVideoUrl("listening.mp4"),
    description:
      "How the Listening section works in this practice test engine, including the audio screens and the answer windows.",
  },
  reading: {
    section: "reading",
    title: "Reading instructional video",
    src: instructionalVideoUrl("reading.mp4"),
    description:
      "How the Reading section works in this practice test engine, including the split screen layout and the part timer.",
  },
  writing: {
    section: "writing",
    title: "Writing instructional video",
    src: instructionalVideoUrl("writing.mp4"),
    description:
      "How the Writing section works in this practice test engine, including the editor, the word count, and the task timing.",
  },
  speaking: {
    section: "speaking",
    title: "Speaking instructional video",
    src: instructionalVideoUrl("speaking.mp4"),
    description:
      "How the Speaking section works in this practice test engine, including the preparation phase and the recording phase.",
  },
};

// Order the clips appear in a full practice test: the overview first,
// then one per section in section order.
export const INSTRUCTIONAL_VIDEO_ORDER: readonly ExamSectionKey[] = [
  "overview",
  "listening",
  "reading",
  "writing",
  "speaking",
] as const;

// Look up one clip. Typed on ExamSectionKey, so a missing section is a
// build error rather than a blank screen.
export function getInstructionalVideoAsset(
  section: ExamSectionKey,
): ExamInstructionalVideoAsset {
  return INSTRUCTIONAL_VIDEO_ASSETS[section];
}

// The clips in play order.
export function listInstructionalVideoAssets(): ExamInstructionalVideoAsset[] {
  return INSTRUCTIONAL_VIDEO_ORDER.map(getInstructionalVideoAsset);
}

// Make a raw public path safe to use as a media src.
//
// An absolute URL, including a Supabase storage URL, is returned unchanged.
// A site-relative path has each segment encoded so spaces stay valid.
export function resolveExamMediaSrc(src: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(src)) {
    return src;
  }

  return src
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
