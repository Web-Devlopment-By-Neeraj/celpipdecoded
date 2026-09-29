// Admin-editable values. Code reads these defaults, then overrides them
// from the settings table when a row exists, so a change does not need
// a deploy.

export type AppSettings = {
  demoEvalLimitPerIpPerDay: number;
  demoEvalLimitPerBrowser: number;
  demoAudioToleranceSeconds: number;
  speakingTask1PrepSeconds: number;
  speakingTask1RecordSeconds: number;
  coursePreviewSeconds: number;
  lessonCompleteThreshold: number;
  drawsCompareCount: number;
  irccRoundsUrl: string;
  bigJumpThreshold: number;
  testSoonDays: number;
  freeEvaluationLimit: number;
  sprintDailyLimit: number;
  sprintWeeklyLimit: number;
  sprintMonthlyLimit: number;
  askAmarReplyHours: number;
  askAmarDailyLimit: number;
  askAmarAttachmentMaxMb: number;
  strategyCallMinutes: number;
  strategyCallWindowDays: number;
  oneToOneRescheduleNoticeHours: number;
  batchMoveNoticeHours: number;
  batchSeatCap: number;
  batchMinToRun: number;
  reviewTokenTtlDays: number;
  reviewProofMaxMb: number;
  reviewVideoMaxSeconds: number;
  reviewVideoMaxMb: number;
  reviewBodyMinChars: number;
  reviewBodyMaxChars: number;
  reviewRateLimitPerIpHour: number;
  reviewRateLimitPerEmailDay: number;
  verificationCodeTtlMinutes: number;
  resendAfterSeconds: number;
  dataExportLinkTtlDays: number;
  dataExportPerDay: number;
  paidRecordingRetentionDays: number;
  freeRecordingRetentionDays: number;
  studyPlanDefaultWeeks: number;
  studyPlanFinalDaysNoNewLessons: number;
  studyPlanFullMockUntilDaysLeft: number;
  studyPlanMinTestModeMocks: number;
  compareFirstWeekDays: number;
  consultantName: string;
  consultantLicenceNo: string;
  consultantContact: string;
  referralConsentWording: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  demoEvalLimitPerIpPerDay: 3,
  demoEvalLimitPerBrowser: 1,
  demoAudioToleranceSeconds: 5,
  speakingTask1PrepSeconds: 30,
  speakingTask1RecordSeconds: 90,
  coursePreviewSeconds: 120,
  lessonCompleteThreshold: 0.9,
  drawsCompareCount: 12,
  irccRoundsUrl:
    "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html",
  bigJumpThreshold: 2,
  testSoonDays: 7,
  freeEvaluationLimit: 3,
  sprintDailyLimit: 10,
  sprintWeeklyLimit: 50,
  sprintMonthlyLimit: 200,
  askAmarReplyHours: 24,
  askAmarDailyLimit: 5,
  askAmarAttachmentMaxMb: 10,
  strategyCallMinutes: 15,
  strategyCallWindowDays: 14,
  oneToOneRescheduleNoticeHours: 24,
  batchMoveNoticeHours: 48,
  batchSeatCap: 8,
  batchMinToRun: 3,
  reviewTokenTtlDays: 60,
  reviewProofMaxMb: 10,
  reviewVideoMaxSeconds: 60,
  reviewVideoMaxMb: 150,
  reviewBodyMinChars: 30,
  reviewBodyMaxChars: 600,
  reviewRateLimitPerIpHour: 5,
  reviewRateLimitPerEmailDay: 3,
  verificationCodeTtlMinutes: 15,
  resendAfterSeconds: 60,
  dataExportLinkTtlDays: 7,
  dataExportPerDay: 1,
  paidRecordingRetentionDays: 90,
  freeRecordingRetentionDays: 14,
  studyPlanDefaultWeeks: 4,
  studyPlanFinalDaysNoNewLessons: 7,
  studyPlanFullMockUntilDaysLeft: 14,
  studyPlanMinTestModeMocks: 1,
  compareFirstWeekDays: 7,
  consultantName: "",
  consultantLicenceNo: "",
  consultantContact: "",
  referralConsentWording:
    "I want the contact details of a licensed immigration consultant. I understand she is independent of CELPIP Decoded, that any advice is between her and me, and that CELPIP Decoded does not send her my information unless I ask.",
};

export function mergeSettings(
  overrides: Partial<AppSettings> | null | undefined,
): AppSettings {
  return { ...DEFAULT_SETTINGS, ...stripEmpty(overrides) };
}

function stripEmpty(
  overrides: Partial<AppSettings> | null | undefined,
): Partial<AppSettings> {
  if (!overrides) return {};
  const next: Partial<AppSettings> = {};
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined && value !== null && value !== "") {
      (next as Record<string, unknown>)[key] = value;
    }
  }
  return next;
}
