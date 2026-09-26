// Screen order and answer helpers for the full Listening section
// (EXAM-15).
//
// The layer above listening-flow.ts, listening-dropdown-flow.ts,
// listening-video-flow.ts and listening-viewpoints-flow.ts. Pure functions
// over ListeningSectionContent, no React and no side effects, so the flow
// can be built on the server, rendered on the client, and tested on its
// own later.
//
// The order is derived from the content rather than typed out, so a part
// gaining a question or a conversation section changes the data and
// nothing else. For Mock Test 1 it produces:
//
//    1  Listening instruction text screen
//    2  Listening instructional video screen
//    3  Part 1, 15 screens: intro, scenario, 3 clips, 2 breaks, 8
//       questions
//       Part 1 to Part 2 transition
//       Part 2, 8 screens: intro, scenario, 1 clip, 5 questions
//       Part 2 to Part 3 transition
//       Part 3, 9 screens: intro, scenario, 1 clip, 6 questions
//       Part 3 to Part 4 transition
//       Part 4, 4 screens: intro, scenario, news audio, 5 questions on one
//       screen
//       Part 4 to Part 5 transition
//       Part 5, 4 screens: intro, scenario, discussion video, 8 questions
//       on one screen
//       Part 5 to Part 6 transition
//       Part 6, 4 screens: intro, scenario, report audio, 6 questions on
//       one screen
//    9  full Listening answer review
//   10  full Listening practice score
//   11  end of Listening section
//
// The one rule this file exists to hold the line on: no part level score
// appears anywhere inside the section. Each part flow is asked for its
// "complete" ending, which is the shortest one the four builders offer,
// and even that ending's single completion screen is dropped. So the six
// parts contribute question screens only, and the section closes once.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import {
  buildListeningDropdownFlow,
  withoutListeningDropdownAnswerKey,
} from "./listening-dropdown-flow";
import {
  buildListeningFlow,
  listListeningQuestions,
  withoutListeningAnswerKey,
} from "./listening-flow";
import {
  buildListeningVideoFlow,
  withoutListeningVideoAnswerKey,
} from "./listening-video-flow";
import {
  buildListeningViewpointsFlow,
  withoutListeningViewpointsAnswerKey,
} from "./listening-viewpoints-flow";
import type { ListeningDropdownScreen } from "./listening-dropdown-types";
import type { ListeningScreen } from "./listening-types";
import type { ListeningVideoScreen } from "./listening-video-types";
import type { ListeningViewpointsScreen } from "./listening-viewpoints-types";
import type {
  ListeningSectionAnswerMap,
  ListeningSectionContent,
  ListeningSectionPart,
  ListeningSectionPartScreen,
  ListeningSectionScreen,
} from "./listening-section-types";

// The least a question has to carry for the section to count it or check
// that it was answered: an id to look the answer up by, and the options a
// submitted answer can name.
//
// ListeningQuestion, ListeningDropdownQuestion, ListeningVideoQuestion and
// ListeningViewpointsQuestion all satisfy this structurally, so none of
// them has to be converted before it is counted. It is the smallest shape
// that works for all four, which is why it carries nothing else.
export type ListeningSectionQuestionRef = {
  id: string;
  options: { id: string; text: string }[];
};

// Whatever one of the four part flow builders returns.
type ListeningPartFlowScreen =
  | ListeningScreen
  | ListeningDropdownScreen
  | ListeningVideoScreen
  | ListeningViewpointsScreen;

// The screen kinds that close a part, none of which belongs inside the
// section flow.
//
// Asking a builder for { ending: "complete" } already means only
// part-complete can be produced, so the other three are here as a
// statement of the rule rather than as live cases: if a builder ever
// returns a review or a score screen to this file, it is dropped rather
// than rendered mid section.
const PART_CLOSING_SCREEN_KINDS: readonly string[] = [
  "part-complete",
  "answer-review",
  "score",
  "part-end",
];

// The screens one part contributes to the section, with the closing screen
// removed.
//
// Every builder is asked for { ending: "complete" }, which appends exactly
// one part-complete screen, and that screen is then dropped. Asking for
// the shortest ending and trimming a known screen is deliberate: the
// alternative is a fifth ending option added to four flow files, which
// would change the behaviour of the part level prototype routes this
// ticket must not touch.
//
// The filter is what narrows the four builder unions to
// ListeningSectionPartScreen. It is a real check rather than a cast: every
// remaining kind is a member of that union, and the closing kinds are the
// only ones that are not.
function buildPartScreens(
  part: ListeningSectionPart,
): ListeningSectionPartScreen[] {
  const screens: ListeningPartFlowScreen[] = (() => {
    switch (part.kind) {
      case "sections":
        return buildListeningFlow(part.content, { ending: "complete" });
      case "dropdown":
        return buildListeningDropdownFlow(part.content, { ending: "complete" });
      case "video":
        return buildListeningVideoFlow(part.content, { ending: "complete" });
      case "viewpoints":
        return buildListeningViewpointsFlow(part.content, {
          ending: "complete",
        });
    }
  })();

  // Filtered rather than popped, so a builder that stops appending the
  // completion screen later leaves this correct instead of eating a
  // question screen.
  return screens.filter(
    (screen): screen is ListeningSectionPartScreen =>
      !PART_CLOSING_SCREEN_KINDS.includes(screen.kind),
  );
}

// Build the screen order for the whole Listening section.
//
// A transition screen is inserted before every part except the first,
// which is what turns six separate prototypes into one run. A one part
// section therefore gets no transition screens at all.
export function buildListeningSectionFlow(
  content: ListeningSectionContent,
): ListeningSectionScreen[] {
  const screens: ListeningSectionScreen[] = [
    { kind: "section-instructions", id: `${content.sectionId}-instructions` },
    { kind: "section-video", id: `${content.sectionId}-video` },
  ];

  content.parts.forEach((part, partIndex) => {
    if (partIndex > 0) {
      screens.push({
        kind: "part-transition",
        id: `${part.content.sectionId}-transition`,
        partIndex,
      });
    }

    buildPartScreens(part).forEach((screen) => {
      screens.push({
        kind: "part",
        // The part flows already build their ids from the part's
        // sectionId, so they are unique across the section as they stand.
        id: screen.id,
        partIndex,
        screen,
      });
    });
  });

  screens.push(
    { kind: "section-review", id: `${content.sectionId}-review` },
    { kind: "section-score", id: `${content.sectionId}-score` },
    { kind: "section-end", id: `${content.sectionId}-end` },
  );

  return screens;
}

// The same section with every part's answer key removed.
//
// The section counterpart of the four withoutListening...AnswerKey
// helpers, and it exists for the same reason. A complete answer key is
// fine on the server and wrong in the browser: a client component receives
// its props as serialized data, so a key handed down that way is readable
// by anyone who opens the network panel before answering anything. All six
// Mock Test 1 Listening parts have complete, confirmed keys, so the route
// strips them here before the content crosses the boundary.
//
// It delegates to the existing per shape helper rather than reimplementing
// the strip, so a key field added to one content shape later is handled in
// one place and not two.
//
// This is not a substitute for marking on the server. It keeps the answers
// off the page, which is why the screen that marks answers has to do the
// comparison where the key lives. That is what markListeningSection does
// beside the section route.
export function withoutListeningSectionAnswerKeys(
  content: ListeningSectionContent,
): ListeningSectionContent {
  return {
    ...content,
    parts: content.parts.map((part): ListeningSectionPart => {
      switch (part.kind) {
        case "sections":
          return { ...part, content: withoutListeningAnswerKey(part.content) };
        case "dropdown":
          return {
            ...part,
            content: withoutListeningDropdownAnswerKey(part.content),
          };
        case "video":
          return {
            ...part,
            content: withoutListeningVideoAnswerKey(part.content),
          };
        case "viewpoints":
          return {
            ...part,
            content: withoutListeningViewpointsAnswerKey(part.content),
          };
      }
    }),
  };
}

// Every question in one part, in part order.
//
// Parts 1 to 3 hold their questions inside conversation sections, so they
// are flattened. The other three shapes already carry a flat list.
export function listListeningSectionPartQuestions(
  part: ListeningSectionPart,
): ListeningSectionQuestionRef[] {
  return part.kind === "sections"
    ? listListeningQuestions(part.content)
    : part.content.questions;
}

// Every question in the section, in part order. For Mock Test 1 that is
// 38 questions.
export function listListeningSectionQuestions(
  content: ListeningSectionContent,
): ListeningSectionQuestionRef[] {
  return content.parts.flatMap(listListeningSectionPartQuestions);
}

// How many questions one part has, for example 8.
export function countListeningSectionPartQuestions(
  part: ListeningSectionPart,
): number {
  return listListeningSectionPartQuestions(part).length;
}

// How many questions the whole section has, for example 38.
export function countListeningSectionQuestions(
  content: ListeningSectionContent,
): number {
  return content.parts.reduce(
    (total, part) => total + countListeningSectionPartQuestions(part),
    0,
  );
}

// How many questions in the whole section have an answer selected.
export function countAnsweredListeningSectionQuestions(
  content: ListeningSectionContent,
  answers: ListeningSectionAnswerMap,
): number {
  return listListeningSectionQuestions(content).filter((question) =>
    Boolean(answers[question.id]),
  ).length;
}

// Whether every question in one part has an answer.
//
// This is what gates Next on a one screen question list. An empty question
// list would make it trivially true, so that case is excluded rather than
// letting a content mistake open the gate.
export function areAllListeningSectionPartQuestionsAnswered(
  part: ListeningSectionPart,
  answers: ListeningSectionAnswerMap,
): boolean {
  const questions = listListeningSectionPartQuestions(part);

  return (
    questions.length > 0 &&
    questions.every((question) => Boolean(answers[question.id]))
  );
}

// Store a selection, leaving the other answers alone.
//
// A new object every time, so React sees a changed reference. The shape
// stays { questionId: optionId } across all six parts, which is what lets
// one map carry the whole section and why an answer survives moving back
// and forward: it is keyed by question rather than by screen position.
export function setListeningSectionAnswer(
  answers: ListeningSectionAnswerMap,
  questionId: string,
  optionId: string,
): ListeningSectionAnswerMap {
  return { ...answers, [questionId]: optionId };
}
