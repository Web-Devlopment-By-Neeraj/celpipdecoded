// Centralized UI copy for the speaking module. Keep all student facing
// wording here so it can be edited in one place.

export const speakingCopy = {
  moduleTitle: "Speaking practice",
  moduleSubtext:
    "Practice timed CELPIP speaking tasks, record your answers, and review AI-supported feedback reports.",
  progressNote:
    "Earn practice badges as you complete feedback reports.",
  promptDisclaimer:
    "These are CELPIP Decoded practice prompts designed to help you prepare for the CELPIP speaking format.",
  practiceBadge: "Practice prompt",
  viewTaskButton: "View task",
  backToDashboard: "Back to dashboard",
  backToTasks: "Back to speaking tasks",
  emptyStateMessage: "No speaking tasks are available yet.",
  timedPracticeButton: "Start timed practice",
  comingSoonNote:
    "Run the timed flow for this task. Recording and AI-supported feedback will be added in the next step.",
  timingCardTitle: "Timing",
  prepTimeLabel: "Preparation time",
  speakingTimeLabel: "Speaking time",
  skillFocusTitle: "Skill focus",
  skillFocusSubtext:
    "When AI feedback is added, your response will be reviewed in these areas.",
  practicePromptTitle: "Practice prompt",
} as const;

// Default scoring focus areas shown when a task has none stored.
export const DEFAULT_SCORING_FOCUS = [
  "Content and coherence",
  "Vocabulary",
  "Listenability",
  "Task fulfillment",
] as const;

// Short card descriptions per stable task_type value.
export const taskShortDescriptions: Record<string, string> = {
  giving_advice:
    "Give practical advice to a friend or family member about an everyday situation.",
  personal_experience:
    "Talk about a memorable experience from your own life and what made it meaningful.",
  describing_scene:
    "Describe what is happening in a busy everyday scene as if the listener cannot see it.",
  making_predictions:
    "Look at a situation and predict what will most likely happen next, with reasons.",
  comparing_persuading:
    "Compare two options and persuade someone that one choice is better.",
  difficult_situation:
    "Explain a tricky situation and communicate a decision with tact.",
  expressing_opinions:
    "Share your opinion on a topic and support it with clear reasons and examples.",
  unusual_situation:
    "Describe a strange or unexpected situation clearly so the listener understands it.",
};
