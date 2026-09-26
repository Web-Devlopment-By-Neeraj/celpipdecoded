// Mock Test 1, full Listening section (EXAM-15).
//
// The six Listening parts assembled into one section, plus the two screens
// that open it. This file writes no question, no option, no clip URL and
// no answer key of its own: every part below is the same exported content
// object its part level prototype route already renders, so the full run
// and the part runs cannot drift apart.
//
// What this file adds is the small amount the section needs and a part
// does not carry: which part number a part is, how a learner names it, and
// the Format line for its intro card. Those three were previously typed
// into the six prototype components, which is why they are collected here
// rather than added to the content files.
//
// The instructional video is looked up from the EXAM-02 registry rather
// than referenced by path, so the Listening clip this section plays is the
// same file the instruction preview plays.
//
// The answer keys stay in the six content files and are stripped by
// withoutListeningSectionAnswerKeys before the content reaches the
// browser. Marking happens in the server action beside the route, where
// the keys still are. See listening-section-flow.ts.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { getInstructionalVideoAsset } from "../../instructional-video-assets";
import { listeningSectionCopy } from "../../listening-section-copy";
import { listeningPart1 } from "./listening-part-1";
import { listeningPart2 } from "./listening-part-2";
import { listeningPart3 } from "./listening-part-3";
import { listeningPart4 } from "./listening-part-4";
import { listeningPart5 } from "./listening-part-5";
import { listeningPart6 } from "./listening-part-6";
import type { ListeningSectionContent } from "../../listening-section-types";

// Top bar title for the screens the section owns rather than a part.
//
// A part screen keeps its own content.title, which names the part, so this
// appears on the instruction screen, the video screen, the five
// transitions, the review, the score and the end screen only.
//
// EXAM-15B made this the learner facing name of the test, so the first
// screen of the run says the same thing as the dashboard card that opened
// it. The six part titles are deliberately left alone: they are shared
// with the part level routes, which are internal and stay that way.
const SECTION_TITLE = "Mock Test 1 - Listening Test";

export const mockTest1ListeningSection: ListeningSectionContent = {
  testId: "mock-test-1",
  sectionId: "mock-test-1-listening-section",
  title: SECTION_TITLE,

  instructionScreen: {
    title: `${SECTION_TITLE}: Instructions`,
    heading: listeningSectionCopy.instructionHeading,
    subtitle: listeningSectionCopy.instructionSubtitle,
    instructions: listeningSectionCopy.instructionLines,
    noticeText: listeningSectionCopy.instructionNotice,
    introTitle: listeningSectionCopy.instructionTitle,
    introSummary: listeningSectionCopy.introSummary,
    // Counts are written out rather than derived, because a detail row is
    // display text and deriving it would put a number on the intro card
    // that no longer matches the ticket if a part is edited. The real
    // counts the score is built from are always read from the content.
    introDetails: [
      { label: "Parts", value: "6" },
      { label: "Questions", value: "38" },
      { label: "Scoring", value: "Practice estimate" },
    ],
  },

  videoScreen: {
    title: `${SECTION_TITLE}: Instructional video`,
    video: getInstructionalVideoAsset("listening"),
    description: listeningSectionCopy.videoDescription,
    helperText: listeningSectionCopy.videoHelperText,
  },

  // The six parts, in test order. formatLabel is the Format row on each
  // part intro card, and it is the string the matching part prototype
  // already passes to ListeningPartIntroScreen, so an intro card looks the
  // same in both routes.
  parts: [
    {
      partNumber: 1,
      partLabel: "Listening Part 1",
      formatLabel: "Conversation audio and questions",
      kind: "sections",
      content: listeningPart1,
    },
    {
      partNumber: 2,
      partLabel: "Listening Part 2",
      formatLabel: "Conversation audio and questions",
      kind: "sections",
      content: listeningPart2,
    },
    {
      partNumber: 3,
      partLabel: "Listening Part 3",
      formatLabel: "Conversation audio and questions",
      kind: "sections",
      content: listeningPart3,
    },
    {
      partNumber: 4,
      partLabel: "Listening Part 4",
      formatLabel: "News audio and dropdown questions",
      kind: "dropdown",
      content: listeningPart4,
    },
    {
      partNumber: 5,
      partLabel: "Listening Part 5",
      formatLabel: "Discussion video and dropdown questions",
      kind: "video",
      content: listeningPart5,
    },
    {
      partNumber: 6,
      partLabel: "Listening Part 6",
      formatLabel: "Report audio and dropdown questions",
      kind: "viewpoints",
      content: listeningPart6,
    },
  ],
};
