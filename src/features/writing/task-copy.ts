// Centralized UI copy for the writing module. Keep all student facing
// wording here so it can be edited in one place.

export const writingCopy = {
  moduleTitle: "Writing practice",
  moduleSubtext:
    "Choose a writing task type and practice with a timed writing editor and a live word count.",
  progressNote:
    "Submit a response to receive AI-supported practice feedback.",
  promptDisclaimer:
    "These are CELPIP Decoded practice prompts designed to help you prepare for the CELPIP writing format.",
  practiceBadge: "Practice prompt",
  viewTaskButton: "View task",
  backToDashboard: "Back to dashboard",
  backToTasks: "Back to writing tasks",
  emptyStateMessage: "No writing tasks are available yet.",
  startWritingButton: "Start timed writing",
  startWritingNote:
    "You will see the prompt again with a timer, a word target, and a writing editor. Submit your response to receive AI-supported feedback.",
  timingCardTitle: "Timing and word target",
  timeLimitLabel: "Time limit",
  wordTargetLabel: "Word target",
  evaluationFocusTitle: "Evaluation focus",
  evaluationFocusSubtext:
    "Your response will be reviewed in these areas.",
  practicePromptTitle: "Practice prompt",
} as const;

// Copy for the timed writing practice screen and its API errors.
export const writingPracticeCopy = {
  screenBadge: "Timed writing",
  backToTask: "Back to task",
  backToTasks: "Back to writing tasks",
  timerLabel: "Time remaining",
  startCardTitle: "Ready to write?",
  startCardNote:
    "The timer starts when you click Start writing. You can submit your response at any time.",
  startWriting: "Start writing",
  timeLimitLabel: "Time limit",
  wordTargetLabel: "Word target",
  evaluationFocusTitle: "Evaluation focus",
  timeEndedWarning:
    "Time is up. Your response was not submitted automatically. Review it and submit when you are ready.",
  editorLabel: "Your response",
  editorPlaceholder: "Type your response here.",
  wordsLabel: "Words",
  targetLabel: "Target",
  belowTarget: "Below target",
  withinTarget: "Within target",
  aboveTarget: "Above target",
  targetGuidanceNote: "The word target is guidance only.",
  submitResponse: "Submit for evaluation",
  submitting: "Saving your response...",
  tooShortMessage: "Please write a longer response before submitting.",
  savedHeading: "Writing response saved",
  savedBody:
    "Your writing response has been saved. Submit it for evaluation to receive AI-supported feedback on task fulfillment, organization, vocabulary, grammar, tone, and clarity.",
  tryAnotherTask: "Try another writing task",
  errors: {
    invalidRequest: "That request could not be processed. Please try again.",
    sessionExpired: "Your session has expired. Please log in again.",
    taskNotFound: "This writing task is not available.",
    saveFailed: "Could not save your writing response. Please try again.",
  },
} as const;

// Copy for the AI writing evaluation flow and its API errors.
export const writingEvaluationCopy = {
  submit: "Submit for evaluation",
  working: "Preparing your writing feedback...",
  tryAgain: "Try evaluation again",
  processingHeading: "Preparing your writing feedback",
  processingText:
    "Our AI coach is reviewing your response. This usually takes under a minute. Please keep this page open.",
  failedHeading: "Evaluation could not finish",
  errors: {
    invalidRequest: "That request could not be processed. Please try again.",
    sessionExpired: "Your session has expired. Please log in again.",
    notConfigured:
      "Writing evaluation is not available right now. Please try again later.",
    attemptNotFound: "This writing attempt could not be found.",
    responseMissing:
      "This attempt has no saved writing response to evaluate.",
    wrongModule:
      "This attempt does not belong to CELPIP Writing Practice.",
    notReadyForEvaluation:
      "This attempt cannot be evaluated right now. Please refresh the page and try again.",
    taskMissing:
      "The writing task for this attempt is not available. Please try another task.",
    evaluationFailed:
      "We could not evaluate your writing this time. Your response is saved, so you can try again.",
    saveFailed: "Your feedback could not be saved. Please try again.",
    requestFailed:
      "Something went wrong while preparing your feedback. Please try again.",
  },
} as const;

// Copy for the writing result page.
export const writingResultCopy = {
  pageBadge: "CELPIP Writing Practice",
  pageHeading: "Your writing feedback",
  readyText:
    "Your writing feedback is ready. Review it below and use it in your next practice session.",
  notReadyText:
    "Your feedback is still being prepared. Refresh this page in a moment.",
  failedText:
    "The last evaluation did not finish. Your response is saved, so you can open the task again and submit it for evaluation once more.",
  levelHeading: "Estimated practice level",
  levelScale: "of 12",
  skillScoreScale: "/ 12",
  practiceEstimateNote:
    "This is AI-supported practice feedback from CELPIP Decoded. It is not an official CELPIP score.",
  skillBreakdownHeading: "Skill breakdown",
  improvementLabel: "Try this next",
  strengthsHeading: "What you did well",
  improvementsHeading: "What to improve next",
  suggestedStructureHeading: "Suggested structure",
  nextStepsHeading: "Next steps",
  responseHeading: "Your written response",
  responseNote: "This is the response you submitted for evaluation.",
  wordCountLabel: "Word count",
  timeUsedLabel: "Time used",
  badgeHeading: "Practice badge",
  badgeEmptyText: "Complete feedback to earn a practice badge.",
  actionsLabel: "Keep practicing",
  practiceAnotherTask: "Practice another writing task",
  tryTaskAgain: "Try this task again",
  backToTasks: "Back to writing tasks",
  backToHistory: "Back to writing history",
} as const;

// Default evaluation focus areas shown when a task has none stored.
export const DEFAULT_EVALUATION_FOCUS = [
  "Task fulfillment",
  "Organization and coherence",
  "Vocabulary",
  "Grammar and sentence control",
  "Tone and clarity",
] as const;

// Group headings and short card descriptions per stable task_type value.
export const taskTypeGroupTitles: Record<string, string> = {
  writing_email: "Task 1 - Writing an Email",
  writing_survey_response: "Task 2 - Responding to Survey Questions",
};

export const taskShortDescriptions: Record<string, string> = {
  writing_email:
    "Write a clear, well organized email in response to an everyday situation.",
  writing_survey_response:
    "Choose a position on a survey question and support it with reasons and examples.",
};
