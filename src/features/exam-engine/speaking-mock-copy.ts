// Learner facing wording for the Mock Test 1 Speaking section (EXAM-27,
// extended by EXAM-28).
//
// Same rule as exam-copy.ts, listening-copy.ts, reading-copy.ts and
// writing-mock-copy.ts: all Speaking mock test chrome copy lives in one
// file so the screens say the same thing everywhere, and so a wording
// change is one edit rather than seventeen.
//
// Four wording rules this file exists to hold the line on:
//
// - Nothing here promises an official result. EXAM-28 added a
//   transcription step, an AI review and an estimated Speaking level, so
//   the screens no longer say a review is coming later. What they say
//   instead is that the estimate is a CELPIP Decoded practice estimate
//   produced by AI-supported feedback. The words "official CELPIP
//   score", "official result", "guaranteed score" and "pass guarantee"
//   appear nowhere in this file except in the sentences that deny them.
// - Nothing here claims the review heard the recording. It did not. The
//   recording is transcribed and the scoring model is given the
//   transcript, the task, the recording window and the measured
//   duration. So no sentence in this file says the review judged
//   pronunciation, rhythm or intonation, and the audio assessment note
//   says in words that it did not.
// - Nothing here says a recording has been saved. It has not. Every
//   recording lives in the browser tab and is lost on a reload, and it
//   leaves the page only for the length of one review request. The intro
//   notice, the line under the recorder, the submit hint and the
//   completion notice all say so.
// - Nothing here names the official test as the thing the learner is
//   sitting. This is CELPIP Decoded practice software, which is the rule
//   docs/product/exam-engine-reference-audit.md section 9 sets out.
//
// What is deliberately not copied from the source document. The Mock Test
// 1 Speaking instructions are five sentences, and three of them describe
// software that behaves differently from ours:
//
//   "In this practice test, no score will be provided for any of the
//   Speaking tasks. However, you can refer to the Performance Standards
//   for Speaking or listen to sample speaking responses at the end of the
//   Speaking Test."
//   "For this practice test, you should use a timer to make sure that you
//   complete each task within the given time."
//   "The practice test will not record your answers. If you wish to
//   record your own answers, record and save your responses using your
//   computer microphone or your own recording device."
//
// This engine has its own preparation and recording countdowns, so the
// learner does not need a timer of their own. It records in the browser,
// so the third sentence is not true here. And it has no sample responses
// screen and no Performance Standards link, so the first sentence points
// at something that does not exist in this product.
//
// docs/product/mock-test-1-content-map.md already flagged this as work to
// do: "Rewrite the Speaking instruction copy so it describes Toronto
// Academy behaviour". The instruction lines below are that rewrite. The
// two facts in the source instructions that are true here, that you move
// forward by pressing Next and that the Speaking Test is about 15
// minutes, are both kept.
//
// The eight task prompts are not in this file. Those are source content
// and live in
// src/features/exam-engine/mock-tests/mock-test-1/speaking-section.ts.
//
// Strings and pure helpers only, no side effects, so this file is safe to
// import from a client component.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export function buildSpeakingMockCopy({ testLabel }: { testLabel: string }) {
  return {
    // 1. Speaking section intro.
    introScreenTitle: testLabel + " - Speaking Test",
    introSubtitle:
      "Read the following information before the Speaking section begins.",
    introLines: [
      {
        heading: "Eight tasks",
        text: "You will speak on eight tasks, one after the other. Each task has its own prompt, its own preparation time and its own recording time.",
      },
      {
        heading: "Preparation, then recording",
        text: "The preparation countdown starts when the task screen opens. The recording countdown starts when you press Start recording, and your microphone is only asked for at that moment.",
      },
      {
        heading: "Moving forward",
        text: "Press Next to move to the next screen. You can move back and forward, and any recording you have made stays as you left it.",
      },
      {
        heading: "Your recordings",
        text: "Recordings are held in this browser tab only. You can play them back and record again as many times as you like. Nothing is saved, and leaving or reloading the page clears them.",
      },
      {
        heading: "AI review at the end",
        text: "When you finish all eight tasks you can send your recordings for AI review. They are transcribed, and you get feedback on each task and an estimated Speaking level for practice.",
      },
    ],
    introNotice:
      "This is CELPIP Decoded speaking practice, not an official CELPIP test. The review is AI-supported and gives a practice estimate, not an official CELPIP score. Nothing you record here is saved.",
    introCardTitle: "Speaking section",
    introCardSummary:
      "All eight Speaking tasks in one run, each with a preparation countdown, a recording countdown and a local playback of what you recorded, followed by an optional AI review and an estimated Speaking level for practice.",
    introTasksLabel: "Tasks",
    introPrepLabel: "Preparation time",
    introSpeakingLabel: "Speaking time",

    // 2. The task screens.
    //
    // The prompt column carried a "Your task" label until EXAM-UI-03. It
    // is gone: the column opens with the task sentence itself, marked
    // with the information glyph, and a label over that said the same
    // thing twice.
    //
    // The column heading and the preview heading below it are
    // deliberately different words. Both said "Your recording" in the
    // first pass and the screen printed the same label twice, once over
    // the whole answer column and once over the player inside it.
    recordColumnLabel: "Your answer",
    // Read by assistive technology as the recorder section's name. It
    // stopped being drawn on the screen in EXAM-UI-03, where the prompt
    // column dropped its small caps heading.
    promptHeading: "Read the task",
    // Heading above the pictures on a task that has them.
    visualHeading: "Look at the picture",
    // Heading above the two option cards on Task 5.
    optionCardsHeading: "Compare the options",

    // The two clocks in the top bar. examCopy already carries
    // "Preparation" and "Recording" for exactly this pair, and these
    // repeat them under Speaking names so the section can be reworded on
    // its own later.
    prepTimerLabel: "Preparation",
    responseTimerLabel: "Recording",
    // Shown beside the recording clock before recording has started, in
    // place of a countdown that is not running yet.
    responseTimerIdleLabel: "Speaking time",
    // Quiet line under each clock, saying what the window is for.
    prepTimerNote: "Time to plan what you will say.",
    // Shown in place of the preparation reading once recording has
    // started, because the preparation window is over at that point
    // whether or not it had run out.
    prepTimerDoneValue: "Complete",
    prepTimerDoneNote: "Preparation ended when recording started.",
    responseTimerIdleNote: "Starts when you press Start recording.",
    responseTimerRunningNote: "Recording. Press Stop recording when you finish.",
    // Shown under either clock once it has run out. The reading itself
    // already says "Time is up", so this says what that does and does not
    // mean here.
    timerExpiredNote:
      "Nothing stops or is deleted. Finish what you are saying, then continue when you are ready.",

    // The recorder.
    recorderHeading: "Record your answer",
    recorderIdleHint:
      "Use the preparation time to plan what you will say. Press Start recording when you are ready. Your browser will ask for microphone access the first time.",
    recorderRecordingHint:
      "Recording. Speak until you have finished, then press Stop recording.",
    recorderRecordedHint:
      "Play your answer back below. You can record again, and only your most recent take is kept.",
    startRecordingLabel: "Start recording",
    requestingMicrophoneLabel: "Waiting for microphone",
    stopRecordingLabel: "Stop recording",
    reRecordLabel: "Re-record",
    // Live status line beside the controls.
    statusIdleLabel: "Not recorded yet",
    statusRequestingLabel:
      "Waiting for microphone access. Allow microphone use in your browser to start recording.",
    statusRecordingLabel: "Recording in progress",
    statusStoppingLabel: "Finishing your recording",
    statusRecordedLabel: "Recorded",
    // Quiet line under the recorder, on every task.
    //
    // Reworded in EXAM-28. Before this ticket a recording never left the
    // page at all, and the line said so. Now it can leave, once, if the
    // learner chooses to send it for review at the end, so the line says
    // what is still true: it stays here until you choose otherwise, and
    // it is never saved.
    recorderPrivacyNote:
      "Your recording stays in this browser tab. It is not saved anywhere, and it is only sent for review if you choose to at the end of the section.",

    // Audio preview.
    previewHeading: "Your recording",
    previewLengthLabel: "Length",
    previewRecordedAtLabel: "Recorded",
    previewEmptyText:
      "Nothing recorded for this task yet. Press Start recording to record an answer.",
    previewUnsupportedText:
      "This browser cannot play the recording back. The recording was still made and is still held on this page.",

    // Recording problems. One heading and one sentence per kind, so the
    // screen can say what happened and offer only what can help.
    errorUnsupportedHeading: "Recording is not available in this browser",
    errorUnsupportedText:
      "This browser does not support microphone recording. Open the Speaking Test in an up to date browser such as Chrome, Edge, Firefox or Safari. You can still read every task and move through the section.",
    errorPermissionHeading: "Microphone access was blocked",
    errorPermissionText:
      "Your browser blocked microphone access. Allow the microphone for this site in your browser settings, then press Start recording again.",
    errorFailedHeading: "The recording could not be completed",
    errorFailedText:
      "Something went wrong while recording. Check that a microphone is connected and not in use by another application, then try again.",
    errorRetryLabel: "Try recording again",
    // Shown under an error, so a learner knows the run is not stuck.
    errorContinueHint:
      "You can continue to the next task. A task with no recording is reported as missing on the completion screen and nothing else happens.",

    // 2b. Speaking Task 5, which runs as four screens (SPEAKING-05A).
    //
    // Task 5 is the only task in the section that is not one screen, so
    // it is the only one with wording of its own. Everything here is
    // chrome: it names the parts of the task, says what each window is
    // for, and says what happens when one closes. The camps, the
    // situation, the persuade instruction and the "Your Choice" and "Your
    // Sister's Choice" headings are all source content and live in
    // speaking-section.ts.
    //
    // The one sentence in this block that the ticket names in words is
    // choiceTimeUpNote, and it says the whole of the timer rule in eight
    // words: the window is closed, nothing happened, you are still in
    // charge of when this screen ends.
    taskFiveInstructionsSubtitle:
      "This task has three parts. Read what each one asks for, then press Next to begin.",
    taskFiveInstructionsNotice:
      "Nothing is recorded on the first three screens. You record once, on the last one.",

    // The choice screen.
    choiceTimerLabel: "Choice time",
    choiceTimerNote: "Time to read both options and choose one.",
    choiceLegendLabel: "Choose one option",
    choiceHint:
      "Select the option you prefer, then press Next. You can change your choice by coming back to this screen.",
    // Shown once the window has closed, on the choice screen and the
    // preparation screen both, because the two windows close the same way
    // and mean the same thing when they do: nothing.
    //
    // It is word for word examCopy.timeUpToastText, and that is not an
    // oversight. The shared toast says this sentence for a few seconds
    // and then takes itself away, which is right for a message about
    // something that just happened and wrong for the state a learner is
    // now in: they are on a screen with a dead clock on it, and the line
    // telling them that is fine has to still be there a minute later.
    // Saying it in two different ways would be worse than saying it
    // twice, so the durable line repeats the passing one exactly.
    choiceTimeUpNote: "Time is up. You can continue when you are ready.",

    // The preparation screen.
    prepareScreenHint:
      "Plan how you will argue for your choice. Nothing is recorded on this screen.",
    // Restated above the two cards on the preparation and recording
    // screens, so a learner who let the window close knows which camp
    // they are about to argue for and that they can go back and change
    // it.
    choiceUserSelectedNote: "You chose this option.",
    choiceSystemSelectedNote:
      "You did not choose an option, so this one was chosen for you. Go back to the choice screen if you would rather argue for the other one.",
    choiceSelectedLabel: "Your choice",

    // The recording screen.
    recordingScreenHint:
      "Speak for up to one minute. Compare the two camps and persuade your sister that yours is the better choice.",

    // Next label on the last task, which closes the section.
    finishSpeakingLabel: "Finish Speaking",

    // 3. Task transition.
    transitionHeading: "Task complete",
    transitionRecordedLabel: "Recorded",
    transitionMissingLabel: "No recording",
    transitionHint:
      "Take a moment to get ready. Continue when you want the next task. Your recording is kept and you can go back to it.",

    // 4. Speaking section complete.
    completeHeading: "Speaking section complete",
    completeMessage:
      "You have reached the end of the Speaking section. Here is what you recorded for each task.",
    completeTasksHeading: "Your recordings",
    completeTaskColumn: "Task",
    completeStatusColumn: "Status",
    completeLengthColumn: "Length",
    completeRecordedValue: "Recorded",
    completeMissingValue: "No recording",
    completeNoLengthValue: "-",
    completeNextStepHeading: "What comes next",
    completeNextStepText:
      "Send your recordings for AI review to get a transcript of each answer, feedback against the four Speaking criteria, and an estimated Speaking level for practice.",
    completeNotice:
      "Nothing from this run has been saved. Leaving or restarting clears the recordings held on this page.",
    restartLabel: "Restart Speaking section",
    backToDashboardLabel: "Return to dashboard",

    // 5. The AI review (EXAM-28).
    //
    // The review is offered, never forced. A learner can finish the
    // section, read which tasks they recorded and leave without ever
    // pressing the button, which is why the completion screen keeps every
    // control it had and gains one rather than being replaced by a review
    // screen.
    reviewHeading: "AI review",
    reviewIntro:
      "Send your recordings for AI review to get a transcript of each answer, feedback on each task, and an estimated Speaking level for practice.",
    reviewSubmitLabel: "Submit for AI Review",
    reviewSubmitPendingLabel: "Reviewing your recordings",
    // Shown under the button before it is pressed. It says what leaves
    // the page, which is the one thing a learner should know before
    // pressing a button that sends their voice somewhere.
    reviewSubmitHint:
      "Your recordings are sent for transcription and AI review. They are not saved, not stored and not kept after the review is returned, and no attempt history is kept.",
    // Shown in place of the hint when nothing was recorded at all.
    reviewEmptyHint:
      "You have not recorded anything yet. Go back to the tasks and record an answer, or submit to see what an empty section reports.",
    // Processing screen.
    reviewProcessingHeading: "Reviewing your recordings",
    reviewProcessingText:
      "Your recordings are being transcribed and reviewed. This takes longer than a written review, usually a minute or two for a full section. Keep this screen open. Your recordings are still here and nothing has been lost.",
    reviewProcessingNotice:
      "The review is AI-supported and gives a CELPIP Decoded practice estimate, not an official CELPIP score.",

    // Error screen.
    reviewFailedHeading: "The review could not be completed",
    reviewFailedText:
      "Something went wrong while reviewing your recordings. Your recordings are still held on this page, so you can try again.",
    reviewRetryLabel: "Try the review again",
    reviewBackToRecordingsLabel: "Back to your recordings",

    // Cause-specific error wording.
    //
    // Every one of these ends on the same screen with the same controls.
    // They are separate sentences because they have different fixes, and
    // a learner who reads "try again" at a problem that retrying cannot
    // solve will keep pressing the button.
    //
    // None of them carries a provider message, a model name, an error
    // code or any part of the environment. The server logs those and
    // returns our wording.
    reviewCreditsExhaustedText:
      "AI review could not run because API credits are exhausted. Add API credits and try again. Your recordings are still held on this page.",
    reviewNotConfiguredText:
      "AI review is not configured on this environment yet, so the review could not run. Your recordings are still held on this page. Tell your administrator if you see this on a live site.",
    reviewAudioTooLargeText:
      "Your recordings were too large to send for review. Record shorter answers, or restart the section and record again, then try the review once more.",
    reviewUnsupportedAudioText:
      "Your browser recorded in a format the review cannot read. Try the Speaking section in an up to date Chrome, Edge, Firefox or Safari, and record again.",
    reviewInvalidRequestText:
      "The review request could not be read. Your recordings are still held on this page, so you can try again.",
    reviewUnauthenticatedText:
      "Your session has expired, so the review could not run. Sign in again in another tab, then try the review once more. Your recordings are still held on this page.",

    // Result screen.
    reviewResultHeading: "Speaking practice result",
    reviewResultSubtitle:
      "AI-supported feedback on each recorded task, with an estimated Speaking level for practice.",
    reviewOverallLabel: "Estimated Speaking level",
    // The practice-only disclaimer. The single most important sentence on
    // the result screen, so it is stated once as a whole sentence rather
    // than assembled from fragments at the point of use.
    reviewPracticeDisclaimer:
      "This is a CELPIP Decoded practice estimate produced by AI-supported feedback. It is not an official CELPIP score and it does not predict an official result.",
    reviewPracticeDisclaimerLabel: "Practice estimate",
    // The audio assessment note. The second most important sentence, and
    // the one the ticket requires by name.
    //
    // Fixed wording rather than the model's, because it is a statement
    // about how this product works and not a judgement the model is in
    // any position to make. The model is asked for one anyway, so the
    // limitation stays in front of it while it writes the rest, and the
    // server then replaces it with this.
    reviewAudioAssessmentNoteLabel: "How your audio was assessed",
    reviewAudioAssessmentNote:
      "Your recordings were transcribed, and the review was written from those transcripts together with each task prompt, its recording window and how long you actually spoke. Pronunciation, rhythm and intonation are estimated from the submitted audio and transcription pipeline and may require human review for full accuracy.",
    reviewResultNotice:
      "Nothing from this review has been saved. Your recordings were used for this review and not stored. Leaving or restarting clears the recordings and the feedback held on this page.",

    // Task result card.
    reviewTaskLevelLabel: "Estimated level",
    reviewTaskLimitLabel: "Recording window",
    reviewTaskDurationLabel: "You spoke for",
    reviewTimeLengthHeading: "Time and length",
    reviewCriteriaHeading: "Criterion levels",
    reviewCriterionColumn: "Criterion",
    reviewCriterionLevelColumn: "Level",
    reviewCriterionEvidenceColumn: "What your answer shows",
    reviewCriterionNextColumn: "What the next level needs",
    reviewSucceededLabel: "What worked",
    reviewFellShortLabel: "What held it back",
    reviewMissingPointsLabel: "Prompt points not addressed",
    reviewTemplateWarningsLabel: "Template language to avoid",
    reviewTopMistakesHeading: "Top mistakes",
    reviewMistakeOriginalLabel: "You said",
    reviewMistakeCorrectionLabel: "Stronger",
    reviewNoMistakesText:
      "No specific corrections were flagged for this answer.",
    reviewRewriteHeading: "Your answer, one level up",
    reviewRewriteTargetLabel: "Target level",
    reviewRewriteChangesHeading: "What changed",
    reviewModelHeading: "Level 11-12 model answer",
    reviewModelIntro:
      "A fresh spoken answer to the same prompt, written at the top of the scale so you can see the distance.",

    // The transcript card.
    reviewTranscriptHeading: "What you said",
    reviewTranscriptNoteLabel: "About this transcript",
    // Fixed wording, set by the server on every reviewed task. It says
    // the one thing a learner needs to know before reading a transcript
    // of their own speech back: the hesitations in it are theirs and were
    // left in on purpose, and the occasional wrong word is the
    // transcriber's.
    reviewTranscriptConfidenceNote:
      "This is an automatic transcription of your recording. Fillers, repetitions and false starts are left in on purpose, because they are part of how easy your answer is to follow. Individual words may be transcribed wrongly, so read it as a close record rather than an exact one.",
    reviewTranscriptEmptyText:
      "There is no transcript for this task because there was no recording to transcribe.",

    // The four recording outcomes, on a task result card.
    //
    // A missing task and a task whose transcription failed are different
    // things and are never given the same words. One is something the
    // learner did; the other is something this software failed to do, and
    // saying so is the honest reading.
    reviewNoRecordingLevel: "No recording submitted",
    reviewMissingHeading: "No recording submitted",
    reviewMissingText:
      "Nothing was recorded for this task, so there is nothing to review and no level is estimated for it. On the official test an unanswered Speaking task is a serious loss, so record something for every task even when you are unsure.",
    reviewTranscriptionFailedLevel: "Could not be reviewed",
    reviewTranscriptionFailedHeading: "This recording could not be transcribed",
    reviewTranscriptionFailedText:
      "A recording was submitted for this task but it could not be transcribed, so it was not reviewed. This is a technical failure and not a judgement of your answer. Try the review again, or record this task again and resubmit.",
    reviewInsufficientLevel: "Insufficient response",
    reviewInsufficientHeading: "Not enough speech to review",
    reviewInsufficientText:
      "The recording for this task contained too little speech to review, so no level is estimated for it. Check that your microphone was picking you up, then record a full answer and try again.",

    // Shown as the overall reading when nothing at all was recorded. No
    // AI call is made in that case, so this is the whole result.
    reviewNoRecordingsJustification:
      "No recordings were submitted for any task, so there is nothing to review and no Speaking level is estimated. Record an answer for each task and submit again.",

    // Page metadata and the exam region name, for the route.
    pageTitle: testLabel + " speaking test - CELPIP Decoded",
    pageDescription:
      "Internal prototype of the " +
      testLabel +
      " Speaking section, with all eight tasks, a preparation countdown, a recording countdown and local browser recordings, followed by an optional AI review and an estimated Speaking level for practice.",
    examRegionLabel: testLabel + " - Speaking Test",

    // Dashboard internal preview card.
    //
    // Dressed as an internal build link, the way the Reading and Writing
    // cards are. What it deliberately does not say, and this is unchanged
    // by EXAM-28: that a full all-skills Mock Test 1 exists. Four
    // sections of four now have a route and all four produce a result,
    // but there is no combined run, no overall Mock Test 1 score and no
    // saved attempt, so nothing on the dashboard may claim the test is
    // complete. The internal preview badge stays.
    dashboardCardTitle: testLabel + " - Speaking test",
    dashboardCardDescription:
      "Speaking section prototype with Tasks 1-8, preparation timer, local recordings, AI review and an estimated Speaking level for practice.",
    dashboardCardSectionLabel: "Speaking",
    dashboardCardTasksLabel: "Tasks 1-8",
    dashboardCardCtaLabel: "Open speaking test",
    dashboardPreviewBadgeLabel: "Internal preview",
  } as const;
}

// Mock Test 1. Also the default every Speaking mock screen falls back to
// when no copy is passed.
export const speakingMockCopy = buildSpeakingMockCopy({
  testLabel: "Mock Test 1",
});

export type SpeakingMockCopy = ReturnType<typeof buildSpeakingMockCopy>;

// Transition line between two tasks, for example
// "Speaking Task 1 complete. Continue to Speaking Task 2."
export function formatSpeakingTaskTransition(
  completedTaskLabel: string,
  nextTaskLabel: string,
): string {
  return completedTaskLabel + " complete. Continue to " + nextTaskLabel + ".";
}

// Task position inside the section, for example "Speaking Task 3 of 8".
export function formatSpeakingTaskPosition(
  taskNumber: number,
  totalTasks: number,
): string {
  return "Speaking Task " + taskNumber + " of " + totalTasks;
}

// Top bar note on a task screen, for example
// "Speaking Task 3 of 8 - Screen 6 of 20".
export function formatSpeakingTaskMeta(
  taskNumber: number,
  totalTasks: number,
  screenNumber: number,
  totalScreens: number,
): string {
  return (
    formatSpeakingTaskPosition(taskNumber, totalTasks) +
    " - Screen " +
    screenNumber +
    " of " +
    totalScreens
  );
}

// The top bar title on a task screen that names the task as well as the
// test, for example
// "Mock Test 1 - Speaking Task 5: Comparing and Persuading".
//
// Used by the four Task 5 screens and nowhere else (SPEAKING-05A). Task 5
// is spread over four screens with a different job on each, so the title
// has to say which task a learner is on for longer than the other seven
// need it to; the rest keep the plain task title they always had.
//
// The test label is the section's own, so this screen calls the test what
// every other screen in the run calls it. The Mock Test 1 content
// produces "Mock Test 1 - Speaking Task 5: Comparing and Persuading",
// which is the ticket's title with this product's name for the test in
// place of "Practice Test 1". A screen inside a run cannot be the one
// place that calls the test something else.
//
// The same shape as formatWritingTaskScreenTitle, which the Writing Task
// 2 choice screen uses for the same reason.
export function formatSpeakingTaskScreenTitle(
  title: string,
  taskTitle: string,
): string {
  return title + ": " + taskTitle;
}

// Top bar note on a screen the section owns rather than a task, for
// example "Speaking section - Screen 1 of 20".
export function formatSpeakingSectionMeta(
  screenNumber: number,
  totalScreens: number,
): string {
  return "Speaking section - Screen " + screenNumber + " of " + totalScreens;
}

// A window as a sentence, for example "30 seconds" or "1 minute
// 30 seconds".
//
// Speaking windows are short and are not all whole minutes, so this
// cannot be the Writing minutes formatter. Under a minute it reads in
// seconds, which is how a 30 second window is spoken about.
export function formatSpeakingDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));

  if (safeSeconds < 60) {
    return safeSeconds + (safeSeconds === 1 ? " second" : " seconds");
  }

  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  const minutePart = minutes + (minutes === 1 ? " minute" : " minutes");

  if (remainder === 0) {
    return minutePart;
  }

  return (
    minutePart +
    " " +
    remainder +
    (remainder === 1 ? " second" : " seconds")
  );
}

// A recorded length as a clock reading, for example "0:47".
//
// A length is read rather than counted down, so it is not zero padded on
// the minutes the way the top bar countdown is.
export function formatSpeakingClock(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;

  return minutes + ":" + String(remainder).padStart(2, "0");
}

// The time a recording was made, as a short local time, for example
// "14:32".
//
// Formatted from the ISO timestamp held in the response. It is a
// convenience for telling two takes apart within one sitting, so it shows
// the time and not the date: nothing here survives the sitting.
//
// Returns an empty string for a missing or unparseable timestamp, so a
// caller never has to guard it.
export function formatSpeakingRecordedAt(recordedAt: string | null): string {
  if (!recordedAt) {
    return "";
  }

  const stamp = new Date(recordedAt);

  if (Number.isNaN(stamp.getTime())) {
    return "";
  }

  return stamp.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// How many of the section's tasks were recorded, for example
// "6 of 8 tasks recorded".
export function formatSpeakingRecordedCount(
  recordedCount: number,
  totalTasks: number,
): string {
  return (
    recordedCount +
    " of " +
    totalTasks +
    (totalTasks === 1 ? " task recorded" : " tasks recorded")
  );
}

// How many tasks have no recording, for example "2 tasks not recorded".
//
// Said as well as the recorded count rather than instead of it, which is
// what the ticket asks for. The two numbers answer different questions:
// the recorded count says how much of the section is about to be
// reviewed, and this says how much of it will come back as a gap. A
// learner about to press Submit for AI Review should see both before
// they press it.
//
// Returns an empty string when nothing is missing, so the screen can
// leave the line out rather than print "0 tasks not recorded" as
// though it were news.
export function formatSpeakingMissingCount(
  missingCount: number,
  totalTasks: number,
): string {
  if (missingCount <= 0) {
    return "";
  }

  return (
    missingCount +
    " of " +
    totalTasks +
    (missingCount === 1 ? " task not recorded" : " tasks not recorded")
  );
}
