// Zod schema for the Mock Test 1 Speaking review (EXAM-28).
//
// The model is asked for JSON and JSON is not a promise. Everything that
// comes back is parsed through this file before any of it reaches a
// screen, so a missing key, a renamed criterion or a number where a
// string belongs fails on the server as a validation error rather than
// on the client as a blank card or a crash.
//
// What this file validates is the scoring model's output only. Five
// fields on the finished result never come from it at all:
//
// - responseTimeLimitSeconds, which is the task's own recording window
//   from the section content, so a model that misremembers it cannot
//   print a wrong limit beside a learner's answer
// - recordedDurationSeconds, which is measured in the browser and
//   clamped on the server
// - transcript, which is what the transcription model wrote down. The
//   scoring model is shown it and never asked to repeat it, because a
//   model that paraphrases a transcript back would quietly tidy the
//   fillers and restarts that Listenability is judged on
// - transcriptConfidenceNote, which is our own fixed wording about what
//   a transcript can be relied on for
// - recordingStatus, which the server sets. The scoring model only ever
//   sees tasks that were recorded and transcribed, so it cannot know
//   that another one was missing
//
// So the schema below is the task result minus those five, and
// evaluate-speaking-mock-test.ts is where the two halves are joined.
//
// The criterion names are an enum rather than a free string. They are
// the four CELPIP Speaking criteria and the third one is Listenability:
// a model that returns Readability, or Pronunciation, or four criteria
// in a different order, is returning a review of something other than
// what was asked for, and the parse should say so rather than render it.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { z } from "zod";
import type {
  SpeakingMockCriterionName,
  SpeakingMockTaskResult,
} from "./speaking-mock-evaluation-types";

// The four criteria, in the order a result screen prints them.
//
// The one runtime list in the feature. The prompt names them from here
// and the schema validates against them from here, so the model can
// never be asked for one set and checked against another.
//
// Listenability is third, where Writing has Readability. That is the
// difference the ticket calls out by name, and it is enforced here
// rather than only stated in a comment.
export const SPEAKING_MOCK_CRITERIA: readonly SpeakingMockCriterionName[] = [
  "Content/Coherence",
  "Vocabulary",
  "Listenability",
  "Task Fulfillment",
] as const;

// A level reading, for example "Level 7" or "No recording submitted".
//
// Free text with a length cap rather than a number, for the reason
// speaking-mock-evaluation-types.ts gives: a task with no recording has
// no level, and a scale that cannot express that would have to invent
// one. The cap stops a model turning the headline reading into a
// paragraph.
const levelSchema = z.string().trim().min(1).max(60);

// Prose fields. Capped so one runaway field cannot make a card
// unreadable, and trimmed so a model that pads with newlines does not
// push a card open.
const shortTextSchema = z.string().trim().min(1).max(600);
// Spoken answers are shorter than written ones, so the ceiling here sits
// below the Writing one. A 90 second answer is a few hundred words, and
// a rewrite that runs to 4,000 characters is not a rewrite of something
// sayable in the window.
const longTextSchema = z.string().trim().min(1).max(3000);

const criterionSchema = z.object({
  criterion: z.enum(SPEAKING_MOCK_CRITERIA),
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

// One task as the scoring model returns it.
//
// The four criteria are required and exactly four, so a result screen
// always draws a full table. Ordering is not enforced here: the server
// sorts them into SPEAKING_MOCK_CRITERIA order, so every task on every
// result screen prints its rows in the same order whatever order the
// model chose.
export const speakingMockTaskResultSchema = z.object({
  taskId: z.string().trim().min(1).max(120),
  taskTitle: z.string().trim().min(1).max(160),
  estimatedLevel: levelSchema,
  oneSentenceJustification: shortTextSchema,
  // The one length judgement the model does make, because it is a
  // reading of the answer rather than a measurement of it. The two
  // numbers it reads from are the server's.
  timeLengthCheck: shortTextSchema,
  criteria: z.array(criterionSchema).length(SPEAKING_MOCK_CRITERIA.length),
  criticalFeedback: criticalFeedbackSchema,
  topMistakes: z.array(mistakeSchema).max(8),
  nextLevelRewrite: rewriteSchema,
  levelElevenTwelveModel: modelResponseSchema,
  missingPromptPoints: z.array(z.string().trim().min(1).max(400)).max(10),
  templateLanguageWarnings: z.array(z.string().trim().min(1).max(400)).max(10),
});

// The whole reply.
//
// taskResults is capped at the number of tasks a Speaking section has,
// and the server drops any result whose taskId it did not ask about, so
// a model that invents a ninth task cannot add a card to the screen.
//
// audioAssessmentNote is asked for and then replaced by the server with
// its own fixed sentence. Asking for it keeps the limitation in front of
// the model while it writes the rest of the review, which is the point:
// a model told to state what it cannot judge is less likely to claim it
// elsewhere. What a learner reads is our wording, not its wording.
export const speakingMockEvaluationResponseSchema = z.object({
  overallEstimatedLevel: levelSchema,
  overallJustification: shortTextSchema,
  practiceDisclaimer: shortTextSchema,
  audioAssessmentNote: shortTextSchema,
  taskResults: z.array(speakingMockTaskResultSchema).min(1).max(12),
});

export type SpeakingMockTaskResultResponse = z.infer<
  typeof speakingMockTaskResultSchema
>;
export type SpeakingMockEvaluationResponse = z.infer<
  typeof speakingMockEvaluationResponseSchema
>;

// Put the criteria into the fixed order the screens print them in.
//
// A criterion the model somehow left out cannot occur, because the
// schema requires exactly four of the four enum members, but a duplicate
// can: four entries could be two Vocabulary rows and two Listenability
// rows. The filter below keeps the first of each named criterion and
// drops the rest, and anything left over is appended so nothing the
// model said is silently thrown away.
export function orderSpeakingMockCriteria(
  criteria: SpeakingMockTaskResultResponse["criteria"],
): SpeakingMockTaskResultResponse["criteria"] {
  const ordered = SPEAKING_MOCK_CRITERIA.map((name) =>
    criteria.find((entry) => entry.criterion === name),
  ).filter(
    (entry): entry is SpeakingMockTaskResultResponse["criteria"][number] =>
      entry !== undefined,
  );

  const extras = criteria.filter((entry) => !ordered.includes(entry));

  return [...ordered, ...extras];
}

// The five fields the server owns on a reviewed task.
//
// Named as a type rather than five positional arguments, because five
// arguments of which two are numbers and three are strings is a call
// nobody can read at the call site.
export type SpeakingMockServerTaskFacts = {
  responseTimeLimitSeconds: number;
  recordedDurationSeconds: number;
  transcript: string;
  transcriptConfidenceNote: string;
};

// Join a validated model task result to the fields the server owns.
//
// recordingStatus is always "recorded" here, because a task only reaches
// this function when it had reviewable speech in it and was sent to the
// model. The other three statuses never come through here: see
// buildUnscoredSpeakingTaskResult in evaluate-speaking-mock-test.ts.
export function toSpeakingMockTaskResult(
  parsed: SpeakingMockTaskResultResponse,
  facts: SpeakingMockServerTaskFacts,
): SpeakingMockTaskResult {
  return {
    ...parsed,
    criteria: orderSpeakingMockCriteria(parsed.criteria),
    responseTimeLimitSeconds: facts.responseTimeLimitSeconds,
    recordedDurationSeconds: facts.recordedDurationSeconds,
    transcript: facts.transcript,
    transcriptConfidenceNote: facts.transcriptConfidenceNote,
    recordingStatus: "recorded",
  };
}

// Parse an unknown reply into a validated model response.
//
// Returns null rather than throwing, so the pipeline treats a malformed
// reply exactly like a failed call: one error screen with a retry on it,
// and no provider text anywhere near the learner.
export function parseSpeakingMockEvaluationResponse(
  value: unknown,
): SpeakingMockEvaluationResponse | null {
  const parsed = speakingMockEvaluationResponseSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}

// The metadata part of a submission, as it arrives from the browser.
//
// Validated rather than trusted, because the API route is reachable by
// direct POST and everything in this object is a claim. Nothing in it
// can change which prompt an answer is judged against: there is no
// prompt field, no title field and no time limit field to send.
//
// durationSeconds is capped at an hour rather than at a task window. A
// learner who talked past the limit should have that fact reach the
// review, because running past the window is exactly the Task
// Fulfillment problem the length check has to report. The cap is only
// there so a nonsense number cannot reach the prompt.
export const speakingMockSubmissionMetadataSchema = z.object({
  tasks: z
    .array(
      z.object({
        taskId: z.string().trim().min(1).max(120),
        taskNumber: z.number().int().min(1).max(50),
        durationSeconds: z.number().min(0).max(3600),
        hasRecording: z.boolean(),
        mimeType: z.string().trim().max(120).optional(),
      }),
    )
    .max(50),
});

export type SpeakingMockSubmissionMetadataResponse = z.infer<
  typeof speakingMockSubmissionMetadataSchema
>;

// Parse the metadata part of a submission.
//
// Returns null rather than throwing, so a malformed part is one 400 with
// our own wording rather than an unhandled rejection in a route handler.
export function parseSpeakingMockSubmissionMetadata(
  value: unknown,
): SpeakingMockSubmissionMetadataResponse | null {
  const parsed = speakingMockSubmissionMetadataSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}
