// Registry of the instructional videos the practice test engine plays
// (EXAM-02).
//
// The five clips already sit in the repository under
// public/assets/instructional-thumbnails/. Nothing was downloaded, moved,
// or renamed by this ticket. The folder name says thumbnails and the
// files are mp4 videos, which is recorded as a follow up in
// docs/product/exam-engine-instruction-screens.md.
//
// Strings and pure helpers only, no side effects, so this file is safe to
// import from a client component.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ExamInstructionalVideoAsset,
  ExamSectionKey,
} from "./instruction-screen-types";

// Where the clips live today. Kept as one constant so a later move is a
// one line change here rather than five edits.
const INSTRUCTIONAL_VIDEO_DIRECTORY = "/assets/instructional-thumbnails";

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
    src: `${INSTRUCTIONAL_VIDEO_DIRECTORY}/1. Overview Instructional Video.mp4`,
    description:
      "How a full CELPIP Decoded practice test runs from start to finish, and what to expect in each of the four sections.",
  },
  listening: {
    section: "listening",
    title: "Listening instructional video",
    src: `${INSTRUCTIONAL_VIDEO_DIRECTORY}/2. Listening Instructional Video.mp4`,
    description:
      "How the Listening section works in this practice test engine, including the audio screens and the answer windows.",
  },
  reading: {
    section: "reading",
    title: "Reading instructional video",
    src: `${INSTRUCTIONAL_VIDEO_DIRECTORY}/3. Reading Instructional Video.mp4`,
    description:
      "How the Reading section works in this practice test engine, including the split screen layout and the part timer.",
  },
  writing: {
    section: "writing",
    title: "Writing instructional video",
    src: `${INSTRUCTIONAL_VIDEO_DIRECTORY}/4. Writing Instructional Video.mp4`,
    description:
      "How the Writing section works in this practice test engine, including the editor, the word count, and the task timing.",
  },
  speaking: {
    section: "speaking",
    title: "Speaking instructional video",
    src: `${INSTRUCTIONAL_VIDEO_DIRECTORY}/5. Speaking Instructional Video.mp4`,
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
// The current file names contain spaces and a leading "1. ", so the raw
// path is not a valid URL. Each path segment is encoded and the slashes
// are kept, which turns
// "/assets/instructional-thumbnails/1. Overview Instructional Video.mp4"
// into a path the browser can request.
//
// An absolute URL, for example a Cloudinary link, is returned unchanged,
// because it is already encoded by whoever issued it.
export function resolveExamMediaSrc(src: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(src)) {
    return src;
  }

  return src
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
