export type StudyPlanInput = {
  testDate: string | null;
  today: string;
  weakest: "Listening" | "Reading" | "Writing" | "Speaking";
  dailyEvaluationLimit: number;
  hasCourse: boolean;
};

export type StudyPlanItem = {
  id: string;
  week: number;
  kind: "mock" | "practice" | "mini" | "lesson";
  label: string;
  href: string;
  evaluations: number;
};

export function buildStudyPlan(
  input: StudyPlanInput,
  settings: {
    defaultWeeks: number;
    finalDays: number;
    fullMockUntilDays: number;
  },
): StudyPlanItem[] {
  const days = input.testDate ? daysBetween(input.today, input.testDate) : null;
  const weeks = days === null ? settings.defaultWeeks : Math.max(1, Math.ceil(days / 7));
  const items: StudyPlanItem[] = [];

  for (let week = 1; week <= weeks; week += 1) {
    const weekStartDay = (week - 1) * 7;
    const daysLeftAtWeek = days === null ? 99 : days - weekStartDay;
    const finalWeek = daysLeftAtWeek <= settings.finalDays;
    const includeMock = days === null || daysLeftAtWeek > 0;

    if (includeMock && (finalWeek || daysLeftAtWeek > settings.fullMockUntilDays || week === weeks)) {
      items.push({
        id: `w${week}-mock`,
        week,
        kind: "mock",
        label: finalWeek
          ? "Sit one mock in Test mode. Do not start a new lesson."
          : "Sit one full mock.",
        href: "/dashboard/mocks/mock-1",
        evaluations: 0,
      });
    }

    if (!finalWeek) {
      items.push({
        id: `w${week}-practice`,
        week,
        kind: "practice",
        label: `Practise ${input.weakest}.`,
        href: `/dashboard/practice/${input.weakest.toLowerCase()}`,
        evaluations: input.weakest === "Writing" || input.weakest === "Speaking" ? 1 : 0,
      });
      items.push({
        id: `w${week}-mini`,
        week,
        kind: "mini",
        label: "One mini-course for the weakest skill.",
        href: "/dashboard/mini-courses",
        evaluations: 0,
      });
      if (input.hasCourse) {
        items.push({
          id: `w${week}-lesson`,
          week,
          kind: "lesson",
          label: `Course lesson for ${input.weakest}.`,
          href: `/dashboard/courses/${input.weakest.toLowerCase()}`,
          evaluations: 0,
        });
      }
    }
  }

  return capDailyEvaluations(items, input.dailyEvaluationLimit);
}

function capDailyEvaluations(items: StudyPlanItem[], limit: number): StudyPlanItem[] {
  const used = new Map<number, number>();
  return items.filter((item) => {
    const usedToday = used.get(item.week) ?? 0;
    if (item.evaluations === 0) return true;
    if (usedToday + item.evaluations > limit) return false;
    used.set(item.week, usedToday + item.evaluations);
    return true;
  });
}

export function speakingItemCount(items: StudyPlanItem[]): number {
  return items.filter((item) => item.label.includes("Speaking") || item.label.includes("speaking")).length;
}

function daysBetween(today: string, testDate: string): number {
  return Math.round((Date.parse(`${testDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

export type HistoryPoint = { date: string; module: string; level: number; mode: string };

export function pointsInRange(
  points: HistoryPoint[],
  range: "30" | "90" | "all",
  today: string,
  mode: "all" | "test",
): HistoryPoint[] {
  return points.filter((point) => {
    if (mode === "test" && point.mode !== "test") return false;
    if (range === "all") return true;
    const days = daysBetween(point.date, today);
    const window = range === "30" ? 30 : 90;
    return days >= 0 && days <= window;
  });
}

export function comparePair<T extends { date: string; taskType: string }>(
  answers: T[],
  firstWeekDays: number,
): { earlier: T; later: T } | null {
  if (answers.length < 2) return null;
  const sorted = [...answers].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const firstWeekEnd = new Date(Date.parse(`${first.date}T00:00:00Z`) + firstWeekDays * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const early = sorted.find((item) => item.taskType === first.taskType && item.date <= firstWeekEnd) ?? first;
  const later = [...sorted].reverse().find((item) => item.taskType === early.taskType && item.date !== early.date);
  if (!later) return null;
  return { earlier: early, later };
}
