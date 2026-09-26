// Prompt construction for the AI speaking feedback model. The prompts
// send the task context and the transcript, require JSON output that
// matches scoring-schema.ts, and keep the feedback framed as practice
// guidance, never as an official CELPIP score.

import { describeBadgeMapping } from "./level-badges";

export type ScoringPromptInput = {
  taskTitle: string;
  taskType: string;
  taskPrompt: string;
  prepSeconds: number;
  speakingSeconds: number;
  transcript: string;
};

export const SCORING_CATEGORIES = [
  "Content and coherence",
  "Vocabulary",
  "Listenability",
  "Task fulfillment",
] as const;

// The exact JSON shape the model must return. Kept as a template in the
// prompt so the model sees every required key.
const RESPONSE_SHAPE = `{
  "estimated_level": 7,
  "level_label": "Developing toward test readiness",
  "badge_slug": "test-ready-builder",
  "overall_summary": "string",
  "content_coherence": { "score": 7, "feedback": "string", "improvement": "string" },
  "vocabulary": { "score": 7, "feedback": "string", "improvement": "string" },
  "listenability": { "score": 7, "feedback": "string", "improvement": "string" },
  "task_fulfillment": { "score": 7, "feedback": "string", "improvement": "string" },
  "strengths": ["string"],
  "improvements": ["string"],
  "next_steps": ["string"]
}`;

export function buildScoringSystemPrompt(): string {
  return [
    "You are a CELPIP speaking practice coach for CELPIP Decoded.",
    "You review the transcript of a student's spoken answer to a timed CELPIP-style speaking task and return structured practice feedback.",
    "",
    "Rules:",
    "- This is practice feedback only. Never claim to give an official CELPIP score and never guarantee any test result.",
    "- Be specific and practical. Point out clearly what lost points and why.",
    "- Write for newcomers and adult learners preparing for the CELPIP test. Use clear, professional, encouraging language.",
    "- Do not rewrite the whole answer.",
    "- Do not be overly harsh and do not be fake positive. Give an honest, balanced review.",
    "- Focus feedback on what the student can improve in their next attempt.",
    "- The transcript comes from automatic speech recognition, so ignore small transcription artifacts and do not penalize them.",
    "",
    `Score these four categories: ${SCORING_CATEGORIES.join(", ")}.`,
    "Each category score is a whole number from 1 to 12, where 1 is a beginning speaker and 12 is a highly advanced speaker.",
    "estimated_level is a whole number from 1 to 12 that reflects the overall practice level of this answer.",
    "level_label is a short plain phrase that describes the level, for example: Developing toward test readiness.",
    "",
    "Choose badge_slug from this mapping of estimated_level to slug:",
    describeBadgeMapping(),
    "",
    "strengths, improvements, and next_steps must each contain 2 to 4 short, concrete items.",
    "",
    "Respond with JSON only. No extra text. The JSON must match exactly this shape:",
    RESPONSE_SHAPE,
  ].join("\n");
}

export function buildScoringUserPrompt(input: ScoringPromptInput): string {
  return [
    "Review this CELPIP speaking practice attempt.",
    "",
    `Task title: ${input.taskTitle}`,
    `Task type: ${input.taskType}`,
    `Preparation time: ${input.prepSeconds} seconds`,
    `Speaking time: ${input.speakingSeconds} seconds`,
    "",
    "Task prompt:",
    input.taskPrompt,
    "",
    "Transcript of the student's spoken answer:",
    input.transcript,
    "",
    "Return the practice feedback as JSON only, matching the required shape.",
  ].join("\n");
}
