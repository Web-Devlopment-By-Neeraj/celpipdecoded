// Server side AI review pipeline for a Mock Test 1 Speaking section
// (EXAM-28).
//
// SERVER ONLY. This module constructs an OpenAI client and reads
// OPENAI_API_KEY, OPENAI_TRANSCRIPTION_MODEL and OPENAI_SCORING_MODEL
// from the process environment. Never import it from a client component
// and never re-export anything from it through a file a client component
// imports. The browser reaches it through the API route at
// src/app/api/mock-tests/mock-test-1/speaking/evaluate/route.ts and by
// no other route.
//
// What it does, in order:
//
//   1. Pairs each Speaking task in the section content with the audio
//      part submitted for it, and clamps the duration the browser
//      reported.
//   2. Returns a structured no-response result, with no provider call at
//      all, when nothing was recorded for any task.
//   3. Transcribes every task that has audio, one call each, and keeps
//      the four possible outcomes apart.
//   4. Returns a structured result with no scoring call when nothing
//      transcribed into reviewable speech, so a section of silence does
//      not buy a review of nothing.
//   5. Sends only the tasks with reviewable transcripts to the scoring
//      model, with the section's own prompts, pictures, windows and
//      measured durations, the four criteria, the conservative scoring
//      rules and the task specific checklists.
//   6. Validates the reply with Zod, drops anything it did not ask for,
//      and joins it to the server's own timings and transcripts.
//   7. Fills in a locally built result for every task that produced no
//      reviewable speech, so the result screen still has a card for it.
//
// Why the transcripts are the server's and not the model's. The scoring
// model is shown each transcript and is never asked to return it. A
// model asked to echo a transcript back tidies it on the way through,
// and the fillers, restarts and self-corrections it would tidy away are
// the evidence Listenability is judged on. So what a learner reads on
// the transcript card is what the transcription model wrote, unedited.
//
// What it deliberately does not do:
//
// - it writes nothing. No Supabase client is imported, no attempt row is
//   created, no usage event is recorded and no migration exists. A
//   review lives in React state on the result screen and nowhere else
// - it stores no audio. The recordings arrive in one request, are sent
//   to the transcription model, and are released when the request ends.
//   Nothing reaches Supabase Storage or any other destination
// - it never returns a provider message, a stack, a model name or any
//   part of the environment to the caller. Failures are logged server
//   side and reach the client as one of our codes and our own wording
// - it does not touch the standalone Speaking Practice pipeline. That
//   flow is src/features/speaking/transcribe-attempt.ts and
//   src/features/speaking/generate-speaking-feedback.ts, it has its own
//   prompt, its own schema, its own storage bucket and its own database
//   writes, and nothing in this file imports or modifies it
//
// House style: normal hyphens only, no long hyphens or em dashes.

import OpenAI from "openai";
import { speakingMockCopy } from "./speaking-mock-copy";
import {
  buildSpeakingMockEvaluationSystemPrompt,
  buildSpeakingMockEvaluationUserPrompt,
  getSpeakingMockTaskType,
} from "./speaking-mock-evaluation-prompt";
import {
  parseSpeakingMockEvaluationResponse,
  toSpeakingMockTaskResult,
} from "./speaking-mock-evaluation-schema";
import {
  classifySpeakingMockProviderError,
  getSpeakingMockTranscriptionModel,
  transcribeSpeakingMockAudio,
} from "./transcribe-speaking-mock-audio";
import type {
  SpeakingMockPromptTask,
  SpeakingMockUnscoredTask,
} from "./speaking-mock-evaluation-prompt";
import type {
  SpeakingMockEvaluation,
  SpeakingMockEvaluationErrorCode,
  SpeakingMockEvaluationOutcome,
  SpeakingMockRecordingStatus,
  SpeakingMockTaskResult,
} from "./speaking-mock-evaluation-types";
import type {
  SpeakingSectionContent,
  SpeakingTaskContent,
} from "./speaking-mock-types";

// The model used when OPENAI_SCORING_MODEL is unset.
//
// The same default the standalone Speaking Practice scorer falls back
// to, which is the project's existing speaking scoring model variable.
// The ticket asks for OPENAI_SCORING_MODEL or the existing project
// speaking scoring model env, and here they are the same variable.
const DEFAULT_SCORING_MODEL = "gpt-5.4-mini";

// One task paired with what was submitted for it.
//
// audioFile is null for a task the learner never recorded. That is
// normal input rather than an error: the whole missing recording
// behaviour in this file hangs off it.
export type SpeakingMockTaskSubmission = {
  task: SpeakingTaskContent;
  audioFile: File | null;
  // The browser's own measurement of its own recording. Clamped below,
  // never trusted as given.
  durationSeconds: number;
};

// What the pipeline is given.
export type SpeakingMockEvaluationRequest = {
  submissions: SpeakingMockTaskSubmission[];
};

// A duration the prompt can be given.
//
// The browser is the only thing that can measure how long a recording
// ran, so its figure is used, but a direct POST can send anything. A
// negative number, an infinity or a NaN becomes 0, and anything past an
// hour is capped. The cap is deliberately far above any task window: an
// answer that ran past its limit should reach the review as one, because
// running over is the Task Fulfillment problem the length check exists
// to report.
function clampDurationSeconds(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.min(3600, Math.round(value));
}

// The task's display name on a result card, for example
// "Speaking Task 1 - Giving Advice".
function formatTaskTitle(task: SpeakingTaskContent): string {
  return task.taskLabel + " - " + task.taskTitle;
}

// Every picture description a task shows, from the section's own alt
// text.
//
// Flattened out of the visual union here rather than in the prompt
// builder, so the prompt file stays free of content shapes and this file
// stays the only place that knows how a Speaking visual is put together.
function collectVisualDescriptions(task: SpeakingTaskContent): string[] {
  const descriptions: string[] = [];

  for (const visual of task.visuals) {
    if (visual.kind === "scene") {
      descriptions.push(visual.image.alt);
      continue;
    }

    for (const card of visual.cards) {
      const facts = card.details.join(" ");
      const image = card.image ? " Picture: " + card.image.alt : "";

      descriptions.push(card.heading + ": " + facts + image);
    }
  }

  return descriptions;
}

// The result card for a task that produced no reviewable speech.
//
// Built here rather than asked for, because there is nothing to ask
// about. Three of the four recording statuses come through this
// function, and each gets its own level and its own sentence: a learner
// who skipped a task and a learner whose recording could not be
// transcribed have not done the same thing, and the card must not say
// they have.
//
// criteria is empty and both rewrite blocks are null. A criterion table
// whose four rows all read "No recording" says nothing four times, and a
// rewrite of nothing is nothing. The result screen draws a status block
// in place of all three.
//
// missingPromptPoints is left empty rather than filled with the prompt's
// requirements. A Speaking prompt is an instruction rather than a
// checklist of points, so there is no honest list to state without a
// model, and inventing one would put words on the card that no reviewer
// wrote.
export function buildUnscoredSpeakingTaskResult(
  task: SpeakingTaskContent,
  status: Exclude<SpeakingMockRecordingStatus, "recorded">,
  durationSeconds: number,
): SpeakingMockTaskResult {
  const level =
    status === "missing"
      ? speakingMockCopy.reviewNoRecordingLevel
      : status === "transcription_failed"
        ? speakingMockCopy.reviewTranscriptionFailedLevel
        : speakingMockCopy.reviewInsufficientLevel;

  const justification =
    status === "missing"
      ? speakingMockCopy.reviewMissingText
      : status === "transcription_failed"
        ? speakingMockCopy.reviewTranscriptionFailedText
        : speakingMockCopy.reviewInsufficientText;

  const succeeded =
    status === "transcription_failed"
      ? "Nothing can be credited or held against this task, because the recording could not be read and was never reviewed."
      : "Nothing can be credited for this task because no reviewable answer was recorded.";

  const fellShort =
    status === "missing"
      ? "The task was left without a recording. On the official test an unanswered Speaking task is a serious loss, so record something for every task even when time is short."
      : status === "transcription_failed"
        ? "This is a failure of the review pipeline rather than of the answer. Try the review again, or record the task again and resubmit."
        : "There was too little speech in the recording to judge. Check that the microphone was picking you up before you record again.";

  return {
    taskId: task.taskId,
    taskTitle: formatTaskTitle(task),
    responseTimeLimitSeconds: task.responseTimer.seconds,
    recordedDurationSeconds: durationSeconds,
    transcript: "",
    transcriptConfidenceNote: "",
    estimatedLevel: level,
    oneSentenceJustification: justification,
    timeLengthCheck:
      status === "missing"
        ? "No recording was made, so there is no length to check against the " +
          task.responseTimer.seconds +
          " second window."
        : "The recording ran for " +
          durationSeconds +
          " of the " +
          task.responseTimer.seconds +
          " seconds allowed, and produced no reviewable speech.",
    criteria: [],
    criticalFeedback: { succeeded, fellShort },
    topMistakes: [],
    nextLevelRewrite: null,
    levelElevenTwelveModel: null,
    missingPromptPoints: [],
    templateLanguageWarnings: [],
    recordingStatus: status,
  };
}

// The whole review for a section where nothing at all was recorded.
//
// No provider call is made for this, which is the point: there is no
// speech to transcribe and none to review, so paying for either would
// buy nothing. Every field is stated plainly and no level is invented.
export function buildNoResponseSpeakingEvaluation(
  content: SpeakingSectionContent,
): SpeakingMockEvaluation {
  return {
    overallEstimatedLevel: speakingMockCopy.reviewNoRecordingLevel,
    overallJustification: speakingMockCopy.reviewNoRecordingsJustification,
    practiceDisclaimer: speakingMockCopy.reviewPracticeDisclaimer,
    audioAssessmentNote: speakingMockCopy.reviewAudioAssessmentNote,
    taskResults: content.tasks.map((task) =>
      buildUnscoredSpeakingTaskResult(task, "missing", 0),
    ),
  };
}

// One task as the prompt builder wants it.
function toPromptTask(
  task: SpeakingTaskContent,
  durationSeconds: number,
  transcript: string,
): SpeakingMockPromptTask {
  return {
    taskId: task.taskId,
    taskLabel: task.taskLabel,
    taskTitle: task.taskTitle,
    taskType: getSpeakingMockTaskType(task),
    taskNumber: task.taskNumber,
    situationParagraphs: [...(task.situationParagraphs ?? [])],
    promptInstruction: task.promptInstruction,
    promptParagraphs: [...(task.promptParagraphs ?? [])],
    alternatives: (task.alternatives ?? []).map(
      (alternative) => alternative.connector + ": " + alternative.text,
    ),
    visualDescriptions: collectVisualDescriptions(task),
    responseTimeLimitSeconds: task.responseTimer.seconds,
    recordedDurationSeconds: durationSeconds,
    transcript,
  };
}

// A failure outcome with our own wording. Never a provider message.
function failure(
  code: SpeakingMockEvaluationErrorCode,
  message: string,
): SpeakingMockEvaluationOutcome {
  return { ok: false, code, message };
}

// What one task came out of the transcription step as.
type TranscribedTask = {
  task: SpeakingTaskContent;
  durationSeconds: number;
  status: SpeakingMockRecordingStatus;
  transcript: string;
};

// Review a Speaking section attempt.
//
// Named for the section rather than for the test, because the route that
// wraps it is the evaluate endpoint and two functions with one name in
// one call stack is a confusing thing to read a stack trace of. The
// route holds the session check, the FormData parsing and the fixed
// content; this holds the review.
//
// content is passed in rather than imported so this stays a function of
// its arguments and one Speaking section's content cannot leak into
// another's review. The route supplies mockTest1SpeakingSection.
//
// Always resolves. Every failure path returns an ok:false outcome with a
// code, so a caller never has to catch anything.
export async function evaluateSpeakingMockSection(
  content: SpeakingSectionContent,
  request: SpeakingMockEvaluationRequest,
): Promise<SpeakingMockEvaluationOutcome> {
  // Pair the section's own tasks with what arrived for them. The tasks
  // come from the content object, so a submission that named a task the
  // section does not have contributes nothing, and a task the submission
  // did not mention is simply missing.
  const submissionByTaskId = new Map(
    request.submissions.map((submission) => [submission.task.taskId, submission]),
  );

  const pairs = content.tasks.map((task) => {
    const submission = submissionByTaskId.get(task.taskId);

    return {
      task,
      audioFile: submission?.audioFile ?? null,
      durationSeconds: clampDurationSeconds(submission?.durationSeconds ?? 0),
    };
  });

  const withAudio = pairs.filter((pair) => pair.audioFile !== null);

  // Nothing recorded anywhere. No transcription call, no scoring call,
  // no cost, no crash.
  if (withAudio.length === 0) {
    return { ok: true, evaluation: buildNoResponseSpeakingEvaluation(content) };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // The name of the variable is safe to log server side and is the one
    // thing an operator needs. Its value is never read into a message,
    // never returned and never logged.
    console.error(
      "Speaking mock review is not configured: OPENAI_API_KEY is missing.",
    );

    return failure("not-configured", speakingMockCopy.reviewNotConfiguredText);
  }

  const client = new OpenAI({ apiKey });
  const transcriptionModel = getSpeakingMockTranscriptionModel();

  // Transcribe every recorded task.
  //
  // Run together rather than one after another, because eight sequential
  // provider calls would make a learner wait through eight round trips
  // for work that has no order to it. One task's failure is contained in
  // its own outcome, so a slow or broken task delays the others and
  // takes none of them down.
  const transcriptionOutcomes = await Promise.all(
    pairs.map(async (pair) => {
      if (!pair.audioFile) {
        return { pair, outcome: null };
      }

      const outcome = await transcribeSpeakingMockAudio(
        client,
        transcriptionModel,
        { taskId: pair.task.taskId, file: pair.audioFile },
      );

      return { pair, outcome };
    }),
  );

  // A credit failure anywhere stops the whole review.
  //
  // It is not a per task problem: the account is out of credit, so the
  // scoring call would fail the same way and every remaining
  // transcription already has. Showing eight "could not be transcribed"
  // cards would tell a learner that their recordings were bad when the
  // truth is that nobody topped up an account, so this returns the
  // credit sentence instead and leaves the recordings on the page.
  const creditFailure = transcriptionOutcomes.some(
    (entry) =>
      entry.outcome?.status === "failed" &&
      entry.outcome.kind === "credits-exhausted",
  );

  if (creditFailure) {
    return failure(
      "credits-exhausted",
      speakingMockCopy.reviewCreditsExhaustedText,
    );
  }

  const transcribed: TranscribedTask[] = transcriptionOutcomes.map((entry) => {
    const { pair, outcome } = entry;

    if (!outcome) {
      return {
        task: pair.task,
        durationSeconds: pair.durationSeconds,
        status: "missing",
        transcript: "",
      };
    }

    if (outcome.status === "transcribed") {
      return {
        task: pair.task,
        durationSeconds: pair.durationSeconds,
        status: "recorded",
        transcript: outcome.transcript,
      };
    }

    return {
      task: pair.task,
      durationSeconds: pair.durationSeconds,
      // An unsupported container and a provider failure both mean the
      // same thing to a learner reading a card: a recording was sent and
      // could not be read. They are separated inside the transcription
      // helper because they are logged differently, and joined here
      // because there is one honest sentence for both.
      status:
        outcome.status === "insufficient"
          ? "insufficient_response"
          : "transcription_failed",
      transcript: "",
    };
  });

  const reviewable = transcribed.filter((entry) => entry.status === "recorded");

  // Recordings arrived and none of them produced reviewable speech.
  //
  // No scoring call is made, for the same reason the empty section makes
  // none: there is nothing to review, so a review of it would cost money
  // and say nothing. The cards still say what happened to each task.
  if (reviewable.length === 0) {
    const anyFailed = transcribed.some(
      (entry) => entry.status === "transcription_failed",
    );

    console.error(
      "Speaking mock review found no reviewable transcripts across",
      withAudio.length,
      "recordings.",
    );

    return {
      ok: true,
      evaluation: {
        overallEstimatedLevel: anyFailed
          ? speakingMockCopy.reviewTranscriptionFailedLevel
          : speakingMockCopy.reviewInsufficientLevel,
        overallJustification: anyFailed
          ? "None of the recordings submitted could be transcribed, so no answer was reviewed and no Speaking level is estimated. This is a technical failure rather than a judgement of your answers. Try the review again, or record again and resubmit."
          : "The recordings submitted contained too little speech to review, so no Speaking level is estimated. Check that your microphone was picking you up, then record full answers and try again.",
        practiceDisclaimer: speakingMockCopy.reviewPracticeDisclaimer,
        audioAssessmentNote: speakingMockCopy.reviewAudioAssessmentNote,
        taskResults: transcribed.map((entry) =>
          buildUnscoredSpeakingTaskResult(
            entry.task,
            entry.status as Exclude<SpeakingMockRecordingStatus, "recorded">,
            entry.durationSeconds,
          ),
        ),
      },
    };
  }

  const unscored: SpeakingMockUnscoredTask[] = transcribed
    .filter((entry) => entry.status !== "recorded")
    .map((entry) => ({
      taskLabel: entry.task.taskLabel,
      reason: entry.status as SpeakingMockUnscoredTask["reason"],
    }));

  const scoringModel = process.env.OPENAI_SCORING_MODEL || DEFAULT_SCORING_MODEL;

  let raw: string | null | undefined;

  try {
    const completion = await client.chat.completions.create({
      model: scoringModel,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSpeakingMockEvaluationSystemPrompt() },
        {
          role: "user",
          content: buildSpeakingMockEvaluationUserPrompt({
            sectionTitle: content.title,
            totalTasks: content.tasks.length,
            tasks: reviewable.map((entry) =>
              toPromptTask(entry.task, entry.durationSeconds, entry.transcript),
            ),
            unscoredTasks: unscored,
          }),
        },
      ],
    });

    raw = completion.choices[0]?.message?.content;
  } catch (error) {
    console.error("Speaking mock review call failed:", error);

    if (classifySpeakingMockProviderError(error) === "credits-exhausted") {
      return failure(
        "credits-exhausted",
        speakingMockCopy.reviewCreditsExhaustedText,
      );
    }

    return failure("evaluation-failed", speakingMockCopy.reviewFailedText);
  }

  if (!raw) {
    console.error("Speaking mock review returned an empty response.");

    return failure("evaluation-failed", speakingMockCopy.reviewFailedText);
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(raw);
  } catch (error) {
    console.error("Speaking mock review returned invalid JSON:", error);

    return failure("evaluation-failed", speakingMockCopy.reviewFailedText);
  }

  const validated = parseSpeakingMockEvaluationResponse(parsedJson);

  if (!validated) {
    console.error("Speaking mock review did not match the required schema.");

    return failure("evaluation-failed", speakingMockCopy.reviewFailedText);
  }

  // Join the reviewed tasks back to the section, in the section's own
  // task order. A result whose taskId was never sent is dropped, so a
  // model that invents a ninth task cannot add a card to the screen, and
  // a task that was sent but came back unreviewed fails the whole review
  // rather than rendering a card with a hole in it.
  const reviewed = new Map(
    validated.taskResults.map((result) => [result.taskId, result]),
  );

  const taskResults: SpeakingMockTaskResult[] = [];

  for (const entry of transcribed) {
    if (entry.status !== "recorded") {
      taskResults.push(
        buildUnscoredSpeakingTaskResult(
          entry.task,
          entry.status as Exclude<SpeakingMockRecordingStatus, "recorded">,
          entry.durationSeconds,
        ),
      );
      continue;
    }

    const result = reviewed.get(entry.task.taskId);

    if (!result) {
      console.error(
        "Speaking mock review returned no result for a task that was sent.",
      );

      return failure("evaluation-failed", speakingMockCopy.reviewFailedText);
    }

    taskResults.push({
      ...toSpeakingMockTaskResult(result, {
        responseTimeLimitSeconds: entry.task.responseTimer.seconds,
        recordedDurationSeconds: entry.durationSeconds,
        // The transcript on the card is the transcription model's, not
        // the scoring model's. See the note at the top of this file.
        transcript: entry.transcript,
        transcriptConfidenceNote:
          speakingMockCopy.reviewTranscriptConfidenceNote,
      }),
      // The card title is the server's, not the model's, for the same
      // reason the timings are: it is a fact about the content, and a
      // model has no business restating a fact we already hold.
      taskTitle: formatTaskTitle(entry.task),
    });
  }

  return {
    ok: true,
    evaluation: {
      overallEstimatedLevel: validated.overallEstimatedLevel,
      overallJustification: validated.overallJustification,
      // The disclaimer and the audio note are ours, always, and never the
      // model's. The model is still asked for both, because asking keeps
      // the framing and the limitation in front of it while it writes the
      // rest, but the two sentences a learner actually reads are fixed
      // copy that cannot drift from one review to the next.
      practiceDisclaimer: speakingMockCopy.reviewPracticeDisclaimer,
      audioAssessmentNote: speakingMockCopy.reviewAudioAssessmentNote,
      taskResults,
    },
  };
}
