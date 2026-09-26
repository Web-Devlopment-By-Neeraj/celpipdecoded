// Mock Test 1, full Reading section (EXAM-24).
//
// The four Reading parts assembled into one section, plus the intro
// screen that opens it. This file writes no passage, no question, no
// option and no answer key of its own: every part below is the same
// exported content object its part level prototype route already renders,
// so the full run and the four part runs cannot drift apart.
//
// What this file adds is the small amount the section needs and a part
// does not carry: which part number a part is, how a learner names it,
// the Format line for its intro card, which of the four split screens
// answers it, and what a question with no stem of its own should be
// called in the review. All five were previously typed into the four
// prototype components and the four server actions, which is why they are
// collected here rather than added to the content files.
//
// There is no instructional video screen. The Listening section opens
// with one because a Listening instructional clip is registered in
// instructional-video-assets.ts; no Reading clip is, and nothing is
// invented to fill the gap. The section opens on its instruction screen
// instead.
//
// No question count and no total is written down here. Every count the
// engine uses is read off the parts by countReadingSectionQuestions and
// countReadingSectionPartQuestions, which is what the ticket asks for: an
// edit to a content file moves the score denominator, the intro card and
// the band estimate together, and none of them can go stale against a
// hardcoded 38.
//
// The answer keys stay in the four content files and are stripped by
// withoutReadingSectionAnswerKeys before the content reaches the browser.
// Marking happens in the server action beside the route, where the keys
// still are. See reading-section-flow.ts.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import {
  readingCopy,
  readingReviewCopy,
  readingSectionCopy,
} from "../../reading-copy";
import { readingPart1 } from "./reading-part-1";
import { readingPart2 } from "./reading-part-2";
import { readingPart3 } from "./reading-part-3";
import { readingPart4 } from "./reading-part-4";
import type { ReadingSectionContent } from "../../reading-section-types";

// Top bar title for the screens the section owns rather than a part.
//
// A part screen keeps its own content.title, which names the part and the
// practice test, so this appears on the section intro, the three
// transitions, the practice score and the answer review only.
//
// It is the learner facing name of the test, so the first screen of the
// run says the same thing as the dashboard card that opened it, which is
// the rule the full Listening section settled. The four part titles are
// deliberately left alone: they are shared with the part level routes,
// which are internal and stay that way.
const SECTION_TITLE = "Mock Test 1 - Reading Test";

export const mockTest1ReadingSection: ReadingSectionContent = {
  testId: "mock-test-1",
  sectionId: "mock-test-1-reading-section",
  title: SECTION_TITLE,

  instructionScreen: {
    title: readingSectionCopy.introScreenTitle,
    subtitle: readingSectionCopy.introSubtitle,
    instructions: [...readingSectionCopy.introLines],
    noticeText: readingSectionCopy.introNotice,
    introTitle: readingSectionCopy.introCardTitle,
    introSummary: readingSectionCopy.introCardSummary,
    // introDetails is deliberately unset. The intro screen counts the
    // parts, the questions and the reading time off the content instead,
    // so the card cannot claim a total the section no longer has.
  },

  // The four parts, in test order.
  //
  // formatLabel is the Format row on each part intro card, and it is the
  // string the matching part prototype already passes to
  // ReadingPartIntroScreen, so an intro card looks the same in both
  // routes.
  //
  // taskScreen is the option the matching part prototype already passes
  // to buildReadingFlow, so the section draws the same working screen the
  // part route draws.
  //
  // blankQuestionText is the ReadingReviewOptions field the matching part
  // action already passes, so a review row for a question with no stem is
  // worded the same in both routes. Part 3 sets none because every one of
  // its nine statements carries its own text.
  parts: [
    {
      partNumber: 1,
      partLabel: "Reading Part 1",
      formatLabel: readingCopy.partIntroFormatLabel,
      taskScreen: "correspondence",
      blankQuestionText: readingReviewCopy.responseBlankQuestionText,
      content: readingPart1,
    },
    {
      partNumber: 2,
      partLabel: "Reading Part 2",
      formatLabel: readingCopy.partTwoIntroFormatLabel,
      taskScreen: "diagram",
      blankQuestionText: readingReviewCopy.emailBlankQuestionText,
      content: readingPart2,
    },
    {
      partNumber: 3,
      partLabel: "Reading Part 3",
      formatLabel: readingCopy.partThreeIntroFormatLabel,
      taskScreen: "information",
      content: readingPart3,
    },
    {
      partNumber: 4,
      partLabel: "Reading Part 4",
      formatLabel: readingCopy.partFourIntroFormatLabel,
      taskScreen: "viewpoints",
      blankQuestionText: readingReviewCopy.commentBlankQuestionText,
      content: readingPart4,
    },
  ],
};
