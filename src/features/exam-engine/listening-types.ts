// Types for the Listening part content and the Listening screen flow
// (EXAM-03).
//
// This file holds types only, no runtime values, so it can be imported
// from a server component or a client component without pulling any
// behaviour along with it. Same rule the EXAM-01 shell types and the
// EXAM-02 instruction screen types follow.
//
// The shapes here describe one Listening part, which is the unit the
// prototype renders. A full Listening section is six of these, and a full
// practice test is four sections. Neither is built yet.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ExamInstruction } from "./instruction-screen-types";
import type { ListeningAnswerKeyEntry } from "./listening-review-types";

// One answer choice on a question screen.
//
// The id is what the answer map stores, never the option text, so the
// wording can be corrected later without invalidating a stored answer.
export type ListeningOption = {
  id: string;
  text: string;
};

// One Listening question.
//
// In Parts 1, 2 and 3 the question itself is spoken and never printed, so
// prompt stays unset and audioUrl is the only place the question exists.
// Parts 4, 5 and 6 print their stems instead, which is why prompt is here
// at all. Those parts are not built in this ticket.
export type ListeningQuestion = {
  id: string;
  // Position inside the part, counting from 1. Display only, so the
  // question screen can say "Question 3 of 8" without the flow having to
  // work it out.
  number: number;
  // Clip that reads the question aloud.
  //
  // Optional since EXAM-07, when Mock Test 1 Listening Part 3 Question 1
  // had no clip in the source document. That clip was supplied in the
  // corrected document on 2026-08-16, so every question in Parts 1 to 3
  // now sets this and the optionality is a guard rather than a case any
  // shipped content is in. A question that reaches a screen without a clip
  // is a gap in the source material, and the screen says so instead of
  // playing something else. See resolveListeningQuestionAudio in
  // listening-flow.ts.
  audioUrl?: string;
  // On screen question stem, for a part that prints its questions.
  prompt?: string;
  options: ListeningOption[];
  // Correct option id.
  //
  // EXAM-04 reads this as the second of two key sources: the part level
  // answerKey list wins, and this field is the fallback for a part whose
  // key is written question by question. Mock Test 1 Listening Part 1
  // uses the part level list, so this stays unset there.
  correctOptionId?: string;
};

// One conversation section, and the questions that follow it.
//
// Part 1 splits its conversation into three sections. A part whose
// conversation arrives as a single clip is simply a one section part.
export type ListeningConversationSection = {
  id: string;
  conversationAudioUrl: string;
  // Running time as text, for example "About 1 to 1.5 minutes". Display
  // only, and taken from the source document rather than measured.
  durationLabel?: string;
  questions: ListeningQuestion[];
};

// The context a learner sees before the first clip plays.
//
// imageUrl is optional because only Part 1 has a context image. The
// source images are licensed Toronto Academy content served from
// Cloudinary, so they belong behind the dashboard auth guard.
export type ListeningScenario = {
  text: string;
  imageUrl?: string;
  // Description of the picture for a learner who cannot see it. Required
  // whenever imageUrl is set, which the content file enforces by always
  // writing both together.
  imageAlt?: string;
};

// One Listening part, as the engine consumes it.
export type ListeningPartContent = {
  // For example "mock-test-1".
  testId: string;
  // For example "listening-part-1".
  sectionId: string;
  // Full title for the exam top bar.
  title: string;
  // Short part name, for example "Listening to Problem Solving".
  partTitle: string;
  // Sentence under the instructions heading on the part intro screen.
  subtitle?: string;
  instructions: ExamInstruction[];
  scenario: ListeningScenario;
  sections: ListeningConversationSection[];

  // Answer key for the whole part, one entry per question (EXAM-04).
  //
  // Optional, because a part can be built and walked through before its
  // key exists, which is exactly where Mock Test 1 Listening sits. An
  // entry with correctOptionId null is a question whose key is known to
  // be missing, and the review screen prints "Answer key pending" for it
  // rather than marking the learner wrong.
  answerKey?: ListeningAnswerKeyEntry[];

  // Answer and explanation sheet published with the source test, as an
  // image (EXAM-04).
  //
  // Referenced from Cloudinary and never downloaded. For Mock Test 1 this
  // image is the only place the Listening answers exist, so the review
  // screen offers it as a reference panel while the key is untranscribed.
  answerExplanationImageUrl?: string;
  // Description for a learner who cannot see the sheet. Required whenever
  // answerExplanationImageUrl is set, which the content file enforces by
  // always writing both together.
  answerExplanationImageAlt?: string;
};

// Answers held while a learner works through a part.
//
// Keyed by question id, valued by the selected option id, which is the
// shape EXAM-04 needs for review and scoring. Nothing here is written to
// a database in this ticket.
export type ListeningAnswerMap = Readonly<Record<string, string>>;

// One screen in the Listening part flow.
//
// A discriminated union rather than a screen index, so the prototype
// cannot render a question screen without knowing which question it is,
// and so adding a screen kind is a compile error everywhere it matters.
//
// sectionIndex and questionIndex point into ListeningPartContent.sections
// rather than copying the question, so there is one copy of the content
// and the flow stays cheap to build.
export type ListeningScreen =
  | { kind: "part-intro"; id: string }
  | { kind: "scenario"; id: string }
  | { kind: "conversation"; id: string; sectionIndex: number }
  // Shown before a section that is not the first one.
  | { kind: "section-break"; id: string; sectionIndex: number }
  | {
      kind: "question";
      id: string;
      sectionIndex: number;
      questionIndex: number;
      // Position inside the whole part, counting from 1.
      questionNumber: number;
    }
  // Closing screens, added by EXAM-04. They replace the EXAM-03
  // completion placeholder, which said the answer review was coming and
  // had nowhere to send the learner.
  | { kind: "answer-review"; id: string }
  | { kind: "score"; id: string }
  | { kind: "part-end"; id: string }
  // Closing screen for a part whose review and score are not built yet,
  // added by EXAM-05. It ends the run with a count of what was answered
  // and a plain sentence about what is coming, so a part can ship before
  // its review does. Listening Part 2 uses this; Part 1 does not.
  | { kind: "part-complete"; id: string };

// What a question screen has to play, once the content has been read
// (EXAM-15C).
//
// The question screen used to branch on question.audioUrl being set
// inline. Naming the state instead keeps the decision in one place,
// resolveListeningQuestionAudio, so the part routes and the full section
// route cannot disagree about what a screen plays:
//
// - "question", the normal case and the only case any shipped content is
//   in: the clip that reads the question aloud
// - "missing", a question with no clip at all. The screen says the
//   recording is not in the source test rather than showing an empty
//   player.
//
// EXAM-15C also carried a "conversation" state, which replayed the section
// conversation on Mock Test 1 Listening Part 3 Question 1 while that
// question had no recording of its own. The corrected source document
// supplied that recording, so the state and the content flag that reached
// it are both gone. "missing" stays: it is generic, it costs nothing, and
// it is what should happen if a future part arrives with a clip the source
// does not have.
export type ListeningQuestionAudio =
  | { kind: "question"; url: string }
  | { kind: "missing" };

// Narrowed screen kinds, for a component that only handles one of them.
export type ListeningQuestionScreenRef = Extract<
  ListeningScreen,
  { kind: "question" }
>;

export type ListeningConversationScreenRef = Extract<
  ListeningScreen,
  { kind: "conversation" }
>;

export type ListeningSectionBreakScreenRef = Extract<
  ListeningScreen,
  { kind: "section-break" }
>;
