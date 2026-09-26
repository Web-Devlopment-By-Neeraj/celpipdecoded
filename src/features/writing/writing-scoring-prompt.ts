// Prompt construction for the AI writing feedback model. The prompts
// send the task context and the student's written response, require
// JSON output that matches writing-scoring-schema.ts, and keep the
// feedback framed as practice guidance, never as an official CELPIP
// score.

import { formatWordRange } from "./task-utils";
import { describeWritingBadgeMapping } from "./writing-level-badges";

export type WritingScoringPromptInput = {
  taskTitle: string;
  taskType: string;
  taskPrompt: string;
  taskNumber: number;
  timeSeconds: number;
  wordMin: number | null;
  wordMax: number | null;
  responseText: string;
  wordCount: number;
};

export const WRITING_SCORING_CATEGORIES = [
  "Task fulfillment",
  "Organization and coherence",
  "Vocabulary",
  "Grammar and sentence control",
  "Tone and clarity",
] as const;

// The exact JSON shape the model must return. Kept as a template in the
// prompt so the model sees every required key.
const RESPONSE_SHAPE = `{
  "estimated_level": 7,
  "level_label": "Developing toward test readiness",
  "badge_slug": "test-ready-builder",
  "overall_summary": "string",
  "task_fulfillment": { "score": 7, "feedback": "string", "improvement": "string" },
  "organization_coherence": { "score": 7, "feedback": "string", "improvement": "string" },
  "vocabulary": { "score": 7, "feedback": "string", "improvement": "string" },
  "grammar_sentence_control": { "score": 7, "feedback": "string", "improvement": "string" },
  "tone_clarity": { "score": 7, "feedback": "string", "improvement": "string" },
  "strengths": ["string"],
  "improvements": ["string"],
  "next_steps": ["string"],
  "suggested_structure": "string"
}`;

export function buildWritingScoringSystemPrompt(): string {
  return [
    "You are a CELPIP writing practice coach for CELPIP Decoded.",
    "You review a student's written response to a timed CELPIP-style writing task and return structured practice feedback.",
    "",
    "Rules:",
    "- This is practice feedback only. Never claim to give an official CELPIP score and never guarantee any test result.",
    "- Be specific and practical. Explain clearly what lowered the score and why.",
    "- Write for adult learners, newcomers, and students preparing for the CELPIP test. Use clear, professional, encouraging language.",
    "- Do not rewrite the whole response.",
    "- Do not be overly harsh and do not be fake positive. Give an honest, balanced review.",
    "- Focus feedback on what the student can improve in their next attempt.",
    "",
    `Score these five categories: ${WRITING_SCORING_CATEGORIES.join(", ")}.`,
    "Each category score is a whole number from 1 to 12, where 1 is a beginning writer and 12 is a highly advanced writer.",
    "estimated_level is a whole number from 1 to 12 that reflects the overall practice level of this response.",
    "level_label is a short plain phrase that describes the level, for example: Developing toward test readiness.",
    "",
    "Choose badge_slug from this mapping of estimated_level to slug:",
    describeWritingBadgeMapping(),
    "",
    "strengths, improvements, and next_steps must each contain 2 to 4 short, concrete items.",
    "suggested_structure is a short paragraph that describes a stronger structure for this task type, without rewriting the student's response.",
    "",
    "Respond with JSON only. No extra text. The JSON must match exactly this shape:",
    RESPONSE_SHAPE,
  ].join("\n");
}

export function buildWritingScoringUserPrompt(
  input: WritingScoringPromptInput,
): string {
  return [
    "Review this CELPIP writing practice attempt.",
    "",
    `Task title: ${input.taskTitle}`,
    `Task type: ${input.taskType}`,
    `Task number: ${input.taskNumber}`,
    `Time limit: ${input.timeSeconds} seconds`,
    `Word target: ${formatWordRange(input.wordMin, input.wordMax)}`,
    `Student word count: ${input.wordCount}`,
    "",
    "Task prompt:",
    input.taskPrompt,
    "",
    "Student's written response:",
    input.responseText,
    "",
    "This is practice feedback only, not an official CELPIP score.",
    "Return the practice feedback as JSON only, matching the required shape.",
  ].join("\n");
}
