// Sign-up question flow copy (CELPIP Decoded intake PDF, Oct 2026).

export const MARKETING_CONSENT_LABEL =
  "Yes, send me news about new batches and offers on WhatsApp and email.";

export const MARKETING_CONSENT_FINE_PRINT =
  "Optional. Reminders about your own test come either way. You can stop these any time.";

export type OnboardingQuestionKey =
  | "whatsapp"
  | "instagram"
  | "taken_celpip_before"
  | "times_taken"
  | "last_test_date"
  | "last_scores"
  | "target_clb"
  | "why_now"
  | "referral_source"
  | "weakest_sections"
  | "next_test"
  | "marketing_consent";

export const REPEAT_TAKER_ONLY: readonly OnboardingQuestionKey[] = [
  "times_taken",
  "last_test_date",
  "last_scores",
];

export const QUESTION_META: Record<
  OnboardingQuestionKey,
  { title: string; subtitle: string }
> = {
  whatsapp: {
    title: "What's your WhatsApp number?",
    subtitle:
      "Amar uses it to remind you before your test and check in after it. It stays with CELPIP Decoded: never sold, never shared without your permission.",
  },
  instagram: {
    title: "What's your Instagram handle?",
    subtitle:
      "Optional. It helps Amar recognise you if you message him there.",
  },
  taken_celpip_before: {
    title: "Have you taken CELPIP before?",
    subtitle: "",
  },
  times_taken: {
    title: "How many times have you taken CELPIP?",
    subtitle: "",
  },
  last_test_date: {
    title: "When did you last take it?",
    subtitle: "A rough date is fine.",
  },
  last_scores: {
    title: "What did you score last time?",
    subtitle: "Choose a score for each section.",
  },
  target_clb: {
    title: "What score are you aiming for?",
    subtitle: "The CLB level you need in every section.",
  },
  why_now: {
    title: "What's pushing you to prepare now?",
    subtitle: "Pick the one that fits best.",
  },
  referral_source: {
    title: "How did you find CELPIP Decoded?",
    subtitle: "",
  },
  weakest_sections: {
    title: "Which part of the test needs the most work?",
    subtitle: "Pick one or two. Your study plan starts here.",
  },
  next_test: {
    title: "When is your next test?",
    subtitle: "This becomes the countdown on your dashboard.",
  },
  marketing_consent: {
    title: "One last thing",
    subtitle: MARKETING_CONSENT_FINE_PRINT,
  },
};

export const TIMES_TAKEN_OPTIONS = [
  { value: "once", label: "Once" },
  { value: "twice", label: "Twice" },
  { value: "three", label: "Three times" },
  { value: "four", label: "Four times" },
  { value: "five_or_more", label: "Five or more" },
] as const;

export const TARGET_CLB_OPTIONS = [
  { value: "clb_7", label: "CLB 7" },
  { value: "clb_8", label: "CLB 8" },
  { value: "clb_9", label: "CLB 9" },
  { value: "clb_10_plus", label: "CLB 10 or higher" },
  { value: "not_sure", label: "Not sure yet" },
] as const;

export const WHY_NOW_OPTIONS = [
  { value: "work_permit", label: "My work permit is running out" },
  { value: "last_attempt", label: "I'm on my last attempt before a deadline" },
  {
    value: "fallen_short",
    label: "I've taken CELPIP more than once and fallen short",
  },
  { value: "from_ielts_pte", label: "I'm switching over from IELTS or PTE" },
  {
    value: "maintained_status",
    label: "I'm on maintained status while my application is processed",
  },
  { value: "crs_points", label: "I want more CRS points" },
  { value: "citizenship", label: "I need it for citizenship" },
  { value: "something_else", label: "Something else" },
] as const;

export const REFERRAL_SOURCE_OPTIONS = [
  { value: "amar_instagram", label: "Amar on Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "google", label: "Google search" },
  { value: "friend", label: "A friend told me" },
  { value: "somewhere_else", label: "Somewhere else" },
] as const;

export const SECTION_OPTIONS = [
  { value: "listening", label: "Listening" },
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "speaking", label: "Speaking" },
] as const;

export const NEXT_TEST_OPTIONS = [
  { value: "within_7_days", label: "Within 7 days" },
  { value: "one_to_two_weeks", label: "In 1 to 2 weeks" },
  { value: "two_to_four_weeks", label: "In 2 to 4 weeks" },
  { value: "more_than_month", label: "More than a month away" },
  { value: "not_booked", label: "Not booked yet" },
] as const;

export const SCORE_LEVELS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
