// Mock Test 1, Reading Part 4: Reading for Viewpoints (EXAM-22).
//
// Source: mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx, the block
// headed "Reading Part 4: Reading for Viewpoints", cross checked against
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
// What this part is, and why it needed no new content shapes. Reading
// Part 4 is the pair Reading Part 1 already is: a body of prose on the
// left, five sentence stems about it, and then a second body of prose
// with five numbered blanks in it. Part 1's is a letter and a written
// reply; Part 4's is a website article and a reader comment underneath
// it. So the passage is ReadingPassage.paragraphs, the stems are
// textBefore questions, and the comment is a ReadingResponse whose
// paragraphs are already split into text and blank segments. Nothing in
// reading-types.ts changed for this part.
//
// Notes on the source material, all deliberate:
//
// - The document's curly quotation marks and curly apostrophes are
//   written as straight ones, which is the house style every content file
//   in the repository already follows. No wording changes with it.
// - The document writes its two drop-down instruction lines with an empty
//   pair of brackets in them, "from the drop-down menu (  )", where the
//   brackets stand in for a picture of the control. The brackets are
//   dropped, which is the call Reading Parts 1 and 2 already made for the
//   same lines, because an empty pair of brackets on screen reads as a
//   missing image rather than as an instruction.
// - The comment prints "7. _______ ." and "9. _______ ." with a space
//   before the full stop. The space is a consequence of the underscores
//   being typed inline and is dropped here, so each sentence closes
//   normally once the blank is filled. Same handling Reading Part 1's
//   reply needed.
// - Question 10 option d reads "too burdensome for businesses." with a
//   full stop where the other three options in that group end without
//   one. That is the document's own inconsistency and it is kept, the way
//   Reading Part 1 question 1 option c keeps its missing full stop:
//   option text is source text, and correcting punctuation silently is
//   how a transcription starts to drift.
// - The document prints "QUESTIONS:" above the five stems and
//   "Questions:" above the five comment blanks. Those are headings for a
//   printed page rather than learner facing copy: on screen each panel
//   already carries its own label and its own instruction line, so they
//   are not in this file.
// - The two author notes in this block, "(the article will come here on
//   the left side of the screen)" and "And question will appear on the
//   right side of the screen", are instructions to us and not learner
//   facing copy. They are not in this file. What they describe is the
//   layout the split screen already implements.
//
// The stem text below stops where the document's underscores begin. The
// blank is drawn by the question list, so the underscores are not stored.
// The same is true inside the comment, where a blank is a segment rather
// than a run of underscores in a string.
//
// The answer key is confirmed and complete, which means this file must
// never be handed to the browser whole. See the note on ANSWER_KEY.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ReadingAnswerKeyEntry,
  ReadingPartContent,
} from "@/features/exam-engine/reading-types";

// Answer key for the whole part, one entry per question, in order.
//
// source is "document" on every entry. The Reading answer keys are
// printed as text in the source document, under "Answers & Explanations",
// and the PART04 table runs Question 1 to Question 10. Unlike the PART03
// table, which gives letters, this one gives the option text itself, so
// each entry below was matched by finding the option whose text is the
// one the table prints. The text is repeated in a trailing comment so a
// key can be checked against the question below without scrolling.
// Nothing was guessed and no question or option was reworded to make a
// key fit.
//
// The key is complete, so shipping it to the browser would hand a learner
// the answers. The Reading Part 4 route strips it with
// withoutReadingAnswerKey before rendering, the same way the Reading Part
// 1, Part 2 and Part 3 routes and every Listening route strip their own,
// so nothing here reaches the question screen.
//
// EXAM-23 is what reads it, and it reads it the way markReadingPartOne,
// markReadingPartTwo and markReadingPartThree read theirs:
// markReadingPartFour, in actions.ts beside the route, runs on the server
// and imports this module directly rather than trusting anything the
// browser sends. What crosses back to the browser is finished review
// rows, never the key.
//
// The key is unchanged by EXAM-23. Every entry was re-checked against the
// source document's PART04 table while the marking was wired up and no
// mismatch was found, so this list is byte for byte what EXAM-22 shipped.
const ANSWER_KEY: ReadingAnswerKeyEntry[] = [
  // strengthen economic ties.
  { questionId: "reading-part-4-q1", correctOptionId: "reading-part-4-q1-a", source: "document" },
  // increased opportunities for both parties.
  { questionId: "reading-part-4-q2", correctOptionId: "reading-part-4-q2-b", source: "document" },
  // a pointless proposition.
  { questionId: "reading-part-4-q3", correctOptionId: "reading-part-4-q3-b", source: "document" },
  // lead a different lifestyle than Canadians.
  { questionId: "reading-part-4-q4", correctOptionId: "reading-part-4-q4-a", source: "document" },
  // in favour of the proposal.
  { questionId: "reading-part-4-q5", correctOptionId: "reading-part-4-q5-a", source: "document" },
  // incorporate a group of sunny southern islands
  { questionId: "reading-part-4-q6", correctOptionId: "reading-part-4-q6-c", source: "document" },
  // Ewing remained largely silent on the matter
  { questionId: "reading-part-4-q7", correctOptionId: "reading-part-4-q7-a", source: "document" },
  // need an incentive from
  { questionId: "reading-part-4-q8", correctOptionId: "reading-part-4-q8-c", source: "document" },
  // tersely dismissive Conservative position
  { questionId: "reading-part-4-q9", correctOptionId: "reading-part-4-q9-d", source: "document" },
  // an unfeasible scheme
  { questionId: "reading-part-4-q10", correctOptionId: "reading-part-4-q10-c", source: "document" },
];

export const readingPart4: ReadingPartContent = {
  testId: "mock-test-1",
  sectionId: "reading-part-4",
  title: "Practice Test 1 - Reading Part 4: Reading for Viewpoints",
  partTitle: "Reading for Viewpoints",
  subtitle:
    "Read the following information before this part of the practice test begins.",
  // The source document gives Reading Part 4 no instruction bullets of
  // its own, exactly as it gives Parts 1, 2 and 3 none. It has section
  // level Reading instructions, which belong to the Reading instructions
  // screen and not to this part, and then three instruction lines that
  // sit directly above the content they govern: one above the article,
  // carried as passageInstruction below, and one above each of the two
  // question panels, carried on the groups.
  //
  // These three bullets are written for this prototype rather than copied
  // from anywhere. They describe what this screen actually does: what the
  // learner is given, how the two halves of the part differ, and how many
  // questions there are. Nothing here promises official test behaviour
  // the screen does not have.
  instructions: [
    "You will read a website article in which several people give their views on one proposal.",
    "Questions 1 to 5 ask about the article. Complete each sentence from its drop-down menu.",
    "Questions 6 to 10 are blanks inside a reader comment below the article. Choose the best option for each blank.",
  ],
  summary:
    "A website article about the proposed annexation of Turks and Caicos, followed by a reader comment to complete.",
  // The source document's own line above the article, verbatim.
  passageInstruction: "Read the following article from a website.",

  // Reading Part 4 timing.
  //
  // 13 minutes, published per part in the official Reading Overview PDF
  // and recorded in docs/product/celpip-exam-rules-research.md sections 3
  // and 10. It is a part allowance, not a screen or question window,
  // which suits a part that is one screen.
  //
  // One conflict worth knowing about, and it is the same shape as the
  // ones Reading Parts 1 and 3 carry.
  // docs/product/mock-test-1-content-map.md lists Reading Part 4 as 12
  // minutes, read off an official screenshot rather than a published
  // table. The research document's 13 minutes wins here because it comes
  // from the overview PDF, which is the only source giving a figure for
  // every Reading part in one consistent unit, and because preferring it
  // is the call Reading Parts 1 and 3 already made for the same
  // disagreement. The difference is one minute and is written up in
  // docs/product/reading-part-4-prototype.md so nobody has to rediscover
  // it.
  //
  // A minute of amber and twenty seconds of red, the same long window
  // thresholds Reading Parts 1, 2 and 3 use.
  //
  // Nothing enforces this window. The prototype passes no expiry handler,
  // so the reading reaches "Time is up" and the screen stays put with
  // every answer still selected.
  timer: {
    seconds: 780,
    warningAtSeconds: 60,
    urgentAtSeconds: 20,
    source: "published",
    note: "13 minutes, published per part in the official Reading Overview PDF. The Mock Test 1 content map reads 12 minutes off a screenshot; the published table is preferred, as it is for Reading Parts 1 and 3.",
  },

  // The left column: the article, five paragraphs of running prose.
  //
  // No heading and no sign off. Part 1's passage is a letter, so it has
  // both; this one is a website article and the document prints neither a
  // headline nor a byline for it. sections is unset, because nothing in
  // this part is answered by naming a paragraph.
  passage: {
    paragraphs: [
      "A recent visit to Canada by Turks and Caicos Premier, Rufus Ewing, resparked interest in Canada's annexation of the country. Turks and Caicos, a Caribbean archipelago of 40 islands, has been a point of interest in Canada's history. This most recent debate marks the third time in the last century that Ottawa politicians have pushed to make the territory Canada's eleventh province. With over 300 kilometres of beaches, the tropical paradise would certainly be a welcome asset.",
      "Ewing hailed Canada as a role model of fiscal responsibility from which his country could learn, accolades that resounded in Ottawa on the foreign leader's recent diplomatic junket to spur bilateral trade and tourism. When asked about the possibility of Turks and Caicos becoming a Canadian province, the Premier skirted the issue. He said he would not dismiss the idea completely, but he also offered us a glimmer of hope with the tantalizing observation that \"there is no marriage without some kind of relationship first.\"",
      "Liberal politician Peter Goldring is spearheading the latest campaign for the annexation and feels that much of the legwork has already been done. According to Goldring, \"Canada has the greatest proportion of foreign investment in Turks and Caicos, and the second highest number of tourists to the country. Annexation would permit further growth in these areas.\" Goldring also argues that the island could serve as a gateway to Latin America. \"The location would be ideal for military support from Ottawa and particularly for disaster relief,\" he adds.",
      "Disappointingly, Conservative politician Janice Bloom calls the whole idea a pipe dream. \"Canada is not in the business of annexing tropical islands,\" she claims. \"Annexation would be extremely complicated since it would involve changes to the islands' tax and health care systems.\" Bloom contends that the government has more pressing matters.",
      "Yet, according to a recent poll, the majority of the islands' residents support the proposal. Cab driver Ron Douglas says he'd love the opportunity to work in Alberta's oil industry. However, he admits the primary concern of many locals is that Canada's rules are too strict. \"They go against the laid-back attitude of us islanders.\"",
    ],
  },

  // Two groups, in document order: the five stems about the article, then
  // the reader comment with its five blanks. The same pair Reading Part 1
  // has, and the reverse of Reading Part 2, which prints its completion
  // text first.
  questionGroups: [
    {
      id: "reading-part-4-article-questions",
      label: "Questions 1 to 5",
      // The source document's own line above this group, with the empty
      // brackets dropped. See the file header.
      instruction:
        "Using the drop-down menu, choose the best option according to the information given on the website.",
      questions: [
        {
          id: "reading-part-4-q1",
          number: 1,
          textBefore: "Ewing visited Ottawa to",
          options: [
            {
              id: "reading-part-4-q1-a",
              text: "strengthen economic ties.",
            },
            {
              id: "reading-part-4-q1-b",
              text: "discuss joining Canada.",
            },
            {
              id: "reading-part-4-q1-c",
              text: "study financial policies.",
            },
            {
              id: "reading-part-4-q1-d",
              text: "boost investment in Canada.",
            },
          ],
        },
        {
          id: "reading-part-4-q2",
          number: 2,
          textBefore: "Arguments presented in favour of annexation suggest",
          options: [
            {
              id: "reading-part-4-q2-a",
              text: "improved regulations for both countries.",
            },
            {
              id: "reading-part-4-q2-b",
              text: "increased opportunities for both parties.",
            },
            {
              id: "reading-part-4-q2-c",
              text: "increased tourism in both countries.",
            },
            {
              id: "reading-part-4-q2-d",
              text: "improved health care for both parties.",
            },
          ],
        },
        {
          id: "reading-part-4-q3",
          number: 3,
          textBefore: "Janice Bloom believes that annexing Turks and Caicos is",
          options: [
            {
              id: "reading-part-4-q3-a",
              text: "a shared Canadian dream.",
            },
            {
              id: "reading-part-4-q3-b",
              text: "a pointless proposition.",
            },
            {
              id: "reading-part-4-q3-c",
              text: "a worthy cause to pursue.",
            },
            {
              id: "reading-part-4-q3-d",
              text: "a pressing government issue.",
            },
          ],
        },
        {
          id: "reading-part-4-q4",
          number: 4,
          textBefore: "Inhabitants of Turks and Caicos",
          options: [
            {
              id: "reading-part-4-q4-a",
              text: "lead a different lifestyle than Canadians.",
            },
            {
              id: "reading-part-4-q4-b",
              text: "want to speed up the process of joining Canada.",
            },
            {
              id: "reading-part-4-q4-c",
              text: "have high rates of unemployment.",
            },
            {
              id: "reading-part-4-q4-d",
              text: "value their independence from foreign powers.",
            },
          ],
        },
        {
          id: "reading-part-4-q5",
          number: 5,
          textBefore: "The author of the article is",
          options: [
            {
              id: "reading-part-4-q5-a",
              text: "in favour of the proposal.",
            },
            {
              id: "reading-part-4-q5-b",
              text: "skeptical about the prospect.",
            },
            {
              id: "reading-part-4-q5-c",
              text: "opposed to the annexation.",
            },
            {
              id: "reading-part-4-q5-d",
              text: "surprised by the reactions.",
            },
          ],
        },
      ],
    },
    {
      id: "reading-part-4-comment",
      label: "Questions 6 to 10",
      // The source document's own line above the comment, verbatim.
      instruction:
        "The following is a comment by a visitor to the website page. Complete the comment by choosing the best option to fill in each blank.",
      response: {
        // No header lines, no salutation and no sign off. The document
        // prints this as one unsigned comment under an article, not as a
        // letter and not as an email, so none of the three would have
        // anything to hold.
        paragraphs: [
          {
            segments: [
              {
                kind: "text",
                text: "I have to admit, reading that Canada could potentially ",
              },
              { kind: "blank", questionId: "reading-part-4-q6", number: 6 },
              {
                kind: "text",
                text: " made my day. To be honest, however, I am not at all surprised that ",
              },
              { kind: "blank", questionId: "reading-part-4-q7", number: 7 },
              {
                kind: "text",
                text: ". Turks and Caicos officials have approached the Canadian government before regarding the issue, and were rejected each time. As Ewing insinuates, they likely ",
              },
              { kind: "blank", questionId: "reading-part-4-q8", number: 8 },
              {
                kind: "text",
                text: " Canada now. I am, however, shocked by the ",
              },
              { kind: "blank", questionId: "reading-part-4-q9", number: 9 },
              {
                kind: "text",
                text: ". You'd think if there was any financial gain to be had, they would be the first on board. However, I do agree with Bloom's sentiment that at present, it is perhaps ",
              },
              { kind: "blank", questionId: "reading-part-4-q10", number: 10 },
              { kind: "text", text: "." },
            ],
          },
        ],
      },
      // These five print no stem of their own. The sentence each one
      // completes is in the comment above, which is why textBefore and
      // text are both unset throughout this group.
      questions: [
        {
          id: "reading-part-4-q6",
          number: 6,
          options: [
            {
              id: "reading-part-4-q6-a",
              text: "enter into business with a Caribbean paradise",
            },
            {
              id: "reading-part-4-q6-b",
              text: "forge new diplomatic ties with Turks and Caicos",
            },
            {
              id: "reading-part-4-q6-c",
              text: "incorporate a group of sunny southern islands",
            },
            {
              id: "reading-part-4-q6-d",
              text: "promote low-cost travel throughout the Caribbean",
            },
          ],
        },
        {
          id: "reading-part-4-q7",
          number: 7,
          options: [
            {
              id: "reading-part-4-q7-a",
              text: "Ewing remained largely silent on the matter",
            },
            {
              id: "reading-part-4-q7-b",
              text: "Goldring felt he has done all that he can",
            },
            {
              id: "reading-part-4-q7-c",
              text: "Bloom thought Ewing has better things to do",
            },
            {
              id: "reading-part-4-q7-d",
              text: "Douglas feared a Canadian job might be too hard",
            },
          ],
        },
        {
          id: "reading-part-4-q8",
          number: 8,
          options: [
            {
              id: "reading-part-4-q8-a",
              text: "feel resentment toward",
            },
            {
              id: "reading-part-4-q8-b",
              text: "desire compensation from",
            },
            {
              id: "reading-part-4-q8-c",
              text: "need an incentive from",
            },
            {
              id: "reading-part-4-q8-d",
              text: "want to avoid relations with",
            },
          ],
        },
        {
          id: "reading-part-4-q9",
          number: 9,
          options: [
            {
              id: "reading-part-4-q9-a",
              text: "arrogantly overconfident Liberal position",
            },
            {
              id: "reading-part-4-q9-b",
              text: "evidently guileful Turks and Caicos Premier",
            },
            {
              id: "reading-part-4-q9-c",
              text: "highly reluctant Turks and Caicos resident",
            },
            {
              id: "reading-part-4-q9-d",
              text: "tersely dismissive Conservative position",
            },
          ],
        },
        {
          id: "reading-part-4-q10",
          number: 10,
          options: [
            {
              id: "reading-part-4-q10-a",
              text: "too late to implement",
            },
            {
              id: "reading-part-4-q10-b",
              text: "an urgent political matter",
            },
            {
              id: "reading-part-4-q10-c",
              text: "an unfeasible scheme",
            },
            // Full stop in the source document where the other three have
            // none. See the file header.
            {
              id: "reading-part-4-q10-d",
              text: "too burdensome for businesses.",
            },
          ],
        },
      ],
    },
  ],

  // Stored, and stripped by the route before the content reaches the
  // browser. Nothing reads it yet: EXAM-22 builds no review and no score,
  // so the key sits here for EXAM-23 to read on the server.
  answerKey: ANSWER_KEY,
};
