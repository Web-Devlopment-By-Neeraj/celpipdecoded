// Zod schema for the Mock Test 1 Writing review (EXAM-26).
//
// The model is asked for JSON and JSON is not a promise. Everything that
// comes back is parsed through this file before any of it reaches a
// screen, so a missing key, a renamed criterion or a number where a
// string belongs fails on the server as a validation error rather than
// on the client as a blank card or a crash.
//
// What this file validates is the model's output only. Two fields on the
// finished result never come from the model at all:
//
// - wordCount, which the server counts itself with countWritingWords, so
//   a model that miscounts cannot print a wrong number beside a response
// - insufficientResponse, which the server sets for a task it did not
//   send to the model because the response was blank
//
// So the schema below is the task result minus those, and
// evaluate-writing-mock-test.ts is where the two halves are joined.
//
// The criterion names are an enum rather than a free string. They are the
// four CELPIP Writing criteria and the third one is Readability: a model
// that returns Listenability, or Grammar, or four criteria in a different
// order, is returning a review of something other than what was asked
// for, and the parse should say so rather than render it.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { z } from "zod";
import type {
  WritingMockCriterionName,
  WritingMockTaskResult,
} from "./writing-mock-evaluation-types";

// The four criteria, in the order a result screen prints them.
//
// The one runtime list in the feature. The prompt names them from here
// and the schema validates against them from here, so the model can never
// be asked for one set and checked against another.
export const WRITING_MOCK_CRITERIA: readonly WritingMockCriterionName[] = [
  "Content/Coherence",
  "Vocabulary",
  "Readability",
  "Task Fulfillment",
] as const;

// A level reading, for example "Level 7" or "Insufficient response".
//
// Free text with a length cap rather than a number, for the reason
// writing-mock-evaluation-types.ts gives: a blank response has no level,
// and a scale that cannot express that would have to invent one. The cap
// stops a model turning the headline reading into a paragraph.
const levelSchema = z.string().trim().min(1).max(60);

// Prose fields. Capped so one runaway field cannot make a card
// unreadable, and trimmed so a model that pads with newlines does not
// push a card open.
const shortTextSchema = z.string().trim().min(1).max(600);
const longTextSchema = z.string().trim().min(1).max(4000);

const criterionSchema = z.object({
  criterion: z.enum(WRITING_MOCK_CRITERIA),
  level: levelSchema,
  evidence: shortTextSchema,
  missingForNextLevel: shortTextSchema,
});

const mistakeSchema = z.object({
  original: z.string().trim().min(1).max(600),
  correction: z.string().trim().min(1).max(600),
  criterion: z.string().trim().min(1).max(60),
});

const criticalFeedbackSchema = z.object({
  succeeded: shortTextSchema,
  fellShort: shortTextSchema,
});

const rewriteSchema = z.object({
  targetLevel: levelSchema,
  response: longTextSchema,
  // Capped at six, because a change summary is a list a learner reads,
  // not an audit trail. A model that wants to list twenty edits is
  // listing the rewrite twice.
  changeSummary: z.array(mistakeSchema).max(6),
});

const modelResponseSchema = z.object({
  response: longTextSchema,
});

// One task as the model returns it.
//
// The four criteria are required and exactly four, so a result screen
// always draws a full table. Ordering is not enforced here: the server
// sorts them into WRITING_MOCK_CRITERIA order, so every task on every
// result screen prints its rows in the same order whatever order the
// model chose.
export const writingMockTaskResultSchema = z.object({
  taskId: z.string().trim().min(1).max(120),
  taskTitle: z.string().trim().min(1).max(160),
  withinWordRange: z.boolean(),
  estimatedLevel: levelSchema,
  oneSentenceJustification: shortTextSchema,
  criteria: z.array(criterionSchema).length(WRITING_MOCK_CRITERIA.length),
  criticalFeedback: criticalFeedbackSchema,
  topMistakes: z.array(mistakeSchema).max(8),
  nextLevelRewrite: rewriteSchema,
  levelElevenTwelveModel: modelResponseSchema,
  missingPromptPoints: z.array(z.string().trim().min(1).max(400)).max(10),
  templateLanguageWarnings: z.array(z.string().trim().min(1).max(400)).max(10),
});

// The whole reply.
//
// taskResults is capped at the number of tasks a Writing section has, and
// the server drops any result whose taskId it did not ask about, so a
// model that invents a third task cannot add a card to the screen.
export const writingMockEvaluationResponseSchema = z.object({
  overallEstimatedLevel: levelSchema,
  overallJustification: shortTextSchema,
  practiceDisclaimer: shortTextSchema,
  taskResults: z.array(writingMockTaskResultSchema).min(1).max(4),
});

export type WritingMockTaskResultResponse = z.infer<
  typeof writingMockTaskResultSchema
>;
export type WritingMockEvaluationResponse = z.infer<
  typeof writingMockEvaluationResponseSchema
>;

// Put the criteria into the fixed order the screens print them in.
//
// A criterion the model somehow left out cannot occur, because the schema
// requires exactly four of the four enum members, but a duplicate can:
// four entries could be two Vocabulary rows and two Readability rows. The
// filter below keeps the first of each named criterion and drops the
// rest, and anything left over is appended so nothing the model said is
// silently thrown away.
export function orderWritingMockCriteria(
  criteria: WritingMockTaskResultResponse["criteria"],
): WritingMockTaskResultResponse["criteria"] {
  const ordered = WRITING_MOCK_CRITERIA.map((name) =>
    criteria.find((entry) => entry.criterion === name),
  ).filter(
    (entry): entry is WritingMockTaskResultResponse["criteria"][number] =>
      entry !== undefined,
  );

  const extras = criteria.filter((entry) => !ordered.includes(entry));

  return [...ordered, ...extras];
}

// Join a validated model task result to the two fields the server owns.
//
// wordCount is the server's own count and insufficientResponse is false,
// because a task only reaches this function when it had writing in it and
// was sent to the model. The blank case never comes through here: see
// buildInsufficientWritingTaskResult in evaluate-writing-mock-test.ts.
export function toWritingMockTaskResult(
  parsed: WritingMockTaskResultResponse,
  wordCount: number,
): WritingMockTaskResult {
  return {
    ...parsed,
    criteria: orderWritingMockCriteria(parsed.criteria),
    wordCount,
    insufficientResponse: false,
  };
}

// Parse an unknown reply into a validated model response.
//
// Returns null rather than throwing, so the pipeline treats a malformed
// reply exactly like a failed call: one error screen with a retry on it,
// and no provider text anywhere near the learner.
export function parseWritingMockEvaluationResponse(
  value: unknown,
): WritingMockEvaluationResponse | null {
  const parsed = writingMockEvaluationResponseSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}
