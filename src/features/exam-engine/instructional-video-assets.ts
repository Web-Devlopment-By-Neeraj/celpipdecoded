// Registry of the instructional videos the practice test engine plays
// (EXAM-02).
//
// Clips are hosted on Cloudinary (fast CDN, f_auto/q_auto). They are not
// stored in git. Override any URL with NEXT_PUBLIC_* env vars if needed.
//
// Strings and pure helpers only, no side effects, so this file is safe to
// import from a client component.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { cloudinaryVideoDeliveryUrl } from "@/features/media/cloudinary-video";
import type {
  ExamInstructionalVideoAsset,
  ExamSectionKey,
} from "./instruction-screen-types";

const DEFAULT_PUBLIC_IDS: Record<ExamSectionKey, string> = {
  overview: "v1784581003/1._Overview_Instructional_Video_vqrdts.mp4",
  listening: "v1784580998/2._Listening_Instructional_Video_rhpfwo.mp4",
  reading: "v1784581006/3._Reading_Instructional_Video_flj4qa.mp4",
  writing: "v1784581004/4._Writing_Instructional_Video_o3xpew.mp4",
  speaking: "v1784581017/5._Speaking_Instructional_Video_wictsq.mp4",
};

const ENV_SRC: Partial<Record<ExamSectionKey, string | undefined>> = {
  overview: process.env.NEXT_PUBLIC_INSTRUCTIONAL_VIDEO_OVERVIEW_SRC,
  listening: process.env.NEXT_PUBLIC_INSTRUCTIONAL_VIDEO_LISTENING_SRC,
  reading: process.env.NEXT_PUBLIC_INSTRUCTIONAL_VIDEO_READING_SRC,
  writing: process.env.NEXT_PUBLIC_INSTRUCTIONAL_VIDEO_WRITING_SRC,
  speaking: process.env.NEXT_PUBLIC_INSTRUCTIONAL_VIDEO_SPEAKING_SRC,
};

function instructionalVideoSrc(section: ExamSectionKey): string {
  const fromEnv = ENV_SRC[section]?.trim();
  if (fromEnv) return fromEnv;
  return cloudinaryVideoDeliveryUrl(DEFAULT_PUBLIC_IDS[section]);
}

export const INSTRUCTIONAL_VIDEO_ASSETS: Record<
  ExamSectionKey,
  ExamInstructionalVideoAsset
> = {
  overview: {
    section: "overview",
    title: "Complete test overview video",
    src: instructionalVideoSrc("overview"),
    description:
      "How a full CELPIP Decoded practice test runs from start to finish, and what to expect in each of the four sections.",
  },
  listening: {
    section: "listening",
    title: "Listening instructional video",
    src: instructionalVideoSrc("listening"),
    description:
      "How the Listening section works in this practice test engine, including the audio screens and the answer windows.",
  },
  reading: {
    section: "reading",
    title: "Reading instructional video",
    src: instructionalVideoSrc("reading"),
    description:
      "How the Reading section works in this practice test engine, including the split screen layout and the part timer.",
  },
  writing: {
    section: "writing",
    title: "Writing instructional video",
    src: instructionalVideoSrc("writing"),
    description:
      "How the Writing section works in this practice test engine, including the editor, the word count, and the task timing.",
  },
  speaking: {
    section: "speaking",
    title: "Speaking instructional video",
    src: instructionalVideoSrc("speaking"),
    description:
      "How the Speaking section works in this practice test engine, including the preparation phase and the recording phase.",
  },
};

export const INSTRUCTIONAL_VIDEO_ORDER: readonly ExamSectionKey[] = [
  "overview",
  "listening",
  "reading",
  "writing",
  "speaking",
] as const;

export function getInstructionalVideoAsset(
  section: ExamSectionKey,
): ExamInstructionalVideoAsset {
  return INSTRUCTIONAL_VIDEO_ASSETS[section];
}

export function listInstructionalVideoAssets(): ExamInstructionalVideoAsset[] {
  return INSTRUCTIONAL_VIDEO_ORDER.map(getInstructionalVideoAsset);
}

export function resolveExamMediaSrc(src: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(src)) {
    return src;
  }

  return src
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
