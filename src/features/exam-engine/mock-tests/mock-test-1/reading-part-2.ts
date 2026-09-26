// Mock Test 1, Reading Part 2: Reading to Apply a Diagram (EXAM-18).
//
// Source: mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx, the block
// headed "Reading Part 2: Reading to Apply a Diagram", cross checked
// against the part summary in docs/product/mock-test-1-content-map.md,
// the outline in mock-tests/mock-test-1/extracted-content-outline.md and
// the asset list in mock-tests/mock-test-1/extracted-links.md.
//
// This is licensed Toronto Academy content. Every route that imports this
// file must sit behind the dashboard auth guard.
//
// The part has one asset, the course brochure the questions are answered
// from. It is referenced by its Cloudinary URL, the way the Listening
// content files reference their clips, and nothing is downloaded or
// re-hosted here. extracted-links.md lists it as the only Reading image
// in the test.
//
// Notes on the source material, all deliberate:
//
// - The document's curly apostrophes are written as straight ones, which
//   is the house style and what the Listening content files and Reading
//   Part 1 already do.
// - The email's blanks are printed in the document as "1. _______ ." with
//   a space before the full stop, a consequence of the underscores being
//   typed inline. The space is dropped here, so each sentence closes
//   normally once its blank is filled. Reading Part 1 made the same call
//   for the same reason.
// - The instruction line above the email ends "from the drop-down menu
//   (  )." in the document. The empty brackets held a picture of the
//   drop-down control that did not survive into the text, so they are
//   dropped and the sentence ends at "menu.". No wording is changed.
// - The document prints the email header as one unbroken run,
//   "Subject: Language CoursesTo: Charlie Veui cveui@tmscollg.comFrom:
//   Gerry Nalen Grnal@tmscollg.com". It is split back into the three
//   lines it plainly is. The two addresses are passage text rather than
//   real addresses, which extracted-links.md records, so they are stored
//   and rendered as plain text and never as mailto links.
// - The option list for question 1 has no "1." label in the document: the
//   four options run directly under the "Questions:" heading, and the
//   labels resume at "2.". The content map records this and the answer
//   key confirms the intended mapping, "little experience" being the
//   answer to question 1. The numbering below is 1 to 5 in document
//   order.
// - Questions 6, 7 and 8 print no numbers at all in the document. They
//   are three whole questions under the line "Using the drop-down menu,
//   choose the best option." The numbering comes from the answer key
//   table, which runs Question 1 to Question 8 and puts "roommate",
//   "returning to school" and "to prepare for a trip abroad" last, in
//   that order.
// - The three author notes in this block, "(the Diagram will come here on
//   the left side of the screen)", "And question will appear on the right
//   side of the screen" and the "Image <url>" line, are instructions to
//   us and not learner facing copy. They are not in this file. What they
//   describe is the layout the split screen already implements.
//
// Questions 1 to 5 are blanks inside the email, so they print no stem of
// their own and carry no textBefore. Questions 6 to 8 are whole questions
// and carry text, which is the shape EXAM-18 added to ReadingQuestion for
// exactly this group.
//
// The answer key is confirmed and complete, which means this file must
// never be handed to the browser whole. See the note on ANSWER_KEY.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ReadingAnswerKeyEntry,
  ReadingPartContent,
} from "@/features/exam-engine/reading-types";

// The course brochure the part is answered from.
//
// One Cloudinary PNG, listed in mock-tests/mock-test-1/extracted-links.md
// under "Reading images". Referenced, not downloaded, which is the
// handling rule that file sets out for every asset in the test.
//
// The base is split out the way the Listening content files split theirs,
// so the account name appears once per file rather than once per asset.
const IMAGE_BASE = "https://res.cloudinary.com/dkvsshy7n/image/upload";

// Answer key for the whole part, one entry per question, in order.
//
// source is "document" on every entry because Reading answer keys are
// printed as text in the source document, in four tables under
// "Answers & Explanations". The Part 2 table gives eight answers and
// every one of them matched an existing option by exact text. No option
// text was changed to make a key fit and nothing was guessed. The option
// text is repeated in a trailing comment so the id can be checked against
// the question below without scrolling, and so a later edit to an option
// cannot quietly move an answer.
//
// The key is complete, so shipping it to the browser would hand a learner
// the answers. The Reading Part 2 route strips it with
// withoutReadingAnswerKey before rendering, the same way the Reading Part
// 1 route and every Listening route strip their own, so nothing here
// reaches the question screen.
//
// Nothing reads this key yet. EXAM-18 builds no review and no score for
// Reading Part 2, so the key is stored and stripped and that is all. The
// next ticket is where it is read, and it should be read the way
// markReadingPartOne reads the Part 1 key: on the server, in a server
// action beside the route, importing this module directly rather than
// trusting anything the browser sends.
const ANSWER_KEY: ReadingAnswerKeyEntry[] = [
  // little experience
  { questionId: "reading-part-2-q1", correctOptionId: "reading-part-2-q1-a", source: "document" },
  // seems more demanding
  { questionId: "reading-part-2-q2", correctOptionId: "reading-part-2-q2-a", source: "document" },
  // teaches functional language
  { questionId: "reading-part-2-q3", correctOptionId: "reading-part-2-q3-d", source: "document" },
  // many people like it
  { questionId: "reading-part-2-q4", correctOptionId: "reading-part-2-q4-b", source: "document" },
  // it may be too much work
  { questionId: "reading-part-2-q5", correctOptionId: "reading-part-2-q5-b", source: "document" },
  // roommate
  { questionId: "reading-part-2-q6", correctOptionId: "reading-part-2-q6-a", source: "document" },
  // returning to school
  { questionId: "reading-part-2-q7", correctOptionId: "reading-part-2-q7-b", source: "document" },
  // to prepare for a trip abroad
  { questionId: "reading-part-2-q8", correctOptionId: "reading-part-2-q8-c", source: "document" },
];

export const readingPart2: ReadingPartContent = {
  testId: "mock-test-1",
  sectionId: "reading-part-2",
  title: "Practice Test 1 - Reading Part 2: Reading to Apply a Diagram",
  partTitle: "Reading to Apply a Diagram",
  subtitle:
    "Read the following information before this part of the practice test begins.",
  // The source document gives Reading Part 2 no instruction bullets of
  // its own, exactly as it gives Part 1 none. It has section level
  // Reading instructions, which belong to the Reading instructions screen
  // and not to this part, and then two instruction lines that sit
  // directly above the content they govern and are carried on the
  // question groups below.
  //
  // These three bullets are written for this prototype rather than copied
  // from anywhere. They describe what this screen actually does: what the
  // learner is given, how many questions there are, and how they are
  // answered. Nothing here promises official test behaviour the screen
  // does not have.
  instructions: [
    "You will study a course brochure and read an email about it.",
    "There are 8 questions: 5 inside the email and 3 about the situation.",
    "Choose the best option for each question from the drop-down menu.",
  ],
  summary:
    "A language school course brochure, and an email about which course to take.",
  // No passageInstruction. The source document prints no instruction line
  // above the diagram, only the author note saying where it goes, and the
  // one instruction it does print is about the email and is carried on
  // that group. Writing a line here would be inventing one.

  // Reading Part 2 timing.
  //
  // 9 minutes, published per part in the official Reading Overview PDF
  // and recorded in docs/product/celpip-exam-rules-research.md sections 3
  // and 10. It is a part allowance, not a screen or question window,
  // which suits a part that is one screen.
  //
  // No conflict here, unlike Part 1. docs/product/mock-test-1-content-map.md
  // reads 9 minutes for Part 2 off an official screenshot and the
  // research document's published table says 9 minutes as well, so both
  // sources we hold agree and nothing had to be preferred over anything.
  //
  // A minute of amber and twenty seconds of red, the same long window
  // thresholds Reading Part 1 uses.
  //
  // Nothing enforces this window. The prototype passes no expiry handler,
  // so the reading reaches "Time is up" and the screen stays put with
  // every answer still selected.
  timer: {
    seconds: 540,
    warningAtSeconds: 60,
    urgentAtSeconds: 20,
    source: "published",
    note: "9 minutes, published per part in the official Reading Overview PDF. The Mock Test 1 content map reads 9 minutes off a screenshot as well, so the two sources agree.",
  },

  // The left column: the course brochure, and nothing else.
  //
  // paragraphs is empty because the source gives this part no passage
  // prose at all. The whole of the left hand side is the picture, which
  // is what makes Part 2 the diagram part.
  //
  // The alt text describes what is in the brochure rather than naming it
  // as an image, because a learner who cannot see it still has to be able
  // to answer eight questions from it. It names the three courses, the
  // enrolment window and the kinds of fact each course entry carries. It
  // is a summary and not a transcription: a full text version of the
  // brochure is a content gap, written up in
  // docs/product/reading-part-2-prototype.md.
  passage: {
    label: "Diagram",
    paragraphs: [],
    image: {
      url: `${IMAGE_BASE}/v1785339294/Reading_Test_1_-_Part_2_czz4w3_z3b0au.png`,
      alt: "Course brochure from the Alpaca Education Centre, listing three language courses commencing the week of August 3rd to August 9th: Beginner French Level II Intensive, Beginner German Level I, and Introduction to American Sign Language. Each course gives its dates, a short description, its hours of instruction, its maximum class size, its teaching focus, and its morning and evening class times. The brochure also gives the centre's location, opening hours, phone number and email address, and notes that course availability is subject to change based on enrolment.",
      // Intrinsic size of the file, so the browser reserves the box and
      // the question column does not jump when the picture loads.
      width: 412,
      height: 557,
      caption: "Language course brochure",
    },
  },

  questionGroups: [
    {
      id: "reading-part-2-email-questions",
      label: "Questions 1 to 5",
      // The source document's own line above this group, with the empty
      // brackets after "drop-down menu" dropped. See the file header.
      instruction:
        "Read the following email message about the diagram on the left. Complete the email by filling in the blanks. Select the best choice for each blank from the drop-down menu.",
      response: {
        // Split back into the three lines the document runs together. The
        // two addresses are passage text and render as plain text.
        headerLines: [
          "Subject: Language Courses",
          "To: Charlie Veui cveui@tmscollg.com",
          "From: Gerry Nalen Grnal@tmscollg.com",
        ],
        heading: "Hi Charlie,",
        paragraphs: [
          {
            segments: [
              {
                kind: "text",
                text: "Remember how we always wanted to learn another language? Well, today I picked up a brochure for the language school down the street from our place. Let's take a course and travel at the end of the semester! The courses offered are all for learners with ",
              },
              { kind: "blank", questionId: "reading-part-2-q1", number: 1 },
              { kind: "text", text: ". The French course " },
              { kind: "blank", questionId: "reading-part-2-q2", number: 2 },
              {
                kind: "text",
                text: " than the others, but they promise that our language will get better fast. Or perhaps you'd prefer German? You've always wanted to see Germany, and this course ",
              },
              { kind: "blank", questionId: "reading-part-2-q3", number: 3 },
              { kind: "text", text: ". According to the brochure, " },
              { kind: "blank", questionId: "reading-part-2-q4", number: 4 },
              {
                kind: "text",
                text: ". Or we could think about future job opportunities and take American Sign Language. If we took it in the evening, it wouldn't affect our summer jobs. But when the fall semester starts, ",
              },
              { kind: "blank", questionId: "reading-part-2-q5", number: 5 },
              {
                kind: "text",
                text: ". On second thought, I'd rather take something useful for traveling. Oh, I just noticed that the brochure doesn't mention the price of the courses. I'll call them.",
              },
            ],
          },
        ],
        signOff: ["Talk soon,", "Gerry"],
      },
      // These five print no stem of their own. The sentence each one
      // completes is in the email above, which is why textBefore and text
      // are both unset throughout this group.
      questions: [
        {
          id: "reading-part-2-q1",
          number: 1,
          options: [
            { id: "reading-part-2-q1-a", text: "little experience" },
            { id: "reading-part-2-q1-b", text: "intermediate abilities" },
            { id: "reading-part-2-q1-c", text: "strong speaking skills" },
            { id: "reading-part-2-q1-d", text: "cultural knowledge" },
          ],
        },
        {
          id: "reading-part-2-q2",
          number: 2,
          options: [
            { id: "reading-part-2-q2-a", text: "seems more demanding" },
            { id: "reading-part-2-q2-b", text: "has larger class sizes" },
            { id: "reading-part-2-q2-c", text: "focuses on more skills" },
            { id: "reading-part-2-q2-d", text: "requires less time" },
          ],
        },
        {
          id: "reading-part-2-q3",
          number: 3,
          options: [
            { id: "reading-part-2-q3-a", text: "is the most intensive option" },
            { id: "reading-part-2-q3-b", text: "includes cultural activities" },
            {
              id: "reading-part-2-q3-c",
              text: "has the most frequent classes",
            },
            { id: "reading-part-2-q3-d", text: "teaches functional language" },
          ],
        },
        {
          id: "reading-part-2-q4",
          number: 4,
          options: [
            { id: "reading-part-2-q4-a", text: "it has the smallest classes" },
            { id: "reading-part-2-q4-b", text: "many people like it" },
            { id: "reading-part-2-q4-c", text: "it requires a lot of study" },
            { id: "reading-part-2-q4-d", text: "enrollment is quite low" },
          ],
        },
        {
          id: "reading-part-2-q5",
          number: 5,
          options: [
            {
              id: "reading-part-2-q5-a",
              text: "there are only morning classes",
            },
            { id: "reading-part-2-q5-b", text: "it may be too much work" },
            { id: "reading-part-2-q5-c", text: "the course will be finished" },
            { id: "reading-part-2-q5-d", text: "there is a final assessment" },
          ],
        },
      ],
    },
    {
      id: "reading-part-2-situation-questions",
      label: "Questions 6 to 8",
      // The source document's own line above this group, with the empty
      // brackets after "drop-down menu" dropped, as in the group above.
      instruction: "Using the drop-down menu, choose the best option.",
      // These three are whole questions rather than sentence stems, so
      // each carries text and none of them draws a blank.
      questions: [
        {
          id: "reading-part-2-q6",
          number: 6,
          text: "What is Gerry's relationship to Charlie?",
          options: [
            { id: "reading-part-2-q6-a", text: "roommate" },
            { id: "reading-part-2-q6-b", text: "employee" },
            { id: "reading-part-2-q6-c", text: "teacher" },
            { id: "reading-part-2-q6-d", text: "counselor" },
          ],
        },
        {
          id: "reading-part-2-q7",
          number: 7,
          text: "What are Gerry and Charlie doing in September?",
          options: [
            { id: "reading-part-2-q7-a", text: "getting part-time jobs" },
            { id: "reading-part-2-q7-b", text: "returning to school" },
            { id: "reading-part-2-q7-c", text: "traveling to visit a friend" },
            { id: "reading-part-2-q7-d", text: "taking a trip to Europe" },
          ],
        },
        {
          id: "reading-part-2-q8",
          number: 8,
          text: "Why does Gerry want to learn a language?",
          options: [
            { id: "reading-part-2-q8-a", text: "to get a university credit" },
            { id: "reading-part-2-q8-b", text: "to get a job promotion" },
            { id: "reading-part-2-q8-c", text: "to prepare for a trip abroad" },
            {
              id: "reading-part-2-q8-d",
              text: "to talk to his German friends",
            },
          ],
        },
      ],
    },
  ],

  // Stored, and stripped by the route before the content reaches the
  // browser. The only reader is markReadingPartTwo, the EXAM-19 server
  // action, which runs where this module lives and returns finished
  // review rows rather than the key itself.
  answerKey: ANSWER_KEY,
};
