// Mock Test 1, Reading Part 3: Reading for Information (EXAM-20).
//
// Source: mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx, the block
// headed "Reading Part 3: Reading for Information", cross checked against
// the part summary in docs/product/mock-test-1-content-map.md, the
// outline in mock-tests/mock-test-1/extracted-content-outline.md and the
// part rules in docs/product/celpip-exam-rules-research.md section 10.
//
// This is licensed Toronto Academy content. Every route that imports this
// file must sit behind the dashboard auth guard.
//
// The part has no assets. mock-tests/mock-test-1/extracted-links.md lists
// one Reading image in the whole test and it belongs to Part 2, so
// everything below is text taken from the document.
//
// What makes this part different from the two before it. Parts 1 and 2
// ask questions whose options are written for each question. Part 3 asks
// nine statements and answers every one of them by naming a lettered
// paragraph, A to E, which is the same five choices nine times over.
// docs/product/celpip-exam-rules-research.md section 10 calls it the one
// Reading part whose options are shared across all questions, and
// docs/product/admin-mock-test-builder-blueprint.md section 3.5 gives the
// future database an option_set_id for exactly this reason: it does not
// want 45 near duplicate option rows that have to be kept in sync.
//
// This file honours that without changing the shared ReadingQuestion
// shape. The five choices are written once, in PARAGRAPH_LABELS, and
// buildParagraphOptions stamps them onto each statement with ids of its
// own. So there is one place the option list is edited, the answer key
// still points at a real option on a real question, and
// ReadingQuestionList, ReadingQuestionPanel and the EXAM-21 marking all
// read the part exactly as they read Parts 1 and 2. Nothing shared had to
// learn about option sets for one part, and markReadingPartThree needed
// no Part 3 branch of its own.
//
// Notes on the source material, all deliberate:
//
// - The document's curly quotes and apostrophes are written as straight
//   ones, and the one long dash in paragraph A, in "Robert Ralph
//   Carmichael - a loon on one side", is written as a normal hyphen. The
//   en dash in "$175-250 million" in paragraph B is written as a normal
//   hyphen too. This is the house style every content file in the
//   repository already follows and no wording is changed by it.
// - The instruction line above the paragraphs reads "Read the following
//   message." in the document. The passage is a magazine style article
//   about the Canadian one dollar coin rather than a message, so the line
//   looks like a copy and paste from Reading Part 1. It is carried
//   verbatim anyway, because this codebase does not rewrite source
//   wording, and the mismatch is written up as a source gap in
//   docs/product/reading-part-3-prototype.md.
// - Paragraph E is not a paragraph. "E. Not given in any of the above
//   paragraphs." is the fixed fifth choice, printed by the document in
//   the same lettered run as A to D. It is kept there, on the passage
//   side, because that is where the document puts it and because a
//   learner has to be able to read what choosing E means. The research
//   document and the content map both describe it the same way.
// - The nine statements print no numbers in the document. They run one
//   after another under the heading "Questions:", each with its own
//   A to E list. The numbering below is document order, 1 to 9, which is
//   what the answer key table confirms: it runs Question 1 to Question 9
//   and gives C D B E A E E A D against the statements in that order.
// - The two author notes in this block, "(the passage will come here on
//   the left side of the screen)" and "And question will appear on the
//   right side of the screen", are instructions to us and not learner
//   facing copy. They are not in this file. What they describe is the
//   layout the split screen already implements.
//
// The nine statements are whole sentences with no blank anywhere in them,
// so each one carries text and none carries textBefore. That is the
// question shape EXAM-18 added for Reading Part 2 questions 6 to 8, and
// it fits these without any change.
//
// The answer key is confirmed and complete, which means this file must
// never be handed to the browser whole. See the note on ANSWER_KEY.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ReadingAnswerKeyEntry,
  ReadingOption,
  ReadingPartContent,
} from "@/features/exam-engine/reading-types";

// The five choices every statement in this part is answered from.
//
// Written once. The document prints this list under each of the nine
// statements, so repeating it nine times below would be faithful and
// would also be nine chances for one of them to drift.
const PARAGRAPH_LABELS = ["A", "B", "C", "D", "E"] as const;

// The five choices, with ids belonging to one question.
//
// The ids follow the same pattern the rest of Mock Test 1 uses,
// "<questionId>-<letter>", so an answer key entry reads the same here as
// it does in Reading Parts 1 and 2 and nothing downstream has to know
// that these five options came from a shared list.
function buildParagraphOptions(questionId: string): ReadingOption[] {
  return PARAGRAPH_LABELS.map((label) => ({
    id: `${questionId}-${label.toLowerCase()}`,
    text: label,
  }));
}

// Answer key for the whole part, one entry per question, in order.
//
// source is "document" on every entry. The Reading answer keys are
// printed as text in the source document, under "Answers & Explanations",
// and the PART03 table gives nine letters against Question 1 to Question
// 9: C, D, B, E, A, E, E, A, D. Each letter is matched to the option of
// the same letter on the question of that number. Nothing was guessed and
// no statement or option was reworded to make a key fit. The letter is
// repeated in a trailing comment so a key can be checked against the
// question below without scrolling.
//
// The key is complete, so shipping it to the browser would hand a learner
// the answers. The Reading Part 3 route strips it with
// withoutReadingAnswerKey before rendering, the same way the Reading Part
// 1 and Part 2 routes and every Listening route strip their own, so
// nothing here reaches the question screen.
//
// EXAM-21 is what reads it, and it reads it the way markReadingPartOne
// and markReadingPartTwo read theirs: on the server, in
// markReadingPartThree in actions.ts beside the route, importing this
// module directly rather than trusting anything the browser sends. What
// crosses back to the browser is finished review rows, never the key.
const ANSWER_KEY: ReadingAnswerKeyEntry[] = [
  // C
  { questionId: "reading-part-3-q1", correctOptionId: "reading-part-3-q1-c", source: "document" },
  // D
  { questionId: "reading-part-3-q2", correctOptionId: "reading-part-3-q2-d", source: "document" },
  // B
  { questionId: "reading-part-3-q3", correctOptionId: "reading-part-3-q3-b", source: "document" },
  // E
  { questionId: "reading-part-3-q4", correctOptionId: "reading-part-3-q4-e", source: "document" },
  // A
  { questionId: "reading-part-3-q5", correctOptionId: "reading-part-3-q5-a", source: "document" },
  // E
  { questionId: "reading-part-3-q6", correctOptionId: "reading-part-3-q6-e", source: "document" },
  // E
  { questionId: "reading-part-3-q7", correctOptionId: "reading-part-3-q7-e", source: "document" },
  // A
  { questionId: "reading-part-3-q8", correctOptionId: "reading-part-3-q8-a", source: "document" },
  // D
  { questionId: "reading-part-3-q9", correctOptionId: "reading-part-3-q9-d", source: "document" },
];

// The nine statements, in document order.
//
// Written as a list of sentences rather than as nine question objects,
// because the only thing that differs between them is the sentence and
// the number. The options are the same five on every one of them, which
// is the whole point of this part.
const STATEMENTS: string[] = [
  "Government officials were afraid that someone would make unauthorized coins.",
  "By the end of the 20th century, coins replaced two paper bills in Canada.",
  "Replacing paper bills every year was expensive.",
  "People preferred to carry the lighter silver dollar.",
  "The animal depicted on a loonie is found throughout Canada.",
  "The individual who picked up the dies had forgotten to bring identification.",
  "Shopkeepers were unhappy to have paper bills replaced with coins.",
  "Canada's connection to Britain is depicted on one side of the loonie.",
  "A change in raw materials reduced the weight of the coins.",
];

export const readingPart3: ReadingPartContent = {
  testId: "mock-test-1",
  sectionId: "reading-part-3",
  title: "Practice Test 1 - Reading Part 3: Reading for Information",
  partTitle: "Reading for Information",
  subtitle:
    "Read the following information before this part of the practice test begins.",
  // The source document gives Reading Part 3 no instruction bullets of
  // its own, exactly as it gives Parts 1 and 2 none. It has section level
  // Reading instructions, which belong to the Reading instructions screen
  // and not to this part, and then two instruction lines that sit
  // directly above the content they govern: one above the paragraphs,
  // carried as passageInstruction below, and one above the statements,
  // carried on the question group.
  //
  // These three bullets are written for this prototype rather than copied
  // from anywhere. They describe what this screen actually does: what the
  // learner is given, how many questions there are, and how they are
  // answered. Nothing here promises official test behaviour the screen
  // does not have.
  instructions: [
    "You will read four short paragraphs about one topic, labelled A to D.",
    "There are 9 statements. For each one, decide which paragraph holds that information.",
    "Choose E when the information is in none of the four paragraphs.",
  ],
  summary:
    "An article about the Canadian one dollar coin, in four labelled paragraphs.",
  // The source document's own line above the paragraphs, verbatim. It
  // reads "message" where the passage is an article, which is a source
  // oddity rather than a transcription error. See the file header.
  passageInstruction: "Read the following message.",

  // Reading Part 3 timing.
  //
  // 10 minutes, published per part in the official Reading Overview PDF
  // and recorded in docs/product/celpip-exam-rules-research.md sections 3
  // and 10. It is a part allowance, not a screen or question window,
  // which suits a part that is one screen.
  //
  // One conflict worth knowing about, and it is the same shape as the one
  // Reading Part 1 carries. docs/product/mock-test-1-content-map.md lists
  // Reading Part 3 as 9 minutes, read off an official screenshot rather
  // than a published table. The research document's 10 minutes wins here
  // because it comes from the overview PDF, which is the only source
  // giving a figure for every Reading part in one consistent unit, and
  // because preferring it is the call Reading Part 1 already made for the
  // same disagreement. The difference is one minute and is written up in
  // docs/product/reading-part-3-prototype.md so nobody has to rediscover
  // it.
  //
  // A minute of amber and twenty seconds of red, the same long window
  // thresholds Reading Parts 1 and 2 use.
  //
  // Nothing enforces this window. The prototype passes no expiry handler,
  // so the reading reaches "Time is up" and the screen stays put with
  // every answer still selected.
  timer: {
    seconds: 600,
    warningAtSeconds: 60,
    urgentAtSeconds: 20,
    source: "published",
    note: "10 minutes, published per part in the official Reading Overview PDF. The Mock Test 1 content map reads 9 minutes off a screenshot; the published table is preferred, as it is for Reading Part 1.",
  },

  // The left column: the lettered paragraphs, and nothing else.
  //
  // paragraphs is empty because this part has no unlabelled prose at all.
  // Every line of the passage belongs to one of the five lettered
  // entries, which is what makes Part 3 the paragraph matching part.
  //
  // E is in this list with the other four because the document puts it
  // there and because a learner choosing E has to be able to read what it
  // means. It is a choice rather than a paragraph, which the sentence
  // itself says plainly.
  passage: {
    paragraphs: [],
    sections: [
      {
        label: "A",
        paragraphs: [
          'On May 8, 1987, Canada introduced the one-dollar coin now known as the "loonie." It is eleven-sided and gold-coloured (it\'s actually bronze-plated nickel). The coin features a design by Ontario wildlife artist Robert Ralph Carmichael - a loon on one side and Queen Elizabeth II on the other. Canada is, after all, still a member of the British Commonwealth. The loon is a water bird common across Canada, known for its ability to swim great distances under water and for its beautiful, haunting call.',
        ],
      },
      {
        label: "B",
        paragraphs: [
          "The loonie wasn't Canada's first one-dollar coin. A silver dollar was introduced in 1935, featuring an image of two voyageurs paddling a canoe on one side and, to display Canada's British connections, an image of Britain's King George on the other. But the silver dollar-which was made of nickel by 1967-wasn't used much because of its size and weight (about 23 grams). What was in common use was a green-and-white paper bill. However, the paper bills wore out within a year, which is why the loonie was introduced. It was expected to last twenty years, saving taxpayers $175-250 million.",
        ],
      },
      {
        label: "C",
        paragraphs: [
          "In fact, the Royal Canadian Mint intended to use the same voyageur design for the new coin, but the master dies were lost somewhere between Ottawa and the Winnipeg production facility. The dies were entrusted to a courier service instead of to a high-security service. Worse, apparently no one asked the courier representative who showed up to take possession of the dies for identification. Worse still, designs for both sides of the coin went in the same package instead of in separate packages. For these reasons, the Mint suspected foul play and, fearing counterfeits, decided to go with a new design, that by Carmichael. An investigation by the Royal Canadian Mounted Police concluded, however, that the dies were simply lost in transit.",
        ],
      },
      {
        label: "D",
        paragraphs: [
          'In 1996, the orange-brown two-dollar paper bill was also replaced with a coin. Called a "toonie," the silver coin has a gold center (actually nickel and bronze) featuring another Canadian animal, a polar bear on an ice floe. Already light, at 7.3 grams, a lighter version was introduced in 2012 by replacing the nickel with steel. A lighter version of the loonie was also introduced. Unfortunately, the lighter coins didn\'t work in coin-operated machines, such as vending machines, parking meters, and washers and dryers in laundromats. As a result, many business owners have had to pay thousands of dollars to replace and upgrade their equipment.',
        ],
      },
      {
        label: "E",
        paragraphs: ["Not given in any of the above paragraphs."],
      },
    ],
  },

  // One group. Reading Parts 1, 2 and 4 each have two panels on the
  // answer side, a set of questions and a body of text with blanks in it.
  // Part 3 has neither: it is nine statements under one instruction line,
  // which is one group.
  questionGroups: [
    {
      id: "reading-part-3-statements",
      label: "Questions 1 to 9",
      // The source document's own line above the statements, verbatim.
      instruction:
        "Decide which paragraph, A to D, has the information given in each statement below. Select E if the information is not given in any of the paragraphs.",
      // Whole statements rather than sentence stems, so each carries text
      // and none of them draws a blank. The options are the same five on
      // every one of them, stamped on from PARAGRAPH_LABELS above.
      questions: STATEMENTS.map((text, index) => {
        const number = index + 1;
        const id = `reading-part-3-q${number}`;

        return {
          id,
          number,
          text,
          options: buildParagraphOptions(id),
        };
      }),
    },
  ],

  // Stored, and stripped by the route before the content reaches the
  // browser. It is read on the server only, by markReadingPartThree in
  // actions.ts beside the route, the way markReadingPartOne and
  // markReadingPartTwo read theirs.
  answerKey: ANSWER_KEY,
};
