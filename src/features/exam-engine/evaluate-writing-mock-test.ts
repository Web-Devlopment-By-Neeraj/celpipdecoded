// Server side AI review pipeline for a Mock Test 1 Writing section
// (EXAM-26).
//
// SERVER ONLY. This module constructs an OpenAI client and reads
// OPENAI_API_KEY and OPENAI_WRITING_MODEL from the process environment.
// Never import it from a client component and never re-export anything
// from it through a file a client component imports. The browser reaches
// it through the server action in
// src/app/dashboard/mock-tests/mock-test-1/writing/actions.ts and by no
// other route.
//
// What it does, in order:
//
//   1. Pairs each Writing task in the section content with the response
//      typed for it, and counts the words itself.
//   2. Returns a structured no-response result, with no AI call at all,
//      when nothing was written for either task.
//   3. Sends only the tasks that have writing in them to the model, with
//      the section's own prompts, requirements and word targets, the four
//      criteria, the conservative scoring rules and the task specific
//      checklists.
//   4. Validates the reply with Zod, drops anything it did not ask for,
//      and joins it to the server's own word counts.
//   5. Fills in a locally built insufficient-response result for any task
//      that was left blank, so the result screen still has a card for it.
//
// What it deliberately does not do:
//
// - it writes nothing. No Supabase client is imported, no attempt row is
//   created, no usage event is recorded and no migration exists. A review
//   lives in React state on the result screen and nowhere else
// - it never returns a provider message, a stack, a model name or any
//   part of the environment to the caller. Failures are logged server
//   side and reach the client as one of three codes and our own wording
// - it does not touch the standalone Writing Practice evaluator. That
//   pipeline is src/features/writing/generate-writing-feedback.ts, it has
//   its own prompt, its own schema and its own database writes, and
//   nothing in this file imports or modifies it
//
// House style: normal hyphens only, no long hyphens or em dashes.

import OpenAI from "openai";
import { countWritingWords } from "./writing-mock-flow";
import { writingMockCopy } from "./writing-mock-copy";
import {
  buildWritingMockEvaluationSystemPrompt,
  buildWritingMockEvaluationUserPrompt,
  getWritingMockTaskType,
} from "./writing-mock-evaluation-prompt";
import {
  parseWritingMockEvaluationResponse,
  toWritingMockTaskResult,
} from "./writing-mock-evaluation-schema";
import type { WritingMockPromptTask } from "./writing-mock-evaluation-prompt";
import type {
  WritingMockEvaluation,
  WritingMockEvaluationInput,
  WritingMockEvaluationOutcome,
  WritingMockTaskResult,
} from "./writing-mock-evaluation-types";
import type {
  WritingSectionContent,
  WritingTaskContent,
} from "./writing-mock-types";

// The model used when OPENAI_WRITING_MODEL is unset.
//
// The same default the standalone Writing evaluator falls back to, so an
// environment configured for one is configured for the other.
const DEFAULT_WRITING_MODEL = "gpt-5.4-mini";

// The longest response this pipeline will send for review, in characters.
//
// A server action is reachable by direct POST, so the two strings that
// arrive are untrusted input even though the only caller is our own
// screen. A 150-200 word response is roughly 1,200 characters, so 20,000
// is far above any honest answer and far below a payload that would make
// the prompt expensive. Anything longer is cut rather than refused: a
// learner who pasted an essay still gets a review of the start of it.
const MAX_RESPONSE_CHARACTERS = 20000;

// One task paired with what was typed for it.
type WritingTaskAttempt = {
  task: WritingTaskContent;
  responseText: string;
  wordCount: number;
};

// Clean one response as it arrives from the browser.
//
// Coerced to a string first, because a direct POST can send anything at
// all through a field the type says is a string.
function sanitizeResponseText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.slice(0, MAX_RESPONSE_CHARACTERS).trim();
}

// The task's display name on a result card, for example
// "Writing Task 1 - Writing an Email".
function formatTaskTitle(task: WritingTaskContent): string {
  return task.taskLabel + " - " + task.taskTitle;
}

// Whether a count sits inside the task's word target.
function isWithinTarget(task: WritingTaskContent, wordCount: number): boolean {
  return wordCount >= task.wordTarget.min && wordCount <= task.wordTarget.max;
}

// The result card for a task that was left blank.
//
// Built here rather than asked for, because there is nothing to ask
// about. It carries the four things the ticket asks an empty task to
// report: a word count of 0, a word range it is not within, an
// explanation that there was not enough writing to evaluate, and no
// invented level.
//
// criteria is empty and both rewrite blocks are null. A criterion table
// whose four rows all read "Insufficient response" says nothing four
// times, and a rewrite of nothing is nothing. The result screen draws an
// insufficient-response block in place of all three.
//
// missingPromptPoints lists every point the prompt asked for, because a
// blank response addressed none of them. That is a fact about the task
// rather than a judgement of the writing, so it is safe to state without
// a model.
export function buildInsufficientWritingTaskResult(
  task: WritingTaskContent,
): WritingMockTaskResult {
  return {
    taskId: task.taskId,
    taskTitle: formatTaskTitle(task),
    wordCount: 0,
    withinWordRange: false,
    estimatedLevel: writingMockCopy.reviewInsufficientLevel,
    oneSentenceJustification:
      "No writing was submitted for this task, so there is nothing to evaluate and no level is estimated for it.",
    criteria: [],
    criticalFeedback: {
      succeeded:
        "Nothing can be credited for this task because no response was written.",
      fellShort:
        "The task was left blank. On the official test an unanswered Writing task is a serious loss, so write something for every task even when time is short.",
    },
    topMistakes: [],
    nextLevelRewrite: null,
    levelElevenTwelveModel: null,
    missingPromptPoints: [...task.promptRequirements],
    templateLanguageWarnings: [],
    insufficientResponse: true,
  };
}

// The whole review for a section where nothing at all was written.
//
// No AI call is made for this, which is the point: there is no writing to
// review, so paying for a review of it would buy nothing. Every field is
// stated plainly and no level is invented.
export function buildNoResponseWritingEvaluation(
  content: WritingSectionContent,
): WritingMockEvaluation {
  return {
    overallEstimatedLevel: writingMockCopy.reviewInsufficientLevel,
    overallJustification:
      "No writing was submitted for either task, so there is nothing to review and no Writing level is estimated. Write a response for both tasks and submit again.",
    practiceDisclaimer: writingMockCopy.reviewPracticeDisclaimer,
    taskResults: content.tasks.map(buildInsufficientWritingTaskResult),
  };
}

// One task as the prompt builder wants it.
function toPromptTask(attempt: WritingTaskAttempt): WritingMockPromptTask {
  return {
    taskId: attempt.task.taskId,
    taskLabel: attempt.task.taskLabel,
    taskTitle: attempt.task.taskTitle,
    taskType: getWritingMockTaskType(attempt.task),
    situationParagraphs: [...attempt.task.situationParagraphs],
    promptInstruction: attempt.task.promptInstruction,
    promptRequirements: [...attempt.task.promptRequirements],
    wordMin: attempt.task.wordTarget.min,
    wordMax: attempt.task.wordTarget.max,
    responseText: attempt.responseText,
    wordCount: attempt.wordCount,
  };
}

// Review a Writing section attempt.
//
// Named for the section rather than for the test, because the action that
// wraps it is evaluateWritingMockTest and two functions with one name in
// one call stack is a confusing thing to read a stack trace of. The
// action holds the session check and the fixed content; this holds the
// review.
//
// content is passed in rather than imported so this stays a function of
// its arguments and one Writing section's content cannot leak into
// another's review. The action supplies mockTest1WritingSection.
//
// Always resolves. Every failure path returns an ok:false outcome with a
// code, so a caller never has to catch anything.
export async function evaluateWritingMockSection(
  content: WritingSectionContent,
  input: WritingMockEvaluationInput,
): Promise<WritingMockEvaluationOutcome> {
  // The two responses arrive positionally, task 1 then task 2, which is
  // the input shape this ticket specifies. Pairing them with the content
  // by index here means the ids, the prompts and the word targets all
  // come from the server's own content object and none of them from the
  // browser.
  const submitted = [
    sanitizeResponseText(input?.task1Response),
    sanitizeResponseText(input?.task2Response),
  ];

  const attempts: WritingTaskAttempt[] = content.tasks.map((task, index) => {
    const responseText = submitted[index] ?? "";

    return {
      task,
      responseText,
      wordCount: countWritingWords(responseText),
    };
  });

  const written = attempts.filter((attempt) => attempt.wordCount > 0);
  const blank = attempts.filter((attempt) => attempt.wordCount === 0);

  // Both tasks blank. No AI call, no cost, no crash.
  if (written.length === 0) {
    return { ok: true, evaluation: buildNoResponseWritingEvaluation(content) };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // The name of the variable is safe to log server side and is the one
    // thing an operator needs. Its value is never read into a message,
    // never returned and never logged.
    console.error(
      "Writing mock review is not configured: OPENAI_API_KEY is missing.",
    );

    return {
      ok: false,
      code: "not-configured",
      message: writingMockCopy.reviewFailedText,
    };
  }

  const model = process.env.OPENAI_WRITING_MODEL || DEFAULT_WRITING_MODEL;

  let raw: string | null | undefined;

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildWritingMockEvaluationSystemPrompt() },
        {
          role: "user",
          content: buildWritingMockEvaluationUserPrompt({
            sectionTitle: content.title,
            tasks: written.map(toPromptTask),
            blankTaskLabels: blank.map((attempt) => attempt.task.taskLabel),
          }),
        },
      ],
    });

    raw = completion.choices[0]?.message?.content;
  } catch (error) {
    // Logged server side so a failure is diagnosable, and not returned,
    // so a provider message can never reach a learner's screen.
    console.error("Writing mock review call failed:", error);

    return {
      ok: false,
      code: "evaluation-failed",
      message: writingMockCopy.reviewFailedText,
    };
  }

  if (!raw) {
    console.error("Writing mock review returned an empty response.");

    return {
      ok: false,
      code: "evaluation-failed",
      message: writingMockCopy.reviewFailedText,
    };
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(raw);
  } catch (error) {
    console.error("Writing mock review returned invalid JSON:", error);

    return {
      ok: false,
      code: "evaluation-failed",
      message: writingMockCopy.reviewFailedText,
    };
  }

  const validated = parseWritingMockEvaluationResponse(parsedJson);

  if (!validated) {
    console.error("Writing mock review did not match the required schema.");

    return {
      ok: false,
      code: "evaluation-failed",
      message: writingMockCopy.reviewFailedText,
    };
  }

  // Join the reviewed tasks back to the section, in the section's own
  // task order. A result whose taskId was never sent is dropped, so a
  // model that invents a third task cannot add a card to the screen, and
  // a task that was sent but came back unreviewed fails the whole review
  // rather than rendering a card with a hole in it.
  const reviewed = new Map(
    validated.taskResults.map((result) => [result.taskId, result]),
  );

  const taskResults: WritingMockTaskResult[] = [];

  for (const attempt of attempts) {
    if (attempt.wordCount === 0) {
      taskResults.push(buildInsufficientWritingTaskResult(attempt.task));
      continue;
    }

    const result = reviewed.get(attempt.task.taskId);

    if (!result) {
      console.error(
        "Writing mock review returned no result for a task that was sent.",
      );

      return {
        ok: false,
        code: "evaluation-failed",
        message: writingMockCopy.reviewFailedText,
      };
    }

    taskResults.push({
      // The card title and the word range verdict are the server's, not
      // the model's, for the same reason the word count is: they are
      // facts about the content and the response, and a model has no
      // business restating a fact we already hold.
      ...toWritingMockTaskResult(result, attempt.wordCount),
      taskTitle: formatTaskTitle(attempt.task),
      withinWordRange: isWithinTarget(attempt.task, attempt.wordCount),
    });
  }

  return {
    ok: true,
    evaluation: {
      overallEstimatedLevel: validated.overallEstimatedLevel,
      overallJustification: validated.overallJustification,
      // The disclaimer is ours, always, and never the model's. The model
      // is still asked for one, because asking keeps the framing in front
      // of it while it writes the rest, but the sentence a learner
      // actually reads is fixed copy that cannot drift from one review to
      // the next.
      practiceDisclaimer: writingMockCopy.reviewPracticeDisclaimer,
      taskResults,
    },
  };
}
