// Mock Test 1, Speaking section content (EXAM-27).
//
// All eight Speaking tasks and the section instruction screen, as one
// content object. Everything a learner reads on the nine content screens
// is here, and nothing is anywhere else.
//
// Where the content came from
// ---------------------------
//
// The section instructions and the eight task names are text in
// `mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`:
//
//   Speaking Test Instructions
//   ... five instruction sentences ...
//   Try to complete this practice Speaking Test in 15 minutes.
//   Speaking Task 1: Giving Advice
//   Speaking Task 2: Talking about a Personal Experience
//   Speaking Task 3: Describing a Scene
//   Speaking Task 4: Making Predictions
//   Speaking Task 5: Comparing and Persuading
//   Speaking Task 6: Dealing with a Difficult Situation
//   Speaking Task 7: Expressing Opinions
//   Speaking Task 8: Describing an Unusual Situation
//
// The eight prompts themselves are not text in that document. Each task
// carries a Cloudinary PNG and nothing else, nine images in all because
// Task 5 has two, which is what
// `mock-tests/mock-test-1/extracted-content-outline.md` records as
// "all prompt images only" and what
// `docs/product/mock-test-1-content-map.md` lists as an open content gap:
// "Type out the eight Speaking prompts as text."
//
// This ticket closes that gap for Speaking. Every prompt sentence, every
// option card heading and every card detail line below is transcribed
// word for word from those nine images, which are the same nine URLs
// listed under "Speaking images" in
// `mock-tests/mock-test-1/extracted-links.md`. Nothing is paraphrased,
// nothing is reworded into house style, and nothing is added. The one
// change made to the characters themselves is the house style rule: the
// source images use curly apostrophes and this file uses straight ones.
//
// The nine source images, for anyone checking a transcription:
//
//   Task 1  v1785339532/Speaking_Test_1_-_Task_1_hcanik_kyge8y.png
//   Task 2  v1785339562/Speaking_Test_1_-_Task_2_cupftv_e5gpe3.png
//   Task 3  v1785339602/Speaking_Test_1_-_Task_3_ciuvf2_xuy0my.png
//   Task 4  v1785339642/Speaking_Test_1_-_Task_4_im56t0_bepfcq.png
//   Task 5  v1785339673/Speaking_Test_1_-_Task_5_1_c0vbub_giqbsl.png
//   Task 5  v1785339706/Speaking_Test_1_-_Task_5_2_tcpomi_hkalna.png
//   Task 6  v1785339741/Speaking_Test_1_-_Task_6_dgu9uf_ga3fxi.png
//   Task 7  v1785339780/Speaking_Test_1_-_Task_7_siaes0_owwvhj.png
//   Task 8  v1785339814/Speaking_Test_1_-_Task_8_hldd7b_dd0ael.png
//
// Why the visual prompts are cropped
// ----------------------------------
//
// Four tasks show pictures, and on three of them the picture is the
// prompt: Task 3 asks the learner to describe a scene, Task 4 asks what
// happens next in it, and Task 8 asks them to describe an unusual one. A
// transcription cannot replace those. So unlike the Writing prompt
// images, which are shown whole beside a full text transcription, these
// are shown as content.
//
// Each source image is a screenshot of a whole official screen, not a
// bare picture. It carries the prompt sentence across the top, the
// picture below it, and on Tasks 3, 4 and 8 a grey "Preparation Time"
// panel beside the picture holding a frozen number. Showing that whole
// screenshot would put the prompt on the page twice and would put a dead
// clock reading 29 next to our live preparation countdown, which is a
// misleading thing to show a learner.
//
// So the picture is cut out of the screenshot with a Cloudinary c_crop
// transformation, and the prompt sentence is transcribed as text above
// it. The crop is a delivery parameter on the same referenced asset: no
// file is downloaded, nothing is re-hosted, and the untransformed URL
// still returns the original screenshot for anyone checking the crop. The
// same rule extracted-links.md sets for every Mock Test 1 asset still
// holds.
//
// The Task 5 photographs are cropped out of their two screenshots for the
// same reason: the option card text is transcribed beside each photograph
// rather than left as pixels.
//
// What is deliberately not here
// -----------------------------
//
// No answer key, because Speaking has none. No transcript, no score, no
// band and no feedback text. No Writing content. No Speaking instructions
// video screen: a Speaking clip is registered in
// instructional-video-assets.ts and the source document does note that a
// Speaking instructions video appears after the instructions, but adding
// a video screen is a change to the screen flow the ticket sets out and
// is left as a follow up.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { speakingMockCopy } from "../../speaking-mock-copy";
import {
  speakingPrepTimer,
  speakingResponseTimer,
  speakingTaskFiveChooseTimer,
  speakingTaskFivePrepTimer,
} from "../../speaking-mock-timing";
import type {
  SpeakingOptionCard,
  SpeakingSectionContent,
} from "../../speaking-mock-types";

// Top bar title for the screens the section owns rather than a task.
//
// The learner facing name of the test, so the first screen of the run
// says the same thing as the dashboard card that opened it. The same rule
// the full Listening, full Reading and Writing sections settled.
const SECTION_TITLE = "Mock Test 1 - Speaking Test";

// Where the nine prompt images live.
//
// Referenced, not downloaded and not re-hosted, which is the rule
// extracted-links.md sets for every Mock Test 1 asset. Split from the
// file names so the URLs read as one asset set.
const IMAGE_BASE = "https://res.cloudinary.com/dkvsshy7n/image/upload";

// A Cloudinary crop, as a delivery parameter.
//
// x and y are the top left corner of the region inside the original
// screenshot, in the original's own pixels, and w and h are its size. The
// same numbers are the intrinsic width and height of what comes back, so
// the img element can reserve the right box before the file lands.
function crop(x: number, y: number, width: number, height: number): string {
  return `c_crop,x_${x},y_${y},w_${width},h_${height}`;
}

// The Al's Cafe scene, shared by Tasks 3 and 4.
//
// The two source screenshots hold the same drawing at slightly different
// sizes, because they are screenshots of two different screens rather
// than two copies of one asset. Each task therefore crops its own
// screenshot rather than borrowing the other's, which keeps every task's
// picture traceable to that task's source image.
//
// One description serves both, because it is a description of the drawing
// and the drawing is the same. It is written from the picture and states
// only what is visibly in it.
const CAFE_SCENE_ALT =
  "A busy cafe drawing. Behind a long counter on the right, a server in a red Al's Cafe shirt and apron hands a cup to a man in a grey suit and tie. A chalkboard menu headed Alejandra's Cafe lists soups, sandwiches and prices, with shelves of bottles, cups and a potted plant beside it. In front of the counter a second server in an Al's Cafe shirt carries a plate, a woman in a blue apron holds a plate of food with a small child beside her, an older woman with a walker stands near a man in a red cap, and a baby sits in a stroller at the front left. Behind them a raised seating area has stools at a rail where several people sit with drinks, a staircase, a dog, and people walking past.";

// The Task 5 camps, written once (SPEAKING-05A).
//
// Four cards for three camps. Two of them are the options the learner
// chooses between, one is the camp the sister is proposing, and the
// fourth is the music camp again as the second source screen prints it
// under "Your Choice".
//
// They are consts rather than object literals inside the task because
// SPEAKING-05A gave Task 5 four screens, and the same camp is now drawn
// by the choice screen, by the preparation screen, by the recording
// screen and by the visuals the AI review reads its facts out of. Written
// inline they would be four copies of the same four facts and the first
// edit would only land on one of them.
const TASK_FIVE_MUSIC_CAMP: SpeakingOptionCard = {
  id: "mock-test-1-speaking-task-5-music-camp",
  heading: "Music camp",
  details: [
    "teaches children basic music symbols and rhythm",
    "offers basic lessons for guitar, flute, and piano based on their preferences",
    "practice simple songs together",
    "$150 for 10 days",
  ],
  image: {
    // Cut out of the first Task 5 screenshot, which is 947 by 635. The
    // photograph occupies x 41 to 461 and y 178 to 458, inside the left
    // option card.
    url: `${IMAGE_BASE}/${crop(41, 178, 420, 280)}/v1785339673/Speaking_Test_1_-_Task_5_1_c0vbub_giqbsl.png`,
    alt: "A man sits on a chair playing an acoustic guitar in a classroom hung with children's paintings. Five children stand and sit around him holding small percussion instruments, a tambourine and a recorder, singing and playing along.",
    width: 420,
    height: 280,
  },
};

const TASK_FIVE_TRACK_CAMP: SpeakingOptionCard = {
  id: "mock-test-1-speaking-task-5-track-camp",
  heading: "Track and field camp",
  details: [
    "learn about healthy living and safe exercise techniques",
    "helps children stay in shape during the holiday",
    "$20 per three-hour day, for a maximum of 8 days",
    "choose which days you want to attend",
  ],
  image: {
    // From the same screenshot, right option card: x 507 to 927 and y 178
    // to 478.
    url: `${IMAGE_BASE}/${crop(507, 178, 420, 300)}/v1785339673/Speaking_Test_1_-_Task_5_1_c0vbub_giqbsl.png`,
    alt: "A photograph of about seven children in sports kit sprinting out of the blocks along the lanes of a red outdoor running track, with a green field and stadium seating behind them.",
    width: 420,
    height: 300,
  },
};

// The camp the sister is proposing. Never selectable: it is the thing the
// learner argues against, whichever of the two options they picked.
const TASK_FIVE_READING_CAMP: SpeakingOptionCard = {
  id: "mock-test-1-speaking-task-5-reading-camp",
  // The heading the second source screen prints above this card.
  label: "Your Sister's Choice",
  heading: "Reading and writing day camp",
  details: [
    "learn about creative writing techniques",
    "read each other's stories and share ideas",
    "$200 for two weeks, 8 hours a day",
  ],
  image: {
    // Cut out of the second Task 5 screenshot, which is 867 by 585. The
    // photograph occupies x 37 to 414 and y 115 to 442.
    url: `${IMAGE_BASE}/${crop(37, 115, 377, 327)}/v1785339706/Speaking_Test_1_-_Task_5_2_tcpomi_hkalna.png`,
    alt: "A photograph of a boy and a girl sitting side by side at a classroom table, each holding a coloured pencil over a sheet of paper, with a yellow shelving unit full of books and boxes behind them.",
    width: 377,
    height: 327,
  },
};

// The music camp as the second source screen prints it, under "Your
// Choice".
//
// Kept because the visuals below are the source's own two rows and the
// second row prints this card. Nothing on the four screens reads it: the
// preparation and recording screens print whichever camp the learner
// actually chose, under the same label.
const TASK_FIVE_MUSIC_CAMP_CHOSEN: SpeakingOptionCard = {
  ...TASK_FIVE_MUSIC_CAMP,
  id: "mock-test-1-speaking-task-5-music-camp-chosen",
  label: "Your Choice",
};

export const mockTest1SpeakingSection: SpeakingSectionContent = {
  testId: "mock-test-1",
  sectionId: "mock-test-1-speaking-section",
  title: SECTION_TITLE,

  instructionScreen: {
    title: speakingMockCopy.introScreenTitle,
    subtitle: speakingMockCopy.introSubtitle,
    instructions: [...speakingMockCopy.introLines],
    noticeText: speakingMockCopy.introNotice,
    introTitle: speakingMockCopy.introCardTitle,
    introSummary: speakingMockCopy.introCardSummary,
    // introDetails is deliberately unset. The intro screen counts the
    // tasks and sums the windows off the content instead, so the card
    // cannot claim a total the section no longer has.
  },

  tasks: [
    {
      taskId: "mock-test-1-speaking-task-1",
      taskNumber: 1,
      taskLabel: "Speaking Task 1",
      title: "Mock Test 1 - Speaking Task 1",
      // The task name exactly as the source document prints it.
      taskTitle: "Giving Advice",

      promptInstruction:
        "Your friend wants to rent a movie tonight. Give your friend advice about which movie to rent and explain why it is a good movie.",

      // The source prints one sentence and no picture on this task.
      visuals: [],

      prepTimer: speakingPrepTimer(30),
      responseTimer: speakingResponseTimer(90),
    },

    {
      taskId: "mock-test-1-speaking-task-2",
      taskNumber: 2,
      taskLabel: "Speaking Task 2",
      title: "Mock Test 1 - Speaking Task 2",
      taskTitle: "Talking about a Personal Experience",

      promptInstruction:
        "Talk about a time when you interacted with an animal. Maybe you can talk about a family pet, a farm or zoo animal, or an animal in the wild. What kind of animal was it, what happened, and why do you remember the experience?",

      visuals: [],

      prepTimer: speakingPrepTimer(30),
      responseTimer: speakingResponseTimer(60),
    },

    {
      taskId: "mock-test-1-speaking-task-3",
      taskNumber: 3,
      taskLabel: "Speaking Task 3",
      title: "Mock Test 1 - Speaking Task 3",
      taskTitle: "Describing a Scene",

      promptInstruction:
        "Describe some things that are happening in the picture below as well as you can. The person with whom you are speaking cannot see the picture.",

      visuals: [
        {
          kind: "scene",
          id: "mock-test-1-speaking-task-3-scene",
          image: {
            // Cut out of the Task 3 screenshot, which is 977 by 493. The
            // drawing occupies x 16 to 561 and y 103 to 493, and the rest
            // of the screenshot is the prompt line above it and the frozen
            // preparation panel to its right.
            url: `${IMAGE_BASE}/${crop(16, 103, 545, 390)}/v1785339602/Speaking_Test_1_-_Task_3_ciuvf2_xuy0my.png`,
            alt: CAFE_SCENE_ALT,
            width: 545,
            height: 390,
          },
        },
      ],

      prepTimer: speakingPrepTimer(30),
      responseTimer: speakingResponseTimer(60),
    },

    {
      taskId: "mock-test-1-speaking-task-4",
      taskNumber: 4,
      taskLabel: "Speaking Task 4",
      title: "Mock Test 1 - Speaking Task 4",
      taskTitle: "Making Predictions",

      promptInstruction:
        "In this picture, what do you think will most probably happen next?",

      visuals: [
        {
          kind: "scene",
          id: "mock-test-1-speaking-task-4-scene",
          image: {
            // Cut out of the Task 4 screenshot, which is 970 by 471. The
            // same cafe drawing as Task 3, at a slightly different size,
            // occupying x 14 to 559 and y 82 to 471.
            url: `${IMAGE_BASE}/${crop(14, 82, 545, 389)}/v1785339642/Speaking_Test_1_-_Task_4_im56t0_bepfcq.png`,
            alt: CAFE_SCENE_ALT,
            width: 545,
            height: 389,
          },
        },
      ],

      prepTimer: speakingPrepTimer(30),
      responseTimer: speakingResponseTimer(60),
    },

    {
      taskId: "mock-test-1-speaking-task-5",
      taskNumber: 5,
      taskLabel: "Speaking Task 5",
      title: "Mock Test 1 - Speaking Task 5",
      taskTitle: "Comparing and Persuading",

      // The setup paragraph from the first of the two source screens,
      // printed above the instruction the way the source prints it.
      //
      // The second paragraph of that screen, "If you do not choose an
      // option, the computer will choose one for you. You do not need to
      // speak for this part.", was left out while this prototype drew
      // Task 5 on one screen with the choice already made: it described
      // behaviour that did not exist here. SPEAKING-05A built the choice
      // step, so the sentence is true again and it is carried on the step
      // below as chooseNote rather than being paraphrased.
      situationParagraphs: [
        "Your niece has a two-week break from school, and to keep her entertained, you are looking at summer camps you could suggest to her. You find two suitable options. Using the pictures and information below, choose the option that you prefer. In the next section, you will need to persuade your niece's mother that your choice is the better choice.",
      ],

      // The instruction from the second source screen, which is the part
      // of Task 5 that is actually spoken.
      promptInstruction:
        "Your niece's mother (your sister) is suggesting another day camp. Persuade her that the camp you chose is more suitable by comparing the two.",

      // No promptNote. It used to say that this prototype had one screen
      // per task and that the choice below was the source's own rather
      // than the learner's. SPEAKING-05A built the four screens, so the
      // note described a limitation that is gone and the learner now
      // makes the choice themselves.

      // The pictures, unchanged, and still the two rows the source
      // prints. Nothing draws them on a Task 5 screen any more, because
      // the four screens draw the same cards themselves from choiceStep
      // below, but they are what the AI review reads the camps out of
      // (collectVisualDescriptions in evaluate-speaking-mock-test.ts), so
      // taking them away would quietly change what the reviewer is told
      // about a task whose review this ticket does not touch.
      //
      // They are not a second copy of the content. Every card here is one
      // of the four consts above, referenced rather than retyped, so the
      // facts a learner reads and the facts the reviewer reads cannot
      // drift apart.
      visuals: [
        {
          kind: "option-cards",
          id: "mock-test-1-speaking-task-5-options",
          caption: "The two summer camps",
          cards: [
            TASK_FIVE_MUSIC_CAMP,
            TASK_FIVE_TRACK_CAMP,
          ],
        },

        {
          kind: "option-cards",
          id: "mock-test-1-speaking-task-5-comparison",
          caption: "Your sister's choice and your choice",
          cards: [
            TASK_FIVE_READING_CAMP,
            TASK_FIVE_MUSIC_CAMP_CHOSEN,
          ],
        },
      ],

      // The four screens (SPEAKING-05A).
      //
      // Instructions, choice, preparation, recording. The cards are the
      // same consts the visuals above reference, so the camp a learner
      // picks on the choice screen is the camp the preparation screen
      // prints and the camp the review is told about.
      choiceStep: {
        id: "mock-test-1-speaking-task-5-choice-step",

        // Our own wording. The source document prints no list of parts;
        // what it prints is two screens that plainly have four steps in
        // them, and a learner about to lose 60 seconds to a choice
        // deserves to know a choice is coming.
        steps: [
          {
            heading: "1. Choose an option.",
            text: "You have 60 seconds to read about both camps and pick the one you prefer. Nothing is recorded.",
          },
          {
            heading: "2. Preparation time.",
            text: "You have 60 seconds to plan how you will argue for your camp against the camp your sister is suggesting. Nothing is recorded.",
          },
          {
            heading: "3. Speaking.",
            text: "You have 60 seconds to record your answer.",
          },
        ],

        optionsCaption: "The two summer camps",
        options: [TASK_FIVE_MUSIC_CAMP, TASK_FIVE_TRACK_CAMP],

        // The source's own sentence about the automatic choice, from the
        // second paragraph of the first Task 5 screen. It describes what
        // this engine does: pressing Next with nothing chosen selects an
        // option, and nothing is recorded on this screen.
        chooseNote:
          "If you do not choose an option, the computer will choose one for you. You do not need to speak for this part.",

        // The heading the second source screen prints above the camp the
        // learner picked.
        chosenLabel: "Your Choice",

        comparisonCaption: "Your sister's choice and your choice",
        comparison: TASK_FIVE_READING_CAMP,

        // The first of the two 60 second windows the official Speaking
        // overview records for Task 5. The second is prepTimer below.
        chooseTimer: speakingTaskFiveChooseTimer(60),
      },

      prepTimer: speakingTaskFivePrepTimer(60),
      responseTimer: speakingResponseTimer(60),
    },

    {
      taskId: "mock-test-1-speaking-task-6",
      taskNumber: 6,
      taskLabel: "Speaking Task 6",
      title: "Mock Test 1 - Speaking Task 6",
      taskTitle: "Dealing with a Difficult Situation",

      promptInstruction:
        "You and Mike work in a department store, and Mike is talking to a customer who wants to return a coffeemaker he bought there. The customer doesn't have his receipt, but you remember selling him the coffeemaker the day before. Mike is refusing to refund the coffeemaker, but the customer is getting upset and just wants his money back.",

      // The either or pair the source prints under the situation. It is
      // not a control: the learner picks one and speaks.
      alternativesLead: "Choose ONE:",
      alternatives: [
        {
          connector: "EITHER",
          text: "Explain to Mike that you sold the coffeemaker to the man the day before, and he should give a full refund.",
        },
        {
          connector: "OR",
          text: "Explain to the customer that the store policy is that you must have the original receipt to return an item, so he cannot get a refund for the coffeemaker.",
        },
      ],

      visuals: [],

      prepTimer: speakingPrepTimer(60),
      responseTimer: speakingResponseTimer(60),
    },

    {
      taskId: "mock-test-1-speaking-task-7",
      taskNumber: 7,
      taskLabel: "Speaking Task 7",
      title: "Mock Test 1 - Speaking Task 7",
      taskTitle: "Expressing Opinions",

      promptInstruction: "Answer the following question.",
      // The source prints the question on its own line under the
      // instruction, with its own "Question:" lead in.
      promptParagraphs: [
        "Question: Do you think Canada should spend money on preserving its historical sites or spend money on scientific research and advances? Explain your reasons.",
      ],

      visuals: [],

      prepTimer: speakingPrepTimer(30),
      responseTimer: speakingResponseTimer(90),
    },

    {
      taskId: "mock-test-1-speaking-task-8",
      taskNumber: 8,
      taskLabel: "Speaking Task 8",
      title: "Mock Test 1 - Speaking Task 8",
      taskTitle: "Describing an Unusual Situation",

      promptInstruction:
        "While driving, you see a car that you think is unsafe. You call 911 (you have a hands-free phone), and the police answer your call. Now describe in detail what you see, and explain why you think it is unsafe.",

      visuals: [
        {
          kind: "scene",
          id: "mock-test-1-speaking-task-8-scene",
          image: {
            // Cut out of the Task 8 screenshot, which is 879 by 337. The
            // drawing occupies x 40 to 400 and y 90 to 337, with the
            // frozen preparation panel to its right.
            url: `${IMAGE_BASE}/${crop(40, 90, 360, 247)}/v1785339814/Speaking_Test_1_-_Task_8_hldd7b_dd0ael.png`,
            alt: "A coloured pencil drawing of a two lane highway curving through forest beside a lake. A red four wheel drive with a spare wheel on the back door is driving away from the viewer. Two people are visible through its rear window. Its rear left wheel is missing and that corner of the vehicle is dragging on the road, its rear right wheel is tilted out at an angle, and small pieces of debris are scattered on the road behind it.",
            width: 360,
            height: 247,
          },
        },
      ],

      prepTimer: speakingPrepTimer(30),
      responseTimer: speakingResponseTimer(60),
    },
  ],
};
