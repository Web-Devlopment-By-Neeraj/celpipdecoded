// Learner facing wording for the Listening screens (EXAM-03).
//
// Same rule as exam-copy.ts: all Listening chrome copy lives in one file
// so the screens say the same thing everywhere, and so a wording change
// is one edit rather than six.
//
// Two things this file deliberately does not copy from the source
// document:
//
// - "You will hear the conversation only once" and "You will hear it only
//   once". This prototype lets a clip be replayed, so printing the
//   official-style sentence would be a promise the screen does not keep.
//   The one time playback rule arrives with a later ticket, and the
//   sentence comes back with it.
// - The source break line for the third section reads "second" in both
//   places, which mock-tests/mock-test-1/extracted-content-outline.md
//   records as a copy and paste slip in the document. The ordinal is
//   generated here instead, so the third break reads "third".
//
// Strings and pure helpers only, no side effects, so this file is safe to
// import from a client component.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Shown under a one screen question list while questions are
// outstanding, explaining why Next is not available yet.
//
// Held as a module constant because two entries below read it: the
// dropdown parts and the video discussion part say the same sentence, and
// two literals would be two things to keep in step. Named per screen kind
// rather than shared under one key so a later wording change can be made
// for one and not the other without a rename.
const ANSWER_ALL_QUESTIONS_HINT = "Answer every question to continue.";

export const listeningCopy = {
  // Part intro screen.
  partIntroSubtitle:
    "Read the following information before this part of the practice test begins.",
  partIntroNotice:
    "Internal prototype. Answers are held on this screen only, nothing is saved, and no score is produced.",

  // Scenario screen.
  scenarioHeading: "Instructions:",
  scenarioImageCaption: "The setting for the conversation.",

  // Conversation audio screens.
  conversationInstruction: "Listen to the conversation.",
  conversationPlayerTitle: "Conversation audio",
  conversationHint:
    "Play the clip when you are ready, then continue to the questions.",

  // Section break screens.
  sectionBreakHeading: "Next section",
  sectionBreakHint:
    "Take a moment to get ready. Continue when you want the next section.",
  // Small inert strip on the break screen, standing in for the pause the
  // official-style flow plays between sections.
  sectionBreakPlaceholderLabel: "Preparation pause",
  sectionBreakPlaceholderHelper:
    "The timed preparation pause between sections is added in a later ticket.",

  // Question screens.
  questionInstruction: "Listen to the question.",
  questionPlayerTitle: "Question audio",
  chooseAnswerInstruction: "Choose the best answer to each question.",
  answerPanelLabel: "Answer",
  audioPanelLabel: "Question audio",
  // Shown under the options while nothing is selected, explaining why
  // Next is not available yet.
  selectAnswerHint: "Select an answer to continue.",

  // Shown in the player's place when a question has no clip (EXAM-07).
  //
  // Different from audioFallbackHeading, which covers a clip that exists
  // and would not load. This one covers a clip that is not in the source
  // material at all, so there is nothing to reload and no point telling
  // anyone to check their connection.
  //
  // No shipped question reaches it. Mock Test 1 Listening Part 3 Question 1
  // was the one place it appeared, and the corrected source document
  // supplied that recording. It is kept as the generic answer for a real
  // gap in a future part, not for that question.
  questionAudioMissingHeading: "This question has no audio yet",
  questionAudioMissingText:
    "The recording for this question is missing from the source practice test and is added once it is supplied. The answer options below are the ones from the practice test.",

  // Timer label on the question screens.
  //
  // questionTimerValue is gone (EXAM-15D). It held the string
  // "30 seconds", which the top bar printed on every question screen and
  // which never changed, so a learner saw what looked like a clock and was
  // not one. The reading is now produced by ExamCountdownTimer from a real
  // deadline, and the window length is EXAM_QUESTION_TIMER_SECONDS in
  // exam-timer-utils.ts rather than a piece of copy.
  //
  // The label stays here because it is wording. It is the same sentence as
  // examCopy.timeRemainingLabel and is kept separate so Listening can be
  // reworded without touching the other three sections.
  questionTimerLabel: "Time remaining",

  // Closing screens.
  //
  // The EXAM-03 completion placeholder and its "Coming soon" review
  // control are gone. EXAM-04 put the answer review, the practice score
  // and the end of part screen in their place, and their wording lives in
  // listening-review-copy.ts.

  // Completion screen for a part whose review and score are not built yet
  // (EXAM-05). Listening Part 2 closes on this.
  //
  // The review line is a plain sentence, not a greyed out button, for the
  // same reason ListeningPartEndScreen gives: there is nothing to press,
  // and a disabled control implies there will be in a moment.
  partCompletePendingReview:
    "The answer review and the practice score for this part are added in the next ticket.",
  partCompleteNotice:
    "Nothing from this run has been saved. Restarting clears the answers held on this page.",
  partCompleteBackToDashboardLabel: "Back to dashboard",

  // Audio player.
  audioPlayerLabel: "Practice test audio player",
  audioFallbackHeading: "This audio cannot be played right now",
  audioFallbackText:
    "Check your connection and reload the page to try again. You can continue when you are ready.",
  audioUnsupportedText:
    "Your browser cannot play this audio clip. You can continue when you are ready.",
  // Shown under the controls when the browser blocked the clip from
  // starting on its own (EXAM-15F). Browser autoplay policies can refuse a
  // clip with sound even after a click elsewhere on the page, so the
  // screen says what to do rather than sitting silent.
  audioAutoplayBlockedText:
    "This clip did not start on its own. Press play to begin.",

  // Listening Part 1 route heading (EXAM-03).
  //
  // These three strings were written for the dashboard preview card that
  // EXAM-15A removed. previewTitle and previewSummary are still the
  // heading and the standfirst on the Part 1 route itself, which is now
  // reachable by URL only. previewDescription no longer has a caller and
  // is kept beside them for the same reason the Part 2 to Part 6
  // descriptions are: the six blocks stay symmetrical.
  //
  // previewSummary no longer says the practice score waits on the answer
  // key. The key was transcribed after EXAM-04, and EXAM-15A moved the
  // marking to the server, so Part 1 scores the same way Parts 2 to 6 do.
  previewTitle: "Mock Test 1 Listening Part 1 Prototype",
  previewSummary:
    "Internal preview of Listening Part 1, Listening to Problem Solving, built from Mock Test 1 content. Answers are held on the page only and nothing is saved.",
  previewDescription:
    "Prototype of Mock Test 1 Listening Part 1, with the conversation audio, the eight question screens, local answer selection, and the answer review and practice score screens.",

  // Listening Part 2 (EXAM-05).
  //
  // Part specific wording lives here rather than being derived from the
  // content object, because "Listening Part 2" is not any field on it:
  // partTitle is the section name, "Listening to a Daily Life
  // Conversation", and title is the full practice test heading.
  part2CompleteHeading: "Listening Part 2 complete",
  part2RestartLabel: "Restart Listening Part 2",
  part2PreviewTitle: "Mock Test 1 Listening Part 2 Prototype",
  part2PreviewSummary:
    "Internal preview of Listening Part 2, Listening to a Daily Life Conversation, built from Mock Test 1 content. Answers are held on the page only and nothing is saved.",
  part2PreviewDescription:
    "Prototype of Mock Test 1 Listening Part 2, with the telephone conversation audio, the five question screens, local answer selection, and the answer review and practice score screens.",

  // Marking screen, shown between the last question and the answer
  // review while a part's answers are checked (EXAM-06, renamed from the
  // part2 prefix by EXAM-08).
  //
  // A part that keeps its answer key on the server has its review rows
  // and its practice score fetched rather than calculated in the browser.
  // That is normally too fast to read, but it can fail, and a failure
  // needs a screen that says so and offers another go.
  //
  // Not one of these strings ever named a part, so EXAM-08 dropped the
  // part2 prefix rather than adding an identical part3 copy of each.
  // Listening Parts 2 and 3 both read them.
  //
  // The wording is about the check, never about the answers. Nothing
  // here implies a result before one exists.
  markingHeading: "Checking your answers",
  markingText:
    "Your answers are being checked. This takes a moment, and nothing is saved.",
  markingFailedHeading: "Your answers could not be checked",
  markingFailedText:
    "The answer review could not be loaded. Check your connection, confirm you are still signed in, and try again. Your answers are still held on this page.",
  markingRetryLabel: "Try again",

  // Listening Part 3 (EXAM-07, closing screens added by EXAM-08).
  //
  // Same reason Part 2 has its own block: "Listening Part 3" is not any
  // field on the content object. partTitle is the section name,
  // "Listening for Information", and title is the full practice test
  // heading.
  //
  // part3CompleteHeading and part3RestartLabel are gone. Part 3 closed on
  // the EXAM-05 completion screen for one ticket, and now ends on the
  // answer review, the practice score and the end of part screen, whose
  // wording is built by listening-review-copy.ts. Retiring the pair was
  // follow up item 6 in docs/product/listening-part-3-prototype.md. The
  // part2 pair above is left in place as the template for the first cut
  // of a part that has no review yet.
  part3PreviewTitle: "Mock Test 1 Listening Part 3 Prototype",
  part3PreviewSummary:
    "Internal preview of Listening Part 3, Listening for Information, built from Mock Test 1 content. Answers are held on the page only and nothing is saved.",
  part3PreviewDescription:
    "Prototype of Mock Test 1 Listening Part 3, with the university workplace conversation audio, the six question screens, local answer selection, and the answer review and practice score screens.",

  // Dropdown completion screens (EXAM-09).
  //
  // Screen type 7, used by Listening Parts 4, 5 and 6: one media item,
  // then every question in the part on a single screen. None of these
  // strings names a part, so Parts 5 and 6 read the same ones.
  //
  // dropdownInstruction is the fallback for a part whose content object
  // does not carry its own question instruction. Mock Test 1 Part 4 does
  // carry one, taken from the source document, so this is the default
  // rather than the value in use.
  dropdownInstruction:
    "Choose the best way to complete each statement from the drop-down menu.",
  // Placeholder option, selected until the learner chooses. It is a real
  // option in the list with an empty value, so a select that has not been
  // answered shows something rather than defaulting to the first choice.
  dropdownPlaceholder: "Select answer",
  // Read in place of the underscores by a screen reader, so the statement
  // announces as a sentence with a gap rather than as punctuation.
  dropdownBlankLabel: "blank",
  // Shown under the list while questions are outstanding, explaining why
  // Next is not available yet.
  dropdownAnswerAllHint: ANSWER_ALL_QUESTIONS_HINT,

  // News item screens (EXAM-09).
  newsItemInstruction: "Listen to the following news item.",
  newsItemPlayerTitle: "News item audio",

  // Listening Part 4 (EXAM-09, closing screens added by EXAM-10).
  //
  // Same reason Parts 2 and 3 have their own blocks: "Listening Part 4"
  // is not any field on the content object. partTitle is the section
  // name, "Listening to a News Item", and title is the full practice test
  // heading.
  //
  // part4CompleteHeading and part4RestartLabel are gone, for the same
  // reason the part3 pair went in EXAM-08. Part 4 closed on the EXAM-09
  // completion screen for one ticket, and now ends on the answer review,
  // the practice score and the end of part screen, whose wording is built
  // by listening-review-copy.ts. The part2 pair above is still the
  // template for the first cut of a part that has no review yet.
  part4PreviewTitle: "Mock Test 1 Listening Part 4 Prototype",
  part4PreviewSummary:
    "Internal preview of Listening Part 4, Listening to a News Item, built from Mock Test 1 content. Answers are held on the page only and nothing is saved.",
  part4PreviewDescription:
    "Prototype of Mock Test 1 Listening Part 4, with the news item audio and the five dropdown completion questions on one screen, local answer selection, and the answer review and practice score screens.",

  // Video discussion screens (EXAM-11).
  //
  // Screen type 5 followed by screen type 7, used by Listening Part 5,
  // which is the only Listening part with a video. None of these strings
  // names a part.
  discussionInstruction: "Watch the discussion.",
  discussionVideoTitle: "Discussion video",
  discussionVideoHint:
    "Play the video when you are ready, then continue to the questions.",
  // Accessible name for the Part 5 player. The shell default names an
  // instructional video, which this is not: it is practice test material,
  // so a screen reader should not announce it as a walkthrough.
  discussionVideoPlayerLabel: "Practice test video player",
  discussionVideoUnsupportedText:
    "Your browser cannot play this video. You can continue when you are ready.",

  // One screen question list for Part 5 (EXAM-11, wording corrected by
  // EXAM-UI-03).
  //
  // Separate from chooseAnswerInstruction above, which reads "Choose the
  // best answer to each question." and belongs to the Parts 1 to 3
  // question screens.
  //
  // The drop-down clause is back, the way it came back for Part 6 in
  // EXAM-15F and for the same reason. The source document instructs this
  // part with the clause; EXAM-11 dropped it because it drew radio
  // options and naming a control that was not on the screen would have
  // been a lie. Part 5 is a drop-down screen from EXAM-UI-03 on, so the
  // line names the control the learner is looking at.
  chooseBestWayInstruction:
    "Choose the best way to answer each question from the drop-down menu.",
  // Same sentence the dropdown list shows, and the same reason. See
  // ANSWER_ALL_QUESTIONS_HINT above.
  choiceAnswerAllHint: ANSWER_ALL_QUESTIONS_HINT,

  // Listening Part 5 (EXAM-11, closing screens added by EXAM-12).
  //
  // Same reason Parts 2, 3 and 4 have their own blocks: "Listening Part
  // 5" is not any field on the content object. partTitle is the section
  // name, "Listening to a Discussion", and title is the full practice
  // test heading.
  //
  // part5CompleteHeading and part5RestartLabel are gone, for the same
  // reason the part3 and part4 pairs went. Part 5 closed on the EXAM-11
  // completion screen for one ticket, and now ends on the answer review,
  // the practice score and the end of part screen, whose wording is built
  // by listening-review-copy.ts. The part2 pair above is still the
  // template for the first cut of a part that has no review yet.
  part5PreviewTitle: "Mock Test 1 Listening Part 5 Prototype",
  part5PreviewSummary:
    "Internal preview of Listening Part 5, Listening to a Discussion, built from Mock Test 1 content. Answers are held on the page only and nothing is saved.",
  part5PreviewDescription:
    "Prototype of Mock Test 1 Listening Part 5, with the workplace discussion video and the eight dropdown questions on one screen, local answer selection, and the answer review and practice score screens.",

  // Viewpoints screens (EXAM-13).
  //
  // Screen type 4 followed by screen type 7, used by Listening Part 6,
  // which completes statements from a drop-down menu since EXAM-15F. None
  // of these strings names a part.
  //
  // reportInstruction drops the source document's "You will hear the
  // report only once", for the same reason the conversation wording at the
  // top of this file drops it: the clip can be replayed here, so printing
  // the official-style sentence would be a promise the screen does not
  // keep.
  reportInstruction: "Listen to the following report.",
  reportPlayerTitle: "Report audio",
  reportHint:
    "Play the report when you are ready, then continue to the questions.",
  // Fallback instruction above a viewpoints question list, for a part
  // whose content object does not carry its own. Mock Test 1 Part 6 does
  // carry one, so this is the default rather than the value in use.
  //
  // The same sentence as dropdownInstruction above, and deliberately so
  // since EXAM-15F. It used to stop at "each statement", because EXAM-13
  // answered a viewpoints question from radio options and naming a
  // drop-down menu would have promised a control that was not on the
  // screen. The control is a select now, so the clause the source document
  // actually carries comes back. It is kept as its own entry rather than
  // pointed at dropdownInstruction because a viewpoints part is still its
  // own content shape and can still want its own wording.
  viewpointsInstruction:
    "Choose the best way to complete each statement from the drop-down menu.",
  // Same sentence the other one screen lists show, and the same reason.
  // See ANSWER_ALL_QUESTIONS_HINT above.
  viewpointsAnswerAllHint: ANSWER_ALL_QUESTIONS_HINT,

  // Listening Part 6 (EXAM-13, closing screens added by EXAM-14).
  //
  // Same reason Parts 2 to 5 have their own blocks: "Listening Part 6" is
  // not any field on the content object. partTitle is the section name,
  // "Listening for Viewpoints", and title is the full practice test
  // heading.
  //
  // part6CompleteHeading and part6RestartLabel are gone, for the same
  // reason the part3, part4 and part5 pairs went. Part 6 closed on the
  // EXAM-13 completion screen for one ticket, and now ends on the answer
  // review, the practice score and the end of part screen, whose wording
  // is built by listening-review-copy.ts. The part2 pair above is still
  // the template for the first cut of a part that has no review yet.
  part6PreviewTitle: "Mock Test 1 Listening Part 6 Prototype",
  part6PreviewSummary:
    "Internal preview of Listening Part 6, Listening for Viewpoints, built from Mock Test 1 content. Answers are held on the page only and nothing is saved.",
  part6PreviewDescription:
    "Prototype of Mock Test 1 Listening Part 6, with the community development report audio and the six viewpoints questions on one screen, local answer selection, and the answer review and practice score screens.",

  // Full Listening section (EXAM-15).
  //
  // The fullSectionPreviewTitle, fullSectionPreviewSummary and
  // fullSectionPreviewDescription strings that sat here are gone. They
  // were the internal preview page heading, eyebrow summary and
  // description for /dashboard/mock-tests/mock-test-1/listening, and
  // EXAM-15B turned that route into a locked exam screen with no page
  // heading and no description at all. Nothing read them afterwards.
  //
  // Screen wording for that route lives in listening-section-copy.ts,
  // which is where the section owned screens read from, and the test's own
  // name is SECTION_TITLE in the section content file.

  // Dashboard card for the full Listening test (EXAM-15A).
  //
  // The one Mock Test 1 entry a learner sees on the dashboard. EXAM-15A
  // took the six part prototype cards, the shell preview card and the
  // instruction preview card off the dashboard, so this is the only
  // Listening card on it now. The routes behind the removed cards are
  // untouched and still open when the URL is typed.
  //
  // These strings are learner facing: no Internal preview badge, no
  // Prototype in the title, and the description names what the learner
  // gets rather than what the ticket built. fullSectionCardTitle is also
  // the name the test itself carries in its top bar, so the card and the
  // first screen of the run agree.
  //
  // The caveats that used to sit in a notice above the frame moved into
  // the run itself when EXAM-15B removed the page chrome. The instruction
  // screen says answers are held on the screen and nothing is saved, and
  // the review and score screens say the result is not an official CELPIP
  // score.
  //
  // The three counts are written out rather than derived from the
  // content object, so the dashboard does not have to import a section
  // full of answer keys to render a card. Mock Test 1 Listening is 6
  // parts and 38 questions; change these if the section content changes.
  mockTestsHeading: "Mock tests",
  mockTestsDescription:
    "Full practice sections built from CELPIP Decoded Mock Test 1 content. Answers are held on the page for one visit and nothing is saved yet.",
  fullSectionCardTitle: "Mock Test 1 - Listening test",
  fullSectionCardDescription:
    "Complete the full Listening section with instructions, all 6 parts, answer review, and practice score.",
  fullSectionCardSectionLabel: "Listening",
  fullSectionCardPartsLabel: "6 parts",
  fullSectionCardQuestionsLabel: "38 questions",
  fullSectionCardStatusLabel: "Available",
  fullSectionCardCtaLabel: "Start listening test",
} as const;

// Answered count under a dropdown question list, for example
// "3 of 5 questions answered."
export function formatListeningAnsweredCount(
  answered: number,
  total: number,
): string {
  return `${answered} of ${total} question${
    total === 1 ? "" : "s"
  } answered.`;
}

// Answered line on the completion screen, for example
// "You answered 5 of 5 questions."
export function formatListeningAnsweredMessage(
  answered: number,
  total: number,
): string {
  return `You answered ${answered} of ${total} question${
    total === 1 ? "" : "s"
  }.`;
}

// Ordinal words for the section labels and the break lines. Part 1 has
// three sections and no Listening part has more, so the list is short on
// purpose and falls back to the number if a longer part ever appears.
const SECTION_ORDINALS = ["first", "second", "third", "fourth", "fifth"];

function sectionOrdinal(sectionIndex: number): string {
  return SECTION_ORDINALS[sectionIndex] ?? `${sectionIndex + 1}th`;
}

// Section position, for example Section 2 of 3.
export function formatListeningSectionLabel(
  sectionIndex: number,
  totalSections: number,
): string {
  return `Section ${sectionIndex + 1} of ${totalSections}`;
}

// Break line before a section, for example
// "You will hear the second section of the conversation shortly."
export function formatListeningSectionBreak(sectionIndex: number): string {
  return `You will hear the ${sectionOrdinal(
    sectionIndex,
  )} section of the conversation shortly.`;
}

// Screen position in the top bar, for example Screen 4 of 16.
export function formatListeningScreenPosition(
  current: number,
  total: number,
): string {
  return `Screen ${current} of ${total}`;
}
