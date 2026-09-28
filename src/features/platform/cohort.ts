// Cohort report. Numbers are aggregated. Names stay off the page unless
// the viewer is allowed to open a drill-down, which this report does not.

export type CohortPrescription = {
  miniCourseId: string;
  skillTag: string;
  module: "writing" | "speaking" | "reading" | "listening";
  plan: "free" | "paid";
  language: string;
  sentAt: Date;
  completedAt: Date | null;
  levelBefore: number;
  levelAfter: number | null;
  proved: boolean;
  completedCourse: boolean;
};

export type CohortRow = {
  miniCourseId: string;
  skillTag: string;
  sent: number;
  completed: number;
  completedPercent: number;
  proved: number;
  meanChange: number | null;
  medianChange: number | null;
  improvedPercent: number | null;
  unchangedPercent: number | null;
  worsePercent: number | null;
  meanDaysToCompletion: number | null;
  baselineMeanChange: number | null;
  tooFew: boolean;
};

export type CohortFilter = {
  from?: Date;
  to?: Date;
  module?: CohortPrescription["module"];
  plan?: CohortPrescription["plan"];
  language?: string;
};

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function cohortReport(
  rows: CohortPrescription[],
  filter: CohortFilter,
  minN: number,
): CohortRow[] {
  const filtered = rows.filter((row) => {
    if (filter.from && row.sentAt < filter.from) return false;
    if (filter.to && row.sentAt > filter.to) return false;
    if (filter.module && row.module !== filter.module) return false;
    if (filter.plan && row.plan !== filter.plan) return false;
    if (filter.language && row.language !== filter.language) return false;
    return true;
  });

  const keys = new Map<string, CohortPrescription[]>();
  for (const row of filtered) {
    const key = `${row.miniCourseId}:${row.skillTag}`;
    const list = keys.get(key) ?? [];
    list.push(row);
    keys.set(key, list);
  }

  return [...keys.entries()].map(([key, items]) => {
    const [miniCourseId, skillTag] = key.split(":");
    const completed = items.filter((item) => item.completedAt);
    const proved = items.filter((item) => item.proved && item.levelAfter !== null);
    const changes = proved.map((item) => (item.levelAfter ?? 0) - item.levelBefore);
    const improved = changes.filter((change) => change > 0).length;
    const unchanged = changes.filter((change) => change === 0).length;
    const worse = changes.filter((change) => change < 0).length;
    const days = completed
      .filter((item) => item.completedAt)
      .map((item) => ((item.completedAt?.getTime() ?? 0) - item.sentAt.getTime()) / 86400000);
    const baseline = items
      .filter((item) => !item.completedCourse && item.levelAfter !== null)
      .map((item) => (item.levelAfter ?? 0) - item.levelBefore);
    const provedCount = proved.length;
    return {
      miniCourseId,
      skillTag,
      sent: items.length,
      completed: completed.length,
      completedPercent: items.length ? (completed.length / items.length) * 100 : 0,
      proved: provedCount,
      meanChange: mean(changes),
      medianChange: median(changes),
      improvedPercent: provedCount ? (improved / provedCount) * 100 : null,
      unchangedPercent: provedCount ? (unchanged / provedCount) * 100 : null,
      worsePercent: provedCount ? (worse / provedCount) * 100 : null,
      meanDaysToCompletion: mean(days),
      baselineMeanChange: mean(baseline),
      tooFew: provedCount < minN,
    };
  });
}

export function cohortCsv(rows: CohortRow[]): string {
  const header = [
    "mini_course",
    "skill",
    "sent",
    "completed",
    "proved",
    "mean_change",
    "too_few",
  ];
  const lines = rows.map((row) =>
    [
      row.miniCourseId,
      row.skillTag,
      row.sent,
      row.completed,
      row.proved,
      row.meanChange ?? "",
      row.tooFew ? "yes" : "no",
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
