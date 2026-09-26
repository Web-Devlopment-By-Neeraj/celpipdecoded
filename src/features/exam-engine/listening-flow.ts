// Screen order and answer helpers for a Listening part (EXAM-03).
//
// Pure functions over ListeningPartContent, no React and no side effects,
// so the flow can be built on the server, rendered on the client, and
// tested on its own later.
//
// The order is derived from the content rather than typed out, so adding
// a fourth conversation section or a ninth question changes the data and
// nothing else. For Mock Test 1 Listening Part 1 it produces 18 screens:
//
//   1  part intro
//   2  scenario
//   3  conversation section 1
//   4  question 1
//   5  question 2
//   6  section break before section 2
//   7  conversation section 2
//   8  question 3
//   9  question 4
//  10  question 5
//  11  section break before section 3
//  12  conversation section 3
//  13  question 6
//  14  question 7
//  15  question 8
//  16  answer review
//  17  practice score
//  18  end of part
//
// Screens 16 to 18 were added by EXAM-04. They took the place of the
// EXAM-03 completion placeholder, which announced an answer review that
// did not exist yet.
//
// EXAM-05 added the ending option. Listening Part 2 has no review and no
// score yet, so it closes on a single completion screen instead, and its
// nine screen flow is:
//
//   1  part intro
//   2  scenario
//   3  conversation
//   4  question 1
//   ...
//   8  question 5
//   9  part complete
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ListeningAnswerMap,
  ListeningPartContent,
  ListeningQuestion,
  ListeningQuestionAudio,
  ListeningQuestionScreenRef,
  ListeningScreen,
} from "./listening-types";

// How a part closes.
//
// "review" is the EXAM-04 ending: answer review, practice score, end of
// part. "complete" is the EXAM-05 ending for a part whose review is not
// built yet: one completion screen and nothing else.
export type ListeningFlowEnding = "review" | "complete";

export type ListeningFlowOptions = {
  ending?: ListeningFlowEnding;
};

// Build the screen order for a part.
//
// A break screen is inserted before every section except the first, which
// is what the source document does between the conversation sections. A
// one section part therefore gets no break screens at all.
//
// ending defaults to "review", so Listening Part 1 keeps its eighteen
// screen flow without passing anything.
export function buildListeningFlow(
  content: ListeningPartContent,
  options: ListeningFlowOptions = {},
): ListeningScreen[] {
  const { ending = "review" } = options;

  const screens: ListeningScreen[] = [
    { kind: "part-intro", id: `${content.sectionId}-intro` },
    { kind: "scenario", id: `${content.sectionId}-scenario` },
  ];

  // Questions are numbered across the whole part, not per section, so the
  // count carries over from one section to the next.
  let questionNumber = 0;

  content.sections.forEach((section, sectionIndex) => {
    if (sectionIndex > 0) {
      screens.push({
        kind: "section-break",
        id: `${section.id}-break`,
        sectionIndex,
      });
    }

    screens.push({
      kind: "conversation",
      id: `${section.id}-audio`,
      sectionIndex,
    });

    section.questions.forEach((question, questionIndex) => {
      questionNumber += 1;

      screens.push({
        kind: "question",
        id: `${question.id}-screen`,
        sectionIndex,
        questionIndex,
        questionNumber,
      });
    });
  });

  if (ending === "complete") {
    screens.push({ kind: "part-complete", id: `${content.sectionId}-complete` });
  } else {
    screens.push(
      { kind: "answer-review", id: `${content.sectionId}-review` },
      { kind: "score", id: `${content.sectionId}-score` },
      { kind: "part-end", id: `${content.sectionId}-end` },
    );
  }

  return screens;
}

// The same content with the answer key removed (EXAM-05).
//
// A complete answer key is fine on the server and wrong in the browser: a
// client component receives its props as serialized data, so a key handed
// down that way is readable by anyone who opens the network panel. Mock
// Test 1 Listening Part 2 has a complete key, so its route strips it here
// before rendering the prototype.
//
// Everything else is passed through untouched, including the answer sheet
// image reference, which is a URL rather than a transcribed answer and is
// not rendered anywhere in this ticket.
//
// This is not a substitute for scoring on the server. It keeps the
// answers off the page for a prototype that does no marking. A screen
// that marks answers has to do the comparison where the key lives.
export function withoutListeningAnswerKey(
  content: ListeningPartContent,
): ListeningPartContent {
  const stripped: ListeningPartContent = {
    ...content,
    // A per question key would leak the same way, so it goes too.
    sections: content.sections.map((section) => ({
      ...section,
      questions: section.questions.map((question) => {
        const copy = { ...question };
        delete copy.correctOptionId;
        return copy;
      }),
    })),
  };

  delete stripped.answerKey;

  return stripped;
}

// Every question in the part, in order.
export function listListeningQuestions(
  content: ListeningPartContent,
): ListeningQuestion[] {
  return content.sections.flatMap((section) => section.questions);
}

// How many questions the part has, for example 8.
export function countListeningQuestions(
  content: ListeningPartContent,
): number {
  return content.sections.reduce(
    (total, section) => total + section.questions.length,
    0,
  );
}

// The question a question screen points at.
//
// Returns undefined rather than throwing when the indexes do not resolve,
// so a content edit that removes a question shows an empty screen instead
// of crashing a learner out of the part.
export function getListeningQuestion(
  content: ListeningPartContent,
  screen: ListeningQuestionScreenRef,
): ListeningQuestion | undefined {
  return content.sections[screen.sectionIndex]?.questions[screen.questionIndex];
}

// What the question screen should play for one question (EXAM-15C).
//
// One rule, in one place, for every route that renders a Parts 1 to 3
// question screen: the question's own clip plays, and a question with no
// clip is "missing" so the screen can say the recording is not in the
// source test. Both the part level route and the full section route call
// this, so the two cannot disagree about what plays on any screen, and
// neither one needs a special case for a particular question.
//
// Every Parts 1 to 3 question in Mock Test 1 now has its own clip, so
// "missing" is unreachable from the content that ships. It is kept because
// it is the honest answer for a real gap in a source practice test, and a
// screen that has nothing to play should say so rather than play something
// else.
//
// EXAM-15C originally had a third branch here, which replayed the section
// conversation for Mock Test 1 Listening Part 3 Question 1 while that
// question had no recording. The corrected source document supplied the
// recording, so the branch and the fallbackToConversationAudio field it
// read are both gone.
export function resolveListeningQuestionAudio(
  content: ListeningPartContent,
  screen: ListeningQuestionScreenRef,
): ListeningQuestionAudio {
  const question =
    content.sections[screen.sectionIndex]?.questions[screen.questionIndex];

  if (question?.audioUrl) {
    return { kind: "question", url: question.audioUrl };
  }

  return { kind: "missing" };
}

// Whether a question has a selected option.
export function isListeningQuestionAnswered(
  answers: ListeningAnswerMap,
  questionId: string,
): boolean {
  return Boolean(answers[questionId]);
}

// How many questions in the part have an answer selected.
export function countAnsweredListeningQuestions(
  content: ListeningPartContent,
  answers: ListeningAnswerMap,
): number {
  return listListeningQuestions(content).filter((question) =>
    isListeningQuestionAnswered(answers, question.id),
  ).length;
}

// Store a selection, leaving the other answers alone.
//
// A new object every time, so React sees a changed reference. This is the
// shape EXAM-04 reads for answer review, so keep it as
// { questionId: optionId } even when a save path is added.
export function setListeningAnswer(
  answers: ListeningAnswerMap,
  questionId: string,
  optionId: string,
): ListeningAnswerMap {
  return { ...answers, [questionId]: optionId };
}
