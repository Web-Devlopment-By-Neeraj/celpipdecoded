// Repeated exam wording for every uploaded practice test.
//
// A photo-and-write task uses the same instruction on Mock Test 2 as it
// does on Mock Test 5. Only the picture, the passage, the clip and the
// questions change, and those come from the client's file. This module is
// the part that does not change. The file must not carry these lines.
//
// House style: normal hyphens only, straight quotes only.

import {
  PART_TYPE_LABELS,
  type PartType,
  type SectionType,
} from "@/features/admin/mock-test-types";
import type { ReadingTaskScreen } from "@/features/exam-engine/reading-flow";

export type PartExamTemplate = {
  formatLabel: string;
  instructions: string[];
  listenLine: string;
  passageLabel: string;
  passageInstruction: string;
  readingTaskScreen: ReadingTaskScreen | null;
  readingSeconds: number;
  writingSeconds: number;
  wordMin: number;
  wordMax: number;
  situationInstruction: string;
  promptInstruction: string;
  speakingPrompt: string;
  prepSeconds: number;
  responseSeconds: number;
};

const listening = (
  formatLabel: string,
  listenLine: string,
): PartExamTemplate => ({
  formatLabel,
  instructions: [
    listenLine,
    "Then answer the questions. Choose the best answer for each one.",
  ],
  listenLine,
  passageLabel: "Situation",
  passageInstruction: "Read the situation, then listen.",
  readingTaskScreen: null,
  readingSeconds: 0,
  writingSeconds: 0,
  wordMin: 0,
  wordMax: 0,
  situationInstruction: "",
  promptInstruction: "",
  speakingPrompt: "",
  prepSeconds: 0,
  responseSeconds: 0,
});

export const PART_EXAM_TEMPLATES: Record<PartType, PartExamTemplate> = {
  listening_problem_solving: listening(
    "A conversation and questions about a problem",
    "Listen to the conversation.",
  ),
  listening_daily_conversation: listening(
    "A daily conversation and questions",
    "Listen to the conversation.",
  ),
  listening_information: listening(
    "An information clip and questions",
    "Listen to the information.",
  ),
  listening_news_item: listening(
    "A news item and questions",
    "Listen to the news item.",
  ),
  listening_discussion: listening(
    "A discussion and questions",
    "Listen to the discussion.",
  ),
  listening_viewpoints: listening(
    "A viewpoints clip and questions",
    "Listen to the viewpoints.",
  ),
  reading_correspondence: {
    formatLabel: "A message and questions about it",
    instructions: [
      "Read the message.",
      "Answer the questions from what the message says.",
    ],
    listenLine: "",
    passageLabel: "Message",
    passageInstruction: "Read the following message.",
    readingTaskScreen: "correspondence",
    readingSeconds: 11 * 60,
    writingSeconds: 0,
    wordMin: 0,
    wordMax: 0,
    situationInstruction: "",
    promptInstruction: "",
    speakingPrompt: "",
    prepSeconds: 0,
    responseSeconds: 0,
  },
  reading_diagram: {
    formatLabel: "A diagram and questions about it",
    instructions: [
      "Look at the diagram.",
      "Answer the questions from what the diagram shows.",
    ],
    listenLine: "",
    passageLabel: "Diagram",
    passageInstruction: "Read the diagram.",
    readingTaskScreen: "diagram",
    readingSeconds: 9 * 60,
    writingSeconds: 0,
    wordMin: 0,
    wordMax: 0,
    situationInstruction: "",
    promptInstruction: "",
    speakingPrompt: "",
    prepSeconds: 0,
    responseSeconds: 0,
  },
  reading_information: {
    formatLabel: "Labelled paragraphs and questions",
    instructions: [
      "Read the paragraphs.",
      "Answer each question from the paragraph that contains the information.",
    ],
    listenLine: "",
    passageLabel: "Information",
    passageInstruction: "Read the following information.",
    readingTaskScreen: "information",
    readingSeconds: 10 * 60,
    writingSeconds: 0,
    wordMin: 0,
    wordMax: 0,
    situationInstruction: "",
    promptInstruction: "",
    speakingPrompt: "",
    prepSeconds: 0,
    responseSeconds: 0,
  },
  reading_viewpoints: {
    formatLabel: "An article and questions about viewpoints",
    instructions: [
      "Read the article.",
      "Answer the questions about what the writers think.",
    ],
    listenLine: "",
    passageLabel: "Article",
    passageInstruction: "Read the following article.",
    readingTaskScreen: "viewpoints",
    readingSeconds: 13 * 60,
    writingSeconds: 0,
    wordMin: 0,
    wordMax: 0,
    situationInstruction: "",
    promptInstruction: "",
    speakingPrompt: "",
    prepSeconds: 0,
    responseSeconds: 0,
  },
  writing_email: {
    formatLabel: "An email task",
    instructions: [
      "Read the situation.",
      "Write an email in the editor. The picture, when there is one, is part of the task.",
    ],
    listenLine: "",
    passageLabel: "",
    passageInstruction: "",
    readingTaskScreen: null,
    readingSeconds: 0,
    writingSeconds: 27 * 60,
    wordMin: 150,
    wordMax: 200,
    situationInstruction: "Read the following information.",
    promptInstruction: "Write an email about the situation. Use the picture if one is shown.",
    speakingPrompt: "",
    prepSeconds: 0,
    responseSeconds: 0,
  },
  writing_survey: {
    formatLabel: "A survey response",
    instructions: [
      "Read the survey situation.",
      "Write your response in the editor.",
    ],
    listenLine: "",
    passageLabel: "",
    passageInstruction: "",
    readingTaskScreen: null,
    readingSeconds: 0,
    writingSeconds: 26 * 60,
    wordMin: 150,
    wordMax: 200,
    situationInstruction: "Read the following information.",
    promptInstruction: "Write your response to the survey. Use the picture if one is shown.",
    speakingPrompt: "",
    prepSeconds: 0,
    responseSeconds: 0,
  },
  speaking_task: {
    formatLabel: "A speaking prompt",
    instructions: ["Read the prompt.", "Prepare, then record your answer."],
    listenLine: "",
    passageLabel: "",
    passageInstruction: "",
    readingTaskScreen: null,
    readingSeconds: 0,
    writingSeconds: 0,
    wordMin: 0,
    wordMax: 0,
    situationInstruction: "",
    promptInstruction: "",
    speakingPrompt: "Speak about the situation.",
    prepSeconds: 30,
    responseSeconds: 60,
  },
  speaking_image_task: {
    formatLabel: "A picture and a speaking prompt",
    instructions: [
      "Look at the picture.",
      "Prepare, then describe what you see.",
    ],
    listenLine: "",
    passageLabel: "",
    passageInstruction: "",
    readingTaskScreen: null,
    readingSeconds: 0,
    writingSeconds: 0,
    wordMin: 0,
    wordMax: 0,
    situationInstruction: "",
    promptInstruction: "",
    speakingPrompt: "Look at the picture, then speak about what you see.",
    prepSeconds: 30,
    responseSeconds: 60,
  },
  speaking_comparison_task: {
    formatLabel: "A comparison speaking prompt",
    instructions: [
      "Look at the picture.",
      "Prepare, then compare the choices.",
    ],
    listenLine: "",
    passageLabel: "",
    passageInstruction: "",
    readingTaskScreen: null,
    readingSeconds: 0,
    writingSeconds: 0,
    wordMin: 0,
    wordMax: 0,
    situationInstruction: "",
    promptInstruction: "",
    speakingPrompt: "Look at the picture, then compare the choices.",
    prepSeconds: 60,
    responseSeconds: 60,
  },
};

export const SECTION_EXAM_LINES: Record<SectionType, string[]> = {
  listening: [
    "Each part starts with a recording, then the questions for that recording.",
    "You can replay a clip in this practice test.",
    "Answer every question. A question you leave blank is marked wrong.",
  ],
  reading: [
    "Each part is a passage or a diagram on the left and the questions on the right.",
    "The clock is for the whole part.",
    "Answer every question. A question you leave blank is marked wrong.",
  ],
  writing: [
    "Each task gives you a situation and an editor.",
    "A picture, when the task has one, is part of the situation. The instruction stays the same from test to test.",
    "Nothing you type is saved after you leave the page.",
  ],
  speaking: [
    "Each task gives you time to prepare, then time to record.",
    "A picture, when the task has one, is the thing you speak about. The instruction stays the same from test to test.",
    "The recording stays in this browser until you leave the page.",
  ],
};

export function partExamTemplate(partType: PartType): PartExamTemplate {
  return PART_EXAM_TEMPLATES[partType];
}

export function partFormatLabel(partType: PartType): string {
  return PART_EXAM_TEMPLATES[partType].formatLabel || PART_TYPE_LABELS[partType];
}
