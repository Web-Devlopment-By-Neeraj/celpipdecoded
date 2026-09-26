// Mock Test 1, Writing section content (EXAM-25).
//
// Both Writing tasks and the section instruction screen, as one content
// object. Everything a learner reads on the three content screens is
// here, and nothing is anywhere else.
//
// Where the content came from
// ---------------------------
//
// The section instructions and the task names are text in
// `mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`:
//
//   Writing Test Instructions
//   On the official test, if you do not finish Task 1 in 27 minutes, the
//   screen will move to Task 2. You cannot go back to Task 1. However, in
//   this practice test, in order to move forward in the test you must
//   click on "NEXT."
//   You have 53 minutes to complete this practice Writing Test.
//   Writing Task 1: Writing an Email
//   Writing Task 2: Responding to Survey Questions
//
// The two prompts themselves are not text in that document. Each task
// carries one Cloudinary PNG and nothing else, which is what
// `mock-tests/mock-test-1/extracted-content-outline.md` records as
// "prompt image only" and what
// `docs/product/mock-test-1-content-map.md` lists as an open content gap:
// "Type out the two Writing prompts as text."
//
// This ticket closes that gap for Writing. The situation text, the prompt
// instruction, the Task 1 requirements and the Task 2 positions below are
// transcribed word for word from those two images, which are the same two
// URLs listed under "Writing images" in
// `mock-tests/mock-test-1/extracted-links.md`. Nothing is paraphrased,
// nothing is reworded into house style, and nothing is added. The one
// change made to the characters themselves is the house style rule: the
// source images use curly apostrophes and this file uses straight ones.
//
// Each task keeps its source image in promptImage so the transcription
// can be checked against the original. The image is referenced rather
// than re-hosted, exactly as the Reading Part 2 brochure is, and the
// screens do not depend on it: every word in the picture is also on the
// screen as text, which is what makes the prompt readable by assistive
// technology and usable by the EXAM-26 reviewer.
//
// Why the prompt text matters beyond this screen: an image-only prompt
// cannot be sent to an AI reviewer. `src/features/writing/
// writing-scoring-prompt.ts` needs the task text as text, so EXAM-26 has
// a prompt to work from because this file has one.
//
// What is deliberately not here
// -----------------------------
//
// No answer key, because Writing has none. No score, no band and no
// feedback text. No Speaking content. No instructional video: no Writing
// clip is registered in instructional-video-assets.ts and one is not
// invented.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { writingMockCopy } from "../../writing-mock-copy";
import type { WritingSectionContent } from "../../writing-mock-types";

// Top bar title for the screens the section owns rather than a task.
//
// The learner facing name of the test, so the first screen of the run
// says the same thing as the dashboard card that opened it. The same rule
// the full Listening and full Reading sections settled.
const SECTION_TITLE = "Mock Test 1 - Writing Test";

// Where the two prompt images live.
//
// Referenced, not downloaded and not re-hosted, which is the rule
// extracted-links.md sets for every Mock Test 1 asset. Split from the
// file names so the two URLs read as one asset set.
const IMAGE_BASE = "https://res.cloudinary.com/dkvsshy7n/image/upload";

// The two task windows.
//
// Task 1 is 27 minutes, and that figure is published in the source
// document's own Writing instructions: "if you do not finish Task 1 in 27
// minutes, the screen will move to Task 2". The screenshot table in
// docs/product/mock-test-1-content-map.md reads the same 27 minutes.
//
// Task 2 is 26 minutes, which is the section's published 53 minutes minus
// Task 1's published 27. The screenshot table reads 26 as well, so the
// arithmetic and the screenshot agree. It is marked derived rather than
// published because no source we hold prints "26 minutes" as a Task 2
// allowance in words.
//
// The two sum to the 53 minutes the source publishes for the Writing
// Test, which sumWritingSectionSeconds checks by being what the intro
// card reads.
//
// The thresholds are five minutes of amber and one minute of red, rather
// than the sixty and twenty seconds the Reading parts use. A Reading part
// ends with a click and a writing task ends with a sentence, so a writer
// needs enough notice to finish the paragraph they are in. Nothing
// enforces either window: the prototype passes no expiry handler, so a
// countdown reaches "Time is up" and the screen stays put with every word
// still on it.
const WRITING_WARNING_SECONDS = 300;
const WRITING_URGENT_SECONDS = 60;

export const mockTest1WritingSection: WritingSectionContent = {
  testId: "mock-test-1",
  sectionId: "mock-test-1-writing-section",
  title: SECTION_TITLE,

  instructionScreen: {
    title: writingMockCopy.introScreenTitle,
    subtitle: writingMockCopy.introSubtitle,
    instructions: [...writingMockCopy.introLines],
    noticeText: writingMockCopy.introNotice,
    introTitle: writingMockCopy.introCardTitle,
    introSummary: writingMockCopy.introCardSummary,
    // introDetails is deliberately unset. The intro screen counts the
    // tasks and the writing time off the content instead, so the card
    // cannot claim a total the section no longer has.
  },

  tasks: [
    {
      taskId: "mock-test-1-writing-task-1",
      taskNumber: 1,
      taskLabel: "Writing Task 1",
      title: "Mock Test 1 - Writing Task 1",
      // The task name exactly as the source document prints it.
      taskTitle: "Writing an Email",

      situationInstruction: "Read the following information.",
      situationParagraphs: [
        "Last weekend you attended the Canada Day community picnic. The event was a potluck, so everyone brought a dish of food to share. Some people, including you, have allergies or can't eat some types of food, such as nuts and seafood, so you included a list of ingredients with your dish. No one else did this.",
      ],

      promptInstruction:
        "Write an email to the community picnic organizer in about 150-200 words. Your email should do the following things:",
      promptRequirements: [
        "Express your overall enjoyment of last week's event.",
        "Explain why each potluck dish needs a list of ingredients.",
        "Describe how the potluck could be differently organized next year.",
      ],

      // The word target is the prompt's own "about 150-200 words". It is
      // guidance and gates nothing.
      wordTarget: { min: 150, max: 200 },
      editorPlaceholder: "Type your email here.",

      timer: {
        seconds: 1620,
        warningAtSeconds: WRITING_WARNING_SECONDS,
        urgentAtSeconds: WRITING_URGENT_SECONDS,
        source: "published",
        note: "27 minutes, named in the Mock Test 1 Writing instructions as the point at which the official test moves from Task 1 to Task 2. The content map screenshot table reads the same figure.",
      },

      promptImage: {
        url: `${IMAGE_BASE}/v1785339425/Writing_Test_1_-_Task_1_c7ci7n_zmasqv.png`,
        alt: "Source prompt image for Writing Task 1. It shows the same two panels this screen shows as text: the picnic situation on the left, and on the right the instruction to write an email to the community picnic organizer in about 150 to 200 words with three bullet points.",
        width: 977,
        height: 231,
        caption: "Source prompt image",
      },
    },

    {
      taskId: "mock-test-1-writing-task-2",
      taskNumber: 2,
      taskLabel: "Writing Task 2",
      title: "Mock Test 1 - Writing Task 2",
      taskTitle: "Responding to Survey Questions",

      situationInstruction: "Read the following information.",
      // The bold line the source prints above the survey paragraph.
      situationHeading: "Online vs. Print News Survey",
      situationParagraphs: [
        "Your local newspaper is experiencing low sales of its newspapers since many readers are now choosing the online version. Its current number of online subscribers is now three times the number of print subscribers. The newspaper has sent a survey to all of its print and online subscribers to see whether there is enough demand to keep the print version.",
      ],

      promptInstruction:
        "Choose the option that you prefer. Explain the reasons for your choice. Why do you prefer your choice? Write about 150-200 words.",
      // The source prints no bullet list on this task, so there is none
      // here. The requirements are inside the instruction sentence above.
      promptRequirements: [],

      // The two positions, exactly as the source prints them.
      optionInstruction: "Choose the option that you prefer.",
      options: [
        {
          id: "mock-test-1-writing-task-2-option-a",
          label: "Option A",
          text: "Stop producing the print version of the newspaper.",
        },
        {
          id: "mock-test-1-writing-task-2-option-b",
          label: "Option B",
          text: "Keep producing both the print and online versions.",
        },
      ],

      wordTarget: { min: 150, max: 200 },
      editorPlaceholder: "Type your survey response here.",

      timer: {
        seconds: 1560,
        warningAtSeconds: WRITING_WARNING_SECONDS,
        urgentAtSeconds: WRITING_URGENT_SECONDS,
        source: "derived",
        note: "26 minutes, the published 53 minute Writing Test allowance minus the published 27 minutes for Task 1. The content map screenshot table reads 26 minutes as well.",
      },

      promptImage: {
        url: `${IMAGE_BASE}/v1785339462/Writing_Test_1_-_Task_2_chkqmx_ubu4fa.png`,
        alt: "Source prompt image for Writing Task 2. It shows the same two panels this screen shows as text: the Online vs. Print News Survey information on the left, and on the right the instruction to choose the preferred option and write about 150 to 200 words, with Option A to stop producing the print version and Option B to keep producing both versions.",
        width: 980,
        height: 282,
        caption: "Source prompt image",
      },
    },
  ],
};
