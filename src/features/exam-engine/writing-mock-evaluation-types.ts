// Types for the Mock Test 1 Writing AI review and practice estimate
// (EXAM-26).
//
// EXAM-25 produced a Writing section that recorded two word counts and
// nothing else. This file is the shape of what the review adds: a
// per task judgement against the four CELPIP Writing criteria, an overall
// practice estimate for the section, and the material a learner needs to
// act on it.
//
// Types only, no runtime values, so the result screen and its cards can
// import from here without pulling a Zod schema or an OpenAI client into
// the browser bundle. The same rule writing-mock-types.ts follows. The
// runtime schema is writing-mock-evaluation-schema.ts, the prompt is
// writing-mock-evaluation-prompt.ts, and the pipeline that ties the two
// together is evaluate-writing-mock-test.ts.
//
// Every level on this file is a string rather than a number, and that is
// deliberate. A blank response has no level at all, and a numeric field
// would have to be filled with a 0 or a 1 that reads as a score the
// learner earned. A string can say "Insufficient response" and mean it.
//
// Nothing here is persisted. There is no database row behind any of these
// types, no migration, and no attempt id: an evaluation lives in React
// state for as long as the learner stays on the result screen.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// The four criteria a CELPIP Writing response is judged against.
//
// The third is Readability, not Listenability. Listenability belongs to
// Speaking, where a listener has to follow the response in real time.
// Writing is read, so the equivalent criterion is how easily the writing
// can be read: sentence control, punctuation, spelling and paragraphing.
// Naming it wrongly here would put the wrong word in front of a learner
// on every result screen, so the union is closed rather than a free
// string.
export type WritingMockCriterionName =
  | "Content/Coherence"
  | "Vocabulary"
  | "Readability"
  | "Task Fulfillment";

// One criterion, judged.
//
// evidence is what the writing actually does, quoted or described, so the
// level is anchored to the response rather than asserted. missingForNextLevel
// is the single change that would move this criterion up, which is the
// only part of a review a learner can act on straight away.
export type WritingMockCriterionResult = {
  criterion: WritingMockCriterionName;
  level: string;
  evidence: string;
  missingForNextLevel: string;
};

// One correction: what the learner wrote, what it should have been, and
// which criterion it belongs to.
//
// Reused for the top mistakes list and for the change summary on the
// rewrite, because they are the same three fields and a learner reads
// them the same way.
export type WritingMockMistake = {
  original: string;
  correction: string;
  criterion: string;
};

// The honest two sided note on a task: what the response did well, and
// where it fell short.
//
// Both fields are required, so a strong response still gets told what is
// holding it back and a weak one still gets told what worked. A review
// that is all praise or all fault is not usable either way.
export type WritingMockCriticalFeedback = {
  succeeded: string;
  fellShort: string;
};

// The learner's own response, rewritten one level up.
//
// Not a model answer: the point of this block is that it is recognisably
// the learner's writing with the specific weaknesses fixed, so the change
// summary can name each fix. targetLevel is one level above the estimate
// this task was given.
export type WritingMockRewrite = {
  targetLevel: string;
  response: string;
  changeSummary: WritingMockMistake[];
};

// A Level 11-12 response to the same prompt, written from scratch.
//
// The ceiling, so a learner can see the distance rather than guess at it.
// It is separate from the rewrite above because they answer different
// questions: the rewrite says "here is your writing, one level better",
// and this says "here is what the top of the scale looks like".
export type WritingMockModelResponse = {
  response: string;
};

// One task, reviewed.
//
// taskId matches WritingTaskContent.taskId, which is what lets the result
// screen line a review up against the task it belongs to without relying
// on array order.
export type WritingMockTaskResult = {
  taskId: string;
  taskTitle: string;
  wordCount: number;
  withinWordRange: boolean;
  estimatedLevel: string;
  oneSentenceJustification: string;
  // Empty on a task built locally because the response was blank. There
  // is nothing to judge against a criterion when nothing was written, and
  // four rows all reading "Insufficient response" would be four rows of
  // noise. A task the model reviewed always carries all four.
  criteria: WritingMockCriterionResult[];
  criticalFeedback: WritingMockCriticalFeedback;
  topMistakes: WritingMockMistake[];
  // null on a task with no writing in it. There is nothing to rewrite one
  // level up, and no model response is produced for a task that was never
  // sent to the model, so the cards are left out rather than filled with
  // an apology.
  nextLevelRewrite: WritingMockRewrite | null;
  levelElevenTwelveModel: WritingMockModelResponse | null;
  // Prompt points the response never addressed. Empty when it addressed
  // them all, which is the normal reading rather than an error.
  missingPromptPoints: string[];
  // Memorised filler that would be penalised on the official test, for
  // example a rehearsed opening pasted onto an unrelated prompt.
  templateLanguageWarnings: string[];
  // True when this result was built locally because the response was
  // blank, rather than judged by the model. The result screen draws such
  // a task as an insufficient response instead of as a low score, because
  // no writing was assessed and a level would be a fiction.
  //
  // Not part of the model's output. The server sets it. See
  // evaluate-writing-mock-test.ts.
  insufficientResponse: boolean;
};

// The whole Writing section, reviewed.
//
// overallEstimatedLevel is a conservative estimate for the section, not
// an average of the two tasks and not an average of the eight criterion
// levels. practiceDisclaimer travels with the result rather than being
// drawn from copy alone, so the sentence that says this is not an
// official CELPIP score is part of the payload the screen renders.
export type WritingMockEvaluation = {
  overallEstimatedLevel: string;
  overallJustification: string;
  practiceDisclaimer: string;
  taskResults: WritingMockTaskResult[];
};

// What the client sends to the server action.
//
// Two strings and nothing else. No task ids, no prompts and no word
// counts: the server holds the Mock Test 1 Writing content itself and
// counts the words itself, so nothing the browser sends can change which
// prompt a response is judged against or claim a length it does not have.
export type WritingMockEvaluationInput = {
  task1Response: string;
  task2Response: string;
};

// Why a review could not be produced.
//
// Separated from the message so the UI can react to a cause rather than
// match on prose. Every one of these ends on the same error screen today,
// but the codes are distinct because they have different fixes: signing
// in again, waiting for the model, or telling an administrator that the
// key is missing.
export type WritingMockEvaluationErrorCode =
  | "unauthenticated"
  | "not-configured"
  | "evaluation-failed";

// What the server action returns.
//
// A result object rather than a thrown error, because a thrown error
// inside a server action reaches the client as an opaque digest and the
// screen would have nothing to say. Nothing in the failure branch carries
// a provider message, a stack or a key: message is our own wording.
export type WritingMockEvaluationOutcome =
  | { ok: true; evaluation: WritingMockEvaluation }
  | { ok: false; code: WritingMockEvaluationErrorCode; message: string };
