// Screen order and answer helpers for the full Reading section
// (EXAM-24).
//
// The layer above reading-flow.ts. Pure functions over
// ReadingSectionContent, no React and no side effects, so the flow can be
// built on the server, rendered on the client, and tested on its own
// later.
//
// The order is derived from the content rather than typed out, so a part
// gaining a question changes the data and nothing else. For Mock Test 1
// it produces 14 screens:
//
//    1  Reading section intro
//    2  Part 1 intro
//    3  Part 1, the correspondence split holding all 11 questions
//    4  Part 1 to Part 2 transition
//    5  Part 2 intro
//    6  Part 2, the diagram split holding all 8 questions
//    7  Part 2 to Part 3 transition
//    8  Part 3 intro
//    9  Part 3, the information split holding all 9 questions
//   10  Part 3 to Part 4 transition
//   11  Part 4 intro
//   12  Part 4, the viewpoints split holding all 10 questions
//   13  full Reading practice score, with the part breakdown and the
//       estimated band
//   14  full Reading answer review, opened from the score
//
// The score comes before the review, which is the order the four Reading
// part flows already use and the reverse of the Listening section flow.
// It is the order the ticket asks for, and it is the right one for
// Reading: the whole section is answered on four screens, so a learner
// arriving at the end wants the result, not a second pass over 38
// questions before they can see it.
//
// The one rule this file exists to hold the line on: no part level score
// appears anywhere inside the section. Each part flow is asked for its
// "complete" ending, which is the shortest one buildReadingFlow offers,
// and even that ending's single completion screen is dropped. So the four
// parts contribute an intro and a working screen each, and the section
// closes once.
//
// This file is new rather than an addition to reading-flow.ts on purpose.
// The four individual Reading part routes are live and this ticket must
// not regress them, and the surest way to guarantee that is to leave the
// module they all import untouched. Everything shared is imported from it
// instead.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import {
  buildReadingFlow,
  listReadingQuestions,
  withoutReadingAnswerKey,
} from "./reading-flow";
import type { ReadingQuestion, ReadingScreen } from "./reading-types";
import type {
  ReadingSectionAnswerMap,
  ReadingSectionContent,
  ReadingSectionPart,
  ReadingSectionPartScreen,
  ReadingSectionScreen,
} from "./reading-section-types";

// The screen kinds that close a part, none of which belongs inside the
// section flow.
//
// Asking buildReadingFlow for { ending: "complete" } already means only
// part-complete can be produced, so the other two are here as a statement
// of the rule rather than as live cases: if the builder ever returns a
// review or a score screen to this file, it is dropped rather than
// rendered mid section.
const PART_CLOSING_SCREEN_KINDS: readonly string[] = [
  "part-complete",
  "answer-review",
  "score",
];

// The screens one part contributes to the section, with the closing
// screen removed.
//
// buildReadingFlow is asked for { ending: "complete" }, which appends
// exactly one part-complete screen, and that screen is then dropped.
// Asking for the shortest ending and trimming a known screen is
// deliberate: the alternative is a third ending option added to
// reading-flow.ts, which would change a file all four live part routes
// import.
//
// The filter is what narrows ReadingScreen to
// ReadingSectionPartScreen. It is a real check rather than a cast: every
// remaining kind is a member of that union, and the closing kinds are the
// only ones that are not.
function buildPartScreens(
  part: ReadingSectionPart,
): ReadingSectionPartScreen[] {
  const screens: ReadingScreen[] = buildReadingFlow(part.content, {
    ending: "complete",
    taskScreen: part.taskScreen,
  });

  // Filtered rather than popped, so a builder that stops appending the
  // completion screen later leaves this correct instead of eating the
  // working screen.
  return screens.filter(
    (screen): screen is ReadingSectionPartScreen =>
      !PART_CLOSING_SCREEN_KINDS.includes(screen.kind),
  );
}

// Build the screen order for the whole Reading section.
//
// A transition screen is inserted before every part except the first,
// which is what turns four separate prototypes into one run. A one part
// section therefore gets no transition screens at all.
export function buildReadingSectionFlow(
  content: ReadingSectionContent,
): ReadingSectionScreen[] {
  const screens: ReadingSectionScreen[] = [
    { kind: "section-intro", id: `${content.sectionId}-intro` },
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
        // buildReadingFlow already builds its ids from the part's
        // sectionId, so they are unique across the section as they stand.
        id: screen.id,
        partIndex,
        screen,
      });
    });
  });

  screens.push(
    { kind: "section-score", id: `${content.sectionId}-score` },
    { kind: "section-review", id: `${content.sectionId}-review` },
  );

  return screens;
}

// The same section with every part's answer key removed.
//
// The section counterpart of withoutReadingAnswerKey, and it exists for
// the same reason. A complete answer key is fine on the server and wrong
// in the browser: a client component receives its props as serialized
// data, so a key handed down that way is readable by anyone who opens the
// network panel before answering anything. All four Mock Test 1 Reading
// parts have complete, confirmed keys printed in the source document, so
// the route strips them here before the content crosses the boundary.
//
// It delegates to the per part helper rather than reimplementing the
// strip, so a key field added to ReadingPartContent later is handled in
// one place and not two. That helper already covers both places a key can
// hide, content.answerKey and question.correctOptionId, and rebuilds
// rather than mutates, so the module level content objects the four part
// routes share are left exactly as they were.
//
// This is not a substitute for marking on the server. It keeps the
// answers off the page, which is why the screen that marks answers has to
// do the comparison where the keys live. That is what markReadingSection
// does beside the section route.
export function withoutReadingSectionAnswerKeys(
  content: ReadingSectionContent,
): ReadingSectionContent {
  return {
    ...content,
    parts: content.parts.map((part) => ({
      ...part,
      content: withoutReadingAnswerKey(part.content),
    })),
  };
}

// Every question in one part, in part order, flattened across its groups.
export function listReadingSectionPartQuestions(
  part: ReadingSectionPart,
): ReadingQuestion[] {
  return listReadingQuestions(part.content);
}

// Every question in the section, in part order. For Mock Test 1 that is
// 38 questions: 11 plus 8 plus 9 plus 10.
export function listReadingSectionQuestions(
  content: ReadingSectionContent,
): ReadingQuestion[] {
  return content.parts.flatMap(listReadingSectionPartQuestions);
}

// How many questions one part has, for example 11.
export function countReadingSectionPartQuestions(
  part: ReadingSectionPart,
): number {
  return listReadingSectionPartQuestions(part).length;
}

// How many questions the whole section has.
//
// Counted from the content every time rather than stored as a constant,
// which is what the ticket asks for: the score denominator, the intro
// card and the band estimate all read this, so an edit to a content file
// moves all three together and none of them can drift to a stale 38.
export function countReadingSectionQuestions(
  content: ReadingSectionContent,
): number {
  return content.parts.reduce(
    (total, part) => total + countReadingSectionPartQuestions(part),
    0,
  );
}

// The total answering allowance for the section, in seconds.
//
// Summed from the four part windows rather than published as a section
// figure, because no source we hold gives one for a Reading section built
// out of these four parts. It is shown on the intro card as a plan for
// the section and nothing counts down against it: see the timer note in
// docs/product/full-reading-section-flow-band-score.md.
export function sumReadingSectionSeconds(
  content: ReadingSectionContent,
): number {
  return content.parts.reduce(
    (total, part) => total + part.content.timer.seconds,
    0,
  );
}

// How many questions in the whole section have an answer selected.
//
// This is what the intro card and the score screen report as progress. It
// gates nothing: a blank is a legal way to leave a question, and the
// section can be finished with any number of them.
export function countAnsweredReadingSectionQuestions(
  content: ReadingSectionContent,
  answers: ReadingSectionAnswerMap,
): number {
  return listReadingSectionQuestions(content).filter((question) =>
    Boolean(answers[question.id]),
  ).length;
}

// There is deliberately no areAllReadingSectionQuestionsAnswered here.
//
// The EXAM-17 rule this section inherits: nothing in the Reading flow
// blocks Next on an unanswered question, because a learner who cannot
// answer one would otherwise be trapped on the screen holding it. A blank
// travels as a missing key in the answer map, the server marks it as
// incorrect, and the review row for it still shows the correct option.

// Store a selection, leaving the other answers alone.
//
// A new object every time, so React sees a changed reference. The shape
// stays { questionId: optionId } across all four parts, which is what lets
// one map carry the whole section and why an answer survives moving back
// and forward, and across a part boundary in either direction: it is
// keyed by question rather than by screen position.
export function setReadingSectionAnswer(
  answers: ReadingSectionAnswerMap,
  questionId: string,
  optionId: string,
): ReadingSectionAnswerMap {
  return { ...answers, [questionId]: optionId };
}

// Keep only answers that name a real question in this section and a real
// option on that question.
//
// A server action is reachable by direct POST, so the argument is
// untrusted input even though the only caller is our own prototype. This
// discards anything unrecognized rather than rejecting the whole
// submission, so a stale answer left over from a content edit costs the
// learner one row instead of the entire section result. A discarded
// answer is marked as a blank, which is the honest reading of "we cannot
// tell what was chosen".
//
// Checking the option against the question it was sent for, rather than
// against every option in the section, is what stops one question's
// answer being credited to another. Reading option ids are per question,
// reading-part-4-q6-c and so on, so a swapped pair is a shape a careless
// caller could produce.
//
// The same rule the four part actions apply, applied once across all 38
// questions.
export function sanitizeReadingSectionAnswers(
  content: ReadingSectionContent,
  answers: unknown,
): ReadingSectionAnswerMap {
  const clean: Record<string, string> = {};

  if (!answers || typeof answers !== "object") {
    return clean;
  }

  const submitted = answers as Record<string, unknown>;

  listReadingSectionQuestions(content).forEach((question) => {
    const selectedOptionId = submitted[question.id];

    if (
      typeof selectedOptionId === "string" &&
      question.options.some((option) => option.id === selectedOptionId)
    ) {
      clean[question.id] = selectedOptionId;
    }
  });

  return clean;
}
