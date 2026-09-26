// Types for the Reading part content and the Reading screen flow
// (EXAM-16).
//
// This file holds types only, no runtime values, so it can be imported
// from a server component or a client component without pulling any
// behaviour along with it. Same rule the EXAM-01 shell types, the EXAM-02
// instruction screen types and the four Listening type files follow.
//
// The shapes here describe one Reading part, which is the unit the
// prototype renders. A full Reading section is four of these, and neither
// the section nor the review that closes it is built yet.
//
// What is different about Reading, and why this is a new shape rather
// than a Listening shape reused:
//
// - A Reading part has no media at all. There is no clip, no poster and
//   no running time, so every media field in the Listening shapes would
//   be dead here.
// - A Reading part is one screen, not a sequence. Screen type 8 in
//   docs/product/exam-engine-screen-types.md is a split screen: the
//   passage on the left with its own scrollbar, the questions on the
//   right with theirs. Everything a learner needs is on it at once.
// - A Reading part's questions arrive in groups. Reading Part 1 has two:
//   six questions about the message, then five blanks inside a written
//   reply to it. The groups carry their own instruction line and the
//   second one carries the reply text, so a group is a real part of the
//   content rather than a display grouping.
// - A Reading part is timed once, for the whole part. Listening times a
//   screen because Listening screens are handed out one at a time. See
//   ReadingPartTimer below.
//
// What is shared is imported rather than copied: the instruction bullet
// shape comes from instruction-screen-types.ts, the same way every
// Listening content type takes it.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ExamInstruction } from "./instruction-screen-types";

// One answer choice under a Reading question.
//
// The id is what the answer map stores, never the option text, so the
// wording can be corrected later without invalidating a stored answer.
// Same rule as ListeningOption and its three siblings.
export type ReadingOption = {
  id: string;
  text: string;
};

// One Reading question.
//
// Reading Part 1 has two kinds of question and this one type covers both,
// because the only difference between them is whether the question prints
// a stem:
//
// - A stem question, questions 1 to 6 in Part 1, is an incomplete
//   sentence answered from a drop-down. The stem is stored split around
//   its blank as textBefore and textAfter, the way
//   ListeningDropdownQuestion stores one, so the screen decides how the
//   blank is drawn and no component has to parse a sentence.
// - A response blank, questions 7 to 11 in Part 1, has no stem of its
//   own. The sentence it completes is in the reply text above the list,
//   and the source document prints nothing beside the number but the four
//   options. textBefore is unset for those, and the list draws the number
//   alone.
//
// The two are not separate types because they are marked identically, sit
// in the same answer map, and would otherwise force every consumer to
// switch on a discriminator that changes nothing but one line of layout.
// EXAM-18 added a third shape to the two above, because Reading Part 2
// asks three whole questions rather than three sentence stems:
//
// - A whole question, questions 6 to 8 in Part 2, is a complete sentence
//   ending in a question mark, for example "What is Gerry's relationship
//   to Charlie?". It has no blank anywhere in it, so splitting it around
//   one would mean inventing a stem the source document does not have. It
//   is stored whole, in text, and the list prints it with no blank drawn.
//
// text and textBefore are mutually exclusive in practice: a question is
// either a stem with a blank in it or a whole sentence without one. They
// are two optional fields rather than a discriminated union for the same
// reason the first two shapes share one type: the difference changes one
// line of layout and nothing else, and a discriminator would force every
// consumer to switch on it.
export type ReadingQuestion = {
  id: string;
  // Position inside the part, counting from 1 and continuous across the
  // groups. Reading Part 1 runs 1 to 11, so its second group starts at 7.
  // Display only, and it is also what the reply text points at.
  number: number;
  // A whole question, printed as it stands with no blank drawn. Set on a
  // question the source document writes as a complete sentence, which is
  // Reading Part 2 questions 6 to 8.
  text?: string;
  // Stem text up to the blank. Unset for a question whose sentence lives
  // in the response text rather than in the question.
  textBefore?: string;
  // Stem text after the blank. Unset when the blank ends the stem, which
  // is every stem question in Mock Test 1 Reading Part 1.
  textAfter?: string;
  options: ReadingOption[];
  // Correct option id, for a part whose key is written question by
  // question. The part level answerKey list wins where both exist. Mock
  // Test 1 Reading Part 1 uses the list, so this stays unset there.
  correctOptionId?: string;
};

// One paragraph of a passage.
//
// A plain string. Passages are prose and carry no inline controls, so
// nothing more structured is needed on the left hand side.
export type ReadingPassageParagraph = string;

// One labelled section of a passage (EXAM-20).
//
// Reading Part 3 is the paragraph matching part: its passage is not four
// paragraphs of running prose but four labelled paragraphs, A to D, plus
// a fixed fifth entry E that is not a paragraph at all but the option a
// learner picks when the information is in none of them. Every question
// in the part is answered by naming one of those labels, so the label is
// content rather than decoration: it is the thing being selected, and a
// learner who cannot tell where paragraph B ends and C begins cannot
// answer the part.
//
// So a section is a label and the paragraphs under it, rather than a
// string with "A." typed on the front. The label stays a separate field
// for two reasons: the screen can draw it as a marker beside the text
// instead of running it into the first sentence, and nothing has to
// parse a paragraph to find out what it is called.
//
// paragraphs is a list rather than a single string because a labelled
// section is a section, not a paragraph. Mock Test 1 gives each of A to E
// exactly one paragraph, so every list here has one entry, and a part
// whose paragraph B runs to two would need no type change.
//
// This is an addition beside ReadingPassage.paragraphs rather than a
// replacement for it. Reading Parts 1 and 2 have no labelled sections and
// are untouched by it.
export type ReadingPassageSection = {
  // The label the questions point at, for example "A". Short by nature:
  // it is drawn as a marker beside the text.
  label: string;
  paragraphs: ReadingPassageParagraph[];
};

// A picture on the passage side of the split screen (EXAM-18).
//
// Reading Part 2 is the diagram part: what the questions are answered
// from is a course brochure image, not prose, and the source document
// gives it as one Cloudinary URL rather than as text. So the left column
// needs a picture, and this is the shape it takes.
//
// alt is required rather than optional. A decorative picture would be one
// thing, but this one is the passage: a learner who cannot see it cannot
// answer the part, so there is no case where an empty alt is right and no
// reason to let a content file forget one.
// width and height are the file's intrinsic pixel size, and they are
// required for the same reason alt is. They go on the img element, so the
// browser reserves the right box from the ratio before the file arrives
// and the question column beside it does not jump when it loads. A
// content file that has the URL has the file, so there is no case where
// the size is unknowable.
export type ReadingPassageImage = {
  url: string;
  // Read in place of the picture. Describes what the diagram holds, from
  // the diagram itself.
  alt: string;
  // Intrinsic pixel width of the file, for the reserved box.
  width: number;
  // Intrinsic pixel height of the file, for the reserved box.
  height: number;
  // Optional line under the picture, for example naming what it is.
  caption?: string;
};

// The passage on the left of the split screen.
//
// heading and signOff exist because Reading Part 1 is correspondence: a
// letter opens with a salutation and closes with a sign off, and folding
// either into the first or last paragraph would print them as running
// prose. Both are optional, so a Reading part whose passage is an article
// rather than a letter simply omits them.
//
// image is the EXAM-18 addition, for the diagram part. A passage can be
// prose, a picture, or both: Reading Part 2 is a picture and passes an
// empty paragraphs list, and Reading Part 1 is prose and passes no image.
export type ReadingPassage = {
  // Small label above the passage, for example "Message".
  label?: string;
  // Salutation line, for example "Dear Scott,".
  heading?: string;
  paragraphs: ReadingPassageParagraph[];
  // Labelled paragraphs, for a part whose questions name one of them.
  // The EXAM-20 addition, set on Reading Part 3 and unset everywhere
  // else. A passage carries prose, a picture, labelled sections, or any
  // combination: Part 3 is sections and passes an empty paragraphs list.
  sections?: ReadingPassageSection[];
  // The diagram or picture the part is answered from. Unset on a text
  // only part.
  image?: ReadingPassageImage;
  // Closing lines, for example ["Cheers,", "Jim"]. One line each, so the
  // name sits under the sign off rather than beside it.
  signOff?: string[];
};

// One piece of a response paragraph.
//
// The reply on the right of a correspondence part has numbered blanks in
// it, so its paragraphs cannot be plain strings. They are stored already
// split, as a run of text and blank segments, for the same reason a stem
// is stored split around its blank: the screen decides how a blank is
// drawn, and nothing has to parse a sentence at render time.
//
// A blank segment points at a question by id rather than carrying the
// options itself, so the reply text and the question list cannot drift
// apart, and so an answered blank can show what was chosen.
export type ReadingResponseSegment =
  | { kind: "text"; text: string }
  | { kind: "blank"; questionId: string; number: number };

export type ReadingResponseParagraph = {
  segments: ReadingResponseSegment[];
};

// The written reply a completion group is built around.
//
// Same three fields as ReadingPassage, because it is the same kind of
// object, a letter, with the one difference that its paragraphs carry
// blanks.
//
// headerLines is the EXAM-18 addition. Reading Part 2's response is an
// email rather than a letter, and the source document prints three header
// lines above the salutation, the subject and the two addresses. They are
// one line each, above heading, so the email reads as an email rather
// than as a letter with an odd first paragraph. Reading Part 1's reply is
// a letter and leaves it unset.
export type ReadingResponse = {
  // Message header lines, for example ["Subject: Language Courses"]. One
  // line each, printed above heading.
  headerLines?: string[];
  heading?: string;
  paragraphs: ReadingResponseParagraph[];
  signOff?: string[];
};

// One group of questions on the answer side of the split screen.
//
// Reading Part 1 has two: the six questions about the message, and the
// five blanks inside the reply. Screen type 8 calls these the right hand
// panels, and Parts 2 and 4 have two of them as well, so the group is the
// unit the answer column is built from.
export type ReadingQuestionGroup = {
  id: string;
  // Small label above the panel, for example "Questions 1 to 6".
  label?: string;
  // Instruction line above the group, taken from the source document.
  instruction?: string;
  // The reply the group's blanks sit inside. Set on a completion group,
  // unset on a group of stem questions.
  response?: ReadingResponse;
  questions: ReadingQuestion[];
};

// Where a timing figure came from.
//
// The same distinction listening-timing.ts draws and the timer rule in
// docs/product/admin-mock-test-builder-blueprint.md carries, with one
// value added:
//
// - published: printed as a number in an official source
// - derived: worked out from published figures, with the arithmetic in
//   the note
// - placeholder: a working number chosen so the screen has a clock, to be
//   replaced once a real figure is confirmed
export type ReadingTimerSource = "published" | "derived" | "placeholder";

// The answering window for a whole Reading part.
//
// Reading is timed per part, not per screen and not per question:
// docs/product/celpip-exam-rules-research.md section 11 records that no
// source we hold gives Reading a per-question timer, and that the
// published figures are per-part allowances.
//
// The window travels with the content rather than living in a timing
// module, because unlike Listening there is one number per part and it is
// a property of that part. A part whose figure is not published says so
// through source and note rather than hiding a guess behind a constant.
export type ReadingPartTimer = {
  seconds: number;
  // When the reading turns amber, and then red.
  warningAtSeconds: number;
  urgentAtSeconds: number;
  source: ReadingTimerSource;
  // How the number was arrived at, in one line. Read by a person, never
  // rendered.
  note: string;
};

// One answer key entry for one question.
//
// The Reading counterpart of ListeningAnswerKeyEntry, declared here
// rather than imported from listening-review-types.ts because the two
// sections disagree about where a key can come from, and a shared type
// would have to allow both everywhere.
//
// correctOptionId is null, not undefined, when the key is known to be
// missing. Null says "we looked and it is not in the source", which is a
// different thing from a part nobody has checked.
//
// source records where a value came from. Reading keys are printed as
// text in the source document, which is what "document" means, and is why
// Reading has a usable key where Listening needed six screenshots
// transcribed by hand.
export type ReadingAnswerKeyEntry = {
  questionId: string;
  correctOptionId: string | null;
  // Short reason the option is correct, when the source gives one. Mock
  // Test 1 gives none for Reading, so this is unset throughout.
  explanation?: string;
  source: "document" | "manual";
};

// One Reading part, as the engine consumes it.
export type ReadingPartContent = {
  // For example "mock-test-1".
  testId: string;
  // For example "reading-part-1".
  sectionId: string;
  // Full title for the exam top bar.
  title: string;
  // Short part name, for example "Reading Correspondence".
  partTitle: string;
  // Sentence under the instructions heading on the part intro screen.
  subtitle?: string;
  instructions: ExamInstruction[];
  // One or two sentences describing the part, shown on the intro card.
  summary?: string;
  // Instruction line above the passage, for example "Read the following
  // message."
  passageInstruction?: string;
  passage: ReadingPassage;
  questionGroups: ReadingQuestionGroup[];
  // The answering window for the whole part.
  timer: ReadingPartTimer;

  // Answer key for the whole part, one entry per question.
  //
  // Optional, because a part can be built and walked through before its
  // key exists. An entry with correctOptionId null is a question whose
  // key is known to be missing.
  //
  // A complete key must never reach the browser. See
  // withoutReadingAnswerKey in reading-flow.ts.
  answerKey?: ReadingAnswerKeyEntry[];
};

// Answers held while a learner works through a Reading part.
//
// Keyed by question id, valued by the selected option id, which is the
// { questionId: selectedOptionId } shape the ticket asks for and the
// review ticket will read. Nothing here is written to a database.
export type ReadingAnswerMap = Readonly<Record<string, string>>;

// One screen in a Reading part flow.
//
// A discriminated union rather than a screen index, for the same reason
// the four Listening screen unions are: adding a screen kind should be a
// compile error everywhere it matters.
//
// Three kinds, and that is the whole prototype. The split screen is one
// screen however many questions the part holds, which is what makes a
// Reading part so much shorter a flow than a Listening one.
//
// EXAM-17 added score and answer-review, the way EXAM-14 added the
// closing screens to the viewpoints union. The score comes first and the
// review is opened from it, which is the order the Reading ticket asks
// for and the reverse of the Listening one: a Reading part is answered on
// one screen, so the learner has just read all 11 questions and wants the
// result, not a second pass over the same list before they can see it.
//
// part-complete is kept for the EXAM-16 ending, which buildReadingFlow
// still builds on request. There is no part-end kind: the score screen is
// where a Reading part stops, and it carries the restart and the way back
// to the dashboard itself.
// EXAM-18 added "diagram", the Part 2 working screen. It is the same
// split as "correspondence" with a picture on the left instead of prose,
// and it is a separate kind rather than a flag on the existing one so a
// prototype switching on the screen has to say which of the two it draws.
// The two share ReadingTwoColumnLayout, ReadingQuestionPanel and
// ReadingQuestionList underneath.
// EXAM-20 added "information", the Part 3 working screen, on the same
// reasoning. It is the split again, with labelled paragraphs A to E on
// the left and nine statements on the right, each answered by naming one
// of those labels. It shares the same three components underneath.
// EXAM-22 added "viewpoints", the Part 4 working screen, on the same
// reasoning again. It is the split with a website article on the left and
// two panels on the right, five sentence stems about the article and a
// reader comment holding five numbered blanks. Structurally it is the
// closest of the four to "correspondence", because both are prose on the
// left and a body of text with blanks on the right, and it is still a
// kind of its own rather than a reuse of that one: a prototype switching
// on the screen should have to say which part it is drawing, and the two
// left columns are a letter and an article, which are not the same thing
// to label or to read.
export type ReadingScreen =
  | { kind: "part-intro"; id: string }
  // The split screen: passage on the left, question groups on the right.
  | { kind: "correspondence"; id: string }
  // The split screen with a diagram on the left. Reading Part 2.
  | { kind: "diagram"; id: string }
  // The split screen with labelled paragraphs on the left, answered by
  // naming one of them. Reading Part 3.
  | { kind: "information"; id: string }
  // The split screen with a website article on the left, answered by
  // completing sentences about it and blanks in a reader comment.
  // Reading Part 4.
  | { kind: "viewpoints"; id: string }
  // Practice score for the part.
  | { kind: "score"; id: string }
  // Question by question review, opened from the score screen.
  | { kind: "answer-review"; id: string }
  // Closing screen for a part whose review and score are not wanted.
  | { kind: "part-complete"; id: string };

// Outcome of one question, as the review screen prints it (EXAM-17).
//
// Three values and no fourth. Reading Part 1 has a complete answer key
// printed in the source document, so "answer key pending", which the
// Listening review carries as a fourth status, has no case to cover here:
// a Reading part whose key is incomplete is a content bug rather than a
// state a learner should be shown. buildReadingReviewRows says so in the
// note above resolveCorrectOptionId.
//
// "blank" is a status of its own even though a blank counts as incorrect
// in the score. The two facts are different: the count has to treat a
// blank as a wrong answer for the percentage to mean anything, and the
// learner has to be told they left it empty rather than chose wrongly.
export type ReadingReviewStatus = "correct" | "incorrect" | "blank";

// One row of the answer review, one per question, in part order.
//
// The row carries text as well as ids, so the review screen renders
// strings and never looks anything up in the content object. That is what
// lets the whole row be built on the server, beside the answer key, and
// sent down finished.
//
// Nulls rather than undefined throughout, so a row keeps every field it
// was born with once it has been serialized across the server boundary.
// An absent field would arrive as absent and read the same as a field
// nobody set, which is a distinction worth not having to make.
export type ReadingReviewRow = {
  questionId: string;
  // Position in the part, counting from 1.
  questionNumber: number;
  // The question as the review prints it: the stem for questions 1 to 6,
  // and a short line naming the reply blank for questions 7 to 11, which
  // print no stem of their own. Never empty.
  questionText: string;
  // What the learner chose. Null on a blank.
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  // The correct option. Null only where a part has no usable key for the
  // question, which Mock Test 1 Reading Part 1 never hits.
  correctOptionId: string | null;
  correctOptionText: string | null;
  isCorrect: boolean;
  isBlank: boolean;
  // Short reason the option is correct, when the source document gives
  // one. Mock Test 1 gives none for Reading, so this is null throughout
  // that part. Nothing invents one and no AI writes one.
  explanation: string | null;
};

// Practice result for one Reading part (EXAM-17).
//
// Every count is a plain number rather than a nullable one, unlike the
// Listening summary. Listening was built while its answer keys were still
// being transcribed, so it had to be able to withhold a score; Reading
// Part 1 ships with a complete key, and a summary that could hide its
// numbers would be a state no screen could reach.
//
// percentage is the whole percent of questions answered correctly, so a
// blank drags it down exactly as a wrong answer does.
export type ReadingScoreSummary = {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  blankCount: number;
  percentage: number;
};

// A marked Reading part: everything the score and review screens need,
// and nothing else (EXAM-17).
//
// This is what the server action returns. The rows carry the correct
// option text for questions the learner has now finished, which is the
// point at which showing it is fair, and the summary carries the counts.
// Neither carries the answer key itself, so nothing here lets a caller
// work out an answer it was not given.
export type ReadingMarkedPart = {
  rows: ReadingReviewRow[];
  summary: ReadingScoreSummary;
};


// How a part wants its unstemmed questions named in the review (EXAM-19).
//
// Reading parts 1 and 2 both hold questions that print no stem of their
// own, because the sentence each one completes lives in a body of text
// beside the drop-down. The review still has to name the row, and the
// honest name depends on which body of text that is: a written reply in
// Part 1, an email message in Part 2. Inventing a stem from the
// surrounding sentence is not an option, because the source document
// does not carry one and this codebase does not write question text.
//
// So the caller says which line to use, and the default keeps the
// Part 1 wording that shipped in EXAM-17. Everything else about marking
// is content driven and needs no options at all, which is why this is
// one field rather than a settings object.
export type ReadingReviewOptions = {
  blankQuestionText?: string;
};
