// Mock Test 1, Reading Part 1: Reading Correspondence (EXAM-16).
//
// Source: mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx, the block
// headed "Part 1: Reading Correspondence", cross checked against the part
// summary in docs/product/mock-test-1-content-map.md and the outline in
// mock-tests/mock-test-1/extracted-content-outline.md.
//
// This is licensed Toronto Academy content. Every route that imports this
// file must sit behind the dashboard auth guard.
//
// The part has no assets of any kind. The content map records it as "all
// text", and extracted-links.md lists no Cloudinary URL for it, so there
// is nothing here to reference and nothing to download.
//
// Notes on the source material, all deliberate:
//
// - The document's curly apostrophes and curly quotation marks are
//   written as straight ones, which is the house style and what the
//   Listening content files already do.
// - Paragraph 2 of the message contains one em dash, in "I'm not a nature
//   guy - a fact which might explain". The house style forbids em dashes,
//   so it is written as a spaced normal hyphen. That is the only
//   character in the passage that is not the document's own.
// - Question 1 option c reads "no longer live in Vancouver" with no full
//   stop, where the other three options in the group end with one. That
//   is the document's own inconsistency and it is kept, because option
//   text is source text and correcting punctuation silently is how a
//   transcription starts to drift.
// - The reply prints "you are right, 10. _______ ." with a space before
//   the full stop. The space is a consequence of the underscores being
//   typed inline and is dropped here, so the sentence closes normally
//   once the blank is filled.
// - The two author notes in this block, "(the passage will come here on
//   the left side of the screen)" and "And question will appear on the
//   right side of the screen", are instructions to us and not learner
//   facing copy. They are not in this file. What they describe is the
//   layout the split screen already implements.
//
// The stem text below stops where the document's underscores begin. The
// blank is drawn by the question list, so the underscores are not stored.
// The same is true inside the reply, where a blank is a segment rather
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
// source is "document" on every entry because Reading answer keys are
// printed as text in the source document, in four tables under
// "Answers & Explanations". Reading needed no transcription from
// screenshots, which is the difference between this key and the six
// Listening keys.
//
// Every value below was matched to an existing option by exact text.
// Where the key table prints a trailing full stop and the option does
// not, or the reverse, the match was made on the wording; no option text
// was changed to make a key fit, and nothing was guessed. The option text
// is repeated in a trailing comment so the id can be checked against the
// question below without scrolling, and so a later edit to an option
// cannot quietly move an answer.
//
// The key is complete, so shipping it to the browser would hand a learner
// the answers. The Reading Part 1 route strips it with
// withoutReadingAnswerKey before rendering, the same way every Listening
// route strips its own, so nothing here reaches the question screen.
//
// EXAM-17 reads it, and reads it in exactly one place: markReadingPartOne
// in the actions.ts beside the Reading Part 1 route, which imports this
// module on the server, marks the answers the browser sent, and returns
// finished review rows rather than the key itself. The key was checked
// again against the source document during that ticket and no mismatch
// was found, so nothing below changed.
const ANSWER_KEY: ReadingAnswerKeyEntry[] = [
  // recently moved to Vancouver.
  { questionId: "reading-part-1-q1", correctOptionId: "reading-part-1-q1-d", source: "document" },
  // it is something Kelly enjoys.
  { questionId: "reading-part-1-q2", correctOptionId: "reading-part-1-q2-b", source: "document" },
  // answer a question about his anniversary.
  { questionId: "reading-part-1-q3", correctOptionId: "reading-part-1-q3-c", source: "document" },
  // did not turn out as they had planned.
  { questionId: "reading-part-1-q4", correctOptionId: "reading-part-1-q4-b", source: "document" },
  // went running into the woods after Sparky.
  { questionId: "reading-part-1-q5", correctOptionId: "reading-part-1-q5-c", source: "document" },
  // found shelter before it got dark out.
  { questionId: "reading-part-1-q6", correctOptionId: "reading-part-1-q6-b", source: "document" },
  // best employee
  { questionId: "reading-part-1-q7", correctOptionId: "reading-part-1-q7-a", source: "document" },
  // have a great time
  { questionId: "reading-part-1-q8", correctOptionId: "reading-part-1-q8-d", source: "document" },
  // scary
  { questionId: "reading-part-1-q9", correctOptionId: "reading-part-1-q9-b", source: "document" },
  // it was challenging at first
  { questionId: "reading-part-1-q10", correctOptionId: "reading-part-1-q10-a", source: "document" },
  // lost in the woods
  { questionId: "reading-part-1-q11", correctOptionId: "reading-part-1-q11-d", source: "document" },
];

export const readingPart1: ReadingPartContent = {
  testId: "mock-test-1",
  sectionId: "reading-part-1",
  title: "Practice Test 1 - Reading Part 1: Reading Correspondence",
  partTitle: "Reading Correspondence",
  subtitle:
    "Read the following information before this part of the practice test begins.",
  // The source document gives Reading Part 1 no instruction bullets of
  // its own. It has section level Reading instructions, which belong to
  // the Reading instructions screen and not to this part, and then two
  // instruction lines that sit directly above the content they govern and
  // are carried on the question groups below.
  //
  // These three bullets are written for this prototype rather than copied
  // from anywhere. They describe what this screen actually does: what the
  // learner is given, how many questions there are, and how they are
  // answered. Nothing here promises official test behaviour the screen
  // does not have.
  instructions: [
    "You will read a message and a written response to it.",
    "There are 11 questions: 6 about the message and 5 inside the response.",
    "Choose the best option for each question from the drop-down menu.",
  ],
  summary:
    "A personal letter about a hiking trip, and the reply it received.",
  passageInstruction: "Read the following message.",

  // Reading Part 1 timing.
  //
  // 11 minutes, published per part in the official Reading Overview PDF
  // and recorded in docs/product/celpip-exam-rules-research.md sections 3
  // and 10. It is a part allowance, not a screen or question window,
  // which suits a part that is one screen.
  //
  // One conflict worth knowing about.
  // docs/product/mock-test-1-content-map.md lists Reading Part 1 as 10
  // minutes, read off an official screenshot rather than a published
  // table. The research document's 11 minutes wins here because it comes
  // from the overview PDF, which is the only source giving a figure for
  // every Reading part in one consistent unit. The disagreement is one
  // minute and is written up in
  // docs/product/reading-part-1-prototype.md so nobody has to rediscover
  // it.
  //
  // A minute of amber and twenty seconds of red, the long window
  // thresholds listening-timing.ts uses, rather than the ten and five
  // seconds that suit a 30 second question.
  //
  // Nothing enforces this window. The prototype passes no expiry handler,
  // so the reading reaches "Time is up" and the screen stays put with
  // every answer still selected.
  timer: {
    seconds: 660,
    warningAtSeconds: 60,
    urgentAtSeconds: 20,
    source: "published",
    note: "11 minutes, published per part in the official Reading Overview PDF. The Mock Test 1 content map reads 10 minutes off a screenshot; the published table is preferred.",
  },

  passage: {
    label: "Message",
    heading: "Dear Scott,",
    paragraphs: [
      "Has everyone adjusted to their new city yet? I know moving to Vancouver might have been difficult on your family, but you made the right choice. You would have been crazy to pass up such an amazing opportunity. That being said, the office sure isn't the same without you!",
      "Anyways, you'd been asking if I had plans for the \"big anniversary,\" so I had to write and tell what happened. Since Kelly loves the outdoors, I had the brilliant idea of hiking in Algonquin Park. I say \"brilliant\" because, as you know, I'm not a nature guy - a fact which might explain why my romantic gesture went so wrong.",
      "We decided to bring Sparky, figuring he'd love running around off-leash. Big mistake! We'd been hiking for about 2 hours when Sparky, having spotted something interesting, suddenly tore off into the bush. Worried he'd get lost, we went chasing after him. Apparently, however, we should've been more worried about ourselves getting lost. By the time we'd caught up with him, the trail was nowhere in sight and we had no idea where we were. While Sparky sat wagging his tail, thinking this was the best game ever, Kelly and I panicked. Since we hadn't told anyone where we were going, it made no sense to stay put and wait for help. So we decided to keep walking, hoping we'd picked the right direction. Five hours later, with no sight of the trail and a darkening sky, we had our doubts. Amazingly, just as we started to think all was lost, we stumbled across an abandoned ranger cabin. There wasn't much inside, but it had the essentials: a map, a compass, a few cans of beans, and a bed. Having eaten the last of our food hours ago, we quickly dug into the beans. Then, exhausted, we collapsed into bed. The next morning we used the map and compass to lead us out of the woods. It turns out we'd only been a few kilometres from our car!",
      "Needless to say, I have no intention of venturing back into the woods any time soon. Make sure to be careful if you do any hiking out there. It's easier to get lost than you think!",
    ],
    signOff: ["Cheers,", "Jim"],
  },

  questionGroups: [
    {
      id: "reading-part-1-message-questions",
      label: "Questions 1 to 6",
      // The source document's own line above this group. The drop-down
      // clause is kept because the screen really does draw a select.
      instruction:
        "Using the drop-down menu, choose the best option according to the information given in the message.",
      questions: [
        {
          id: "reading-part-1-q1",
          number: 1,
          textBefore: "Scott and his family",
          options: [
            {
              id: "reading-part-1-q1-a",
              text: "have lived in Vancouver for many years.",
            },
            {
              id: "reading-part-1-q1-b",
              text: "will soon be moving to Vancouver.",
            },
            // No full stop in the source document. See the file header.
            {
              id: "reading-part-1-q1-c",
              text: "no longer live in Vancouver",
            },
            {
              id: "reading-part-1-q1-d",
              text: "recently moved to Vancouver.",
            },
          ],
        },
        {
          id: "reading-part-1-q2",
          number: 2,
          textBefore: "Jim and Kelly went hiking because",
          options: [
            {
              id: "reading-part-1-q2-a",
              text: "they both love the outdoors.",
            },
            {
              id: "reading-part-1-q2-b",
              text: "it is something Kelly enjoys.",
            },
            {
              id: "reading-part-1-q2-c",
              text: "Sparky likes to run off-leash.",
            },
            {
              id: "reading-part-1-q2-d",
              text: "Jim loves spending time in nature.",
            },
          ],
        },
        {
          id: "reading-part-1-q3",
          number: 3,
          textBefore: "Jim wrote Scott to",
          options: [
            {
              id: "reading-part-1-q3-a",
              text: "ask about his new job in Vancouver.",
            },
            {
              id: "reading-part-1-q3-b",
              text: "warn him about hiking around Vancouver.",
            },
            {
              id: "reading-part-1-q3-c",
              text: "answer a question about his anniversary.",
            },
            {
              id: "reading-part-1-q3-d",
              text: "tell how Sparky saved a bad hiking trip.",
            },
          ],
        },
        {
          id: "reading-part-1-q4",
          number: 4,
          textBefore: "Jim and Kelly's recent anniversary",
          options: [
            {
              id: "reading-part-1-q4-a",
              text: "included staying at a cabin they had reserved.",
            },
            {
              id: "reading-part-1-q4-b",
              text: "did not turn out as they had planned.",
            },
            {
              id: "reading-part-1-q4-c",
              text: "was one of their favourite anniversaries ever.",
            },
            {
              id: "reading-part-1-q4-d",
              text: "involved a lot of driving in the car.",
            },
          ],
        },
        {
          id: "reading-part-1-q5",
          number: 5,
          textBefore: "The trouble began when Jim and Kelly",
          options: [
            {
              id: "reading-part-1-q5-a",
              text: "realized they had forgotten their map.",
            },
            // No full stop in the source document.
            {
              id: "reading-part-1-q5-b",
              text: "ran out of all their food and water",
            },
            {
              id: "reading-part-1-q5-c",
              text: "went running into the woods after Sparky.",
            },
            {
              id: "reading-part-1-q5-d",
              text: "decided to bring Sparky to the park.",
            },
          ],
        },
        {
          id: "reading-part-1-q6",
          number: 6,
          textBefore: "It was lucky that Jim and Kelly",
          options: [
            {
              id: "reading-part-1-q6-a",
              text: "had brought a compass with them.",
            },
            {
              id: "reading-part-1-q6-b",
              text: "found shelter before it got dark out.",
            },
            {
              id: "reading-part-1-q6-c",
              text: "had a good sleep the night before.",
            },
            {
              id: "reading-part-1-q6-d",
              text: "parked their car close to the trailhead.",
            },
          ],
        },
      ],
    },
    {
      id: "reading-part-1-response-questions",
      label: "Questions 7 to 11",
      // The source document's own line above this group. Its drop-down
      // clause is kept for the same reason as the first group's.
      instruction:
        "Here is a response to the message. Complete the response by filling in the blanks. Select the best choice for each blank from the drop-down menu.",
      response: {
        heading: "Dear Jim,",
        paragraphs: [
          {
            segments: [
              {
                kind: "text",
                text: "It's great to hear from you! I've been wondering what my ",
              },
              { kind: "blank", questionId: "reading-part-1-q7", number: 7 },
              {
                kind: "text",
                text: " has been up to without me around. However, I am sorry to hear that you did not ",
              },
              { kind: "blank", questionId: "reading-part-1-q8", number: 8 },
              {
                kind: "text",
                text: " on your anniversary. I can only imagine how ",
              },
              { kind: "blank", questionId: "reading-part-1-q9", number: 9 },
              { kind: "text", text: " that must have been!" },
            ],
          },
          {
            segments: [
              { kind: "text", text: "As to things here, you are right, " },
              { kind: "blank", questionId: "reading-part-1-q10", number: 10 },
              {
                kind: "text",
                text: ". However, it seems like my family is really starting to like it here. The kids have already made a list of trails and mountains they want to explore. Although, after hearing your story I think we might all take an outdoor education course first. I sure don't want to end up ",
              },
              { kind: "blank", questionId: "reading-part-1-q11", number: 11 },
              { kind: "text", text: " like you!" },
            ],
          },
        ],
        signOff: ["Take care,", "Scott"],
      },
      // These five print no stem of their own. The sentence each one
      // completes is in the reply above, which is why textBefore is unset
      // throughout this group.
      questions: [
        {
          id: "reading-part-1-q7",
          number: 7,
          options: [
            { id: "reading-part-1-q7-a", text: "best employee" },
            { id: "reading-part-1-q7-b", text: "next-door neighbour" },
            { id: "reading-part-1-q7-c", text: "favorite brother" },
            { id: "reading-part-1-q7-d", text: "old roommate" },
          ],
        },
        {
          id: "reading-part-1-q8",
          number: 8,
          options: [
            { id: "reading-part-1-q8-a", text: "find your car" },
            { id: "reading-part-1-q8-b", text: "find Sparky" },
            { id: "reading-part-1-q8-c", text: "eat dinner" },
            { id: "reading-part-1-q8-d", text: "have a great time" },
          ],
        },
        {
          id: "reading-part-1-q9",
          number: 9,
          options: [
            { id: "reading-part-1-q9-a", text: "annoying" },
            { id: "reading-part-1-q9-b", text: "scary" },
            { id: "reading-part-1-q9-c", text: "relieving" },
            { id: "reading-part-1-q9-d", text: "reassuring" },
          ],
        },
        {
          id: "reading-part-1-q10",
          number: 10,
          options: [
            {
              id: "reading-part-1-q10-a",
              text: "it was challenging at first",
            },
            {
              id: "reading-part-1-q10-b",
              text: "this may have been a mistake",
            },
            {
              id: "reading-part-1-q10-c",
              text: "the transition went smoothly",
            },
            {
              id: "reading-part-1-q10-d",
              text: "the job is harder than expected",
            },
          ],
        },
        {
          id: "reading-part-1-q11",
          number: 11,
          options: [
            { id: "reading-part-1-q11-a", text: "chasing Sparky" },
            {
              id: "reading-part-1-q11-b",
              text: "eating canned vegetables",
            },
            { id: "reading-part-1-q11-c", text: "locked up in a cabin" },
            { id: "reading-part-1-q11-d", text: "lost in the woods" },
          ],
        },
      ],
    },
  ],

  answerKey: ANSWER_KEY,
};
