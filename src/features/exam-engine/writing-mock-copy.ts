// Learner facing wording for the Mock Test 1 Writing section (EXAM-25,
// extended by EXAM-26).
//
// Same rule as exam-copy.ts, listening-copy.ts and reading-copy.ts: all
// Writing mock test chrome copy lives in one file so the screens say the
// same thing everywhere, and so a wording change is one edit rather than
// eight.
//
// Two wording rules this file exists to hold the line on:
//
// - Nothing here promises an official result. EXAM-26 added an AI review
//   and an estimated Writing level, so the screens no longer say a review
//   is coming later, but every one of them names what it is: a Toronto
//   Academy practice estimate, AI-supported, and not an official CELPIP
//   score. The words "official CELPIP score", "official result",
//   "guaranteed score" and "pass guarantee" appear nowhere in this file
//   except in the sentences that deny them.
// - Nothing here names the official test as the thing the learner is
//   sitting. This is CELPIP Decoded practice software, which is the rule
//   docs/product/exam-engine-reference-audit.md section 9 sets out.
//
// What is deliberately not copied from the source document: the Writing
// instruction sentence that begins "On the official test, if you do not
// finish Task 1 in 27 minutes, the screen will move to Task 2." Half of
// it describes the official test rather than this one, and the half that
// is true here, that you move forward by pressing Next, is said plainly
// in the section instructions instead. The 27 minute figure it carries is
// used, as the Task 1 window: see writing-section.ts.
//
// Strings and pure helpers only, no side effects, so this file is safe to
// import from a client component.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export function buildWritingMockCopy({ testLabel }: { testLabel: string }) {
  return {
    // 1. Writing section intro.
    introScreenTitle: testLabel + " - Writing Test",
    introSubtitle:
      "Read the following information before the Writing section begins.",
    introLines: [
      {
        heading: "Two tasks",
        text: "You will write one email and one survey response. Each one has its own prompt and its own writing time.",
      },
      {
        heading: "Moving forward",
        text: "Press Next to move to the next screen. You can move back and forward, and everything you have typed stays as you left it.",
      },
      {
        heading: "Your writing",
        text: "Your responses are held on this screen only. Nothing is saved, and leaving or reloading the page clears them.",
      },
      {
        heading: "AI review at the end",
        text: "When you finish both tasks you can send your writing for AI review. You will get feedback on each task and an estimated Writing level for practice.",
      },
    ],
    introNotice:
      "This is CELPIP Decoded writing practice, not an official CELPIP test. The review is AI-supported and gives a practice estimate, not an official CELPIP score. Nothing you type here is saved.",
    introCardTitle: "Writing section",
    introCardSummary:
      "Both Writing tasks in one run, with a live word count and a countdown on each task, followed by an optional AI review and an estimated Writing level for practice.",
    introTasksLabel: "Tasks",
    introTimeLabel: "Writing time",
    introWordsLabel: "Each response",

    // 2 and 4. The task screens.
    taskIntroSubtitle:
      "Read the information on the left, then write your response on the right.",
    // The task split screen carried a small caps column label over each
    // half until EXAM-UI-03. Both are gone: each column now opens with
    // its own instruction line, "Read the following information." on the
    // left and the task itself on the right, and a label above those said
    // the same thing twice. The field keeps its own label strip, which is
    // editorLabel below.

    // Heading above the two positions on the survey task.
    choiceLegendLabel: "Choose one option",
    // Shown under the positions while none has been chosen. It states
    // what a blank costs rather than what it blocks, because nothing is
    // blocked.
    choiceHint:
      "Choose the option you prefer. You can change your choice at any time, and your writing is kept when you do.",

    // 4. The Task 2 choice screen (EXAM-UI-04).
    //
    // The one screen in the section that will not move forward until it
    // has been answered, so it is also the only place in the Writing
    // section with a validation message in it. The message says what to
    // do rather than what went wrong, because nothing went wrong: the
    // learner pressed a control before the screen was ready for it.
    choiceScreenNextLabel: "Start writing",
    choiceScreenHint:
      "Choose the option you want to write about. You can change your choice on the next screen, and your writing is kept when you do.",
    choiceRequiredMessage:
      "Choose Option A or Option B before you start writing.",
    // Restates the chosen position above the response box on the editor
    // screen, so the position being argued is on screen while it is being
    // argued.
    chosenOptionLabel: "You are writing about",
    // Timer label in the top bar. The same sentence as
    // examCopy.timeRemainingLabel, kept separate so Writing can be
    // reworded without touching the other three sections.
    taskTimerLabel: "Time remaining",
    // Quiet line under the editor.
    //
    // EXAM-26 changed the second half of this sentence and the change
    // matters. The old wording said the writing was never sent anywhere,
    // which stopped being true the moment a Submit for AI Review button
    // existed. It now says where the writing can go and that going there
    // is the learner's choice.
    editorHint:
      "Your writing is held on this screen only and is not saved. At the end of the section you can choose to send it for AI review.",
    // Accessible name for the editor, and the visible label above it.
    editorLabel: "Your response",
    // Next label on the last task, which the ticket asks to read Finish
    // Writing rather than Next. It closes the section rather than moving
    // to another task, and a control that says what it does is worth the
    // one extra string.
    finishWritingLabel: "Finish Writing",
    // Word count block beside the editor.
    wordCountLabel: "Word count",
    wordTargetLabel: "Target",

    // 3. Task transition.
    transitionHeading: "Task complete",
    transitionHint:
      "Take a moment to get ready. Continue when you want the next task. Your Task 1 writing is kept and you can go back to it.",

    // 5. Writing section complete.
    completeHeading: "Writing section complete",
    completeMessage:
      "You have reached the end of the Writing section. Here is what you typed for each task.",
    completeTasksHeading: "Your responses",
    completeWordsColumn: "Words",
    completeTaskColumn: "Task",
    completeChoiceColumn: "Option chosen",
    completeNoChoiceValue: "No option chosen",
    completeNotice:
      "Nothing from this run has been saved. Leaving or restarting clears the writing held on this page.",
    restartLabel: "Restart Writing section",
    backToDashboardLabel: "Return to dashboard",

    // 6. The AI review (EXAM-26).
    //
    // The review is offered, never forced. A learner can finish the
    // section, read their two word counts and leave without ever pressing
    // the button, which is why the completion screen keeps every control
    // it had and gains one rather than being replaced by a review screen.
    reviewHeading: "AI review",
    reviewIntro:
      "Send both responses for AI review to get feedback on each task and an estimated Writing level for practice.",
    reviewSubmitLabel: "Submit for AI Review",
    reviewSubmitPendingLabel: "Reviewing your writing",
    // Shown under the button before it is pressed. It says what leaves
    // the page, which is the one thing a learner should know before
    // pressing a button that sends their writing somewhere.
    reviewSubmitHint:
      "Your two responses are sent for AI review. Nothing is saved and no attempt history is kept.",
    // Shown in place of the hint when both responses are empty.
    reviewEmptyHint:
      "You have not written anything yet. Go back to the tasks and write a response, or submit to see what an empty section reports.",

    // Processing screen.
    reviewProcessingHeading: "Reviewing your writing",
    reviewProcessingText:
      "This usually takes under a minute. Keep this screen open. Your writing is still here and nothing has been lost.",
    reviewProcessingNotice:
      "The review is AI-supported and gives a CELPIP Decoded practice estimate, not an official CELPIP score.",

    // Error screen.
    reviewFailedHeading: "The review could not be completed",
    reviewFailedText:
      "Something went wrong while reviewing your writing. Your responses are still held on this page, so you can try again.",
    reviewRetryLabel: "Try the review again",
    reviewBackToResponsesLabel: "Back to your responses",

    // Result screen.
    reviewResultHeading: "Writing practice result",
    reviewResultSubtitle:
      "AI-supported feedback on both tasks, with an estimated Writing level for practice.",
    reviewOverallLabel: "Estimated Writing level",
    reviewOverallBasisLabel: "Why this level",
    // The practice-only disclaimer. The single most important sentence on
    // the result screen, so it is stated once as a whole sentence rather
    // than assembled from fragments at the point of use.
    reviewPracticeDisclaimer:
      "This is a CELPIP Decoded practice estimate produced by AI-supported feedback. It is not an official CELPIP score and it does not predict an official result.",
    reviewPracticeDisclaimerLabel: "Practice estimate",
    reviewResultNotice:
      "Nothing from this review has been saved. Leaving or restarting clears the writing and the feedback held on this page.",

    // Task result card.
    reviewTaskLevelLabel: "Estimated level",
    reviewTaskWordCountLabel: "Word count",
    reviewTaskWordRangeLabel: "Word target",
    reviewWithinRangeLabel: "Within target",
    reviewOutsideRangeLabel: "Outside target",
    reviewCriteriaHeading: "Criterion levels",
    reviewCriterionColumn: "Criterion",
    reviewCriterionLevelColumn: "Level",
    reviewCriterionEvidenceColumn: "What your writing shows",
    reviewCriterionNextColumn: "What the next level needs",
    reviewSucceededLabel: "What worked",
    reviewFellShortLabel: "What held it back",
    reviewMissingPointsLabel: "Prompt points not addressed",
    reviewTemplateWarningsLabel: "Template language to avoid",
    reviewTopMistakesHeading: "Top mistakes",
    reviewMistakeOriginalLabel: "You wrote",
    reviewMistakeCorrectionLabel: "Stronger",
    reviewNoMistakesText:
      "No specific corrections were flagged for this response.",
    reviewRewriteHeading: "Your response, one level up",
    reviewRewriteTargetLabel: "Target level",
    reviewRewriteChangesHeading: "What changed",
    reviewModelHeading: "Level 11-12 model response",
    reviewModelIntro:
      "A fresh response to the same prompt, written at the top of the scale so you can see the distance.",
    // Insufficient response wording, used for a task left blank.
    reviewInsufficientLevel: "Insufficient response",
    reviewInsufficientHeading: "Not enough writing to review",
    reviewNoResponseSubmitted: "No writing was submitted for this task.",

    // Page metadata and the exam region name, for the route.
    pageTitle: testLabel + " writing test - CELPIP Decoded",
    pageDescription:
      "Internal prototype of the " +
      testLabel +
      " Writing section, with the Task 1 email and the Task 2 survey response in one run, followed by an optional AI review and an estimated Writing level for practice.",
    examRegionLabel: testLabel + " - Writing Test",

    // Dashboard internal preview card.
    //
    // Dressed as an internal build link, the way the Reading card is.
    // What it deliberately does not say: that a full all-skills Mock Test
    // 1 exists, or that any of this produces a CELPIP result. Three
    // sections of four are built, Speaking is not, and the estimate this
    // one produces is a practice estimate.
    dashboardCardTitle: testLabel + " - Writing test",
    dashboardCardDescription:
      "Writing section prototype with Task 1 and Task 2 editors, AI review and an estimated Writing level for practice.",
    dashboardCardSectionLabel: "Writing",
    dashboardCardTasksLabel: "Tasks 1-2",
    dashboardCardCtaLabel: "Open writing test",
    dashboardPreviewBadgeLabel: "Internal preview",
  } as const;
}

// Mock Test 1. Also the default every Writing mock screen falls back to
// when no copy is passed.
export const writingMockCopy = buildWritingMockCopy({
  testLabel: "Mock Test 1",
});

export type WritingMockCopy = ReturnType<typeof buildWritingMockCopy>;

// Transition line between two tasks, for example
// "Writing Task 1 complete. Continue to Writing Task 2."
export function formatWritingTaskTransition(
  completedTaskLabel: string,
  nextTaskLabel: string,
): string {
  return completedTaskLabel + " complete. Continue to " + nextTaskLabel + ".";
}

// Task position inside the section, for example "Writing Task 2 of 2".
export function formatWritingTaskPosition(
  taskNumber: number,
  totalTasks: number,
): string {
  return "Writing Task " + taskNumber + " of " + totalTasks;
}

// Top bar note on a task screen, for example
// "Writing Task 2 of 2 - Screen 5 of 6".
export function formatWritingTaskMeta(
  taskNumber: number,
  totalTasks: number,
  screenNumber: number,
  totalScreens: number,
): string {
  return (
    formatWritingTaskPosition(taskNumber, totalTasks) +
    " - Screen " +
    screenNumber +
    " of " +
    totalScreens
  );
}

// Full top bar title for a task screen, for example
// "Mock Test 1 - Writing Task 2: Responding to Survey Questions"
// (EXAM-UI-04).
//
// Both halves already exist on the task: title is the test and the task
// number, taskTitle is the task name the source document prints. They are
// joined here rather than written into the content file as a third
// string, so the name of a task cannot come to be spelled two ways.
//
// Used by the Task 2 choice screen and the Task 2 editor screen, which
// are two screens for one task and therefore have to carry one title
// between them.
export function formatWritingTaskScreenTitle(
  title: string,
  taskTitle: string,
): string {
  return title + ": " + taskTitle;
}

// Top bar note on a screen the section owns rather than a task, for
// example "Writing section - Screen 1 of 6".
export function formatWritingSectionMeta(
  screenNumber: number,
  totalScreens: number,
): string {
  return "Writing section - Screen " + screenNumber + " of " + totalScreens;
}

// Whole minutes, for the intro card, for example "53 minutes".
//
// The Writing allowances are whole numbers of minutes in every source we
// hold, so nothing here has to print seconds.
export function formatWritingMinutes(seconds: number): string {
  const minutes = Math.round(seconds / 60);

  return minutes + (minutes === 1 ? " minute" : " minutes");
}

// A word count reading, for example "0 words" or "1 word".
//
// Singular is handled because a one word response is a real thing a
// learner can produce, and "1 words" beside an editor looks like a bug.
export function formatWritingWordCount(wordCount: number): string {
  return wordCount + (wordCount === 1 ? " word" : " words");
}

// The word target, for example "150-200 words".
export function formatWritingWordTarget(min: number, max: number): string {
  return min + "-" + max + " words";
}
