// Screen order and answer helpers for a dropdown completion Listening
// part (EXAM-09).
//
// The counterpart of listening-flow.ts, for the parts that show every
// question on one screen. Pure functions over
// ListeningDropdownPartContent, no React and no side effects, so the flow
// can be built on the server, rendered on the client, and tested on its
// own later.
//
// The flow is short and fixed, because the shape of a dropdown part is
// fixed: one clip and one question screen, however many questions the
// part has. For Mock Test 1 Listening Part 4 it produces seven screens:
//
//   1  part intro
//   2  scenario
//   3  news item audio
//   4  all five completion questions
//   5  answer review
//   6  practice score
//   7  end of part
//
// It is still built rather than typed out inline, so the ids come from
// the content object and the prototype cannot drift from the flow.
//
// EXAM-09 stopped at screen 5, a single completion screen, because the
// Part 4 review and practice score were not built. EXAM-10 added them and
// added the ending option, the way listening-flow.ts did in EXAM-05,
// rather than changing what the default call returns for a part that has
// no review yet. Listening Parts 5 and 6 will want "complete" first and
// "review" a ticket later.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ListeningDropdownAnswerMap,
  ListeningDropdownPartContent,
  ListeningDropdownScreen,
} from "./listening-dropdown-types";

// How a dropdown part closes.
//
// "review" is the EXAM-10 ending: answer review, practice score, end of
// part. "complete" is the EXAM-09 ending for a part whose review is not
// built yet: one completion screen and nothing else.
export type ListeningDropdownFlowEnding = "review" | "complete";

export type ListeningDropdownFlowOptions = {
  ending?: ListeningDropdownFlowEnding;
};

// Build the screen order for a dropdown part.
//
// ending defaults to "review", so Listening Part 4 gets its seven screen
// flow without passing anything.
export function buildListeningDropdownFlow(
  content: ListeningDropdownPartContent,
  options: ListeningDropdownFlowOptions = {},
): ListeningDropdownScreen[] {
  const { ending = "review" } = options;

  const screens: ListeningDropdownScreen[] = [
    { kind: "part-intro", id: `${content.sectionId}-intro` },
    { kind: "scenario", id: `${content.sectionId}-scenario` },
    { kind: "media", id: `${content.sectionId}-audio` },
    { kind: "questions", id: `${content.sectionId}-questions` },
  ];

  if (ending === "complete") {
    screens.push({
      kind: "part-complete",
      id: `${content.sectionId}-complete`,
    });
  } else {
    screens.push(
      { kind: "answer-review", id: `${content.sectionId}-review` },
      { kind: "score", id: `${content.sectionId}-score` },
      { kind: "part-end", id: `${content.sectionId}-end` },
    );
  }

  return screens;
}

// The same content with the answer key removed.
//
// The dropdown counterpart of withoutListeningAnswerKey, and it exists
// for the same reason. A complete answer key is fine on the server and
// wrong in the browser: a client component receives its props as
// serialized data, so a key handed down that way is readable by anyone
// who opens the network panel. Mock Test 1 Listening Part 4 has a
// complete, confirmed key, so its route strips it here before rendering.
//
// Everything else is passed through untouched, including the answer sheet
// image reference, which is a URL rather than a transcribed answer and is
// rendered nowhere in this ticket.
//
// This is not a substitute for marking on the server. It keeps the
// answers off the page for a prototype that does no marking. The screen
// that marks answers has to do the comparison where the key lives, which
// is what the Part 2 and Part 3 server actions do.
export function withoutListeningDropdownAnswerKey(
  content: ListeningDropdownPartContent,
): ListeningDropdownPartContent {
  const stripped: ListeningDropdownPartContent = {
    ...content,
    // A per question key would leak the same way, so it goes too.
    questions: content.questions.map((question) => {
      const copy = { ...question };
      delete copy.correctOptionId;
      return copy;
    }),
  };

  delete stripped.answerKey;

  return stripped;
}

// How many questions the part has, for example 5.
export function countListeningDropdownQuestions(
  content: ListeningDropdownPartContent,
): number {
  return content.questions.length;
}

// How many questions have an answer selected.
export function countAnsweredListeningDropdownQuestions(
  content: ListeningDropdownPartContent,
  answers: ListeningDropdownAnswerMap,
): number {
  return content.questions.filter((question) => Boolean(answers[question.id]))
    .length;
}

// Whether every question in the part has an answer.
//
// This is what gates Next on the question screen. An empty question list
// would make it trivially true, so that case is excluded rather than
// letting a content mistake open the gate.
export function areAllListeningDropdownQuestionsAnswered(
  content: ListeningDropdownPartContent,
  answers: ListeningDropdownAnswerMap,
): boolean {
  return (
    content.questions.length > 0 &&
    content.questions.every((question) => Boolean(answers[question.id]))
  );
}

// Store a selection, leaving the other answers alone.
//
// A new object every time, so React sees a changed reference. Keep the
// shape as { questionId: optionId }: it is what the review ticket reads,
// and it is why an answer survives moving back and forward, since it is
// keyed by question rather than by screen position.
export function setListeningDropdownAnswer(
  answers: ListeningDropdownAnswerMap,
  questionId: string,
  optionId: string,
): ListeningDropdownAnswerMap {
  return { ...answers, [questionId]: optionId };
}
