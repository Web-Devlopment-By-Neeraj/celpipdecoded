export type PlannerInputs = {
  testDate: string | null;
  notBooked: boolean;
  target: "7" | "8" | "9" | "10" | "not_sure";
  worry: "Listening" | "Reading" | "Writing" | "Speaking";
};

export type PlannerWeek = {
  title: string;
  items: string[];
};

export function daysUntil(testDate: string, today: string): number {
  const start = Date.parse(`${today}T00:00:00Z`);
  const end = Date.parse(`${testDate}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000);
}

export function buildStudyPlanner(
  input: PlannerInputs,
  today: string,
  soonDays = 7,
): PlannerWeek[] {
  if (!input.notBooked && input.testDate) {
    const days = daysUntil(input.testDate, today);
    if (days >= 0 && days < soonDays) {
      return [
        {
          title: "This week",
          items: [
            "Do not learn anything new.",
            "Start with the task structure for the section that worries you.",
            `Review ${input.worry} task structure, then sit the free mock in Test mode before test day.`,
          ],
        },
      ];
    }
  }

  const weeks = input.notBooked || !input.testDate ? 4 : Math.max(1, Math.ceil(daysUntil(input.testDate, today) / 7));
  const capped = Math.min(weeks, 8);
  const plan: PlannerWeek[] = [];

  for (let week = 1; week <= capped; week += 1) {
    const last = week === capped;
    plan.push({
      title: `Week ${week}`,
      items: last
        ? [
            "Sit one mock in Test mode. Audio plays once and the screens move on.",
            `Revise ${input.worry}. Do not open a new course lesson.`,
          ]
        : [
            `Course Section 1 for ${input.worry}.`,
            "One free mini-course on answer shape.",
            week === 1
              ? "Sit the free mock and note which section felt hardest."
              : "Sit one mock section in Practice mode.",
          ],
    });
  }

  return plan;
}
