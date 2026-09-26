// Screen order and answer helpers for a video discussion Listening part
// (EXAM-11, closing screens added by EXAM-12).
//
// The counterpart of listening-flow.ts and listening-dropdown-flow.ts,
// for the part built around a video. Pure functions over
// ListeningVideoPartContent, no React and no side effects, so the flow
// can be built on the server, rendered on the client, and tested on its
// own later.
//
// The flow is short and fixed, because the shape of the part is fixed:
// one video and one question screen, however many questions the part has.
// For Mock Test 1 Listening Part 5 it produces seven screens:
//
//   1  part intro
//   2  scenario
//   3  discussion video
//   4  all eight dropdown questions
//   5  answer review
//   6  practice score
//   7  end of part
//
// It is still built rather than typed out inline, so the ids come from
// the content object and the prototype cannot drift from the flow.
//
// EXAM-11 stopped at screen 5, a single completion screen, because the
// Part 5 review and practice score were not built. EXAM-12 added them and
// added the ending option, the way EXAM-10 did for the dropdown flow and
// EXAM-05 did for the section flow, rather than changing what the default
// call returns for a part that has no review yet. A video part built
// before its review exists can still ask for { ending: "complete" } and
// ship.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ListeningVideoAnswerMap,
  ListeningVideoPartContent,
  ListeningVideoScreen,
} from "./listening-video-types";

// How a video discussion part closes.
//
// "review" is the EXAM-12 ending: answer review, practice score, end of
// part. "complete" is the EXAM-11 ending for a part whose review is not
// built yet: one completion screen and nothing else.
export type ListeningVideoFlowEnding = "review" | "complete";

export type ListeningVideoFlowOptions = {
  ending?: ListeningVideoFlowEnding;
};

// Build the screen order for a video discussion part.
//
// ending defaults to "review", so Listening Part 5 gets its seven screen
// flow without passing anything.
export function buildListeningVideoFlow(
  content: ListeningVideoPartContent,
  options: ListeningVideoFlowOptions = {},
): ListeningVideoScreen[] {
  const { ending = "review" } = options;

  const screens: ListeningVideoScreen[] = [
    { kind: "part-intro", id: `${content.sectionId}-intro` },
    { kind: "scenario", id: `${content.sectionId}-scenario` },
    { kind: "video", id: `${content.sectionId}-video` },
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
// The video counterpart of withoutListeningAnswerKey and
// withoutListeningDropdownAnswerKey, and it exists for the same reason. A
// complete answer key is fine on the server and wrong in the browser: a
// client component receives its props as serialized data, so a key handed
// down that way is readable by anyone who opens the network panel. Mock
// Test 1 Listening Part 5 has a complete, confirmed key, so its route
// strips it here before rendering.
//
// Everything else is passed through untouched, including the answer sheet
// image reference, which is a URL rather than a transcribed answer and is
// rendered nowhere in this ticket.
//
// This is not a substitute for marking on the server. It keeps the
// answers off the page, which is why the screen that marks answers has to
// do the comparison where the key lives. That is what the Part 2, Part 3
// and Part 4 server actions do, and since EXAM-12 it is what
// markListeningPartFive does beside the Part 5 route.
export function withoutListeningVideoAnswerKey(
  content: ListeningVideoPartContent,
): ListeningVideoPartContent {
  const stripped: ListeningVideoPartContent = {
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

// How many questions the part has, for example 8.
export function countListeningVideoQuestions(
  content: ListeningVideoPartContent,
): number {
  return content.questions.length;
}

// How many questions have an answer selected.
//
// Nothing calls this on the default "review" ending, which reads the
// answered count off the marked summary instead. It belongs to the
// "complete" ending, whose screen prints the count itself, so it stays
// with that ending rather than being removed with the EXAM-11 flow.
export function countAnsweredListeningVideoQuestions(
  content: ListeningVideoPartContent,
  answers: ListeningVideoAnswerMap,
): number {
  return content.questions.filter((question) => Boolean(answers[question.id]))
    .length;
}

// Whether every question in the part has an answer.
//
// This is what gates Next on the question screen. An empty question list
// would make it trivially true, so that case is excluded rather than
// letting a content mistake open the gate.
export function areAllListeningVideoQuestionsAnswered(
  content: ListeningVideoPartContent,
  answers: ListeningVideoAnswerMap,
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
export function setListeningVideoAnswer(
  answers: ListeningVideoAnswerMap,
  questionId: string,
  optionId: string,
): ListeningVideoAnswerMap {
  return { ...answers, [questionId]: optionId };
}
