// Screen order and answer helpers for a Reading part (EXAM-16).
//
// The Reading counterpart of listening-flow.ts and its three siblings.
// Pure functions over ReadingPartContent, no React and no side effects,
// so the flow can be built on the server, rendered on the client, and
// tested on its own later.
//
// The flow is very short, because a Reading part is one working screen.
// For Mock Test 1 Reading Part 1 it produces four screens:
//
//   1  part intro
//   2  the split screen, message on the left and all 11 questions on the
//      right
//   3  the practice score for the part
//   4  the question by question answer review, opened from the score
//
// It is still built rather than typed out inline, so the ids come from
// the content object and the prototype cannot drift from the flow.
//
// EXAM-16 built the first two screens and closed on a completion screen.
// EXAM-17 added screens 3 and 4 behind an ending option, the way
// buildListeningViewpointsFlow grew from EXAM-13 to EXAM-14, rather than
// by rewriting this function. The EXAM-16 ending is still one call away.
//
// EXAM-18 added a second option for the middle screen, taskScreen, and
// took the EXAM-16 ending for Reading Part 2, which was answered from a
// diagram but had no review and no score yet. EXAM-19 built both, so
// Part 2 now takes the default ending and differs from Part 1 by its
// working screen alone. Everything else in this file is shared with
// Part 1 untouched, and the EXAM-16 ending is still one call away for
// whatever needs it next.
//
// EXAM-20 is what needed it next. Reading Part 3 took the "information"
// working screen and the EXAM-16 ending, so its flow was three screens:
// the part intro, the split screen holding all 9 statements, and the
// completion screen. Nothing in this file changed for it beyond two new
// option values. EXAM-21 then built its review and its score, so Part 3
// takes the default ending too and now differs from Parts 1 and 2 by its
// working screen alone. Nothing in this file changed for that at all: the
// prototype simply stopped asking for the "complete" ending.
//
// EXAM-22 is what needed it after that, and it is the same story a part
// later. Reading Part 4 took the "viewpoints" working screen and the
// EXAM-16 ending, so its flow was three screens: the part intro, the
// split screen holding all 10 questions, and the completion screen. Again
// the only change here was one new option value, and again the "complete"
// ending is what a part built ahead of its review needs. EXAM-23 then
// built Part 4's review and its score, so it takes the default ending too
// and now differs from Parts 1, 2 and 3 by its working screen alone.
// Nothing in this file changed for that at all: the prototype simply
// stopped asking for the "complete" ending, which is exactly what
// happened for Part 3 a ticket earlier.
//
// So all four Reading parts now take the default ending, and no caller
// asks for "complete" today. It stays anyway, for the same reason it was
// kept twice already: the next Reading part built ahead of a confirmed
// answer key needs it, and nothing is gained by deleting an ending that
// costs four lines.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ReadingAnswerMap,
  ReadingPartContent,
  ReadingQuestion,
  ReadingScreen,
} from "./reading-types";

// How a Reading part closes.
//
// "score" is the EXAM-17 ending: the practice score, then the answer
// review opened from it. "complete" is the EXAM-16 ending for a part
// whose marking is not built yet: one completion screen and nothing else.
//
// The option exists rather than the old ending being replaced outright,
// the way buildListeningViewpointsFlow kept its own. A Reading part built
// before its answer key is confirmed can still ask for
// { ending: "complete" } and ship, and nothing has to pretend to a score
// it cannot calculate.
export type ReadingFlowEnding = "score" | "complete";

// Which working screen the part is answered on (EXAM-18).
//
// "correspondence" is the prose split, a message on the left. "diagram"
// is the same split with a picture on the left, which is what Reading
// Part 2 is answered from. "information" is the EXAM-20 addition, the
// split with labelled paragraphs A to E on the left, which is what
// Reading Part 3 is answered from. "viewpoints" is the EXAM-22 addition,
// the split with a website article on the left and a reader comment among
// the panels on the right, which is what Reading Part 4 is answered from.
// All four are one screen holding every question in the part, so this
// changes what the middle screen draws and nothing about the shape of the
// flow.
export type ReadingTaskScreen =
  | "correspondence"
  | "diagram"
  | "information"
  | "viewpoints";

export type ReadingFlowOptions = {
  ending?: ReadingFlowEnding;
  taskScreen?: ReadingTaskScreen;
};

// Build the screen order for a Reading part.
//
// ending defaults to "score" and taskScreen to "correspondence", so Mock
// Test 1 Reading Part 1 gets its four screen flow without passing
// anything. Reading Part 2 asks for one option, a diagram screen, because
// its passage is a picture; it takes the same four screen flow otherwise.
// EXAM-19 gave Part 2 a score and EXAM-21 gave Part 3 one. Reading Part 3
// asks for the "information" task screen, because its passage is labelled
// paragraphs rather than a letter or a picture, and takes the default
// ending otherwise. Reading Part 4, added by EXAM-22, asked for both
// options: the "viewpoints" task screen, and the "complete" ending,
// because its review and its score were the next ticket. That was the
// same pair EXAM-20 asked for and the reason the "complete" ending was
// kept. EXAM-23 built both, so Part 4 now asks for the "viewpoints" task
// screen alone and takes the default ending like the three parts before
// it.
export function buildReadingFlow(
  content: ReadingPartContent,
  options: ReadingFlowOptions = {},
): ReadingScreen[] {
  const { ending = "score", taskScreen = "correspondence" } = options;

  const screens: ReadingScreen[] = [
    { kind: "part-intro", id: `${content.sectionId}-intro` },
    { kind: taskScreen, id: `${content.sectionId}-questions` },
  ];

  if (ending === "complete") {
    screens.push({
      kind: "part-complete",
      id: `${content.sectionId}-complete`,
    });
  } else {
    screens.push(
      { kind: "score", id: `${content.sectionId}-score` },
      { kind: "answer-review", id: `${content.sectionId}-review` },
    );
  }

  return screens;
}

// Every question in the part, in order, flattened across the groups.
//
// The groups are how the answer column is laid out; the flat list is how
// the part is counted, gated and marked. Both views are needed and only
// one of them is stored, so this is the conversion and there is one of
// it.
export function listReadingQuestions(
  content: ReadingPartContent,
): ReadingQuestion[] {
  return content.questionGroups.flatMap((group) => group.questions);
}

// The same content with the answer key removed.
//
// The Reading counterpart of withoutListeningAnswerKey and its three
// siblings, and it exists for the same reason. A complete answer key is
// fine on the server and wrong in the browser: a client component
// receives its props as serialized data, so a key handed down that way is
// readable by anyone who opens the network panel. Mock Test 1 Reading
// Part 1 has a complete key printed in the source document, so its route
// strips it here before rendering.
//
// This is not a substitute for marking on the server. It keeps the
// answers off the page, which is why the screen that marks answers has to
// do the comparison where the key lives. EXAM-17 is that comparison:
// markReadingPartOne, in actions.ts beside the route, reads the key from
// the content module on the server and never from anything the browser
// sends back. The browser sends its selections and receives finished
// review rows, so the key is never serialized in either direction.
//
// EXAM-17 note on what is stripped. The two places a key can hide in a
// Reading part are content.answerKey and question.correctOptionId, and
// both go below. The question groups are rebuilt rather than mutated, so
// the module level content object is left exactly as it was and a second
// call cannot find a part that has already been emptied.
export function withoutReadingAnswerKey(
  content: ReadingPartContent,
): ReadingPartContent {
  const stripped: ReadingPartContent = {
    ...content,
    // A per question key would leak the same way, so it goes too.
    questionGroups: content.questionGroups.map((group) => ({
      ...group,
      questions: group.questions.map((question) => {
        const copy = { ...question };
        delete copy.correctOptionId;
        return copy;
      }),
    })),
  };

  delete stripped.answerKey;

  return stripped;
}

// How many questions the part has, for example 11.
export function countReadingQuestions(content: ReadingPartContent): number {
  return listReadingQuestions(content).length;
}

// How many questions have an answer selected.
//
// This is what the completion screen prints. It counts across both
// groups, because the learner answered one part, not two panels.
export function countAnsweredReadingQuestions(
  content: ReadingPartContent,
  answers: ReadingAnswerMap,
): number {
  return listReadingQuestions(content).filter((question) =>
    Boolean(answers[question.id]),
  ).length;
}

// There is deliberately no areAllReadingQuestionsAnswered here.
//
// EXAM-16 had one and the split screen used it to hold Next disabled
// until all 11 questions were answered. EXAM-17 removed both, because a
// learner who cannot answer one question was trapped on the last screen
// of the part with no way to finish it. A blank is a valid way to leave a
// question, it is counted as incorrect by buildReadingReviewRows, and it
// is counted separately as a blank by summarizeReadingReviewRows.
//
// countAnsweredReadingQuestions above is what a screen wants instead: it
// reports progress without gating anything.

// Store a selection, leaving the other answers alone.
//
// A new object every time, so React sees a changed reference. Keep the
// shape as { questionId: optionId }: it is what EXAM-17 reads, and it is
// why an answer survives moving back and forward, since it is keyed by
// question rather than by screen position or by group.
export function setReadingAnswer(
  answers: ReadingAnswerMap,
  questionId: string,
  optionId: string,
): ReadingAnswerMap {
  return { ...answers, [questionId]: optionId };
}

// The text of the option chosen for one question, or undefined.
//
// The reply on a completion group echoes a filled blank back into the
// letter so it reads as a finished response, which needs the option text
// rather than the id. The lookup lives here rather than in the component
// so the reply and the question list read the answer map the same way.
//
// It takes a question list rather than the whole part, because the panel
// that draws a reply holds one group and has no reason to see the other.
export function findReadingAnswerText(
  questions: ReadingQuestion[],
  answers: ReadingAnswerMap,
  questionId: string,
): string | undefined {
  const selectedOptionId = answers[questionId];

  if (!selectedOptionId) {
    return undefined;
  }

  return questions
    .find((candidate) => candidate.id === questionId)
    ?.options.find((option) => option.id === selectedOptionId)?.text;
}
