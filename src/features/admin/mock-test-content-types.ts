// Shared vocabulary for the ADMIN-02 question, option, answer key and
// media editor.
//
// Same job as mock-test-types.ts does for the ADMIN-01 structure
// builder, kept in its own file because the two sets have no overlap: a
// question type is not a part type, and nothing here is needed to render
// the structure screens.
//
// Every list matches a check constraint in
// supabase/migrations/014_mock_test_question_answer_media_editor.sql. The
// database is the authority; these arrays exist so a form can offer the
// same options the database will accept, and so a server action can
// refuse a bad value before it becomes a Postgres error.
//
// Nothing in this file is learner facing. No learner route reads any of
// the four ADMIN-02 tables, and the answer key shape below never leaves
// the server outside an admin screen.
//
// House style: normal hyphens only, straight quotes only.

import type { StatusToneName } from "@/features/design/status-styles";
import type { BuildStatus, SectionType } from "./mock-test-types";

// ---------------------------------------------------------------------
// Question types
// ---------------------------------------------------------------------

// The five objective shapes ADMIN-02 supports. Writing and Speaking
// prompt types arrive with ADMIN-03 alongside the rubric editor that
// owns them, so they are absent here and refused by the database.
export const QUESTION_TYPES = [
  "single_choice",
  "dropdown_sentence_completion",
  "reading_correspondence_choice",
  "reading_information_choice",
  "reading_viewpoints_choice",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: "Single choice",
  dropdown_sentence_completion: "Dropdown sentence completion",
  reading_correspondence_choice: "Reading correspondence choice",
  reading_information_choice: "Reading for information choice",
  reading_viewpoints_choice: "Reading for viewpoints choice",
};

export const QUESTION_TYPE_HINTS: Record<QuestionType, string> = {
  single_choice:
    "One prompt and a list of options, normally A to D. The Listening shape.",
  dropdown_sentence_completion:
    "A sentence with a blank in it. The stem carries the sentence, the options fill the blank.",
  reading_correspondence_choice:
    "A question about a letter or an email. The passage sits on the question.",
  reading_information_choice:
    "A question about an information passage, normally matched to a paragraph.",
  reading_viewpoints_choice:
    "A question about an opinion passage or a comment on one.",
};

// Every ADMIN-02 question type is marked against an answer key, so every
// one of them needs at least two options and a key. Kept as a named
// predicate rather than a hardcoded true, because ADMIN-03 adds prompt
// types that are not objective and this is the line that has to change.
export function isObjectiveQuestionType(type: QuestionType): boolean {
  return (QUESTION_TYPES as readonly string[]).includes(type);
}

// Which question types normally belong under which skill. Used to sort
// the select so the likely choice is first. It is a suggestion and not a
// rule: the database accepts any of the five under any part, because a
// Listening part can legitimately carry a sentence completion item.
export const SUGGESTED_QUESTION_TYPES: Record<
  SectionType,
  readonly QuestionType[]
> = {
  listening: ["single_choice", "dropdown_sentence_completion"],
  reading: [
    "reading_correspondence_choice",
    "reading_information_choice",
    "reading_viewpoints_choice",
    "dropdown_sentence_completion",
    "single_choice",
  ],
  writing: [],
  speaking: [],
};

// ---------------------------------------------------------------------
// Media types
// ---------------------------------------------------------------------

export const MEDIA_TYPES = [
  "audio",
  "video",
  "image",
  "thumbnail",
  "document",
  "other",
] as const;

export type MediaType = (typeof MEDIA_TYPES)[number];

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  audio: "Audio",
  video: "Video",
  image: "Image",
  thumbnail: "Thumbnail",
  document: "Document",
  other: "Other",
};

// The types where alt text carries meaning a learner would otherwise
// lose. Used by the validator, not by the database, because an image
// pasted as a placeholder should still save.
export const VISUAL_MEDIA_TYPES: readonly MediaType[] = [
  "image",
  "thumbnail",
];

// ---------------------------------------------------------------------
// Row shapes
// ---------------------------------------------------------------------

export type MockTestMediaAssetRow = {
  id: string;
  mock_test_id: string | null;
  section_id: string | null;
  part_id: string | null;
  media_type: MediaType | null;
  url: string | null;
  title: string | null;
  alt_text: string | null;
  transcript: string | null;
  // Staff only. Read on the media edit form and nowhere else.
  internal_notes: string | null;
  display_order: number;
};

export type MockTestQuestionRow = {
  id: string;
  mock_test_id: string | null;
  section_id: string | null;
  part_id: string | null;
  question_type: QuestionType;
  question_number: number;
  prompt: string | null;
  instruction: string | null;
  passage_text: string | null;
  stem: string | null;
  helper_text: string | null;
  media_asset_id: string | null;
  points: number;
  display_order: number;
  is_required: boolean;
  status: BuildStatus;
};

export type MockTestOptionRow = {
  id: string;
  question_id: string;
  option_label: string;
  option_text: string;
  display_order: number;
};

// ADMIN ONLY. This shape is never serialized into a learner route, and
// ADMIN-02 builds no learner route that could receive it.
export type MockTestAnswerKeyRow = {
  id: string;
  question_id: string;
  correct_option_id: string | null;
  correct_text: string | null;
  explanation: string | null;
  points: number;
};

// One question with everything the editor and the preview need attached.
export type MockTestQuestionWithContent = MockTestQuestionRow & {
  options: MockTestOptionRow[];
  answerKey: MockTestAnswerKeyRow | null;
};

// Everything under one part, which is what the part detail screen, the
// preview screen and the validator all work from.
export type MockTestPartContent = {
  questions: MockTestQuestionWithContent[];
  media: MockTestMediaAssetRow[];
};

// ---------------------------------------------------------------------
// Small display helpers
// ---------------------------------------------------------------------

export const QUESTION_STATUS_TONES: Record<BuildStatus, StatusToneName> = {
  draft: "neutral",
  ready: "success",
};

// The letters an options editor offers by default. A dropdown completion
// item often uses no letter at all, so the field stays free text and
// this is only what the add form prefills.
export const DEFAULT_OPTION_LABELS = ["A", "B", "C", "D", "E", "F"] as const;

// The next unused letter for a question that already has some options.
// Falls back to the count when every letter is taken, which is a state
// no CELPIP item reaches but a form should still survive.
export function suggestOptionLabel(existing: MockTestOptionRow[]): string {
  const used = new Set(
    existing.map((option) => option.option_label.trim().toUpperCase()),
  );

  const free = DEFAULT_OPTION_LABELS.find((label) => !used.has(label));

  return free ?? String(existing.length + 1);
}

// A short line naming a media asset in a select or a list. Falls back
// through title, then URL, so a row with neither is still identifiable.
export function describeMediaAsset(asset: MockTestMediaAssetRow): string {
  const type = asset.media_type
    ? MEDIA_TYPE_LABELS[asset.media_type]
    : "No media type";

  const name = asset.title?.trim() || asset.url?.trim() || "No URL";

  return `${type} - ${name}`;
}

// The one line a question shows while collapsed. Reads as a sentence
// rather than a row of dashes, so a half filled question is obvious.
export function describeQuestion(
  question: MockTestQuestionWithContent,
): string {
  const pieces: string[] = [
    QUESTION_TYPE_LABELS[question.question_type],
    `${question.options.length} option${question.options.length === 1 ? "" : "s"}`,
    question.answerKey && question.answerKey.correct_option_id
      ? "answer key set"
      : "no answer key",
    `${question.points} point${question.points === 1 ? "" : "s"}`,
  ];

  return pieces.join(" - ");
}

// The text a preview shows as the body of a question. A single choice
// item carries a prompt, a completion item carries a stem, and either
// alone is enough for the question to be renderable.
export function questionBodyText(question: MockTestQuestionRow): string {
  return question.prompt?.trim() || question.stem?.trim() || "";
}
