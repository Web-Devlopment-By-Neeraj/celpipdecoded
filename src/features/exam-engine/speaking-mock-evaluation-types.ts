// Types for the Mock Test 1 Speaking AI review and practice estimate
// (EXAM-28).
//
// EXAM-27 produced a Speaking section that recorded eight blobs and
// reported which of them existed. This file is the shape of what the
// review adds: a per task judgement against the four CELPIP Speaking
// criteria, the transcript that judgement was made from, an overall
// practice estimate for the section, and the material a learner needs to
// act on it.
//
// The Writing counterpart is writing-mock-evaluation-types.ts, and most
// of the shape is deliberately the same so the two result screens read
// alike. Four things are different, and each of them is a fact about
// speech rather than a preference:
//
// - the third criterion is Listenability, not Readability. A Writing
//   response is read; a Speaking response has to be followed by a
//   listener in real time, with no chance to go back over a sentence
// - a task carries a transcript, because nothing a learner said is
//   visible until something writes it down. The transcript is on the
//   result rather than beside it, so a criterion level and the words it
//   was drawn from can never be shown apart
// - a task carries two timings rather than a word count: the recording
//   window the task allows, and how long the learner actually spoke.
//   Length on a spoken answer is time, not words
// - a task carries a recording status rather than a single blank flag.
//   A Writing response is written or it is not; a Speaking response can
//   be missing, recorded, recorded but untranscribable, or transcribed
//   into almost nothing, and those four need different words on screen
//
// Types only, no runtime values, so the result screen and its cards can
// import from here without pulling a Zod schema or an OpenAI client into
// the browser bundle. The same rule speaking-mock-types.ts follows. The
// runtime schema is speaking-mock-evaluation-schema.ts, the prompt is
// speaking-mock-evaluation-prompt.ts, the transcription step is
// transcribe-speaking-mock-audio.ts, and the pipeline that ties them
// together is evaluate-speaking-mock-test.ts.
//
// Every level here is a string rather than a number, and that is
// deliberate. A task with no recording has no level at all, and a
// numeric field would have to be filled with a 0 or a 1 that reads as a
// score the learner earned. A string can say "No recording submitted"
// and mean it.
//
// Nothing here is persisted. There is no database row behind any of
// these types, no migration, no attempt id and no storage path: an
// evaluation lives in React state for as long as the learner stays on
// the result screen, and the audio it was made from never leaves the
// request that carried it.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// The four criteria a CELPIP Speaking response is judged against.
//
// The third is Listenability, not Readability. Readability belongs to
// Writing, where a reader can slow down, re-read a clause and take the
// punctuation as a guide. Listenability is whether a listener can follow
// the response as it is spoken: pace, pausing, hesitation, repair, and
// how much work the listener has to do. Naming it wrongly here would put
// the wrong word in front of a learner on every result screen, so the
// union is closed rather than a free string.
export type SpeakingMockCriterionName =
  | "Content/Coherence"
  | "Vocabulary"
  | "Listenability"
  | "Task Fulfillment";

// What happened to the recording for one task.
//
// Four values rather than a boolean, because a Speaking task can fail to
// produce a reviewable answer in four different ways and each needs
// different words on the screen:
//
// - "recorded" means audio arrived, was transcribed, and the transcript
//   had enough in it to review
// - "missing" means no audio arrived for this task at all. The learner
//   skipped it, had no microphone, or moved past it without recording
// - "transcription_failed" means audio arrived and the transcription
//   call did not return usable text for it. That is not the learner's
//   fault and the screen must not read as though it were
// - "insufficient_response" means audio arrived and was transcribed, but
//   into so little speech that there is nothing to judge. A one word
//   answer, or a recording of silence
//
// Only "recorded" tasks are sent to the scoring model. The other three
// are built server side, because there is nothing to ask about.
export type SpeakingMockRecordingStatus =
  | "recorded"
  | "missing"
  | "transcription_failed"
  | "insufficient_response";

// One criterion, judged.
//
// evidence is what the response actually does, quoted from the
// transcript or described, so the level is anchored to what was said
// rather than asserted. missingForNextLevel is the single change that
// would move this criterion up, which is the only part of a review a
// learner can act on straight away.
export type SpeakingMockCriterionResult = {
  criterion: SpeakingMockCriterionName;
  level: string;
  evidence: string;
  missingForNextLevel: string;
};

// One correction: what the learner said, what would have been stronger,
// and which criterion it belongs to.
//
// Reused for the top mistakes list and for the change summary on the
// rewrite, because they are the same three fields and a learner reads
// them the same way.
export type SpeakingMockMistake = {
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
export type SpeakingMockCriticalFeedback = {
  succeeded: string;
  fellShort: string;
};

// The learner's own answer, rewritten one level up, as it would be
// spoken.
//
// Not a model answer: the point of this block is that it is recognisably
// the learner's own answer with the specific weaknesses fixed, so the
// change summary can name each fix. targetLevel is one level above the
// estimate this task was given.
//
// It is a spoken rewrite rather than a written one, so it carries none
// of the scaffolding a written answer would have and has to be sayable
// inside the task's recording window.
export type SpeakingMockRewrite = {
  targetLevel: string;
  response: string;
  changeSummary: SpeakingMockMistake[];
};

// A Level 11-12 spoken answer to the same prompt, written from scratch.
//
// The ceiling, so a learner can see the distance rather than guess at
// it. It is separate from the rewrite above because they answer
// different questions: the rewrite says "here is your answer, one level
// better", and this says "here is what the top of the scale sounds
// like".
export type SpeakingMockModelResponse = {
  response: string;
};

// One task, reviewed.
//
// taskId matches SpeakingTaskContent.taskId, which is what lets the
// result screen line a review up against the task it belongs to without
// relying on array order.
export type SpeakingMockTaskResult = {
  taskId: string;
  taskTitle: string;
  // The recording window the task allows, from
  // SpeakingTaskContent.responseTimer.seconds. The server's own figure,
  // never the model's and never the browser's.
  responseTimeLimitSeconds: number;
  // How long the learner actually spoke, in seconds. 0 on a task with no
  // recording.
  recordedDurationSeconds: number;
  // What the transcription model wrote down. Empty string on a task with
  // no recording and on a task whose transcription failed.
  //
  // Not corrected, not tidied and not punctuated into shape. Fillers,
  // restarts and self-corrections are the evidence Listenability is
  // judged on, so a transcript with them cleaned out would be a
  // transcript of a better answer than the one that was given.
  transcript: string;
  // What the transcript can and cannot be relied on for. Set by the
  // server, not the model. See audioAssessmentNote below.
  transcriptConfidenceNote: string;
  estimatedLevel: string;
  oneSentenceJustification: string;
  // Whether the answer used its window: too short, about right, or run
  // past the limit. A sentence rather than a flag, because "22 seconds
  // of a 60 second window" and "cut off mid sentence at the limit" are
  // different problems with the same verdict.
  timeLengthCheck: string;
  // Empty on a task built locally because there was no reviewable
  // recording. There is nothing to judge against a criterion when
  // nothing was said, and four rows all reading "No recording" would be
  // four rows of noise. A task the model reviewed always carries all
  // four.
  criteria: SpeakingMockCriterionResult[];
  criticalFeedback: SpeakingMockCriticalFeedback;
  topMistakes: SpeakingMockMistake[];
  // null on a task with no reviewable recording. There is nothing to
  // rewrite one level up, and no model answer is produced for a task
  // that was never sent to the model, so the cards are left out rather
  // than filled with an apology.
  nextLevelRewrite: SpeakingMockRewrite | null;
  levelElevenTwelveModel: SpeakingMockModelResponse | null;
  // Prompt points the answer never addressed. Empty when it addressed
  // them all, which is the normal reading rather than an error.
  missingPromptPoints: string[];
  // Memorised filler that would be penalised on the official test, for
  // example a rehearsed opening spoken onto an unrelated prompt.
  templateLanguageWarnings: string[];
  // Which of the four outcomes this task had. Set by the server, never
  // by the model: the model is only ever shown tasks that were recorded
  // and transcribed, so it has no way of knowing that one was missing.
  recordingStatus: SpeakingMockRecordingStatus;
};

// The whole Speaking section, reviewed.
//
// overallEstimatedLevel is a conservative estimate for the section, not
// an average of the eight tasks and not an average of the thirty two
// criterion levels.
//
// practiceDisclaimer and audioAssessmentNote both travel with the result
// rather than being drawn from copy alone, so the two sentences that
// bound what this result claims are part of the payload the screen
// renders. The server fills both with its own fixed wording.
export type SpeakingMockEvaluation = {
  overallEstimatedLevel: string;
  overallJustification: string;
  practiceDisclaimer: string;
  // What the audio pipeline can and cannot judge.
  //
  // This is the sentence the ticket requires and it is not decoration.
  // The recording is transcribed and the scoring model is given the
  // transcript, the task, the window and the measured duration, but not
  // the waveform. So the review can speak to hesitation, repair and
  // pacing as far as a transcript shows them, and to length against the
  // window, and it cannot speak directly to pronunciation, rhythm or
  // intonation. The result screen says so rather than letting a learner
  // assume otherwise.
  audioAssessmentNote: string;
  taskResults: SpeakingMockTaskResult[];
};

// One task as the browser describes it in the submission metadata.
//
// Everything on this object is a claim by the client and is treated as
// one. taskNumber is what the server matches on, because the audio field
// names are positional; taskId is checked against the server's own
// content and a mismatch is ignored rather than trusted;
// durationSeconds is the browser's measurement of its own recording,
// which nothing else can measure, so it is clamped rather than believed;
// and hasRecording is a hint that is confirmed or contradicted by
// whether an audio part actually arrived.
//
// There is deliberately no prompt, title or time limit field. Those come
// from mockTest1SpeakingSection on the server, so nothing the browser
// sends can change which prompt an answer is judged against.
export type SpeakingMockSubmissionTask = {
  taskId: string;
  taskNumber: number;
  durationSeconds: number;
  hasRecording: boolean;
  mimeType?: string;
};

// The metadata JSON part of the submission.
export type SpeakingMockSubmissionMetadata = {
  tasks: SpeakingMockSubmissionTask[];
};

// Why a review could not be produced.
//
// Separated from the message so the UI can react to a cause rather than
// match on prose. Most of these end on the same error screen, but the
// codes are distinct because they have different fixes: signing in
// again, adding API credits, recording a shorter answer, or telling an
// administrator that the key is missing.
//
// "credits-exhausted" is the one the ticket calls out by name. An OpenAI
// 429 carrying credit_balance_exhausted is not a transient rate limit
// and retrying will not clear it, so it gets its own code and its own
// sentence rather than being folded into a general failure that invites
// a learner to try again forever.
export type SpeakingMockEvaluationErrorCode =
  | "unauthenticated"
  | "not-configured"
  | "invalid-request"
  | "audio-too-large"
  | "unsupported-audio-type"
  | "credits-exhausted"
  | "evaluation-failed";

// What the API route returns.
//
// A result object rather than a thrown error, because the client has to
// be able to tell a credit failure from a size failure and act
// differently. Nothing in the failure branch carries a provider message,
// a stack, a model name or any part of the environment: message is our
// own wording.
export type SpeakingMockEvaluationOutcome =
  | { ok: true; evaluation: SpeakingMockEvaluation }
  | { ok: false; code: SpeakingMockEvaluationErrorCode; message: string };
